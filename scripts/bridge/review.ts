import * as fs from 'fs';
import * as path from 'path';
import type {
  CandidateConcept,
  CandidateClaim,
  CandidateEvidence,
  CandidateQuestion,
  CandidateRelationship
} from './types';

const GENERATED_DIR = path.resolve('src/data/generated');

type CandidateType = 'concepts' | 'claims' | 'evidence' | 'questions' | 'relationships';

function getFilePath(type: CandidateType): string {
  return path.join(GENERATED_DIR, `candidate-${type}.json`);
}

function loadCandidates<T>(type: CandidateType): T[] {
  const filePath = getFilePath(type);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading candidates file for ${type}:`, err);
    return [];
  }
}

function saveCandidates<T>(type: CandidateType, data: T[]): void {
  const filePath = getFilePath(type);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getPendingCandidates() {
  return {
    concepts: loadCandidates<CandidateConcept>('concepts').filter(c => c.status === 'pending'),
    claims: loadCandidates<CandidateClaim>('claims').filter(c => c.status === 'pending'),
    evidence: loadCandidates<CandidateEvidence>('evidence').filter(c => c.status === 'pending'),
    questions: loadCandidates<CandidateQuestion>('questions').filter(c => c.status === 'pending'),
    relationships: loadCandidates<CandidateRelationship>('relationships').filter(c => c.status === 'pending'),
  };
}

export function getAllCandidates() {
  return {
    concepts: loadCandidates<CandidateConcept>('concepts'),
    claims: loadCandidates<CandidateClaim>('claims'),
    evidence: loadCandidates<CandidateEvidence>('evidence'),
    questions: loadCandidates<CandidateQuestion>('questions'),
    relationships: loadCandidates<CandidateRelationship>('relationships'),
  };
}

export function updateCandidateStatus(
  type: CandidateType,
  id: string,
  status: 'approved' | 'pending' | 'rejected',
  updates?: Record<string, any>
): boolean {
  const candidates = loadCandidates<any>(type);
  const index = candidates.findIndex(c => c.id === id);
  if (index === -1) {
    console.error(`Candidate of type ${type} with id ${id} not found.`);
    return false;
  }

  candidates[index] = {
    ...candidates[index],
    status,
    ...updates
  };

  saveCandidates(type, candidates);
  console.log(`Updated candidate ${type}/${id} to status: ${status}`);
  return true;
}

import { fileURLToPath } from 'url';

// Command-line utility support
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
  const args = process.argv.slice(2);
  if (args.length >= 3) {
    const [type, id, status] = args as [CandidateType, string, any];
    const success = updateCandidateStatus(type, id, status);
    process.exit(success ? 0 : 1);
  } else {
    console.log('Usage: npx tsx review.ts <concepts|claims|evidence|questions|relationships> <id> <approved|pending|rejected>');
    const stats = getPendingCandidates();
    console.log('\nPending candidates stats:');
    console.log(`- Concepts: ${stats.concepts.length}`);
    console.log(`- Claims: ${stats.claims.length}`);
    console.log(`- Evidence: ${stats.evidence.length}`);
    console.log(`- Questions: ${stats.questions.length}`);
    console.log(`- Relationships: ${stats.relationships.length}`);
  }
}
