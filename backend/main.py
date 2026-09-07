import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Import our 6 custom modular pipeline stages
from step_youtube_search import search_youtube_videos
from step1_transcript import fetch_video_transcript
from step2_entities import extract_entities_and_claims
from step3_graph_builder import build_video_knowledge_graph
from step5_trusted_graph import get_trusted_reference_graph
from step6_matcher import match_graph_and_compute_score

# Initialize the FastAPI web server application
app = FastAPI(
    title="TruthGraph API",
    description="Credibility & Knowledge-Graph Analysis for YouTube Videos Backend Service",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on port 3000) to communicate with this Python backend (running on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data structure for the /api/search endpoint request
class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 6

# Define the data structure for the /api/analyze endpoint request
class AnalyzeRequest(BaseModel):
    video_id: str
    video_title: Optional[str] = "Selected YouTube Video"

@app.get("/")
def read_root():
    """
    A simple health-check endpoint to verify the server is running.
    """
    return {
        "status": "online",
        "service": "TruthGraph Backend API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.post("/api/search")
def api_search_videos(req: SearchRequest):
    """
    FR1: Search YouTube videos given a user search query.
    Calls our `step_youtube_search` module.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    
    # Process the search and return the JSON results to the frontend
    results = search_youtube_videos(req.query.strip(), req.max_results)
    return {"query": req.query, "results": results}

@app.post("/api/analyze")
def api_analyze_video(req: AnalyzeRequest):
    """
    The Core Engine Route.
    This orchestrates the 6-stage TruthGraph analysis pipeline:
    FR2 (Transcript) -> FR3 (Entities & Claims) -> FR4 (Graph Building) -> FR5 (Trusted Matching) -> FR6 (Score & Output)
    """
    if not req.video_id:
        raise HTTPException(status_code=400, detail="video_id is required.")
        
    try:
        # Step 1: Download the YouTube transcript (or fetch demo fallback)
        transcript_data = fetch_video_transcript(req.video_id)
        
        # Step 2: Extract named entities & candidate claims using Gemini AI (or NLP fallback)
        extracted = extract_entities_and_claims(transcript_data)
        claims = extracted.get("claims", [])
        entities = extracted.get("entities", [])
        
        # Step 3: Build the visual node-edge knowledge graph for this specific video
        video_info = {"video_id": req.video_id, "title": req.video_title}
        video_graph = build_video_knowledge_graph(claims, entities, video_info)
        
        # Step 5: Load our internal database of verified scientific facts
        trusted_graph = get_trusted_reference_graph()
        
        # Step 6: Cross-reference the video's graph against the trusted graph to calculate the final credibility score
        result = match_graph_and_compute_score(video_graph, trusted_graph)
        
        # Return the massive, fully structured JSON payload to the React frontend
        return {
            "video_id": req.video_id,
            "video_title": req.video_title,
            "transcript_source": transcript_data.get("source"),
            "transcript_preview": transcript_data.get("transcript_text")[:350] + "...",
            "claims": claims,
            "entities": entities,
            "graph": result["graph"],
            "verification_summary": result["verification_summary"]
        }
    except Exception as e:
        # If any step in the pipeline crashes, return a clean 500 error to the frontend
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")

# This ensures the server starts automatically when you run `python main.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
