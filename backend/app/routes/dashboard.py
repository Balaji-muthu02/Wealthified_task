from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas
from ..utils.validate_dates import validate_dates

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"]
)

@router.get(
    "/dashboard-stats",
    response_model=schemas.DashboardStats,
    summary="Get global dashboard KPI statistics",
)
def get_dashboard_stats(
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_dashboard_stats(db, from_date, to_date)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
