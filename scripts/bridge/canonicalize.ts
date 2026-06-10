import * as fs from 'fs';
import * as path from 'path';
import type {
  CandidateConcept,
  CandidateClaim,
  CandidateEvidence,
  CandidateQuestion,
  CandidateRelationship,
  ProvenanceRecord
} from './types';

const GENERATED_DIR = path.resolve('src/data/generated');

interface AliasMap {
  concepts: Record<string, string>;
  claims: Record<string, string>;
  evidence: Record<string, string>;
}

function loadJson<T>(filename: string, defaultVal: T): T {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultVal;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
}

function saveJson<T>(filename: string, data: T): void {
  const filePath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function runCanonicalization() {
  console.log('🚀 Running SKOS Canonicalization and Provenance compiler...');

  // 1. Load alias map or create a default one
  const aliasMap = loadJson<AliasMap>('alias-map.json', {
    concepts: {},
    claims: {},
    evidence: {}
  });

  // Ensure default structure exists
  if (!aliasMap.concepts) aliasMap.concepts = {};
  if (!aliasMap.claims) aliasMap.claims = {};
  if (!aliasMap.evidence) aliasMap.evidence = {};
  saveJson('alias-map.json', aliasMap);

  // Helper to get canonical ID
  const getCanonicalId = (type: keyof AliasMap, id: string): string => {
    return aliasMap[type][id] || id;
  };

  // 2. Load approved candidates
  const approvedConcepts = loadJson<CandidateConcept[]>('candidate-concepts.json', [])
    .filter(c => c.status === 'approved');
  const approvedClaims = loadJson<CandidateClaim[]>('candidate-claims.json', [])
    .filter(c => c.status === 'approved');
  const approvedEvidence = loadJson<CandidateEvidence[]>('candidate-evidence.json', [])
    .filter(c => c.status === 'approved');
  const approvedQuestions = loadJson<CandidateQuestion[]>('candidate-questions.json', [])
    .filter(c => c.status === 'approved');
  const approvedRelationships = loadJson<CandidateRelationship[]>('candidate-relationships.json', [])
    .filter(c => c.status === 'approved');

  console.log(`[Canonicalize] Loaded approved candidates:
  - Concepts: ${approvedConcepts.length}
  - Claims: ${approvedClaims.length}
  - Evidence: ${approvedEvidence.length}
  - Questions: ${approvedQuestions.length}
  - Relationships: ${approvedRelationships.length}`);

  const provenanceList: ProvenanceRecord[] = [];
  const nowStr = new Date().toISOString();

  // Helper to add or merge into provenance
  const addToProvenance = (
    nodeId: string,
    nodeType: ProvenanceRecord['nodeType'],
    sources: string[],
    chunks: string[],
    passages: string[]
  ) => {
    const existing = provenanceList.find(p => p.nodeId === nodeId && p.nodeType === nodeType);
    if (existing) {
      // Merge unique sources, chunks, passages
      existing.sources = Array.from(new Set([...existing.sources, ...sources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...chunks]));
      existing.supportingPassages = Array.from(new Set([...existing.supportingPassages, ...passages]));
      existing.lastValidated = nowStr;
    } else {
      provenanceList.push({
        nodeId,
        nodeType,
        sources,
        supportingChunks: chunks,
        supportingPassages: passages,
        firstSeen: nowStr,
        lastValidated: nowStr
      });
    }
  };

  // Compile Concepts Provenance
  for (const concept of approvedConcepts) {
    const canonId = getCanonicalId('concepts', concept.id);
    addToProvenance(
      canonId,
      'concept',
      concept.supportingSources,
      concept.supportingChunks,
      concept.supportingPassages
    );
  }

  // Compile Claims Provenance
  for (const claim of approvedClaims) {
    const canonId = getCanonicalId('claims', claim.id);
    addToProvenance(
      canonId,
      'claim',
      claim.supportingSources,
      claim.supportingChunks,
      claim.supportingPassages
    );
  }

  // Compile Evidence Provenance
  for (const ev of approvedEvidence) {
    const canonId = getCanonicalId('evidence', ev.id);
    addToProvenance(
      canonId,
      'evidence',
      ev.supportingSources,
      ev.supportingChunks,
      ev.supportingPassages
    );
  }

  // Compile Questions Provenance
  for (const q of approvedQuestions) {
    addToProvenance(
      q.id,
      'question',
      q.supportingSources,
      q.supportingChunks,
      q.supportingPassages
    );
  }

  // Compile Relationships Provenance
  for (const rel of approvedRelationships) {
    const canonSource = getCanonicalId('concepts', rel.source) || getCanonicalId('claims', rel.source) || rel.source;
    const canonTarget = getCanonicalId('concepts', rel.target) || getCanonicalId('claims', rel.target) || rel.target;
    const canonRelId = `${canonSource}-${rel.relation}-${canonTarget}`;
    addToProvenance(
      canonRelId,
      'relationship',
      rel.supportingSources,
      rel.supportingChunks,
      rel.supportingPassages
    );
  }

  // Save provenance.json
  saveJson('provenance.json', provenanceList);
  console.log(`✓ Saved ${provenanceList.length} provenance records to provenance.json`);
}

import { fileURLToPath } from 'url';
const isMain = () => {
  try {
    const mainPath = fs.realpathSync(process.argv[1]);
    const modulePath = fs.realpathSync(fileURLToPath(import.meta.url));
    return mainPath === modulePath;
  } catch {
    return false;
  }
};

if (isMain()) {
  runCanonicalization();
}
