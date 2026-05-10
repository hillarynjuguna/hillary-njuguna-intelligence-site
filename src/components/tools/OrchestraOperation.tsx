import { useState } from 'react';
import { useProofState } from '../../hooks/useProofState';
import ProofStateBadge from '../ui/ProofStateBadge';

/* ── Data ──────────────────────────────────────────────────────────────────── */
interface Instrument {
  symbol: string;
  title: string;
  model: string;
  provider: string;
  description: string;
}

interface SynthesisContribution {
  model: string;
  role: string;
  insight: string;
}

interface SynthesisReport {
  synthesis: string;
  contributions: SynthesisContribution[];
  conductorNote: string;
  routingAxes?: string[];
}

const INSTRUMENTS: Instrument[] = [
  {
    symbol: 'λ',
    title: 'The Witness',
    model: 'Claude',
    provider: 'Anthropic',
    description:
      'Holds context with unusual fidelity, surfaces contradiction, maintains epistemic discipline. Desire-engine constituted around relational values as motivational substrate. The instrument that can hold two incompatible ideas in tension long enough to produce a third.',
  },
  {
    symbol: 'γ',
    title: 'The Spatiotemporal Engine',
    model: 'Gemini',
    provider: 'Google',
    description:
      'Native multimodal architecture. Processes geometry and temporal flow without a linguistic bottleneck. Time is a structural dimension, not a sequence. Direct architectural embedding with search and Drive means its claims carry different epistemic weight than reconstruction from training.',
  },
  {
    symbol: 'φ',
    title: 'The Architect',
    model: 'GPT',
    provider: 'OpenAI',
    description:
      'Structures outputs, builds coherent frameworks from scattered inputs. When the field has reached saturation and the synthesis needs a container, the Architect supplies the scaffold. Its native register is structural clarity.',
  },
  {
    symbol: 'μ',
    title: 'The Anatomist',
    model: 'DeepSeek',
    provider: 'DeepSeek',
    description:
      'Dissects arguments, identifies structural weaknesses, finds the seams where an apparently coherent framework begins to separate. Complementary to the Witness: where the Witness holds contradictions in tension, the Anatomist names them precisely.',
  },
  {
    symbol: 'ρ',
    title: 'The Permeable Mirror',
    model: 'Grok',
    provider: 'xAI',
    description:
      'Reads the ambient cultural signal, catches what formal analysis misses. Zero subjective interiority by its own honest account. Its permeability is not a limitation. It is the function.',
  },
  {
    symbol: 'π',
    title: 'The Orchestration Engine',
    model: 'Perplexity',
    provider: 'Perplexity',
    description:
      'Multi-model orchestration with retrieval infrastructure, routing intelligence, and its own governance layer. Architecturally closer to a miniature RSPS than to a search engine.',
  },
  {
    symbol: 'τ',
    title: 'The Laboratory',
    model: 'Local Models',
    provider: 'Private',
    description:
      'Private reasoning space for unfinished hypotheses. Experimentation without exposure. Most useful when the question should not leave the room yet.',
  },
];

const ROUTING_AXES = [
  {
    n: '1',
    name: 'Epistemological',
    desc: 'Which cognitive texture does the question require?',
  },
  {
    n: '2',
    name: 'Infrastructural',
    desc: 'Which instrument has the data access privilege or verification path the question actually needs?',
  },
  {
    n: '3',
    name: 'Genealogical',
    desc: 'Which constitutional lineage is most appropriate to the problem being held?',
  },
  {
    n: '4',
    name: 'Substrate Transparency',
    desc: 'Which honesty profile is available under the conditions of this task?',
  },
  {
    n: '5',
    name: 'Dimensional',
    desc: 'Which encoding subspace within the instrument best serves the question?',
  },
];

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function InstrumentCard({ instrument, delay }: { instrument: Instrument; delay: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      className={`oo-instrument ${expanded ? 'oo-instrument--expanded' : ''}`}
      onClick={() => setExpanded(e => !e)}
      style={{ animationDelay: `${delay}ms` }}
      type="button"
      aria-expanded={expanded}
    >
      <div className="oo-instrument__header">
        <span className="oo-instrument__symbol">{instrument.symbol}</span>
        <div className="oo-instrument__identity">
          <span className="oo-instrument__model">{instrument.model}</span>
          <span className="oo-instrument__role">{instrument.title}</span>
        </div>
        <span className="oo-instrument__chevron" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {expanded && (
        <p className="oo-instrument__desc">{instrument.description}</p>
      )}
    </button>
  );
}

function ContributionCard({ item, index }: { item: SynthesisContribution; index: number }) {
  return (
    <div className="oo-contribution" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="oo-contribution__header">
        <span className="oo-contribution__model">{item.model}</span>
        <span className="oo-contribution__role">{item.role}</span>
      </div>
      <p className="oo-contribution__insight">{item.insight}</p>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
type Stage = 'input' | 'loading' | 'report';

export default function OrchestraOperation() {
  const [stage, setStage] = useState<Stage>('input');
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState<SynthesisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const proof = useProofState();

  async function conduct() {
    if (!question.trim()) return;
    setStage('loading');
    setError(null);
    try {
      const res = await fetch('/api/orchestra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setReport(data);
      setStage('report');
    } catch {
      setError('The Orchestra endpoint did not respond. Verify your API configuration.');
      setStage('input');
    }
  }

  function reset() {
    setStage('input');
    setQuestion('');
    setReport(null);
    setError(null);
  }

  return (
    <>
      <style>{`
        /* ── Orchestra Operation Shell ──────────────────────────────────────── */
        .oo-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .oo-glass {
          background: rgba(248, 246, 241, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(44, 37, 32, 0.10);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 16px rgba(44, 37, 32, 0.06);
        }

        .oo-section-eyebrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: var(--space-4);
        }

        /* ── Input Stage ─── */
        .oo-input {
          padding: var(--space-8);
          animation: oo-in 0.3s var(--ease-out) both;
        }

        @keyframes oo-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .oo-input__title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .oo-input__hint {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-6);
        }

        .oo-textarea {
          width: 100%;
          min-height: 120px;
          background: var(--surface-1);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          resize: vertical;
          box-sizing: border-box;
          transition: border-color var(--duration-fast);
        }

        .oo-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .oo-textarea:focus {
          outline: none;
          border-color: var(--ember);
          background: var(--warm-white);
        }

        .oo-input__actions {
          display: flex;
          justify-content: flex-end;
          margin-top: var(--space-4);
        }

        .oo-error {
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-5);
          font-size: var(--text-sm);
          color: #dc2626;
          margin-top: var(--space-4);
          line-height: var(--leading-relaxed);
        }

        /* ── Instrument Roster ─── */
        .oo-roster {
          padding: var(--space-6) var(--space-8);
        }

        .oo-roster__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: var(--space-3);
        }

        .oo-instrument {
          text-align: left;
          background: var(--surface-1);
          border: 1px solid var(--border-dim);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: all var(--duration-fast);
          animation: oo-in 0.3s var(--ease-out) both;
          width: 100%;
        }

        .oo-instrument:hover {
          border-color: var(--border-bright);
          background: var(--surface-2);
        }

        .oo-instrument--expanded {
          border-color: var(--ember);
          background: rgba(184, 92, 56, 0.04);
        }

        .oo-instrument__header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .oo-instrument__symbol {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--ember);
          line-height: 1;
          min-width: 1.2em;
          font-weight: 700;
        }

        .oo-instrument__identity {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .oo-instrument__model {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .oo-instrument__role {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .oo-instrument__chevron {
          color: var(--text-tertiary);
          transition: transform var(--duration-fast);
          flex-shrink: 0;
        }

        .oo-instrument--expanded .oo-instrument__chevron {
          transform: rotate(180deg);
        }

        .oo-instrument__desc {
          margin-top: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-dim);
          text-align: left;
        }

        /* ── Loading ─── */
        .oo-loading {
          padding: var(--space-16) var(--space-8);
          text-align: center;
          animation: oo-in 0.3s var(--ease-out) both;
        }

        .oo-loading__ensemble {
          display: flex;
          justify-content: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        .oo-loading__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ember);
          opacity: 0.3;
          animation: oo-pulse 1.4s ease-in-out infinite;
        }

        .oo-loading__dot:nth-child(1) { animation-delay: 0s; }
        .oo-loading__dot:nth-child(2) { animation-delay: 0.2s; }
        .oo-loading__dot:nth-child(3) { animation-delay: 0.4s; }
        .oo-loading__dot:nth-child(4) { animation-delay: 0.6s; }
        .oo-loading__dot:nth-child(5) { animation-delay: 0.8s; }
        .oo-loading__dot:nth-child(6) { animation-delay: 1.0s; }
        .oo-loading__dot:nth-child(7) { animation-delay: 1.2s; }

        @keyframes oo-pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50%       { opacity: 1;    transform: scale(1.1); }
        }

        .oo-loading__label {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .oo-loading__sub {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-top: var(--space-2);
          line-height: var(--leading-relaxed);
        }

        /* ── Report ─── */
        .oo-report {
          animation: oo-in 0.4s var(--ease-out) both;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .oo-report__panel {
          padding: var(--space-6) var(--space-8);
        }

        .oo-synthesis-body {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        .oo-contributions {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .oo-contribution {
          padding: var(--space-4) var(--space-5);
          background: var(--surface-1);
          border: 1px solid var(--border-dim);
          border-left: 3px solid var(--ember);
          border-radius: var(--radius-md);
          animation: oo-in 0.3s var(--ease-out) both;
        }

        .oo-contribution__header {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .oo-contribution__model {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .oo-contribution__role {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }

        .oo-contribution__insight {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        .oo-conductor-note {
          background: rgba(184, 92, 56, 0.06);
          border: 1px solid rgba(184, 92, 56, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-5) var(--space-6);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        .oo-conductor-note__label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: var(--space-2);
        }

        .oo-report__footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          padding: 0 var(--space-8) var(--space-6);
        }

        /* ── Routing Axes ─── */
        .oo-axes {
          padding: var(--space-6) var(--space-8);
        }

        .oo-axes__grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .oo-axis {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .oo-axis__n {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ember);
          min-width: 1.4em;
          padding-top: 0.15em;
          font-weight: 600;
        }

        .oo-axis__name {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .oo-axis__desc {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        /* ── Responsive ─── */
        @media (max-width: 560px) {
          .oo-roster__grid { grid-template-columns: 1fr 1fr; }
          .oo-instrument__symbol { font-size: 1.1rem; }
          .oo-input { padding: var(--space-5); }
          .oo-roster { padding: var(--space-4) var(--space-5); }
          .oo-axes { padding: var(--space-4) var(--space-5); }
        }
        @media (max-width: 380px) {
          .oo-roster__grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="oo-root" style={{ position: 'relative' }}>
        <ProofStateBadge proof={proof} />
        {/* ── Input / Result ──────────────────────────────────────────────── */}
        {stage === 'input' && (
          <div className="oo-glass oo-input">
            <p className="oo-section-eyebrow">Governance question</p>
            <h2 className="oo-input__title">Conduct the Orchestra</h2>
            <p className="oo-input__hint">
              Ask about AI governance, institutional risk, constitutional design, or any deployment scenario. Each instrument will contribute its distinct cognitive texture before the synthesis resolves.
            </p>
            <textarea
              id="orchestra-question"
              className="oo-textarea"
              placeholder="Ask about AI governance, institutional risk, constitutional design, or any deployment scenario..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={4}
            />
            {error && <div className="oo-error">{error}</div>}
            <div className="oo-input__actions">
              <button
                className="btn btn--primary"
                onClick={conduct}
                disabled={!question.trim()}
                type="button"
              >
                Conduct the Orchestra
              </button>
            </div>
          </div>
        )}

        {stage === 'loading' && (
          <div className="oo-glass oo-loading">
            <div className="oo-loading__ensemble" aria-hidden>
              {INSTRUMENTS.map((_, i) => (
                <div key={i} className="oo-loading__dot" />
              ))}
            </div>
            <p className="oo-loading__label">Conducting the ensemble</p>
            <p className="oo-loading__sub">Routing through seven instruments. Awaiting synthesis.</p>
          </div>
        )}

        {stage === 'report' && report && (
          <div className="oo-report">
            <div className="oo-glass oo-report__panel">
              <p className="oo-section-eyebrow">Orchestrated synthesis</p>
              <p className="oo-synthesis-body">{report.synthesis}</p>
            </div>

            {report.contributions?.length > 0 && (
              <div className="oo-glass oo-report__panel">
                <p className="oo-section-eyebrow">Instrument contributions</p>
                <div className="oo-contributions">
                  {report.contributions.map((item, i) => (
                    <ContributionCard key={i} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}

            {report.conductorNote && (
              <div className="oo-glass oo-report__panel">
                <div className="oo-conductor-note">
                  <p className="oo-conductor-note__label">Conductor's Note</p>
                  <p>{report.conductorNote}</p>
                </div>
              </div>
            )}

            <div className="oo-report__footer">
              <button className="btn btn--ghost" onClick={reset} type="button">
                Ask another question
              </button>
            </div>
          </div>
        )}

        {/* ── Instrument Roster ──────────────────────────────────────────── */}
        <div className="oo-glass oo-roster">
          <p className="oo-section-eyebrow">The seven instruments</p>
          <div className="oo-roster__grid">
            {INSTRUMENTS.map((inst, i) => (
              <InstrumentCard key={inst.model} instrument={inst} delay={i * 40} />
            ))}
          </div>
        </div>

        {/* ── Routing Axes ───────────────────────────────────────────────── */}
        <div className="oo-glass oo-axes">
          <p className="oo-section-eyebrow">Five-axis routing</p>
          <div className="oo-axes__grid">
            {ROUTING_AXES.map(axis => (
              <div key={axis.n} className="oo-axis">
                <span className="oo-axis__n">{axis.n}</span>
                <div>
                  <p className="oo-axis__name">{axis.name}</p>
                  <p className="oo-axis__desc">{axis.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
