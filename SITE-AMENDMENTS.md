# Site Amendment Guide — hillary-site.vercel.app
*Constitutional Infrastructure Documentation · Last updated March 2026*

> This document is the governance layer for the site itself. Every amendment has a classification, a location, and a verification step. Read the classification before executing.

---

## Reversibility Classification

| Class | Meaning | Examples |
|-------|---------|---------|
| **R0** | Fully reversible, no consequence | Reading files, previewing changes locally |
| **R1** | Reversible within 24hrs | Text edits, copy changes, link updates |
| **R2** | Reversible with effort | Structural HTML changes, new sections |
| **R3** | Irreversible or high-consequence | Deleting sections, changing the AI system prompt's core framing, modifying auth/security headers |

**Constitutional principle**: Verify locally before pushing to `main`. Every push triggers a live deploy.

---

## Working Environment

### Access the site
**GitHub repo**: github.com/Hnju0001/Website  
**Live site**: https://hillary-site.vercel.app  
**Netlify dashboard**: app.netlify.com → njugunahillary  
**Codespace**: github.com/Hnju0001/Website → Code → Codespaces → Open

### File map
```
Website/
└── hillary-site/
    ├── public/
    │   └── index.html          ← The entire site. All HTML, CSS, JS in one file.
    ├── netlify/
    │   └── functions/
    │       ├── chat.js          ← AI research assistant (system prompt lives here)
    │       └── synthesize.js    ← Intelligence synthesis engine
    ├── netlify.toml             ← Security headers, redirects, build config
    ├── .env.example             ← Documents required environment variables
    └── README.md                ← Technical deployment guide
```

### The deploy workflow
```bash
# 1. Open Codespace terminal
# 2. Make your changes to the files
# 3. Stage, commit, push:
git add .
git commit -m "fix: description of what you changed"
git push origin main
# 4. Netlify auto-deploys. Live in ~60 seconds.
# 5. Verify at https://hillary-site.vercel.app
```

---

## Amendment Procedures

---

### A. Update the AI assistant's knowledge (R3 — high consequence)

**File**: `hillary-site/netlify/functions/chat.js`  
**Location**: Lines 4–50, the `SYS_CHAT` constant

The system prompt is the AI's understanding of who you are. Changes here affect every chat conversation on the live site immediately after deploy.

**When to update**:
- New products launch (add to the products section of the prompt)
- ClearBid goes live (change the note from "in development" to active pricing/CTA)
- New research is published (add to intellectual contributions)
- New constitutional clauses are derived (add to the clauses section)
- AcheType publishes new Field Notes worth grounding the assistant in

**How to update**:
```bash
# In Codespace terminal:
code hillary-site/netlify/functions/chat.js
# Edit the SYS_CHAT constant
# Save, then:
git add hillary-site/netlify/functions/chat.js
git commit -m "feat: update AI assistant — [what changed]"
git push origin main
```

**Verification**: Open the chat widget on the live site, ask a question about the thing you changed, confirm the assistant reflects the update.

**Constitutional guard**: The assistant must never enumerate paid product frameworks, classification systems, matrices, or diagnostic tools in detail (Clause 003). When adding paid products, include a `whatItIsNot` note in the prompt — what the AI must redirect rather than reproduce.

---

### B. Update the Intelligence Digest cards (R1)

**File**: `hillary-site/public/index.html`  
**Location**: Search for `<!-- DIGEST CARDS -->` (~line 1100)

Each digest card follows this pattern:
```html
<div class="dcard r">
  <div class="dcard-meta">
    <span class="dcard-date">Feb 27, 2026</span>
    <div class="dcard-tags">
      <span class="dcard-tag">Adoption</span>
      <span class="dcard-tag">Biology</span>
    </div>
  </div>
  <div class="dcard-title">The title of the digest entry</div>
  <div class="dcard-body">
    <p><strong>Lead signal:</strong> First paragraph summary...</p>
    <p>Second paragraph with deeper analysis...</p>
  </div>
  <button class="dcard-expand" onclick="toggleExpand(this)" aria-expanded="false">Read full synthesis ↓</button>
  <div class="dcard-full" style="display:none">
    <p>Full synthesis content here...</p>
    <em>Field implication: One sentence the reader should sit with.</em>
  </div>
</div>
```

**To add a new digest entry**: Duplicate an existing `dcard` block and replace all text content. Add above the existing cards (newest first).

**Note**: The Astro migration (v4 scaffold — see separate zip) will replace this manual process with Markdown files. Until then, edit HTML directly.

---

### C. Update product status (R1)

**File**: `hillary-site/public/index.html`  
**Location**: Search for `<!-- PRODUCTS SECTION -->` (~line 1030)

**ClearBid — when ready to launch**:

Find this block and make these four changes:
```html
<!-- Change 1: Badge -->
<span class="product-badge dev-badge">In Development</span>
→ <span class="product-badge live-badge">Live</span>

<!-- Change 2: Description -->
"Architecture proven — service launching soon."
→ "Send a JDM listing. Within 1 hour, receive a DealPacket: GO/NO-GO verdict, identity gate analysis, economic gate breakdown, condition assessment. First one free."

<!-- Change 3: Price -->
<span class="product-price">Coming Soon</span>
→ <span class="product-price">$50 <small>/ packet</small></span>

<!-- Change 4: CTA -->
<a href="#contact" class="btn-product">Join waitlist →</a>
→ <a href="#contact" class="btn-product">Send a listing →</a>
```

Also update: the ideas mini-card (~line 960), the chat.js system prompt (ClearBid section), and the AI assistant's product knowledge.

**Martha Cohort — when Q2 2026 launches**:
Change badge from `Q2 2026` to `Live`, update price from `TBA` to actual price, update CTA from `Register interest →` to `Join cohort →` with Gumroad/Stripe link.

---

### D. Update Oscillatory Fields / AcheType links (R1)

**File**: `hillary-site/public/index.html`

**Current AcheType link** (~line 1226):
```html
<a href="https://substack.com/@achetype1" target="_blank" class="pub-link">AcheType Field Notes ↗</a>
```
If AcheType moves to a custom domain, update this URL.

**Adding new Issue card** (when Issue 02 publishes):
Find the `pub-card` div (~line 1234) and duplicate it with the new issue content above the existing one.

**Adding Field Notes to the pub section**:
When new AcheType Field Notes warrant surfacing on the main site, add their titles to the Oscillatory Fields description paragraph. The Ghost Lineages Thread and Digital Enslavement Thread are already referenced — add new ones with the same pattern.

---

### E. Update the structured data / SEO metadata (R1)

**File**: `hillary-site/public/index.html`  
**Location**: Lines 7–50, inside `<head>`

**When the site moves to a custom domain**:
Search and replace all instances of `hillary-site.vercel.app` with the new domain. Affects:
- `<link rel="canonical">`
- `<meta property="og:url">`
- `<meta property="og:image">`
- `<meta name="twitter:image">`
- `"url"` in the JSON-LD structured data block

**To add to `sameAs` in structured data** (when new platforms go live):
```json
"sameAs": [
  "https://researchgate.net",
  "https://substack.com/@achetype1",
  "https://linkedin.com/in/hillary-thegeiya-njuguna"
]
```

---

### F. Add LinkedIn to contact section (R1)

**File**: `hillary-site/public/index.html`  
**Location**: Search for `CURRENTLY AVAILABLE FOR` (~line 1310)

Add this link alongside the availability list or below the contact form:
```html
<a href="https://linkedin.com/in/hillary-thegeiya-njuguna" 
   target="_blank" 
   style="font-family:'DM Mono',monospace;font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--ember);text-decoration:none;">
  LinkedIn ↗
</a>
```

---

### G. Rotate the Mistral API key (R2)

**When**: Immediately if the key is ever visible in public (GitHub, screenshots, conversations). Regularly as security hygiene.

**Steps**:
1. Go to console.mistral.ai → API Keys → Create new key
2. Copy the new key
3. Netlify dashboard → njugunahillary → Site configuration → Environment variables
4. Find `MISTRAL_API_KEY` → Edit → Paste new key → Save
5. Netlify dashboard → Deploys → Trigger deploy (environment variable changes require a redeploy)
6. Revoke the old key in the Mistral console
7. Verify: visit `https://hillary-site.vercel.app/.netlify/functions/chat` → should return `{"error":"Method not allowed"}`

**The old key** (`Zdnta9YFl8AljDq5qti1c07NZU9isqaS`) was exposed in previous conversations. Revoke it if not already done.

---

### H. Add the OpenRouter API key (R2 — enables full orchestra)

**What this unlocks**: The chat function routes queries to the most appropriate model — Perplexity for real-time questions, DeepSeek for technical audits, Grok for counter-arguments, Mistral as default. One key, one bill, ~50 models.

**Steps**:
1. Go to openrouter.ai → Sign up → API Keys → Create key
2. Netlify dashboard → Environment variables → Add variable:
   - Key: `OPENROUTER_API_KEY`
   - Value: your key
3. Trigger deploy
4. The `chat.js` function auto-detects OpenRouter when the key is present and overrides Mistral

**Cost note**: OpenRouter charges per token per model. Mistral Small (~$0.20/M tokens) remains the default for general queries. Perplexity and Grok cost more — the routing logic only sends queries there when the classification genuinely warrants it.

---

### I. When the GitHub repo is lost / needs rebuilding (R2)

You mentioned losing access to a previous GitHub account. If this happens again:

1. Download the site files from Netlify: dashboard → Deploys → latest deploy → Deploy file browser → Download each file
2. The Netlify function files can be re-downloaded from the Functions tab
3. Create new GitHub repo, push files in the correct structure (see File Map above)
4. Reconnect Netlify to the new repo: Site configuration → Build & deploy → Link to Git provider

**Prevention**: Keep the v3 zip (`hillary-site-v3.zip`) and v4 Astro zip (`hillary-site-v4-astro.zip`) backed up to Google Drive. They contain the full source with correct directory structure.

---

## Verification Checklist — after any deploy

```
□ Site loads: https://hillary-site.vercel.app
□ AI functions live: https://hillary-site.vercel.app/.netlify/functions/chat
  → Should return: {"error":"Method not allowed"}
□ Chat widget responds in browser (opens, sends message, receives reply)
□ No "$50" or "Send a listing" visible for ClearBid
□ AcheType Field Notes link in Oscillatory Fields section is clickable
□ Footer shows: Hillary Njuguna · hillary-site.vercel.app
□ Contact form submits (fills form, clicks Send, sees success message)
```

---

## Known Issues & Pending Work

| Issue | Priority | Status |
|-------|----------|--------|
| Hero gap on mobile (dead space above text) | Medium | Open — needs `@media` CSS fix |
| LinkedIn not linked in contact section | Medium | Open — URL confirmed, needs adding |
| Substack Issue 2 notification — no mechanism | Low | Open — contact form handles it for now |
| Custom domain not yet set | Low | Open — update canonical URLs when ready |
| Medium posts not published | Low | Open — Medium button removed, add back when live |
| ClearBid launch | Pending | In development — 4 changes needed on launch day (see Section C) |
| Astro migration (v4 scaffold) | Future | Built, not deployed — enables Markdown digest workflow, paid tier |

---

## The Paid Tier — When Ready (Q2 2026)

The v4 Astro scaffold already has the middleware auth layer built. The upgrade path:

1. Set up Lemon Squeezy (or Stripe) product for Intelligence Stack membership
2. Add webhook handler in `netlify/functions/` — fires on purchase, creates session
3. Add `LEMON_SQUEEZY_WEBHOOK_SECRET` and `LEMON_SQUEEZY_API_KEY` to Netlify env vars
4. Add Neon database (one click from Netlify dashboard → Add database)
5. Protected content routes (`/member/*`) unlock for paying subscribers
6. AI assistant detects member sessions → unlocked system prompt with full corpus

Full architecture is documented in `hillary-site-v4-astro/README.md`.

---

*This document governs itself: R3 changes to the site's security architecture require this guide to be updated before or immediately after the change is made.*
