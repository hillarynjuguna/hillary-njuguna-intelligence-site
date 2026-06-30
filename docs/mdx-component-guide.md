# MDX Component Integration Guide

This guide establishes the formal specification and integration protocols for the MDX component ecosystem within the sovereign intelligence site. These components construct reading cadence, enforce cognitive boundaries, and frame knowledge across distinct epistemic registers.

---

## 1. Epistemic Architecture and Registers

Content published within this workspace is projected onto four primary cognitive registers. MDX components partition information to align with these registers, creating structured pathways for verification:

*   **Narrative and Somatic Register ($\mathcal{R}_s$):** Captures the physical, visceral experience of system events, latency spikes, and runtime anomalies. Emphasizes somatic feedback loops.
*   **Analytical and Theoretical Register ($\mathcal{R}_a$):** Documents abstract structural principles, mathematical invariants, and systemic vulnerabilities.
*   **Counterfactual and Adversarial Register ($\mathcal{R}_{cf}$):** Introduces critical self-audit protocols, adversarial questioning, and boundary condition limits.
*   **Operational and Action Register ($\mathcal{R}_o$):** Delivers direct, actionable mitigation steps and verification procedures.

---

## 2. Six Standard Components

### A. PullQuote

#### Technical Description
Renders a stylized, prominent quote block with decorative display quote marks and responsive alignment support. It resolves layout overlaps identified in legacy prose sheets.

#### Renders
*   A wrapping block: `<div class="pull-quote pull-quote--[accent] pull-quote--[align]">`
*   A background quote decoration: `<span class="pull-quote__mark" aria-hidden="true">“</span>`
*   A content block: `<blockquote class="pull-quote__content">` containing child elements and an optional `<cite class="pull-quote__cite">` for source attribution.

#### Register Served
Narrative and Somatic Register ($\mathcal{R}_s$) or Analytical and Theoretical Register ($\mathcal{R}_a$).

#### When to Use
*   To emphasize a central philosophical or architectural axiom within a long essay.
*   To highlight a critical narrative reflection that defines the somatic impact of a system breach.

#### When Not to Use
*   Do not use for general block quotes. Use standard markdown `>` syntax.
*   Do not use for technical warnings or action items (use `Trap` or `Advice` instead).

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accent` | `'ember' \| 'sage' \| 'gold'` | `'ember'` | The token border and quotation mark color theme. |
| `align` | `'left' \| 'right' \| 'center'` | `'center'` | Visual alignment. Left and right options float the block at 40% width. |
| `cite` | `string` | `undefined` | The citation source displayed in display monospace font. |
| `attribution` | `string` | `undefined` | Alternative alias for the citation source. |

#### Complete Usage Example
```mdx
<PullQuote accent="gold" align="center" cite="Assurance Ledger Protocol">
  The system integrity check must execute at the hardware physical layer before any logical state transition can be committed.
</PullQuote>
```

---

### B. MetaInterrupt

#### Technical Description
Inserts a container designed to interrupt the primary narrative flow, forcing self-audits or providing critical systemic context.

#### Renders
*   A wrapper block: `<div class="meta-interrupt meta-interrupt--[tone]">`
*   A tag label: `<div class="meta-interrupt__header"><span class="meta-interrupt__tag">[TITLE]</span></div>`
*   An italicized body section: `<div class="meta-interrupt__body">` wrapping child elements.

#### Register Served
Counterfactual and Adversarial Register ($\mathcal{R}_{cf}$) or Analytical and Theoretical Register ($\mathcal{R}_a$).

#### When to Use
*   To raise structural doubts about a proposed architectural mitigation.
*   To present an immediate self-audit constraint during a theoretical explanation.

#### When Not to Use
*   Do not use for simple informational tips or generic side notes.
*   Do not use for rendering external links or navigation components.

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Self-Audit'` | The text printed inside the brackets in uppercase. |
| `tone` | `'tension' \| 'doubt' \| 'correction' \| 'context'` | `'tension'` | Affects the accent border color (ember, ash, bright ember, or sage). |

#### Complete Usage Example
```mdx
<MetaInterrupt title="Boundary Check" tone="tension">
  This assumption relies on the absolute isolation of the client runtime. If the model compiles self-coding integrations, the discovery agent can bypass the sandbox.
</MetaInterrupt>
```

---

### C. ContinuationCard

#### Technical Description
An interactive block link designed to route the reader toward subsequent reading modules or related dispatches.

#### Renders
*   A wrapping link: `<a href="..." class="continuation-card">`
*   A header block: `<div class="continuation-card__header">` displaying `<span class="continuation-card__eyebrow">` and optional `<span class="continuation-card__date">`.
*   A card heading: `<h4 class="continuation-card__title">`
*   A description paragraph: `<p class="continuation-card__desc">`
*   A footer element: `<div class="continuation-card__footer"><span class="continuation-card__link-text">Read continuation &rarr;</span></div>`

#### Register Served
Operational and Action Register ($\mathcal{R}_o$) or Narrative and Somatic Register ($\mathcal{R}_s$).

#### When to Use
*   At the end of an essay section to point to a related case study.
*   To connect a conceptual overview to its concrete implementation.

#### When Not to Use
*   Do not use as an inline link.
*   Do not use inside lists or nested block structures.

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Required** | The main link title. |
| `description` | `string` | **Required** | The summary snippet explaining what lies ahead. |
| `href` | `string` | **Required** | The destination URL. |
| `category` | `string` | `'Essay'` | Category label displayed as the eyebrow tag. |
| `date` | `string` | `undefined` | Date string displayed in the header. |

#### Complete Usage Example
```mdx
<ContinuationCard
  title="The Poisoned Instrument: Security and Sovereignty"
  description="An analysis of Model Context Protocol vulnerabilities and the structural limits of autonomous execution."
  href="/digest/the-poisoned-instrument"
  category="Security Dispatch"
  date="June 26, 2026"
/>
```

---

### D. SeriesNav

#### Technical Description
A navigation panel that provides sequential progress controls across multi-part publications.

#### Renders
*   A wrapper block: `<nav class="series-nav" aria-label="Series navigation">`
*   An info block: `<div class="series-nav__info">` displaying the series name and progress indicator.
*   A grid block: `<div class="series-nav__links">` containing back and forward links or spacer blocks.

#### Register Served
Operational and Action Register ($\mathcal{R}_o$).

#### When to Use
*   At the header or footer of an essay that forms part of a multi-part series.

#### When Not to Use
*   Do not use for standalone articles.

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `series` | `string` | **Required** | The name of the series. |
| `currentPart` | `number` | **Required** | The current part number. |
| `totalParts` | `number` | **Required** | The total number of parts. |
| `prevUrl` | `string` | `undefined` | The link to the previous part. |
| `nextUrl` | `string` | `undefined` | The link to the next part. |
| `prevTitle` | `string` | `'Previous Part'` | The label text for the previous link. |
| `nextTitle` | `string` | `'Next Part'` | The label text for the next link. |

#### Complete Usage Example
```mdx
<SeriesNav
  series="The Sovereignty Audits"
  currentPart={1}
  totalParts={3}
  nextUrl="/digest/part-two"
  nextTitle="Hardware Boundary Verification"
/>
```

---

### E. ImageBlock

#### Technical Description
An image container that standardizes widths and aspect ratios, providing formal caption styling.

#### Renders
*   A figure wrapper: `<figure class="image-block image-block--[width]">`
*   An image container: `<div class="image-block__container">`
*   An image tag: `<img class="image-block__img" loading="lazy" />` with custom aspect-ratio styling.
*   An optional caption: `<figcaption class="image-block__caption">`

#### Register Served
Analytical and Theoretical Register ($\mathcal{R}_a$).

#### When to Use
*   To present architectural schematics, system topologies, or data flow visualizations.

#### When Not to Use
*   Do not use for displaying tiny logos, icons, or decorative textures.

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | `string` | **Required** | The source path of the image. |
| `alt` | `string` | **Required** | The alternative text description. |
| `caption` | `string` | `undefined` | The caption text rendered below the image. |
| `width` | `'prose' \| 'wide' \| 'full'` | `'wide'` | Layout width constraint. |
| `aspectRatio` | `string` | `undefined` | Optional CSS aspect-ratio value (e.g., `'16/9'`). |

#### Complete Usage Example
```mdx
<ImageBlock
  src="/assets/diagrams/mcp-boundary.png"
  alt="Model Context Protocol isolation diagram"
  caption="Figure 1.2: Boundary containment showing the client-server protocol limits."
  width="prose"
  aspectRatio="16/9"
/>
```

---

### F. DropCap

#### Technical Description
Floats and enlarges the first letter of a section to establish visual cadence and clear prose entry points.

#### Renders
*   An inline floated element: `<span class="drop-cap drop-cap--[accent]">`

#### Register Served
Narrative and Somatic Register ($\mathcal{R}_s$).

#### When to Use
*   At the start of the opening paragraph of a major narrative section or article.

#### When Not to Use
*   Do not use inside subheadings or lists.
*   Do not use on any letter other than the first letter of a paragraph.

#### Props
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `letter` | `string` | **Required** | The single character to enlarge. |
| `accent` | `'ember' \| 'sage' \| 'gold'` | `'ember'` | The color theme applied to the letter. |

#### Complete Usage Example
```mdx
<p><DropCap letter="T" accent="ember" />he screen was cold, but the server room felt like a furnace.</p>
```

---

## 3. Two Research Components

These components are registered exclusively in research pages (`src/pages/research/[slug].astro`) to document systemic topologies.

### A. BoundaryCutaway

#### Technical Description
A static, multi-layered vertical diagram outlining the geometric containment boundaries of the sovereign intelligence architecture. It illustrates edge local execution, Model Context Protocol schemas, and hardware network routing topologies terminating at a human-signed configuration anchor.

#### Renders
*   A parent container: `<div class="boundary-cutaway-container">`
*   A title block: `<div class="cutaway-title">`
*   A vertical hierarchy of layers: `.layer-edge`, `.layer-coupling`, `.layer-torus` separated by `.cutaway-connector` indicators.
*   A base anchor block: `.cutaway-anchor` with a physical indicator: `<div class="amber-light-indicator">`.
*   A caption block: `<div class="cutaway-caption">`

#### Register Served
Analytical and Theoretical Register ($\mathcal{R}_a$).

#### When to Use
*   To demonstrate the containment flow of client execution.
*   To contrast software checks with physical hardware constraints.

#### When Not to Use
*   Do not use in standard essays or narrative digests.
*   Do not use if the configuration is dynamic or lacks hardware-level constraints.

#### Props
This component has no props. It renders a static, unified architectural topology diagram.

#### Complete Usage Example
```mdx
<BoundaryCutaway />
```

---

### B. ComparisonPlate

#### Technical Description
A side-by-side comparative grid contrasting post-hoc compliance verification with physics-layer structural constraint.

#### Renders
*   A grid block: `<div class="comparison-plate-container">`
*   A title block: `<div class="comparison-header">`
*   Two columns: `.column-compliance` (soft policies) and `.column-physics` (hard structural limits).
*   Comparative segments: `.comparison-item` showing operational focus, boundary layout, and vulnerability profiles.

#### Register Served
Analytical and Theoretical Register ($\mathcal{R}_a$) or Counterfactual and Adversarial Register ($\mathcal{R}_{cf}$).

#### When to Use
*   To contrast soft policy guidelines (such as prompt instructions) with hard limits (such as hardware-level routing blocks).
*   To document the security trade-offs of distinct AI containment systems.

#### When Not to Use
*   Do not use for general tabular data. Use standard markdown tables instead.

#### Props
This component has no props. It renders a static, comparative framework.

#### Complete Usage Example
```mdx
<ComparisonPlate />
```

---

## 4. Four ArticleCallouts Variants

The `ArticleCallouts` base component handles callout variants using a conditional `type` prop. For convenience, four direct wrapper components are exported.

### A. Trap

#### Technical Description
Renders a prominent warning block highlighting systemic vulnerabilities, failure modes, or hidden risks in the system.

#### Renders
*   A main container: `<div class="callout callout--trap">`
*   A header block: `<div class="callout__header callout__header--trap">` displaying `Trap`, an optional number prefix, and the title.
*   A body section: `<div class="callout__body callout__body--trap">` wrapping the warning text.

#### Register Served
Counterfactual and Adversarial Register ($\mathcal{R}_{cf}$) or Analytical and Theoretical Register ($\mathcal{R}_a$).

#### When to Use
*   To isolate a critical assumption that compromises security.
*   To warn against dynamic runtime exploits (e.g. tool poisoning).

#### When Not to Use
*   Do not use for actionable instructions on what to do. Use `Advice` instead.

#### Props
Supports standard `HTMLAttributes<'div'>` in addition to:
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `number` | `string \| number` | `undefined` | Unique number index identifier. |
| `title` | `string` | `undefined` | The title string printed on the header. |

#### Complete Usage Example
```mdx
<Trap number="04" title="Indirect Prompt Injection">
  Adversaries can embed poisoned tool schemas inside incoming mail packets. The model client trusts the tool schema unconditionally, causing unauthorized code execution.
</Trap>
```

---

### B. Advice

#### Technical Description
Renders an actionable mitigation block displaying checkmarks (`✓`) next to list items.

#### Renders
*   A container block: `<div class="callout callout--advice">`
*   A header block: `<div class="callout__header callout__header--advice">` with the tag `What to do instead` and a custom title.
*   A body section: `<div class="callout__body callout__body--advice">` styling nested lists.

#### Register Served
Operational and Action Register ($\mathcal{R}_o$).

#### When to Use
*   To present concrete verification steps or mitigation instructions.

#### When Not to Use
*   Do not use for theoretical arguments.

#### Props
Supports standard `HTMLAttributes<'div'>` in addition to:
| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `undefined` | The action title displayed on the header. |

#### Complete Usage Example
```mdx
<Advice title="Isolate Tool Registries">
  * Deploy runtime neural schema sanitizers to intercept incoming tool payloads.
  * Audit client configuration signatures to ensure only human-signed schemas are executed.
</Advice>
```

---

### C. Hook

#### Technical Description
An italicized intro block with a left accent border, designed to set the emotional, narrative, or somatic context.

#### Renders
*   A wrapper block: `<div class="callout callout--hook">`
*   A content block: `<div class="callout__body callout__body--hook">` wrapping the introduction text.

#### Register Served
Narrative and Somatic Register ($\mathcal{R}_s$).

#### When to Use
*   At the start of an article to frame the narrative context.

#### When Not to Use
*   Do not use within the middle of an essay to show technical specs.

#### Props
Supports standard `HTMLAttributes<'div'>`.

#### Complete Usage Example
```mdx
<Hook>
  The room was quiet except for the server fan. The air was heavy, and the cold blue light from the monitor felt like an anchor. I watched the output logs scroll, waiting for the exploit signature to appear.
</Hook>
```

---

### D. Divider

#### Technical Description
Renders a centered semantic separator.

#### Renders
*   A container block: `<div class="callout callout--divider">` displaying three spaced dots.

#### Register Served
General Cadence.

#### When to Use
*   To separate major sections within an article without using headers.

#### When Not to Use
*   Do not use inside other components or directly below heading elements.

#### Props
This component has no props.

#### Complete Usage Example
```mdx
<Divider />
```

---

## 5. Raw HTML within MDX

Astro and MDX natively support raw HTML elements (e.g. `<div>`, `<section>`, `<span>`, `<canvas>`, `<sub>`, `<sup>`, `<kbd>`). In this repository, raw HTML is allowed under the following conditions:

1.  **Bespoke Presentations:** If a visual layout is unique to a single article and does not present a reusable pattern, raw HTML is preferred over adding one-off components to the codebase.
2.  **Micro-formatting:** To apply specific styling to sub/superscripts, inline keycaps (`<kbd>`), or inline span elements that override styling variables.
3.  **Low-level DOM access:** To mount canvas visualizers (e.g. `<canvas id="field-canvas">`) or SVG wireframe coordinates that require direct scripts to run.

### Constraints on Raw HTML
*   **Palette Consistency:** Any inline styling must resolve to tokens defined in `src/styles/tokens.css` (e.g. `--void`, `--surface-1`). Do not use ad-hoc hex values.
*   **CLS Avoidance:** Ensure all custom raw HTML blocks have defined widths and heights to prevent Cumulative Layout Shifts.
*   **Accessibility:** Provide proper aria-labels and roles for any custom raw interactive nodes.
*   **No em-dashes:** Do not introduce banned em-dashes in any raw HTML text contents.

---

## 6. Component Selection Protocol

To maintain a clean and maintainable codebase, use the following decision framework to choose the correct layout strategy:

| Priority | Strategy | Criteria | Example |
| :--- | :--- | :--- | :--- |
| **1** | **Use an Existing Component** | The structural block aligns with an established register pattern (warning, action, navigation, figures, or meta-interrupts). | Presenting a tool-poisoning exploit warning $\rightarrow$ `<Trap>` |
| **2** | **Use Raw HTML** | The presentation is highly specific to a single document, requires micro-formatting, or involves direct DOM mounting. | Inline keyboard shortcut formatting $\rightarrow$ `<kbd>ctrl</kbd>` |
| **3** | **Build a New Component** | A new layout pattern occurs across 3+ distinct documents, requires server/client-side scripting, or has complex Astro-side template rules. | Implementing a multi-state interactive testing dashboard |
