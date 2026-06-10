import type { APIRoute } from 'astro';
import { updateCandidateStatus } from '../../../../scripts/bridge/review';
import { compileCanonicalIndexes } from '../../../../scripts/bridge/compile';
import { compileTheses } from '../../../../scripts/bridge/thesis';
import { compileNarratives } from '../../../../scripts/bridge/narrative';

type CandidateType = 'concepts' | 'claims' | 'evidence' | 'questions' | 'relationships';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, id, action, updates } = body as {
      type: CandidateType;
      id: string;
      action: 'approve' | 'reject' | 'edit';
      updates?: Record<string, any>;
    };

    if (!type || !id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields: type, id, action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validTypes = ['concepts', 'claims', 'evidence', 'questions', 'relationships'];
    if (!validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: `Invalid type: ${type}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let targetStatus: 'approved' | 'pending' | 'rejected' = 'pending';
    if (action === 'approve') {
      targetStatus = 'approved';
    } else if (action === 'reject') {
      targetStatus = 'rejected';
    } else if (action === 'edit') {
      targetStatus = 'approved'; // edit automatically approves the edited item
    }

    console.log(`[API Review] Processing ${action} on candidate ${type}/${id}...`);
    const success = updateCandidateStatus(type, id, targetStatus, updates);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to find or update candidate' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger downstream compilation pipeline synchronously to refresh data
    try {
      console.log('[API Review] Running compilation pipeline...');
      compileCanonicalIndexes();
      compileTheses();
      compileNarratives();
      console.log('[API Review] Compilation pipeline completed.');
    } catch (compileErr) {
      console.error('⚠️ Compilation failed after review action:', compileErr);
      // We still return 200 since the candidate update succeeded, but warn in output
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing review:', error);
    return new Response(JSON.stringify({ error: 'Failed to process review' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
