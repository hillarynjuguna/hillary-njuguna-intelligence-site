/**
 * ProofStateBadge — shared UI component for all three instruments.
 * Reads live CPE nonce and gate status from useProofState.
 * Renders a compact, non-intrusive indicator anchored to the top-right
 * of the instrument shell. Does NOT cause layout thrashing — pure CSS
 * position:absolute, no DOM measurement required.
 */
import type { ProofState } from '../../hooks/useProofState';

interface Props {
  proof: ProofState;
}

const STYLES = `
  .psb {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid;
    line-height: 1;
    cursor: default;
    user-select: none;
    transition: opacity 0.3s;
  }
  .psb--loading {
    color: var(--text-tertiary, #888);
    border-color: var(--border-dim, #ddd);
    background: transparent;
    opacity: 0.5;
  }
  .psb--pass {
    color: #4caf7d;
    border-color: rgba(76,175,125,0.4);
    background: rgba(76,175,125,0.08);
  }
  .psb--fail {
    color: #e05252;
    border-color: rgba(224,82,82,0.4);
    background: rgba(224,82,82,0.08);
  }
  .psb--unknown {
    color: var(--text-tertiary, #999);
    border-color: var(--border-dim, #ddd);
    background: transparent;
    opacity: 0.7;
  }
  .psb__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .psb__dot--pulse {
    animation: psb-pulse 2s ease-in-out infinite;
  }
  @keyframes psb-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .psb__link {
    color: inherit;
    text-decoration: none;
    opacity: 0.75;
  }
  .psb__link:hover { opacity: 1; }
`;

export default function ProofStateBadge({ proof }: Props) {
  const { loading, nonce, gatesAllPass } = proof;

  let variant: 'loading' | 'pass' | 'fail' | 'unknown' = 'unknown';
  let label = '';
  let pulse = false;

  if (loading) {
    variant = 'loading';
    label = 'Proof …';
    pulse = true;
  } else if (gatesAllPass === null || nonce === null) {
    variant = 'unknown';
    label = 'Proof N/A';
  } else if (gatesAllPass) {
    variant = 'pass';
    label = `CPE #${nonce} · 4/4`;
  } else {
    variant = 'fail';
    label = `CPE #${nonce} · Gate fail`;
  }

  return (
    <>
      <style>{STYLES}</style>
      <a
        href="/proof"
        className={`psb psb--${variant}`}
        title={
          loading
            ? 'Loading proof state…'
            : gatesAllPass
            ? `MCRC CPE nonce #${nonce} — all 4 sequencing gates passed`
            : nonce
            ? `MCRC CPE nonce #${nonce} — one or more gates failed`
            : 'Proof artifacts unavailable'
        }
        aria-label="View MCRC constitutional proof"
      >
        <span className={`psb__dot${pulse ? ' psb__dot--pulse' : ''}`} aria-hidden="true" />
        {label}
        <span className="psb__link">↗</span>
      </a>
    </>
  );
}
