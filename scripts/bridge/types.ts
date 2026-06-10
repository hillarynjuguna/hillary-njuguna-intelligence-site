export interface DocumentRecord {
  documentId: string;
  path: string;
  corpus: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
  checksum: string;
  chunkIds: string[];
  tokenEstimate: number;
}

export interface ChunkRecord {
  chunkId: string;
  documentId: string;
  headers: string[];
  tokenEstimate: number;
  text: string;
  checksum: string;
}

export interface CandidateConcept {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

export interface CandidateClaim {
  id: string;
  statement: string;
  status: 'approved' | 'pending' | 'rejected';
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

export interface CandidateEvidence {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

export interface CandidateQuestion {
  id: string;
  question: string;
  status: 'approved' | 'pending' | 'rejected';
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

export interface CandidateRelationship {
  id: string;
  source: string;
  relation: string;
  target: string;
  status: 'approved' | 'pending' | 'rejected';
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

export interface ProvenanceRecord {
  nodeId: string;
  nodeType: 'concept' | 'claim' | 'evidence' | 'question' | 'implementation' | 'relationship';
  sources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  firstSeen: string;
  lastValidated: string;
}
