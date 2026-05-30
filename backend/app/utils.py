from datetime import date
from typing import Optional
from fastapi import HTTPException, status

def validate_dates(from_date: Optional[date] = None, to_date: Optional[date] = None):
    """
    Validates that the 'from_date' is not after the 'to_date'.
    """
    if from_date and to_date and from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date range: 'from_date' cannot be after 'to_date'."
        )
