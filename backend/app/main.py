import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.tickets import router as tickets_router
from app.api.reports import router as reports_router
from app.services.gemini_service import GEMINI_API_KEY, gemini_model

app = FastAPI(
    title="AI Community Digital Problem Observatory API",
    description="Intelligent Backend powering Complaint Routing, Auto-Categorization, Deduplication, and NGO Challenge Tracking.",
    version="1.0.0"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(tickets_router)
app.include_router(reports_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "AI Community Digital Problem Observatory",
        "version": "1.0.0",
        "gemini_active": bool(GEMINI_API_KEY and gemini_model),
        "endpoints": {
            "analyze_ticket": "POST /api/tickets/analyze",
            "deduplicate_ticket": "POST /api/tickets/deduplicate",
            "generate_report": "POST /api/reports/generate",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_engine": "Active (Google Gemini 1.5 Flash)" if (GEMINI_API_KEY and gemini_model) else "Heuristic Fallback Engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
