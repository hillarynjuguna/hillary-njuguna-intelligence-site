/**
 * /api/digest.js — Notion Digest Feed
 * 
 * Fetches published digest entries from a Notion database
 * and returns them as JSON for the frontend to render.
 * 
 * Required env vars (set in Vercel dashboard):
 *   NOTION_TOKEN        — your Notion integration secret
 *   NOTION_DATABASE_ID  — the ID of your digest database
 * 
 * Notion database schema expected:
 *   Title      (title)        — entry headline
 *   Date       (date)         — publication date
 *   Tags       (multi_select) — e.g. ["Governance", "Bainbridge Warning"]
 *   Summary    (rich_text)    — short teaser (1–2 sentences)
 *   Body       (rich_text)    — full synthesis text
 *   Status     (select)       — "Published" | "Draft"
 */

export default async function handler(req, res) {
  // CORS — allow the site to call this from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return res.status(500).json({
      error: 'Notion credentials not configured',
      hint: 'Set NOTION_TOKEN and NOTION_DATABASE_ID in Vercel environment variables'
    });
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Status',
            select: { equals: 'Published' }
          },
          sorts: [
            { property: 'Date', direction: 'descending' }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      return res.status(502).json({ error: 'Notion API error', detail: error });
    }

    const data = await response.json();

    // Transform Notion's verbose property format into clean objects
    const entries = data.results.map(page => {
      const p = page.properties;

      return {
        id: page.id,
        title: extractText(p.Title),
        date: p.Date?.date?.start || null,
        tags: p.Tags?.multi_select?.map(t => t.name) || [],
        summary: extractText(p.Summary),
        body: extractText(p.Body),
        lastEdited: page.last_edited_time,
      };
    }).filter(e => e.title && e.date); // skip malformed entries

    return res.status(200).json({ entries });

  } catch (err) {
    console.error('Digest fetch error:', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}

/**
 * Extracts plain text from Notion's rich_text or title property arrays.
 * Handles both property types transparently.
 */
function extractText(property) {
  if (!property) return '';
  const arr = property.title || property.rich_text || [];
  return arr.map(block => block.plain_text || '').join('');
}
