import type { APIRoute } from 'astro';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { z } from 'zod';

// Zod validation schema — gate against malformed or malicious input
const AssessmentSchema = z.object({
  name: z.string().max(120).optional().default('Anonymous'),
  email: z.string().email({ message: 'A valid email address is required.' }),
  score: z.number().int().min(0).max(100),
  readinessLevel: z.enum(['Vulnerable', 'Managed', 'Governed']),
  gaps: z.array(z.string().max(500)).max(20),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  try {
    const rawData = await request.json();

    // --- Validation Gate ---
    const parseResult = AssessmentSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(', ');
      return new Response(JSON.stringify({ error: `Validation failed: ${errors}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { name, email, score, readinessLevel, gaps } = parseResult.data;

    // 1. Insert into Vercel Postgres (if configured)
    const postgresUrl = process.env.POSTGRES_URL ?? import.meta.env.POSTGRES_URL;
    let savedToDb = false;
    if (postgresUrl) {
      try {
        await sql`
          INSERT INTO cir_leads (name, email, score, readiness_level, gaps)
          VALUES (${name}, ${email}, ${score}, ${readinessLevel}, ${JSON.stringify(gaps)})
          ON CONFLICT (email) DO UPDATE 
          SET score = EXCLUDED.score,
              readiness_level = EXCLUDED.readiness_level,
              gaps = EXCLUDED.gaps,
              created_at = CURRENT_TIMESTAMP;
        `;
        savedToDb = true;
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
      }
    } else {
      console.warn('POSTGRES_URL not found. Skipping DB insertion.');
    }

    // 2. Send Email via Resend
    let emailSent = false;
    if (resend) {
      const gapsHtml =
        gaps.length > 0
          ? `<ul>${gaps.map((g) => `<li><strong>Vulnerability Detected:</strong> ${g}</li>`).join('')}</ul>`
          : `<p>No critical structural gaps detected in your responses.</p>`;

      const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2C2520; background-color: #F8F6F1; padding: 40px; border-radius: 8px;">
        <h1 style="color: #B85C38; font-size: 24px; border-bottom: 2px solid #e0dcd3; padding-bottom: 10px;">Cognitive Infrastructure Diagnostic Results</h1>
        <p>Hello ${name},</p>
        <p>Thank you for completing the Cognitive Infrastructure Readiness (CIR) Assessment.</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #B85C38;">
          <h2 style="margin-top: 0; font-size: 20px;">Diagnostic Score: <span style="color: #B85C38;">${score}/100</span></h2>
          <h3 style="margin-top: 0; font-size: 18px;">Readiness Level: <strong>${readinessLevel}</strong></h3>
        </div>

        <p>Based on your responses, we identified the following architectural dynamics in your current deployment environment:</p>
        ${gapsHtml}

        <hr style="border: 0; border-top: 1px solid #e0dcd3; margin: 30px 0;" />
        
        <h3 style="font-size: 18px;">Next Steps: Close the Infrastructure Gaps</h3>
        <p>Governance is structure, not policy. To transition from managed compliance to architected governance, you need the formal specification.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://hillarynjuguna.gumroad.com" style="background-color: #B85C38; color: #fff; text-decoration: none; padding: 16px 24px; font-weight: bold; border-radius: 4px; display: inline-block;">Get the CIR Practitioner Workbook</a>
        </div>
        
        <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
          Oscillatory Fields &middot; The Public Transmission Layer<br>
          <a href="https://hillarynjuguna.vercel.app" style="color: #B85C38;">hillarynjuguna.vercel.app</a>
        </p>
      </div>
      `;

      try {
        await resend.emails.send({
          from: 'Oscillatory Fields <diagnostic@resend.dev>',
          to: [email],
          subject: 'Your CIR Diagnostic Results',
          html: emailHtml,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Email delivery failed:', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY not found. Skipping email delivery.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        savedToDb,
        emailSent,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
