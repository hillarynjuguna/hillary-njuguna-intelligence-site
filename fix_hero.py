"""
fix_hero.py
Surgical fix for index.astro hero block.
Run from: C:\\Users\\jacef\\Desktop\\hillary-site-session
"""

path = r"src\pages\index.astro"

with open(path, encoding="utf-8") as f:
    src = f.read()

# ── Change 1: Inject emblem, fix headline, fix sub reveal ─────────────────────

OLD = (
    '      <div class="hero__inner">\n'
    '        <h1 class="hero__headline" data-reveal="fade">\n'
    '          Durable infrastructure<br />\n'
    '          for consequential intelligence.\n'
    '        </h1>\n'
    '\n'
    '        <p class="hero__sub" data-reveal data-reveal-delay="1">'
)

NEW = (
    '      <div class="hero__inner">\n'
    '        <div class="hero__emblem-wrap" data-reveal="fade">\n'
    '          <LogoEmblem size={160} className="hero__emblem" />\n'
    '        </div>\n'
    '\n'
    '        <h1 class="hero__headline" data-reveal="sweep">\n'
    "          Fear isn\u2019t a feeling \u2014<br />\n"
    "          it\u2019s an architecture.\n"
    '        </h1>\n'
    '\n'
    '        <p class="hero__sub" data-reveal="fade" data-reveal-delay="1">'
)

if OLD in src:
    src = src.replace(OLD, NEW, 1)
    print("✓ Hero block replaced")
else:
    print("✗ Hero block NOT found — printing first 80 chars of hero__inner context:")
    idx = src.find('hero__inner')
    print(repr(src[idx:idx+400]))

# ── Change 2: CSS — emblem wrap spacing ───────────────────────────────────────

CSS_OLD = "  .hero { min-height:90vh;"
CSS_NEW = (
    "  .hero__emblem-wrap { margin-bottom: var(--space-8); }\n"
    "  .hero__emblem { display: block; }\n"
    "  .hero { min-height:90vh;"
)

if CSS_OLD in src:
    src = src.replace(CSS_OLD, CSS_NEW, 1)
    print("✓ CSS emblem rules added")
elif ".hero__emblem-wrap" in src:
    print("✓ CSS emblem rules already present — skipping")
else:
    print("✗ CSS anchor not found")

# ── Write ─────────────────────────────────────────────────────────────────────

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("\nDone. Run: npx astro build")
