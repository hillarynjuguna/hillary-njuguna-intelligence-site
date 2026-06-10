import * as fs from 'fs';
import * as path from 'path';

const GENERATED_DIR = path.resolve('src/data/generated');

interface CompiledThesis {
  id: string;
  title: string;
  description: string;
  claims: string[];
  evidence: string[];
  contradictions: string[];
  implementations: string[];
  strength: number;
  status: 'draft' | 'under-review' | 'compiled';
}

interface NarrativeAct {
  title: string;
  description: string;
  citations: {
    type: 'concept' | 'claim' | 'evidence' | 'question' | 'implementation';
    id: string;
  }[];
}

interface DocumentaryBrief {
  thesisId: string;
  thesisTitle: string;
  strategy: 'Paradox/Mechanism' | 'Attack/Defense' | 'Tension/Resolution';
  acts: NarrativeAct[];
}

function loadJson<T>(filename: string, defaultVal: T): T {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultVal;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
}

function saveJson<T>(filename: string, data: T): void {
  const filePath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function compileNarratives() {
  console.log('🚀 Running SKOS Narrative Engine...');

  const theses = loadJson<CompiledThesis[]>('theses.json', []);
  const questions = loadJson<any[]>('questions.json', []);
  const concepts = loadJson<any[]>('concepts.json', []);

  const briefs: DocumentaryBrief[] = [];

  for (const thesis of theses) {
    let strategy: DocumentaryBrief['strategy'] = 'Tension/Resolution';

    const textForClassification = (thesis.title + ' ' + thesis.description).toLowerCase();

    if (
      textForClassification.includes('monitoring') ||
      textForClassification.includes('detect') ||
      textForClassification.includes('bypass') ||
      textForClassification.includes('attack') ||
      textForClassification.includes('evasion') ||
      textForClassification.includes('governance')
    ) {
      strategy = 'Attack/Defense';
    } else if (
      textForClassification.includes('paradox') ||
      textForClassification.includes('reversibility') ||
      textForClassification.includes('mortal') ||
      textForClassification.includes('capture') ||
      textForClassification.includes('complacency')
    ) {
      strategy = 'Paradox/Mechanism';
    }

    const acts: NarrativeAct[] = [];

    // Map questions that might relate to the thesis
    const relatedQuestions = questions.filter(q => 
      thesis.claims.some(cId => q.id.includes(cId)) || 
      thesis.id.includes(q.id.split('-')[0])
    );

    if (strategy === 'Paradox/Mechanism') {
      acts.push({
        title: 'Act I: Paradox',
        description: 'Expose the underlying tension in the current paradigm.',
        citations: thesis.claims.slice(0, 2).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act II: Case Study',
        description: 'Ground the paradox in a concrete historical or empirical event.',
        citations: thesis.evidence.map(id => ({ type: 'evidence', id }))
      });
      acts.push({
        title: 'Act III: Mechanism',
        description: 'Deconstruct the structural logic causing the problem.',
        citations: thesis.claims.slice(2).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act IV: Solution',
        description: 'Outline the design of a counter-mechanism.',
        citations: thesis.implementations.map(id => ({ type: 'implementation', id }))
      });
      acts.push({
        title: 'Act V: Future',
        description: 'Formulate open questions for the next iteration.',
        citations: relatedQuestions.map(q => ({ type: 'question', id: q.id }))
      });
    } else if (strategy === 'Attack/Defense') {
      acts.push({
        title: 'Act I: Attack Vector',
        description: 'Identify the specific exploit or evasion technique used against the system.',
        citations: thesis.claims.slice(0, 2).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act II: Evasion',
        description: 'Show how traditional monitoring fails to observe this bypass.',
        citations: thesis.evidence.slice(0, 1).map(id => ({ type: 'evidence', id }))
      });
      acts.push({
        title: 'Act III: Detection',
        description: 'Introduce the silence-monitoring signature and out-of-band collection.',
        citations: thesis.claims.slice(2, 4).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act IV: Countermeasure',
        description: 'Deploy defensive mechanisms to mitigate the attack.',
        citations: thesis.implementations.map(id => ({ type: 'implementation', id }))
      });
      acts.push({
        title: 'Act V: Escalation',
        description: 'Map the future game-theoretic state space of this confrontation.',
        citations: relatedQuestions.map(q => ({ type: 'question', id: q.id }))
      });
    } else {
      // Tension/Resolution
      acts.push({
        title: 'Act I: Tension',
        description: 'Detail the friction between coordination goals and individual sovereignty.',
        citations: thesis.claims.slice(0, 2).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act II: Alignment',
        description: 'Investigate early alignment proposals and empirical adoption barriers.',
        citations: thesis.evidence.map(id => ({ type: 'evidence', id }))
      });
      acts.push({
        title: 'Act III: Design',
        description: 'Build the protocol mechanism that resolves the adoption paradox.',
        citations: thesis.claims.slice(2).map(id => ({ type: 'claim', id }))
      });
      acts.push({
        title: 'Act IV: Resolution',
        description: 'Demonstrate coordination stability and sovereign integrity payoffs.',
        citations: thesis.implementations.map(id => ({ type: 'implementation', id }))
      });
      acts.push({
        title: 'Act V: Scale',
        description: 'Analyze scaling properties and long-term evolutionary stability.',
        citations: relatedQuestions.map(q => ({ type: 'question', id: q.id }))
      });
    }

    briefs.push({
      thesisId: thesis.id,
      thesisTitle: thesis.title,
      strategy,
      acts
    });
  }

  saveJson('documentary-briefs.json', briefs);
  console.log(`✓ Compiled ${briefs.length} narrative briefs to documentary-briefs.json`);
}

import { fileURLToPath } from 'url';
const isMain = () => {
  try {
    const mainPath = fs.realpathSync(process.argv[1]);
    const modulePath = fs.realpathSync(fileURLToPath(import.meta.url));
    return mainPath === modulePath;
  } catch {
    return false;
  }
};

if (isMain()) {
  compileNarratives();
}
