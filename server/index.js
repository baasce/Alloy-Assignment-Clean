require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Get authentication from local env file
const token = process.env.ALLOY_TOKEN;
const secret = process.env.ALLOY_SECRET;
const ALLOY_AUTH = Buffer.from(`${token}:${secret}`).toString('base64');

// Data validation
function validateApplication(data) {
  const errors = [];

  // Required fields
  const requiredFields = [
    'email_address',
    'address_line_1',
    'address_country_code',
    'phone_number',
    'name_first',
    'name_last'
  ];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Format checks
  if (data.document_ssn && !/^\d{9}$/.test(data.document_ssn)) {
    errors.push('document_ssn must be 9 digits');
  }

  if (data.address_country_code && data.address_country_code !== 'US') {
    errors.push('address_country_code must be "US" for this assignment');
  }

  if (data.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.birth_date)) {
    errors.push('birth_date must be in ISO format (YYYY-MM-DD)');
  }
if (data.address_state && !/^[A-Z]{2}$/.test(data.address_state)) {
  errors.push('address_state must be a two-letter uppercase abbreviation (e.g., "OH", "NY")');
}
  return errors;
}

//  POST to Alloy
app.post('/api/apply', async (req, res) => {
  console.log("Incoming form data:", req.body);
  const applicantData = req.body;

  // 1: Validate input
  const errors = validateApplication(applicantData);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // 2: Send
    const response = await axios.post(
      'https://sandbox.alloy.co/v1/evaluations/',
      applicantData,
      {
        headers: {
          'Authorization': `Basic ${ALLOY_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    );
console.log("Alloy response:", response.data);

    // 3: Response
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error submitting to Alloy:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting application to Alloy',
      details: error.response?.data || null
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
