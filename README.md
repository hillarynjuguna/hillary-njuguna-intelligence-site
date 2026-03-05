# Hillary Njuguna — Intelligence Architecture Site

> "The hostel and the borrowed Chromebook are not the story. They are the opening line."

## Stack

- **Frontend**: Single-file HTML/CSS/JS in `public/index.html`  
- **AI Layer**: OpenRouter API (OpenAI-compatible, 200+ models), proxied through Vercel serverless functions  
- **Forms**: Formspree (`maqdrora` endpoint)  
- **Hosting**: Vercel (free tier — automatic deploys from git)  
- **Database**: Not yet — static first, Neon Postgres when dynamic digest is needed

## Project Structure

```
Hillary-Site/
├── public/
│   └── index.html          # Full site
├── api/
│   ├── chat.js             # Research assistant AI proxy (Vercel function)
│   └── synthesize.js       # Digest synthesis AI proxy + clause extraction (Vercel function)
├── vercel.json             # Build config, CSP headers, redirects
├── .env.example            # Required environment variables (template)
├── .gitignore              # Never commit .env
└── README.md               # This file
```

## Deployment

### Step 1: Set environment variable in Vercel

1. Vercel dashboard → Select project → Settings → Environment Variables
2. Add: `OPENROUTER_API_KEY` = your key from [openrouter.ai](https://openrouter.ai)
3. **Do not** put the key in any file that gets committed

### Step 2: Deploy

**Option A — Git (recommended for ongoing updates):**
```bash
git init
git add .
git commit -m "initial: constitutional architecture site"
# In Vercel dashboard, import this repo
```

**Option B — Vercel CLI:**
```bash
npm i -g vercel
vercel
# Follow prompts, connect your repo
```

### Step 3: Verify functions are live

After deploy, test:
- `https://yoursite.vercel.app/api/chat` should return `{"error":"Method not allowed"}` on GET
- `https://yoursite.vercel.app/api/synthesize` should return same

If you see those responses, the functions are running. The API key is safely server-side.

## Updating Content

### To add a new digest card:
Find `<!-- DIGEST CARDS -->` in `public/index.html` and duplicate a `.dcard` block.

### To update Gumroad link:
Search for `hillarynjuguna.gumroad.com` — currently correct.

### To update Formspree endpoint:
Search for `formspree.io/f/maqdrora` — currently correct.

### To update Substack/Medium links:
Search for `pub-links` section in the publication section.

## Constitutional Layer

The synthesis function (`netlify/functions/synthesize.js`) generates a `clauseCandidate` with each run — a governance principle derived from the structural pattern of the synthesised content. These are displayed in the "Constitutional Layer — Clause Candidate" card in the UI.

This is Qwen's observation made operational: each synthesis run contributes a micro-clause that feeds back into the constitutional architecture. The governance layer learns from its own usage.

## When to Add the Database (Neon)

Currently not needed. Add when:
- [ ] Digest entries need to be managed without editing HTML
- [ ] Clause candidates from synthesis runs need to be stored and surfaced
- [ ] Subscriber list for Oscillatory Fields Issue 2 is needed
- [ ] Contact form submissions need to be queryable (beyond Formspree emails)

At that point: add a `netlify/functions/db.js` layer using `@netlify/neon`. Keep the frontend calls identical — just the function implementations change.

## Security Notes

- API key: never in client-side code. Always in environment variables.
- CSP headers: configured in `netlify.toml`. Review `connect-src` if adding new external services.
- Rate limiting: basic (no shared state). Upgrade to Upstash Redis if abuse becomes a concern.
- Form: Formspree handles spam filtering on free tier.

---

*Cognitive Infrastructure Readiness v2.0 applies to this system:*  
*R0 operations: reading digest cards, navigating sections*  
*R1 operations: submitting contact form (reversible — Formspree stores submissions)*  
*R2 operations: running synthesis (consumes API credits — bounded cost)*  
*R3 operations: publishing to production (irreversible until next deploy)*
