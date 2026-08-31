from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportGenerateRequest, ReportGenerateResponse
from app.services.gemini_service import generate_executive_report_gemini

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.post("/generate", response_model=ReportGenerateResponse)
async def generate_report(payload: ReportGenerateRequest):
    """
    Generate an AI-powered executive briefing and breakdown of complaints for Estate Managers and Wardens.
    """
    try:
        result = await generate_executive_report_gemini(
            community_name=payload.community_name or "Community",
            tickets=payload.tickets
        )
        return ReportGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
