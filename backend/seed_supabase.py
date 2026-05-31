"""
Wealthified - Supabase Seed Script
Creates the transactions table and inserts sample mutual fund data.
Run: python seed_supabase.py
"""

import os
import sys
from dotenv import load_dotenv

# Load .env from backend/
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env")
    sys.exit(1)

from sqlalchemy import create_engine, text

print(f"Connecting to Supabase...")
engine = create_engine(DATABASE_URL)

# ── 1. Create tables ─────────────────────────────────────────────────────────
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS transactions (
    id               SERIAL PRIMARY KEY,
    investor_name    VARCHAR(255) NOT NULL,
    pan_number       VARCHAR(20)  NOT NULL,
    mutual_fund_name VARCHAR(500) NOT NULL,
    transaction_date DATE         NOT NULL,
    purchase_amount  NUMERIC(15,2) NOT NULL,
    nav_units        NUMERIC(15,4) NOT NULL,
    nav_price        NUMERIC(10,4)
);

CREATE INDEX IF NOT EXISTS idx_txn_pan      ON transactions(pan_number);
CREATE INDEX IF NOT EXISTS idx_txn_fund     ON transactions(mutual_fund_name);
CREATE INDEX IF NOT EXISTS idx_txn_date     ON transactions(transaction_date);
"""

# ── 2. Sample data ────────────────────────────────────────────────────────────
SAMPLE_DATA = [
    # Investor 1 - Balaji
    ("Balaji Esakkimuthu", "ABCDE1234F", "DSP Nifty 50 Equal Weight Index Fund",        "2024-01-15", 25000.00,  261.4900, 95.6200),
    ("Balaji Esakkimuthu", "ABCDE1234F", "DSP Nifty 50 Equal Weight Index Fund",        "2024-03-10", 25000.00,  255.1200, 98.0000),
    ("Balaji Esakkimuthu", "ABCDE1234F", "Mirae Asset Large Cap Fund",                  "2024-02-20", 50000.00,  312.5000, 160.0000),
    ("Balaji Esakkimuthu", "ABCDE1234F", "Parag Parikh Flexi Cap Fund",                 "2024-04-05", 30000.00,  118.7500, 252.6316),
    ("Balaji Esakkimuthu", "ABCDE1234F", "HDFC Gold Fund",                              "2024-05-12", 15000.00,  221.4900, 67.7350),
    ("Balaji Esakkimuthu", "ABCDE1234F", "SBI Liquid Fund",                             "2024-06-01", 100000.00, 823.4120, 121.4280),
    # Investor 2 - Priya
    ("Priya Sharma",       "BCDFE5678G", "HDFC Top 100 Fund",                           "2024-01-22", 40000.00,  445.0000, 89.8876),
    ("Priya Sharma",       "BCDFE5678G", "DSP Nifty 50 Equal Weight Index Fund",        "2024-02-14", 20000.00,  210.5300, 95.0000),
    ("Priya Sharma",       "BCDFE5678G", "Axis Bluechip Fund",                          "2024-03-18", 35000.00,  780.5000, 44.8400),
    ("Priya Sharma",       "BCDFE5678G", "ICICI Pru Ultra Short Term Fund",             "2024-04-25", 75000.00, 1012.3400, 74.0800),
    ("Priya Sharma",       "BCDFE5678G", "Kotak Gold ETF FOF",                          "2024-05-30", 12000.00,   87.6500, 136.8800),
    # Investor 3 - Rajan
    ("Rajan Krishnamurthy","CDEFG9012H", "Parag Parikh Flexi Cap Fund",                 "2024-02-08", 60000.00,  235.0000, 255.3200),
    ("Rajan Krishnamurthy","CDEFG9012H", "Mirae Asset Large Cap Fund",                  "2024-03-22", 45000.00,  285.7100, 157.5000),
    ("Rajan Krishnamurthy","CDEFG9012H", "Nippon India Index Fund Nifty 50",            "2024-04-10", 30000.00,  183.2500, 163.7000),
    ("Rajan Krishnamurthy","CDEFG9012H", "SBI Liquid Fund",                             "2024-05-15", 200000.00,1634.1500, 122.3900),
    ("Rajan Krishnamurthy","CDEFG9012H", "HDFC Gold Fund",                              "2024-06-20", 25000.00,  358.2000, 69.8000),
    # Investor 4 - Anitha
    ("Anitha Venkatesh",   "DEFGH3456I", "Axis Bluechip Fund",                          "2024-01-30", 55000.00,  612.3500, 89.8000),
    ("Anitha Venkatesh",   "DEFGH3456I", "ICICI Pru Ultra Short Term Fund",             "2024-02-25", 80000.00,  892.1200, 89.7000),
    ("Anitha Venkatesh",   "DEFGH3456I", "DSP Nifty 50 Equal Weight Index Fund",        "2024-03-15", 40000.00,  416.6700, 96.0000),
    ("Anitha Venkatesh",   "DEFGH3456I", "Kotak Gold ETF FOF",                          "2024-04-28", 18000.00,  129.5000, 138.9900),
    # Investor 5 - Suresh
    ("Suresh Babu",        "EFGHI7890J", "Nippon India Index Fund Nifty 50",            "2024-03-05", 25000.00,  152.4400, 164.0000),
    ("Suresh Babu",        "EFGHI7890J", "HDFC Top 100 Fund",                           "2024-04-12", 35000.00,  389.7800, 89.8000),
    ("Suresh Babu",        "EFGHI7890J", "Parag Parikh Flexi Cap Fund",                 "2024-05-18", 45000.00,  175.2400, 256.8000),
    ("Suresh Babu",        "EFGHI7890J", "SBI Liquid Fund",                             "2024-06-25", 150000.00,1222.5500, 122.7000),
    ("Suresh Babu",        "EFGHI7890J", "Mirae Asset Large Cap Fund",                  "2024-07-10", 30000.00,  188.0000, 159.6000),
]

INSERT_SQL = """
INSERT INTO transactions
    (investor_name, pan_number, mutual_fund_name, transaction_date, purchase_amount, nav_units, nav_price)
VALUES
    (:investor_name, :pan_number, :mutual_fund_name, :transaction_date, :purchase_amount, :nav_units, :nav_price)
"""

try:
    with engine.connect() as conn:
        # Create table
        conn.execute(text(CREATE_TABLE_SQL))
        conn.commit()
        print("Table 'transactions' created / verified.")

        # Check if data already exists
        count = conn.execute(text("SELECT COUNT(*) FROM transactions")).scalar()
        if count > 0:
            print(f"Table already has {count} rows. Clearing and re-seeding...")
            conn.execute(text("DELETE FROM transactions"))
            conn.commit()

        # Insert sample rows
        for row in SAMPLE_DATA:
            conn.execute(text(INSERT_SQL), {
                "investor_name":    row[0],
                "pan_number":       row[1],
                "mutual_fund_name": row[2],
                "transaction_date": row[3],
                "purchase_amount":  row[4],
                "nav_units":        row[5],
                "nav_price":        row[6],
            })
        conn.commit()
        print(f"Inserted {len(SAMPLE_DATA)} sample transactions.")

        # Verify
        final_count = conn.execute(text("SELECT COUNT(*) FROM transactions")).scalar()
        print(f"Total rows in 'transactions': {final_count}")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

print("\nSupabase seeding complete! Restart your FastAPI server now.")
