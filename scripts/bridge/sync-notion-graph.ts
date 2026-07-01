import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local manually
function loadEnv() {
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\\n/g, '\n');
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
// Databases mapped from search
const CYCLE_LOG_DB_ID = 'fa6188ee-d4e4-4297-8e9b-dfe36415bf3c';
const BRIEFS_PARENT_PAGE_ID = '38feb86f-d1b0-813a-960e-e2626c313a1b'; // Page containing the SKAIF briefs
const OUTPUT_FILE = path.resolve('src/data/generated/notion-graph-overlay.json');

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchCycleLog() {
  console.log('🔄 Fetching Cycle Log entries...');
  let hasMore = true;
  let nextCursor: string | undefined = undefined;
  const cyclePages: any[] = [];
  const cleanTargetId = CYCLE_LOG_DB_ID.replace(/\-/g, '').toLowerCase();

  while (hasMore) {
    const response: any = await notion.search({
      start_cursor: nextCursor,
      page_size: 100
    });

    for (const item of response.results) {
      if (item.object !== 'page') continue;
      const parentId = item.parent?.database_id || item.parent?.page_id || item.parent?.data_source_id || '';
      const cleanParentId = parentId.replace(/\-/g, '').toLowerCase();
      if (cleanParentId === cleanTargetId) {
        cyclePages.push(item);
      }
    }

    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }

  console.log(`  Found ${cyclePages.length} cycle log pages in Notion.`);

  const events: any[] = [];
  for (const page of cyclePages) {
    const titleProp = Object.values(page.properties || {}).find((p: any) => p.type === 'title') as any;
    const title = titleProp?.title?.[0]?.plain_text || 'Untitled Event';
    
    // Fetch page content markdown
    let mdString = '';
    try {
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      const mdObj = n2m.toMarkdownString(mdBlocks);
      mdString = typeof mdObj === 'string' ? mdObj : (mdObj?.parent || '');
    } catch (err: any) {
      console.warn(`  ⚠️ Failed to convert page ${page.id} to markdown:`, err.message);
    }

    events.push({
      id: `cycle-${page.id}`,
      title,
      date: page.last_edited_time || page.created_time,
      notionUrl: page.url,
      description: mdString ? mdString.slice(0, 1000) : '', // excerpt of the log
    });
  }
  return events;
}

async function fetchIngestionBriefs() {
  console.log('🔄 Fetching Ingestion Briefs child blocks...');
  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${BRIEFS_PARENT_PAGE_ID}/children`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const briefs: any[] = [];
    
    // Extract metadata from ingestion brief blocks (heading structure)
    let currentBrief: any = null;

    for (const block of data.results) {
      if (block.type === 'heading_1') {
        if (currentBrief) briefs.push(currentBrief);
        currentBrief = {
          title: block.heading_1?.rich_text?.[0]?.plain_text || 'Ingestion Brief',
          id: `brief-${block.id}`,
          claims: [],
          sourceUrl: '',
          capturedAt: '',
          strategy: ''
        };
      } else if (currentBrief && block.type === 'paragraph') {
        const text = block.paragraph?.rich_text?.[0]?.plain_text || '';
        if (text.includes('Source URL:')) {
          const match = text.match(/Source URL:\*\*?\s*\[(.*?)\]/);
          currentBrief.sourceUrl = match ? match[1] : '';
        } else if (text.includes('Captured At:')) {
          const captureMatch = text.match(/Captured At:\*\*?\s*`(.*?)`/);
          const strategyMatch = text.match(/Strategy:\*\*?\s*`(.*?)`/);
          currentBrief.capturedAt = captureMatch ? captureMatch[1] : '';
          currentBrief.strategy = strategyMatch ? strategyMatch[1] : '';
        }
      } else if (currentBrief && block.type === 'bulleted_list_item') {
        const text = block.bulleted_list_item?.rich_text?.[0]?.plain_text || '';
        if (text) {
          currentBrief.claims.push(text);
        }
      }
    }
    if (currentBrief) briefs.push(currentBrief);
    return briefs;
  } catch (err: any) {
    console.error('⚠️ Failed to fetch briefs:', err.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Substrate Bridge v3.0 — Syncing Notion Graph Overlay...');
  
  if (!NOTION_API_KEY) {
    console.log('⚠️ Notion credentials not found in env. Exiting sync.');
    process.exit(0);
  }

  // Ensure target folder exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const events = await fetchCycleLog();
  const briefs = await fetchIngestionBriefs();

  const overlay = {
    generatedAt: new Date().toISOString(),
    events,
    briefs,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(overlay, null, 2), 'utf-8');
  console.log(`\n✅ Graph overlay written successfully: ${OUTPUT_FILE}`);
  console.log(`   Compiled ${events.length} cycle log events.`);
  console.log(`   Compiled ${briefs.length} ingestion briefs.`);
}

main().catch(err => {
  console.error('❌ Notion Sync overlay failed:', err);
  process.exit(1);
});
