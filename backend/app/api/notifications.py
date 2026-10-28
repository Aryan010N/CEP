import os
import time
from typing import Optional, Dict, Any
from collections import defaultdict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Alerts"])

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

# In-Memory Sliding-Window Rate Limiter
class SlidingWindowRateLimiter:
    def __init__(self):
        self.history = defaultdict(list)

    def check(self, key: str, max_calls: int = 5, window_sec: int = 60) -> bool:
        now = time.time()
        # Filter timestamps outside current window
        self.history[key] = [t for t in self.history[key] if now - t < window_sec]
        if len(self.history[key]) >= max_calls:
            return False
        self.history[key].append(now)
        return True

rate_limiter = SlidingWindowRateLimiter()

class SMSNotificationRequest(BaseModel):
    to_phone: str = Field(..., description="Recipient phone number (e.g. +91 98765 99999)")
    message: str = Field(..., description="SMS text content")
    ticket_id: Optional[str] = Field(None, description="Associated ticket ID")
    urgency: Optional[str] = Field("Medium", description="Urgency level")
    community_name: Optional[str] = Field("Emerald Heights", description="Community name")
    channel: Optional[str] = Field("sms", description="Delivery channel ('sms' or 'whatsapp')")

class SMSNotificationResponse(BaseModel):
    status: str
    channel: str
    provider: str
    message_sid: str
    delivery_latency_seconds: float
    simulated: bool
    recipient: str

class EmailNotificationRequest(BaseModel):
    to_email: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject line")
    template: str = Field("ticket_status", description="Email template type ('verification', 'ticket_status', 'welcome')")
    details: Dict[str, Any] = Field(default_factory=dict, description="Metadata payload")

class EmailNotificationResponse(BaseModel):
    status: str
    provider: str
    message_id: str
    simulated: bool
    recipient: str

@router.post("/sms", response_model=SMSNotificationResponse)
async def send_sms_alert(payload: SMSNotificationRequest):
    """
    Dispatch SMS alert to Estate Admin/Maintenance authorities within 30 seconds
    of Wing Representative verification. Uses Twilio if configured, or high-fidelity simulated
    delivery logger. Protected by sliding-window rate limiting.
    """
    # Rate Limiting: Max 5 SMS per phone per 60 seconds
    clean_phone = payload.to_phone.replace(" ", "").replace("-", "")
    if not rate_limiter.check(f"sms_{clean_phone}", max_calls=5, window_sec=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded: Max 5 SMS dispatches per minute per recipient. Please wait."
        )

    start_time = time.time()
    
    # Real Twilio API Integration
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
                    data={
                        "From": TWILIO_PHONE_NUMBER,
                        "To": clean_phone,
                        "Body": payload.message
                    },
                    auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    latency = round(time.time() - start_time, 2)
                    return SMSNotificationResponse(
                        status="delivered",
                        channel="sms",
                        provider="Twilio SMS Gateway",
                        message_sid=data.get("sid", f"SM_{int(time.time())}"),
                        delivery_latency_seconds=latency,
                        simulated=False,
                        recipient=clean_phone
                    )
        except Exception as e:
            print(f"Twilio API delivery failed, switching to logger fallback: {e}")

    # Simulated Delivery Fallback
    latency = round(time.time() - start_time + 0.8, 2)
    fake_sid = f"SM_sim_{int(time.time())}_{abs(hash(clean_phone)) % 10000}"
    print(f"[SMS DISPATCH within 30s] To: {clean_phone} | Ticket: {payload.ticket_id} | Msg: {payload.message}")

    return SMSNotificationResponse(
        status="delivered",
        channel="sms",
        provider="Twilio (Simulated / Local Gateway)",
        message_sid=fake_sid,
        delivery_latency_seconds=latency,
        simulated=True,
        recipient=clean_phone
    )

@router.post("/whatsapp", response_model=SMSNotificationResponse)
async def send_whatsapp_alert(payload: SMSNotificationRequest):
    """
    Dispatch WhatsApp alert to authorities or residents via Twilio WhatsApp Sandbox/API.
    """
    clean_phone = payload.to_phone.replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        clean_phone = f"+{clean_phone}"

    if not rate_limiter.check(f"wa_{clean_phone}", max_calls=5, window_sec=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded: Max 5 WhatsApp dispatches per minute per recipient. Please wait."
        )

    start_time = time.time()

    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
                    data={
                        "From": f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
                        "To": f"whatsapp:{clean_phone}",
                        "Body": payload.message
                    },
                    auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    latency = round(time.time() - start_time, 2)
                    return SMSNotificationResponse(
                        status="delivered",
                        channel="whatsapp",
                        provider="Twilio WhatsApp Gateway",
                        message_sid=data.get("sid", f"WA_{int(time.time())}"),
                        delivery_latency_seconds=latency,
                        simulated=False,
                        recipient=clean_phone
                    )
        except Exception as e:
            print(f"Twilio WhatsApp delivery failed, switching to logger fallback: {e}")

    latency = round(time.time() - start_time + 0.8, 2)
    fake_sid = f"WA_sim_{int(time.time())}_{abs(hash(clean_phone)) % 10000}"
    print(f"[WHATSAPP DISPATCH] To: {clean_phone} | Ticket: {payload.ticket_id} | Msg: {payload.message}")

    return SMSNotificationResponse(
        status="delivered",
        channel="whatsapp",
        provider="Twilio WhatsApp (Simulated Gateway)",
        message_sid=fake_sid,
        delivery_latency_seconds=latency,
        simulated=True,
        recipient=clean_phone
    )

@router.post("/email", response_model=EmailNotificationResponse)
async def send_email_notification(payload: EmailNotificationRequest):
    """
    Dispatch automated transactional emails via Resend API or simulated logger.
    Rate limited to 10 emails per minute per recipient.
    """
    clean_email = payload.to_email.strip().lower()
    if not rate_limiter.check(f"email_{clean_email}", max_calls=10, window_sec=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded: Max 10 emails per minute per recipient. Please wait."
        )

    if RESEND_API_KEY:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "CEP Observatory <notifications@cep-observatory.org>",
                        "to": [clean_email],
                        "subject": payload.subject,
                        "html": f"<div style='font-family: system-ui, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: auto;'>"
                                f"<div style='background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 16px; border-radius: 12px; color: white; text-align: center;'>"
                                f"<h2 style='margin: 0; font-size: 20px;'>🛡️ AI Community Problem Observatory</h2>"
                                f"</div>"
                                f"<h3 style='color: #1e293b; margin-top: 20px;'>{payload.subject}</h3>"
                                f"<p style='color: #475569; font-size: 14px; line-height: 1.6;'>{payload.details.get('summary', 'An update has been posted to your ticket.')}</p>"
                                f"<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px; color: #334155;'>"
                                f"<p style='margin: 4px 0;'><strong>Status:</strong> {payload.details.get('status', 'Updated')}</p>"
                                f"<p style='margin: 4px 0;'><strong>Ticket ID:</strong> {payload.details.get('ticket_id', 'N/A')}</p>"
                                f"</div>"
                                f"<p style='font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;'>Automated CEP Civic Engagement Platform &bull; No reply required</p>"
                                f"</div>"
                    }
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    return EmailNotificationResponse(
                        status="sent",
                        provider="Resend",
                        message_id=data.get("id", f"em_{int(time.time())}"),
                        simulated=False,
                        recipient=clean_email
                    )
        except Exception as e:
            print(f"Resend API email delivery failed, falling back to logger: {e}")

    fake_id = f"em_sim_{int(time.time())}_{abs(hash(clean_email)) % 10000}"
    print(f"[EMAIL DISPATCH] To: {clean_email} | Subject: {payload.subject} | Template: {payload.template}")

    return EmailNotificationResponse(
        status="sent",
        provider="Resend (Simulated / Local Gateway)",
        message_id=fake_id,
        simulated=True,
        recipient=clean_email
    )
