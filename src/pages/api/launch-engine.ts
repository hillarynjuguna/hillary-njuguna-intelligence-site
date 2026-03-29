import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import path from 'path';

const ENGINE_DIR = "G:\\My Drive\\RSPS Knowledge Spine\\2_The_RSPS_RRI_Starter_Repository\\HOT_SDC_Engine";

export const POST: APIRoute = async () => {
  try {
    // Launch a new dedicated command prompt window running the CLI Engine
    // /c runs the command, but we use /k to keep the window open after script finishes
    const command = `start "HOT SDC Engine v4.2" cmd.exe /k "cd /d \\"${ENGINE_DIR}\\" && python main_hot_cli.py"`;
    
    exec(command, (error) => {
      if (error) {
        console.error("Engine Launch Error:", error);
      }
    });
    
    return new Response(JSON.stringify({ success: true, message: "HOT SDC Engine Initialized" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to launch Engine" }), { status: 500 });
  }
};
