import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import path from 'path';

const BASE_DIR = "G:\\My Drive\\RSPS Knowledge Spine";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const targetPath = url.searchParams.get('path');

  if (!targetPath) {
    return new Response(JSON.stringify({ error: "No path provided" }), { status: 400 });
  }

  // Resolve and prevent directory traversal
  const resolvedPath = path.resolve(BASE_DIR, targetPath);
  if (!resolvedPath.startsWith(BASE_DIR)) {
    return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
  }

  try {
    // Escape quotes and open using Windows `start`
    const command = `start "" "${resolvedPath.replace(/"/g, '\\"')}"`;
    exec(command, (error) => {
      if (error) {
        console.error("Open error:", error);
      }
    });
    
    // We return a 204 No Content so the browser doesn't navigate away
    // Or we redirect back using 200 with an empty body
    return new Response(JSON.stringify({ success: true, opened: resolvedPath }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to open path" }), { status: 500 });
  }
};
