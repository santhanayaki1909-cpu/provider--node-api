import pandas as pd
import random
from faker import Faker

fake = Faker()

# Define specialties and hospitals
specialties = [
    "Cardiology", "Dermatology", "Neurology", "Orthopedics", 
    "Pediatrics", "Radiology", "Psychiatry", "General Surgery"
]

hospitals = [
    "Apollo Hospital", "Fortis Care", "Global Health Clinic", 
    "Sunrise Medical Center", "City Hospital", "LifeCare Clinic"
]

# Prepare list to hold provider data
providers = []

for i in range(1, 251):  # 250 doctors
    Full_name = f"Dr. {fake.first_name()} {fake.last_name()}"
    Phone = fake.phone_number()
    Address = fake.address().replace("\n", ", ")
    Specialty = random.choice(specialties)
    License_number = f"{fake.random_uppercase_letter()}{fake.random_uppercase_letter()}{random.randint(100000,999999)}"
    Npi_number = str(random.randint(1000000000, 9999999999))
    Insurance_network = random.choice(["Aetna", "BlueCross", "Cigna", "UnitedHealth", "None"])
    Affiliation = random.choice(hospitals)
    Website = fake.url()
    Email = fake.email()
    
    # For unstructured data (simulated PDFs)
    scanned_docs = f"credentials_{i}.pdf"

    providers.append({
        "Id": i,
        "Full_name": Full_name,
        "Phone": Phone,
        "Practice_address": Address,
        "Specialty": Specialty,
        "Medical_License_Number": License_number,
        "Npi_Number": Npi_number,
        "Insurance_Network": Insurance_network,
        "Affiliation": Affiliation,
        "Website": Website,
        "Email": Email,
        "Scanned_Documents": scanned_docs  # ✅ fixed lowercase variable
    })

# Create DataFrame
df = pd.DataFrame(providers)

# Save as CSV
df.to_csv("providers_250.csv", index=False)
print("✅ 250+ doctor dataset generated successfully as providers_250.csv")
