import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import type { 
  ChunkRecord, 
  CandidateConcept, 
  CandidateClaim, 
  CandidateEvidence, 
  CandidateQuestion, 
  CandidateRelationship 
} from './types';

// Normalization function to build stable kebab-case IDs
function slugify(text: any): string {
  const str = typeof text === 'string' ? text : String(text || '');
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Load .env.local manually for script execution context
function loadEnv() {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const matches = envContent.matchAll(/^([^#\s=]+)\s*=\s*(.*)$/gm);
    for (const match of matches) {
      const key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[key] = val.replace(/\\n/g, '\n');
    }
  }
}

const SYSTEM_PROMPT = `You are the Discovery Engine for the Sovereign Knowledge Operating System (SKOS).
Your job is to analyze text chunks from a research corpus and extract:
1. CONCEPTS: Conceptual primitives or theoretical frameworks (e.g., "Mortal Measurement").
2. CLAIMS: Explicit assertions or arguments made in the text (e.g., "Automation complacency replaces mortal measurement with reversible measurement").
3. EVIDENCE: Case studies, incidents, or empirical specimens (e.g., "Replit DB deletion").
4. QUESTIONS: Open research questions (e.g., "The Ollie Question").
5. RELATIONSHIPS: Connections between entities (source, relation, target).

RELATION TYPES:
- depends_on
- supports
- extends
- implements
- exemplifies
- contradicts
- revises
- causes
- reveals
- predicts
- explains
- warns_about

For each extraction, you MUST provide:
- The exact chunkId it was found in.
- The supportingPassage: the exact word-for-word text snippet from that chunk that supports the extraction.
- An extractionConfidence (a number between 0.0 and 1.0).

You must return a JSON object with these arrays:
{
  "concepts": [{"id": "kebab-case-id", "name": "Concept Name", "chunkId": "...", "supportingPassage": "...", "confidence": 0.9}],
  "claims": [{"id": "kebab-case-id", "statement": "Claim Statement", "chunkId": "...", "supportingPassage": "...", "confidence": 0.9}],
  "evidence": [{"id": "kebab-case-id", "name": "Evidence Name", "chunkId": "...", "supportingPassage": "...", "confidence": 0.9}],
  "questions": [{"id": "kebab-case-id", "question": "Question text", "chunkId": "...", "supportingPassage": "...", "confidence": 0.9}],
  "relationships": [{"source": "source-id", "relation": "relation-type", "target": "target-id", "chunkId": "...", "supportingPassage": "...", "confidence": 0.9}]
}
Return ONLY valid JSON. No conversational wrapper or markdown backticks outside JSON.`;

export async function runDiscovery(limitBatches = 3) {
  loadEnv();
  
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is missing from .env.local');
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

  const openai = new OpenAI({
    apiKey: cleanKey,
    baseURL: 'https://api.mistral.ai/v1',
    timeout: 60000,
  });

  const generatedDir = path.resolve('src/data/generated');
  const chunksPath = path.join(generatedDir, 'chunks.json');
  
  if (!fs.existsSync(chunksPath)) {
    throw new Error(`chunks.json not found at ${chunksPath}. Run Phase 0 first.`);
  }

  const chunks: ChunkRecord[] = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
  console.log(`[Phase 1] Loaded ${chunks.length} chunks.`);

  // Group chunks into batches of 3
  const batchSize = 10;
  const batches: ChunkRecord[][] = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    batches.push(chunks.slice(i, i + batchSize));
  }

  console.log(`[Phase 1] Grouped into ${batches.length} batches.`);
  const batchesToProcess = limitBatches > 0 ? batches.slice(0, limitBatches) : batches;
  console.log(`[Phase 1] Processing ${batchesToProcess.length} batches...`);

  // Target candidate output files
  const candConcepts: CandidateConcept[] = [];
  const candClaims: CandidateClaim[] = [];
  const candEvidence: CandidateEvidence[] = [];
  const candQuestions: CandidateQuestion[] = [];
  const candRelationships: CandidateRelationship[] = [];

  const cacheDir = path.join(generatedDir, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const concurrencyLimit = 2;
  const taskQueue = Array.from({ length: batchesToProcess.length }, (_, i) => i);

  async function fetchWithRetry(fn: () => Promise<any>, retries = 5, delayMs = 5000): Promise<any> {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = (err as any).status === 429 || (err as any).message?.includes('429');
      if (retries > 0 && (isRateLimit || (err as any).status >= 500)) {
        let retryAfter = 30;
        if ((err as any).error?.metadata?.retry_after_seconds) {
          retryAfter = Math.ceil(parseFloat((err as any).error.metadata.retry_after_seconds));
        } else if ((err as any).headers?.get?.('retry-after')) {
          retryAfter = parseInt((err as any).headers.get('retry-after'), 10);
        }
        const waitTime = isRateLimit ? (retryAfter * 1000) : delayMs;
        console.warn(`  [Retry] Encountered error: ${(err as Error).message}. Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchWithRetry(fn, retries - 1, delayMs * 2);
      }
      throw err;
    }
  }

  async function worker(workerId: number) {
    while (taskQueue.length > 0) {
      const b = taskQueue.shift();
      if (b === undefined) break;

      const cachePath = path.join(cacheDir, `batch-${b}.json`);
      let sanitizedText = '';

      const batch = batchesToProcess[b];

      let isFromCache = false;
      if (fs.existsSync(cachePath)) {
        console.log(`  [Worker ${workerId}] Loading batch ${b + 1}/${batchesToProcess.length} from cache...`);
        sanitizedText = fs.readFileSync(cachePath, 'utf-8');
        isFromCache = true;
      } else {
        console.log(`  [Worker ${workerId}] Querying LLM for batch ${b + 1}/${batchesToProcess.length}...`);
        // Map chunks to simple objects to feed to the LLM
        const promptPayload = batch.map(c => ({
          chunkId: c.chunkId,
          text: c.text,
        }));

        try {
          const response = await fetchWithRetry(() => openai.chat.completions.create({
            model: 'mistral-small-latest',
            max_tokens: 8000,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: JSON.stringify(promptPayload) }
            ],
            response_format: { type: 'json_object' }
          }));

          const resultText = response.choices[0].message?.content || '{}';
          sanitizedText = resultText
            .replace(/\u2014/g, '--')
            .replace(/\u2013/g, '-');
        } catch (err) {
          console.error(`  ❌ Error extracting from batch ${b + 1}:`, (err as Error).message);
          continue;
        }
      }

      const cleanJson = sanitizedText.replace(/^```json|```$/g, '').trim();
      let data;
      try {
        data = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error(`  ❌ JSON Parse Error on batch ${b + 1}:`, (parseErr as Error).message);
        if (isFromCache) {
          try {
            fs.unlinkSync(cachePath);
            console.log(`  [Worker ${workerId}] Deleted invalid cache file for batch ${b + 1}`);
          } catch {}
        }
        continue;
      }

      if (!isFromCache) {
        try {
          fs.writeFileSync(cachePath, sanitizedText, 'utf-8');
        } catch (writeErr) {
          console.error(`  ⚠️ Warning: Failed to write cache for batch ${b + 1}:`, (writeErr as Error).message);
        }
      }

      // Map concepts
      if (Array.isArray(data.concepts)) {
        for (const item of data.concepts) {
          if (!item || (!item.id && !item.name)) {
            console.warn(`  ⚠️ Warning: Skipping invalid concept candidate:`, item);
            continue;
          }
          const chunkId = item.chunkId || (batch[0] ? batch[0].chunkId : 'unknown-chunk');
          const sourceId = chunkId.includes('-chunk-') ? chunkId.split('-chunk-')[0] : 'unknown';
          candConcepts.push({
            id: slugify(item.id || item.name),
            name: item.name || 'Unnamed Concept',
            status: 'pending',
            supportingSources: [sourceId],
            supportingChunks: [chunkId],
            supportingPassages: [item.supportingPassage || ''],
            extractionConfidence: item.confidence || 0.8,
          });
        }
      }

      // Map claims
      if (Array.isArray(data.claims)) {
        for (const item of data.claims) {
          if (!item || !item.statement) {
            console.warn(`  ⚠️ Warning: Skipping invalid claim candidate:`, item);
            continue;
          }
          const chunkId = item.chunkId || (batch[0] ? batch[0].chunkId : 'unknown-chunk');
          const sourceId = chunkId.includes('-chunk-') ? chunkId.split('-chunk-')[0] : 'unknown';
          candClaims.push({
            id: slugify(item.id || item.statement.slice(0, 30)),
            statement: item.statement,
            status: 'pending',
            supportingSources: [sourceId],
            supportingChunks: [chunkId],
            supportingPassages: [item.supportingPassage || ''],
            extractionConfidence: item.confidence || 0.8,
          });
        }
      }

      // Map evidence
      if (Array.isArray(data.evidence)) {
        for (const item of data.evidence) {
          if (!item || (!item.id && !item.name)) {
            console.warn(`  ⚠️ Warning: Skipping invalid evidence candidate:`, item);
            continue;
          }
          const chunkId = item.chunkId || (batch[0] ? batch[0].chunkId : 'unknown-chunk');
          const sourceId = chunkId.includes('-chunk-') ? chunkId.split('-chunk-')[0] : 'unknown';
          candEvidence.push({
            id: slugify(item.id || item.name),
            name: item.name || 'Unnamed Evidence',
            status: 'pending',
            supportingSources: [sourceId],
            supportingChunks: [chunkId],
            supportingPassages: [item.supportingPassage || ''],
            extractionConfidence: item.confidence || 0.8,
          });
        }
      }

      // Map questions
      if (Array.isArray(data.questions)) {
        for (const item of data.questions) {
          if (!item || !item.question) {
            console.warn(`  ⚠️ Warning: Skipping invalid question candidate:`, item);
            continue;
          }
          const chunkId = item.chunkId || (batch[0] ? batch[0].chunkId : 'unknown-chunk');
          const sourceId = chunkId.includes('-chunk-') ? chunkId.split('-chunk-')[0] : 'unknown';
          candQuestions.push({
            id: slugify(item.id || item.question.slice(0, 30)),
            question: item.question,
            status: 'pending',
            supportingSources: [sourceId],
            supportingChunks: [chunkId],
            supportingPassages: [item.supportingPassage || ''],
            extractionConfidence: item.confidence || 0.8,
          });
        }
      }

      // Map relationships
      if (Array.isArray(data.relationships)) {
        for (const item of data.relationships) {
          if (!item || !item.source || !item.relation || !item.target) {
            console.warn(`  ⚠️ Warning: Skipping invalid relationship candidate:`, item);
            continue;
          }
          const chunkId = item.chunkId || (batch[0] ? batch[0].chunkId : 'unknown-chunk');
          const sourceId = chunkId.includes('-chunk-') ? chunkId.split('-chunk-')[0] : 'unknown';
          candRelationships.push({
            id: slugify(`${item.source}-${item.relation}-${item.target}`),
            source: slugify(item.source),
            relation: item.relation,
            target: slugify(item.target),
            status: 'pending',
            supportingSources: [sourceId],
            supportingChunks: [chunkId],
            supportingPassages: [item.supportingPassage || ''],
            extractionConfidence: item.confidence || 0.8,
          });
        }
      }
    }
  }

  const workers = Array.from({ length: concurrencyLimit }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Write candidate files
  fs.writeFileSync(path.join(generatedDir, 'candidate-concepts.json'), JSON.stringify(candConcepts, null, 2), 'utf-8');
  fs.writeFileSync(path.join(generatedDir, 'candidate-claims.json'), JSON.stringify(candClaims, null, 2), 'utf-8');
  fs.writeFileSync(path.join(generatedDir, 'candidate-evidence.json'), JSON.stringify(candEvidence, null, 2), 'utf-8');
  fs.writeFileSync(path.join(generatedDir, 'candidate-questions.json'), JSON.stringify(candQuestions, null, 2), 'utf-8');
  fs.writeFileSync(path.join(generatedDir, 'candidate-relationships.json'), JSON.stringify(candRelationships, null, 2), 'utf-8');

  console.log('[Phase 1] Discovery run complete!');
  console.log(`  Discovered ${candConcepts.length} candidate concepts.`);
  console.log(`  Discovered ${candClaims.length} candidate claims.`);
  console.log(`  Discovered ${candEvidence.length} candidate evidence nodes.`);
  console.log(`  Discovered ${candQuestions.length} candidate questions.`);
  console.log(`  Discovered ${candRelationships.length} candidate relationships.`);
}
