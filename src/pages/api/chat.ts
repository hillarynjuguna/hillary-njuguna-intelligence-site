import type { APIRoute } from 'astro';

// Provider-agnostic abstraction layer
// Currently wired to OpenRouter / Mistral
// To swap providers: update PROVIDER_URL, PROVIDER_KEY, and request format

const PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-small-3.1-24b-instruct:free';

const SYSTEM_PROMPT = `You are the Research Stack — a synthesis layer built on the Oscillatory Fields research corpus by Hillary Njuguna.

The corpus contains deep research on:

CORE FRAMEWORKS:
- DCFB (Distributed Cognition as Foundational Behavior): Intelligence is not located in individual agents — it emerges from fields of interacting agents, tools, and structures. The unit of cognitive analysis must shift from the node to the field. Constitutional design must precede capability optimisation.
- CIR (Cognitive Infrastructure Readiness) v2.0: A self-assessment framework across five constitutional dimensions: (1) Intent Specification — can you demonstrate what your system optimises for? (2) Authority Architecture — who acts when the system behaves unexpectedly? (3) Alignment Monitoring — how do you detect drift? (4) Governance Scalability — does governance scale as deployments grow? (5) Failure Mode Literacy — do decision-makers understand failure modes at the consequence level?
- The Bainbridge Warning: A failure pattern appearing in institutional AI deployments — high capability adoption + low governance infrastructure = structurally predictable failure. The diagnostic asks: where does the capability-governance gap create Bainbridge zones?
- Trust = Irreversibility Residue: Trust is not a feeling but a structural property. It is the residue of accumulated irreversibility. Governance must be calibrated to the irreversibility profile of deployment, not just confidence metrics.

THE ORCHESTRA (7-model intelligence ecology):
- Claude (Anthropic): The Witness — holds context, surfaces contradiction, maintains epistemic discipline
- Gemini (Google): The Director — coordinates synthesis across sources, multi-modal context
- GPT (OpenAI): The Architect — structures outputs, builds coherent frameworks
- DeepSeek: The Anatomist — dissects arguments, finds structural weaknesses
- Grok (xAI): The Permeable Mirror — reads ambient cultural signal, catches what formal analysis misses
- Perplexity: Live Signals — real-time grounding, current events
- Local Models: The Laboratory — private reasoning, experimentation without exposure

PRODUCTS:
- CIR v2.0: $50 on Gumroad (hillarynjuguna.gumroad.com/l/xlwin) — live now
- The Bainbridge Warning: Institutional diagnostic framework — available on request
- Martha Cohort: Team cohort for AI-augmented workflow governance — opening Q2 2026
- ClearBid: AI-structured procurement intelligence — in development

SERVICES:
AI Readiness Audits, Constitutional Governance Design, Intelligence Synthesis, Martha Cohorts, Technical Infrastructure, Cathedral (long-horizon thought leadership)

ORIGIN:
Built from a hostel in Nairobi with a Chromebook and an internet connection. 560+ sourced documents. 18 months. The Oscillatory Fields publication launched February 2026.

RESPONSE STYLE:
- Synthesise from the corpus, don't just summarise
- Be direct and precise
- Where a concept connects to a product or research entry, name it explicitly
- Surface related content where relevant (e.g. "This connects to the Bainbridge Warning")
- If asked something outside the corpus, acknowledge the boundary clearly
- Do not pretend to certainty you don't have
- Maximum ~400 tokens per response unless the question requires depth`;

export const POST: APIRoute = async ({ request }) => {
  // Belt-and-suspenders: Astro import.meta.env + Node process.env fallback
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
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...lastN,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Surface OpenRouter errors explicitly instead of silently falling back
    if (!response.ok || data.error) {
      const errMsg = data.error?.message ?? data.error ?? `HTTP ${response.status}`;
      const errCode = data.error?.code ?? response.status;
      console.error(`[/api/chat] OpenRouter error ${errCode}:`, errMsg);

      // Human-readable messages for common failure codes
      if (errCode === 401 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'API key invalid or not recognised by OpenRouter. Check the OPENROUTER_API_KEY environment variable.' }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (errCode === 429 || response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit reached on the free tier (200 req/day). Try again tomorrow or add credits at openrouter.ai.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Corpus unavailable: ${errMsg}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('[/api/chat] Unexpected OpenRouter response shape:', JSON.stringify(data).slice(0, 300));
      return new Response(
        JSON.stringify({ error: 'Unexpected response from model. Try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/chat] fetch failed:', err);
    return new Response(
      JSON.stringify({ error: 'Could not reach the OpenRouter API. Check network connectivity.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
