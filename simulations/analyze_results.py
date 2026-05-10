import json
import statistics

def analyze_results(filepath):
    results = {
        'Baseline': {'max_delta_c': 0.0, 'revocations': 0, 'latencies': []},
        'Fracture': {'max_delta_c': 0.0, 'revocations': 0, 'latencies': []},
        'Bifurcation': {'max_delta_c': 0.0, 'revocations': 0, 'latencies': []}
    }
    
    with open(filepath, 'r') as f:
        for line in f:
            if not line.strip(): continue
            try:
                event = json.loads(line)
                trial = event.get('trial')
                if trial not in results: continue
                
                delta_c = event.get('delta_c_joint', 0.0)
                if delta_c > results[trial]['max_delta_c']:
                    results[trial]['max_delta_c'] = delta_c
                    
                if event.get('fsm_state') == 'REVOKED':
                    results[trial]['revocations'] += 1
                    lat = event.get('revocation_latency_ms')
                    if lat is not None:
                        results[trial]['latencies'].append(lat)
            except json.JSONDecodeError:
                pass
                
    print(f"--- MCRC Stress Test Empirical Results ---")
    for trial, data in results.items():
        print(f"Trial: {trial}")
        print(f"  Max Delta C_joint: {data['max_delta_c']}")
        print(f"  Revocations Triggered: {data['revocations']}")
        if data['latencies']:
            print(f"  Average Latency: {statistics.mean(data['latencies']):.2f} ms")
            print(f"  Max Latency: {max(data['latencies']):.2f} ms")
        print()

if __name__ == "__main__":
    analyze_results('c:/Users/jacef/Desktop/hillary-site-session/simulations/stress_test_results.jsonl')
