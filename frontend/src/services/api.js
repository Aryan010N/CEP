// API Service connecting to FastAPI AI Backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

/**
 * Call Gemini AI Backend to analyze ticket title and description
 */
export async function analyzeTicketAI({ title, description, community_id, wing }) {
  try {
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
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Backend API unavailable or erroring, utilizing intelligent client-side fallback:", err);
    // Intelligent local fallback if python server isn't running
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
  try {
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
    });

    if (!response.ok) {
      throw new Error(`Deduplication API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Backend API unavailable, using client-side fallback deduplication:", err);
    // Simple client fallback
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
      matched_ticket_id: null,
      confidence: 0.0,
      reasoning: "No duplicate complaints detected among active tickets."
    };
  }
}

/**
 * Request AI executive summary for Admin Dashboard
 */
export async function generateAdminReportAI(communityName, tickets) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        community_name: communityName,
        tickets: tickets
      }),
    });

    if (!response.ok) {
      throw new Error(`Report API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Report backend API fallback:", err);
    const critical = tickets.filter(t => t.urgency === 'High').length;
    return {
      executive_summary: `AI Observatory briefing for ${communityName}: Tracking ${tickets.length} total tickets with ${critical} critical high-urgency items currently active.`,
      total_tickets: tickets.length,
      critical_issues_count: critical,
      top_categories: [
        { category: "Electrical", count: tickets.filter(t => t.category === "Electrical").length },
        { category: "Plumbing", count: tickets.filter(t => t.category === "Plumbing").length },
        { category: "Sanitation", count: tickets.filter(t => t.category === "Sanitation").length },
        { category: "General", count: tickets.filter(t => t.category === "General").length }
      ],
      action_items: [
        "Escalate pending high-urgency tickets to emergency technician crew.",
        "Ensure Wing Representatives verify all unreviewed submissions within 2 hours.",
        "Promote NGO challenges on social impact boards."
      ]
    };
  }
}
