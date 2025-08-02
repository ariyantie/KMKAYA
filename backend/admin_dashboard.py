from fastapi import FastAPI, Request, Form, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from typing import Optional

# Templates setup
templates = Jinja2Templates(directory="templates")

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.kamikaya_db

# Admin routes
async def get_admin_dashboard(request: Request):
    """Dashboard utama admin"""
    try:
        # Get statistics
        total_applications = await db.loan_applications.count_documents({})
        pending_applications = await db.loan_applications.count_documents({"status": "pending"})
        approved_applications = await db.loan_applications.count_documents({"status": "approved"})
        rejected_applications = await db.loan_applications.count_documents({"status": "rejected"})
        
        # Calculate total loan amount
        pipeline = [
            {"$group": {"_id": None, "total_amount": {"$sum": "$loan_amount"}}}
        ]
        result = await db.loan_applications.aggregate(pipeline).to_list(1)
        total_loan_amount = result[0]["total_amount"] if result else 0
        
        # Get recent applications
        cursor = db.loan_applications.find().sort("created_at", -1).limit(10)
        recent_applications = await cursor.to_list(length=10)
        
        # Format currency
        def format_currency(amount):
            return f"Rp {amount:,}".replace(",", ".")
        
        context = {
            "request": request,
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "approved_applications": approved_applications,
            "rejected_applications": rejected_applications,
            "total_loan_amount": format_currency(total_loan_amount),
            "recent_applications": recent_applications,
            "format_currency": format_currency
        }
        
        return templates.TemplateResponse("admin_dashboard.html", context)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dashboard: {str(e)}")

async def get_applications_list(request: Request, status: Optional[str] = None, page: int = 1):
    """List semua aplikasi pinjaman dengan filter dan pagination"""
    try:
        limit = 20
        skip = (page - 1) * limit
        
        # Build filter
        filter_query = {}
        if status and status != "all":
            filter_query["status"] = status
            
        # Get applications
        cursor = db.loan_applications.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        applications = await cursor.to_list(length=limit)
        
        # Get total count for pagination
        total_count = await db.loan_applications.count_documents(filter_query)
        total_pages = (total_count + limit - 1) // limit
        
        # Format currency
        def format_currency(amount):
            return f"Rp {amount:,}".replace(",", ".")
            
        context = {
            "request": request,
            "applications": applications,
            "current_status": status or "all",
            "current_page": page,
            "total_pages": total_pages,
            "total_count": total_count,
            "format_currency": format_currency,
            "has_prev": page > 1,
            "has_next": page < total_pages,
            "prev_page": page - 1 if page > 1 else 1,
            "next_page": page + 1 if page < total_pages else total_pages
        }
        
        return templates.TemplateResponse("applications_list.html", context)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading applications: {str(e)}")

async def get_application_detail(request: Request, application_id: str):
    """Detail aplikasi pinjaman"""
    try:
        application = await db.loan_applications.find_one({"_id": application_id})
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
            
        # Format currency
        def format_currency(amount):
            return f"Rp {amount:,}".replace(",", ".")
            
        context = {
            "request": request,
            "application": application,
            "format_currency": format_currency
        }
        
        return templates.TemplateResponse("application_detail.html", context)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading application: {str(e)}")

async def update_application_status(request: Request, application_id: str, status: str = Form(...)):
    """Update status aplikasi pinjaman"""
    try:
        valid_statuses = ["pending", "approved", "rejected", "under_review"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
            
        result = await db.loan_applications.update_one(
            {"_id": application_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
            
        return RedirectResponse(url=f"/admin/application/{application_id}", status_code=302)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

# Utility functions for templates
def get_status_color(status):
    """Get color class for status"""
    colors = {
        "pending": "bg-yellow-100 text-yellow-800",
        "approved": "bg-green-100 text-green-800", 
        "rejected": "bg-red-100 text-red-800",
        "under_review": "bg-blue-100 text-blue-800"
    }
    return colors.get(status, "bg-gray-100 text-gray-800")

def get_status_label(status):
    """Get Indonesian label for status"""
    labels = {
        "pending": "Menunggu",
        "approved": "Disetujui",
        "rejected": "Ditolak", 
        "under_review": "Sedang Ditinjau"
    }
    return labels.get(status, status)