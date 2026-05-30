# Mutual Fund Transaction Dashboard - Backend API

A complete, production-ready backend built with **FastAPI**, **SQLAlchemy ORM**, and **PostgreSQL** to serve financial data dashboards. The API reads structured mutual fund transaction data and exposes aggregated metrics and summaries with optional date range filters.

---

## Tech Stack

- **Language:** Python 3.10+
- **Framework:** FastAPI (Asynchronous ready)
- **Database ORM:** SQLAlchemy (Declarative Base, Session Injection)
- **Database:** PostgreSQL
- **Data Parsing:** CSV (standard python standard library)
- **Environment Variables:** `python-dotenv`
- **Validation:** Pydantic v2

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  ← FastAPI entry point and middleware configuration
│   ├── database.py              ← PostgreSQL connection and SQLAlchemy Session dependency
│   ├── models.py                ← SQLAlchemy Transaction Database Model
│   ├── schemas.py               ← Pydantic response structures for API data validation
│   ├── crud.py                  ← Modular repository patterns for database queries
│   ├── utils.py                 ← Shared utilities (e.g. date validation)
│   └── routes/
│       ├── __init__.py          ← Package initialization for routes module
│       ├── investors.py         ← APIRouter handling Investor-specific endpoints
│       └── funds.py             ← APIRouter handling Mutual Fund-specific endpoints
├── dataset/
│   └── transactions.csv         ← Rich dataset containing sample mutual fund transactions
├── import_csv.py                ← CSV importer script to load dataset into PostgreSQL
├── requirements.txt             ← Python dependencies
├── .env.example                 ← Template for DB configuration
└── README.md                    ← Setup & usage documentation (this file)
```

---

## Installation & Setup Instructions

### 1. Create and Activate Virtual Environment
Open your terminal inside the `backend` directory and run:

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Configuration
1. Create a PostgreSQL database on your local server. Let's call it `mutualfund_dashboard` (or any name you prefer).
2. Copy `.env.example` to `.env` in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your actual database credentials:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mutualfund_dashboard
   ```

---

## Importing Sample Transactions from CSV

To load the 15 realistic transaction records into your PostgreSQL database, run:
```bash
python import_csv.py
```
This script will:
- Connect to the PostgreSQL database using settings in your `.env`.
- Automatically create the `transactions` table if it does not already exist.
- Clear any existing transactions (to prevent duplicate entries if run multiple times).
- Efficiently insert all records into the database with proper decimal precision and parsed dates.

---

## Running the FastAPI Server

To start the FastAPI development server with auto-reload, run:
```bash
uvicorn app.main:app --reload --port 8000
```
The server will start running at **`http://localhost:8000`**.

- **Interactive API Documentation (Swagger UI):** Visit [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Documentation (Redoc):** Visit [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints & Example curl Requests

The API exposes 4 main summary/directory endpoints under the `/api` prefix. All endpoints support query parameters `from_date` and `to_date` (format: `YYYY-MM-DD`) for date filtering.

### 1. Investor-wise Purchase Summary per Mutual Fund
Provides a detailed list of total purchase amount and units bought by each investor in each mutual fund.

- **Without Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/investor-summary"
  ```
- **With Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/investor-summary?from_date=2025-05-15&to_date=2025-05-27"
  ```

### 2. Mutual Fund-wise Summary per Investor
Provides a structured view of mutual fund holdings aggregated for each individual investor.

- **Without Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/fund-summary-by-investor"
  ```
- **With Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/fund-summary-by-investor?from_date=2025-05-15&to_date=2025-05-27"
  ```

### 3. Investor Directory & Total Investment List
Provides a list of unique investors, their PAN number, and their total investment amount.

- **Without Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/investors"
  ```
- **With Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/investors?from_date=2025-05-10&to_date=2025-05-20"
  ```

### 4. Mutual Fund Performance & Allocation Summary
Provides details of all mutual funds, total amount invested in each, total NAV units, and the weighted average NAV price.

- **Without Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/mutual-fund-summary"
  ```
- **With Date Filters:**
  ```bash
  curl -X GET "http://localhost:8000/api/mutual-fund-summary?from_date=2025-05-20&to_date=2025-05-28"
  ```
