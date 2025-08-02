from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List
import os
from dotenv import load_dotenv
import uuid
import aiofiles

# Import admin dashboard functions
from admin_dashboard import (
    get_admin_dashboard, 
    get_applications_list, 
    get_application_detail, 
    update_application_status
)

load_dotenv()

app = FastAPI(
    title="KamiKaya Pinjaman Online API",
    description="API untuk aplikasi pinjaman online KamiKaya",
    version="1.0.0"
)

# Templates setup
templates = Jinja2Templates(directory="templates")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.kamikaya_db

# Pydantic models
class LoanApplication(BaseModel):
    full_name: str
    nik: str
    phone: str
    email: EmailStr
    address: str
    occupation: str
    income: str
    loan_amount: int
    purpose: str
    status: str = "pending"
    created_at: datetime = datetime.now()

class LoanApplicationResponse(BaseModel):
    id: str
    full_name: str
    nik: str
    phone: str
    email: str
    address: str
    occupation: str
    income: str
    loan_amount: int
    purpose: str
    status: str
    created_at: datetime

# Routes
@app.get("/")
async def root():
    return {"message": "KamiKaya Pinjaman Online API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/loan/apply")
async def apply_for_loan(
    full_name: str = Form(...),
    nik: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    address: str = Form(...),
    occupation: str = Form(...),
    income: str = Form(...),
    loan_amount: int = Form(...),
    purpose: str = Form(...),
    ktp_file: UploadFile = File(...),
    selfie_file: UploadFile = File(...)
):
    try:
        # Generate unique ID for the application
        application_id = str(uuid.uuid4())
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save uploaded files
        ktp_filename = f"{application_id}_ktp_{ktp_file.filename}"
        selfie_filename = f"{application_id}_selfie_{selfie_file.filename}"
        
        ktp_path = os.path.join(upload_dir, ktp_filename)
        selfie_path = os.path.join(upload_dir, selfie_filename)
        
        async with aiofiles.open(ktp_path, 'wb') as f:
            content = await ktp_file.read()
            await f.write(content)
            
        async with aiofiles.open(selfie_path, 'wb') as f:
            content = await selfie_file.read()
            await f.write(content)
        
        # Create loan application document
        loan_application = {
            "_id": application_id,
            "full_name": full_name,
            "nik": nik,
            "phone": phone,
            "email": email,
            "address": address,
            "occupation": occupation,
            "income": income,
            "loan_amount": loan_amount,
            "purpose": purpose,
            "ktp_file_path": ktp_path,
            "selfie_file_path": selfie_path,
            "status": "pending",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Insert into MongoDB
        result = await db.loan_applications.insert_one(loan_application)
        
        if result.inserted_id:
            return {
                "success": True,
                "application_id": application_id,
                "message": "Pengajuan pinjaman berhasil disubmit. Tim kami akan menghubungi Anda dalam 1x24 jam.",
                "status": "pending"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to submit loan application")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing loan application: {str(e)}")

@app.get("/loan/applications")
async def get_loan_applications(skip: int = 0, limit: int = 10):
    try:
        cursor = db.loan_applications.find().skip(skip).limit(limit).sort("created_at", -1)
        applications = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for app in applications:
            app["id"] = app["_id"]
            del app["_id"]
            
        return {
            "success": True,
            "applications": applications,
            "total": await db.loan_applications.count_documents({})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loan applications: {str(e)}")

@app.get("/loan/application/{application_id}")
async def get_loan_application(application_id: str):
    try:
        application = await db.loan_applications.find_one({"_id": application_id})
        
        if not application:
            raise HTTPException(status_code=404, detail="Loan application not found")
            
        application["id"] = application["_id"]
        del application["_id"]
        
        return {
            "success": True,
            "application": application
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching loan application: {str(e)}")

@app.put("/loan/application/{application_id}/status")
async def update_loan_status(application_id: str, status: str = Form(...)):
    try:
        valid_statuses = ["pending", "approved", "rejected", "under_review"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
            
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
            raise HTTPException(status_code=404, detail="Loan application not found")
            
        return {
            "success": True,
            "message": f"Loan application status updated to {status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating loan status: {str(e)}")

@app.get("/stats")
async def get_application_stats():
    try:
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
        
        return {
            "success": True,
            "stats": {
                "total_applications": total_applications,
                "pending_applications": pending_applications,
                "approved_applications": approved_applications,
                "rejected_applications": rejected_applications,
                "total_loan_amount": total_loan_amount
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# Admin Dashboard Routes
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    return await get_admin_dashboard(request)

@app.get("/admin/applications", response_class=HTMLResponse) 
async def admin_applications_list(request: Request, status: Optional[str] = None, page: int = 1):
    return await get_applications_list(request, status, page)

@app.get("/admin/application/{application_id}", response_class=HTMLResponse)
async def admin_application_detail(request: Request, application_id: str):
    return await get_application_detail(request, application_id)

@app.post("/admin/application/{application_id}/status")
async def admin_update_status(request: Request, application_id: str, status: str = Form(...)):
    return await update_application_status(request, application_id, status)