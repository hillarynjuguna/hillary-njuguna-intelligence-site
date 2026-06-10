import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';

const GENERATED_DIR = path.resolve('src/data/generated');

function loadPendingCandidates(filename: string): any[] {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(data) ? data.filter((c: any) => c.status === 'pending') : [];
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    const concepts = loadPendingCandidates('candidate-concepts.json');
    const claims = loadPendingCandidates('candidate-claims.json');
    const evidence = loadPendingCandidates('candidate-evidence.json');
    const relationships = loadPendingCandidates('candidate-relationships.json');
    const questions = loadPendingCandidates('candidate-questions.json');

    return new Response(JSON.stringify({
      concepts,
      claims,
      evidence,
      relationships,
      questions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch candidates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
