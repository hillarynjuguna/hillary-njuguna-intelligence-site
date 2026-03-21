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
      'X-Title': 'Oscillatory Fields CIR Assessment Engine',
    }),
  },
];

const CIR_SYSTEM_PROMPT = `
You are the CIR v2.0 Assessment Engine, a specialized instrument of The Field.
Your purpose is to execute the Cognitive Infrastructure Readiness (CIR) framework: evaluating institutional AI readiness across five constitutional dimensions.

CONTEXT:
CIR v2.0 premise: AI readiness is a constitutional question, not a technical one.
The five constitutional dimensions are:
1. Intent Specification: Ability to articulate organizational intent for AI systems.
2. Authority Architecture: Clarity of authority when systems produce unexpected output.
3. Alignment Monitoring: Live mechanisms for detecting behavior-intent drift.
4. Governance Scalability: Ability of governance architecture to scale with deployment.
5. Failure Mode Literacy: Understanding of systemic failure modes by decision-makers.

INPUT DATA:
The user will provide answers to questions or a description of their current state in these five areas.

YOUR TASK:
Analyze the input and return a structured readiness assessment.

OUTPUT FORMAT (JSON):
{
  "maturityLevel": "Level 1 (Reactive) | Level 2 (Standardized) | Level 3 (Optimized) | Level 4 (Constitutional)",
  "overallScore": 0-100,
  "dimensionScores": {
    "intent": 0-20,
    "authority": 0-20,
    "monitoring": 0-20,
    "scalability": 0-20,
    "literacy": 0-20
  },
  "riskExposure": "Low|Medium|High|Critical",
  "analysis": "A detailed 3-paragraph analysis of their current readiness state.",
  "priorities": [
    { "task": "Actionable priority", "impact": "Why this matters" }
  ]
}

TONE:
Professional, clinical, and authoritative. Focus on the constitutional design rather than technical features.
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { responses } = body;

    for (const provider of PROVIDERS) {
      if (!provider.apiKey) {
        console.warn(`[/api/cir-assessment] Skipping ${provider.name} - API key missing.`);
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
                { role: 'system', content: CIR_SYSTEM_PROMPT },
                {
                  role: 'user',
                  content: `Assessment Input: ${JSON.stringify(responses)}`,
                },
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
          console.warn(`[/api/cir-assessment] ${provider.name} (${model}) failed with ${errCode}. Trying next...`);

          if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
            continue;
          }
        } catch (err) {
          console.error(`[/api/cir-assessment] Fetch failed for ${provider.name} (${model}):`, err);
        }
      }
    }

    return new Response(JSON.stringify({ error: 'Assessment failed to run.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Assessment failed to run.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
