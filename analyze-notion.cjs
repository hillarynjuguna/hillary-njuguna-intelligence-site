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

const partBTopics = [
    { key: 'Bainbridge Warning', terms: ['bainbridge'] },
    { key: 'RSPS', terms: ['rsps', 'recursive sovereign'] },
    { key: 'PocketOS Incident', terms: ['pocketos'] },
    { key: 'Behavioral Layer Exposure', terms: ['behavioral layer exposure'] },
    { key: 'Martha Framework', terms: ['martha framework'] },
    { key: 'Tongue-Tie Diagnostic', terms: ['tongue-tie'] },
    { key: 'AURORA', terms: ['aurora'] },
    { key: 'Governance Theater', terms: ['governance theater'] },
    { key: 'R0-R3 Classification', terms: ['r0', 'r3', 'r0-r3'] },
    { key: 'Trust = Irreversibility Residue', terms: ['irreversibility residue', 'trust ='] },
    { key: 'DCFB', terms: ['dcfb', 'distributed cognition'] },
    { key: 'Phase 3 Constitutional Runtime', terms: ['constitutional runtime', 'phase 3'] },
    { key: 'CMCP', terms: ['cmcp'] }
];

console.log("=== PART A ===");
for (const topic of partATopics) {
    const matches = entries.filter(e => {
        const text = (e.title + ' ' + e.rawMarkdown).toLowerCase();
        return topic.terms.some(t => text.includes(t));
    });
    console.log(`\nTopic: ${topic.key}`);
    console.log(`Matches: ${matches.length}`);
    for (const m of matches) {
        console.log(`- IL-${m.entryNumber.toString().padStart(3, '0')} (${m.date}): ${m.title}`);
        // print a tiny snippet
        const text = (m.title + '\n' + m.rawMarkdown);
        const idx = text.toLowerCase().indexOf(topic.terms.find(t => text.toLowerCase().includes(t)));
        console.log(`  Snippet: ${text.substring(Math.max(0, idx - 50), idx + 100).replace(/\n/g, ' ')}`);
    }
}

console.log("\n=== PART B ===");
for (const topic of partBTopics) {
    const matches = entries.filter(e => {
        const text = (e.title + ' ' + e.rawMarkdown).toLowerCase();
        return topic.terms.some(t => text.includes(t));
    });
    console.log(`\nTopic: ${topic.key} - ${matches.length} matches`);
    if(matches.length > 0) {
       for (const m of matches.slice(0, 3)) { // just top 3 for brevity
          console.log(`- IL-${m.entryNumber.toString().padStart(3, '0')}: ${m.title}`);
       }
    }
}

console.log("\n=== PART C ===");
// find entries that might be fully formed concepts not turned into research pieces.
// we can look for "new lexicon term" or "concept" or long entries that don't match any of the above.
// For now, let's just list all entries that have NO matches in Part A or B.
const allTopicTerms = [...partATopics, ...partBTopics].flatMap(t => t.terms);
const unmatched = entries.filter(e => {
    const text = (e.title + ' ' + e.rawMarkdown).toLowerCase();
    return !allTopicTerms.some(t => text.includes(t));
});
console.log(`Unmatched entries: ${unmatched.length}`);
for (const m of unmatched) {
    console.log(`- IL-${m.entryNumber.toString().padStart(3, '0')}: ${m.title}`);
}
