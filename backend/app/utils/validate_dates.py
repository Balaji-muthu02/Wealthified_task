from datetime import date
from fastapi import HTTPException, status

def validate_dates(from_date: date | None, to_date: date | None):
    """Validate that from_date is not after to_date.
    Raises a 400 HTTPException if validation fails.
    """
    if from_date and to_date and from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'from_date' cannot be later than 'to_date'."
        )
