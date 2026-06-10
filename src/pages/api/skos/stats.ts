import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';

const GENERATED_DIR = path.resolve('src/data/generated');

function readJsonLen(filename: string): number {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function getPendingCount(filename: string): number {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data.filter((c: any) => c.status === 'pending').length : 0;
  } catch {
    return 0;
  }
}

export const GET: APIRoute = async () => {
  try {
    const totalDocuments = readJsonLen('documents.json');
    const totalChunks = readJsonLen('chunks.json');

    const pendingConcepts = getPendingCount('candidate-concepts.json');
    const pendingClaims = getPendingCount('candidate-claims.json');
    const pendingEvidence = getPendingCount('candidate-evidence.json');
    const pendingRelationships = getPendingCount('candidate-relationships.json');
    const pendingQuestions = getPendingCount('candidate-questions.json');

    const approvedConcepts = readJsonLen('concepts.json');
    const approvedClaims = readJsonLen('claims.json');
    const approvedEvidence = readJsonLen('evidence.json');
    const approvedRelationships = readJsonLen('relationships.json');
    const approvedQuestions = readJsonLen('questions.json');

    const activeTheses = readJsonLen('theses.json');
    const totalBriefs = readJsonLen('documentary-briefs.json');

    const stats = {
      totalDocuments,
      totalChunks,
      pending: {
        concepts: pendingConcepts,
        claims: pendingClaims,
        evidence: pendingEvidence,
        relationships: pendingRelationships,
        questions: pendingQuestions,
        total: pendingConcepts + pendingClaims + pendingEvidence + pendingRelationships + pendingQuestions
      },
      canonical: {
        concepts: approvedConcepts,
        claims: approvedClaims,
        evidence: approvedEvidence,
        relationships: approvedRelationships,
        questions: approvedQuestions
      },
      theses: activeTheses,
      briefs: totalBriefs,
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
