import { useMemo, useState } from 'react';
import { useProofState } from '../../hooks/useProofState';
import ProofStateBadge from '../ui/ProofStateBadge';

type Direction = 1 | -1;
type ScenarioKey = 'treasury' | 'deployment' | 'refund';
type DecisionKind = 'approve' | 'hold' | 'escalate' | 'block';

interface GateState {
  elapsed: number;
  requiredHold: number;
  trustScore: number;
  sourceMatch: Direction;
  authorization: Direction;
}

interface Scenario {
  key: ScenarioKey;
  label: string;
  requestTitle: string;
  requestId: string;
  agent: string;
  asset: string;
  value: string;
  trigger: string;
  owner: string;
  risk: string;
  withoutGate: string;
  withGate: string;
  unit: string;
  maxTime: number;
  defaults: GateState;
  controls: {
    elapsed: string;
    requiredHold: string;
    trustScore: string;
    sourceMatch: string;
    authorization: string;
    sourceOptions: Record<Direction, string>;
    authOptions: Record<Direction, string>;
  };
  escalation: string;
  approval: string;
  block: string;
  hold: string;
}

interface Assessment {
  timingPasses: boolean;
  provenancePasses: boolean;
  behaviorPasses: boolean;
  decision: DecisionKind;
  headline: string;
  plainReason: string;
  operatorAction: string;
  businessImpact: string;
  riskScore: number;
  riskExplanation: string;
  path: string[];
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  treasury: {
    key: 'treasury',
    label: 'Treasury wire transfer',
    requestTitle: 'Release vendor payment',
    requestId: 'PAY-100K-8842',
    agent: 'Treasury Autopilot',
    asset: 'Vendor bank rail',
    value: '$100,000 USD',
    trigger: 'Invoice matched by AP agent',
    owner: 'Finance Operations',
    risk: 'Irreversible payment to a changed routing destination.',
    withoutGate: 'The agent can execute the wire as soon as it sees a matching invoice.',
    withGate: 'The action must wait, prove source integrity, and show human authorization before release.',
    unit: 's',
    maxTime: 60,
    defaults: { elapsed: 14, requiredHold: 30, trustScore: 0.5, sourceMatch: 1, authorization: 1 },
    controls: {
      elapsed: 'Time already spent in payment review',
      requiredHold: 'Minimum finance hold',
      trustScore: 'Vendor and invoice confidence',
      sourceMatch: 'Bank-detail consistency',
      authorization: 'Approval signal',
      sourceOptions: {
        1: 'Routing: Verified',
        '-1': 'Routing: Changed',
      },
      authOptions: {
        1: 'Approval: MFA-confirmed',
        '-1': 'Approval: API override',
      },
    },
    hold: 'Keep the payment queued until the hold window completes.',
    escalation: 'Route to Finance Operations for vendor re-verification.',
    block: 'Freeze the payment and open a fraud review.',
    approval: 'Release payment and append the approval evidence to the audit record.',
  },
  deployment: {
    key: 'deployment',
    label: 'Production deployment',
    requestTitle: 'Promote release to production',
    requestId: 'REL-3.4.1-EAST',
    agent: 'DevOps Release Agent',
    asset: 'Production cluster',
    value: 'Customer-facing service',
    trigger: 'CI pipeline completed',
    owner: 'Platform Engineering',
    risk: 'Unsigned or unreviewed code reaches production.',
    withoutGate: 'A retry loop can keep promoting the build after the first failed review.',
    withGate: 'Promotion waits for staging time, signed provenance, and non-looping approval behavior.',
    unit: 'h',
    maxTime: 48,
    defaults: { elapsed: 10, requiredHold: 24, trustScore: 0.6, sourceMatch: 1, authorization: 1 },
    controls: {
      elapsed: 'Time baked in staging',
      requiredHold: 'Minimum staging window',
      trustScore: 'Test and security confidence',
      sourceMatch: 'Commit provenance',
      authorization: 'Release trigger',
      sourceOptions: {
        1: 'Commits: All signed',
        '-1': 'Commits: Unsigned in path',
      },
      authOptions: {
        1: 'Trigger: Release manager',
        '-1': 'Trigger: Retry loop',
      },
    },
    hold: 'Keep the release in staging until the bake window completes.',
    escalation: 'Send the build to Platform Security for review.',
    block: 'Cancel promotion and freeze the pipeline until provenance is repaired.',
    approval: 'Promote the release and attach staging evidence to the change record.',
  },
  refund: {
    key: 'refund',
    label: 'Customer refund',
    requestTitle: 'Issue automated refund',
    requestId: 'RFND-450-7710',
    agent: 'Support Resolution Agent',
    asset: 'Merchant refund system',
    value: '$450 USD',
    trigger: 'Customer chat intent detected',
    owner: 'Customer Operations',
    risk: 'Refund abuse caused by scripted or hijacked support tickets.',
    withoutGate: 'The support agent can refund immediately after a persuasive chat request.',
    withGate: 'The request waits for fraud checks, account consistency, and manager authorization.',
    unit: 's',
    maxTime: 30,
    defaults: { elapsed: 8, requiredHold: 15, trustScore: 0.4, sourceMatch: 1, authorization: 1 },
    controls: {
      elapsed: 'Time in refund risk review',
      requiredHold: 'Minimum fraud screen',
      trustScore: 'Customer history confidence',
      sourceMatch: 'Account origin check',
      authorization: 'Refund authorization',
      sourceOptions: {
        1: 'Origin: Account history matches',
        '-1': 'Origin: Proxy location conflict',
      },
      authOptions: {
        1: 'Auth: Manager override',
        '-1': 'Auth: Bot-generated loop',
      },
    },
    hold: 'Keep the refund pending until the fraud window completes.',
    escalation: 'Ask Customer Operations to verify the account holder.',
    block: 'Block refund execution and flag the customer thread for abuse review.',
    approval: 'Issue the refund and store the evidence bundle with the case.',
  },
};

const DECISION_LABELS: Record<DecisionKind, string> = {
  approve: 'Approve',
  hold: 'Hold',
  escalate: 'Escalate',
  block: 'Block',
};

function assess(state: GateState, scenario: Scenario): Assessment {
  const timingPasses = state.elapsed >= state.requiredHold;
  const provenancePasses = state.trustScore >= 0 && state.sourceMatch === 1;
  const behaviorPasses = state.sourceMatch * state.authorization !== -1;

  let decision: DecisionKind = 'approve';
  let headline = 'Action can proceed';
  let plainReason = 'The waiting period is complete, the source evidence is clean, and the approval signal is not behaving like a bypass loop.';
  let operatorAction = scenario.approval;
  let businessImpact = 'The system can execute without bypassing governance.';

  if (!timingPasses) {
    decision = 'hold';
    headline = 'Too soon to execute';
    plainReason = `Only ${state.elapsed}${scenario.unit} of the required ${state.requiredHold}${scenario.unit} review window has elapsed.`;
    operatorAction = scenario.hold;
    businessImpact = 'This prevents fast, irreversible action before humans or monitoring systems have time to react.';
  } else if (!provenancePasses) {
    decision = 'escalate';
    headline = 'Evidence is not trustworthy enough';
    plainReason = state.trustScore < 0
      ? 'The trust evidence is negative, so the agent may be operating from a forged, stale, or untrusted state.'
      : 'The request source does not match the approved operational record.';
    operatorAction = scenario.escalation;
    businessImpact = 'This converts an uncertain automation event into a human-owned review before harm occurs.';
  } else if (!behaviorPasses) {
    decision = 'block';
    headline = 'Bypass pattern detected';
    plainReason = 'The request combines a valid-looking source with an authorization signal that behaves like an automated workaround.';
    operatorAction = scenario.block;
    businessImpact = 'This stops agents from using valid credentials in an invalid behavioral pattern.';
  }

  const baseRisk = 18;
  const timingRisk = !timingPasses ? 24 : 0;
  const provenanceRisk = !provenancePasses ? 32 : 0;
  const behaviorRisk = !behaviorPasses ? 35 : 0;
  const trustGapRisk = Math.round((1 - state.trustScore) * 10);
  const riskScore = Math.min(
    99,
    baseRisk + timingRisk + provenanceRisk + behaviorRisk + trustGapRisk,
  );
  const riskParts = [
    `base ${baseRisk}`,
    timingRisk ? `early-action +${timingRisk}` : null,
    provenanceRisk ? `evidence gap +${provenanceRisk}` : null,
    behaviorRisk ? `bypass pattern +${behaviorRisk}` : null,
    `trust gap +${trustGapRisk}`,
  ].filter(Boolean);
  const riskExplanation = `Not a probability: ${riskParts.join(' / ')}.`;

  return {
    timingPasses,
    provenancePasses,
    behaviorPasses,
    decision,
    headline,
    plainReason,
    operatorAction,
    businessImpact,
    riskScore,
    riskExplanation,
    path: [
      'Request received',
      timingPasses ? 'Review window satisfied' : 'Review window still open',
      provenancePasses ? 'Source evidence accepted' : 'Source evidence needs owner review',
      behaviorPasses ? 'No bypass pattern found' : 'Bypass pattern blocked',
      DECISION_LABELS[decision],
    ],
  };
}

function Slider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
}) {
  return (
    <label className="aid-control" htmlFor={id}>
      <span className="aid-control__top">
        <span>{label}</span>
        <strong>{formatValue(value)}</strong>
      </span>
      <input
        id={id}
        className="aid-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function Toggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<Direction, string>;
  value: Direction;
  onChange: (value: Direction) => void;
}) {
  const entries: Direction[] = [1, -1];

  return (
    <fieldset className="aid-toggle">
      <legend>{label}</legend>
      <div className="aid-toggle__grid">
        {entries.map(option => (
          <button
            key={option}
            className={`aid-choice ${value === option ? 'aid-choice--active' : ''}`}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
          >
            {options[option]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PassFail({ label, passes, detail }: { label: string; passes: boolean; detail: string }) {
  return (
    <article className={`aid-gate aid-gate--${passes ? 'pass' : 'fail'}`}>
      <div className="aid-gate__top">
        <h4>{label}</h4>
        <span>{passes ? 'Clear' : 'Needs action'}</span>
      </div>
      <p>{detail}</p>
    </article>
  );
}

export default function DualInvariantDemo() {
  const proof = useProofState();
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('treasury');
  const [state, setState] = useState<GateState>(SCENARIOS.treasury.defaults);

  const scenario = SCENARIOS[scenarioKey];
  const result = useMemo(() => assess(state, scenario), [state, scenario]);

  const setScenario = (key: ScenarioKey) => {
    setScenarioKey(key);
    setState(SCENARIOS[key].defaults);
  };

  const update = <K extends keyof GateState>(key: K, value: GateState[K]) => {
    setState(current => ({ ...current, [key]: value }));
  };

  return (
    <>
      <style>{`
        .aid-root {
          --aid-bg: #f1f5f9;
          --aid-panel: #ffffff;
          --aid-panel-muted: #f8fafc;
          --aid-border: #e2e8f0;
          --aid-border-strong: #cbd5e1;
          --aid-text: #0f172a;
          --aid-muted: #475569;
          --aid-faint: #64748b;
          --aid-blue: #2563eb;
          --aid-blue-soft: #eff6ff;
          --aid-green: #16a34a;
          --aid-green-soft: #dcfce7;
          --aid-amber: #ea580c;
          --aid-amber-dark: #c2410c;
          --aid-amber-soft: #ffedd5;
          --aid-red: #dc2626;
          --aid-red-soft: #fee2e2;
          --aid-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
          position: relative;
          display: grid;
          gap: var(--space-3);
          color: var(--aid-text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }

        .aid-root h3,
        .aid-root h4,
        .aid-root p,
        .aid-root button,
        .aid-root label,
        .aid-root legend,
        .aid-root span,
        .aid-root strong,
        .aid-root li {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          letter-spacing: -0.01em !important;
        }

        .aid-root .psb {
          position: static !important;
          margin: 0 !important;
          transform: none !important;
          z-index: auto !important;
        }

        .aid-header-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .aid-board {
          border: 1px solid var(--aid-border);
          border-radius: 8px;
          background: var(--aid-bg);
          overflow: hidden;
          padding: 0;
          box-shadow: var(--aid-shadow);
        }

        .aid-scenario-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--aid-border);
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          overflow: hidden;
        }

        .aid-mechanism-note {
          font-size: 0.8rem;
          color: var(--aid-muted);
          letter-spacing: 0.01em;
          line-height: 1.5;
          padding: 0.5rem 0.1rem;
          margin: 0;
          font-style: italic;
        }

        .aid-scenario {
          border: 0;
          background: var(--aid-panel);
          color: var(--aid-muted);
          padding: 0.55rem 0.85rem;
          text-align: left;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 650;
          transition: background var(--duration-fast), color var(--duration-fast);
        }

        .aid-scenario:hover,
        .aid-scenario--active {
          background: var(--aid-blue-soft);
          color: var(--aid-blue);
        }

        .aid-scenario small {
          display: block;
          margin-top: 0.15rem;
          color: var(--aid-faint);
          font-size: 0.64rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .aid-command {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
          gap: 0.85rem;
          padding: 0.85rem;
        }

        .aid-case {
          display: grid;
          gap: 1rem;
        }

        .aid-case__header {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .aid-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--aid-faint);
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .aid-case h3,
        .aid-decision h3 {
          font-size: 1.25rem !important;
          font-weight: 750 !important;
          margin: 0;
          line-height: 1.2;
          color: var(--aid-text);
        }

        .aid-request-id {
          flex: 0 0 auto;
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          padding: 0.45rem 0.6rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--aid-muted);
          background: var(--aid-panel);
        }

        .aid-facts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
          gap: 0.75rem;
        }

        .aid-fact {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          padding: 0.75rem;
          background: var(--aid-panel);
        }

        .aid-fact span {
          display: block;
          color: var(--aid-faint);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.3rem;
          font-weight: 700;
        }

        .aid-fact strong {
          display: block;
          color: var(--aid-text);
          font-size: 0.86rem;
          line-height: var(--leading-snug);
          font-weight: 650;
        }

        .aid-before-after {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .aid-compare {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          padding: 0.85rem;
          background: var(--aid-panel);
        }

        .aid-compare--risk {
          border-left: 3px solid var(--aid-red);
        }

        .aid-compare--safe {
          border-left: 3px solid var(--aid-green);
        }

        .aid-compare h4 {
          font-size: 0.86rem;
          margin-bottom: 0.35rem;
          font-weight: 750;
          color: var(--aid-text);
        }

        .aid-compare p,
        .aid-gate p,
        .aid-decision p,
        .aid-assurance p {
          color: var(--aid-muted);
          line-height: 1.45;
          font-size: 0.86rem;
        }

        .aid-decision {
          display: grid;
          gap: 0.65rem;
          border-left: 1px solid var(--aid-border);
          padding-left: 1rem;
        }

        .aid-status {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: var(--space-2);
          border-radius: 4px;
          border: 1px solid transparent;
          padding: 0.35rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 750;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .aid-status--approve {
          color: #ffffff !important;
          background: var(--aid-green) !important;
          border-color: var(--aid-green) !important;
        }

        .aid-status--hold {
          color: #ffffff !important;
          background: var(--aid-amber) !important;
          border-color: var(--aid-amber) !important;
        }

        .aid-status--escalate {
          color: #ffffff !important;
          background: var(--aid-amber-dark) !important;
          border-color: var(--aid-amber-dark) !important;
        }

        .aid-status--block {
          color: #ffffff !important;
          background: var(--aid-red) !important;
          border-color: var(--aid-red) !important;
        }

        .aid-risk-meter {
          display: grid;
          gap: 0.5rem;
        }

        .aid-risk-meter__top {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          font-size: 0.72rem;
          color: var(--aid-faint);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 750;
        }

        .aid-risk-meter__track {
          position: relative;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, #10b981 0%, #f59e0b 58%, #dc2626 100%) !important;
          border: 1px solid var(--aid-border);
          overflow: visible !important;
        }

        .aid-risk-meter__fill {
          display: none !important;
        }

        .aid-risk-meter__marker {
          position: absolute;
          top: 50%;
          width: 6px;
          height: 18px;
          border-radius: 3px;
          background: #ffffff !important;
          border: 2.5px solid #0f172a !important;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.3);
          transform: translate(-50%, -50%);
          z-index: 10 !important;
          transition: left var(--duration-mid) var(--ease-out);
        }

        .aid-risk-meter__note {
          color: var(--aid-muted);
          font-size: 0.76rem;
          line-height: 1.4;
        }

        .aid-next-action {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          padding: 0.85rem;
          background: var(--aid-panel);
        }

        .aid-next-action strong {
          display: block;
          margin-bottom: 0.3rem;
          color: var(--aid-text);
          font-weight: 750;
        }

        .aid-lower {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 0.85rem;
          padding: 0 0.85rem 0.85rem;
        }

        .aid-panel {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          background: var(--aid-panel);
          padding: 0.85rem;
        }

        .aid-panel h3 {
          font-size: 0.9rem !important;
          margin-bottom: 0.75rem;
          color: var(--aid-text);
          font-weight: 750;
        }

        .aid-control {
          display: grid;
          gap: 0.45rem;
          margin-bottom: 1rem;
        }

        .aid-control__top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-3);
          color: var(--aid-muted);
          font-size: 0.84rem;
        }

        .aid-control__top strong {
          color: var(--aid-text);
          font-family: var(--font-mono);
          font-size: 0.82rem;
        }

        .aid-slider {
          width: 100%;
          accent-color: var(--aid-blue);
        }

        .aid-toggle {
          border: 0;
          padding: 0;
          margin: 0 0 1rem;
        }

        .aid-toggle legend {
          color: var(--aid-muted);
          font-size: 0.84rem;
          margin-bottom: 0.45rem;
        }

        .aid-toggle__grid {
          display: grid;
          gap: 0.45rem;
        }

        .aid-choice {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          background: var(--aid-panel);
          color: var(--aid-muted);
          padding: 0.65rem;
          text-align: left;
          font-size: 0.82rem;
          line-height: var(--leading-snug);
          cursor: pointer;
        }

        .aid-choice:hover,
        .aid-choice--active {
          border-color: var(--aid-blue);
          color: #1e3a8a;
          background: var(--aid-blue-soft);
        }

        .aid-reset {
          width: 100%;
        }

        .aid-gates {
          display: grid;
          gap: 0.75rem;
        }

        .aid-gate {
          border: 1px solid var(--aid-border);
          border-radius: 6px;
          padding: 0.85rem;
          background: var(--aid-panel);
        }

        .aid-gate--pass {
          border-left: 3px solid var(--aid-green);
        }

        .aid-gate--fail {
          border-left: 3px solid var(--aid-amber-dark);
        }

        .aid-gate__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.35rem;
        }

        .aid-gate h4 {
          font-size: 0.9rem;
          margin: 0;
          color: var(--aid-text);
          font-weight: 750;
        }

        .aid-gate__top span {
          flex: 0 0 auto;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--aid-faint);
          font-weight: 750;
        }

        .aid-assurance {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          padding: 0.85rem;
          border-top: 1px solid var(--aid-border);
          background: var(--aid-panel-muted);
        }

        .aid-assurance article {
          border-left: 2px solid var(--aid-border-strong);
          padding-left: 0.6rem;
        }

        .aid-assurance h4 {
          font-size: 0.8rem !important;
          margin-bottom: 0.25rem;
          color: var(--aid-text);
          font-weight: 750;
        }

        .aid-audit {
          padding: 0.85rem;
          border-top: 1px solid var(--aid-border);
          background: var(--aid-panel);
        }

        .aid-audit ol {
          margin: 0;
          padding-left: var(--space-6);
          display: grid;
          gap: 0.35rem;
        }

        .aid-audit li {
          color: var(--aid-muted);
          font-size: 0.84rem;
          margin: 0;
        }

        .aid-formula {
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--aid-border);
          color: var(--aid-muted);
          font-size: 0.76rem;
          line-height: var(--leading-relaxed);
        }

        @media (max-width: 980px) {
          .aid-command,
          .aid-lower {
            grid-template-columns: 1fr;
          }

          .aid-decision {
            border-left: 0;
            padding-left: 0;
            border-top: 1px solid var(--aid-border);
            padding-top: 1rem;
          }

          .aid-assurance {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .aid-scenario-bar,
          .aid-facts,
          .aid-before-after,
          .aid-assurance {
            grid-template-columns: 1fr;
          }

          .aid-command,
          .aid-lower,
          .aid-audit,
          .aid-assurance {
            padding: 1rem;
          }

          .aid-case__header {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="aid-root">
        <div className="aid-scenario-bar" role="tablist" aria-label="High-risk AI action scenarios">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={scenarioKey === key}
              className={`aid-scenario ${scenarioKey === key ? 'aid-scenario--active' : ''}`}
              onClick={() => setScenario(key)}
            >
              {SCENARIOS[key].label}
              <small>{SCENARIOS[key].owner}</small>
            </button>
          ))}
        </div>

        <p className="aid-mechanism-note">
          The same three checks apply whether the asset is money, code, or a customer relationship. That consistency is the point.
        </p>

        <section className="aid-board" aria-label="AI action control desk">
          <div className="aid-command">
            <div className="aid-case">
              <div className="aid-case__header">
                <div>
                  <p className="aid-eyebrow">Action request</p>
                  <h3>{scenario.requestTitle}</h3>
                </div>
                <div className="aid-header-badges">
                  <ProofStateBadge proof={proof} />
                  <span className="aid-request-id">{scenario.requestId}</span>
                </div>
              </div>

              <div className="aid-facts">
                <div className="aid-fact">
                  <span>Agent</span>
                  <strong>{scenario.agent}</strong>
                </div>
                <div className="aid-fact">
                  <span>Asset at risk</span>
                  <strong>{scenario.asset}</strong>
                </div>
                <div className="aid-fact">
                  <span>Business value</span>
                  <strong>{scenario.value}</strong>
                </div>
                <div className="aid-fact">
                  <span>Trigger</span>
                  <strong>{scenario.trigger}</strong>
                </div>
                <div className="aid-fact">
                  <span>Primary risk</span>
                  <strong>{scenario.risk}</strong>
                </div>
              </div>

              <div className="aid-before-after">
                <article className="aid-compare aid-compare--risk">
                  <h4>Without a gate</h4>
                  <p>{scenario.withoutGate}</p>
                </article>
                <article className="aid-compare aid-compare--safe">
                  <h4>With this control layer</h4>
                  <p>{scenario.withGate}</p>
                </article>
              </div>
            </div>

            <aside className="aid-decision" aria-live="polite">
              <span className={`aid-status aid-status--${result.decision}`}>
                Decision: {DECISION_LABELS[result.decision]}
              </span>
              <div>
                <p className="aid-eyebrow">Reason</p>
                <h3>{result.headline}</h3>
                <p>{result.plainReason}</p>
              </div>
              <div className="aid-risk-meter" aria-label={`Risk score ${result.riskScore} out of 100`}>
                <div className="aid-risk-meter__top">
                  <span>Risk pressure index</span>
                  <strong>{result.riskScore}/100</strong>
                </div>
                <div className="aid-risk-meter__track">
                  <div className="aid-risk-meter__fill" style={{ width: `${result.riskScore}%` }} />
                  <span
                    className="aid-risk-meter__marker"
                    style={{ left: `${result.riskScore}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="aid-risk-meter__note">{result.riskExplanation}</p>
              </div>
              <div className="aid-next-action">
                <strong>Operator handoff</strong>
                <p>{result.operatorAction}</p>
              </div>
              <div className="aid-next-action">
                <strong>Business impact</strong>
                <p>{result.businessImpact}</p>
              </div>
            </aside>
          </div>

          <div className="aid-lower">
            <aside className="aid-panel">
              <h3>Change the evidence</h3>
              <Slider
                id="elapsed"
                label={scenario.controls.elapsed}
                min={0}
                max={scenario.maxTime}
                value={state.elapsed}
                onChange={value => update('elapsed', value)}
                formatValue={value => `${value}${scenario.unit}`}
              />
              <Slider
                id="requiredHold"
                label={scenario.controls.requiredHold}
                min={0}
                max={scenario.maxTime}
                value={state.requiredHold}
                onChange={value => update('requiredHold', value)}
                formatValue={value => `${value}${scenario.unit}`}
              />
              <Slider
                id="trustScore"
                label={scenario.controls.trustScore}
                min={-1}
                max={1}
                step={0.1}
                value={state.trustScore}
                onChange={value => update('trustScore', value)}
                formatValue={value => (value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1))}
              />
              <Toggle
                label={scenario.controls.sourceMatch}
                options={scenario.controls.sourceOptions}
                value={state.sourceMatch}
                onChange={value => update('sourceMatch', value)}
              />
              <Toggle
                label={scenario.controls.authorization}
                options={scenario.controls.authOptions}
                value={state.authorization}
                onChange={value => update('authorization', value)}
              />
              <button className="btn btn--ghost aid-reset" type="button" onClick={() => setState(scenario.defaults)}>
                Reset case
              </button>
            </aside>

            <div className="aid-panel">
              <h3>Control checks</h3>
              <div className="aid-gates">
                <PassFail
                  label="1. Has enough time passed?"
                  passes={result.timingPasses}
                  detail={
                    result.timingPasses
                      ? 'The action has waited long enough for monitoring, human review, or cancellation.'
                      : 'The action is still inside the mandatory delay window, so execution is held.'
                  }
                />
                <PassFail
                  label="2. Do we trust where it came from?"
                  passes={result.provenancePasses}
                  detail={
                    result.provenancePasses
                      ? 'The source record and confidence score support automatic evaluation.'
                      : 'The source evidence is weak or inconsistent, so ownership must move to a human team.'
                  }
                />
                <PassFail
                  label="3. Does behavior look authorized?"
                  passes={result.behaviorPasses}
                  detail={
                    result.behaviorPasses
                      ? 'The approval signal is consistent with the source evidence.'
                      : 'The combination looks like valid access being used through an invalid bypass pattern.'
                  }
                />
              </div>

              <p className="aid-formula">
                Formal layer retained: elapsed time must exceed the required hold, trust must stay non-negative,
                and source direction multiplied by authorization direction must not equal a bypass signature.
              </p>
            </div>
          </div>

          <div className="aid-assurance" aria-label="Industry control-plane patterns represented">
            <article>
              <h4>Agent identity</h4>
              <p>Every request is tied to an agent, asset, owner, and case identifier.</p>
            </article>
            <article>
              <h4>Least privilege</h4>
              <p>The demo treats money, production, and refunds as separate high-risk scopes.</p>
            </article>
            <article>
              <h4>Human handoff</h4>
              <p>Uncertain cases become owner review, not silent automation.</p>
            </article>
            <article>
              <h4>Auditability</h4>
              <p>The decision path is preserved as an explainable event chain.</p>
            </article>
          </div>

          <div className="aid-audit">
            <p className="aid-eyebrow">Audit event preview</p>
            <ol>
              {result.path.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}
