import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import glob from 'fast-glob';
import type { DocumentRecord, ChunkRecord } from './types';

// Approximate token estimator (heuristics: ~1.3 tokens per word)
function estimateTokens(text: string): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount * 1.3);
}

// Compute sha256 checksum of file contents
function getChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Normalize paths to forward slashes for cross-platform stability
function normalizePath(p: string): string {
  return p.replace(/\\/g, '/');
}

// Header-Bound Semantic Chunking
export function chunkMarkdown(content: string, documentId: string): Omit<ChunkRecord, 'chunkId'>[] {
  const lines = content.split(/\r?\n/);
  const chunks: Omit<ChunkRecord, 'chunkId'>[] = [];
  
  let currentHeaders: string[] = [];
  let currentChunkLines: string[] = [];
  
  for (const line of lines) {
    // Detect header lines (up to level 3)
    const headerMatch = line.match(/^(#{1,3})\s+(.*)$/);
    // Also detect entry headings like "⚡ Entry 051" or "Entry 051"
    const entryMatch = line.match(/^⚡?\s*(Entry\s+\d+.*)$/);
    
    if (headerMatch || entryMatch) {
      // If we have accumulated text for the previous section, save it as a chunk
      if (currentChunkLines.length > 0) {
        const text = currentChunkLines.join('\n').trim();
        if (text) {
          chunks.push({
            documentId,
            headers: [...currentHeaders],
            tokenEstimate: estimateTokens(text),
            text,
            checksum: getChecksum(text),
          });
        }
        currentChunkLines = [];
      }
      
      if (headerMatch) {
        const level = headerMatch[1].length; // 1, 2, or 3
        const title = headerMatch[2].trim();
        // Adjust headers array to represent current nesting depth
        currentHeaders = currentHeaders.slice(0, level - 1);
        currentHeaders.push(title);
      } else if (entryMatch) {
        currentHeaders = [entryMatch[1].trim()];
      }
    } else {
      currentChunkLines.push(line);
    }
  }
  
  // Save the trailing chunk
  if (currentChunkLines.length > 0) {
    const text = currentChunkLines.join('\n').trim();
    if (text) {
      chunks.push({
        documentId,
        headers: [...currentHeaders],
        tokenEstimate: estimateTokens(text),
        text,
        checksum: getChecksum(text),
      });
    }
  }
  
  return chunks;
}

// Main processing function for Phase 0
export async function runCorpusIntelligence() {
  console.log('[Phase 0] Starting Corpus Intelligence...');
  
  // Define source directories and patterns relative to project root
  const sourceConfigs = [
    { name: 'Corpus', pattern: '../../Corpus/**/*.md', base: '../../Corpus' },
    { name: 'Syntheses', pattern: '../../Syntheses/**/*.md', base: '../../Syntheses' },
    { name: 'Content', pattern: 'src/content/**/*.md', base: 'src/content' },
    { name: 'ContentMDX', pattern: 'src/content/**/*.mdx', base: 'src/content' },
  ];
  
  const documents: DocumentRecord[] = [];
  const chunks: ChunkRecord[] = [];
  
  for (const config of sourceConfigs) {
    const files = await glob(config.pattern, { onlyFiles: true });
    console.log(`  Scanning ${config.name} (${files.length} files found)...`);
    
    for (const file of files) {
      const fullPath = path.resolve(file);
      const relativePath = normalizePath(path.relative(path.resolve('.'), fullPath));
      const documentId = normalizePath(path.relative(path.resolve(config.base), fullPath))
        .replace(/\.[^/.]+$/, ''); // Remove extension
      
      const stats = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const checksum = getChecksum(content);
      
      // Perform header-bound chunking
      const rawChunks = chunkMarkdown(content, documentId);
      const chunkIds: string[] = [];
      
      for (let i = 0; i < rawChunks.length; i++) {
        const chunkId = `${documentId}-chunk-${i + 1}`;
        chunkIds.push(chunkId);
        chunks.push({
          chunkId,
          ...rawChunks[i],
        });
      }
      
      const totalTokens = rawChunks.reduce((acc, c) => acc + c.tokenEstimate, 0);
      
      documents.push({
        documentId,
        path: relativePath,
        corpus: config.name,
        title: path.basename(file, path.extname(file)),
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        checksum,
        chunkIds,
        tokenEstimate: totalTokens,
      });
    }
  }
  
  // Write outputs
  const outputDir = path.resolve('src/data/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const docsPath = path.join(outputDir, 'documents.json');
  const chunksPath = path.join(outputDir, 'chunks.json');
  
  fs.writeFileSync(docsPath, JSON.stringify(documents, null, 2), 'utf-8');
  fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2), 'utf-8');
  
  console.log(`[Phase 0] Complete!`);
  console.log(`  Compiled ${documents.length} documents into ${docsPath}`);
  console.log(`  Compiled ${chunks.length} chunks into ${chunksPath}`);
  
  const totalTokens = documents.reduce((acc, d) => acc + d.tokenEstimate, 0);
  console.log(`  Estimated total tokens: ${totalTokens}`);
}
