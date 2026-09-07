import os
import re
import requests
from typing import List, Dict, Any

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# Sample mock YouTube videos for instant out-of-the-box demo without API key
MOCK_VIDEOS = [
    {
        "video_id": "dQw4w9WgXcQ",
        "title": "Quantum Computing & Fusion Energy Explained: Fact vs Hype 2026",
        "channel": "Tech & Science Today",
        "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
        "published_at": "2026-04-12",
        "description": "An in-depth analysis evaluating recent breakthroughs in quantum supremacy, nuclear fusion power generation, and room-temperature superconductors."
    },
    {
        "video_id": "M7lc1UVf-VE",
        "title": "Artificial Intelligence & Large Language Models: Comprehensive Breakdown",
        "channel": "AI Frontier",
        "thumbnail": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
        "published_at": "2026-05-18",
        "description": "Exploring transformer architectures, hallucination rates, knowledge graphs, and benchmarks across state-of-the-art AI systems."
    },
    {
        "video_id": "L_LUpnjgPso",
        "title": "Global Climate Trends & Renewable Energy Transition Reports",
        "channel": "Earth Science Insights",
        "thumbnail": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
        "published_at": "2026-02-10",
        "description": "Reviewing atmospheric CO2 concentration statistics, solar photovoltaic efficiency metrics, and global temperature anomaly datasets."
    },
    {
        "video_id": "kJQP7kiw5Fk",
        "title": "Dietary Science & Human Longevity Myths Investigated",
        "channel": "Health Science Daily",
        "thumbnail": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80",
        "published_at": "2026-03-22",
        "description": "Evaluating peer-reviewed clinical trial claims on intermittent fasting, cellular senescence, and nutritional supplements."
    }
]

def search_youtube_videos(query: str, max_results: int = 6) -> List[Dict[str, Any]]:
    """
    FR1: Search YouTube videos via YouTube Data API v3 or fallback to curated demo dataset.
    Also handles direct YouTube URL inputs.
    """
    # Check if user pasted a direct YouTube URL
    url_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11})', query)
    if url_match:
        video_id = url_match.group(1)
        return [{
            "video_id": video_id,
            "title": f"Custom Video (ID: {video_id})",
            "channel": "Direct Link",
            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            "published_at": "",
            "description": "Video loaded directly from URL. Click Analyze Credibility to fetch and analyze its transcript."
        }]

    if YOUTUBE_API_KEY and YOUTUBE_API_KEY != "your_youtube_api_key_here":
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "key": YOUTUBE_API_KEY
            }
            resp = requests.get(url, params=params, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("items", []):
                    snippet = item.get("snippet", {})
                    results.append({
                        "video_id": item["id"]["videoId"],
                        "title": snippet.get("title"),
                        "channel": snippet.get("channelTitle"),
                        "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url") or snippet.get("thumbnails", {}).get("default", {}).get("url"),
                        "published_at": snippet.get("publishedAt", "")[:10],
                        "description": snippet.get("description", "")
                    })
                if results:
                    return results
        except Exception as e:
            print(f"[YouTube Search] API call failed: {e}. Falling back to sample dataset.")

    # Filter mock videos by query if relevant, or return all
    filtered = [v for v in MOCK_VIDEOS if query.lower() in v["title"].lower() or query.lower() in v["description"].lower()]
    return filtered if filtered else MOCK_VIDEOS
