import os
import json
import re
from typing import Dict, Any, List

# Load the Gemini AI API Key from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def extract_entities_and_claims(transcript_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    FR3: Extract named entities and candidate claims from the processed transcript.
    This is a model-agnostic step: it tries to use an advanced AI model (Google Gemini) first.
    If no API key is provided, it safely falls back to a custom-built, rule-based NLP parser.
    """
    transcript_text = transcript_data.get("transcript_text", "")
    
    # 1. AI Extraction Path: Use Gemini API if a valid key exists
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            # Construct a prompt instructing the AI to read the transcript and output strict JSON formatting
            prompt = f"""
Analyze the following video transcript. Extract structured claims and named entities.

TRANSCRIPT:
{transcript_text[:4000]}

Return JSON ONLY with exact keys:
{{
  "claims": [
    {{
      "id": "claim_1",
      "text": "Exact or summarized claim statement",
      "subject": "Main topic/entity",
      "category": "Technology | Science | Health | Climate | General",
      "confidence": 0.95
    }}
  ],
  "entities": [
    {{
      "id": "ent_1",
      "name": "Entity Name (Organization, Location, Technology, Metric)",
      "type": "Organization | Location | Technology | Research",
      "description": "Short context description"
    }}
  ]
}}
            """
            
            # Call the Gemini 2.5 Flash model
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            raw_text = response.text
            
            # Use regex to extract the JSON payload from the AI's response (ignoring any markdown formatting)
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0))
                if "claims" in parsed and "entities" in parsed:
                    return parsed
        except Exception as e:
            print(f"[Entities Step] Gemini extraction failed: {e}. Utilizing built-in NLP parser.")

    # 2. Fallback Path: Rule-based NLP extraction if AI fails or key is missing
    return _rule_based_extraction(transcript_text)


def _rule_based_extraction(text: str) -> Dict[str, Any]:
    """
    A basic Natural Language Processing (NLP) fallback function. 
    It searches for specific scientific/tech keywords and verbs to manually construct claims.
    """
    claims = []
    entities_map = {}
    
    # Split the long transcript text into individual sentences based on periods
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    
    # A hardcoded dictionary of known important entities we want to track
    entity_keywords = {
        "IBM": ("Organization", "Quantum hardware leader"),
        "Google": ("Organization", "Tech company & AI developer"),
        "Oak Ridge National Laboratory": ("Research Facility", "US DOE national lab"),
        "Lawrence Livermore National Laboratory": ("Research Facility", "Nuclear fusion laboratory"),
        "National Ignition Facility": ("Research Facility", "Inertial confinement fusion facility"),
        "Korea University": ("Organization", "Academic research institute"),
        "Max Planck Institute": ("Research Facility", "Independent research institute"),
        "NREL": ("Research Facility", "National Renewable Energy Laboratory"),
        "NASA": ("Organization", "US Space & Climate Agency"),
        "NOAA": ("Organization", "Oceanic and Atmospheric Administration"),
        "IPCC": ("Organization", "Intergovernmental Panel on Climate Change"),
        "IEA": ("Organization", "International Energy Agency"),
        "USGS": ("Organization", "US Geological Survey"),
        "OpenAI": ("Organization", "AI research lab"),
        "Stanford HAI": ("Organization", "Human-Centered AI Institute"),
        "MIT CSAIL": ("Organization", "Computer Science and AI Lab"),
        "LK-99": ("Technology/Material", "Purported room-temp superconductor"),
        "AlphaFold 3": ("Technology", "Protein structure prediction model"),
        "Gemini 1.5 Pro": ("Technology", "Multimodal large language model")
    }

    # First Pass: Search the text for any known entities and save them
    for ent_name, (ent_type, ent_desc) in entity_keywords.items():
        if ent_name.lower() in text.lower():
            entities_map[ent_name] = {
                "id": f"ent_{len(entities_map)+1}",
                "name": ent_name,
                "type": ent_type,
                "description": ent_desc
            }

    # Second Pass: Search each sentence for claim-indicating action verbs
    claim_idx = 1
    for s in sentences:
        s_lower = s.lower()
        # If the sentence contains a strong verb, it's likely a factual claim
        if any(kw in s_lower for kw in ["claimed", "exceeded", "demonstrated", "achieved", "increased", "surpassed", "reaches", "false", "confirmed", "classified"]):
            
            # Determine the main subject of the claim by checking if any found entity is mentioned in this sentence
            found_subject = "General Claim"
            for ent_name in entities_map:
                if ent_name.lower() in s_lower:
                    found_subject = ent_name
                    break
            
            # Assign a category based on keyword themes
            category = "Science"
            if any(w in s_lower for w in ["ai", "quantum", "processor", "model", "supercomputer", "language"]):
                category = "Technology"
            elif any(w in s_lower for w in ["climate", "temperature", "co2", "renewable", "solar"]):
                category = "Climate"

            # Create the structured claim object
            claims.append({
                "id": f"claim_{claim_idx}",
                "text": s.strip(),
                "subject": found_subject,
                "category": category,
                "confidence": round(0.85 + (claim_idx % 3) * 0.04, 2)
            })
            claim_idx += 1

    # Check if the text actually contained our error message from Step 1 (failed transcript download)
    if text.startswith("Error: Could not retrieve transcript"):
        # We explicitly create a special "claim" to show the user the error on the frontend
        claims.append({
            "id": "claim_error",
            "text": "The system could not download the video transcript. It may not have captions, or YouTube blocked the request.",
            "subject": "System Error",
            "category": "General",
            "confidence": 1.0
        })

    # Return the extracted JSON structure
    return {
        "claims": claims,
        "entities": list(entities_map.values())
    }
