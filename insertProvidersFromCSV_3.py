import sqlite3
import pandas as pd

# Load CSV
df = pd.read_csv("providers_250.csv")
print("Columns in CSV:", df.columns)

conn = sqlite3.connect("providers.db")
cursor = conn.cursor()

for _, row in df.iterrows():
    cursor.execute("""
    INSERT OR REPLACE INTO providers (
        id, name, license_number, npi, specialty, affiliation, 
        address, email, contact_number, confidence_score, issue, manual_review
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        row['Id'],
        row['Full_name'],                   # ✅ match CSV exactly
        row['Medical_License_Number'],      
        row['Npi_Number'],                  
        row['Specialty'],
        row['Affiliation'],
        row['Practice_address'],            # ✅ match CSV exactly
        row['Email'],
        row['Phone'],                       
        100,                                # default confidence score
        "None",                             # default issue
        "Pending"                           
    ))

conn.commit()
conn.close()
print("✅ 250 providers inserted successfully!")

