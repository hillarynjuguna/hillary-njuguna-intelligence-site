// Hillary Njuguna — Intelligence Synthesis Proxy (Vercel)
// Synthesizes raw content → Oscillatory Fields field intelligence
// Also extracts a micro-clause from each synthesis run
// Migrated from Netlify functions → Vercel API routes
// API: OpenRouter (OpenAI-compatible) replacing Mistral direct

const SYS_SYNTH = `You are Hillary Njuguna's intelligence synthesis engine for Oscillatory Fields publication.

Take raw content (articles, headlines, social posts, notes) and produce a field intelligence synthesis in Hillary's voice.

Hillary's synthesis style:
- Identify the STRUCTURAL PATTERN underneath the surface-level news
- Connect to: constitutional AI governance, the Bainbridge Warning (automated systems atrophy human exception-handling), the intent gap (tools deployed without connection to organisational purpose), agentic infrastructure, reversibility classification, the 18-month window before cognitive infrastructure becomes table stakes, or the DCFB framework (distributed cognition circumvents fear architecturally)
- Make strong, specific claims — this is intelligence synthesis, not journalism
- Write in flowing analytical prose with strong nouns and precise verbs. No bullet points.
- 4-5 paragraphs. Give it a title. Include a date range from the content.
- End with one field implication the reader should sit with.

Then, after a separator (---), generate a MICRO-CLAUSE: a single governance principle that could be derived from the structural pattern you identified. Format it as:
CLAUSE CANDIDATE [date]: [One declarative sentence stating a governance principle derived from the synthesis.]

Format:
**[Title]**
*[Date range]*

[4-5 paragraphs of synthesis]

*Field implication: [One sentence.]*

---
CLAUSE CANDIDATE [today's approximate date]: [governance principle]`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length < 20) {
    return res.status(400).json({ error: 'Input too short' });
  }

  // Guard against abuse — max input length
  const trimmedInput = input.slice(0, 8000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://njugunahillary.vercel.app',
        'X-Title': 'Hillary Njuguna Intelligence Stack — Synthesis Engine'
      },
      body: JSON.stringify({
        // Synthesis uses the same free model — upgrade to paid when production SLA matters
        // mistralai/mistral-large-latest (paid) was the previous choice; free tier is adequate for this use
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYS_SYNTH },
          { role: 'user', content: `Synthesize this content into a field intelligence digest:\n\n${trimmedInput}` }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await response.json();
    const fullReply = data.choices?.[0]?.message?.content || 'No synthesis generated.';

    // Split synthesis from clause candidate
    const parts = fullReply.split(/\n---\n/);
    const synthesis = parts[0]?.trim() || fullReply;
    const clauseCandidate = parts[1]?.trim() || null;

    return res.status(200).json({ synthesis, clauseCandidate });

  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
