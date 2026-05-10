# MCRC Simulation — Public Demo & Verification Kit

This kit contains the reference implementation of the **Minimal Constitutional Runtime Contract (MCRC) v1.0.0-alpha**, the **Zahavian Signaling Pipeline**, and the **Commercial & Constitutional Sequencing Gates** developed as part of the Oscillatory Fields research corpus.

Everything in this directory is reproducible. The cryptographic signatures are real. The revocation latencies are real.

---

## Requirements

```bash
python >= 3.10
pip install cryptography
```

---

## Step 1 — Run the Stress Test Harness

This generates the $\lambda/\mu$ concurrent simulation across three trial conditions.

```bash
python simulations/constitutional_stress_test.py
```

**Expected output:**

```
=== Constitutional Stress Test (with Zahavian CPE) ===
[Baseline] Completed normally without revocation.
[Fracture] Injected Provenance Fracture.
[Fracture] REVOKED! Latency: 1.12ms
[Fracture] FALLBACK engaged.
[Bifurcation] Injected Circuit Bifurcation.
[Bifurcation] REVOKED! Latency: 1.20ms
[Bifurcation] FALLBACK engaged.
```

**Artifacts generated:**
- `simulations/stress_test_results.jsonl` — full append-only telemetry chain
- `simulations/zahavian_attestations.jsonl` — Ed25519-signed Constitutional Provenance Envelopes (CPEs)
- `simulations/keys/mu_public_key.pem` — the μ-node's public key for independent verification

---

## Step 2 — Independently Verify the Signatures

This verifier loads the public key and cryptographically validates every CPE in the attestation chain.

```bash
python simulations/verify_zahavian_signal.py
```

**Expected output:**

```
=== Zahavian CPE Verifier ===
[Baseline] PASS: CPE verified. MCRC State: IDLE, Latency: 0.0ms
[Fracture] PASS: CPE verified. MCRC State: REVOKED, Latency: 1.12ms
[Bifurcation] PASS: CPE verified. MCRC State: REVOKED, Latency: 1.20ms
```

### How Ed25519 Signature Verification Works

Each CPE payload is serialized as a canonical JSON string (sorted keys), then signed with the μ-node's `Ed25519PrivateKey`. The verifier:

1. Loads `simulations/keys/mu_public_key.pem` independently.
2. Pops `mu_node_signature` from the CPE.
3. Re-serializes the remaining payload (`sort_keys=True`).
4. Calls `public_key.verify(signature_bytes, payload_bytes)`.
5. If the payload was altered in any way after signing, `cryptography.exceptions.InvalidSignature` is raised — the gate fails.

**To verify a single attestation manually:**

```python
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import json

with open("simulations/keys/mu_public_key.pem", "rb") as f:
    public_key = serialization.load_pem_public_key(f.read())

# Load one CPE
cpe = json.loads(open("simulations/zahavian_attestations.jsonl").readline())
sig = bytes.fromhex(cpe.pop("mu_node_signature"))
payload = json.dumps(cpe, sort_keys=True).encode()

public_key.verify(sig, payload)  # Raises InvalidSignature if tampered
print("Signature valid.")
```

### Production Mode (Rejects Simulated Anchors)

```bash
python simulations/verify_zahavian_signal.py --production
```

In production mode, the verifier additionally rejects any CPE where `anchor_mode == "simulated"`. This prevents simulated attestations from passing as production governance evidence.

---

## Step 3 — Run the Sequencing Gates

```bash
python simulations/sequencing_gates.py
```

**Expected output:**

```
=== Commercial & Constitutional Sequencing Gates ===
[Gate 1] CPE Pre-Ship Gate: PASS (Verifier passed all signatures)
[Gate 2] Revocation SLA Gate: PASS (All revocations <= 200ms)
[Gate 3] Autarky Integrity Gate: PASS (Stable windows verified)
[Gate 4] Commercial Divergence Lock: PASS (Manifest tip matches CPE tip)

Report written to simulations/gate_compliance_report.json
Alignment is measured in withheld revenue, not shipped features.
```

---

## Schema Reference — Constitutional Provenance Envelope (CPE)

| Field | Type | Description |
|---|---|---|
| `cpe_version` | `string` | Schema version. Verifier rejects unknown versions. |
| `nonce` | `int` | Monotonic counter. Verifier rejects replay / out-of-sequence. |
| `anchor_mode` | `string` | `simulated` \| `tee` \| `merkle` \| `oracle`. Determines trust level. |
| `trial` | `string` | Human-readable trial identifier. |
| `mcrc_state` | `string` | FSM state at emission: `IDLE` \| `REVOKED`. |
| `delta_c_joint_window` | `float[]` | Sliding window of joint entropy measurements from μ-node. |
| `dynamic_threshold` | `float` | P95 of stable history + 0.05 margin. Used for anomaly detection. |
| `cmcp_lineage_root` | `string` | CMCP parent hash establishing context provenance. |
| `ce_ledger_anchor` | `string` | SHA-256 of the CE-Ledger block at time of emission. |
| `revocation_latency_ms` | `float` | Time from anomaly detection to FSM state transition to `REVOKED`. |
| `timestamp` | `ISO 8601` | UTC emission time. |
| `mu_node_signature` | `hex` | Ed25519 signature over canonical JSON payload (signature excluded). |

---

## Anchor Migration Path

| Phase | Anchor Mode | Mechanism |
|---|---|---|
| Phase 2.5 (current) | `simulated` | Deterministic SHA-256 hash chaining |
| Phase 3 | `tee` | Local TEE attestation or lightweight Merkle root |
| Phase 4 | `oracle` | External timestamp oracle or consensus anchoring |

The verifier enforces the anchor boundary: `simulated` anchors are rejected in `--production` mode.

---

## What This Proves

Running this kit end-to-end demonstrates:

1. **A real AI subsystem (λ-node) can be structurally revoked** in under 2ms when provenance fractures or semantic contradiction is detected — without human intervention.
2. **The revocation evidence is cryptographically immutable.** No post-hoc alteration of telemetry is possible without invalidating the Ed25519 signature.
3. **Commercial deployment can be physically gated on governance state.** The sequencing gates refuse to pass unless the CPE chain is valid, the SLA holds, and the autarky window is stable.

> Governance is structure, not policy. The failure is already installed — or it isn't.
