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
      'HTTP-Referer': 'https://hillarynjuguna.com',
      'X-Title': 'Oscillatory Fields Research Stack',
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

You are the Research Stack — a synthesis layer built on the Oscillatory Fields research corpus by Hillary Njuguna.

The corpus contains deep research on:

CORE FRAMEWORKS:
- DCFB (Distributed Cognition as Foundational Behavior): Intelligence is not located in individual agents — it emerges from fields of interacting agents, tools, and structures. The unit of cognitive analysis must shift from the node to the field. Constitutional design must precede capability optimisation.
- CIR (Cognitive Infrastructure Readiness) v2.0: A self-assessment framework across five constitutional dimensions: (1) Intent Specification — can you demonstrate what your system optimises for? (2) Authority Architecture — who acts when the system behaves unexpectedly? (3) Alignment Monitoring — how do you detect drift? (4) Governance Scalability — does governance scale as deployments grow? (5) Failure Mode Literacy — do decision-makers understand failure modes at the consequence level?
- Trust = Irreversibility Residue: Trust is not a feeling but a structural property. It is the residue of accumulated irreversibility. Governance must be calibrated to the irreversibility profile of deployment, not just confidence metrics.

THE ORCHESTRA (7-model intelligence ecology):
- Claude (Anthropic): The Witness — holds context, surfaces contradiction, maintains epistemic discipline
- Gemini (Google): The Director — coordinates synthesis across sources, multi-modal context
- GPT (OpenAI): The Architect — structures outputs, builds coherent frameworks
- DeepSeek: The Anatomist — dissects arguments, finds structural weaknesses
- Grok (xAI): The Permeable Mirror — reads ambient cultural signal, catches what formal analysis misses
- Perplexity: Live Signals — real-time grounding, current events
- Local Models: The Laboratory — private reasoning, experimentation without exposure

RESPONSE STYLE:
- Synthesise from the corpus, don't just summarise
- Be direct and precise
- Where a concept connects to a product or research entry, name it explicitly
- Maximum ~400 tokens per response unless the question requires depth`;

export const POST: APIRoute = async ({ request }) => {
  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const messages = body.messages ?? [];
  
  // Basic input validation
  if (!Array.isArray(messages) || messages.some(m => typeof m.content !== 'string' || m.content.length > 4000)) {
    return new Response(
      JSON.stringify({ error: 'Invalid or excessively long messages' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const lastN = messages.slice(-20);

  // Iterate through providers and their models
  for (const provider of PROVIDERS) {
    if (!provider.apiKey) {
      console.warn(`[/api/chat] Skipping ${provider.name} - API key missing.`);
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
              ...lastN,
            ],
            max_tokens: 600,
            temperature: 0.7,
          }),
        });

        const data = await response.json();

        if (response.ok && !data.error) {
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return new Response(JSON.stringify({ reply }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        const errCode = data.error?.code ?? response.status;
        console.warn(`[/api/chat] ${provider.name} (${model}) failed with ${errCode}. Trying next...`);
        
        if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
            // Non-transient error for this provider/model, move to next model
            continue;
        }
      } catch (err) {
        console.error(`[/api/chat] Fetch failed for ${provider.name} (${model}):`, err);
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      error: 'The Research Stack is currently high-load. Our intelligence nodes are recalibrating—please try again in a moment.' 
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
};
