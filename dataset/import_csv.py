import csv
import os
import sys
from datetime import datetime
from decimal import Decimal

# Add parent directory of dataset/ and backend/ to path so we can import backend code
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import engine, SessionLocal, Base
from backend.app.models import Transaction

def parse_date(date_str):
    date_str = date_str.strip()
    for fmt in ("%m/%d/%Y %I:%M:%S %p", "%m/%d/%Y %H:%M:%S", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unknown date format: {date_str}")

def clean_row_keys_and_values(row):
    cleaned = {}
    for k, v in row.items():
        if k is not None:
            k_clean = k.strip().strip("'").strip('"')
            v_clean = v.strip().strip("'").strip('"') if v else ""
            cleaned[k_clean] = v_clean
    return cleaned

def import_csv_data():
    csv_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "transactions.csv")
    
    if not os.path.exists(csv_file_path):
        print(f"Error: CSV file not found at {csv_file_path}")
        sys.exit(1)
        
    print("Connecting to database and verifying tables exist...")
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear existing data to avoid duplicates when running multiple times
        print("Clearing existing transactions in the database...")
        db.query(Transaction).delete()
        db.commit()
        
        print(f"Reading transaction data from {csv_file_path}...")
        count = 0
        with open(csv_file_path, mode="r", encoding="utf-8") as file:
            # We use csv.reader to manually clean the headers first, because headers contain single quotes
            reader = csv.reader(file)
            headers = next(reader)
            cleaned_headers = [h.strip().strip("'").strip('"') for h in headers]
            
            for row in reader:
                if not row or len(row) < len(cleaned_headers):
                    continue
                # Map row columns to cleaned headers
                raw_dict = dict(zip(cleaned_headers, row))
                cleaned = clean_row_keys_and_values(raw_dict)
                
                # Check for required fields
                if not cleaned.get("PAN") or not cleaned.get("SCHEME") or not cleaned.get("TRADDATE"):
                    continue
                
                transaction_date = parse_date(cleaned["TRADDATE"])
                purchase_amount = Decimal(cleaned["AMOUNT"]) if cleaned.get("AMOUNT") else Decimal("0.00")
                nav_units = Decimal(cleaned["UNITS"]) if cleaned.get("UNITS") else Decimal("0.0000")
                
                # Auto-calculate nav_price if it's missing or zero
                nav_price = None
                if cleaned.get("PURPRICE"):
                    nav_price = Decimal(cleaned["PURPRICE"])
                elif nav_units > 0:
                    nav_price = purchase_amount / nav_units
                
                # Create model instance
                transaction = Transaction(
                    investor_name=cleaned["INV_NAME"],
                    pan_number=cleaned["PAN"],
                    mutual_fund_name=cleaned["SCHEME"],
                    transaction_date=transaction_date,
                    purchase_amount=purchase_amount,
                    nav_units=nav_units,
                    nav_price=nav_price
                )
                db.add(transaction)
                count += 1
                
        db.commit()
        print(f"Successfully imported {count} transactions into PostgreSQL database!")
        
    except Exception as e:
        db.rollback()
        print(f"Error occurred during CSV import: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_data()
