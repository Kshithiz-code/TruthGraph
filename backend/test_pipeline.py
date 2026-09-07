import unittest
from step_youtube_search import search_youtube_videos
from step1_transcript import fetch_video_transcript
from step2_entities import extract_entities_and_claims
from step3_graph_builder import build_video_knowledge_graph
from step5_trusted_graph import get_trusted_reference_graph
from step6_matcher import match_graph_and_compute_score

class TestTruthGraphPipeline(unittest.TestCase):

    def test_end_to_end_pipeline(self):
        # 1. Search YouTube
        results = search_youtube_videos("Quantum Computing")
        self.assertGreater(len(results), 0)
        video = results[0]
        video_id = video["video_id"]
        
        # 2. Transcript
        transcript_data = fetch_video_transcript(video_id)
        self.assertIn("transcript_text", transcript_data)
        
        # 3. Entity & Claim Extraction
        extracted = extract_entities_and_claims(transcript_data)
        self.assertIn("claims", extracted)
        self.assertIn("entities", extracted)
        
        # 4. Graph Construction
        video_graph = build_video_knowledge_graph(extracted["claims"], extracted["entities"], video)
        self.assertGreater(len(video_graph["nodes"]), 0)
        self.assertGreater(len(video_graph["edges"]), 0)
        
        # 5. Trusted Reference Graph
        trusted_graph = get_trusted_reference_graph()
        self.assertGreater(len(trusted_graph["verified_facts"]), 0)
        
        # 6. Matching & Verification Score
        result = match_graph_and_compute_score(video_graph, trusted_graph)
        summary = result["verification_summary"]
        self.assertGreaterEqual(summary["credibility_score"], 0.0)
        self.assertLessEqual(summary["credibility_score"], 100.0)
        self.assertIn("trust_rating", summary)
        
        print("\nPipeline test passed successfully!")
        print(f"Video Analyzed: {video['title']}")
        print(f"Credibility Score: {summary['credibility_score']}% ({summary['trust_rating']})")
        print(f"Verified Claims: {summary['verified_claims_count']}, Contradicted: {summary['contradicted_claims_count']}, Unverified: {summary['unverified_claims_count']}")

if __name__ == '__main__':
    unittest.main()
