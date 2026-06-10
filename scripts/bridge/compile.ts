import * as fs from 'fs';
import * as path from 'path';
import { runCanonicalization } from './canonicalize';
import type {
  CandidateConcept,
  CandidateClaim,
  CandidateEvidence,
  CandidateQuestion,
  CandidateRelationship
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

export function compileCanonicalIndexes() {
  // 1. Ensure canonicalization runs first to compile provenance and alias maps
  runCanonicalization();

  console.log('🚀 Compiling final canonical indexes...');

  // 2. Load alias mapping
  const aliasMap = loadJson<AliasMap>('alias-map.json', {
    concepts: {},
    claims: {},
    evidence: {}
  });

  const getCanonicalId = (type: keyof AliasMap, id: string): string => {
    return aliasMap[type][id] || id;
  };

  // 3. Load approved candidates
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

  // 4. Merge Duplicates and Canonicalize Concepts
  const canonicalConceptsMap = new Map<string, {
    id: string;
    name: string;
    supportingSources: string[];
    supportingChunks: string[];
    extractionConfidence: number;
  }>();

  for (const item of approvedConcepts) {
    const canonId = getCanonicalId('concepts', item.id);
    const existing = canonicalConceptsMap.get(canonId);
    if (existing) {
      existing.supportingSources = Array.from(new Set([...existing.supportingSources, ...item.supportingSources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...item.supportingChunks]));
      existing.extractionConfidence = Math.max(existing.extractionConfidence, item.extractionConfidence);
    } else {
      canonicalConceptsMap.set(canonId, {
        id: canonId,
        name: item.name,
        supportingSources: [...item.supportingSources],
        supportingChunks: [...item.supportingChunks],
        extractionConfidence: item.extractionConfidence
      });
    }
  }

  // 5. Merge Duplicates and Canonicalize Claims
  const canonicalClaimsMap = new Map<string, {
    id: string;
    statement: string;
    supportingSources: string[];
    supportingChunks: string[];
    extractionConfidence: number;
  }>();

  for (const item of approvedClaims) {
    const canonId = getCanonicalId('claims', item.id);
    const existing = canonicalClaimsMap.get(canonId);
    if (existing) {
      existing.supportingSources = Array.from(new Set([...existing.supportingSources, ...item.supportingSources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...item.supportingChunks]));
      existing.extractionConfidence = Math.max(existing.extractionConfidence, item.extractionConfidence);
    } else {
      canonicalClaimsMap.set(canonId, {
        id: canonId,
        statement: item.statement,
        supportingSources: [...item.supportingSources],
        supportingChunks: [...item.supportingChunks],
        extractionConfidence: item.extractionConfidence
      });
    }
  }

  // 6. Merge Duplicates and Canonicalize Evidence
  const canonicalEvidenceMap = new Map<string, {
    id: string;
    name: string;
    supportingSources: string[];
    supportingChunks: string[];
    extractionConfidence: number;
  }>();

  for (const item of approvedEvidence) {
    const canonId = getCanonicalId('evidence', item.id);
    const existing = canonicalEvidenceMap.get(canonId);
    if (existing) {
      existing.supportingSources = Array.from(new Set([...existing.supportingSources, ...item.supportingSources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...item.supportingChunks]));
      existing.extractionConfidence = Math.max(existing.extractionConfidence, item.extractionConfidence);
    } else {
      canonicalEvidenceMap.set(canonId, {
        id: canonId,
        name: item.name,
        supportingSources: [...item.supportingSources],
        supportingChunks: [...item.supportingChunks],
        extractionConfidence: item.extractionConfidence
      });
    }
  }

  // 7. Canonicalize Questions (no deduplication needed as they are rare, but safe to group)
  const canonicalQuestionsMap = new Map<string, {
    id: string;
    question: string;
    supportingSources: string[];
    supportingChunks: string[];
    extractionConfidence: number;
  }>();

  for (const item of approvedQuestions) {
    const existing = canonicalQuestionsMap.get(item.id);
    if (existing) {
      existing.supportingSources = Array.from(new Set([...existing.supportingSources, ...item.supportingSources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...item.supportingChunks]));
      existing.extractionConfidence = Math.max(existing.extractionConfidence, item.extractionConfidence);
    } else {
      canonicalQuestionsMap.set(item.id, {
        id: item.id,
        question: item.question,
        supportingSources: [...item.supportingSources],
        supportingChunks: [...item.supportingChunks],
        extractionConfidence: item.extractionConfidence
      });
    }
  }

  // Helper sets to validate referential integrity
  const validNodeIds = new Set([
    ...canonicalConceptsMap.keys(),
    ...canonicalClaimsMap.keys(),
    ...canonicalEvidenceMap.keys(),
    ...canonicalQuestionsMap.keys()
  ]);

  // 8. Canonicalize and Validate Relationships
  const canonicalRelationships: {
    id: string;
    source: string;
    relation: string;
    target: string;
    supportingSources: string[];
    supportingChunks: string[];
    extractionConfidence: number;
  }[] = [];

  for (const item of approvedRelationships) {
    const canonSource = getCanonicalId('concepts', item.source) || getCanonicalId('claims', item.source) || item.source;
    const canonTarget = getCanonicalId('concepts', item.target) || getCanonicalId('claims', item.target) || item.target;

    // Referential integrity check
    if (!validNodeIds.has(canonSource)) {
      console.warn(`[Integrity Warning] Relationship source "${canonSource}" is not in canonical nodes. Skipping relationship.`);
      continue;
    }
    if (!validNodeIds.has(canonTarget)) {
      console.warn(`[Integrity Warning] Relationship target "${canonTarget}" is not in canonical nodes. Skipping relationship.`);
      continue;
    }

    const canonRelId = `${canonSource}-${item.relation}-${canonTarget}`;
    const existingIndex = canonicalRelationships.findIndex(r => r.id === canonRelId);

    if (existingIndex > -1) {
      const existing = canonicalRelationships[existingIndex];
      existing.supportingSources = Array.from(new Set([...existing.supportingSources, ...item.supportingSources]));
      existing.supportingChunks = Array.from(new Set([...existing.supportingChunks, ...item.supportingChunks]));
      existing.extractionConfidence = Math.max(existing.extractionConfidence, item.extractionConfidence);
    } else {
      canonicalRelationships.push({
        id: canonRelId,
        source: canonSource,
        relation: item.relation,
        target: canonTarget,
        supportingSources: [...item.supportingSources],
        supportingChunks: [...item.supportingChunks],
        extractionConfidence: item.extractionConfidence
      });
    }
  }

  // Output files
  saveJson('concepts.json', Array.from(canonicalConceptsMap.values()));
  saveJson('claims.json', Array.from(canonicalClaimsMap.values()));
  saveJson('evidence.json', Array.from(canonicalEvidenceMap.values()));
  saveJson('questions.json', Array.from(canonicalQuestionsMap.values()));
  saveJson('relationships.json', canonicalRelationships);
  
  // Save an empty implementations.json file if it doesn't exist to satisfy other systems
  if (!fs.existsSync(path.join(GENERATED_DIR, 'implementations.json'))) {
    saveJson('implementations.json', []);
  }

  console.log(`✓ Compiled Canonical Indexes:
  - concepts.json: ${canonicalConceptsMap.size} nodes
  - claims.json: ${canonicalClaimsMap.size} nodes
  - evidence.json: ${canonicalEvidenceMap.size} nodes
  - questions.json: ${canonicalQuestionsMap.size} nodes
  - relationships.json: ${canonicalRelationships.length} edges`);
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
  compileCanonicalIndexes();
}
