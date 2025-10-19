// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "datasets");
const DB_FILE = path.join(DATA_DIR, "providers.db"); // note: file is provider.db
const REPORT_FILE = path.join(DATA_DIR, "ProviderValidationReport.csv");

// --- Utility: open DB safely ---
function openDb() {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Database file not found at ${DB_FILE}`);
  }
  return new sqlite3.Database(DB_FILE);
}

// --- Endpoints ---

// 1) health
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

// 2) All providers (reads from sqlite)
app.get("/providers", (req, res) => {
  let db;
  try {
    db = openDb();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  db.all("SELECT * FROM providers", (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3) provider by id
app.get("/providers/:id", (req, res) => {
  const id = req.params.id;
  let db;
  try { db = openDb(); } catch (e) { return res.status(500).json({ error: e.message }); }
  db.get("SELECT * FROM providers WHERE id = ?", [id], (err, row) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Provider not found" });
    res.json(row);
  });
});

// 4) NPI check (mock: reads npi and returns valid/invalid)
app.get("/npi/:id", (req, res) => {
  const id = req.params.id;
  let db;
  try { db = openDb(); } catch (e) { return res.status(500).json({ error: e.message }); }
  db.get("SELECT npi FROM providers WHERE id = ?", [id], (err, row) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Provider not found" });
    const status = String(row.npi).toUpperCase() === "INVALID" ? "Invalid" : "Valid";
    res.json({ id, npi: row.npi, status });
  });
});

// 5) License check (mock)
app.get("/license/:license_number", (req, res) => {
  const license = req.params.license_number;
  let db;
  try { db = openDb(); } catch (e) { return res.status(500).json({ error: e.message }); }
  db.get("SELECT * FROM providers WHERE medical_license_number = ? OR license_number = ?", [license, license], (err, row) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "License not found" });
    const status = (row.medical_license_number === "INVALID" || row.license_number === "INVALID") ? "Invalid" : "Valid";
    res.json({ license, status });
  });
});

// 6) Download report - dynamically generate CSV file from DB and send
app.get("/download-report", (req, res) => {
  let db;
  try { db = openDb(); } catch (e) { return res.status(500).json({ error: e.message }); }

  db.all("SELECT * FROM providers", (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });

    // prepare header order matching your desired capitalized names
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

    const csvLines = [header.join(",")];

    rows.forEach(r => {
      // compute Issue
      let issue = "";
      if (String(r.npi).toUpperCase() === "INVALID") issue = "Invalid NPI";
      else if (String(r.medical_license_number || r.license_number).toUpperCase() === "INVALID") issue = "Invalid License";

      const line = [
        r.id ?? "",
        `"${(r.name||r.full_name||"").replace(/"/g, '""')}"`,
        r.medical_license_number ?? r.license_number ?? "",
        r.npi ?? r.npi_number ?? "",
        `"${(r.specialty||"").replace(/"/g, '""')}"`,
        `"${(r.affiliation||"").replace(/"/g, '""')}"`,
        `"${(r.address||r.practice_address||"").replace(/"/g, '""')}"`,
        r.email ?? "",
        r.contact_number ?? r.phone ?? "",
        r.confidence_score ?? 100,
        `"${issue}"`,
        r.manual_review ?? ""
      ].join(",");

      csvLines.push(line);
    });

    // ensure datasets dir exists and write CSV there
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(REPORT_FILE, csvLines.join(os.EOL), "utf8");

    // send file as download
    res.download(REPORT_FILE, "ProviderValidationReport.csv", err => {
      if (err) {
        console.error("Download error:", err);
      }
    });
  });
});

// 7) serve raw dataset files directly (static)
app.use("/datasets", express.static(DATA_DIR));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

