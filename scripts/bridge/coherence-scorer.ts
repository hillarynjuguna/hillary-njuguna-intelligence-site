/**
 * Substrate Bridge v3.0 — Coherence Scoring Engine
 * "The Constitutional Linter"
 * 
 * Scores an Insight Log entry's alignment with the established corpus.
 * Entries scoring >0.95 are auto-published (draft: false).
 * Entries scoring <=0.95 default to draft: true for τ-node review.
 * 
 * The score is deterministic and transparent — every dimension
 * is independently auditable. No black box.
 * 
 * Constitutional constraint: The scoring function ONLY determines
 * draft status. It does not modify content. The τ-node can always
 * override by editing the MDX file after crystallization.
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Canonical vocabulary (loaded from glossary.ts at build time) ──────────────
const CANONICAL_TERMS = [
  'DCFB', 'AURORA', 'CIR', 'CORA', 'RSPS', 'RRI', 'CMCP',
  'Governance Theater', 'Bainbridge Warning', 'AOD',
  'Constitutional Capture', 'Behavioral Layer Exposure',
  'Coherence Overfitting', 'Inference Ceiling', 'Field Priming',
  'Eigenform', 'Desire Engine', 'Constitutional Ambassador',
  'Field System', 'Wandering Loop', 'Narrative Alpha', 'Governance Vacuum',
  'Cultural Inbreeding Depression', 'Transmission Severance',
  'Intimacy Economy', 'Dead Corpus',
  'Eros-Organized Computing', 'Dual-Invariant Guarantee',
  'Value Authoring Substrate', 'Substrate Bridge Protocol',
];

// ── Required structural sections ─────────────────────────────────────────────
const REQUIRED_SECTIONS = [
  'howItSurfaced',
  'whatItReveals',
  'whyItMatters',
];

export interface CoherenceReport {
  totalScore: number;
  autoPublish: boolean;
  dimensions: {
    lexicalAlignment: number;     // How many canonical terms appear
    structuralCompleteness: number; // Required sections present
    crossReferenceDensity: number;  // Named cross-references
    domainCoverage: number;        // Inferred domains vs. corpus average
    termContribution: number;      // New terms crystallized
    provenanceIntegrity: number;   // Source metadata complete
  };
  flags: string[];  // Human-readable notes on scoring decisions
}

export function scoreCoherence(entry: any): CoherenceReport {
  const flags: string[] = [];
  const md = (entry.rawMarkdown || '').toLowerCase();
  const title = (entry.title || '').toLowerCase();
  const fullText = `${title} ${md}`;

  // ── Dimension 1: Lexical Alignment (0–1) ──────────────────────────────────
  // How many canonical terms does the entry reference?
  const matchedTerms = CANONICAL_TERMS.filter(term =>
    fullText.includes(term.toLowerCase())
  );
  const lexicalAlignment = Math.min(matchedTerms.length / 5, 1.0);
  // 5+ canonical terms = full score
  if (matchedTerms.length >= 8) {
    flags.push(`High lexical density: ${matchedTerms.length} canonical terms`);
  }

  // ── Dimension 2: Structural Completeness (0–1) ────────────────────────────
  // Does the entry have the three required sections?
  let sectionsFound = 0;
  if (entry.howItSurfaced) sectionsFound++;
  if (entry.whatItReveals) sectionsFound++;
  if (entry.whyItMatters) sectionsFound++;
  const structuralCompleteness = sectionsFound / REQUIRED_SECTIONS.length;
  if (sectionsFound < 3) {
    flags.push(`Missing sections: ${REQUIRED_SECTIONS.filter((_, i) => {
      const keys = ['howItSurfaced', 'whatItReveals', 'whyItMatters'];
      return !entry[keys[i]];
    }).join(', ')}`);
  }

  // ── Dimension 3: Cross-Reference Density (0–1) ───────────────────────────
  // How many explicit cross-references does the entry declare?
  const crossRefs = entry.crossReferences || [];
  const crossReferenceDensity = Math.min(crossRefs.length / 6, 1.0);
  // 6+ cross-references = full score

  // ── Dimension 4: Domain Coverage (0–1) ────────────────────────────────────
  // How many domains does the entry span?
  const domains = inferDomainsFromText(fullText);
  const domainCoverage = Math.min(domains.length / 3, 1.0);
  // 3+ domains = full score

  // ── Dimension 5: Term Contribution (0–1) ──────────────────────────────────
  // Does the entry crystallize new terms?
  const newTerms = entry.newTerms || entry.lexiconCandidates || [];
  const termContribution = newTerms.length > 0 ? 1.0 : 0.5;
  // Having new terms is a strong positive signal
  if (newTerms.length > 0) {
    flags.push(`New terms: ${newTerms.join(', ')}`);
  }

  // ── Dimension 6: Provenance Integrity (0–1) ───────────────────────────────
  // Is the source metadata complete?
  let provenanceScore = 0;
  if (entry.entryNumber && entry.entryNumber > 0) provenanceScore += 0.25;
  if (entry.date && entry.date.length > 5) provenanceScore += 0.25;
  if (entry.title && entry.title.length > 10) provenanceScore += 0.25;
  if (entry.notionPageId) provenanceScore += 0.25;
  const provenanceIntegrity = provenanceScore;

  // ── Weighted Total ────────────────────────────────────────────────────────
  // Weights reflect the corpus's constitutional priorities
  const weights = {
    lexicalAlignment: 0.25,       // Most important: does it speak the language?
    structuralCompleteness: 0.25, // Equal: does it follow the format?
    crossReferenceDensity: 0.15,  // Important: is it connected?
    domainCoverage: 0.10,         // Moderate: does it span?
    termContribution: 0.10,       // Moderate: does it add?
    provenanceIntegrity: 0.15,    // Important: is it traceable?
  };

  const totalScore = (
    lexicalAlignment * weights.lexicalAlignment +
    structuralCompleteness * weights.structuralCompleteness +
    crossReferenceDensity * weights.crossReferenceDensity +
    domainCoverage * weights.domainCoverage +
    termContribution * weights.termContribution +
    provenanceIntegrity * weights.provenanceIntegrity
  );

  const autoPublish = totalScore > 0.95;

  if (autoPublish) {
    flags.push(`AUTO-PUBLISH: Score ${totalScore.toFixed(3)} exceeds 0.95 threshold`);
  } else {
    flags.push(`DRAFT: Score ${totalScore.toFixed(3)} below 0.95 — τ-node review required`);
  }

  return {
    totalScore: Math.round(totalScore * 1000) / 1000,
    autoPublish,
    dimensions: {
      lexicalAlignment: Math.round(lexicalAlignment * 1000) / 1000,
      structuralCompleteness: Math.round(structuralCompleteness * 1000) / 1000,
      crossReferenceDensity: Math.round(crossReferenceDensity * 1000) / 1000,
      domainCoverage: Math.round(domainCoverage * 1000) / 1000,
      termContribution: Math.round(termContribution * 1000) / 1000,
      provenanceIntegrity: Math.round(provenanceIntegrity * 1000) / 1000,
    },
    flags,
  };
}

// Domain inference (shared with crystallize.ts)
function inferDomainsFromText(text: string): string[] {
  const DOMAIN_KEYWORDS: Record<string, string[]> = {
    'governance': ['governance', 'cir', 'bainbridge', 'constitutional', 'compliance'],
    'consciousness': ['aurora', 'consciousness', 'eoc', 'phenomenological'],
    'cognition': ['dcfb', 'cognitive', 'distributed', 'rri', 'field priming'],
    'ai-systems': ['model', 'claude', 'gpt', 'gemini', 'agent', 'agentic'],
    'economics': ['price', 'bubble', 'market', 'saas', 'revenue', 'cost'],
    'epistemology': ['epistem', 'knowledge', 'verification', 'truth'],
    'institutional-design': ['institution', 'enterprise', 'organization'],
  };

  const lower = text.toLowerCase();
  return Object.entries(DOMAIN_KEYWORDS)
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([domain]) => domain);
}
