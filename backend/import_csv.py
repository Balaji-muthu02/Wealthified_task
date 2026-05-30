import csv
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database import engine, SessionLocal, Base
from app.models import Transaction

def parse_date(date_str: str):
    """
    Robustly parses transaction date string into a Python date object.
    Supports various date formats and strips time component if present.
    """
    if not date_str:
        raise ValueError("Date string is empty")
    
    # Strip time if it exists (e.g., '5/27/2025 12:00:00 AM' -> '5/27/2025')
    clean_str = date_str.strip().split()[0]
    
    # Try different common date formats
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(clean_str, fmt).date()
        except ValueError:
            continue
            
    raise ValueError(f"Unknown date format: '{date_str}'")

def create_database_if_not_exists():
    """
    Connects to the default 'postgres' database to check if the target database
    exists, and creates it if it doesn't.
    """
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "wealthfeed_db")

    try:
        # Connect to 'postgres' database
        conn = psycopg2.connect(
            dbname="postgres",
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Database '{db_name}' does not exist. Creating database...")
            # Query parameters are not supported for CREATE DATABASE, but db_name is safe from .env
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Warning: Could not verify or create database automatically: {e}")

def import_csv_data():
    # Make sure target database exists before starting SQLAlchemy connection
    create_database_if_not_exists()

    # Use absolute path to the dataset transactions.csv
    csv_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset", "transactions.csv")
    
    if not os.path.exists(csv_file_path):
        print(f"Error: CSV file not found at {csv_file_path}")
        return
        
    print("Connecting to database and verifying tables exist...")
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Clear existing data to avoid duplicate imports
        print("Clearing existing transactions in the database...")
        db.query(Transaction).delete()
        db.commit()
        
        print(f"Reading transaction data from {csv_file_path}...")
        count = 0
        
        with open(csv_file_path, mode="r", encoding="utf-8-sig") as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Check for required columns
                required_cols = ["INV_NAME", "PAN", "SCHEME", "TRADDATE", "AMOUNT", "UNITS"]
                for col in required_cols:
                    if col not in row:
                        raise ValueError(f"Missing required CSV column: {col}")
                
                # Extract and parse values
                investor_name = row["INV_NAME"].strip()
                pan_number = row["PAN"].strip()
                mutual_fund_name = row["SCHEME"].strip()
                transaction_date = parse_date(row["TRADDATE"])
                purchase_amount = Decimal(row["AMOUNT"].strip() or "0.00")
                nav_units = Decimal(row["UNITS"].strip() or "0.0000")
                
                # PURPRICE might be optional or empty in some transactions
                nav_price = None
                if row.get("PURPRICE") and row["PURPRICE"].strip():
                    nav_price = Decimal(row["PURPRICE"].strip())
                
                # Create and add model instance (id is auto-incremented by DB)
                transaction = Transaction(
                    investor_name=investor_name,
                    pan_number=pan_number,
                    mutual_fund_name=mutual_fund_name,
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
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_data()

