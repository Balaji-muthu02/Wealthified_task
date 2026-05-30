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
    tags=["Investors"]
)

@router.get(
    "/investor-summary",
    response_model=List[schemas.InvestorSummaryResponse],
    summary="Get investor-wise purchase summary per mutual fund"
)
def get_investor_summary(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_investor_summary(db, from_date, to_date)
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
    "/investors",
    response_model=List[schemas.InvestorListResponse],
    summary="Get list of investors with total investment details"
)
def get_investors(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_investors(db, from_date, to_date)
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
