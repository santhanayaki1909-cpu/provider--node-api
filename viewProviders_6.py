# viewProviders.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import sqlite3

app = FastAPI(title="Provider Unified Server")

DB_FILE = "providers.db"                       # Database path
REPORT_FILE = "ProviderValidationReport.csv"   # CSV report path

# --- Utility Functions ---

def get_all_providers():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers")
    rows = cursor.fetchall()
    conn.close()

    api_columns = ['Id','Full_Name','Medical_License_Number','Npi_Number','Specialty',
                   'Affiliation','Practice_Address','Email','Phone',
                   'Confidence_Score','Issue','Manual_Review']

    return [dict(zip(api_columns, row)) for row in rows]

def get_provider(provider_id: int):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers WHERE id = ?", (provider_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    api_columns = ['Id','Full_Name','Medical_License_Number','Npi_Number','Specialty',
                   'Affiliation','Practice_Address','Email','Phone',
                   'Confidence_Score','Issue','Manual_Review']
    return dict(zip(api_columns, row))

# --- Endpoints ---

# 1️⃣ Get all providers
@app.get("/providers")
def all_providers():
    return {"providers": get_all_providers()}

# 2️⃣ Get provider by ID
@app.get("/providers/{provider_id}")
def provider_by_id(provider_id: int):
    provider = get_provider(provider_id)
    if provider:
        return provider
    raise HTTPException(status_code=404, detail="Provider not found")

# 3️⃣ NPI Check
@app.get("/npi/{provider_id}")
def npi_check(provider_id: int):
    provider = get_provider(provider_id)
    if provider:
        return {
            "Id": provider['Id'],
            "Npi_Number": provider['Npi_Number'],
            "Specialty": provider['Specialty'],
            "Phone": provider['Phone']
        }
    raise HTTPException(status_code=404, detail="Provider not found")

# 4️⃣ License Check
@app.get("/license/{license_number}")
def license_check(license_number: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT license_number FROM providers WHERE license_number = ?", (license_number,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"License_Number": row[0], "Status": "Valid"}
    return {"License_Number": license_number, "Status": "Invalid"}

# 5️⃣ Download Provider Validation Report
@app.get("/download-report")
def download_report():
    return FileResponse(REPORT_FILE, filename="ProviderValidationReport.csv")

# 6️⃣ Health Check
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Server is running!"}
