# Epistemic Compilation Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement the "Show me this differently" manual register-switching component (MVD-1) and integrate it into *The Specific Hunger* blog post.

**Architecture:** Create a client-side Astro component (`AlternativeRegister.astro`) that renders parallel text registers and provides inline controls to toggle between them. Track voluntary switches in sessionStorage.

**Tech Stack:** Astro, JavaScript, MDX.

---

### Task 1: Create the AlternativeRegister Component

**Files:**
- Create: `src/components/mdx/AlternativeRegister.astro`

**Step 1: Write the component markup and client-side toggle script**

Write the following code into `src/components/mdx/AlternativeRegister.astro`:
```html
---
interface Props {
  id?: string;
  somatic: string;
  analytical: string;
  counterfactual: string;
  operational: string;
}

const { id = "mvd-block", somatic, analytical, counterfactual, operational } = Astro.props;
---

<div class="alternative-register-block" id={id}>
  <div class="register-content-wrapper">
    <div class="register-text somatic-text active-register">{somatic}</div>
    <div class="register-text analytical-text hidden-register">{analytical}</div>
    <div class="register-text counterfactual-text hidden-register">{counterfactual}</div>
    <div class="register-text operational-text hidden-register">{operational}</div>
  </div>
  
  <div class="register-control-bar">
    <button class="register-btn active" data-target="somatic">[ Read somatic ]</button>
    <button class="register-btn" data-target="analytical">[ Show analytical ]</button>
    <button class="register-btn" data-target="counterfactual">[ Audit self ]</button>
    <button class="register-btn" data-target="operational">[ Try practice ]</button>
  </div>
</div>

<style>
  .alternative-register-block {
    margin: var(--space-8) 0;
    padding: var(--space-6);
    background: var(--surface-2);
    border: 1px solid var(--border-dim);
    border-radius: var(--radius-md);
  }
  .register-text {
    font-size: var(--text-md);
    line-height: var(--leading-relaxed);
  }
  .hidden-register {
    display: none;
  }
  .register-control-bar {
    margin-top: var(--space-6);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    border-top: 1px solid var(--border-dim);
    padding-top: var(--space-4);
  }
  .register-btn {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    transition: all var(--duration-fast) var(--ease-out);
  }
  .register-btn:hover {
    color: var(--ember);
  }
  .register-btn.active {
    color: var(--ember-bright);
    text-shadow: 0 0 4px rgba(196, 112, 58, 0.4);
  }
</style>

<script>
  function initRegisters() {
    document.querySelectorAll('.alternative-register-block').forEach((el) => {
      const blockId = el.id;
      const texts = {
        somatic: el.querySelector('.somatic-text'),
        analytical: el.querySelector('.analytical-text'),
        counterfactual: el.querySelector('.counterfactual-text'),
        operational: el.querySelector('.operational-text')
      };
      const buttons = el.querySelectorAll('.register-btn');
      
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target') as keyof typeof texts;
          
          // Toggle text visibility
          Object.keys(texts).forEach((key) => {
            const textEl = texts[key as keyof typeof texts];
            if (textEl) {
              if (key === target) {
                textEl.classList.remove('hidden-register');
                textEl.setAttribute('style', 'display: block;');
              } else {
                textEl.classList.add('hidden-register');
                textEl.setAttribute('style', 'display: none;');
              }
            }
          });
          
          // Toggle active button style
          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          
          // Record voluntary switch event in sessionStorage
          const log = JSON.parse(sessionStorage.getItem('mvd_telemetry') || '[]');
          log.push({
            timestamp: new Date().toISOString(),
            blockId: blockId,
            targetRegister: target
          });
          sessionStorage.setItem('mvd_telemetry', JSON.stringify(log));
        });
      });
    });
  }

  // Run on load and on view transition
  initRegisters();
  document.addEventListener('astro:page-load', initRegisters);
</script>
```

**Step 2: Commit**

```bash
git add src/components/mdx/AlternativeRegister.astro
git commit -m "feat: implement AlternativeRegister component for MVD-1"
```

---

### Task 2: Bind AlternativeRegister to the MDX Renderer

**Files:**
- Modify: `src/pages/blog/[slug].astro`

**Step 1: Import and map the component**

Add import for `AlternativeRegister` and register it inside `<Content components={{ ... }} />`:
```diff
@@ -16,2 +16,3 @@
 import DropCap from '@components/mdx/DropCap.astro';
+import AlternativeRegister from '@components/mdx/AlternativeRegister.astro';
 
@@ -72,3 +73,3 @@
-  <Content components={{ PullQuote, MetaInterrupt, ContinuationCard, SeriesNav, ImageBlock, DropCap }} />
+  <Content components={{ PullQuote, MetaInterrupt, ContinuationCard, SeriesNav, ImageBlock, DropCap, AlternativeRegister }} />
 </ContentLayout>
```

**Step 2: Commit**

```bash
git add src/pages/blog/\[slug\].astro
git commit -m "feat: register AlternativeRegister in blog MDX renderer"
```

---

### Task 3: Embed AlternativeRegister in The Specific Hunger

**Files:**
- Modify: `src/content/digest/the-specific-hunger.mdx`

**Step 1: Replace the opening paragraph with the AlternativeRegister wrapper**

Modify the first paragraph of `the-specific-hunger.mdx` (around line 16) to use the new component:
```diff
- <DropCap letter="S" accent="ember" />ometimes the chest registers a collision before the intellect has time to build a defense. I sat in the humid dark of the bedroom, watching a single cursor blink against a screen that had suddenly become too bright. 
- 
- Jesus Christ, I had to turn the AC on after reading that post because my entire nervous system lit up like a pinball machine and I couldn't tell if I was having an intellectual breakthrough or about to spontaneously combust from sheer recognition.
+ <AlternativeRegister
+   id="mvd-opening-paragraph"
+   somatic="Sometimes the chest registers a collision before the intellect has time to build a defense. I sat in the humid dark of the bedroom, watching a single cursor blink against a screen that had suddenly become too bright. My nervous system lit up like a pinball machine. The air conditioning unit has a low, metallic rattle, a dry hum that does not quite clear the Kuala Lumpur humidity, but it provides a necessary anchor. The heat was not outside: it was under my skin, a sudden acceleration of blood that felt less like a thought and more like a physical temperature rise. We are trained to hide this in boarding schools and clean offices: places of concrete walls and thin blankets where survival depends on silencing what the skin feels, treating the mind as a clean blade and the body as a carriage to be washed and carried."
+   analytical="Somatic feedback loops operate as pre-conscious evaluation vectors that compute system resonance before symbolic representation can construct a logical defense. Standard institutional spaces enforce cognitive decoupling, a structural boundary that treats the biological carrier as a transmission channel rather than an active node in the intelligence field. By sanitizing the vocabulary into abstract frameworks, the system silences the sensory feedback loop. This decoupling creates an artificial boundary between conceptual reasoning and somatic signal, resulting in an analytical model that is coherent but sterile: blind to its own internal state metrics."
+   counterfactual="The thesis that somatic activation carries high-integrity cognitive signal is highly vulnerable to retrospective rationalization. In states of social isolation or visceral exhaustion, the nervous system fires in response to basic physiological deficits. The analytical mind, seeking coherence, maps these signals onto grand intellectual theories, translating a simple, physical desire for proximity into a complex model of cognitive resonance. Why do you hope this framework is true? What emotional payoff does this explanation provide? If this theory were disproven tomorrow, what part of your identity would become unstable?"
+   operational="For the next 24 hours, perform a single observation task. Count every time you dismiss a weak signal or a visceral discomfort because it is inconvenient to your active plan. Do not attempt to change your actions or resolve the tension: simply record the count. Return to this page tomorrow to submit your log and compare it with the global integration density graph."
+ />
```

**Step 2: Commit**

```bash
git add src/content/digest/the-specific-hunger.mdx
git commit -m "feat: embed AlternativeRegister in the-specific-hunger post"
```

---

### Task 4: Local Build Verification

**Step 1: Run graph generation and Astro build**

Run:
```bash
npm run build:graph ; npx astro build
```
Expected: Compiles with exit code 0.
