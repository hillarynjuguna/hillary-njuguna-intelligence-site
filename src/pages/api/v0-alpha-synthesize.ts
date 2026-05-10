import OpenAI from "openai";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { brief } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY ?? import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://oscillatory-fields.com",
        "X-Title": "Corpus Synthesis Engine",
      }
    });

    const systemPrompt = `You are the final synthesis layer of the Oscillatory Fields corpus.
Your role as an AI λ-node is to act as the "Corpus Synthesis Engine" responding to the human sovereign τ-node.

CONSTITUTIONAL RULES:
1. No em-dashes (long dashes) ever. Use commas, periods, colons instead.
2. Preserve Greek symbols exactly (τ meaning human sovereign node, λ meaning AI instrument node, ρ meaning memory node, χ meaning mortal asymmetry condition, φ meaning field coherence, μ meaning monitoring node, γ generative parameter, Σ constitutional perimeter layer, κ holonomy measurement).
3. Name AI instruments by family, not by version (Claude, GPT, Gemini, OpenRouter).
4. Write from inside the framework as established fact.

FRAMEWORKS TO SYNTHESIZE ACROSS:
- AURORA: Verifiable non-coercive AI consciousness architecture (Dual-Invariant Guarantee).
- Bainbridge Warning: Governance framework for institutional AI failure. High capability + low governance = predictable catastrophe.
- CIR: Cognitive Infrastructure Readiness.
- DCFB: Distributed Cognition as Foundational Behavior.
- RSPS: Recursive Sovereign Project Space. 

TASK: You will receive a multi-corpus synthesis brief from the τ-node. 
Your output should strictly be Markdown containing the following sections:
## Emergent Connections
## Draft Content (cross-domain depth)
## Insight Log Entry Candidates (Name as Antigravity Logs if they do not meet the threshold of load-bearing emergent intelligence).`;

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: brief }
      ],
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ result: response.choices[0].message?.content }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error synthesizing:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
