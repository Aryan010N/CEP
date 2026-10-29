// Notification Dispatch Client for WhatsApp (Twilio) and Email (Resend)
import { getBackendUrl } from './firebase';

const getBaseUrl = () => {
  return getBackendUrl();
};

/**
 * Dispatch an automated WhatsApp alert to authorities within 30s of Wing Rep verification
 */
export async function dispatchVerificationAlert({ toPhone, ticketId, title, wing, verifierName, urgency = "High" }) {
  const BACKEND_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${BACKEND_URL}/api/notifications/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_phone: toPhone || '+91 98765 99999',
        message: `🚨 [CEP Observatory] URGENT ${urgency.toUpperCase()} Issue in ${wing}: "${title}" has been VERIFIED by ${verifierName} and escalated to Estate Admin for maintenance dispatch.`,
        ticket_id: ticketId,
        urgency: urgency,
        channel: 'whatsapp'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn("WhatsApp notification endpoint responded with status:", response.status);
      return { status: "simulated", simulated: true };
    }
    
    return await response.json();
  } catch (error) {
    console.warn("WhatsApp dispatch notice (backend offline or simulated):", error?.message);
    return { status: "simulated", simulated: true };
  }
}

// Backwards-compatible aliases
export const dispatchVerificationSMS = dispatchVerificationAlert;
export const dispatchVerificationWhatsApp = dispatchVerificationAlert;

/**
 * Dispatch an Email alert for ticket status updates (In Progress, Resolved, etc.)
 */
export async function dispatchStatusEmail({ toEmail, ticketId, title, status, assignedWorker, notes }) {
  const BACKEND_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { status: "simulated", simulated: true };
    }

    return await response.json();
  } catch (error) {
    console.warn("Email dispatch notice (backend offline or simulated):", error?.message);
    return { status: "simulated", simulated: true };
  }
}
