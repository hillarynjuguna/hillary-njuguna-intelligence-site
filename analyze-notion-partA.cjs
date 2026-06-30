const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/bridge/insight-log-index.json', 'utf8'));
const entries = data.entries;

const partATopics = [
    { key: 'activation-intelligence', terms: ['activation intelligence', 'calibration'] },
    { key: 'cora', terms: ['cora', 'counter-ontological refusal'] },
    { key: 'eigenform-and-rsps', terms: ['eigenform', 'von foerster'] },
    { key: 'maternal-architecture', terms: ['maternal architecture', 'maternal'] },
    { key: 'substrate-agnostic-crystallization', terms: ['substrate-agnostic', 'crystallization'] }
];

let out = "=== PART A ===\n";
for (const topic of partATopics) {
    const matches = entries.filter(e => {
        const text = (e.title + ' ' + e.rawMarkdown).toLowerCase();
        return topic.terms.some(t => text.includes(t));
    });
    out += `\nTopic: ${topic.key}\nMatches: ${matches.length}\n`;
    for (const m of matches) {
        out += `- IL-${m.entryNumber.toString().padStart(3, '0')} (${m.date}): ${m.title}\n`;
        const text = m.rawMarkdown.replace(/\n/g, ' ');
        const idx = text.toLowerCase().indexOf(topic.terms.find(t => text.toLowerCase().includes(t)));
        out += `  Context: ${text.substring(Math.max(0, idx - 100), idx + 300)}\n`;
    }
}
fs.writeFileSync('partA_out.txt', out);
