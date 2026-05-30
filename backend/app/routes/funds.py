from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from ..database import get_db
from .. import crud, schemas
from ..utils import validate_dates

router = APIRouter(
    prefix="/api",
    tags=["Funds"]
)

@router.get(
    "/fund-summary-by-investor",
    response_model=List[schemas.FundSummaryByInvestorResponse],
    summary="Get mutual fund-wise summary per investor"
)
def get_fund_summary_by_investor(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_fund_summary_by_investor(db, from_date, to_date)
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error. Please make sure PostgreSQL is running and credentials in .env are correct. Detail: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get(
    "/mutual-fund-summary",
    response_model=List[schemas.MutualFundSummaryResponse],
    summary="Get mutual fund summary across all investors"
)
def get_mutual_fund_summary(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_mutual_fund_summary(db, from_date, to_date)
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error. Please make sure PostgreSQL is running and credentials in .env are correct. Detail: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
