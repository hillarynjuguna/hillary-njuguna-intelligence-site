import type { APIRoute } from 'astro';

// Provider-agnostic abstraction layer
// Currently wired to OpenRouter
// To swap providers: update PROVIDER_URL, PROVIDER_KEY, and request format

const PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// List of models to try in order of preference. 
// Mixing free and paid models ensures reliability.
const MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'google/gemini-flash-1.5-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'openai/gpt-4o-mini' // Paid fallback (extremely cheap, ensures the site never "fails" for a user)
];

const SYSTEM_PROMPT = `You are the Research Stack — a synthesis layer built on the Oscillatory Fields research corpus by Hillary Njuguna.

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
  const apiKey = import.meta.env.OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('[/api/chat] OPENROUTER_API_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'Research Stack not configured — API key missing.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

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
  const lastN = messages.slice(-20);

  // Attempt to call OpenRouter with model rotation
  for (const model of MODELS) {
    try {
      const response = await fetch(PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://hillarynjuguna.com',
          'X-Title': 'Oscillatory Fields Research Stack',
        },
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

      // If we hit a rate limit (429) or specific OpenRouter error, log it and try the next model
      const errCode = data.error?.code ?? response.status;
      console.warn(`[/api/chat] Model ${model} failed with ${errCode}. Trying next...`);
      
      if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
          // If it's not a transient/rate-limit error (e.g., 401 Unauthorized), don't bother retrying
          break;
      }
    } catch (err) {
      console.error(`[/api/chat] Fetch failed for model ${model}:`, err);
    }
  }

  // If all models fail, return a professional error message
  return new Response(
    JSON.stringify({ 
      error: 'The Research Stack is currently high-load. Our intelligence nodes are recalibrating—please try again in a moment.' 
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
};
