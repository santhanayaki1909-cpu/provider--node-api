const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

const DB_FILE = path.join(__dirname, "providers.db");
const PORT = process.env.PORT || 3000;

// --- Get all providers ---
app.get("/providers", (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all("SELECT * FROM providers", [], (err, rows) => {
        db.close();
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// --- Get provider by ID ---
app.get("/providers/:id", (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT * FROM providers WHERE id=?", [req.params.id], (err, row) => {
        db.close();
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(404).send("Provider not found");
        res.json(row);
    });
});

// --- NPI Check ---
app.get("/npi/:id", (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT npi FROM providers WHERE id=?", [req.params.id], (err, row) => {
        db.close();
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(404).send("Provider not found");
        res.json({ valid: row.npi !== "INVALID", npi: row.npi });
    });
});

// --- License Check ---
app.get("/license/:license", (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT * FROM providers WHERE license_number=?", [req.params.license], (err, row) => {
        db.close();
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(404).send("License not found");
        res.json({ valid: row.license_number !== "INVALID", provider: row });
    });
});

// --- Download Validation Report ---
app.get("/download-report", (req, res) => {
    const fs = require("fs");
    const csvPath = path.join(__dirname, "ProviderValidationReport.csv");
    if (!fs.existsSync(csvPath)) return res.status(404).send("Report not found");
    res.download(csvPath, "ProviderValidationReport.csv");
});

// --- Health Check ---
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running!" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
