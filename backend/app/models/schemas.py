from typing import List, Optional, Union, Literal
from pydantic import BaseModel, Field

class TicketAnalysisRequest(BaseModel):
    title: str = Field(..., description="Short title of the complaint")
    description: str = Field(..., description="Detailed description of the complaint")
    community_id: Optional[str] = Field(None, description="Identifier for the community")
    wing: Optional[str] = Field(None, description="Wing or block of the resident")

class TicketAnalysisResponse(BaseModel):
    category: Literal["Electrical", "Plumbing", "Sanitation", "General"] = Field(
        ..., description="Classified category of the problem"
    )
    urgency: Literal["Low", "Medium", "High"] = Field(
        ..., description="Urgency priority level"
    )
    summary: str = Field(..., description="Concise 1-2 sentence objective summary of the issue")
    suggested_action: str = Field(..., description="Recommended initial action or personnel needed")
    translated_text: Optional[str] = Field(None, description="English translation if original was non-English")

class TicketVisionDiagnosisRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded photo of the defect or problem")
    user_notes: Optional[str] = Field("", description="Optional short notes provided by the user")
    wing: Optional[str] = Field("Wing A", description="Wing / block of the resident")
    community_id: Optional[str] = Field("comm_emerald_1", description="Community ID")

class TicketVisionDiagnosisResponse(BaseModel):
    title: str = Field(..., description="AI suggested problem title")
    description: str = Field(..., description="AI suggested problem description")
    category: Literal["Electrical", "Plumbing", "Sanitation", "General"] = Field(
        ..., description="Classified trade category"
    )
    urgency: Literal["Low", "Medium", "High"] = Field(
        ..., description="Urgency priority level"
    )
    suggested_action: str = Field(..., description="Actionable maintenance team instruction")

class ComplaintItem(BaseModel):
    ticket_id: Optional[str] = "TICK-PREV"
    text: str

class DeduplicationRequest(BaseModel):
    new_complaint: str = Field(..., description="Text of the newly submitted complaint")
    existing_complaints: List[Union[str, ComplaintItem]] = Field(
        default_factory=list, description="List of recent unresolved complaints"
    )

class DeduplicationResponse(BaseModel):
    is_duplicate: bool = Field(..., description="Whether the complaint duplicates an existing ticket")
    matched_ticket_id: Optional[str] = Field(None, description="Matched ticket ID if duplicate found")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    reasoning: Optional[str] = Field(None, description="Short explanation of why it was marked duplicate or unique")

class ReportGenerateRequest(BaseModel):
    community_name: Optional[str] = "Greenfield Community"
    tickets: List[dict] = Field(default_factory=list, description="List of raw ticket dicts")

class ReportGenerateResponse(BaseModel):
    executive_summary: str
    total_tickets: int
    critical_issues_count: int
    top_categories: List[dict]
    action_items: List[str]
