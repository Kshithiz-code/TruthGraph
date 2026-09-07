import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from step_youtube_search import search_youtube_videos
from step1_transcript import fetch_video_transcript
from step2_entities import extract_entities_and_claims
from step3_graph_builder import build_video_knowledge_graph
from step5_trusted_graph import get_trusted_reference_graph
from step6_matcher import match_graph_and_compute_score

app = FastAPI(
    title="TruthGraph API",
    description="Credibility & Knowledge-Graph Analysis for YouTube Videos Backend Service",
    version="1.0.0"
)

# Enable CORS for React frontend (default ports 3000 & 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 6

class AnalyzeRequest(BaseModel):
    video_id: str
    video_title: Optional[str] = "Selected YouTube Video"

@app.get("/")
def read_root():
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
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    results = search_youtube_videos(req.query.strip(), req.max_results)
    return {"query": req.query, "results": results}

@app.post("/api/analyze")
def api_analyze_video(req: AnalyzeRequest):
    """
    Orchestrates the 6-stage TruthGraph analysis pipeline:
    FR2 (Transcript) -> FR3 (Entities & Claims) -> FR4 (Graph Building) -> FR5 (Trusted Matching) -> FR6 (Score & Output)
    """
    if not req.video_id:
        raise HTTPException(status_code=400, detail="video_id is required.")
        
    try:
        # Step 1: Transcript extraction & preprocessing
        transcript_data = fetch_video_transcript(req.video_id)
        
        # Step 2: Extract named entities & candidate claims
        extracted = extract_entities_and_claims(transcript_data)
        claims = extracted.get("claims", [])
        entities = extracted.get("entities", [])
        
        # Step 3: Build per-video knowledge graph
        video_info = {"video_id": req.video_id, "title": req.video_title}
        video_graph = build_video_knowledge_graph(claims, entities, video_info)
        
        # Step 5: Fetch trusted reference graph
        trusted_graph = get_trusted_reference_graph()
        
        # Step 6: Match graph against trusted facts and compute verification score
        result = match_graph_and_compute_score(video_graph, trusted_graph)
        
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
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
