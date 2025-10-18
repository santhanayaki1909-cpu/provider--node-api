# mock_server_clean.py
from fastapi import FastAPI, HTTPException
import sqlite3
from fastapi.responses import FileResponse

app = FastAPI(title="Provider Data API")

DB_FILE = "providers.db"
REPORT_FILE = "provider_validation_report.csv"

# --- Utility Functions ---

def get_all_providers():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers")
    rows = cursor.fetchall()
    conn.close()
    
    # Lowercase DB columns
    db_columns = ['id', 'name', 'license_number', 'npi', 'specialty', 'affiliation',
                  'address', 'email', 'contact_number', 'confidence_score', 'issue', 'manual_review']
    
    # Capitalized API keys (matching CSV)
    api_columns = ['Id', 'Full_Name', 'Medical_License_Number', 'Npi_Number', 'Specialty',
                   'Affiliation', 'Practice_Address', 'Email', 'Phone',
                   'Confidence_Score', 'Issue', 'Manual_Review']
    
    return [dict(zip(api_columns, row)) for row in rows]

def get_provider(provider_id: int):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM providers WHERE id = ?", (provider_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        # Lowercase DB columns
        db_columns = ['id', 'name', 'license_number', 'npi', 'specialty', 'affiliation',
                      'address', 'email', 'contact_number', 'confidence_score', 'issue', 'manual_review']
        
        # Capitalized API keys (matching CSV)
        api_columns = ['Id', 'Full_Name', 'Medical_License_Number', 'Npi_Number', 'Specialty',
                       'Affiliation', 'Practice_Address', 'Email', 'Phone',
                       'Confidence_Score', 'Issue', 'Manual_Review']
        
        return dict(zip(api_columns, row))
    return None

# --- Endpoints ---

@app.get("/providers")
def all_providers_endpoint():
    return {"providers": get_all_providers()}

@app.get("/providers/{provider_id}")
def single_provider_endpoint(provider_id: int):
    provider = get_provider(provider_id)
    if provider:
        return provider
    raise HTTPException(status_code=404, detail="Provider not found")

@app.get("/npi/{provider_id}")
def mock_npi(provider_id: int):
    provider = get_provider(provider_id)
    if provider:
        return {
            "Id": provider['Id'],
            "Npi_Number": provider['Npi_Number'],
            "Specialty": provider['Specialty'],
            "Phone": provider['Phone']
        }
    raise HTTPException(status_code=404, detail="Provider not found")

@app.get("/license/{license_number}")
def mock_license(license_number: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT license_number FROM providers WHERE license_number = ?", (license_number,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"Medical_License_Number": row[0], "Status": "Valid"}
    return {"Medical_License_Number": license_number, "Status": "Invalid"}

@app.get("/download-report")
def download_report():
    return FileResponse(REPORT_FILE, filename="provider_validation_report.csv")

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Mock server running successfully!"}
