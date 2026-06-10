import { runCorpusIntelligence } from './registry';

async function main() {
  try {
    await runCorpusIntelligence();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing Corpus Intelligence:', error);
    process.exit(1);
  }
}

main();
