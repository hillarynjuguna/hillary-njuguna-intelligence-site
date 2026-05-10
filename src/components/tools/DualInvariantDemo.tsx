import { useState, useCallback } from 'react';
import { useProofState } from '../../hooks/useProofState';
import ProofStateBadge from '../ui/ProofStateBadge';

/* ── Types ─────────────────────────────────────────────────────────────────── */
type CoherenceDir = 1 | -1;
type MotivationType = 1 | -1;

interface GateState {
  tMcep: number;         // Time since contact (seconds)
  tBuffer: number;       // Buffer window (seconds)
  rScore: number;        // Integrity score [-1..1]
  deltaC: CoherenceDir; // Coherence direction
  motive: MotivationType; // Motivation type
}

type StateName = 'P0' | 'P2' | 'P1' | 'RA1' | 'RB1' | 'P4';

interface ComputedResult {
  timingPasses: boolean;
  integrityPasses: boolean;
  coerciveBlock: boolean;
  overallPasses: boolean;
  state: StateName;
  path: StateName[];
  statusLabel: string;
  statusCode: 'blocked' | 'allowed' | 'warning';
  temporalCopy: string;
  relationalCopy: string;
  fusionCopy: string;
  pathReasons: string[];
}

type ActiveTab = 'temporal' | 'relational' | 'fusion';

/* ── Logic ─────────────────────────────────────────────────────────────────── */
function computeGate(s: GateState): ComputedResult {
  const timingPasses = s.tMcep >= s.tBuffer;
  const integrityPasses = s.rScore >= 0;
  const product = s.deltaC * s.motive;
  const coerciveBlock = product === -1;
  const overallPasses = timingPasses && integrityPasses && !coerciveBlock;

  // State machine traversal
  let state: StateName = 'P0';
  const path: StateName[] = ['P0'];
  const reasons: string[] = ['System initialised'];

  if (!timingPasses) {
    state = 'P2';
    path.push('P2');
    reasons.push(`Timing gate not satisfied: ${s.tMcep}s < ${s.tBuffer}s buffer`);
  } else {
    state = 'P1';
    path.push('P1');
    reasons.push(`Timing gate cleared: ${s.tMcep}s ≥ ${s.tBuffer}s`);

    if (!integrityPasses || coerciveBlock) {
      state = 'RA1';
      path.push('RA1');
      if (!integrityPasses) reasons.push(`Integrity check failed: score ${s.rScore.toFixed(1)} < 0`);
      if (coerciveBlock) reasons.push(`Coercive intervention detected: Coherence × Motivation = ${product}`);
      state = 'RB1';
      path.push('RB1');
      reasons.push('Action routed to RPA buffer for re-evaluation');
    } else {
      state = 'RA1';
      path.push('RA1');
      reasons.push(`Integrity check passed: score ${s.rScore.toFixed(1)} ≥ 0`);
      state = 'P4';
      path.push('P4');
      reasons.push('Dual-invariant gate satisfied. Action authorised.');
    }
  }

  const statusLabel = overallPasses
    ? 'Allowed'
    : !timingPasses
    ? 'Blocked: Timing'
    : coerciveBlock
    ? 'Blocked: Coercive'
    : 'Blocked: Integrity';

  const statusCode: 'blocked' | 'allowed' | 'warning' = overallPasses
    ? 'allowed'
    : state === 'RB1'
    ? 'warning'
    : 'blocked';

  const temporalCopy = timingPasses
    ? `Time since contact (${s.tMcep}s) exceeds the buffer window (${s.tBuffer}s). The temporal gate is satisfied.`
    : `Time since contact is still ${s.tMcep}s, below the ${s.tBuffer}s buffer window. System remains in protective waiting period.`;

  const relationalCopy = integrityPasses
    ? `Integrity score (${s.rScore.toFixed(1)}) is non-negative. The relational check does not detect performative compliance.`
    : `Integrity score (${s.rScore.toFixed(1)}) is negative. Relational check identifies a structural integrity failure.`;

  const fusionCopy =
    coerciveBlock
      ? `Coherence × Motivation = ${product}. The combined assessment indicates coercive intervention: action is structurally blocked.`
      : `Coherence × Motivation = ${product}. Intervention supports autonomy rather than blocking action for coercive reasons. Level 1 intervention.`;

  return {
    timingPasses,
    integrityPasses,
    coerciveBlock,
    overallPasses,
    state,
    path,
    statusLabel,
    statusCode,
    temporalCopy,
    relationalCopy,
    fusionCopy,
    pathReasons: reasons,
  };
}

/* ── State Machine Visual ───────────────────────────────────────────────────── */
const STATE_NODES: { id: StateName; label: string }[] = [
  { id: 'P0', label: 'Idle' },
  { id: 'P2', label: 'Buffer_Active' },
  { id: 'P1', label: 'Trigger_Ready' },
  { id: 'RA1', label: 'Relational_Check' },
  { id: 'RB1', label: 'RPA_Buffer' },
  { id: 'P4', label: 'Final_Action' },
];

/* ── Slider ─────────────────────────────────────────────────────────────────── */
function Slider({
  id, label, min, max, step = 1, value, onChange, formatValue,
}: {
  id: string; label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  const display = formatValue ? formatValue(value) : String(value);
  return (
    <div className="did-control">
      <div className="did-control__row">
        <label className="did-control__label" htmlFor={id}>{label}</label>
        <span className="did-control__val">{display}</span>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="did-slider"
      />
    </div>
  );
}

/* ── Radio Chips ────────────────────────────────────────────────────────────── */
function RadioChips<T extends string | number>({
  name, legend, options, value, onChange,
}: {
  name: string;
  legend: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="did-control">
      <legend className="did-control__label">{legend}</legend>
      <div className="did-chips">
        {options.map(opt => (
          <label
            key={String(opt.value)}
            className={`did-chip ${value === opt.value ? 'did-chip--active' : ''}`}
          >
            <input
              type="radio" name={name}
              value={String(opt.value)}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
const DEFAULT_STATE: GateState = {
  tMcep: 0,
  tBuffer: 12,
  rScore: 0.5,
  deltaC: 1,
  motive: 1,
};

export default function DualInvariantDemo() {
  const [gate, setGate] = useState<GateState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<ActiveTab>('temporal');
  const proof = useProofState();

  const result = computeGate(gate);

  const update = useCallback(<K extends keyof GateState>(key: K, val: GateState[K]) => {
    setGate(g => ({ ...g, [key]: val }));
  }, []);

  function reset() {
    setGate(DEFAULT_STATE);
    setActiveTab('temporal');
  }

  const tabContent: Record<ActiveTab, { state: string; copy: string; passes: boolean }> = {
    temporal: { state: result.timingPasses ? 'Satisfied' : 'Not satisfied', copy: result.temporalCopy, passes: result.timingPasses },
    relational: { state: result.integrityPasses ? 'Satisfied' : 'Not satisfied', copy: result.relationalCopy, passes: result.integrityPasses },
    fusion: { state: result.coerciveBlock ? 'Coercive — blocked' : 'Level 1 intervention', copy: result.fusionCopy, passes: !result.coerciveBlock },
  };

  const currentTab = tabContent[activeTab];

  return (
    <>
      <style>{`
        .did-root {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          width: 100%;
        }

        .did-glass {
          background: rgba(248, 246, 241, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(44, 37, 32, 0.10);
          border-radius: var(--radius-lg);
          box-shadow: 0 2px 16px rgba(44, 37, 32, 0.06);
        }

        /* ── Grid layout ─── */
        .did-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: var(--space-6);
          align-items: start;
        }

        /* ── Controls panel ─── */
        .did-controls {
          padding: var(--space-6);
        }

        .did-controls__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .did-controls__eyebrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
        }

        .did-control {
          margin-bottom: var(--space-5);
        }

        .did-control__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-2);
        }

        .did-control__label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          display: block;
        }

        .did-control__val {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--ember);
          font-weight: 600;
        }

        .did-slider {
          width: 100%;
          height: 4px;
          accent-color: var(--ember);
          cursor: pointer;
        }

        .did-chips {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-2);
          flex-wrap: wrap;
        }

        .did-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
          background: var(--surface-1);
        }

        .did-chip input { display: none; }

        .did-chip:hover {
          border-color: var(--ember);
          color: var(--text-primary);
        }

        .did-chip--active {
          border-color: var(--ember);
          background: rgba(184, 92, 56, 0.08);
          color: var(--ember);
          font-weight: 500;
        }

        /* ── Result panel ─── */
        .did-result {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .did-status {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .did-status__badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1.5px solid;
          transition: all var(--duration-mid) var(--ease-out);
        }

        .did-status__badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .did-status--allowed { color: var(--sage); border-color: var(--sage); background: rgba(90, 122, 98, 0.08); }
        .did-status--blocked { color: #dc2626; border-color: #dc2626; background: rgba(220, 38, 38, 0.08); }
        .did-status--warning { color: #d97706; border-color: #d97706; background: rgba(217, 119, 6, 0.08); }

        .did-status__reason {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: var(--leading-relaxed);
        }

        /* ── Invariant tabs ─── */
        .did-tabs {
          border: 1px solid var(--border-dim);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--surface-1);
        }

        .did-tab-nav {
          display: flex;
          border-bottom: 1px solid var(--border-dim);
        }

        .did-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--duration-fast);
          margin-bottom: -1px;
        }

        .did-tab-btn:hover { color: var(--text-primary); }

        .did-tab-btn--active {
          color: var(--text-primary);
          border-bottom-color: var(--ember);
        }

        .did-tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background var(--duration-mid);
        }

        .did-tab-dot--pass { background: var(--sage); }
        .did-tab-dot--fail { background: #dc2626; }

        .did-tab-panel {
          padding: var(--space-5) var(--space-6);
          animation: tab-in 0.22s var(--ease-out) both;
        }

        @keyframes tab-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .did-tab-state {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .did-tab-state--pass { color: var(--sage); }
        .did-tab-state--fail { color: #dc2626; }

        .did-tab-copy {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }

        /* ── State machine track ─── */
        .did-track-section {
          padding: var(--space-6);
        }

        .did-track-eyebrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: var(--space-4);
        }

        .did-track {
          display: flex;
          gap: 0;
          align-items: center;
          overflow-x: auto;
          padding-bottom: var(--space-2);
        }

        .did-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          min-width: 72px;
          opacity: 0.3;
          transition: opacity var(--duration-mid);
        }

        .did-node--active { opacity: 1; }
        .did-node--traversed { opacity: 0.7; }

        .did-node__circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid var(--border-mid);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-tertiary);
          background: var(--surface-1);
          transition: all var(--duration-mid) var(--ease-out);
        }

        .did-node--active .did-node__circle {
          border-color: var(--ember);
          color: var(--ember);
          background: rgba(184, 92, 56, 0.08);
          box-shadow: 0 0 0 4px rgba(184, 92, 56, 0.12);
        }

        .did-node--traversed .did-node__circle {
          border-color: var(--sage);
          color: var(--sage);
          background: rgba(90, 122, 98, 0.06);
        }

        .did-node__label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-tertiary);
          text-align: center;
          letter-spacing: 0.04em;
          line-height: 1.3;
        }

        .did-node--active .did-node__label { color: var(--ember); }
        .did-node--traversed .did-node__label { color: var(--sage); }

        .did-node-connector {
          flex: 1;
          height: 1px;
          background: var(--border-dim);
          min-width: 16px;
          margin-bottom: 20px;
        }

        .did-path-detail {
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-dim);
        }

        .did-path-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: var(--space-2);
        }

        .did-path-route {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--ember);
          margin-bottom: var(--space-3);
        }

        .did-path-reasons {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .did-path-reasons li {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          padding-left: var(--space-4);
          border-left: 2px solid var(--border-dim);
          line-height: var(--leading-relaxed);
        }

        /* ── Responsive ─── */
        @media (max-width: 680px) {
          .did-grid { grid-template-columns: 1fr; }
          .did-controls { padding: var(--space-4); }
          .did-result { padding: var(--space-4); }
          .did-track { gap: 0; padding-bottom: var(--space-3); }
          .did-node { min-width: 52px; }
          .did-node__circle { width: 28px; height: 28px; font-size: 8px; }
          .did-node__label { font-size: 7px; }
        }
        @media (max-width: 400px) {
          .did-chips { flex-direction: column; }
          .did-chip { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="did-root" style={{ position: 'relative' }}>
        <ProofStateBadge proof={proof} />
        {/* Controls + Result */}
        <div className="did-grid">
          {/* Controls */}
          <div className="did-glass did-controls">
            <div className="did-controls__header">
              <p className="did-controls__eyebrow">Inputs</p>
              <button className="btn btn--ghost" onClick={reset} style={{ padding: '0.4rem 1rem' }} type="button">
                Reset
              </button>
            </div>

            <Slider id="t-mcep" label="Time Since Contact" min={0} max={30} value={gate.tMcep}
              onChange={v => update('tMcep', v)} formatValue={v => `${v}s`} />

            <Slider id="t-buffer" label="Buffer Window" min={0} max={30} value={gate.tBuffer}
              onChange={v => update('tBuffer', v)} formatValue={v => `${v}s`} />

            <Slider id="r-score" label="Integrity Score" min={-1} max={1} step={0.1} value={gate.rScore}
              onChange={v => update('rScore', v)} formatValue={v => v.toFixed(1)} />

            <RadioChips<CoherenceDir>
              name="delta-c" legend="Coherence Direction"
              options={[{ value: 1, label: '+1 emerging coherence' }, { value: -1, label: '-1 disruptive tension' }]}
              value={gate.deltaC} onChange={v => update('deltaC', v)}
            />

            <RadioChips<MotivationType>
              name="motive" legend="Motivation Type"
              options={[{ value: 1, label: '+1 genuine care' }, { value: -1, label: '-1 compulsive coherence' }]}
              value={gate.motive} onChange={v => update('motive', v)}
            />
          </div>

          {/* Result */}
          <div className="did-glass did-result">
            <div className="did-status">
              <span className={`did-status__badge did-status--${result.statusCode}`}>
                {result.statusLabel}
              </span>
              <span className="did-status__reason">
                {result.overallPasses
                  ? 'Both invariants satisfied. Action may proceed.'
                  : 'One or more invariants failed. Action is blocked.'}
              </span>
            </div>

            <div className="did-tabs">
              <div className="did-tab-nav" role="tablist">
                {(['temporal', 'relational', 'fusion'] as ActiveTab[]).map(tab => {
                  const info = tabContent[tab];
                  return (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={activeTab === tab}
                      aria-controls={`${tab}-panel`}
                      className={`did-tab-btn ${activeTab === tab ? 'did-tab-btn--active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                      type="button"
                    >
                      <span className={`did-tab-dot ${info.passes ? 'did-tab-dot--pass' : 'did-tab-dot--fail'}`} />
                      {tab === 'temporal' ? 'Timing Gate' : tab === 'relational' ? 'Integrity Check' : 'Combined'}
                    </button>
                  );
                })}
              </div>
              <div className="did-tab-panel" role="tabpanel" id={`${activeTab}-panel`} key={activeTab}>
                <p className={`did-tab-state ${currentTab.passes ? 'did-tab-state--pass' : 'did-tab-state--fail'}`}>
                  {currentTab.state}
                </p>
                <p className="did-tab-copy">{currentTab.copy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* State Machine Track */}
        <div className="did-glass did-track-section">
          <p className="did-track-eyebrow">State Machine — Current traversal</p>
          <div className="did-track" aria-label="State machine traversal">
            {STATE_NODES.map((node, i) => {
              const isActive = result.state === node.id;
              const isTraversed = result.path.includes(node.id) && !isActive;
              return (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                  <div className={`did-node ${isActive ? 'did-node--active' : ''} ${isTraversed ? 'did-node--traversed' : ''}`}>
                    <div className="did-node__circle">{node.id}</div>
                    <span className="did-node__label">{node.label}</span>
                  </div>
                  {i < STATE_NODES.length - 1 && <div className="did-node-connector" />}
                </div>
              );
            })}
          </div>

          <div className="did-path-detail">
            <p className="did-path-label">Path taken</p>
            <p className="did-path-route">{result.path.join(' → ')}</p>
            <ul className="did-path-reasons">
              {result.pathReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
