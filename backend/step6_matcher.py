from typing import Dict, Any, List

def match_graph_and_compute_score(video_graph: Dict[str, Any], trusted_graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    FR5 & FR6: Cross-reference video claim graph with trusted reference graph,
    attach verification nodes, and compute overall video credibility score.
    """
    # Extract the nodes and edges from the video's knowledge graph (Step 3 output)
    nodes = list(video_graph.get("nodes", []))
    edges = list(video_graph.get("edges", []))
    
    # Extract the verified facts and authoritative sources from the trusted database (Step 5 output)
    verified_facts = trusted_graph.get("verified_facts", [])
    trusted_source_nodes = {n["id"]: n for n in trusted_graph.get("nodes", [])}
    
    # Initialize metric counters for our final credibility dashboard
    verified_count = 0
    contradicted_count = 0
    unverified_count = 0
    
    claim_verifications = []
    added_trusted_nodes = set()
    
    # Iterate through every node in the video's graph
    for node in nodes:
        # We only want to analyze nodes that represent "claims" (not entities or the video itself)
        if node.get("type") == "claim":
            claim_text = node["data"]["full_text"].lower()
            
            # Match the video's claim against our database of trusted facts
            matched_fact = None
            for fact in verified_facts:
                # We check how many "keywords" from the trusted fact appear in the video's claim
                match_score = sum(1 for kw in fact["keywords"] if kw in claim_text)
                
                # If 2 or more keywords match (or if it's a single-keyword fact and it matches), we consider it a hit!
                if match_score >= 2 or (len(fact["keywords"]) == 1 and fact["keywords"][0] in claim_text):
                    matched_fact = fact
                    break
            
            # If we found a matching fact in our trusted database
            if matched_fact:
                status = matched_fact["status"] # e.g., "VERIFIED" or "CONTRADICTED"
                source_id = matched_fact["trusted_source"]
                source_obj = trusted_source_nodes.get(source_id, {})
                evidence = matched_fact["evidence"]
                
                # Update the video claim node with its new verification status and evidence
                node["data"]["verification_status"] = status
                node["data"]["evidence"] = evidence
                node["data"]["trusted_source_name"] = source_obj.get("name", "Authoritative Source")
                
                # Increment the correct metric counter
                if status == "VERIFIED":
                    verified_count += 1
                elif status == "CONTRADICTED":
                    contradicted_count += 1
                
                # To visualize this, we need to add the Trusted Source to the video's knowledge graph
                if source_id not in added_trusted_nodes:
                    nodes.append({
                        "id": source_id,
                        "label": source_obj.get("name", "Trusted Source")[:30] + "...",
                        "type": "trusted_source",
                        "group": "TrustedSource",
                        "data": {
                            "name": source_obj.get("name"),
                            "authority": source_obj.get("authority"),
                            "trust_score": source_obj.get("trust_score", 0.95)
                        }
                    })
                    added_trusted_nodes.add(source_id)
                
                # We also need to draw an Edge (connecting line) between the Claim and the Trusted Source
                edge_label = "verified_by" if status == "VERIFIED" else "refuted_by"
                edges.append({
                    "id": f"edge_{node['id']}_{source_id}",
                    "source": node["id"],
                    "target": source_id,
                    "label": edge_label,
                    "type": edge_label
                })
                
                # Save the summary of this claim for the frontend list
                claim_verifications.append({
                    "claim_id": node["id"],
                    "claim_text": node["data"]["full_text"],
                    "status": status,
                    "source": source_obj.get("name"),
                    "evidence": evidence,
                    "confidence": node["data"].get("confidence", 0.9)
                })
            else:
                # If we couldn't find a matching fact, we mark it as UNVERIFIED
                node["data"]["verification_status"] = "UNVERIFIED"
                node["data"]["evidence"] = "No direct matching entry found in current trusted reference graph."
                unverified_count += 1
                claim_verifications.append({
                    "claim_id": node["id"],
                    "claim_text": node["data"]["full_text"],
                    "status": "UNVERIFIED",
                    "source": "N/A",
                    "evidence": "Requires broader external domain verification.",
                    "confidence": node["data"].get("confidence", 0.8)
                })

    # Mathematical Formula for overall Credibility Score (0 to 100%)
    total_claims = len(claim_verifications)
    if total_claims > 0:
        # Verified claims add 100 points, Unverified add 50 points, Contradicted (False) add 0 points.
        score_val = ((verified_count * 100) + (unverified_count * 50) + (contradicted_count * 0)) / total_claims
        # Ensure the score stays between 5% and 99% for visual reasons
        credibility_score = round(max(5.0, min(99.0, score_val)), 1)
    else:
        credibility_score = 75.0 # Default if no claims were found

    # Determine a human-readable text rating based on the score
    trust_rating = "High Credibility"
    if credibility_score < 75:
        trust_rating = "Moderate Credibility"
    if credibility_score < 50:
        trust_rating = "Low Credibility / Misinformation Risk"

    # Return the fully updated graph and the mathematical summary
    return {
        "graph": {
            "nodes": nodes,
            "edges": edges
        },
        "verification_summary": {
            "credibility_score": credibility_score,
            "total_claims": total_claims,
            "verified_claims_count": verified_count,
            "contradicted_claims_count": contradicted_count,
            "unverified_claims_count": unverified_count,
            "trust_rating": trust_rating,
            "claim_verifications": claim_verifications
        }
    }
