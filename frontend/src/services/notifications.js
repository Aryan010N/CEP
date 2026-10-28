// Notification Dispatch Client for SMS (Twilio) and Email (Resend)

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Dispatch an SMS alert to authorities within 30s of Wing Rep verification
 */
export async function dispatchVerificationSMS({ toPhone, ticketId, title, wing, verifierName, urgency = "High" }) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notifications/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_phone: toPhone || '+91 98765 99999',
        message: `🚨 [CEP Observatory] URGENT ${urgency.toUpperCase()} Issue in ${wing}: "${title}" has been VERIFIED by ${verifierName} and escalated to Estate Admin for maintenance dispatch.`,
        ticket_id: ticketId,
        urgency: urgency
      })
    });
    
    if (!response.ok) {
      console.warn("SMS notification endpoint responded with status:", response.status);
      return { status: "simulated", simulated: true };
    }
    
    return await response.json();
  } catch (error) {
    console.warn("SMS dispatch fallback (backend offline or simulated):", error.message);
    return { status: "simulated", simulated: true };
  }
}

/**
 * Dispatch an Email alert for ticket status updates (In Progress, Resolved, etc.)
 */
export async function dispatchStatusEmail({ toEmail, ticketId, title, status, assignedWorker, notes }) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: toEmail,
        subject: `[Observatory Update] Ticket #${ticketId} status changed to ${status}`,
        template: 'ticket_status',
        details: {
          ticketId,
          title,
          status,
          assignedWorker: assignedWorker || 'General Maintenance Crew',
          notes: notes || 'Updated by Estate Admin',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      return { status: "simulated", simulated: true };
    }

    return await response.json();
  } catch (error) {
    console.warn("Email dispatch fallback (backend offline or simulated):", error.message);
    return { status: "simulated", simulated: true };
  }
}

