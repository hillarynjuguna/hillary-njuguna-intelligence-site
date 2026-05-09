import { useState, useRef } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface DiagnosticReport {
  capabilityScore: number;
  governanceScore: number;
  gapMagnitude: string;
  summary: string;
  zones: Array<{ area: string; risk: string }>;
  failureModes: Array<{ mode: string; predictability: string }>;
  recommendations: string[];
}

type Stage = 'intake' | 'running' | 'report';

interface FormData {
  systems: string;
  permissions: string;
  governance: string;
  history: string;
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function StageIndicator({ current }: { current: number }) {
  const stages = ['Systems', 'Permissions', 'Governance', 'History'];
  return (
    <div className="bd-stages">
      {stages.map((label, i) => (
        <div
          key={label}
          className={`bd-stage ${i < current ? 'bd-stage--done' : ''} ${i === current ? 'bd-stage--active' : ''}`}
        >
          <div className="bd-stage__dot">
            {i < current ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="bd-stage__label">{label}</span>
          {i < stages.length - 1 && <div className="bd-stage__line" />}
        </div>
      ))}
    </div>
  );
}

function ScoreMeter({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const isLow = pct < 40;
  const isMid = pct >= 40 && pct < 70;

  return (
    <div className="bd-meter">
      <div className="bd-meter__header">
        <span className="bd-meter__label">{label}</span>
        <span className="bd-meter__value" data-low={isLow} data-mid={isMid}>
          {score}<span className="bd-meter__max">/{max}</span>
        </span>
      </div>
      <div className="bd-meter__track">
        <div
          className="bd-meter__fill"
          style={{ width: `${pct}%` }}
          data-low={isLow}
          data-mid={isMid}
        />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export default function BainbridgeDiagnostic() {
  const [stage, setStage] = useState<Stage>('intake');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ systems: '', permissions: '', governance: '', history: '' });
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const fields: Array<{ key: keyof FormData; label: string; placeholder: string; required?: boolean }> = [
    {
      key: 'systems',
      label: 'AI systems deployed',
      placeholder: 'Describe the systems currently in operation. What do they do, and in which domains are they deployed?',
      required: true,
    },
    {
      key: 'permissions',
      label: 'Permissions and autonomy',
      placeholder: 'What actions can these systems take without human approval? What triggers escalation?',
    },
    {
      key: 'governance',
      label: 'Governance infrastructure',
      placeholder: 'What oversight exists? Who holds accountability when a system fails or produces unexpected output?',
      required: true,
    },
    {
      key: 'history',
      label: 'Incident and anomaly history',
      placeholder: 'Describe past near-misses, hallucinations, unexpected behaviours, or escalations. None is a valid answer.',
    },
  ];

  const currentField = fields[step];

  function advance() {
    if (step < fields.length - 1) {
      setStep(s => s + 1);
    } else {
      runDiagnostic();
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
  }

  function reset() {
    setStage('intake');
    setStep(0);
    setForm({ systems: '', permissions: '', governance: '', history: '' });
    setReport(null);
    setError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function runDiagnostic() {
    setStage('running');
    setError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setReport(data);
      setStage('report');
    } catch (err) {
      setError('The diagnostic endpoint did not respond. Verify your API configuration.');
      setStage('intake');
    }
  }

  const canAdvance = currentField?.required ? form[currentField.key].trim().length > 0 : true;
  const isLast = step === fields.length - 1;

  const gapColor =
    report?.gapMagnitude === 'CRITICAL'
      ? 'var(--bd-critical)'
      : report?.gapMagnitude === 'HIGH'
      ? 'var(--bd-high)'
      : report?.gapMagnitude === 'MODERATE'
      ? 'var(--bd-moderate)'
      : 'var(--sage)';

  return (
    <>
      <style>{`
        /* ── Bainbridge Diagnostic Shell ───────────────────────────────────── */
        :root {
          --bd-critical: #dc2626;
          --bd-high: #B85C38;
          --bd-moderate: #d97706;
          --bd-glass: rgba(248, 246, 241, 0.72);
          --bd-glass-border: rgba(44, 37, 32, 0.10);
        }

        .bd-shell {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── Stage Tracker ─────────────────────────────────────────────── */
        .bd-stages {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: var(--space-10);
          padding: var(--space-4) var(--space-6);
          background: var(--bd-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--bd-glass-border);
          border-radius: var(--radius-lg);
        }

        .bd-stage {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
          opacity: 0.38;
          transition: opacity var(--duration-mid) var(--ease-out);
        }

        .bd-stage--active,
        .bd-stage--done {
          opacity: 1;
        }

        .bd-stage__dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid var(--border-mid);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          flex-shrink: 0;
          background: var(--void);
          transition: all var(--duration-mid) var(--ease-out);
        }

        .bd-stage--active .bd-stage__dot {
          border-color: var(--ember);
          color: var(--ember);
          background: rgba(184, 92, 56, 0.06);
        }

        .bd-stage--done .bd-stage__dot {
          border-color: var(--sage);
          color: var(--sage);
          background: rgba(90, 122, 98, 0.08);
        }

        .bd-stage__label {
          font-size: var(--text-xs);
          font-family: var(--font-mono);
          color: var(--text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .bd-stage--active .bd-stage__label {
          color: var(--text-primary);
        }

        .bd-stage__line {
          flex: 1;
          height: 1px;
          background: var(--border-dim);
          margin: 0 var(--space-2);
        }

        /* ── Intake Panel ──────────────────────────────────────────────── */
        .bd-panel {
          background: var(--bd-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--bd-glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-8);
          box-shadow: 0 2px 16px rgba(44, 37, 32, 0.06);
          animation: bd-panel-in 0.32s var(--ease-out) both;
        }

        @keyframes bd-panel-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bd-panel__eyebrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: var(--space-2);
        }

        .bd-panel__title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          color: var(--text-primary);
          margin-bottom: var(--space-4);
          line-height: var(--leading-snug);
          font-weight: 600;
        }

        .bd-panel__hint {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-6);
        }

        .bd-textarea {
          width: 100%;
          min-height: 140px;
          background: var(--surface-1);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          resize: vertical;
          transition: border-color var(--duration-fast);
          box-sizing: border-box;
        }

        .bd-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .bd-textarea:focus {
          outline: none;
          border-color: var(--ember);
          background: var(--warm-white);
        }

        .bd-panel__actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-6);
          gap: var(--space-3);
        }

        .bd-panel__skip {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          padding: 0;
          transition: color var(--duration-fast);
        }

        .bd-panel__skip:hover {
          color: var(--text-secondary);
        }

        .bd-panel__nav {
          display: flex;
          gap: var(--space-3);
        }

        /* ── Loading State ─────────────────────────────────────────────── */
        .bd-loading {
          text-align: center;
          padding: var(--space-16) var(--space-8);
          animation: bd-panel-in 0.32s var(--ease-out) both;
        }

        .bd-loading__ring {
          width: 56px;
          height: 56px;
          border: 2px solid var(--border-dim);
          border-top-color: var(--ember);
          border-radius: 50%;
          animation: bd-spin 1s linear infinite;
          margin: 0 auto var(--space-6);
        }

        @keyframes bd-spin {
          to { transform: rotate(360deg); }
        }

        .bd-loading__label {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .bd-loading__sub {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-top: var(--space-2);
          line-height: var(--leading-relaxed);
        }

        /* ── Report ────────────────────────────────────────────────────── */
        .bd-report {
          animation: bd-panel-in 0.4s var(--ease-out) both;
        }

        .bd-report__header {
          background: var(--bd-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--bd-glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-8);
          margin-bottom: var(--space-6);
          box-shadow: 0 2px 16px rgba(44, 37, 32, 0.06);
        }

        .bd-report__title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
          gap: var(--space-4);
        }

        .bd-report__title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          line-height: var(--leading-tight);
          font-weight: 700;
        }

        .bd-gap-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-1) var(--space-4);
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          white-space: nowrap;
          border: 1px solid currentColor;
          flex-shrink: 0;
        }

        .bd-scores {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        /* ── Score Meter ───────────────────────────────────────────────── */
        .bd-meter {
          background: var(--surface-1);
          border: 1px solid var(--border-dim);
          border-radius: var(--radius-md);
          padding: var(--space-5);
        }

        .bd-meter__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-3);
        }

        .bd-meter__label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }

        .bd-meter__value {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--sage);
          font-weight: 700;
          line-height: 1;
          transition: color var(--duration-mid);
        }

        .bd-meter__value[data-low="true"] { color: var(--bd-critical); }
        .bd-meter__value[data-mid="true"] { color: var(--bd-moderate); }

        .bd-meter__max {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          font-weight: 400;
        }

        .bd-meter__track {
          height: 4px;
          background: var(--border-dim);
          border-radius: 2px;
          overflow: hidden;
        }

        .bd-meter__fill {
          height: 100%;
          background: var(--sage);
          border-radius: 2px;
          transition: width 0.8s var(--ease-out), background var(--duration-mid);
        }

        .bd-meter__fill[data-low="true"] { background: var(--bd-critical); }
        .bd-meter__fill[data-mid="true"] { background: var(--bd-moderate); }

        /* ── Report Body ───────────────────────────────────────────────── */
        .bd-report__body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .bd-report__section {
          background: var(--bd-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--bd-glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6) var(--space-8);
          box-shadow: 0 1px 8px rgba(44, 37, 32, 0.04);
        }

        .bd-report__section-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: var(--space-4);
        }

        .bd-summary {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        .bd-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .bd-list li {
          display: flex;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        .bd-list li::before {
          content: '';
          display: block;
          width: 2px;
          flex-shrink: 0;
          background: var(--border-mid);
          border-radius: 1px;
          margin-top: 0.3em;
          align-self: stretch;
        }

        .bd-list__key {
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .bd-rec-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          counter-reset: rec-counter;
        }

        .bd-rec-list li {
          display: flex;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          counter-increment: rec-counter;
        }

        .bd-rec-list li::before {
          content: counter(rec-counter, decimal-leading-zero);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ember);
          min-width: 2em;
          padding-top: 0.15em;
        }

        .bd-report__footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          margin-top: var(--space-6);
        }

        .bd-error {
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-6);
          font-size: var(--text-sm);
          color: #dc2626;
          margin-top: var(--space-4);
          line-height: var(--leading-relaxed);
        }

        /* ── Responsive ────────────────────────────────────────────────── */
        @media (max-width: 580px) {
          .bd-stages { display: none; }
          .bd-scores { grid-template-columns: 1fr; }
          .bd-report__title-row { flex-direction: column; gap: var(--space-3); }
        }
      `}</style>

      <div className="bd-shell" ref={topRef}>
        {/* ── Intake ─────────────────────────────────────────────────────── */}
        {stage === 'intake' && (
          <>
            <StageIndicator current={step} />
            <div className="bd-panel" key={step}>
              <p className="bd-panel__eyebrow">Stage {step + 1} of {fields.length}</p>
              <h2 className="bd-panel__title">{currentField.label}</h2>
              <p className="bd-panel__hint">
                {currentField.required
                  ? 'Required. This field drives the structural analysis.'
                  : 'Optional, but specificity improves the gap assessment.'}
              </p>
              <textarea
                id={currentField.key}
                className="bd-textarea"
                placeholder={currentField.placeholder}
                value={form[currentField.key]}
                onChange={e => setForm(f => ({ ...f, [currentField.key]: e.target.value }))}
                rows={5}
              />
              {error && <div className="bd-error">{error}</div>}
              <div className="bd-panel__actions">
                {!currentField.required && step > 0 && (
                  <button className="bd-panel__skip" onClick={advance} type="button">
                    Skip this field
                  </button>
                )}
                {!currentField.required && step === 0 && <span />}
                {currentField.required && <span />}
                <div className="bd-panel__nav">
                  {step > 0 && (
                    <button className="btn btn--ghost" onClick={back} type="button">
                      Back
                    </button>
                  )}
                  <button
                    className="btn btn--primary"
                    onClick={advance}
                    disabled={!canAdvance}
                    type="button"
                  >
                    {isLast ? 'Run diagnostic' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Running ────────────────────────────────────────────────────── */}
        {stage === 'running' && (
          <div className="bd-panel bd-loading">
            <div className="bd-loading__ring" />
            <p className="bd-loading__label">Synthesizing diagnostic</p>
            <p className="bd-loading__sub">
              Mapping capability-governance gap across four structural dimensions.
            </p>
          </div>
        )}

        {/* ── Report ─────────────────────────────────────────────────────── */}
        {stage === 'report' && report && (
          <div className="bd-report">
            <div className="bd-report__header">
              <div className="bd-report__title-row">
                <h2 className="bd-report__title">Diagnostic report</h2>
                <span
                  className="bd-gap-badge"
                  style={{ color: gapColor, borderColor: gapColor, background: `${gapColor}14` }}
                >
                  {report.gapMagnitude} risk gap
                </span>
              </div>
              <div className="bd-scores">
                <ScoreMeter label="Capability score" score={report.capabilityScore} />
                <ScoreMeter label="Governance score" score={report.governanceScore} />
              </div>
            </div>

            <div className="bd-report__body">
              <div className="bd-report__section">
                <p className="bd-report__section-label">Executive summary</p>
                <p className="bd-summary">{report.summary}</p>
              </div>

              {report.zones?.length > 0 && (
                <div className="bd-report__section">
                  <p className="bd-report__section-label">Bainbridge zones</p>
                  <ul className="bd-list">
                    {report.zones.map((z, i) => (
                      <li key={i}>
                        <span>
                          <span className="bd-list__key">{z.area}:</span> {z.risk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.failureModes?.length > 0 && (
                <div className="bd-report__section">
                  <p className="bd-report__section-label">Predictable failure modes</p>
                  <ul className="bd-list">
                    {report.failureModes.map((f, i) => (
                      <li key={i}>
                        <span>
                          <span className="bd-list__key">{f.mode}:</span> {f.predictability}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations?.length > 0 && (
                <div className="bd-report__section">
                  <p className="bd-report__section-label">Closing the gap</p>
                  <ol className="bd-rec-list">
                    {report.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="bd-report__footer">
              <a href="/research/bainbridge-warning" className="btn btn--secondary">
                Read Bainbridge
              </a>
              <button className="btn btn--primary" onClick={reset} type="button">
                New diagnostic
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
