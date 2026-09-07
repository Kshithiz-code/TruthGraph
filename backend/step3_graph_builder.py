from typing import Dict, Any, List

def build_video_knowledge_graph(claims: List[Dict[str, Any]], entities: List[Dict[str, Any]], video_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    FR4: Construct a knowledge graph linking claims, entities, and video context.
    """
    nodes = []
    edges = []
    
    video_id = video_info.get("video_id", "v1")
    video_title = video_info.get("title", "Selected Video")
    
    # Root Video Node
    video_node_id = f"video_{video_id}"
    nodes.append({
        "id": video_node_id,
        "label": video_title[:35] + "...",
        "type": "video",
        "group": "Video",
        "data": {
            "title": video_title,
            "video_id": video_id
        }
    })
    
    # Entity Nodes
    entity_id_map = {}
    for ent in entities:
        ent_id = ent.get("id", f"ent_{ent['name']}")
        entity_id_map[ent["name"].lower()] = ent_id
        nodes.append({
            "id": ent_id,
            "label": ent["name"],
            "type": "entity",
            "group": "Entity",
            "data": {
                "entity_type": ent.get("type", "General"),
                "description": ent.get("description", "")
            }
        })
    
    # Claim Nodes & Edges
    for claim in claims:
        c_id = claim["id"]
        nodes.append({
            "id": c_id,
            "label": claim["text"][:40] + "...",
            "type": "claim",
            "group": "Claim",
            "data": {
                "full_text": claim["text"],
                "subject": claim.get("subject", ""),
                "category": claim.get("category", "General"),
                "confidence": claim.get("confidence", 0.9)
            }
        })
        
        # Edge: Video -> Claim (makes_claim)
        edges.append({
            "id": f"edge_{video_node_id}_{c_id}",
            "source": video_node_id,
            "target": c_id,
            "label": "makes_claim",
            "type": "makes_claim"
        })
        
        # Edge: Claim -> Entity (mentions_entity)
        subject = claim.get("subject", "").lower()
        matched = False
        for ent_name, ent_id in entity_id_map.items():
            if ent_name in subject or ent_name in claim["text"].lower():
                edges.append({
                    "id": f"edge_{c_id}_{ent_id}",
                    "source": c_id,
                    "target": ent_id,
                    "label": "references",
                    "type": "references"
                })
                matched = True
        
        # Connect to first entity if no exact match
        if not matched and nodes:
            first_ent = [n for n in nodes if n["type"] == "entity"]
            if first_ent:
                edges.append({
                    "id": f"edge_{c_id}_{first_ent[0]['id']}",
                    "source": c_id,
                    "target": first_ent[0]["id"],
                    "label": "references",
                    "type": "references"
                })

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "claim_count": len(claims),
            "entity_count": len(entities)
        }
    }
