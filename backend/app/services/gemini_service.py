import os
import json
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv(encoding='utf-8')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize client if library is available
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-flash-lite-latest")
    except Exception as e:
        print(f"Warning: Failed to initialize Google Generative AI client: {e}")


def _clean_json_string(text: str) -> str:
    """Strip markdown code fences and clean up text for JSON decoding."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


def _heuristic_classify_ticket(title: str, description: str) -> Dict[str, Any]:
    """Reliable fallback heuristic classifier if Gemini API is unavailable."""
    content = f"{title} {description}".lower()
    
    # Category detection
    if any(k in content for k in ["wire", "light", "spark", "switch", "fan", "electricity", "socket", "power", "fuse", "short circuit", "voltage", "bulb", "ac", "geyser"]):
        category = "Electrical"
    elif any(k in content for k in ["pipe", "water", "leak", "drain", "faucet", "tap", "sink", "flush", "sewage", "clog", "overflow", "shower", "tank"]):
        category = "Plumbing"
    elif any(k in content for k in ["garbage", "trash", "clean", "smell", "pest", "rodent", "cockroach", "dirt", "dustbin", "waste", "stagnant"]):
        category = "Sanitation"
    else:
        category = "General"

    # Urgency detection
    if any(k in content for k in ["fire", "spark", "flood", "burst", "urgent", "danger", "hazard", "smoke", "shock", "emergency", "immediately", "severe"]):
        urgency = "High"
    elif any(k in content for k in ["leak", "slow", "broken", "moderate", "flicker", "clogged", "foul", "frequent"]):
        urgency = "Medium"
    else:
        urgency = "Low"

    # Suggested action
    actions = {
        "Electrical": "Dispatch licensed electrician to inspect wiring, switchboard, and breaker safety.",
        "Plumbing": "Dispatch plumbing maintenance staff with pipe sealant, replacement valve, or snake tool.",
        "Sanitation": "Schedule housekeeping and sanitization crew for immediate deep cleaning and pest control.",
        "General": "Notify facility maintenance coordinator to inspect site and schedule general upkeep."
    }

    return {
        "category": category,
        "urgency": urgency,
        "summary": f"{category} issue reported: {title.strip()}.",
        "suggested_action": actions.get(category, "Review ticket with maintenance supervisor."),
        "translated_text": None
    }


def _heuristic_deduplicate(new_complaint: str, existing_complaints: List[Any]) -> Dict[str, Any]:
    """Fast lexical similarity matcher fallback."""
    new_words = set(re.findall(r"\w+", new_complaint.lower()))
    if not new_words:
        return {"is_duplicate": False, "matched_ticket_id": None, "confidence": 0.0, "reasoning": "Complaint text was empty."}

    best_match_id = None
    max_overlap = 0.0
    matched_text = ""

    for item in existing_complaints:
        if isinstance(item, dict):
            item_text = item.get("text", "") or item.get("description", "") or item.get("title", "")
            item_id = item.get("ticket_id", item.get("id", "TICK-PREV"))
        elif hasattr(item, "text"):
            item_text = item.text
            item_id = getattr(item, "ticket_id", "TICK-PREV")
        else:
            item_text = str(item)
            item_id = "TICK-PREV"

        item_words = set(re.findall(r"\w+", item_text.lower()))
        if not item_words:
            continue

        intersection = len(new_words.intersection(item_words))
        union = len(new_words.union(item_words))
        jaccard = intersection / union if union > 0 else 0

        if jaccard > max_overlap:
            max_overlap = jaccard
            best_match_id = item_id
            matched_text = item_text

    is_duplicate = max_overlap >= 0.45
    return {
        "is_duplicate": is_duplicate,
        "matched_ticket_id": best_match_id if is_duplicate else None,
        "confidence": round(float(max_overlap), 2),
        "reasoning": f"Found {int(max_overlap*100)}% keyword similarity with existing report: '{matched_text[:60]}...'" if is_duplicate else "No high-confidence semantic match among active complaints."
    }


async def analyze_ticket_gemini(title: str, description: str, community_id: Optional[str] = None, wing: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a community ticket using Gemini AI.
    Classifies Category, Urgency, generates Summary, Suggested Action, and translates if non-English.
    """
    if not gemini_model:
        return _heuristic_classify_ticket(title, description)

    prompt = f"""
You are the AI Engine of the Community Digital Problem Observatory.
Analyze the following resident complaint and return a strictly valid JSON object with NO additional text or formatting.

Title: {title}
Description: {description}
Community Context: Wing {wing or 'General'}, ID: {community_id or 'General'}

Response Schema (Strict JSON):
{{
  "category": "Electrical" | "Plumbing" | "Sanitation" | "General",
  "urgency": "Low" | "Medium" | "High",
  "summary": "<1-2 sentence professional concise summary of the core defect>",
  "suggested_action": "<concrete next step or personnel to dispatch>",
  "translated_text": "<English translation if the complaint was in Hindi, Spanish, or another language, otherwise null>"
}}
"""
    try:
        response = gemini_model.generate_content(prompt)
        cleaned = _clean_json_string(response.text)
        data = json.loads(cleaned)

        # Enforce valid values
        valid_cats = ["Electrical", "Plumbing", "Sanitation", "General"]
        valid_urg = ["Low", "Medium", "High"]
        
        category = data.get("category", "General")
        if category not in valid_cats:
            category = "General"
            
        urgency = data.get("urgency", "Medium")
        if urgency not in valid_urg:
            urgency = "Medium"

        return {
            "category": category,
            "urgency": urgency,
            "summary": data.get("summary", title),
            "suggested_action": data.get("suggested_action", "Assign to maintenance personnel."),
            "translated_text": data.get("translated_text")
        }
    except Exception as e:
        print(f"Gemini API call failed, using heuristic fallback: {e}")
        return _heuristic_classify_ticket(title, description)


async def deduplicate_tickets_gemini(new_complaint: str, existing_complaints: List[Any]) -> Dict[str, Any]:
    """
    Check if a new complaint duplicates existing unresolved complaints using Gemini semantic embeddings/prompt.
    """
    if not existing_complaints:
        return {
            "is_duplicate": False,
            "matched_ticket_id": None,
            "confidence": 0.0,
            "reasoning": "No existing unresolved complaints to compare against."
        }

    if not gemini_model:
        return _heuristic_deduplicate(new_complaint, existing_complaints)

    formatted_list = []
    for idx, item in enumerate(existing_complaints):
        if isinstance(item, dict):
            t_id = item.get("ticket_id", item.get("id", f"TICK-{idx+1}"))
            text = item.get("text", "") or item.get("description", "") or item.get("title", "")
        elif hasattr(item, "text"):
            t_id = getattr(item, "ticket_id", f"TICK-{idx+1}")
            text = item.text
        else:
            t_id = f"TICK-{idx+1}"
            text = str(item)
        formatted_list.append(f"- ID [{t_id}]: {text}")

    existing_str = "\n".join(formatted_list)

    prompt = f"""
You are the Deduplication AI of the Community Digital Problem Observatory.
Determine if the NEW complaint describes the exact same physical issue or problem as any of the EXISTING unresolved tickets.

NEW COMPLAINT:
"{new_complaint}"

EXISTING UNRESOLVED COMPLAINTS:
{existing_str}

Evaluate if there is semantic duplication (e.g. "elevator in wing A stopped" vs "lift 1 stuck on 4th floor wing A").
Return ONLY a valid JSON object:
{{
  "is_duplicate": true | false,
  "matched_ticket_id": "<ID of matching ticket or null>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<1 sentence explanation>"
}}
"""
    try:
        response = gemini_model.generate_content(prompt)
        cleaned = _clean_json_string(response.text)
        data = json.loads(cleaned)
        return {
            "is_duplicate": bool(data.get("is_duplicate", False)),
            "matched_ticket_id": data.get("matched_ticket_id"),
            "confidence": float(data.get("confidence", 0.0)),
            "reasoning": data.get("reasoning", "Semantic comparison completed.")
        }
    except Exception as e:
        print(f"Gemini Deduplication failed, using heuristic: {e}")
        return _heuristic_deduplicate(new_complaint, existing_complaints)


async def generate_executive_report_gemini(community_name: str, tickets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate high-level administrative intelligence briefing for Estate Admins."""
    total = len(tickets)
    critical_count = sum(1 for t in tickets if str(t.get("urgency", "")).lower() == "high")
    
    categories_count: Dict[str, int] = {}
    for t in tickets:
        cat = t.get("category", "General")
        categories_count[cat] = categories_count.get(cat, 0) + 1

    top_categories = [{"category": k, "count": v} for k, v in sorted(categories_count.items(), key=lambda x: x[1], reverse=True)]

    if not gemini_model or total == 0:
        return {
            "executive_summary": f"Observatory report for {community_name}: Total {total} active tickets tracked. {critical_count} marked high priority requiring immediate supervisory attention.",
            "total_tickets": total,
            "critical_issues_count": critical_count,
            "top_categories": top_categories,
            "action_items": [
                "Deploy emergency maintenance to high-urgency tickets immediately.",
                "Review Wing Representative verification backlogs.",
                "Allocate weekly budget to top recurring category."
            ]
        }

    ticket_summaries = "\n".join([f"- [{t.get('category')}] (Urgency: {t.get('urgency')}, Wing: {t.get('wing', 'N/A')}): {t.get('title', '')} - {t.get('description', '')[:80]}" for t in tickets[:15]])

    prompt = f"""
Generate an executive management report for community "{community_name}".
Active tickets:
{ticket_summaries}

Return ONLY valid JSON:
{{
  "executive_summary": "<3 sentence summary highlighting key infrastructural vulnerabilities and resolution velocity>",
  "action_items": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ]
}}
"""
    try:
        response = gemini_model.generate_content(prompt)
        cleaned = _clean_json_string(response.text)
        data = json.loads(cleaned)
        return {
            "executive_summary": data.get("executive_summary", f"Community report generated for {community_name}."),
            "total_tickets": total,
            "critical_issues_count": critical_count,
            "top_categories": top_categories,
            "action_items": data.get("action_items", ["Prioritize high-urgency tickets."])
        }
    except Exception as e:
        print(f"Gemini Report Gen failed: {e}")
        return {
            "executive_summary": f"Observatory report for {community_name}: Total {total} active tickets tracked. {critical_count} critical issues.",
            "total_tickets": total,
            "critical_issues_count": critical_count,
            "top_categories": top_categories,
            "action_items": [
                "Expedite high urgency maintenance assignments.",
                "Review pending Wing Rep escalations."
            ]
        }
