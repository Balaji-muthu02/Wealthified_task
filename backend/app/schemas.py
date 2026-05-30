from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field


class InvestorSummaryResponse(BaseModel):
    """Schema for Investor-wise Purchase Summary per Mutual Fund"""
    investor_name: str
    mutual_fund_name: str
    total_purchase_amount: float = Field(..., description="Total purchase amount in INR")
    total_nav_units: float = Field(..., description="Total NAV units purchased")

    class Config:
        from_attributes = True


class FundSummaryByInvestorResponse(BaseModel):
    """Schema for Mutual Fund-wise Summary per Investor"""
    mutual_fund_name: str
    investor_name: str
    total_amount_invested: float = Field(..., description="Total amount invested in INR")
    total_nav_units: float = Field(..., description="Total NAV units purchased")

    class Config:
        from_attributes = True


class InvestorListResponse(BaseModel):
    """Schema for Investor List with Purchase Details"""
    investor_name: str
    pan_number: str
    total_amount_invested: float = Field(..., description="Total amount invested in INR within date range")
    total_nav_units: float = Field(..., description="Total NAV units purchased within date range")
    number_of_funds: int = Field(..., description="Number of distinct mutual funds invested in")
    latest_transaction_date: date = Field(..., description="Date of the most recent transaction")

    class Config:
        from_attributes = True



class MutualFundSummaryResponse(BaseModel):
    """Schema for Mutual Fund Summary"""
    mutual_fund_name: str
    total_amount_invested: float = Field(..., description="Total amount invested across all investors")
    total_nav_units: float = Field(..., description="Total NAV units purchased across all investors")
    average_nav: float = Field(..., description="Weighted average NAV price: Total Amount / Total Units")

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    """Schema for creating a new transaction"""
    investor_name: str = Field(..., min_length=2, description="Full name of the investor")
    pan_number: str = Field(..., min_length=10, max_length=10, description="10-character PAN number")
    mutual_fund_name: str = Field(..., min_length=3, description="Name of the mutual fund")
    transaction_date: date = Field(..., description="Date of transaction (YYYY-MM-DD)")
    purchase_amount: float = Field(..., gt=0, description="Purchase amount in INR")
    nav_units: float = Field(..., gt=0, description="NAV units purchased")
    nav_price: Optional[float] = Field(None, description="NAV price per unit (optional)")


class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction"""
    investor_name: Optional[str] = None
    pan_number: Optional[str] = None
    mutual_fund_name: Optional[str] = None
    transaction_date: Optional[date] = None
    purchase_amount: Optional[float] = None
    nav_units: Optional[float] = None
    nav_price: Optional[float] = None


class TransactionResponse(BaseModel):
    """Detailed response schema for a single transaction"""
    id: int
    investor_name: str
    pan_number: str
    mutual_fund_name: str
    transaction_date: date
    purchase_amount: float
    nav_units: float
    nav_price: Optional[float] = None

    class Config:
        from_attributes = True


class PaginatedTransactionsResponse(BaseModel):
    """Paginated transactions list wrapper"""
    total_records: int
    total_pages: int
    current_page: int
    page_size: int
    data: List[TransactionResponse]

class DashboardStats(BaseModel):
    """Schema for global dashboard KPI statistics"""
    total_investment: float = Field(..., description="Sum of purchase_amount across all transactions")
    total_nav_units: float = Field(..., description="Sum of nav_units across all transactions")
    total_investors: int = Field(..., description="Count of distinct investors (by pan_number)")
    total_mutual_funds: int = Field(..., description="Count of distinct mutual funds")
    average_nav_price: float = Field(..., description="Weighted average NAV price: total investment / total_nav_units")
    total_transactions: int = Field(..., description="Total number of transaction records")

    class Config:
        from_attributes = True
