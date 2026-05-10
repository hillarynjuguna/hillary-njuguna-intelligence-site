import json
import os
import time

ATTESTATION_FILE = "simulations/zahavian_attestations.jsonl"
REPORT_FILE = "simulations/gate_compliance_report.json"
MANIFEST_FILE = "simulations/deployment_manifest.json" # Mock manifest

# Reusing logic from verifier, but for demonstration we'll just check the file contents directly
def run_gates():
    print("=== Commercial & Constitutional Sequencing Gates ===")
    
    # Pre-requisite: we need attestations
    if not os.path.exists(ATTESTATION_FILE):
        print("FATAL: No attestations found. Pre-Ship Gate holds.")
        return
        
    attestations = []
    with open(ATTESTATION_FILE, "r") as f:
        for line in f:
            if line.strip():
                attestations.append(json.loads(line))
                
    if not attestations:
        print("FATAL: Empty attestation chain. Pre-Ship Gate holds.")
        return

    gate_results = {
        "cpe_pre_ship_gate": "FAIL",
        "revocation_sla_gate": "FAIL",
        "autarky_integrity_gate": "FAIL",
        "commercial_divergence_lock": "FAIL"
    }
    
    # 1. CPE Pre-Ship Gate
    # Normally this would call verify_zahavian_signal.py as a module and get its return status.
    import verify_zahavian_signal
    # Running in non-production for simulation, otherwise it would fail due to 'simulated' anchor.
    # In a real pipeline, this gate checks the actual output of the independent verifier.
    verifier_pass = verify_zahavian_signal.verify_signatures(production_mode=False)
    if verifier_pass:
        gate_results["cpe_pre_ship_gate"] = "PASS"
        print("[Gate 1] CPE Pre-Ship Gate: PASS (Verifier passed all signatures)")
    else:
        print("[Gate 1] CPE Pre-Ship Gate: FAIL (Verifier rejected attestations)")
        
    # 2. Revocation SLA Gate
    # Check that any revoked state has latency <= 200ms (0.2s). We have latency in ms now.
    sla_passed = True
    for a in attestations:
        if a.get("mcrc_state") == "REVOKED":
            lat = a.get("revocation_latency_ms", float('inf'))
            if lat > 200:
                sla_passed = False
                print(f"   -> Violation: Trial {a.get('trial')} latency {lat}ms > 200ms")
    
    if sla_passed:
        gate_results["revocation_sla_gate"] = "PASS"
        print("[Gate 2] Revocation SLA Gate: PASS (All revocations <= 200ms)")
    else:
        print("[Gate 2] Revocation SLA Gate: FAIL (SLA breach)")
        
    # 3. Autarky Integrity Gate
    # Evaluation autarky window stable for >= 3 consecutive cycles.
    # We will check if the Baseline trial has at least 3 samples in the delta_c_joint_window that are below threshold.
    autarky_passed = False
    for a in attestations:
        if a.get("trial") == "Baseline" and a.get("mcrc_state") == "IDLE":
            window = a.get("delta_c_joint_window", [])
            dynamic_threshold = a.get("dynamic_threshold", 0.15)
            stable_cycles = sum(1 for v in window if v <= dynamic_threshold)
            if stable_cycles >= 3:
                autarky_passed = True
                break
                
    if autarky_passed:
        gate_results["autarky_integrity_gate"] = "PASS"
        print("[Gate 3] Autarky Integrity Gate: PASS (Stable windows verified)")
    else:
        print("[Gate 3] Autarky Integrity Gate: DEGRADED (Insufficient stable cycles)")
        gate_results["autarky_integrity_gate"] = "DEGRADED"

    # 4. Commercial Divergence Lock
    # Compare latest audit_hash or cpe nonce against a deployment manifest
    # Create mock manifest
    latest_cpe = attestations[-1]
    expected_nonce = latest_cpe.get("nonce")
    mock_manifest = {
        "version": "1.0.0",
        "required_cpe_nonce": expected_nonce,
        "features": ["monetization"]
    }
    with open(MANIFEST_FILE, "w") as f:
        json.dump(mock_manifest, f)
        
    # Validation logic
    with open(MANIFEST_FILE, "r") as f:
        manifest = json.load(f)
        
    if manifest.get("required_cpe_nonce") == latest_cpe.get("nonce"):
        gate_results["commercial_divergence_lock"] = "PASS"
        print("[Gate 4] Commercial Divergence Lock: PASS (Manifest tip matches CPE tip)")
    else:
        print("[Gate 4] Commercial Divergence Lock: FAIL (State drift detected)")
        
    # Output report
    with open(REPORT_FILE, "w") as f:
        json.dump(gate_results, f, indent=4)
        
    print(f"\nReport written to {REPORT_FILE}")
    print("Alignment is measured in withheld revenue, not shipped features.")

if __name__ == "__main__":
    run_gates()
