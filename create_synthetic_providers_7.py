# create_synthetic_providers.py
import sqlite3
import random
import string

DB_FILE = "providers.db"

# Connect to database
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Function to generate random strings
def random_string(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# Function to generate synthetic providers with random errors
def generate_providers(id_start, count=50):
    providers = []
    for i in range(id_start, id_start + count):
        name = f"Dr. {random_string(5)}"
        license_number = f"LIC{random.randint(100,999)}"
        npi = str(random.randint(1000000000, 9999999999))
        specialty = random.choice(["Cardiology", "Dermatology", "Neurology", "Pediatrics"])
        affiliation = random.choice(["Hospital A", "Hospital B", "Clinic X"])
        address = f"{random.randint(1,999)} {random_string(5)} Street"
        email = f"{random_string(5).lower()}@example.com"
        contact_number = f"+91{random.randint(7000000000,9999999999)}"
        confidence_score = random.randint(70, 100)

        # Introduce random errors
        if random.random() < 0.3:
            npi = "INVALID"  # 30% chance invalid NPI
        if random.random() < 0.2:
            license_number = "INVALID"  # 20% chance invalid license
        if random.random() < 0.1:
            email = "invalid_email"  # 10% chance invalid email
        if random.random() < 0.1:
            contact_number = "0000000000"  # 10% chance invalid phone

        providers.append((
            i, name, license_number, npi, specialty, affiliation,
            address, email, contact_number, confidence_score, "", ""
        ))
    return providers

# Generate and insert synthetic providers
synthetic_providers = generate_providers(251, 50)  # starting after existing 250

cursor.executemany("""
INSERT INTO providers
(id, name, license_number, npi, specialty, affiliation, address, email, contact_number, confidence_score, issue, manual_review)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", synthetic_providers)

conn.commit()
conn.close()
print("✅ Synthetic providers with errors created successfully!")
