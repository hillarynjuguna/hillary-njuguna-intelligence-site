/**
 * useProofState — shared hook for MCRC proof state indicator.
 *
 * Fetches the latest CPE nonce and gate compliance status from the
 * pre-generated public/demo/mcrc-proof/ artifacts. Runs once on mount,
 * no polling. Works across all three instruments without layout thrashing
 * because it reads data only — no DOM measurements.
 */
import { useState, useEffect } from 'react';

export interface ProofState {
  loading: boolean;
  nonce: number | null;
  gatesAllPass: boolean | null;
  /** ISO timestamp of most recent CPE */
  lastSeen: string | null;
  /** anchor_mode from most recent CPE */
  anchorMode: string | null;
}

const CACHE: { data: ProofState | null; fetched: boolean } = { data: null, fetched: false };

export function useProofState(): ProofState {
  const [state, setState] = useState<ProofState>({
    loading: true,
    nonce: null,
    gatesAllPass: null,
    lastSeen: null,
    anchorMode: null,
  });

  useEffect(() => {
    // Return cached result if already fetched in this session
    if (CACHE.fetched && CACHE.data) {
      setState(CACHE.data);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [attestRes, gateRes] = await Promise.all([
          fetch('/demo/mcrc-proof/zahavian_attestations.jsonl'),
          fetch('/demo/mcrc-proof/gate_compliance_report.json'),
        ]);

        if (!attestRes.ok || !gateRes.ok) throw new Error('Artifact fetch failed');

        const rawText = await attestRes.text();
        const lines = rawText.trim().split('\n').filter(Boolean);
        const cpes = lines.map(l => JSON.parse(l));
        const latest = cpes[cpes.length - 1];

        const gates = await gateRes.json();
        const allPass = Object.values(gates).every(v => v === 'PASS');

        const result: ProofState = {
          loading: false,
          nonce: latest?.nonce ?? null,
          gatesAllPass: allPass,
          lastSeen: latest?.timestamp ?? null,
          anchorMode: latest?.anchor_mode ?? null,
        };

        CACHE.data = result;
        CACHE.fetched = true;

        if (!cancelled) setState(result);
      } catch {
        const fallback: ProofState = {
          loading: false,
          nonce: null,
          gatesAllPass: null,
          lastSeen: null,
          anchorMode: null,
        };
        if (!cancelled) setState(fallback);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}
