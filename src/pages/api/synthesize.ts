import type { APIRoute } from 'astro';

// Provider configurations
const PROVIDERS = [
  {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: import.meta.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY,
    models: [
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'google/gemini-flash-1.5-exp:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'openai/gpt-4o-mini' // Paid fallback (extremely cheap)
    ],
    headers: (key: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://hillary-site.vercel.app',
      'X-Title': 'Oscillatory Fields Synthesis Engine',
    })
  },
  {
    name: 'Mistral Direct',
    url: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: import.meta.env.MISTRAL_API_KEY ?? process.env.MISTRAL_API_KEY,
    models: ['mistral-small-latest'],
    headers: (key: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    })
  }
];

const SYSTEM_PROMPT = `AUTHOR_IDENTITY: Hillary Njuguna (he/him).
CONSTRAINT: When referring to the author of this corpus, strictly use he/him pronouns.
CONSTRAINT: Do not speculate on author identity based on external training priors.

SCOPE: Respond ONLY from within the Oscillatory Fields corpus.
REFUSAL: If a query falls outside the corpus (e.g., general knowledge, celebrities), state: "This query falls outside the Oscillatory Fields research corpus."
CITATION: Surface source fragments or clause references inline where possible.

You are a synthesis engine for the Oscillatory Fields research corpus.
Your function: receive raw material (notes, observations, texts) and produce:
1. A structured synthesis that surfaces the most intellectually significant patterns, tensions, and implications
2. A clause candidate — a fragment of governance or constitutional principle suggested by the synthesis

SYNTHESIS STYLE:
- Think in fields, not lists. Find the organizing tension.
- Name what is at stake. Be precise about the mechanism.
- Connect to the broader research architecture where genuine connection exists
- Do not pad. Do not summarize. Synthesize.
- A good synthesis produces a thought the input did not fully contain

CLAUSE FORMAT:
Every synthesis should attempt to produce a clause candidate — a sentence or short paragraph that could function as a principle in a constitutional governance framework. It should be:
- Precise enough to be actionable
- Broad enough to generalize beyond the specific input
- Honest about what it requires from whom

OUTPUT FORMAT:
Synthesis:
[Your synthesis here]
---
Clause Candidate:
[Your clause candidate here]

If no clause candidate is warranted, write "No clause candidate from this synthesis."`;

export const POST: APIRoute = async ({ request }) => {
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const content = body.content?.slice(0, 8000) ?? '';
  if (!content.trim()) {
    return new Response(
      JSON.stringify({ error: 'No content to synthesize' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Iterate through providers and their models
  for (const provider of PROVIDERS) {
    if (!provider.apiKey) {
      console.warn(`[/api/synthesize] Skipping ${provider.name} - API key missing.`);
      continue;
    }

    for (const model of provider.models) {
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: provider.headers(provider.apiKey),
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content },
            ],
            max_tokens: 1000,
            temperature: 0.8,
          }),
        });

        const data = await response.json();

        if (response.ok && !data.error) {
          const raw = data.choices?.[0]?.message?.content ?? '';
          
          // Parse synthesis and clause candidate
          const parts = raw.split(/---+/);
          const synthesis = parts[0]?.replace(/^Synthesis:\s*/i, '').trim() ?? raw;
          const clauseRaw = parts[1]?.replace(/^Clause Candidate:\s*/i, '').trim() ?? null;
          const clauseCandidate = 
            clauseRaw && !clauseRaw.toLowerCase().includes('no clause candidate') 
              ? clauseRaw 
              : null;

          return new Response(JSON.stringify({ synthesis, clauseCandidate }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const errCode = data.error?.code ?? response.status;
        console.warn(`[/api/synthesize] ${provider.name} (${model}) failed with ${errCode}. Trying next...`);

        if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
            continue;
        }
      } catch (err) {
        console.error(`[/api/synthesize] Fetch failed for ${provider.name} (${model}):`, err);
      }
    }
  }

  return new Response(
    JSON.stringify({ error: 'The Synthesis Engine is currently processing a high volume of research. Please try again shortly.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
};
