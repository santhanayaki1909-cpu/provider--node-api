const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database
const DB_FILE = "providers.db";
const REPORT_FILE = "ProviderValidationReport.csv";

// --- Connect to SQLite ---
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error("Error connecting to DB:", err.message);
    } else {
        console.log("✅ Connected to SQLite database!");
    }
});

// --- Routes ---

// 1️⃣ Get all providers
app.get("/providers", (req, res) => {
    db.all("SELECT * FROM providers", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2️⃣ Get provider by ID
app.get("/providers/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM providers WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Provider not found" });
        res.json(row);
    });
});

// 3️⃣ NPI check
app.get("/npi/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT npi FROM providers WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Provider not found" });
        const status = row.npi === "INVALID" ? "Invalid NPI" : "Valid NPI";
        res.json({ npi: row.npi, status });
    });
});

// 4️⃣ License check
app.get("/license/:license_number", (req, res) => {
    const license = req.params.license_number;
    db.get("SELECT license_number FROM providers WHERE license_number = ?", [license], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "License not found" });
        const status = row.license_number === "INVALID" ? "Invalid License" : "Valid License";
        res.json({ license: row.license_number, status });
    });
});

// 5️⃣ Download report CSV
app.get("/download-report", (req, res) => {
    db.all("SELECT * FROM providers", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const header = ["Id","Full_Name","Medical_License_Number","Npi_Number","Specialty","Affiliation","Practice_Address","Email","Phone","Confidence_Score","Issue","Manual_Review"];
        const csv = [
            header.join(","),
            ...rows.map(r => [
                r.id, r.name, r.license_number, r.npi, r.specialty, r.affiliation,
                r.address, r.email, r.contact_number, r.confidence_score,
                r.npi === "INVALID" ? "Invalid NPI" : r.license_number === "INVALID" ? "Invalid License" : "",
                ""
            ].join(","))
        ].join("\n");

        fs.writeFileSync(REPORT_FILE, csv);
        res.download(REPORT_FILE, "ProviderValidationReport.csv");
    });
});

// 6️⃣ Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running!" });
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
