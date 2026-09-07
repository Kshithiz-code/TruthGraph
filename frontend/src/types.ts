export interface YouTubeVideo {
  video_id: string;
  title: string;
  channel: string;
  thumbnail: string;
  published_at: string;
  description: string;
}

export interface Claim {
  id: string;
  text: string;
  subject: string;
  category: string;
  confidence: number;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'video' | 'claim' | 'entity' | 'trusted_source';
  group: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface ClaimVerification {
  claim_id: string;
  claim_text: string;
  status: 'VERIFIED' | 'CONTRADICTED' | 'UNVERIFIED';
  source?: string;
  evidence?: string;
  confidence: number;
}

export interface VerificationSummary {
  credibility_score: number;
  total_claims: number;
  verified_claims_count: number;
  contradicted_claims_count: number;
  unverified_claims_count: number;
  trust_rating: string;
  claim_verifications: ClaimVerification[];
}

export interface AnalysisResult {
  video_id: string;
  video_title: string;
  transcript_source: string;
  transcript_preview: string;
  claims: Claim[];
  entities: Entity[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  verification_summary: VerificationSummary;
}
