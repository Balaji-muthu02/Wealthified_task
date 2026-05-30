import csv
import io
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud
from ..utils import validate_dates

router = APIRouter(
    prefix="/api/export",
    tags=["CSV Export"]
)


def _make_filename(entity: str, from_date: Optional[date], to_date: Optional[date]) -> str:
    """Build a descriptive filename for the CSV export."""
    if from_date and to_date:
        return f"{entity}_{from_date}_to_{to_date}.csv"
    elif from_date:
        return f"{entity}_{from_date}_to_all.csv"
    elif to_date:
        return f"{entity}_all_to_{to_date}.csv"
    return f"{entity}_all.csv"


def _stream_csv(rows: list[list], headers: list[str], filename: str) -> StreamingResponse:
    """Write rows to an in-memory CSV and return as a StreamingResponse."""
    output = io.StringIO()
    writer = csv.writer(output, delimiter=",")
    writer.writerow(headers)
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ──────────────────────────────────────────────
# GET /api/export/investors
# ──────────────────────────────────────────────
@router.get("/investors", summary="Export investors list as CSV")
def export_investors(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    data = crud.get_investors(db, from_date, to_date)

    headers = [
        "investor_name", "pan_number", "total_amount_invested",
        "total_nav_units", "number_of_funds", "latest_transaction_date"
    ]
    rows = [
        [
            r["investor_name"],
            r["pan_number"],
            r["total_amount_invested"],
            r["total_nav_units"],
            r["number_of_funds"],
            r["latest_transaction_date"]
        ]
        for r in data
    ]

    filename = _make_filename("investors", from_date, to_date)
    return _stream_csv(rows, headers, filename)


# ──────────────────────────────────────────────
# GET /api/export/funds
# ──────────────────────────────────────────────
@router.get("/funds", summary="Export mutual fund summary as CSV")
def export_funds(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    data = crud.get_mutual_fund_summary(db, from_date, to_date)

    headers = ["mutual_fund_name", "total_amount_invested", "total_nav_units", "average_nav"]
    rows = [
        [r["mutual_fund_name"], r["total_amount_invested"], r["total_nav_units"], r["average_nav"]]
        for r in data
    ]

    filename = _make_filename("funds", from_date, to_date)
    return _stream_csv(rows, headers, filename)


# ──────────────────────────────────────────────
# GET /api/export/analytics
# ──────────────────────────────────────────────
@router.get("/analytics", summary="Export all 4 analytics reports as CSV")
def export_analytics(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)

    output = io.StringIO()
    writer = csv.writer(output, delimiter=",")

    # ── Report 1: Investor-wise Purchase Summary per Mutual Fund ──
    writer.writerow(["Report 1: Investor-wise Purchase Summary per Mutual Fund"])
    writer.writerow(["investor_name", "mutual_fund_name", "total_purchase_amount", "total_nav_units"])
    for r in crud.get_investor_summary(db, from_date, to_date):
        writer.writerow([r["investor_name"], r["mutual_fund_name"], r["total_purchase_amount"], r["total_nav_units"]])

    writer.writerow([])  # blank separator

    # ── Report 2: Mutual Fund-wise Summary per Investor ──
    writer.writerow(["Report 2: Mutual Fund-wise Summary per Investor"])
    writer.writerow(["mutual_fund_name", "investor_name", "total_amount_invested", "total_nav_units"])
    for r in crud.get_fund_summary_by_investor(db, from_date, to_date):
        writer.writerow([r["mutual_fund_name"], r["investor_name"], r["total_amount_invested"], r["total_nav_units"]])

    writer.writerow([])

    # ── Report 3: Investor List with Purchase Details ──
    writer.writerow(["Report 3: Investor List with Purchase Details"])
    writer.writerow(["investor_name", "pan_number", "total_amount_invested", "total_nav_units", "number_of_funds", "latest_transaction_date"])
    for r in crud.get_investors(db, from_date, to_date):
        writer.writerow([r["investor_name"], r["pan_number"], r["total_amount_invested"], r["total_nav_units"], r["number_of_funds"], r["latest_transaction_date"]])

    writer.writerow([])

    # ── Report 4: Mutual Fund Summary ──
    writer.writerow(["Report 4: Mutual Fund Summary"])
    writer.writerow(["mutual_fund_name", "total_amount_invested", "total_nav_units", "average_nav"])
    for r in crud.get_mutual_fund_summary(db, from_date, to_date):
        writer.writerow([r["mutual_fund_name"], r["total_amount_invested"], r["total_nav_units"], r["average_nav"]])

    output.seek(0)
    filename = _make_filename("analytics", from_date, to_date)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ──────────────────────────────────────────────
# GET /api/export/transactions
# ──────────────────────────────────────────────
@router.get("/transactions", summary="Export transactions as CSV")
def export_transactions(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)

    # Fetch all transactions without pagination for export
    result = crud.get_transactions(db, page=1, size=999999, from_date=from_date, to_date=to_date)
    data = result.get("data", [])

    headers = ["id", "investor_name", "pan_number", "mutual_fund_name", "transaction_date", "purchase_amount", "nav_units", "nav_price"]
    rows = [
        [
            t.id,
            t.investor_name,
            t.pan_number,
            t.mutual_fund_name,
            t.transaction_date,
            t.purchase_amount,
            t.nav_units,
            t.nav_price if t.nav_price is not None else ""
        ]
        for t in data
    ]

    filename = _make_filename("transactions", from_date, to_date)
    return _stream_csv(rows, headers, filename)
