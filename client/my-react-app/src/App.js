import React, { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name_first: '',
    name_last: '',
    address_line_1: '',
    address_line_2: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country_code: 'US',
    email_address: '',
    phone_number: '',
    document_ssn: '',
    birth_date: '',
  });

  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('Submitting...');

    try {
      const res = await fetch('http://localhost:5000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.errors) {
  setResponseMsg(`Validation error: ${data.errors.join(', ')}`);
  return;
}
      const outcome = data.summary?.outcome;

      if (outcome === 'Approved') setResponseMsg('Congratulations, Your account was approved!');
      else if (outcome === 'Manual Review') setResponseMsg('Thanks! We’ll review your application and be in touch shortly!');
      else if (outcome === 'Denied') setResponseMsg('We are sorry to report that your application has been rejected');
      else setResponseMsg('Unexpected response.');
    } catch {
      setResponseMsg('Error submitting application.');
    }
  };

  return (
    <div className="container">
      <h2>Bank Application Form</h2>
      <form onSubmit={handleSubmit}>
        <input name="name_first" placeholder="First Name" onChange={handleChange} required />
        <input name="name_last" placeholder="Last Name" onChange={handleChange} required />
        <input name="address_line_1" placeholder="Address Line 1" onChange={handleChange} required />
        <input name="address_line_2" placeholder="Address Line 2" onChange={handleChange} />
        <input name="address_city" placeholder="City" onChange={handleChange} />
        <input name="address_state" placeholder="State Abbreviation (OH,NY etc)" onChange={handleChange} />
        <input name="address_postal_code" placeholder="ZIP / Postal Code" onChange={handleChange} />
        <input name="address_country_code" value="US" disabled />
        <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
        <input name="email_address" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="document_ssn" placeholder="SSN (9 digits)" onChange={handleChange} required />
        <input name="birth_date" type="date" placeholder="Date of Birth" onChange={handleChange} required />
        <button type="submit">Submit</button>
      </form>

      {responseMsg && <p>{responseMsg}</p>}
    </div>
  );
}

export default App;
