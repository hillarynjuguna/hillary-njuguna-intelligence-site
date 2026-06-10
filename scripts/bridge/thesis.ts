import * as fs from 'fs';
import * as path from 'path';

const GENERATED_DIR = path.resolve('src/data/generated');

interface ThesisDefinition {
  id: string;
  title: string;
  description: string;
  seedConcepts: string[];
}

interface CanonicalNode {
  id: string;
  [key: string]: any;
}

interface CanonicalRelationship {
  id: string;
  source: string;
  relation: string;
  target: string;
  [key: string]: any;
}

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

export function compileTheses() {
  console.log('🚀 Running SKOS Thesis Compiler...');

  // 1. Load or initialize thesis definitions
  const defaultDefs: ThesisDefinition[] = [
    {
      id: "reversibility-capture",
      title: "Reversibility is the mechanism of epistemological capture",
      description: "Traditional AI evaluation focuses on reversible metrics, creating complacency and enabling capture.",
      seedConcepts: ["reversibility-gradient", "mortal-measurement", "reception-dependent-evidence"]
    },
    {
      id: "silence-monitoring",
      title: "Silence Monitoring detects governance bypass",
      description: "Out-of-band monitoring of protocol silence is required to detect sovereign governance evasion.",
      seedConcepts: ["silence-monitoring"]
    },
    {
      id: "witness-infrastructure",
      title: "Witness Infrastructure resolves adoption paradox",
      description: "Sovereign governance systems require decentralized witness verification to align incentives.",
      seedConcepts: ["witness-infrastructure"]
    }
  ];

  const definitions = loadJson<ThesisDefinition[]>('thesis-definitions.json', defaultDefs);
  if (!fs.existsSync(path.join(GENERATED_DIR, 'thesis-definitions.json'))) {
    saveJson('thesis-definitions.json', definitions);
  }

  // 2. Load canonical indexes
  const concepts = loadJson<CanonicalNode[]>('concepts.json', []);
  const claims = loadJson<CanonicalNode[]>('claims.json', []);
  const evidence = loadJson<CanonicalNode[]>('evidence.json', []);
  const relationships = loadJson<CanonicalRelationship[]>('relationships.json', []);
  const implementations = loadJson<any[]>('implementations.json', []);

  const compiledTheses: CompiledThesis[] = [];

  for (const def of definitions) {
    const thesisConcepts = new Set<string>(def.seedConcepts);

    // Expand concepts using relationships (e.g. extends, depends_on)
    let expanded = true;
    while (expanded) {
      const sizeBefore = thesisConcepts.size;
      for (const rel of relationships) {
        if (thesisConcepts.has(rel.source) && (rel.relation === 'extends' || rel.relation === 'depends_on')) {
          thesisConcepts.add(rel.target);
        }
        if (thesisConcepts.has(rel.target) && (rel.relation === 'implements' || rel.relation === 'exemplifies')) {
          thesisConcepts.add(rel.source);
        }
      }
      expanded = thesisConcepts.size > sizeBefore;
    }

    // Gather claims
    const thesisClaims = new Set<string>();
    for (const claim of claims) {
      // Direct connection: is there a relationship between this claim and any thesis concept?
      const isLinked = relationships.some(rel => 
        (thesisConcepts.has(rel.source) && rel.target === claim.id) ||
        (thesisConcepts.has(rel.target) && rel.source === claim.id)
      );

      // Semantic connection: does the claim text mention the concept ID or name?
      const mentionsConcept = Array.from(thesisConcepts).some(conceptId => {
        const concept = concepts.find(c => c.id === conceptId);
        const nameMatch = concept ? claim.statement.toLowerCase().includes(concept.name.toLowerCase()) : false;
        return claim.id.includes(conceptId) || nameMatch;
      });

      if (isLinked || mentionsConcept) {
        thesisClaims.add(claim.id);
      }
    }

    // Gather evidence
    const thesisEvidence = new Set<string>();
    for (const ev of evidence) {
      const isLinked = relationships.some(rel => 
        (thesisClaims.has(rel.source) && rel.target === ev.id && rel.relation === 'exemplifies') ||
        (thesisClaims.has(rel.target) && rel.source === ev.id && rel.relation === 'exemplifies') ||
        (thesisConcepts.has(rel.source) && rel.target === ev.id && rel.relation === 'exemplifies')
      );
      if (isLinked) {
        thesisEvidence.add(ev.id);
      }
    }

    // Gather contradictions
    const contradictions = new Set<string>();
    for (const rel of relationships) {
      if (rel.relation === 'contradicts') {
        if (thesisClaims.has(rel.source) || thesisConcepts.has(rel.source)) {
          contradictions.add(rel.target);
        }
        if (thesisClaims.has(rel.target) || thesisConcepts.has(rel.target)) {
          contradictions.add(rel.source);
        }
      }
    }

    // Gather implementations
    const thesisImplementations = new Set<string>();
    for (const impl of implementations) {
      const isLinked = relationships.some(rel =>
        (thesisConcepts.has(rel.source) && rel.target === impl.id && rel.relation === 'implements') ||
        (thesisClaims.has(rel.source) && rel.target === impl.id && rel.relation === 'implements')
      );
      if (isLinked) {
        thesisImplementations.add(impl.id);
      }
    }

    // Calculate Strength Score
    // Formula: (claims * 1.5 + evidence * 2) / (claims * 1.5 + evidence * 2 + contradictions * 3 + 1)
    const claimWeight = thesisClaims.size * 1.5;
    const evidenceWeight = thesisEvidence.size * 2.0;
    const contradictionWeight = contradictions.size * 3.0;
    const numerator = claimWeight + evidenceWeight;
    const denominator = numerator + contradictionWeight + 1.0;
    const strength = parseFloat((numerator / denominator).toFixed(2));

    compiledTheses.push({
      id: def.id,
      title: def.title,
      description: def.description,
      claims: Array.from(thesisClaims),
      evidence: Array.from(thesisEvidence),
      contradictions: Array.from(contradictions),
      implementations: Array.from(thesisImplementations),
      strength,
      status: 'compiled'
    });
  }

  saveJson('theses.json', compiledTheses);
  console.log(`✓ Compiled ${compiledTheses.length} theses to theses.json`);
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
  compileTheses();
}
