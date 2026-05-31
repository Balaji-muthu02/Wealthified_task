# Wealthified - Mutual Fund Transaction Analytics Dashboard

A beginner-friendly, high-performance, single-page full-stack dashboard designed to aggregate and summarize mutual fund transactions. Built with a **Python (FastAPI)** backend, a **PostgreSQL** database, and a **Vanilla HTML/CSS/JS** frontend featuring a modern glassmorphic theme and interactive visualizations.

---

## Features

1. **Investor-wise Purchase Summary per Mutual Fund**: View aggregate investments and NAV units grouped by investor and fund.
2. **Mutual Fund-wise Summary per Investor**: Drill down into fund portfolios showing individual investor allocations.
3. **Investor Directory**: List of all active investors, their PAN details, and total capital committed.
4. **Mutual Fund Performance Analytics**: Aggregated total investments, NAV units, and weighted average NAV calculation.
5. **Interactive Date Range Filter**: Dynamically filter all metrics, summaries, tables, and charts across a custom time period.
6. **Live Data Visualization**: Allocation doughnut and contribution bar charts powered by Chart.js.
7. **Fast Client-side Search**: Instantly filter table contents without sending redundant network requests.

---

## Directory Structure

```text
Wealthified/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application startup and endpoints
│   │   ├── database.py      # SQLAlchemy engine configuration
│   │   ├── models.py        # SQLAlchemy model representing the transaction schema
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   └── crud.py          # Aggregate DB queries & filter logic
│   ├── requirements.txt     # Python backend dependencies
│   ├── .env                 # Environment configuration (created on setup)
│   └── .env.example         # Template environment file
├── frontend/
│   ├── index.html           # Main dashboard layout
│   ├── style.css            # Responsive layout and glassmorphism styling
│   └── app.js               # Tab switches, API fetching, and chart generation
├── dataset/
│   ├── transactions.csv     # Sample CSV dataset containing transactions
│   └── import_csv.py        # Python script to load CSV data into PostgreSQL
└── README.md                # This setup and documentation file
```

---

## Setup & Running Instructions

Follow these step-by-step instructions to get the application up and running locally.

### 1. Database Setup
1. Ensure **PostgreSQL** is installed and running on your system.
2. Open your terminal or `psql` shell and create a new database:
   ```sql
   CREATE DATABASE wealthfeed_db;
   ```
3. Copy `backend/.env.example` to `backend/.env` (if not already done) and adjust the credentials matching your PostgreSQL username and password:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=wealthfeed_db
   DB_USER=postgres
   DB_PASSWORD=YOUR_PASSWORD_HERE
   ```

### 2. Install Python Dependencies
Create a virtual environment (optional but recommended) and install the backend packages:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required dependencies
pip install -r backend/requirements.txt
```

### 3. Import CSV Transactions into PostgreSQL
Execute the CSV importing script to automatically construct the `transactions` table structure and seed it with mock transaction records:
```bash
python dataset/import_csv.py
```
*Note: This script will truncate any existing table data before loading to prevent duplicate records on repeated runs.*

### 4. Start the FastAPI Backend
Start the uvicorn development server:
```bash
uvicorn backend.app.main:app --reload
```
The backend server will spin up at **`http://localhost:8000`**. You can verify that it is working by opening your browser and visiting:
* Root endpoint: `http://localhost:8000/`
* Swagger API Documentation: `http://localhost:8000/docs`

### 5. Launch the Frontend Dashboard
Since the frontend consists of static files (`index.html`, `style.css`, `app.js`), you can launch it in a couple of ways:
* **Double-click** the `frontend/index.html` file to open it directly in any modern browser.
* Or serve it using a lightweight server, such as Python's built-in HTTP server:
  ```bash
  # Run from the frontend directory
  cd frontend
  python -m http.server 3000
  ```
  Then access the dashboard via `http://localhost:3000`.

---

## REST API Documentation

All analytical summaries support two optional query filters:
* `from_date` (format: `YYYY-MM-DD`)
* `to_date` (format: `YYYY-MM-DD`)

### 1. Investor-wise Summary
* **Endpoint**: `GET /api/investor-summary`
* **Purpose**: Aggregate investment amount and units grouped by investor and mutual fund scheme.
* **Sample Response**:
  ```json
  [
    {
      "investor_name": "Balaji Esakkimuthu",
      "mutual_fund_name": "HDFC Mid-Cap Opportunities Fund",
      "total_purchase_amount": 85000.0,
      "total_nav_units": 756.8364
    }
  ]
  ```

### 2. Mutual Fund-wise Summary
* **Endpoint**: `GET /api/fund-summary-by-investor`
* **Purpose**: Mutual fund holdings details broken down by investor.
* **Sample Response**:
  ```json
  [
    {
      "mutual_fund_name": "HDFC Mid-Cap Opportunities Fund",
      "investor_name": "Balaji Esakkimuthu",
      "total_amount_invested": 85000.0,
      "total_nav_units": 756.8364
    }
  ]
  ```

### 3. Investor List
* **Endpoint**: `GET /api/investors`
* **Purpose**: List of all unique investors, PAN details, and total amount invested.
* **Sample Response**:
  ```json
  [
    {
      "investor_name": "Balaji Esakkimuthu",
      "pan_number": "ABCDE1234F",
      "total_amount_invested": 155000.0
    }
  ]
  ```

### 4. Mutual Fund Summary Analytics
* **Endpoint**: `GET /api/mutual-fund-summary`
* **Purpose**: Summary details for all mutual fund schemes, including weighted average NAV.
* **Calculation**: `Average NAV = Total Investment Amount / Total Units Purchased`.
* **Sample Response**:
  ```json
  [
    {
      "mutual_fund_name": "HDFC Mid-Cap Opportunities Fund",
      "total_amount_invested": 190000.0,
      "total_nav_units": 1658.2928,
      "average_nav": 114.5756
    }
  ]
  ```

---

## Edge Case Handling
* **Division-by-Zero Protection**: If a fund has `0` NAV units during a filtered period, the average NAV is safely computed as `0.00` rather than causing a backend crash.
* **Empty State Handling**: If a filter results in no transactions, tables display an intuitive "No Records Found" layout and charts clear properly.
* **Invalid Date Range**: If the `from_date` is configured later than the `to_date`, the API returns a `400 Bad Request` validation error, which is caught and displayed by the frontend alert system.
