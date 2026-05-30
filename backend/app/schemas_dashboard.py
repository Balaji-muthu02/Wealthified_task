from pydantic import BaseModel, Field

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
