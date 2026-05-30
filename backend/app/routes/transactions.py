from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from ..database import get_db
from .. import crud, schemas
from ..utils import validate_dates

router = APIRouter(
    prefix="/api",
    tags=["Transactions"]
)

@router.get(
    "/transactions",
    response_model=schemas.PaginatedTransactionsResponse,
    summary="Get paginated list of transactions with sorting, filtering, and search"
)
def get_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=5000, description="Page size (records per page)"),
    search: Optional[str] = Query(None, description="Search by investor name, mutual fund, or PAN"),
    sort_by: str = Query("transaction_date", description="Field to sort by (e.g. transaction_date, purchase_amount)"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order: asc or desc"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    validate_dates(from_date, to_date)
    try:
        return crud.get_transactions(db, page, size, search, sort_by, sort_order, from_date, to_date)
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post(
    "/transactions",
    response_model=schemas.TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new mutual fund transaction record"
)
def create_transaction(
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):
    try:
        return crud.create_transaction(db, transaction_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to record transaction: {str(e)}"
        )

@router.delete(
    "/transactions/{transaction_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a transaction record by its unique ID"
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    try:
        success = crud.delete_transaction(db, transaction_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found."
            )
        return {"message": f"Transaction {transaction_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete transaction: {str(e)}"
        )

@router.put(
    "/transactions/{transaction_id}",
    response_model=schemas.TransactionResponse,
    summary="Update an existing transaction record"
)
def update_transaction(
    transaction_id: int,
    transaction_data: schemas.TransactionUpdate,
    db: Session = Depends(get_db)
):
    try:
        updated_txn = crud.update_transaction(db, transaction_id, transaction_data)
        if not updated_txn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found."
            )
        return updated_txn
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transaction: {str(e)}"
        )
