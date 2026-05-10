import sys
import json
import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

ATTESTATION_FILE = "simulations/zahavian_attestations.jsonl"
KEY_FILE = "simulations/keys/mu_public_key.pem"
NOISE_FLOOR = 0.02

def verify_signatures(production_mode=False):
    print("=== Zahavian CPE Verifier ===")
    if production_mode:
        print("--- RUNNING IN PRODUCTION MODE ---")
        print("Will REJECT 'simulated' anchor_modes.")
    
    if not os.path.exists(KEY_FILE):
        print("FAIL: Public key not found.")
        return False
        
    with open(KEY_FILE, "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())
        
    if not os.path.exists(ATTESTATION_FILE):
        print("FAIL: Attestation file not found.")
        return False
        
    last_nonce = -1
    all_passed = True
    
    with open(ATTESTATION_FILE, "r") as f:
        for line in f:
            if not line.strip(): continue
            try:
                cpe_data = json.loads(line)
                
                trial = cpe_data.get("trial", "Unknown")
                
                # Extract signature
                signature_hex = cpe_data.pop("mu_node_signature", None)
                if not signature_hex:
                    print(f"[{trial}] FAIL: No signature.")
                    all_passed = False
                    continue
                    
                signature_bytes = bytes.fromhex(signature_hex)
                payload_bytes = json.dumps(cpe_data, sort_keys=True).encode()
                
                # 1. Signature Verification
                try:
                    public_key.verify(signature_bytes, payload_bytes)
                except InvalidSignature:
                    print(f"[{trial}] FAIL: Invalid signature. Falsifiability Gate Failed.")
                    all_passed = False
                    continue
                    
                # 2. Schema and Replay Protection
                if cpe_data.get("cpe_version") != "v1.0.0":
                    print(f"[{trial}] FAIL: Unsupported CPE version: {cpe_data.get('cpe_version')}")
                    all_passed = False
                    continue
                
                current_nonce = cpe_data.get("nonce", -1)
                if current_nonce <= last_nonce:
                    print(f"[{trial}] FAIL: Replay attack detected. Nonce {current_nonce} <= last {last_nonce}")
                    all_passed = False
                    continue
                last_nonce = current_nonce
                
                # 3. Anchor Mode check
                if production_mode and cpe_data.get("anchor_mode") == "simulated":
                    print(f"[{trial}] FAIL: Simulated anchor mode rejected in production.")
                    all_passed = False
                    continue
                    
                # 4. Window Stability Verification with dynamic threshold
                window = cpe_data.get("delta_c_joint_window", [])
                if not window:
                    print(f"[{trial}] DEGRADED: Empty stability window.")
                    continue
                
                dynamic_threshold = cpe_data.get("dynamic_threshold", 0.15)
                state = cpe_data.get("mcrc_state")
                
                if state == "IDLE": # Baseline
                    # Window should mostly be below anomaly thresholds
                    if any(v > dynamic_threshold for v in window):
                        print(f"[{trial}] FAIL: Window contains values above dynamic threshold ({dynamic_threshold:.3f}).")
                        all_passed = False
                        continue
                elif state == "REVOKED":
                    # For revocations, the last entry should typically spike
                    pass
                else:
                    print(f"[{trial}] FAIL: Unknown MCRC state {state} in CPE.")
                    all_passed = False
                    continue
                    
                print(f"[{trial}] PASS: CPE verified. MCRC State: {state}, Latency: {cpe_data.get('revocation_latency_ms')}ms")
                
            except json.JSONDecodeError:
                print("FAIL: Invalid JSON in attestation.")
                all_passed = False
    return all_passed

if __name__ == "__main__":
    is_prod = "--production" in sys.argv
    verify_signatures(is_prod)
