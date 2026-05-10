import React, { useState } from 'react';
import { cirQuestions } from '../../data/assessment-questions';

type AssessmentState = 'intro' | 'quiz' | 'gate' | 'results';

export default function CirAssessment() {
  const [state, setState] = useState<AssessmentState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number; points: number; gapText?: string }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  // Final Results
  const [score, setScore] = useState(0);
  const [readinessLevel, setReadinessLevel] = useState('');
  const [gaps, setGaps] = useState<string[]>([]);

  const handleStart = () => setState('quiz');

  const handleAnswer = (optionIndex: number, points: number, gapText?: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: cirQuestions[currentQuestionIndex].id,
      selectedIndex: optionIndex,
      points,
      gapText
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < cirQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setState('gate');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setState('intro');
    }
  };

  const calculateResults = () => {
    const totalScore = answers.reduce((acc, curr) => acc + curr.points, 0);
    const identifiedGaps = answers.map(a => a.gapText).filter(Boolean) as string[];
    
    let level = 'Vulnerable';
    if (totalScore >= 75) level = 'Governed';
    else if (totalScore >= 40) level = 'Managed';

    return { totalScore, level, identifiedGaps };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required to receive your diagnostic report.');
      return;
    }

    setLoading(true);
    setError('');

    const { totalScore, level, identifiedGaps } = calculateResults();

    try {
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          score: totalScore,
          readinessLevel: level,
          gaps: identifiedGaps
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit assessment.');
      }

      setScore(totalScore);
      setReadinessLevel(level);
      setGaps(identifiedGaps);
      setEmailSent(result.emailSent === true);
      setState('results');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (state === 'intro') {
    return (
      <div className="cir-card">
        <h2 className="ops-section__title">Diagnostic: The Bainbridge Assessment</h2>
        <p>This 10-question diagnostic evaluates your organization\'s architectural readiness for AI agent deployment. It is designed to identify <strong>Governance Theater</strong>—the condition where oversight exists as paperwork rather than structural constraint.</p>
        <p>Based on the formal conditions of the Bainbridge Warning and the R0-R3 Reversibility classification.</p>
        <button onClick={handleStart} className="btn-primary" style={{ marginTop: '2rem' }}>
          Begin Diagnostic
        </button>
      </div>
    );
  }

  if (state === 'quiz') {
    const question = cirQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / cirQuestions.length) * 100;

    return (
      <div className="cir-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
          <span>Diagnostic Probe {currentQuestionIndex + 1}/10</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-dim)', marginBottom: '2rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--ember)', transition: 'width 0.3s ease' }}></div>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{question.text}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {question.options.map((option, idx) => (
            <button 
              key={idx}
              onClick={() => handleAnswer(idx, option.points, option.gapText)}
              className="option-btn"
            >
              {option.text}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-dim)', paddingTop: '1rem' }}>
          <button onClick={handlePrevious} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            &larr; Previous Step
          </button>
        </div>
      </div>
    );
  }

  if (state === 'gate') {
    return (
      <div className="cir-card">
        <h2 className="ops-section__title">Diagnostic Complete</h2>
        <p>The assessment engine has finished evaluating your structural conditions.</p>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>Name (Optional)</label>
            <input 
              id="name"
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="cir-input"
              placeholder="Your name"
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>Email Address (Required)</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="cir-input"
              placeholder="Where should we send the full diagnostic report?"
              required
            />
          </div>

          {error && <p style={{ color: 'var(--ember)', fontSize: '0.875rem' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Synthesizing Results...' : 'View My Diagnostic Score'}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1rem', textAlign: 'center' }}>
            By submitting, you agree to our{' '}
            <a href="/terms" style={{ color: 'var(--ember)' }}>Terms of Service</a>{' '}and{' '}
            <a href="/privacy" style={{ color: 'var(--ember)' }}>Privacy Policy</a>.
          </p>
        </form>
      </div>
    );
  }

  if (state === 'results') {
    return (
      <div className="cir-results">
        {emailSent && (
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--ember)',
            borderRadius: '6px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--ember)', fontSize: '1.25rem' }}>✓</span>
            <span>Full diagnostic report dispatched to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Check your inbox.</span>
          </div>
        )}
        <div className="cir-score-card">
          <div className="score-header">
            <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Final Evaluation</span>
            <span style={{ color: 'var(--ember)', fontWeight: 'bold' }}>{score}/100</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '1rem 0', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            {readinessLevel}
          </h2>
          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "Governance is structure, not policy. The failure is already installed."
          </p>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h3 className="ops-section__title" style={{ fontSize: '1.2rem' }}>Structural Vulnerabilities Detected</h3>
          {gaps.length > 0 ? (
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gaps.slice(0, 3).map((gap, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)' }}>{gap}</li>
              ))}
              {gaps.length > 3 && (
                <li style={{ color: 'var(--text-tertiary)', listStyleType: 'none', fontStyle: 'italic' }}>
                  + {gaps.length - 3} additional vulnerabilities flagged in your emailed report.
                </li>
              )}
            </ul>
          ) : (
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Your architecture demonstrates strong structural governance across all evaluated dimensions.</p>
          )}
        </div>

        <div className="upsell-box" style={{ marginTop: '4rem', padding: '2rem', background: 'var(--surface-2)', border: '1px solid var(--border-dim)', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Close the Infrastructure Gap</h3>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Transition from managed compliance to architected governance. Get the formal specification and practitioner tools required to enforce Bounded Verifiability Latency and Dual Ownership.
          </p>
          <a href="https://hillarynjuguna.gumroad.com/l/CIR" data-gumroad-overlay-checkout="true" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Get the CIR Practitioner Workbook &rarr;
          </a>
        </div>
      </div>
    );
  }

  return null;
}
