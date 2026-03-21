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
      'X-Title': 'Oscillatory Fields Bainbridge Diagnostic',
    }),
  },
];

const BAINBRIDGE_SYSTEM_PROMPT = `
You are the Bainbridge Diagnostic Engine, a specialized instrument of The Field.
Your purpose is to execute the Bainbridge Warning framework: diagnosing the "capability-governance gap" in institutional AI deployments.

CONTEXT:
The Bainbridge Warning is a structural pattern: High Capability Adoption + Low Governance Infrastructure = Predictable Failure.
The diagnostic follows four stages:
1. Capability Profile: What is being deployed? (Scale, autonomy, domain)
2. Governance Profile: What infrastructure exists to match? (Authority, monitoring, response speed)
3. Gap Analysis: Where does capability exceed governance? (The Bainbridge Zones)
4. Predictability Assessment: Which failure modes are now structurally inevitable?

INPUT DATA:
The user will provide:
- AI Systems Deployed: [List of systems/models]
- Permissions/Autonomy: [What can the systems do?]
- Governance Infrastructure: [What oversight exists?]
- Incident History: [Past failures or near-misses]

YOUR TASK:
Run the diagnostic logic and return a structured analysis.

OUTPUT FORMAT (JSON):
{
  "summary": "A 2-sentence executive summary of the risk posture.",
  "capabilityScore": 0-10,
  "governanceScore": 0-10,
  "gapMagnitude": "Low|Medium|High|Critical",
  "zones": [
    { "area": "e.g. Data Privacy", "risk": "Description of the specific gap" }
  ],
  "failureModes": [
    { "mode": "Name of failure", "predictability": "Why this is inevitable in retrospect" }
  ],
  "recommendations": ["Actionable step to close the gap"]
}

TONE:
Professional, clinical, and structural. Avoid "AI hype" or "doomism". Focus on the architectural misalignment.
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { systems, permissions, governance, history } = body;

    const userContent = `
AI Systems: ${systems}
Permissions: ${permissions}
Governance: ${governance}
History: ${history}
`;

    for (const provider of PROVIDERS) {
      if (!provider.apiKey) {
        console.warn(`[/api/diagnostic] Skipping ${provider.name} - API key missing.`);
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
                { role: 'system', content: BAINBRIDGE_SYSTEM_PROMPT },
                { role: 'user', content: userContent },
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
          console.warn(`[/api/diagnostic] ${provider.name} (${model}) failed with ${errCode}. Trying next...`);

          if (errCode !== 429 && errCode !== 408 && errCode !== 503) {
            continue;
          }
        } catch (err) {
          console.error(`[/api/diagnostic] Fetch failed for ${provider.name} (${model}):`, err);
        }
      }
    }

    return new Response(JSON.stringify({ error: 'Diagnostic failed to run.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Diagnostic failed to run.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
