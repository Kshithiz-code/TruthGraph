from typing import Dict, Any, List

def match_graph_and_compute_score(video_graph: Dict[str, Any], trusted_graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    FR5 & FR6: Cross-reference video claim graph with trusted reference graph,
    attach verification nodes, and compute overall video credibility score.
    """
    nodes = list(video_graph.get("nodes", []))
    edges = list(video_graph.get("edges", []))
    
    verified_facts = trusted_graph.get("verified_facts", [])
    trusted_source_nodes = {n["id"]: n for n in trusted_graph.get("nodes", [])}
    
    verified_count = 0
    contradicted_count = 0
    unverified_count = 0
    
    claim_verifications = []
    added_trusted_nodes = set()
    
    for node in nodes:
        if node.get("type") == "claim":
            claim_text = node["data"]["full_text"].lower()
            
            # Match against trusted facts
            matched_fact = None
            for fact in verified_facts:
                match_score = sum(1 for kw in fact["keywords"] if kw in claim_text)
                if match_score >= 2 or (len(fact["keywords"]) == 1 and fact["keywords"][0] in claim_text):
                    matched_fact = fact
                    break
            
            if matched_fact:
                status = matched_fact["status"]
                source_id = matched_fact["trusted_source"]
                source_obj = trusted_source_nodes.get(source_id, {})
                evidence = matched_fact["evidence"]
                
                node["data"]["verification_status"] = status
                node["data"]["evidence"] = evidence
                node["data"]["trusted_source_name"] = source_obj.get("name", "Authoritative Source")
                
                if status == "VERIFIED":
                    verified_count += 1
                elif status == "CONTRADICTED":
                    contradicted_count += 1
                
                # Add TrustedSource node to graph if not present
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
                
                # Edge: Claim -> TrustedSource
                edge_label = "verified_by" if status == "VERIFIED" else "refuted_by"
                edges.append({
                    "id": f"edge_{node['id']}_{source_id}",
                    "source": node["id"],
                    "target": source_id,
                    "label": edge_label,
                    "type": edge_label
                })
                
                claim_verifications.append({
                    "claim_id": node["id"],
                    "claim_text": node["data"]["full_text"],
                    "status": status,
                    "source": source_obj.get("name"),
                    "evidence": evidence,
                    "confidence": node["data"].get("confidence", 0.9)
                })
            else:
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

    total_claims = len(claim_verifications)
    if total_claims > 0:
        # Credibility formula: Verified claims add (+100/total), Contradicted (-50/total), Unverified (+50/total)
        score_val = ((verified_count * 100) + (unverified_count * 50) + (contradicted_count * 0)) / total_claims
        credibility_score = round(max(5.0, min(99.0, score_val)), 1)
    else:
        credibility_score = 75.0

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
            "trust_rating": "High Credibility" if credibility_score >= 75 else ("Moderate Credibility" if credibility_score >= 50 else "Low Credibility / Misinformation Risk"),
            "claim_verifications": claim_verifications
        }
    }
