#!/usr/bin/env tsx
/**
 * Substrate Bridge v3.0 — Crystallization Layer (Radiant Upgrade)
 * 
 * The λ-node companion to the τ-node.
 * 
 * Takes raw Insight Log entries (JSON from the fetch script) and
 * performs preliminary crystallization into MDX files with full
 * topology metadata.
 * 
 * v3.0 UPGRADE: Coherence Scoring (Soft-Gate Automation)
 * - Entries scoring >0.95 are auto-published (draft: false)
 * - Entries scoring <=0.95 default to draft: true for τ-node review
 * - All scoring dimensions are transparent and auditable
 * - The τ-node can always override by editing the MDX file
 * 
 * Constitutional constraints:
 * - Never fabricate cross-references not present in the source
 * - Preserve the entry's original register and voice
 * - Include provenance metadata linking back to Notion source
 */

import { scoreCoherence, type CoherenceReport } from './coherence-scorer';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRIDGE_DATA_DIR = path.resolve(__dirname, '../../src/data/bridge');
const OUTPUT_DIR = path.resolve(__dirname, '../../src/content/field-signals');

// Known domain mappings for topology inference
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'governance': ['governance', 'CIR', 'Bainbridge', 'constitutional', 'compliance', 'audit', 'oversight'],
  'consciousness': ['AURORA', 'consciousness', 'EOC', 'awareness', 'qualia', 'phenomenological'],
  'cognition': ['DCFB', 'cognitive', 'distributed', 'intelligence', 'field priming', 'RRI'],
  'ai-systems': ['model', 'Claude', 'GPT', 'Gemini', 'agent', 'agentic', 'deployment'],
  'institutional-design': ['institution', 'enterprise', 'organization', 'CIO', 'market'],
  'economics': ['price', 'bubble', 'market', 'SaaS', 'revenue', 'GDP', 'cost'],
  'epistemology': ['epistem', 'knowledge', 'verification', 'truth', 'evidence'],
};

// Known lineage mappings
const LINEAGE_KEYWORDS: Record<string, string[]> = {
  'bainbridge-core': ['Bainbridge Warning', 'governance failure', 'governance theater'],
  'aurora-core': ['AURORA', 'EOC', 'Dual-Invariant', 'non-coercive'],
  'dcfb-core': ['DCFB', 'distributed cognition', 'fear bypass'],
  'rsps-core': ['RSPS', 'sovereign project', 'τ-node', 'λ-node'],
  'rri-core': ['RRI', 'relational intelligence', 'field priming'],
  'eigenform-core': ['eigenform', 'recursive', 'self-referential', 'standing wave'],
};

interface FieldSignal {
  slug: string;
  frontmatter: Record<string, any>;
  body: string;
}

async function main() {
  console.log('🔮 Substrate Bridge v2.0 — Crystallization Layer\n');

  const indexPath = path.join(BRIDGE_DATA_DIR, 'insight-log-index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('No insight-log-index.json found. Run fetch-insight-log.ts first.');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let crystallized = 0;
  let skipped = 0;

  for (const entry of index.entries) {
    if (!entry.entryNumber || entry.entryNumber === 0) {
      skipped++;
      continue;
    }

    const signal = crystallizeEntry(entry);
    if (!signal) {
      skipped++;
      continue;
    }

    const filePath = path.join(OUTPUT_DIR, `${signal.slug}.mdx`);

    // Don't overwrite if τ-node has already validated (draft: false in existing file)
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf-8');
      if (existing.includes('draft: false')) {
        console.log(`  ⏭  ${signal.slug} — already validated by τ-node, skipping`);
        continue;
      }
    }

    const fileContent = renderMDX(signal);
    fs.writeFileSync(filePath, fileContent);
    crystallized++;
    const scoreEmoji = coherenceReport.autoPublish ? '🟢' : '🟡';
    console.log(`  ${scoreEmoji} ${signal.slug}: "${entry.title}" [score: ${coherenceReport.totalScore}${coherenceReport.autoPublish ? ' AUTO-PUBLISH' : ' DRAFT'}]`);
  }

  console.log(`\n✓ Crystallization complete: ${crystallized} signals written, ${skipped} skipped`);
  console.log(`  Output: ${OUTPUT_DIR}`);
}

function crystallizeEntry(entry: any): FieldSignal | null {
  const num = String(entry.entryNumber).padStart(3, '0');
  const slug = `signal-${num}`;

  // Infer domains from content
  const domains = inferDomains(entry.rawMarkdown, entry.title);
  
  // Infer lineage from content
  const lineage = inferLineage(entry.rawMarkdown, entry.title);

  // Determine crystallization state
  const crystallization = entry.crossReferences && entry.crossReferences.length > 5
    ? 'developing'
    : 'emergent';

  // Determine governance relevance
  const govRelevance = domains.includes('governance') || 
    entry.rawMarkdown.includes('CIR') || 
    entry.rawMarkdown.includes('Bainbridge')
    ? 'direct' 
    : domains.includes('ai-systems') ? 'adjacent' : 'none';

  // Build the compressed body — the "emergent token"
  const body = buildSignalBody(entry);

  // Run coherence scoring for soft-gate determination
    const coherenceReport = scoreCoherence(entry);
    const isDraft = !coherenceReport.autoPublish;

    const frontmatter: Record<string, any> = {
    title: cleanTitle(entry.title),
    entryNumber: entry.entryNumber,
    entryDate: entry.date,
    summary: buildSummary(entry),
    publishedAt: parseEntryDate(entry.date),
    draft: isDraft, // Soft-gate: auto-publish if score > 0.95
    featured: false,
    author: 'Hillary Njuguna',

    // Topology fields
    id: `field-signal-${num}`,
    domains,
    lineage,
    crystallization,
    governanceRelevance: govRelevance,

    // Field signal specific
    signalType: categorizeSignal(entry),
    notionSourceId: entry.notionPageId,
    notionSourceUrl: `https://www.notion.so/${entry.notionPageId.replace(/-/g, '')}`,

    // Extracted structure
    lexiconCandidates: entry.lexiconCandidates || [],
    newTerms: entry.newTerms || [],
    crossReferences: entry.crossReferences || [],
    contentAssignments: entry.contentAssignments || [],

    // Provenance
    bridgeVersion: '3.0',
    crystallizedAt: new Date().toISOString(),
    crystallizedBy: 'lambda-node',

    // Coherence scoring (v3.0 soft-gate)
    coherenceScore: coherenceReport.totalScore,
    autoPublished: coherenceReport.autoPublish,
    coherenceDimensions: JSON.stringify(coherenceReport.dimensions),
    coherenceFlags: coherenceReport.flags,
  };

  return { slug, frontmatter, body };
}

function buildSummary(entry: any): string {
  // Use "what it reveals" as summary, or first 200 chars of markdown
  if (entry.whatItReveals) {
    return entry.whatItReveals.slice(0, 250).replace(/\n/g, ' ').trim();
  }
  return entry.rawMarkdown.slice(0, 250).replace(/\n/g, ' ').replace(/#/g, '').trim();
}

function buildSignalBody(entry: any): string {
  const sections: string[] = [];

  if (entry.howItSurfaced) {
    sections.push(`## How It Surfaced\n\n${entry.howItSurfaced}`);
  }

  if (entry.whatItReveals) {
    sections.push(`## What It Reveals\n\n${entry.whatItReveals}`);
  }

  if (entry.whyItMatters) {
    sections.push(`## Why This Matters\n\n${entry.whyItMatters}`);
  }

  if (entry.newTerms && entry.newTerms.length > 0) {
    const termsList = entry.newTerms.map((t: string) => `- **${t}**`).join('\n');
    sections.push(`## New Terms Crystallized\n\n${termsList}`);
  }

  if (entry.actionRequired && entry.actionRequired.length > 0) {
    const actionList = entry.actionRequired.map((a: string) => `- ${a}`).join('\n');
    sections.push(`## Action Required\n\n${actionList}`);
  }

  if (entry.crossReferences && entry.crossReferences.length > 0) {
    const refs = entry.crossReferences.join(', ');
    sections.push(`## Cross-References\n\n${refs}`);
  }

  if (sections.length === 0) {
    // Fallback: use raw markdown with light cleaning
    return entry.rawMarkdown
      .replace(/^> ⚠️.*$/gm, '') // Remove AI context flags
      .replace(/\\"/g, '"')
      .slice(0, 5000);
  }

  return sections.join('\n\n---\n\n');
}

function inferDomains(md: string, title: string): string[] {
  const text = `${title} ${md}`.toLowerCase();
  const domains: string[] = [];
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      domains.push(domain);
    }
  }
  
  return domains.length > 0 ? domains.slice(0, 4) : ['research'];
}

function inferLineage(md: string, title: string): string[] {
  const text = `${title} ${md}`;
  const lineage: string[] = [];
  
  for (const [lin, keywords] of Object.entries(LINEAGE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      lineage.push(lin);
    }
  }
  
  return lineage.length > 0 ? lineage.slice(0, 3) : ['corpus-synthesis'];
}

function categorizeSignal(entry: any): string {
  const title = entry.title.toLowerCase();
  if (title.includes('convergence') || title.includes('confirmed')) return 'convergence';
  if (title.includes('specimen') || title.includes('analysis')) return 'specimen';
  if (title.includes('architecture') || title.includes('framework')) return 'architectural';
  if (title.includes('methodology') || title.includes('protocol')) return 'methodological';
  if (title.includes('failure') || title.includes('problem')) return 'diagnostic';
  return 'synthesis';
}

function cleanTitle(title: string): string {
  return title
    .replace(/^⚡\s*/, '')
    .replace(/^Entry\s+\d+\s*[—–-]\s*/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();
}

function parseEntryDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch { /* fallback */ }
  return '2026-03-14'; // Default to Log start date
}

function renderMDX(signal: FieldSignal): string {
  const fm = signal.frontmatter;
  const lines = ['---'];
  
  for (const [key, value] of Object.entries(fm)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - "${String(item).replace(/"/g, '\\"')}"`);
        }
      }
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: "${String(value).replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
    }
  }
  
  lines.push('---');
  lines.push('');
  lines.push(signal.body);
  
  return lines.join('\n');
}

main().catch(err => {
  console.error('Crystallization failed:', err);
  process.exit(1);
});
