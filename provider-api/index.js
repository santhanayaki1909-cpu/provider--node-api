const express = require('express');
const app = express();
const port = 3000;

// Optional: CORS for testing from browser
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Provider Backend Server is running!');
});

// --- Example Endpoints ---
app.get('/providers', (req, res) => {
  res.send('All providers will be here');
});

app.get('/providers/:id', (req, res) => {
  const id = req.params.id;
  res.send(`Provider details for ID: ${id}`);
});

app.get('/npi/:id', (req, res) => {
  const id = req.params.id;
  res.send(`NPI check for provider ID: ${id}`);
});

app.get('/license/:license_number', (req, res) => {
  const license_number = req.params.license_number;
  res.send(`License check for: ${license_number}`);
});

app.get('/download-report', (req, res) => {
  res.send('CSV report will be downloaded');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

