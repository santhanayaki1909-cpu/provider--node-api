// index.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "providers.db");
const REPORT_FILE = path.join(__dirname, "ProviderValidationReport.csv");

// Utility: Generate CSV report
function generateReport() {
    if (!fs.existsSync(DB_FILE)) {
        throw new Error("Database file providers.db not found!");
    }

    const db = new sqlite3.Database(DB_FILE);
    const csvRows = [];
    const header = [
        "Id",
        "Full_Name",
        "Medical_License_Number",
        "Npi_Number",
        "Specialty",
        "Affiliation",
        "Practice_Address",
        "Email",
        "Phone",
        "Confidence_Score",
        "Issue",
        "Manual_Review"
    ];
    csvRows.push(header.join(","));

    db.all("SELECT * FROM providers", [], (err, rows) => {
        if (err) throw err;

        rows.forEach((row) => {
            // Mark issues
            if (row.npi === "INVALID") row.issue = "Invalid NPI";
            else if (row.license_number === "INVALID") row.issue = "Invalid License";
            else row.issue = "";

            const csvRow = [
                row.id,
                row.name,
                row.license_number,
                row.npi,
                row.specialty,
                row.affiliation,
                row.address,
                row.email,
                row.contact_number,
                row.confidence_score,
                row.issue,
                row.manual_review
            ];
            csvRows.push(csvRow.join(","));
        });

        fs.writeFileSync(REPORT_FILE, csvRows.join("\n"));
        db.close();
    });
}

// --- API Endpoints ---

// Get all providers
app.get("/providers", (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all("SELECT * FROM providers", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
        db.close();
    });
});

// Get provider by ID
app.get("/providers/:id", (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT * FROM providers WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Provider not found" });
        res.json(row);
        db.close();
    });
});

// NPI check
app.get("/npi/:id", (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(DB_FILE);
    db.get("SELECT npi FROM providers WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Provider not found" });
        const status = row.npi === "INVALID" ? "Invalid" : "Valid";
        res.json({ id, npi: row.npi, status });
        db.close();
    });
});

// License check
app.get("/license/:license_number", (req, res) => {
    const license = req.params.license_number;
    const db = new sqlite3.Database(DB_FILE);
    db.get(
        "SELECT * FROM providers WHERE license_number = ?",
        [license],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "License not found" });
            const status = row.license_number === "INVALID" ? "Invalid" : "Valid";
            res.json({ license, status });
            db.close();
        }
    );
});

// Download CSV report
app.get("/download-report", (req, res) => {
    generateReport();
    res.download(REPORT_FILE, "ProviderValidationReport.csv");
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
