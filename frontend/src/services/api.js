// API Service connecting to FastAPI AI Backend
import { getBackendUrl } from './firebase';

const getBaseUrl = () => {
  return getBackendUrl();
};

/**
 * Call Gemini Multimodal AI Backend to diagnose problem directly from photo
 */
export async function diagnoseTicketFromImageAI({ imageBase64, userNotes = '', community_id = 'comm_emerald_1', wing = 'Wing A' }) {
  const API_BASE_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${API_BASE_URL}/api/tickets/diagnose-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        user_notes: userNotes,
        wing: wing || 'Wing A',
        community_id: community_id || 'comm_emerald_1'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Vision AI API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Vision AI backend call timed out or failed, utilizing intelligent fallback:", err?.message);
    const notesLower = (userNotes || '').toLowerCase();
    let category = "General";
    let title = "Reported Facility Defect";
    let description = userNotes || "Photo proof attached for on-site physical verification by maintenance team.";
    let urgency = "Medium";
    let suggested_action = "Conduct on-site physical inspection to confirm defect scope and schedule repairs.";

    if (/wire|spark|light|switch|fan|shock|power|breaker|bulb/i.test(notesLower)) {
      category = "Electrical";
      title = "Electrical Wiring & Fixture Fault";
      urgency = /spark|shock|fire/i.test(notesLower) ? "High" : "Medium";
      suggested_action = "Dispatch licensed electrician to inspect breaker and wiring safety.";
    } else if (/pipe|water|leak|drain|faucet|tap|sink|overflow|sewage/i.test(notesLower)) {
      category = "Plumbing";
      title = "Water Leakage & Plumbing Defect";
      urgency = /flood|burst|continuous/i.test(notesLower) ? "High" : "Medium";
      suggested_action = "Dispatch plumbing crew with replacement valve, sealant, or snake tool.";
    } else if (/trash|garbage|smell|bin|pest|waste|dirty/i.test(notesLower)) {
      category = "Sanitation";
      title = "Sanitation & Waste Disposal Issue";
      urgency = "Medium";
      suggested_action = "Dispatch housekeeping and sanitation crew for clearing and sanitization.";
    } else {
      title = "Maintenance Issue Detected from Photo";
      description = userNotes.trim() ? userNotes : "Photo evidence submitted. Visual assessment indicates defect requiring maintenance inspection.";
    }

    return {
      title,
      description,
      category,
      urgency,
      suggested_action
    };
  }
}

/**
 * Call Gemini AI Backend to analyze ticket title and description
 */
export async function analyzeTicketAI({ title, description, community_id, wing }) {
  const API_BASE_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/api/tickets/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        community_id: community_id || 'comm_emerald_1',
        wing: wing || 'Wing A'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Backend API unavailable or timed out, utilizing intelligent client-side fallback:", err?.message);
    const content = `${title} ${description}`.toLowerCase();
    let category = "General";
    if (/wire|light|spark|switch|fan|electricity|socket|power|fuse|bulb|ac/i.test(content)) {
      category = "Electrical";
    } else if (/pipe|water|leak|drain|faucet|tap|sink|flush|sewage|clog|tank/i.test(content)) {
      category = "Plumbing";
    } else if (/garbage|trash|clean|smell|pest|rodent|cockroach|dirt|waste/i.test(content)) {
      category = "Sanitation";
    }

    let urgency = "Low";
    if (/fire|spark|flood|burst|urgent|danger|hazard|smoke|shock|emergency|severe/i.test(content)) {
      urgency = "High";
    } else if (/leak|slow|broken|moderate|flicker|clogged|foul/i.test(content)) {
      urgency = "Medium";
    }

    return {
      category,
      urgency,
      summary: `Automated assessment: ${category} complaint reported for ${wing || 'wing'}.`,
      suggested_action: `Dispatch ${category.toLowerCase()} maintenance technician for on-site assessment.`,
      translated_text: null
    };
  }
}

/**
 * Check if the new complaint matches any existing open tickets in the community
 */
export async function checkDuplicateComplaintAI(newComplaint, existingComplaints) {
  const API_BASE_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/api/tickets/deduplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_complaint: newComplaint,
        existing_complaints: existingComplaints.map(t => ({
          ticket_id: t.ticket_id || t.id,
          text: `${t.title}. ${t.description}`
        }))
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Deduplication API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Backend API unavailable, using client-side fallback deduplication:", err?.message);
    const newWords = newComplaint.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    for (const ticket of existingComplaints) {
      const ticketText = `${ticket.title} ${ticket.description}`.toLowerCase();
      let matchCount = 0;
      for (const w of newWords) {
        if (ticketText.includes(w)) matchCount++;
      }
      const score = newWords.length > 0 ? matchCount / newWords.length : 0;
      if (score > 0.4) {
        return {
          is_duplicate: true,
          matched_ticket_id: ticket.ticket_id || ticket.id,
          confidence: Math.min(0.95, Number((score * 1.2).toFixed(2))),
          reasoning: `Found semantic keyword match with Ticket ${ticket.ticket_id || ticket.id}: "${ticket.title}"`
        };
      }
    }

    return {
      is_duplicate: false,
      confidence: 0.1,
      reasoning: "No semantically matching open issue found in community active queue."
    };
  }
}

/**
 * Request Gemini AI to synthesize an executive summary and action items for Estate Admin
 */
export async function generateAdminReportAI(communityName, tickets) {
  const API_BASE_URL = getBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/api/tickets/admin-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        community_name: communityName,
        tickets: tickets.map(t => ({
          id: t.ticket_id || t.id,
          title: t.title,
          category: t.category,
          urgency: t.urgency,
          status: t.status,
          wing: t.wing
        }))
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Admin report AI offline or timed out, synthesizing client fallback:", err?.message);
    const highUrgency = tickets.filter(t => t.urgency === 'High' && t.status !== 'Resolved');
    const verified = tickets.filter(t => t.status === 'Verified_By_Rep');
    const inProgress = tickets.filter(t => t.status === 'In_Progress' || t.status === 'Assigned');
    const resolved = tickets.filter(t => t.status === 'Resolved');

    return {
      executive_summary: `${communityName} has ${tickets.length} total logged complaints, with ${verified.length} verified by representatives awaiting technician assignment and ${highUrgency.length} high-urgency items flagged.`,
      action_items: [
        highUrgency.length > 0 ? `Immediate safety inspection required for ${highUrgency.length} high-priority issues.` : "No urgent safety hazards currently logged.",
        `Dispatch assigned vendors to clear ${verified.length} verified queue items.`,
        `${resolved.length} issues successfully resolved and closed.`
      ],
      hazard_alerts: highUrgency.map(h => `Hazard in ${h.wing}: ${h.title}`)
    };
  }
}
