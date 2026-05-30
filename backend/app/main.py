from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import investors, funds, transactions, dashboard, export

# Automatically create database tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables automatically (DB might not be ready yet): {e}")

# Initialize FastAPI App
app = FastAPI(
    title="Mutual Fund Transaction Dashboard API",
    description="API backend for summarizing and filtering mutual fund transactions.",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(investors.router)
app.include_router(funds.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(export.router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Mutual Fund Transaction Dashboard API!",
        "docs": "/docs"
    }
