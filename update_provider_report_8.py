from fastapi import FastAPI
from fastapi.responses import FileResponse
import sqlite3
import pandas as pd
import os

DB_FILE = "providers.db"
REPORT_FILE = "ProviderValidationReport.csv"

app = FastAPI(title="Provider Validation Server")

# --- Utility: Generate CSV Report ---
def generate_report():
    if not os.path.exists(DB_FILE):
        raise Exception("Database file providers.db not found!")
    
    conn = sqlite3.connect(DB_FILE)
    df = pd.read_sql_query("SELECT * FROM providers", conn)
    
    # Ensure correct column names
    df.columns = ['Id', 'Full_Name', 'Medical_License_Number', 'Npi_Number', 'Specialty',
                  'Affiliation', 'Practice_Address', 'Email', 'Phone',
                  'Confidence_Score', 'Issue', 'Manual_Review']
    
    # Mark issues for synthetic errors
    df['Issue'] = df.apply(lambda row: "Invalid NPI" if row['Npi_Number']=="INVALID" else 
                                      ("Invalid License" if row['Medical_License_Number']=="INVALID" else ""), axis=1)
    
    # Save all providers to CSV at once
    df.to_csv(REPORT_FILE, index=False)
    conn.close()

# --- API Endpoint ---
@app.get("/download-report")
def download_report():
    generate_report()
    return FileResponse(REPORT_FILE, filename="ProviderValidationReport.csv")

# --- Optional: Health Check ---
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Server is running!"}

        