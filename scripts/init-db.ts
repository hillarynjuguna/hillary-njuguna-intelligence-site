import { sql } from '@vercel/postgres';

async function init() {
  console.log('Initializing database...');
  try {
    const result = await sql`
      CREATE TABLE IF NOT EXISTS cir_leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        score INTEGER,
        readiness_level VARCHAR(50),
        gaps JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database initialized:', result);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

init();
