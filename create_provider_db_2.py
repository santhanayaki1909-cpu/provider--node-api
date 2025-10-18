import sqlite3

conn = sqlite3.connect("providers.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS providers (
    Id INTEGER PRIMARY KEY,
    Full_Name TEXT,
    Medical_License_Number TEXT,
    Npi_Number TEXT,
    Specialty TEXT,
    Affiliation TEXT,
    Practice_Address TEXT,
    Email TEXT,
    Phone TEXT,
    Confidence_Score INTEGER,
    Issue TEXT,
    Manual_Review TEXT
)

""")

conn.commit()
conn.close()
print("✅ providers.db created successfully!")
