# validate_providers.py
import sqlite3

DB_FILE = "providers.db"

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

cursor.execute("SELECT id, npi, license_number FROM providers")
rows = cursor.fetchall()

for provider_id, npi, license_number in rows:
    issue = ""
    if npi == "INVALID":
        issue += "Invalid NPI; "
    if license_number == "INVALID":
        issue += "Invalid License; "
    
    cursor.execute("UPDATE providers SET issue=? WHERE id=?", (issue.strip(), provider_id))

conn.commit()
conn.close()
print("✅ Provider NPI & License validation complete! Issues updated in database.")
