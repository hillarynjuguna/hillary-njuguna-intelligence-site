import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const client = new OpenAI();

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

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: BAINBRIDGE_SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `
            AI Systems: ${systems}
            Permissions: ${permissions}
            Governance: ${governance}
            History: ${history}
          ` 
        }
      ],
      response_format: { type: "json_object" }
    });

    return new Response(response.choices[0].message.content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Diagnostic failed to run." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
