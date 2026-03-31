import { visit } from 'unist-util-visit';
import { glossary } from '../../data/glossary.js';

export function rehypeGlossary() {
  const terms = Object.keys(glossary);
  // Create a regex to match any of the glossary terms exactly
  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'g');

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      // Don't replace text inside code blocks or headings
      if (
        parent &&
        (parent.tagName === 'code' || parent.tagName === 'pre' || /^h[1-6]$/.test(parent.tagName) || parent.tagName === 'abbr')
      ) {
        return;
      }

      if (node.value && regex.test(node.value)) {
        // Reset regex state
        regex.lastIndex = 0;
        
        const newValueNodes = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.value)) !== null) {
          const term = match[1];
          const definition = glossary[term];

          // Push the text before the match
          if (match.index > lastIndex) {
            newValueNodes.push({
              type: 'text',
              value: node.value.slice(lastIndex, match.index)
            });
          }

          // Push the acronym wrapper
          newValueNodes.push({
            type: 'element',
            tagName: 'abbr',
            properties: { title: definition, class: 'glossary-term' },
            children: [{ type: 'text', value: term }]
          });

          lastIndex = regex.lastIndex;
        }

        // Push any remaining text
        if (lastIndex < node.value.length) {
          newValueNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex)
          });
        }

        // Replace the current text node with our new mixed content
        if (parent && typeof index === 'number') {
          parent.children.splice(index, 1, ...newValueNodes);
          return index + newValueNodes.length; // Skip the newly added nodes
        }
      }
    });
  };
}
