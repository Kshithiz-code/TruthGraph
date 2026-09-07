import re
from typing import Dict, Any, List

SAMPLE_TRANSCRIPTS = {
    "dQw4w9WgXcQ": """
Welcome back. Today we are examining three massive technological claims.
First, quantum computing supremacy: IBM and Google have demonstrated quantum processors capable of solving specific mathematical problems over 10,000 times faster than classical supercomputers like Frontier at Oak Ridge National Laboratory.
Second, clean energy generation: Lawrence Livermore National Laboratory achieved net energy gain in a controlled nuclear fusion reaction at the National Ignition Facility, producing 3.15 megajoules of energy from 2.05 megajoules of laser input.
Third, room-temperature superconductors: LK-99 was claimed by researchers at Korea University to exhibit superconductivity at ambient pressure and temperatures up to 400 Kelvin. However, independent replication studies from Max Planck Institute for Solid State Research confirmed LK-99 is an insulator caused by copper sulfide impurities, not a superconductor.
Finally, global solar photovoltaic efficiency has exceeded 33% in tandem perovskite-silicon solar cells tested by NREL.
    """,
    "M7lc1UVf-VE": """
In this explainer, we analyze state-of-the-art Artificial Intelligence systems in 2026.
First, Large Language Models like Google Gemini 1.5 Pro feature context windows exceeding 2 million tokens, enabling long-context processing of multi-hour video and code repositories.
Second, DeepMind introduced AlphaFold 3 in 2024, which predicts structures of proteins, DNA, RNA, and small molecule interactions with high accuracy according to Nature publications.
Third, claims that generative AI models have achieved Artificial General Intelligence (AGI) remain unverified; top AI research institutes including OpenAI, Stanford HAI, and MIT CSAIL classify current systems as specialized language pattern systems rather than autonomous general intelligence.
    """,
    "L_LUpnjgPso": """
Today we review atmospheric climate observations from NASA, NOAA, and the IPCC Sixth Assessment Report.
First, global mean surface temperature has increased by approximately 1.1 degrees Celsius compared to pre-industrial levels (1850-1900 baseline).
Second, atmospheric carbon dioxide levels measured at Mauna Loa Observatory surpassed 420 parts per million in 2024.
Third, clean energy adoption: According to the International Energy Agency (IEA), renewable energy capacity additions reached over 500 Gigawatts globally in 2023, driven primarily by solar PV in China, Europe, and the US.
Fourth, a common viral claim that volcanic eruptions release more annual CO2 than human activities is false; USGS data shows human activities emit over 100 times more CO2 annually than all global volcanic activity combined.
    """
}

def fetch_video_transcript(video_id: str) -> Dict[str, Any]:
    """
    FR2: Extract and pre-process the transcript of a selected YouTube video.
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        # Support both function call and class method formats depending on installed version
        if hasattr(YouTubeTranscriptApi, 'get_transcript'):
            api_transcript = YouTubeTranscriptApi.get_transcript(video_id)
        else:
            api_transcript = YouTubeTranscriptApi().fetch(video_id)
            
        full_text = " ".join([item["text"] for item in api_transcript])
        full_text = re.sub(r'\s+', ' ', full_text).strip()
        snippets = [{"text": item["text"], "start": item["start"], "duration": item["duration"]} for item in api_transcript[:15]]
        return {
            "video_id": video_id,
            "transcript_text": full_text,
            "snippets": snippets,
            "source": "live_youtube_api"
        }
    except Exception as e:
        print(f"[Transcript Step] YouTubeTranscriptApi info: {e}.")
        
        # If this is one of our hardcoded demo videos, use the fallback text
        if video_id in SAMPLE_TRANSCRIPTS:
            print("Falling back to built-in transcript store for demo video.")
            text = SAMPLE_TRANSCRIPTS[video_id]
            text = re.sub(r'\s+', ' ', text).strip()
            return {
                "video_id": video_id,
                "transcript_text": text,
                "snippets": [],
                "source": "curated_transcript_store"
            }
        else:
            # If it's a real custom video, don't fake it! Bubble up the error text.
            return {
                "video_id": video_id,
                "transcript_text": f"Error: Could not retrieve transcript from YouTube. This video may not have captions enabled, or YouTube blocked the request. Details: {str(e)}",
                "snippets": [],
                "source": "error"
            }
