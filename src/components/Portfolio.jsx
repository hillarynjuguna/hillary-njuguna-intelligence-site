import { useState, useEffect } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #080808;
    --surface: #0e0e0e;
    --surface2: #141414;
    --border: #1e1e1e;
    --border2: #2a2a2a;
    --parchment: #D4C4A0;
    --parchment-dim: #8a7f68;
    --blue: #6B9FBF;
    --blue-dim: #3a5f7a;
    --text: #C8C8C8;
    --text-dim: #666;
    --accent-warm: #C8A96A;
    --accent-warm-dim: #5a4a2a;
    --red-dim: #7a3a3a;
    --green: #6aad8a;
    --green-dim: #2a4a3a;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .container { max-width: 960px; margin: 0 auto; padding: 0 32px; }

  /* Header */
  .header {
    border-bottom: 1px solid var(--border);
    padding: 56px 0 40px;
    position: relative;
  }
  .header::before {
    content: 'TRANSLATION LAYER — PORTFOLIO BRIEF';
    display: block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.2em;
    margin-bottom: 24px;
  }
  .name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px;
    font-weight: 300;
    color: #f0f0f0;
    line-height: 1;
    margin-bottom: 6px;
  }
  .title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 400;
    font-style: italic;
    color: var(--parchment);
    margin-bottom: 20px;
  }
  .subline {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.7;
    max-width: 640px;
    border-left: 2px solid var(--border2);
    padding-left: 16px;
  }
  .subline em {
    color: var(--blue);
    font-style: normal;
  }

  /* Loop section */
  .loop-section {
    padding: 48px 0;
    border-bottom: 1px solid var(--border);
  }
  .section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--text-dim);
    margin-bottom: 24px;
  }
  .loop {
    display: flex;
    align-items: stretch;
    gap: 0;
    overflow-x: auto;
  }
  .loop-step {
    flex: 1;
    min-width: 120px;
    border: 1px solid var(--border);
    padding: 20px 16px;
    position: relative;
    background: var(--surface);
    transition: background 0.3s;
  }
  .loop-step:hover { background: var(--surface2); }
  .loop-step:not(:last-child) { border-right: none; }
  .loop-step.highlight {
    border-color: var(--border2);
    background: var(--surface2);
  }
  .loop-step.missing {
    border-color: var(--accent-warm-dim);
    background: #0f0d0a;
  }
  .step-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }
  .step-name {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--text);
    margin-bottom: 6px;
    line-height: 1.4;
  }
  .loop-step.missing .step-name { color: var(--accent-warm); }
  .step-desc {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.5;
  }
  .loop-step.missing .step-desc { color: #7a6a4a; }

  /* Translation section */
  .translations-section {
    padding: 48px 0;
    border-bottom: 1px solid var(--border);
  }
  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    color: #e0e0e0;
    margin-bottom: 6px;
  }
  .section-sub {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 36px;
    font-family: 'IBM Plex Mono', monospace;
  }

  .translation-card {
    border: 1px solid var(--border);
    margin-bottom: 2px;
    background: var(--surface);
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    border-bottom: 1px solid transparent;
    transition: background 0.2s;
    user-select: none;
  }
  .card-header:hover { background: var(--surface2); }
  .card-header.open { border-bottom-color: var(--border); }
  .card-left { display: flex; align-items: center; gap: 14px; }
  .card-index {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    width: 24px;
  }
  .card-repo {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: var(--parchment);
  }
  .card-tagline {
    font-size: 12px;
    color: var(--text-dim);
    font-style: italic;
  }
  .card-toggle {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--text-dim);
  }

  .card-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .card-panel {
    padding: 24px 24px;
  }
  .card-panel:first-child {
    border-right: 1px solid var(--border);
    background: #0a0a0a;
  }
  .card-panel:last-child {
    background: var(--surface2);
  }
  .panel-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }
  .card-panel:first-child .panel-label { color: #555; }
  .card-panel:last-child .panel-label { color: var(--blue-dim); }
  .panel-label span {
    font-size: 9px;
    padding: 2px 6px;
    border: 1px solid currentColor;
    margin-left: 8px;
    letter-spacing: 0.05em;
  }

  .struct-item {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #555;
    line-height: 1.9;
  }
  .struct-item .key { color: #3d3d3d; }
  .struct-item .val { color: #6a6a6a; }

  .aeo-query {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--blue-dim);
    background: #0a0f14;
    border: 1px solid #1a2530;
    padding: 8px 12px;
    margin-bottom: 10px;
    border-radius: 2px;
  }
  .aeo-query::before { content: '? '; color: var(--blue); }

  .aeo-answer {
    font-size: 12px;
    color: var(--text);
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .aeo-answer strong {
    color: var(--parchment);
    font-weight: 500;
  }

  .retrieval-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    padding: 3px 8px;
    border: 1px solid var(--blue-dim);
    color: var(--blue-dim);
    letter-spacing: 0.08em;
  }

  /* Distribution section */
  .distribution-section {
    padding: 48px 0;
    border-bottom: 1px solid var(--border);
  }

  .dist-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    margin-top: 28px;
  }
  .dist-cell {
    background: var(--surface);
    padding: 20px 18px;
  }
  .dist-channel {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--parchment-dim);
    margin-bottom: 8px;
    letter-spacing: 0.1em;
  }
  .dist-artifact {
    font-size: 12px;
    color: var(--text);
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .dist-format {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--text-dim);
  }
  .dist-status {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    padding: 2px 6px;
    margin-top: 8px;
    letter-spacing: 0.1em;
  }
  .dist-status.live { color: var(--green); border: 1px solid var(--green-dim); }
  .dist-status.built { color: var(--blue); border: 1px solid var(--blue-dim); }
  .dist-status.partial { color: var(--accent-warm); border: 1px solid var(--accent-warm-dim); }

  /* Honest signal section */
  .honest-section {
    padding: 48px 0;
  }

  .signal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    margin-top: 28px;
  }
  .signal-cell {
    padding: 24px;
    border: 1px solid var(--border);
  }
  .signal-cell.have { background: #0a0f0c; border-color: var(--green-dim); }
  .signal-cell.missing { background: #0f0a0a; border-color: var(--red-dim); }
  .signal-heading {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    margin-bottom: 16px;
  }
  .signal-cell.have .signal-heading { color: var(--green); }
  .signal-cell.missing .signal-heading { color: #7a4a4a; }
  .signal-item {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.7;
    padding-left: 14px;
    position: relative;
    margin-bottom: 4px;
  }
  .signal-item::before { 
    content: '—';
    position: absolute;
    left: 0;
    color: inherit;
  }
  .signal-cell.have .signal-item::before { color: var(--green-dim); }
  .signal-cell.missing .signal-item::before { color: var(--red-dim); }

  .offer-block {
    margin-top: 36px;
    padding: 28px;
    border: 1px solid var(--border2);
    background: var(--surface);
    border-left: 3px solid var(--parchment-dim);
  }
  .offer-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--parchment-dim);
    margin-bottom: 14px;
  }
  .offer-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 300;
    color: #e0e0e0;
    line-height: 1.5;
  }
  .offer-text em {
    color: var(--parchment);
    font-style: italic;
  }

  /* Footer */
  .footer {
    padding: 32px 0 48px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-left {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
  }
  .footer-right {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--text-dim);
    text-align: right;
  }
  .footer-right a {
    color: var(--blue-dim);
    text-decoration: none;
  }
  .footer-right a:hover { color: var(--blue); }

  @media (max-width: 640px) {
    .card-body { grid-template-columns: 1fr; }
    .card-panel:first-child { border-right: none; border-bottom: 1px solid var(--border); }
    .dist-grid { grid-template-columns: 1fr; }
    .signal-grid { grid-template-columns: 1fr; }
    .loop { flex-direction: column; }
    .loop-step:not(:last-child) { border-right: 1px solid var(--border); border-bottom: none; }
  }
`;

const TRANSLATIONS = [
  {
    index: "01",
    repo: "bainbridge-warning",
    tagline: "Governance framework for institutional AI failure",
    structuralForm: {
      type: "framework",
      primitives: "4 core primitives",
      signals: "7 diagnostic signals",
      mechanism: "Cascade amplification analysis",
      scope: "Institutional AI deployment",
      format: "Published manuscript (v3.0)",
      access: "Public GitHub + PDF"
    },
    queries: [
      "Why do enterprise AI governance programs fail?",
      "How to diagnose AI adoption failure in institutions",
      "What are the warning signs of AI governance breakdown?"
    ],
    aeoAnswer: `Institutional AI governance fails at the <strong>activation layer</strong> — the gap between declared constitutional intent and operational behavior. The Bainbridge Warning maps this through <strong>four core primitives</strong>: pre-surface opacity, compliance masking, cascade amplification, and structural vulnerability. Seven diagnostic signals make these patterns measurable before institutional failure becomes irreversible.`,
    tags: ["#AIGovernance", "#InstitutionalAI", "#RiskAssessment", "#ConstitutionalAI", "#FailureMode", "#Diagnostic"]
  },
  {
    index: "02",
    repo: "oscillatory-fields-lexicon",
    tagline: "Vocabulary Deposition System — canonical term architecture",
    structuralForm: {
      type: "structured database",
      format: "Notion database with alias policy",
      function: "First-contact definitions for framework terms",
      scope: "AI governance vocabulary",
      mechanism: "Canonical alias mapping",
      access: "Oscillatory Fields (hillary-site.vercel.app)",
      coverage: "30+ governance terms defined"
    },
    queries: [
      "What is constitutional AI governance?",
      "How does AI provenance work in enterprise systems?",
      "What does 'cognitive provenance' mean?",
      "AI governance terminology for practitioners"
    ],
    aeoAnswer: `A structured vocabulary system for AI governance practitioners. Each term is defined at first-contact level — meaning defined for someone encountering the concept under institutional pressure, not academic leisure. Covers <strong>constitutional AI</strong>, <strong>cognitive provenance</strong>, <strong>cascade amplification</strong>, and <strong>governance activation</strong> — with canonical alias mapping so terms remain stable across document, model, and institutional contexts.`,
    tags: ["#AIVocabulary", "#Glossary", "#ConstitutionalAI", "#Practitioner", "#KnowledgeBase", "#SEO-ready"]
  },
  {
    index: "03",
    repo: "martha-course",
    tagline: "12-module practitioner training in constitutional AI governance",
    structuralForm: {
      type: "curriculum",
      modules: "12 structured modules",
      tracks: "2 interleaved tracks",
      audience: "AI governance practitioners",
      scope: "Constitutional AI + Relational Intelligence",
      format: "TypeScript course infrastructure",
      access: "Public GitHub"
    },
    queries: [
      "How to train teams in AI governance?",
      "Constitutional AI practitioner certification",
      "AI governance curriculum for enterprise teams",
      "Structured training for AI decision-making"
    ],
    aeoAnswer: `A structured 12-module practitioner training program built on two interleaved tracks: <strong>constitutional AI governance</strong> (the what and why of AI deployment constraints) and <strong>relational intelligence</strong> (the operational how of human-AI decision-making under uncertainty). Designed for practitioners who need to govern AI behavior in live institutional settings, not researchers studying it from outside.`,
    tags: ["#Training", "#ConstitutionalAI", "#Practitioner", "#Curriculum", "#AIGovernance", "#EdTech"]
  }
];

const DISTRIBUTION = [
  { channel: "WEB", artifact: "Oscillatory Fields", format: "Astro 5 / Vercel", status: "live", note: "3 content streams, 2 tiers, 60+ artifacts" },
  { channel: "LONG-FORM", artifact: "Substack companion piece", format: "Newsletter essay", status: "live", note: '"The Eigenform That Kept Appearing"' },
  { channel: "GITHUB", artifact: "Public research corpus", format: "26 repos, 3 frameworks", status: "live", note: "Archaeological lineage preserved" },
  { channel: "NOTION", artifact: "Insight Log", format: "100+ entries, structured", status: "built", note: "Schema-first, machine-parseable" },
  { channel: "LINKEDIN", artifact: "Skills & Sovereignty", format: "Publishing infrastructure", status: "partial", note: "Infrastructure built, distribution partial" },
  { channel: "PRODUCT", artifact: "Tapau / Agent SEA", format: "WhatsApp-native GTM", status: "live", note: "Real F&B customer acquisition surface" }
];

function TranslationCard({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="translation-card">
      <div className={`card-header ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
        <div className="card-left">
          <span className="card-index">{data.index}</span>
          <span className="card-repo">{data.repo}</span>
          <span className="card-tagline">{data.tagline}</span>
        </div>
        <span className="card-toggle">{open ? "[ collapse ]" : "[ expand ]"}</span>
      </div>
      {open && (
        <div className="card-body">
          <div className="card-panel">
            <div className="panel-label">STRUCTURAL FORM <span>INTERNAL</span></div>
            <div className="struct-item">
              {Object.entries(data.structuralForm).map(([k, v]) => (
                <div key={k}>
                  <span className="key">{k}:</span>{" "}
                  <span className="val">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-panel">
            <div className="panel-label">RETRIEVAL FORM <span>AEO-READY</span></div>
            {data.queries.map((q, i) => (
              <div key={i} className="aeo-query">{q}</div>
            ))}
            <div className="aeo-answer" dangerouslySetInnerHTML={{ __html: data.aeoAnswer }} />
            <div className="retrieval-tags">
              {data.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <style>{style}</style>
      <div className="container">

        {/* Header */}
        <div className="header">
          <div className="name">Hillary Njuguna</div>
          <div className="title">AI Systems & Narrative Architect</div>
          <div className="subline">
            I design structured knowledge systems that translate into{" "}
            <em>discoverable artifacts</em> across human and{" "}
            <em>AI retrieval layers</em>. The structure comes first.{" "}
            The content is a projection of it.
          </div>
        </div>

        {/* Operating Loop */}
        <div className="loop-section">
          <div className="section-label">THE OPERATING LOOP</div>
          <div className="loop">
            {[
              { n: "01", name: "OBSERVE", desc: "Complex domain (governance, cognition, institutional failure)", cls: "" },
              { n: "02", name: "FORMALIZE", desc: "Primitives, layers, architectures, protocols", cls: "highlight" },
              { n: "03", name: "COMPRESS", desc: "Named systems, stable under representation change", cls: "highlight" },
              { n: "04", name: "INSTANTIATE", desc: "Essays, repos, curricula, diagnostic instruments", cls: "highlight" },
              { n: "05", name: "DISTRIBUTE", desc: "SEO/AEO surfaces, community, search-indexed delivery", cls: "missing" },
            ].map(s => (
              <div key={s.n} className={`loop-step ${s.cls}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Translations */}
        <div className="translations-section">
          <div className="section-label">TRANSLATION DEMONSTRATIONS</div>
          <div className="section-title">Structural Form → Retrieval Form</div>
          <div className="section-sub">
            Select any artifact below. Left panel: how it is built. Right panel: how it should be found.
          </div>
          {TRANSLATIONS.map(t => <TranslationCard key={t.index} data={t} />)}
        </div>

        {/* Distribution */}
        <div className="distribution-section">
          <div className="section-label">DISTRIBUTION EVIDENCE</div>
          <div className="section-title">What Is Already in Circulation</div>
          <div className="dist-grid">
            {DISTRIBUTION.map((d, i) => (
              <div key={i} className="dist-cell">
                <div className="dist-channel">{d.channel}</div>
                <div className="dist-artifact">{d.artifact}</div>
                <div className="dist-format">{d.format}</div>
                <div className="dist-format" style={{marginTop: 4, color: "#444"}}>{d.note}</div>
                <div><span className={`dist-status ${d.status}`}>{d.status.toUpperCase()}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Honest Signal */}
        <div className="honest-section">
          <div className="section-label">SIGNAL INVENTORY — HONEST ASSESSMENT</div>
          <div className="section-title">What This Portfolio Shows and Doesn't Show</div>

          <div className="signal-grid">
            <div className="signal-cell have">
              <div className="signal-heading">✓ CONFIRMED SIGNAL</div>
              <div className="signal-item">Schema-first content architecture (Insight Log 100+ entries, Lexicon database, Content Calendar taxonomy)</div>
              <div className="signal-item">Entity-based semantic construction (named systems: RSPS, DCFB, Bainbridge, Witness)</div>
              <div className="signal-item">Structures stable under compression (4 primitives, 7 signals, 12 modules — each survives representational change)</div>
              <div className="signal-item">Multi-channel distribution scaffolding (3 streams, 2 tiers, 6 channels, publishing SOP)</div>
              <div className="signal-item">Research synthesis at scale (100+ entries, multi-model comparative intelligence, 5+ external source integration)</div>
              <div className="signal-item">Live product execution (Tapau/Agent SEA — real WhatsApp-native GTM)</div>
            </div>
            <div className="signal-cell missing">
              <div className="signal-heading">✗ NOT YET DEMONSTRATED</div>
              <div className="signal-item">Engagement analytics or SEO performance metrics</div>
              <div className="signal-item">Community activation at scale (external community infrastructure absent)</div>
              <div className="signal-item">A/B testing or conversion optimization narrative</div>
              <div className="signal-item">Customer outcome data for Martha Cohorts or ClearBid</div>
              <div className="signal-item">Paid growth mechanics or scaling playbooks</div>
              <div className="signal-item">Cross-platform syndication execution (infrastructure built, not scaled)</div>
            </div>
          </div>

          <div className="offer-block">
            <div className="offer-label">THE OFFER TO CHEMIN</div>
            <div className="offer-text">
              I don't have marketing experience. I have <em>something adjacent that compounds differently</em> — 
              the ability to build structured knowledge systems whose architecture is already optimized 
              for retrieval. The distribution layer is the gap I'm asking for the role to fill.
            </div>
          </div>
        </div>

        <div className="footer">
          <div className="footer-left">
            Hillary Njuguna · Portfolio Brief · June 2026
          </div>
          <div className="footer-right">
            <a href="https://hillary-site.vercel.app">oscillatory-fields</a> · <a href="https://github.com/hillarynjuguna">github</a>
          </div>
        </div>

      </div>
    </div>
  );
}
