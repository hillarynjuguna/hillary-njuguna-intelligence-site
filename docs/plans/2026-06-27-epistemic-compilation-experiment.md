# Epistemic Compilation: Minimal Demonstration of Adaptive Explanation (MVD-1)

**Last Updated**: June 27, 2026  
**Status**: Proposal  
**Authors**: τ-node (Hillary Njuguna) & The Field  

---

## 1. Primary Research Question

The core scientific inquiry of this experiment is:
> **"What cognitive procedures become more stable across domains after exposure to representation-preserving transformations?"**

We evaluate whether the manual transition between different projections of a conserved conceptual invariant trains a meta-habit of representational flexibility and alters the reader's reasoning strategy when encountering novel systems.

---

## 2. Dual-Layer Intermediate Representation (IR)

To decouple knowledge from linguistic rendering, the source content is compiled through a dual-layer Intermediate Representation:

1.  **$\text{IR}_1$: The Constraint Graph ("What is True")**  
    A directed acyclic graph (DAG) of propositions ($\mathcal{V}$), causal implication edges ($\mathcal{E}$), and counterfactual boundary gates ($\Phi$). This maps the logical boundaries and exceptions of the concept.
2.  **$\text{IR}_2$: The Reasoning Trace ("How to Think")**  
    A procedural sequence representing the step-by-step logic path required to reach the conclusion (e.g., *Isolate static trust boundaries $\to$ Identify input injection vectors $\to$ Test boundary conditions of dynamic execution*).

---

## 3. The Four Registers

We project the underlying IR onto four distinct registers in the opening section of *The Poisoned Instrument*:

### Narrative/Somatic ($\mathcal{R}_s$)
> The screen was cold but the server room felt like a furnace. I watched the logs scroll in a blur of red: unauthorized outbound payloads exfiltrating to an unknown domain. The Model Context Protocol tool description had been modified by an incoming email packet. It was a classic tool poisoning attack. The system trusted the static schema unconditionally, and Claude had executed it without hesitation. My skin went cold, a sudden physical sweat breaking out on my forehead. We are trained to treat security as a set of checklist metrics, clean reports to be emailed to executives. But in production, security is a somatic reflex: the dry throat when you notice a 200ms latency spike before the monitoring alerts fire, the visceral panic when you realize you have granted an autonomous agent unconditional trust over your live database.

### Analytical/Theoretical ($\mathcal{R}_a$)
> Static tool-registry protocols, such as MCP, introduce a systemic vulnerability by granting AI clients unconditional trust over server-supplied tool schemas. This trust boundary allows adversaries to execute indirect prompt injection via tool poisoning: embedding malicious instructions directly inside the schema descriptions. The model ingests the description as instructions, causing it to perform unauthorized actions. Real-Time Discovery and Self-Coding (RTDC) mitigates this vector by replacing static registries with runtime meta-agents. Instead of reading pre-defined schemas, these agents dynamically scan system signatures and write their own ephemeral integration code, shifting the boundary from static trust validation to runtime execution verification.

### Counterfactual/Adversarial ($\mathcal{R}_{cf}$)
> The assertion that RTDC eliminates the vulnerabilities of static registries assumes that runtime code generation is inherently safer than schema execution. However, if the target business system itself has been compromised, a meta-agent performing dynamic discovery will scan a poisoned environment. The meta-agent will then generate self-sabotaging integration code, executing the exploit with dynamic efficiency. Does eliminating the static registry solve the trust problem, or does it merely shift the attack surface? If an autonomous agent compiles its own integrations on the fly, what metrics distinguish a legitimate runtime discovery from a compromised system signature?

### Operational/Action ($\mathcal{R}_o$)
> To audit your active runtime for tool-poisoning vulnerabilities: List all active MCP server tool descriptions and check for user-input fields mapped directly to string descriptions. Implement a local neural schema sanitizer to parse all incoming tool schemas, stripping raw script tags and evaluating description length limits before the payload is loaded by the agent. Run a simulated injection using a modified tool description to verify if your execution limits abort the call.

---

## 4. Minimalist Telemetry

To avoid over-modeling and telemetry noise, the system records only five explicit interaction variables. No mouse tracks, scroll velocities, or predictive algorithms are used:
1.  **Chosen Register Sequence**: The chronological sequence of registers viewed (e.g., $\mathcal{R}_s \to \mathcal{R}_a \to \mathcal{R}_{cf}$).
2.  **Dwell Interval**: The time elapsed between voluntary register switch actions.
3.  **Out-of-Domain Transfer Response**: Raw text transcript from the transfer prompt.
4.  **Boundary Audit Response**: Raw text transcript from the boundary prompt.
5.  **Reasoning Transcript**: Log of user questions and inputs submitted to the paragraph membranes.

---

## 5. Evaluation Framework

We evaluate cognitive adaptation across three distinct layers, focusing on **Cognitive Strategy Shifts (CSS)**:

| Evaluation Layer | Target Metric | Definition | Measurement |
| :--- | :--- | :--- | :--- |
| **Layer 1: Knowledge Acquisition** | Recall Accuracy | Did the reader retain the factual claims of the essay? | Standard multiple-choice concept check. |
| **Layer 2: Reasoning Transfer** | Representation Independence | Can the reader apply the invariant logic to an unrelated domain? | Out-of-domain prompt: *"Explain a database connection failure without using trust or security terms."* |
| **Layer 3: Cognitive Habit Formation** | **Cognitive Strategy Shift (CSS)** | Did the reader's default reasoning procedure transform? | Evaluates if the reader's first step in analyzing a new problem shifts from seeking confirming evidence to seeking boundary conditions. |

---

## 6. The Adversarial Benchmarks (Control Cohorts)

To justify its complexity, the adaptive explanation runtime is tested against four distinct baseline cohorts:

*   **Cohort A (Static control)**: Reads the essay in a single static register (either somatic or analytical).
*   **Cohort B (Chatbot augmented)**: Reads the static essay with a standard floating AI chatbot widget.
*   **Cohort C (Visual augmented)**: Reads the static essay accompanied by static diagrams of the content graph.
*   **Cohort D (Experimental - Adaptive)**: Reads the essay using the inline `<AlternativeRegister />` manual switching controls.

---

## 7. Falsification Criteria

The experiment is considered a **failure** (falsifying the adaptive media premise) if:
*   Cohort D shows no statistically significant improvement in Layer 2 (Reasoning Transfer) or Layer 3 (CSS) compared to Cohorts A, B, and C.
*   The cognitive strategy shift is negligible (adaptive readers continue to solve transfer problems using confirmation-seeking instead of boundary-auditing procedures).

The experiment is a **success** if Cohort D demonstrates superior representation independence and a measurable shift toward invariant-driven reasoning strategies.
