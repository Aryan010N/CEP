from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    TicketAnalysisRequest,
    TicketAnalysisResponse,
    DeduplicationRequest,
    DeduplicationResponse,
    TicketVisionDiagnosisRequest,
    TicketVisionDiagnosisResponse
)
from app.services.gemini_service import (
    analyze_ticket_gemini,
    deduplicate_tickets_gemini,
    diagnose_image_gemini
)

router = APIRouter(prefix="/api/tickets", tags=["Tickets & AI"])

@router.post("/diagnose-image", response_model=TicketVisionDiagnosisResponse)
async def diagnose_ticket_image(payload: TicketVisionDiagnosisRequest):
    """
    Multimodal Gemini vision analysis: inspect an attached photo of a problem,
    and automatically extract title, detailed description, category, urgency,
    and recommended maintenance action so residents don't need to type manually.
    """
    try:
        result = await diagnose_image_gemini(
            image_base64=payload.image_base64,
            user_notes=payload.user_notes,
            wing=payload.wing,
            community_id=payload.community_id
        )
        return TicketVisionDiagnosisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to diagnose image: {str(e)}")


@router.post("/analyze", response_model=TicketAnalysisResponse)
async def analyze_ticket(payload: TicketAnalysisRequest):
    """
    Analyze resident complaint text using Gemini AI to automatically infer:
    - Problem Category (Electrical, Plumbing, Sanitation, General)
    - Urgency Level (Low, Medium, High)
    - Objective 1-2 sentence Summary
    - Suggested concrete Action
    - Optional Translation to English
    """
    try:
        result = await analyze_ticket_gemini(
            title=payload.title,
            description=payload.description,
            community_id=payload.community_id,
            wing=payload.wing
        )
        return TicketAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze ticket: {str(e)}")


@router.post("/deduplicate", response_model=DeduplicationResponse)
async def deduplicate_ticket(payload: DeduplicationRequest):
    """
    Check if a newly submitted complaint is semantically duplicate with
    any currently open tickets in the community to prevent flooding.
    """
    try:
        result = await deduplicate_tickets_gemini(
            new_complaint=payload.new_complaint,
            existing_complaints=payload.existing_complaints
        )
        return DeduplicationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check duplicate status: {str(e)}")
