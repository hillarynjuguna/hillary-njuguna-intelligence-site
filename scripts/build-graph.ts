#!/usr/bin/env tsx
/**
 * Build the content graph and emit all JSON artifacts to src/data/generated/.
 * Run: npm run build:graph
 */
import { buildAndWriteArtifacts } from '../src/lib/graph/buildGraph';

buildAndWriteArtifacts();
