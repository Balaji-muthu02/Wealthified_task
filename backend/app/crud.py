from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Transaction
from . import schemas


def apply_date_filters(query, model_class, from_date: date = None, to_date: date = None):
    """
    Utility function to apply date range filters to a SQLAlchemy query.
    """
    if from_date:
        query = query.filter(model_class.transaction_date >= from_date)
    if to_date:
        query = query.filter(model_class.transaction_date <= to_date)
    return query


def get_investor_summary(db: Session, from_date: date = None, to_date: date = None):
    """
    1. Investor-wise Purchase Summary per Mutual Fund
    Returns: investor_name, mutual_fund_name, total_purchase_amount, total_nav_units
    Group by: investor_name, mutual_fund_name
    """
    # Create the query selecting aggregates
    query = db.query(
        Transaction.investor_name,
        Transaction.mutual_fund_name,
        func.sum(Transaction.purchase_amount).label("total_purchase_amount"),
        func.sum(Transaction.nav_units).label("total_nav_units")
    )
    
    # Filter by date range
    query = apply_date_filters(query, Transaction, from_date, to_date)
    
    # Group by investor and mutual fund
    query = query.group_by(Transaction.investor_name, Transaction.mutual_fund_name)
    
    # Execute query
    results = query.all()
    
    # Parse results into a list of dictionaries that match Pydantic schemas
    return [
        {
            "investor_name": r.investor_name,
            "mutual_fund_name": r.mutual_fund_name,
            "total_purchase_amount": float(r.total_purchase_amount or 0.0),
            "total_nav_units": float(r.total_nav_units or 0.0)
        }
        for r in results
    ]


def get_fund_summary_by_investor(db: Session, from_date: date = None, to_date: date = None):
    """
    2. Mutual Fund-wise Summary per Investor
    Returns: mutual_fund_name, investor_name, total_amount_invested, total_nav_units
    Group by: mutual_fund_name, investor_name
    """
    query = db.query(
        Transaction.mutual_fund_name,
        Transaction.investor_name,
        func.sum(Transaction.purchase_amount).label("total_amount_invested"),
        func.sum(Transaction.nav_units).label("total_nav_units")
    )
    
    query = apply_date_filters(query, Transaction, from_date, to_date)
    query = query.group_by(Transaction.mutual_fund_name, Transaction.investor_name)
    results = query.all()
    
    return [
        {
            "mutual_fund_name": r.mutual_fund_name,
            "investor_name": r.investor_name,
            "total_amount_invested": float(r.total_amount_invested or 0.0),
            "total_nav_units": float(r.total_nav_units or 0.0)
        }
        for r in results
    ]


def get_investors(db: Session, from_date: date = None, to_date: date = None):
    """
    3. Investor List with Purchase Details
    Returns: investor_name, pan_number, total_amount_invested, total_nav_units,
             number_of_funds, latest_transaction_date
    Group by: investor_name, pan_number
    """
    query = db.query(
        Transaction.investor_name,
        Transaction.pan_number,
        func.sum(Transaction.purchase_amount).label("total_amount_invested"),
        func.sum(Transaction.nav_units).label("total_nav_units"),
        func.count(func.distinct(Transaction.mutual_fund_name)).label("number_of_funds"),
        func.max(Transaction.transaction_date).label("latest_transaction_date")
    )

    query = apply_date_filters(query, Transaction, from_date, to_date)
    query = query.group_by(Transaction.investor_name, Transaction.pan_number)
    results = query.all()

    return [
        {
            "investor_name": r.investor_name,
            "pan_number": r.pan_number,
            "total_amount_invested": float(r.total_amount_invested or 0.0),
            "total_nav_units": float(r.total_nav_units or 0.0),
            "number_of_funds": int(r.number_of_funds or 0),
            "latest_transaction_date": r.latest_transaction_date
        }
        for r in results
    ]


def get_mutual_fund_summary(db: Session, from_date: date = None, to_date: date = None):
    """
    4. Mutual Fund Summary
    Returns: mutual_fund_name, total_amount_invested, total_nav_units, average_nav
    Formula: Average NAV = Total Amount Invested / Total NAV Units
    Group by: mutual_fund_name
    """
    query = db.query(
        Transaction.mutual_fund_name,
        func.sum(Transaction.purchase_amount).label("total_amount_invested"),
        func.sum(Transaction.nav_units).label("total_nav_units")
    )
    
    query = apply_date_filters(query, Transaction, from_date, to_date)
    query = query.group_by(Transaction.mutual_fund_name)
    results = query.all()
    
    summary_list = []
    for r in results:
        total_amt = float(r.total_amount_invested or 0.0)
        total_units = float(r.total_nav_units or 0.0)
        
        # Guard against division by zero (if total_units is 0 or negative)
        avg_nav = (total_amt / total_units) if total_units > 0 else 0.0
        
        summary_list.append({
            "mutual_fund_name": r.mutual_fund_name,
            "total_amount_invested": total_amt,
            "total_nav_units": total_units,
            "average_nav": avg_nav
        })
        
    return summary_list

def get_dashboard_stats(db: Session, from_date: date = None, to_date: date = None):
    """
    Compute global KPI statistics for the dashboard.
    Returns total investment, total NAV units, distinct investor count, distinct mutual fund count,
    weighted average NAV price, and total transaction count.
    """
    # Base aggregates
    agg_query = db.query(
        func.sum(Transaction.purchase_amount).label("total_investment"),
        func.sum(Transaction.nav_units).label("total_nav_units"),
        func.count(Transaction.id).label("total_transactions"),
    )
    agg_query = apply_date_filters(agg_query, Transaction, from_date, to_date)
    agg_result = agg_query.one()
    total_investment = float(agg_result.total_investment or 0.0)
    total_nav_units = float(agg_result.total_nav_units or 0.0)
    total_transactions = int(agg_result.total_transactions or 0)
    # Distinct counts
    investor_q = db.query(func.count(func.distinct(Transaction.pan_number)))
    fund_q = db.query(func.count(func.distinct(Transaction.mutual_fund_name)))
    investor_q = apply_date_filters(investor_q, Transaction, from_date, to_date)
    fund_q = apply_date_filters(fund_q, Transaction, from_date, to_date)
    total_investors = investor_q.scalar() or 0
    total_mutual_funds = fund_q.scalar() or 0
    # Average NAV price
    average_nav_price = (total_investment / total_nav_units) if total_nav_units > 0 else 0.0
    return {
        "total_investment": total_investment,
        "total_nav_units": total_nav_units,
        "total_investors": total_investors,
        "total_mutual_funds": total_mutual_funds,
        "average_nav_price": average_nav_price,
        "total_transactions": total_transactions,
    }



def get_transactions(
    db: Session,
    page: int = 1,
    size: int = 10,
    search: str = None,
    sort_by: str = "transaction_date",
    sort_order: str = "desc",
    from_date: date = None,
    to_date: date = None
):
    query = db.query(Transaction)
    
    # Filter by search term
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Transaction.investor_name.ilike(search_filter)) |
            (Transaction.mutual_fund_name.ilike(search_filter)) |
            (Transaction.pan_number.ilike(search_filter))
        )
    
    # Filter by dates
    query = apply_date_filters(query, Transaction, from_date, to_date)
    
    # Sorting
    if hasattr(Transaction, sort_by):
        col = getattr(Transaction, sort_by)
        if sort_order == "desc":
            query = query.order_by(col.desc())
        else:
            query = query.order_by(col.asc())
    else:
        query = query.order_by(Transaction.transaction_date.desc())
        
    # Count total records before pagination
    total_records = query.count()
    
    # Pagination
    offset = (page - 1) * size
    results = query.offset(offset).limit(size).all()
    
    total_pages = (total_records + size - 1) // size if size > 0 else 1
    
    return {
        "total_records": total_records,
        "total_pages": total_pages,
        "current_page": page,
        "page_size": size,
        "data": results
    }


def create_transaction(db: Session, transaction_data: schemas.TransactionCreate):
    db_transaction = Transaction(
        investor_name=transaction_data.investor_name,
        pan_number=transaction_data.pan_number,
        mutual_fund_name=transaction_data.mutual_fund_name,
        transaction_date=transaction_data.transaction_date,
        purchase_amount=transaction_data.purchase_amount,
        nav_units=transaction_data.nav_units,
        nav_price=transaction_data.nav_price
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False


def update_transaction(db: Session, transaction_id: int, transaction_data: schemas.TransactionUpdate):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        return None
    
    update_data = transaction_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

