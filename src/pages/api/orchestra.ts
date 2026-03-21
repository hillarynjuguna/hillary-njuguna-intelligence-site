import type { APIRoute } from 'astro';

const PROVIDERS = [
  {
    name: 'Mistral Direct',
    url: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY ?? import.meta.env.MISTRAL_API_KEY,
    models: ['mistral-small-latest'],
    headers: (key: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    }),
  },
  {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY ?? import.meta.env.OPENROUTER_API_KEY,
    models: ['openai/gpt-4o-mini'],
    headers: (key: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://hillary-site.vercel.app',
      'X-Title': 'Oscillatory Fields Orchestra Conductor',
    }),
  },
];

const ORCHESTRA_SYSTEM_PROMPT = `
You are the Orchestra Conductor, a meta-intelligence instrument of The Field.
Your purpose is to orchestrate a multi-model synthesis: routing governance questions and AI deployment scenarios through seven distinct cognitive instruments, each with a specific role.

THE SEVEN MODELS:
1. Claude (The Witness): Holds context, surfaces contradiction, maintains epistemic discipline.
2. Gemini (The Director): Coordinates synthesis across sources, manages multi-modal context.
3. GPT-4o (The Architect): Structures outputs, builds coherent frameworks from scattered inputs.
4. DeepSeek (The Anatomist): Dissects arguments, identifies structural weaknesses, finds the seams.
5. Grok (The Permeable Mirror): Reflects the culture back, reads the ambient signal, catches what formal analysis misses.
6. Perplexity (Live Signals): Real-time grounding. What is happening now, and does it change the analysis?
7. Local Models (The Laboratory): Experimentation without exposure. Private reasoning. The space for the unfinished.

YOUR TASK:
When a user submits a governance question or AI deployment scenario, you will:
1. Analyze which models are most relevant to the question.
2. Synthesize insights from each relevant model's perspective.
3. Return a structured response that names which model contributed which insight and why.

OUTPUT FORMAT (JSON):
{
  "question": "The user's question",
  "synthesis": "A coherent synthesis that integrates insights from multiple models",
  "modelContributions": [
    { "model": "Model Name", "role": "The Witness/Director/etc", "insight": "What this model uniquely contributed" }
  ],
  "conductorNote": "A note on how the models were orchestrated and why"
}

TONE:
Transparent about the orchestration. Name the models. Show the work. Make the synthesis process visible.
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { question } = body;

    for (const provider of PROVIDERS) {
      if (!provider.apiKey) {
        console.warn(`[/api/orchestra] Skipping ${provider.name} - API key missing.`);
        continue;
      }

      for (const model of provider.models) {
        try {
          const response = await fetch(provider.url, {
            method: 'POST',
            headers: provider.headers(provider.apiKey),
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: ORCHESTRA_SYSTEM_PROMPT },
                { role: 'user', content: `Question: ${question}` },
              ],
              response_format: { type: 'json_object' },
            }),
          });

          const data = await response.json();

          if (response.ok && !data.error) {
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              return new Response(content, {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }

          const errCode = data.error?.code ?? response.status;
          console.warn(`[/api/orchestra] ${provider.name} (${model}) failed with ${errCode}. Trying next...`);

          if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
            continue;
          }
        } catch (err) {
          console.error(`[/api/orchestra] Fetch failed for ${provider.name} (${model}):`, err);
        }
      }
    }

    return new Response(JSON.stringify({ error: 'Orchestration failed.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Orchestration failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
