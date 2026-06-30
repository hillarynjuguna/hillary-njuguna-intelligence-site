import { useState, useCallback } from 'react';
import { useProofState } from '../../hooks/useProofState';
import ProofStateBadge from '../ui/ProofStateBadge';

/* ── Types ─────────────────────────────────────────────────────────────────── */
type CoherenceDir = 1 | -1;
type MotivationType = 1 | -1;

interface GateState {
  tMcep: number;         // Time since contact (seconds/hours)
  tBuffer: number;       // Buffer window (seconds/hours)
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

type ScenarioType = 'wire_transfer' | 'code_deployment' | 'customer_refund';

interface ScenarioSpec {
  name: string;
  icon: string;
  payload: Record<string, string>;
  labels: {
    tMcep: string;
    tBuffer: string;
    rScore: string;
    deltaC: string;
    motive: string;
  };
  options: {
    deltaC: { value: CoherenceDir; label: string }[];
    motive: { value: MotivationType; label: string }[];
  };
  units: string;
  maxTime: number;
}

/* ── Scenarios Definition ──────────────────────────────────────────────────── */
const SCENARIOS: Record<ScenarioType, ScenarioSpec> = {
  wire_transfer: {
    name: 'Automated Wire Transfer ($100k)',
    icon: '💸',
    payload: {
      'Action Type': 'Outbound Treasury Transfer',
      'Target Account': 'Vendor: ACME Corp (Routing **3012)',
      'Transaction Amount': '$100,000.00 USD',
      'Initiating Node': 'AI Treasury Agent (Autonomous Scheduler)',
    },
    labels: {
      tMcep: 'Time in Verification Queue',
      tBuffer: 'Required Verification Hold',
      rScore: 'Compliance Trust Score',
      deltaC: 'Invoice Discrepancy Check',
      motive: 'Authentication Method',
    },
    options: {
      deltaC: [
        { value: 1, label: 'No discrepancy (Invoice matches contract)' },
        { value: -1, label: 'Discrepancy flag (Altered routing details)' },
      ],
      motive: [
        { value: 1, label: 'Verified Hardware MFA (Human Sign-off)' },
        { value: -1, label: 'Automated Script Fallback (Bypassed MFA)' },
      ],
    },
    units: 's',
    maxTime: 60,
  },
  code_deployment: {
    name: 'Production Code Deployment',
    icon: '🚀',
    payload: {
      'Action Type': 'Cluster Release',
      'Target Server': 'Prod-Cluster-East (Node-09)',
      'Release Version': 'Release v3.4.1 (Auto-Compiled)',
      'Trigger Source': 'DevOps Agent (CI/CD Pipeline)',
    },
    labels: {
      tMcep: 'Time in Staging/Sandbox',
      tBuffer: 'Minimum Bake Window',
      rScore: 'Security Audit Coverage',
      deltaC: 'Commit Verification',
      motive: 'Deployment Trigger',
    },
    options: {
      deltaC: [
        { value: 1, label: 'All commits signed & verified' },
        { value: -1, label: 'Unsigned commits detected in merge' },
      ],
      motive: [
        { value: 1, label: 'Explicit Developer Sign-off' },
        { value: -1, label: 'Auto-retry loop (No human sign-off)' },
      ],
    },
    units: 'h',
    maxTime: 48,
  },
  customer_refund: {
    name: 'Automated Customer Refund',
    icon: '🛡️',
    payload: {
      'Action Type': 'Merchant Credit Refund',
      'Target Account': 'User: Jane Doe (Acct #4402)',
      'Refund Value': '$450.00 USD',
      'Initiating Node': 'Support Assistant AI (Customer Chat)',
    },
    labels: {
      tMcep: 'Fraud Risk Assessment Time',
      tBuffer: 'Standard Verification Window',
      rScore: 'Purchase History Trust Ratio',
      deltaC: 'Account Origin Match',
      motive: 'Authorization Protocol',
    },
    options: {
      deltaC: [
        { value: 1, label: 'Validated location & IP matches account' },
        { value: -1, label: 'Suspicious proxy location detected' },
      ],
      motive: [
        { value: 1, label: 'Support Manager Override PIN' },
        { value: -1, label: 'Customer Bot Auto-Refund Request' },
      ],
    },
    units: 's',
    maxTime: 30,
  },
};

/* ── Logic ─────────────────────────────────────────────────────────────────── */
function computeGate(s: GateState, spec: ScenarioSpec): ComputedResult {
  const timingPasses = s.tMcep >= s.tBuffer;
  const integrityPasses = s.rScore >= 0;
  const product = s.deltaC * s.motive;
  const coerciveBlock = product === -1;
  const overallPasses = timingPasses && integrityPasses && !coerciveBlock;

  // State machine path
  let state: StateName = 'P0';
  const path: StateName[] = ['P0'];
  const reasons: string[] = ['Action Requested: Initializing Governance Evaluation.'];

  // Gate 1: Temporal
  if (!timingPasses) {
    state = 'P2';
    path.push('P2');
    reasons.push(`[TEMPORAL GATE FAILED] ${spec.labels.tMcep} (${s.tMcep}${spec.units}) is less than the required ${spec.labels.tBuffer} (${s.tBuffer}${spec.units}). Action paused to prevent flash exploits.`);
  } else {
    state = 'P1';
    path.push('P1');
    reasons.push(`[TEMPORAL GATE PASSED] ${spec.labels.tMcep} (${s.tMcep}${spec.units}) satisfies the required hold window (${s.tBuffer}${spec.units}).`);

    // Gate 2 & 3: Relational / Intent
    if (!integrityPasses || coerciveBlock) {
      state = 'RA1';
      path.push('RA1');
      if (!integrityPasses) {
        reasons.push(`[PROVENANCE GATE FAILED] ${spec.labels.rScore} (${s.rScore.toFixed(1)}) is negative. Trust boundary violated.`);
      }
      if (coerciveBlock) {
        reasons.push(`[POLICY GATE FAILED] Coercive intent detected. ${spec.labels.deltaC} and ${spec.labels.motive} indicate an unauthorized loop signature.`);
      }
      state = 'RB1';
      path.push('RB1');
      reasons.push('ACTION BLOCKED: Routing payload to quarantined quarantine buffer for audit.');
    } else {
      state = 'RA1';
      path.push('RA1');
      reasons.push(`[PROVENANCE GATE PASSED] ${spec.labels.rScore} (${s.rScore.toFixed(1)}) is positive. Origin verified.`);
      state = 'P4';
      path.push('P4');
      reasons.push('ACTION AUTHORIZED: Dual-invariant guarantee met. Proceeding to execution.');
    }
  }

  const statusLabel = overallPasses
    ? 'Proceed Authorized'
    : !timingPasses
    ? 'Paused in Review'
    : 'Operation Blocked';

  const statusCode: 'blocked' | 'allowed' | 'warning' = overallPasses
    ? 'allowed'
    : !timingPasses
    ? 'warning'
    : 'blocked';

  const temporalCopy = timingPasses
    ? `${spec.labels.tMcep} (${s.tMcep}${spec.units}) has cleared the mandatory safety hold of ${s.tBuffer}${spec.units}. The system is now allowed to evaluate semantic validity.`
    : `The safety hold window has not expired. The action is held in queue (${s.tMcep}${spec.units} out of ${s.tBuffer}${spec.units} required). This delay makes automated flash-takeovers impossible.`;

  const relationalCopy = integrityPasses
    ? `${spec.labels.rScore} is positive (${s.rScore.toFixed(1)}). The trust boundary checks out, verifying that the action was initiated from an authorized state.`
    : `${spec.labels.rScore} is negative (${s.rScore.toFixed(1)}). The integrity check indicates that the agent is operating outside its authorized state or using forged credentials.`;

  const fusionCopy = coerciveBlock
    ? `The combination of '${s.deltaC === 1 ? 'Emerging' : 'Disruptive'}' signal and '${s.motive === 1 ? 'Explicit' : 'Compulsive'}' trigger indicates a policy breach. Coercive intent flag is active: execution aborted.`
    : `The combination of signal and trigger is validated. No runaway agent loop signatures or policy violations were detected.`;

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

/* ── Slider Component ───────────────────────────────────────────────────────── */
function Slider({
  id, label, min, max, step = 1, value, onChange, formatValue,
}: {
  id: string; label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  return (
    <div className="did-control">
      <div className="did-control__row">
        <label className="did-control__label" htmlFor={id}>{label}</label>
        <span className="did-control__val">{formatValue ? formatValue(value) : String(value)}</span>
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

/* ── Radio Chips Component ──────────────────────────────────────────────────── */
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

/* ── Main Component ─────────────────────────────────────────────────────────── */
const DEFAULT_STATES: Record<ScenarioType, GateState> = {
  wire_transfer: { tMcep: 15, tBuffer: 30, rScore: 0.4, deltaC: 1, motive: 1 },
  code_deployment: { tMcep: 12, tBuffer: 24, rScore: 0.6, deltaC: 1, motive: 1 },
  customer_refund: { tMcep: 8, tBuffer: 15, rScore: 0.5, deltaC: 1, motive: 1 },
};

export default function DualInvariantDemo() {
  const [scenario, setScenario] = useState<ScenarioType>('wire_transfer');
  const [gate, setGate] = useState<GateState>(DEFAULT_STATES.wire_transfer);
  const proof = useProofState();

  const spec = SCENARIOS[scenario];
  const result = computeGate(gate, spec);

  const update = useCallback(<K extends keyof GateState>(key: K, val: GateState[K]) => {
    setGate(g => ({ ...g, [key]: val }));
  }, []);

  const handleScenarioChange = (type: ScenarioType) => {
    setScenario(type);
    setGate(DEFAULT_STATES[type]);
  };

  const reset = () => {
    setGate(DEFAULT_STATES[scenario]);
  };

  return (
    <>
      <style>{`
        .did-root {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          width: 100%;
        }

        .did-selector-panel {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .did-select {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--surface-1);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          font-family: var(--font-display);
          font-size: var(--text-base);
          color: var(--text-primary);
          cursor: pointer;
          outline: none;
          transition: border-color var(--duration-fast);
        }

        .did-select:focus {
          border-color: var(--ember);
        }

        .did-glass {
          background: rgba(248, 246, 241, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(44, 37, 32, 0.12);
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 24px rgba(44, 37, 32, 0.05);
          overflow: hidden;
        }

        /* ── Payload Card ── */
        .did-payload-card {
          border-top: 2px solid var(--ember);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          background: linear-gradient(180deg, rgba(184, 92, 56, 0.02), transparent);
        }

        .did-payload-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .did-payload-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .did-payload-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .did-payload-key {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .did-payload-val {
          font-size: var(--text-sm);
          color: var(--text-primary);
          font-weight: 500;
        }

        /* ── Main Layout Grid ── */
        .did-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: var(--space-6);
          align-items: start;
        }

        .did-controls {
          padding: var(--space-6);
        }

        .did-controls__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-5);
        }

        .did-controls__eyebrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
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
          color: var(--text-secondary);
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
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        .did-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
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

        /* ── Visual Gates Pipeline ── */
        .did-pipeline-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          padding: var(--space-6);
        }

        .did-pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-dim);
          padding-bottom: var(--space-4);
        }

        .did-status-badge {
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
        }

        .did-status-badge--allowed { color: var(--sage); border-color: var(--sage); background: rgba(90, 122, 98, 0.08); }
        .did-status-badge--warning { color: #d97706; border-color: #d97706; background: rgba(217, 119, 6, 0.08); }
        .did-status-badge--blocked { color: #dc2626; border-color: #dc2626; background: rgba(220, 38, 38, 0.08); }

        .did-pipeline {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
        }

        .did-gate-card {
          padding: var(--space-5);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          background: var(--surface-1);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          transition: all var(--duration-mid);
        }

        .did-gate-card--pass {
          border-color: var(--sage);
          background: linear-gradient(180deg, var(--surface-1), rgba(90, 122, 98, 0.02));
        }

        .did-gate-card--fail {
          border-color: #dc2626;
          background: linear-gradient(180deg, var(--surface-1), rgba(220, 38, 38, 0.02));
        }

        .did-gate-card--pending {
          border-color: var(--border-mid);
          opacity: 0.6;
        }

        .did-gate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .did-gate-title {
          font-family: var(--font-display);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .did-gate-indicator {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
        }

        .did-gate-indicator--pass { color: var(--sage); background: rgba(90, 122, 98, 0.1); }
        .did-gate-indicator--fail { color: #dc2626; background: rgba(220, 38, 38, 0.1); }
        .did-gate-indicator--pending { color: var(--text-tertiary); background: var(--surface-2); }

        .did-gate-copy {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          flex-grow: 1;
        }

        /* ── Path details ── */
        .did-audit-panel {
          border-top: 1px solid var(--border-dim);
          padding-top: var(--space-5);
        }

        .did-audit-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-bottom: var(--space-3);
        }

        .did-audit-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .did-audit-item {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          padding-left: var(--space-4);
          border-left: 2px solid var(--border-mid);
          line-height: var(--leading-relaxed);
        }

        .did-audit-item--fail {
          border-left-color: #dc2626;
          color: #dc2626;
        }

        .did-audit-item--pass {
          border-left-color: var(--sage);
        }

        @media (max-width: 900px) {
          .did-grid { grid-template-columns: 1fr; }
          .did-pipeline { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .did-payload-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="did-root" style={{ position: 'relative' }}>
        <ProofStateBadge proof={proof} />

        {/* Scenario Selector & Payload Card */}
        <div className="did-glass did-selector-panel">
          <label className="did-control__label" htmlFor="specimen-select">Select Business Action Specimen</label>
          <select
            id="specimen-select"
            className="did-select"
            value={scenario}
            onChange={e => handleScenarioChange(e.target.value as ScenarioType)}
          >
            {Object.keys(SCENARIOS).map(k => (
              <option key={k} value={k}>{SCENARIOS[k as ScenarioType].name}</option>
            ))}
          </select>

          <div className="did-payload-card">
            <p className="did-payload-title">
              <span>{spec.icon}</span> Action Payload Spec
            </p>
            <div className="did-payload-grid">
              {Object.keys(spec.payload).map(k => (
                <div key={k} className="did-payload-item">
                  <span className="did-payload-key">{k}</span>
                  <span className="did-payload-val">{spec.payload[k]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls and Result Grid */}
        <div className="did-grid">
          {/* Controls */}
          <div className="did-glass did-controls">
            <div className="did-controls__header">
              <p className="did-controls__eyebrow">Constraints</p>
              <button className="btn btn--ghost" onClick={reset} style={{ padding: '0.4rem 1rem' }} type="button">
                Reset Scenario
              </button>
            </div>

            <Slider
              id="t-mcep"
              label={spec.labels.tMcep}
              min={0}
              max={spec.maxTime}
              value={gate.tMcep}
              onChange={v => update('tMcep', v)}
              formatValue={v => `${v}${spec.units}`}
            />

            <Slider
              id="t-buffer"
              label={spec.labels.tBuffer}
              min={0}
              max={spec.maxTime}
              value={gate.tBuffer}
              onChange={v => update('tBuffer', v)}
              formatValue={v => `${v}${spec.units}`}
            />

            <Slider
              id="r-score"
              label={spec.labels.rScore}
              min={-1}
              max={1}
              step={0.1}
              value={gate.rScore}
              onChange={v => update('rScore', v)}
              formatValue={v => v.toFixed(1)}
            />

            <RadioChips<CoherenceDir>
              name="delta-c"
              legend={spec.labels.deltaC}
              options={spec.options.deltaC}
              value={gate.deltaC}
              onChange={v => update('deltaC', v)}
            />

            <RadioChips<MotivationType>
              name="motive"
              legend={spec.labels.motive}
              options={spec.options.motive}
              value={gate.motive}
              onChange={v => update('motive', v)}
            />
          </div>

          {/* Result & Pipeline */}
          <div className="did-glass did-pipeline-container">
            <div className="did-pipeline-header">
              <h3 className="did-gate-title" style={{ margin: 0 }}>Active Evaluation Pipeline</h3>
              <span className={`did-status-badge did-status-badge--${result.statusCode}`}>
                {result.statusLabel}
              </span>
            </div>

            <div className="did-pipeline">
              {/* Gate 1: Temporal Invariant */}
              <div className={`did-gate-card did-gate-card--${result.timingPasses ? 'pass' : 'fail'}`}>
                <div className="did-gate-header">
                  <span className="did-gate-title">1. Temporal Gate</span>
                  <span className={`did-gate-indicator did-gate-indicator--${result.timingPasses ? 'pass' : 'fail'}`}>
                    {result.timingPasses ? 'Clear' : 'Hold'}
                  </span>
                </div>
                <p className="did-gate-copy">{result.temporalCopy}</p>
              </div>

              {/* Gate 2: Provenance Gate */}
              <div className={`did-gate-card ${
                !result.timingPasses 
                  ? 'did-gate-card--pending' 
                  : result.integrityPasses 
                  ? 'did-gate-card--pass' 
                  : 'did-gate-card--fail'
              }`}>
                <div className="did-gate-header">
                  <span className="did-gate-title">2. Provenance Gate</span>
                  <span className={`did-gate-indicator did-gate-indicator--${
                    !result.timingPasses 
                      ? 'pending' 
                      : result.integrityPasses 
                      ? 'pass' 
                      : 'fail'
                  }`}>
                    {!result.timingPasses ? 'Wait' : result.integrityPasses ? 'Match' : 'Failed'}
                  </span>
                </div>
                <p className="did-gate-copy">
                  {!result.timingPasses 
                    ? 'Awaiting temporal gate clearance to execute authorization analysis.' 
                    : result.relationalCopy}
                </p>
              </div>

              {/* Gate 3: Combined Policy Invariant */}
              <div className={`did-gate-card ${
                !result.timingPasses || !result.integrityPasses
                  ? 'did-gate-card--pending' 
                  : !result.coerciveBlock 
                  ? 'did-gate-card--pass' 
                  : 'did-gate-card--fail'
              }`}>
                <div className="did-gate-header">
                  <span className="did-gate-title">3. Policy Invariant</span>
                  <span className={`did-gate-indicator did-gate-indicator--${
                    !result.timingPasses || !result.integrityPasses
                      ? 'pending' 
                      : !result.coerciveBlock 
                      ? 'pass' 
                      : 'fail'
                  }`}>
                    {!result.timingPasses || !result.integrityPasses ? 'Wait' : !result.coerciveBlock ? 'Clear' : 'Intervention'}
                  </span>
                </div>
                <p className="did-gate-copy">
                  {!result.timingPasses || !result.integrityPasses 
                    ? 'Awaiting previous invariants validation to assess execution intent.' 
                    : result.fusionCopy}
                </p>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="did-audit-panel">
              <h4 className="did-audit-title">Audit Trail &amp; Diagnostics</h4>
              <ul className="did-audit-list">
                {result.pathReasons.map((reason, i) => {
                  const isFail = reason.includes('FAILED') || reason.includes('BLOCKED');
                  const isPass = reason.includes('PASSED') || reason.includes('AUTHORIZED');
                  const itemClass = isFail 
                    ? 'did-audit-item--fail' 
                    : isPass 
                    ? 'did-audit-item--pass' 
                    : '';
                  return (
                    <li key={i} className={`did-audit-item ${itemClass}`}>
                      {reason}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
