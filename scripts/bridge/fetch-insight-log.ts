#!/usr/bin/env tsx
/**
 * Substrate Bridge v2.0 — Insight Log Fetcher
 * 
 * Fetches child pages from the Insight Log parent page in Notion,
 * extracts structured metadata from each entry, and outputs raw
 * JSON for the crystallization layer.
 * 
 * The Insight Log is not a database — it is a page with child pages
 * (entries 043+) and inline content (entries 001–042). This script
 * handles both structures.
 * 
 * Constitutional constraint: This script FETCHES. It does not JUDGE.
 * Crystallization judgment belongs to the τ-node validation layer.
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INSIGHT_LOG_PAGE_ID = '323eb86fd1b08127a7acfa79076bf208';
const OUTPUT_DIR = path.resolve(__dirname, '../../src/data/bridge');

interface InsightLogEntry {
  id: string;
  notionPageId: string;
  entryNumber: number;
  date: string;
  title: string;
  rawMarkdown: string;
  lastEditedTime: string;
  // Extracted structured fields (populated by crystallization layer)
  howItSurfaced?: string;
  whatItReveals?: string;
  whyItMatters?: string;
  actionRequired?: string[];
  contentAssignments?: string[];
  lexiconCandidates?: string[];
  crossReferences?: string[];
  newTerms?: string[];
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  console.log('🔭 Substrate Bridge v2.0 — Fetching Insight Log...\n');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Fetch the Insight Log page to get child page references
  const logPage = await notion.blocks.children.list({
    block_id: INSIGHT_LOG_PAGE_ID,
    page_size: 100,
  });

  const childPageBlocks = logPage.results.filter(
    (block: any) => block.type === 'child_page'
  );

  console.log(`  Found ${childPageBlocks.length} child page entries`);

  const entries: InsightLogEntry[] = [];
  let fetchedCount = 0;

  // Check for existing manifest to enable incremental sync
  const manifestPath = path.join(OUTPUT_DIR, 'sync-manifest.json');
  let manifest: Record<string, string> = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  for (const block of childPageBlocks) {
    const pageBlock = block as any;
    const pageId = pageBlock.id;
    const title = pageBlock.child_page?.title || 'Untitled';

    // Extract entry number and date from title
    const entryMatch = title.match(/Entry\s+(\d+)/i);
    const dateMatch = title.match(/(\w+\s+\d{1,2},?\s+\d{4})/);
    const entryNumber = entryMatch ? parseInt(entryMatch[1], 10) : 0;
    const date = dateMatch ? dateMatch[1] : '';

    // Fetch the page metadata for last_edited_time
    const pageMeta = await notion.pages.retrieve({ page_id: pageId });
    const lastEdited = (pageMeta as any).last_edited_time;

    // Incremental sync: skip if unchanged
    if (manifest[pageId] === lastEdited) {
      console.log(`  ⏭  Entry ${entryNumber}: "${title}" — unchanged, skipping`);
      // Still include in entries array from cached data
      const cachedPath = path.join(OUTPUT_DIR, `entry-${String(entryNumber).padStart(3, '0')}.json`);
      if (fs.existsSync(cachedPath)) {
        entries.push(JSON.parse(fs.readFileSync(cachedPath, 'utf-8')));
      }
      continue;
    }

    // Convert Notion blocks to markdown
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const rawMarkdown = n2m.toMarkdownString(mdBlocks).parent;

    const entry: InsightLogEntry = {
      id: `field-signal-${String(entryNumber).padStart(3, '0')}`,
      notionPageId: pageId,
      entryNumber,
      date,
      title: title.replace(/^⚡\s*/, '').trim(),
      rawMarkdown,
      lastEditedTime: lastEdited,
    };

    // Extract structured sections from markdown
    entry.howItSurfaced = extractSection(rawMarkdown, 'How it surfaced');
    entry.whatItReveals = extractSection(rawMarkdown, 'What it reveals');
    entry.whyItMatters = extractSection(rawMarkdown, 'Why this matters');
    entry.actionRequired = extractBulletList(rawMarkdown, 'Action required');
    entry.contentAssignments = extractBulletList(rawMarkdown, 'Content assignment');
    entry.crossReferences = extractCrossRefs(rawMarkdown);
    entry.lexiconCandidates = extractLexiconCandidates(rawMarkdown);
    entry.newTerms = extractNewTerms(rawMarkdown);

    entries.push(entry);
    fetchedCount++;

    // Write individual entry cache
    const entryPath = path.join(OUTPUT_DIR, `entry-${String(entryNumber).padStart(3, '0')}.json`);
    fs.writeFileSync(entryPath, JSON.stringify(entry, null, 2));

    // Update manifest
    manifest[pageId] = lastEdited;

    console.log(`  ✓  Entry ${entryNumber}: "${title}"`);

    // Rate limiting: Notion API allows 3 requests/second
    await sleep(350);
  }

  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Write full entries index
  const indexPath = path.join(OUTPUT_DIR, 'insight-log-index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    totalEntries: entries.length,
    newlyFetched: fetchedCount,
    entries: entries.sort((a, b) => a.entryNumber - b.entryNumber),
  }, null, 2));

  console.log(`\n✓ Sync complete: ${fetchedCount} new/updated, ${entries.length} total`);
  console.log(`  Index: ${indexPath}`);
  console.log(`  Manifest: ${manifestPath}`);
}

// ── Extraction utilities ──────────────────────────────────────────────────────

function extractSection(md: string, heading: string): string | undefined {
  const regex = new RegExp(
    `\\*\\*${heading}[:\\s]*\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[A-Z]|---|\n##|$)`,
    'i'
  );
  const match = md.match(regex);
  return match ? match[1].trim().slice(0, 2000) : undefined;
}

function extractBulletList(md: string, heading: string): string[] {
  const section = extractSection(md, heading);
  if (!section) return [];
  return section
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[\s\-\*]+/, '').trim())
    .filter(Boolean);
}

function extractCrossRefs(md: string): string[] {
  const section = extractSection(md, 'Cross-reference');
  if (!section) return [];
  return section
    .split(/[,;]/)
    .map(ref => ref.trim())
    .filter(ref => ref.length > 2 && ref.length < 100);
}

function extractLexiconCandidates(md: string): string[] {
  const candidates: string[] = [];
  // Match patterns like "New Lexicon term candidate:" or "New term candidate:"
  const regex = /(?:New\s+)?(?:Lexicon\s+)?term\s+(?:candidate|crystallized)[:\s]*\*\*([^*]+)\*\*/gi;
  let match;
  while ((match = regex.exec(md)) !== null) {
    candidates.push(match[1].trim());
  }
  return candidates;
}

function extractNewTerms(md: string): string[] {
  const terms: string[] = [];
  // Match bold terms followed by em dash definitions
  const regex = /\*\*([A-Z][^*]{3,60})\*\*\s*[—–]/g;
  let match;
  while ((match = regex.exec(md)) !== null) {
    const term = match[1].trim();
    // Filter out common non-term patterns
    if (!term.includes('Action') && !term.includes('Why') && !term.includes('How') && !term.includes('What')) {
      terms.push(term);
    }
  }
  return [...new Set(terms)];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('Bridge sync failed:', err);
  process.exit(1);
});
