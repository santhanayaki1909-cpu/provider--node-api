import sqlite3
import requests
import pandas as pd

# Connect to SQLite DB
conn = sqlite3.connect("providers.db")
cursor = conn.cursor()

# Fetch all providers
cursor.execute("SELECT * FROM providers")
providers = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
conn.close()

report = []

for provider in providers:
    provider_dict = dict(zip(columns, provider))
    provider_id = provider_dict['id']
    license_number = provider_dict['license_number']

    # Call mock NPI API
    try:
        npi_response = requests.get(f"http://127.0.0.1:8000/npi/{provider_id}").json()
    except:
        npi_response = {}

    # Call mock License API
    try:
        license_response = requests.get(f"http://127.0.0.1:8000/license/{license_number}").json()
    except:
        license_response = {}

    confidence = 100
    issues = []

    # Validation checks
    if provider_dict.get('contact_number') != npi_response.get('Phone'):
        confidence -= 20
        issues.append("Phone mismatch")
    if provider_dict.get('specialty') != npi_response.get('Specialty'):
        confidence -= 20
        issues.append("Specialty mismatch")
    if license_response.get('Status') != "Valid":
        confidence -= 30
        issues.append(f"License status: {license_response.get('Status', 'Unknown')}")

    report.append({
        "Id": provider_id,
        "Full_Name": provider_dict.get('name'),
        "Phone": provider_dict.get('contact_number'),
        "Medical_License_Number": license_number,
        "Specialty": provider_dict.get('specialty'),
        "Email": provider_dict.get('email'),
        "Practice_Address": provider_dict.get('address'),
        "Confidence_Score": confidence,
        "Issue": ", ".join(issues) if issues else "None",
        "Manual_Review": "Pending"
    })

# Save entire CSV once, after the loop
df_report = pd.DataFrame(report)
df_report.to_csv("ProviderValidationReport.csv", index=False)
print("✅ Validation complete! Full report saved as ProviderValidationReport.csv")
