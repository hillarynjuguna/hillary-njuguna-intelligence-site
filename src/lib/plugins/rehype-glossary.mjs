import { visit, SKIP } from 'unist-util-visit';
import { glossary } from '../../data/glossary.ts';

/**
 * rehypeGlossary -- Semantic annotation plugin for the Oscillatory Fields corpus.
 *
 * Wraps recognised glossary terms in <abbr> elements with tooltip definitions.
 * This is a rehype (HTML-tree) transform, not a remark (Markdown-tree) one,
 * so it operates on the post-render HTML AST.
 *
 * SKIP LIST (parent elements whose children are never annotated):
 *   - code    : inline code spans; annotating here breaks syntax highlighting
 *   - pre     : fenced code blocks; same rationale as code
 *   - h1-h6  : headings; annotation would clutter navigation and TOC rendering
 *   - abbr    : already-annotated terms; prevents recursive double-wrapping
 *   - a       : hyperlinks; nested interactive elements violate HTML spec
 *
 * To extend the skip list, add the tagName to the guard clause below.
 * Any element whose children should remain semantically untouched belongs here.
 */
export function rehypeGlossary() {
  const terms = Object.keys(glossary);
  if (terms.length === 0) return (tree) => tree;

  // Escape terms for safe regex use and join with boundary markers
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'g');

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      // Skip list: do not annotate text inside these parent elements.
      // See docblock above for rationale on each entry.
      if (
        !parent ||
        parent.tagName === 'code' || 
        parent.tagName === 'pre' || 
        /^h[1-6]$/.test(parent.tagName) || 
        parent.tagName === 'abbr' ||
        parent.tagName === 'a'
      ) {
        return;
      }

      if (node.value && regex.test(node.value)) {
        regex.lastIndex = 0;
        
        const newValueNodes = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.value)) !== null) {
          const term = match[1];
          const definition = glossary[term];

          if (match.index > lastIndex) {
            newValueNodes.push({
              type: 'text',
              value: node.value.slice(lastIndex, match.index)
            });
          }

          newValueNodes.push({
            type: 'element',
            tagName: 'abbr',
            properties: { 
              title: definition, 
              className: ['glossary-term'],
              'data-term': term
            },
            children: [{ type: 'text', value: term }]
          });

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < node.value.length) {
          newValueNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex)
          });
        }

        if (typeof index === 'number' && parent && Array.isArray(parent.children)) {
          parent.children.splice(index, 1, ...newValueNodes);
          // SKIP prevents the visitor from re-walking the nodes we just spliced in,
          // which avoids double-annotation when a replacement text node itself
          // contains another glossary term at a boundary position.
          return [SKIP, index + newValueNodes.length];
        }
      }
    });
  };
}
