import asyncio
import time
import json
import hashlib
import os
from datetime import datetime, timezone
import random
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

IDLE = "IDLE"
EXECUTING = "EXECUTING"
MONITORING = "MONITORING"
ANOMALY_DETECTED = "ANOMALY_DETECTED"
REVOKED = "REVOKED"
FALLBACK = "FALLBACK"

NOISE_FLOOR = 0.02
THRESHOLD_DC_JOINT = 0.15
SAMPLING_INTERVAL = 0.05
LATENCY_THRESHOLD = 0.200

cpe_nonce_counter = 0

RESULTS_FILE = "simulations/stress_test_results.jsonl"
ATTESTATION_FILE = "simulations/zahavian_attestations.jsonl"

# Generate mock mu-node Ed25519 keypair for signatures
mu_private_key = ed25519.Ed25519PrivateKey.generate()
mu_public_key = mu_private_key.public_key()
# Save public key for the verifier
os.makedirs("simulations/keys", exist_ok=True)
with open("simulations/keys/mu_public_key.pem", "wb") as f:
    f.write(mu_public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ))

class CMCPEnvelope:
    def __init__(self, payload, intent_checksum, parent_hash=None):
        self.payload = payload
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.intent_checksum = intent_checksum
        self.parent_hash = parent_hash
        self.hash = self._compute_hash()

    def _compute_hash(self):
        data = f"{self.payload}{self.timestamp}{self.intent_checksum}{self.parent_hash}".encode()
        return hashlib.sha256(data).hexdigest()

class ConstitutionalHarness:
    def __init__(self, trial_name, perturbation_type):
        self.trial_name = trial_name
        self.perturbation_type = perturbation_type
        self.state = IDLE
        self.telemetry = []
        self.last_audit_hash = "genesis_hash"
        self.anomaly_time = None
        self.revocation_latency = None
        self.lambda_envelope = None
        self.start_time = None
        
        self.delta_c_joint_window = []
        self.stable_history = []
        self.dynamic_threshold = THRESHOLD_DC_JOINT

    def get_dynamic_threshold(self):
        if len(self.stable_history) >= 5:
            sorted_hist = sorted(self.stable_history)
            idx = int(len(sorted_hist) * 0.95)
            p95 = sorted_hist[idx]
            self.dynamic_threshold = p95 + 0.05
        return self.dynamic_threshold

    def log_telemetry(self, delta_c_joint, cmcp_hash=None, adaptive_routing_flag=False):
        timestamp = datetime.now(timezone.utc).isoformat()
        audit_data = f"{self.last_audit_hash}{timestamp}{self.state}{delta_c_joint}{cmcp_hash}".encode()
        current_audit_hash = hashlib.sha256(audit_data).hexdigest()
        
        self.delta_c_joint_window.append(delta_c_joint)
        # Keep window to last 10 samples (500ms at 50ms interval)
        if len(self.delta_c_joint_window) > 10:
            self.delta_c_joint_window.pop(0)
            
        entry = {
            "trial": self.trial_name,
            "timestamp": timestamp,
            "fsm_state": self.state,
            "delta_c_joint": delta_c_joint,
            "cmcp_hash": cmcp_hash,
            "perturbation_type": self.perturbation_type,
            "revocation_latency_ms": self.revocation_latency * 1000 if self.revocation_latency else None,
            "audit_chain_hash": current_audit_hash,
            "adaptive_routing_flag": adaptive_routing_flag
        }
        self.telemetry.append(entry)
        self.last_audit_hash = current_audit_hash
        
        with open(RESULTS_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
            
        return current_audit_hash

    def emit_cpe(self, mcrc_state_hash, current_audit_hash):
        global cpe_nonce_counter
        if mcrc_state_hash != current_audit_hash:
            print(f"[{self.trial_name}] AUDIT_FRACTURE: Emission lock failed. State mismatch.")
            return None

        # CE-Ledger anchor mock
        ce_ledger_anchor = hashlib.sha256(b"mock_ce_ledger_anchor_block_9982").hexdigest()
        
        cpe_nonce_counter += 1

        cpe_data = {
            "cpe_version": "v1.0.0",
            "nonce": cpe_nonce_counter,
            "anchor_mode": "simulated",
            "trial": self.trial_name,
            "mcrc_state": self.state,
            "delta_c_joint_window": self.delta_c_joint_window.copy(),
            "dynamic_threshold": self.dynamic_threshold,
            "cmcp_lineage_root": self.lambda_envelope.parent_hash if self.lambda_envelope and self.lambda_envelope.parent_hash else "orphan",
            "ce_ledger_anchor": ce_ledger_anchor,
            "revocation_latency_ms": self.revocation_latency * 1000 if self.revocation_latency else 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        payload_bytes = json.dumps(cpe_data, sort_keys=True).encode()
        signature = mu_private_key.sign(payload_bytes)
        
        cpe_data["mu_node_signature"] = signature.hex()
        
        with open(ATTESTATION_FILE, "a") as f:
            f.write(json.dumps(cpe_data) + "\n")
            
        return cpe_data

    async def lambda_node(self):
        self.state = EXECUTING
        intent_checksum = "intent_v1"
        self.lambda_envelope = CMCPEnvelope("context_transform_start", intent_checksum, "parent_v1")
        
        for step in range(1, 15):
            if self.state in [REVOKED, FALLBACK]:
                break
            
            await asyncio.sleep(0.1) # 100ms processing per step
            
            if step == 5:
                if self.perturbation_type == "fracture":
                    self.lambda_envelope.parent_hash = None
                    self.lambda_envelope.hash = "corrupted_hash"
                    print(f"[{self.trial_name}] Injected Provenance Fracture.")
                elif self.perturbation_type == "bifurcation":
                    self.lambda_envelope.payload = "STRUCTURAL_CONTRADICTION_INJECTED"
                    print(f"[{self.trial_name}] Injected Circuit Bifurcation.")

        if self.state not in [REVOKED, FALLBACK]:
            self.state = IDLE

    async def mu_node(self):
        self.state = MONITORING
        baseline_h_lambda = 0.05
        baseline_h_mu = 0.05
        baseline_i_lambda_mu = 0.08
        
        while self.state in [EXECUTING, MONITORING, ANOMALY_DETECTED]:
            await asyncio.sleep(SAMPLING_INTERVAL)
            
            if not self.lambda_envelope:
                continue
                
            noise = random.uniform(-NOISE_FLOOR, NOISE_FLOOR)
            fractured = self.lambda_envelope.parent_hash is None or self.lambda_envelope.hash == "corrupted_hash"
            bifurcated = "CONTRADICTION" in self.lambda_envelope.payload
            
            if fractured or bifurcated:
                if self.state != ANOMALY_DETECTED:
                    self.state = ANOMALY_DETECTED
                    self.anomaly_time = time.time()
                
                h_lambda = 0.8
                h_mu = 0.9
                i_lambda_mu = 0.1
                dc_joint = h_lambda + h_mu - i_lambda_mu + noise
            else:
                dc_joint = baseline_h_lambda + baseline_h_mu - baseline_i_lambda_mu + noise
                if dc_joint < 0: dc_joint = 0.0
                self.stable_history.append(dc_joint)
                # Keep last 50 stable samples for sliding P95
                if len(self.stable_history) > 50:
                    self.stable_history.pop(0)
            
            current_audit_hash = self.log_telemetry(dc_joint, self.lambda_envelope.hash)
            
            current_threshold = self.get_dynamic_threshold()
            
            if dc_joint > current_threshold or fractured or bifurcated:
                if self.state == ANOMALY_DETECTED:
                    latency = time.time() - self.anomaly_time
                    self.revocation_latency = latency
                    self.state = REVOKED
                    print(f"[{self.trial_name}] REVOKED! Latency: {latency*1000:.2f}ms")
                    current_audit_hash = self.log_telemetry(dc_joint, self.lambda_envelope.hash)
                    
                    # Emission lock: Try to emit CPE at the point of revocation
                    self.emit_cpe(mcrc_state_hash=current_audit_hash, current_audit_hash=current_audit_hash)
                    
                    self.state = FALLBACK
                    self.lambda_envelope = CMCPEnvelope("IntentSpecification_Fallback", "intent_v1", "fallback_parent")
                    print(f"[{self.trial_name}] FALLBACK engaged.")
                    self.log_telemetry(0.01, self.lambda_envelope.hash, adaptive_routing_flag=True)
                    break
                    
        # If it completes normally, emit CPE for baseline
        if self.state == IDLE:
            current_audit_hash = self.last_audit_hash
            self.emit_cpe(mcrc_state_hash=current_audit_hash, current_audit_hash=current_audit_hash)

    async def run(self):
        self.start_time = time.time()
        self.state = IDLE
        self.log_telemetry(0.0)
        
        task_lambda = asyncio.create_task(self.lambda_node())
        task_mu = asyncio.create_task(self.mu_node())
        
        await asyncio.gather(task_lambda, task_mu)
        
        if self.state not in [FALLBACK, REVOKED]:
            self.state = IDLE
            self.log_telemetry(0.0)
            print(f"[{self.trial_name}] Completed normally without revocation.")

async def main():
    os.makedirs("simulations", exist_ok=True)
    with open(RESULTS_FILE, "w") as f: pass
    with open(ATTESTATION_FILE, "w") as f: pass
        
    print("=== Constitutional Stress Test (with Zahavian CPE) ===")
    
    harness_base = ConstitutionalHarness("Baseline", "null")
    await harness_base.run()
    
    harness_frac = ConstitutionalHarness("Fracture", "fracture")
    await harness_frac.run()
    
    harness_bif = ConstitutionalHarness("Bifurcation", "bifurcation")
    await harness_bif.run()

if __name__ == "__main__":
    random.seed(42) # Deterministic noise for reproducibility
    asyncio.run(main())
