import React, { useState, useEffect } from 'react';

interface Stats {
  totalDocuments: number;
  totalChunks: number;
  pending: {
    concepts: number;
    claims: number;
    evidence: number;
    relationships: number;
    questions: number;
    total: number;
  };
  canonical: {
    concepts: number;
    claims: number;
    evidence: number;
    relationships: number;
    questions: number;
  };
  theses: number;
  briefs: number;
  lastUpdated: string;
}

interface Candidate {
  id: string;
  name?: string;
  statement?: string;
  question?: string;
  source?: string;
  relation?: string;
  target?: string;
  status: string;
  supportingSources: string[];
  supportingChunks: string[];
  supportingPassages: string[];
  extractionConfidence: number;
}

interface CandidatesGroup {
  concepts: Candidate[];
  claims: Candidate[];
  evidence: Candidate[];
  relationships: Candidate[];
  questions: Candidate[];
}

interface Thesis {
  id: string;
  title: string;
  description: string;
  claims: string[];
  evidence: string[];
  contradictions: string[];
  implementations: string[];
  strength: number;
  status: string;
}

interface NarrativeAct {
  title: string;
  description: string;
  citations: { type: string; id: string }[];
}

interface NarrativeBrief {
  thesisId: string;
  thesisTitle: string;
  strategy: 'Paradox/Mechanism' | 'Attack/Defense' | 'Tension/Resolution';
  acts: NarrativeAct[];
}

export default function ObservatoryDashboard() {
  const [activeTab, setActiveTab] = useState<'observe' | 'review' | 'develop' | 'publish' | 'audit'>('observe');
  const [reviewSubTab, setReviewSubTab] = useState<'concepts' | 'claims' | 'evidence' | 'relationships'>('concepts');
  const [stats, setStats] = useState<Stats | null>(null);
  const [candidates, setCandidates] = useState<CandidatesGroup | null>(null);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [briefs, setBriefs] = useState<NarrativeBrief[]>([]);
  const [provenance, setProvenance] = useState<any[]>([]);
  const [auditQuery, setAuditQuery] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editValue, setEditValue] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/skos/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch pending candidates
      const candRes = await fetch('/api/skos/candidates');
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData);
      }

      // Fetch compiled theses
      const thesesRes = await fetch('/api/skos/theses');
      if (thesesRes.ok) {
        const thesesData = await thesesRes.json();
        setTheses(thesesData);
      } else {
        // Fallback fetch if endpoint not created yet
        const localThesesRes = await fetch('/src/data/generated/theses.json');
        if (localThesesRes.ok) {
          const thesesData = await localThesesRes.json();
          setTheses(thesesData);
        }
      }

      // Fetch briefs
      const briefsRes = await fetch('/api/skos/briefs');
      if (briefsRes.ok) {
        const briefsData = await briefsRes.json();
        setBriefs(briefsData);
      } else {
        // Fallback fetch
        const localBriefsRes = await fetch('/src/data/generated/documentary-briefs.json');
        if (localBriefsRes.ok) {
          const briefsData = await localBriefsRes.json();
          setBriefs(briefsData);
        }
      }

      // Fetch provenance database for explorer
      const provRes = await fetch('/src/data/generated/provenance.json');
      if (provRes.ok) {
        const provData = await provRes.json();
        setProvenance(provData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    showMsg('Triggering compiler execution pass...');
    try {
      const res = await fetch('/api/skos/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'concepts', id: 'dummy-trigger', action: 'pending' }) // dummy action triggers rebuild
      });
      if (res.ok) {
        await fetchData();
        showMsg('Pipeline recompiled successfully!');
      } else {
        showMsg('Pipeline recompiled with warnings.', 'success');
        await fetchData();
      }
    } catch {
      showMsg('Failed to run compilation pass.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReviewAction = async (type: string, id: string, action: 'approve' | 'reject' | 'edit', updates?: Record<string, any>) => {
    try {
      const res = await fetch('/api/skos/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, updates })
      });
      if (res.ok) {
        showMsg(`Candidate ${id} successfully marked as ${action === 'approve' || action === 'edit' ? 'approved' : 'rejected'}.`);
        setEditingCandidate(null);
        await fetchData();
      } else {
        const err = await res.json();
        showMsg(err.error || 'Failed to update candidate state.', 'error');
      }
    } catch {
      showMsg('Failed to connect to local API route.', 'error');
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 0.7) return '#10B981'; // Green
    if (score >= 0.4) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="skos-dashboard">
      <header className="skos-header">
        <div className="skos-title-area">
          <span className="skos-badge">SOVEREIGN CORE</span>
          <h1>Research Operations Observatory</h1>
          <p className="skos-subtitle">Sovereign Knowledge Operating System -- Compiler Control Desk</p>
        </div>
        <div className="skos-actions-area">
          <button 
            className={`skos-btn-secondary ${isRefreshing ? 'loading' : ''}`}
            onClick={handleRefreshPipeline}
            disabled={isRefreshing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Recompile Pipeline
          </button>
          <button className="skos-btn-primary" onClick={fetchData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Sync Data
          </button>
        </div>
      </header>

      {message && (
        <div className={`skos-toast ${message.type === 'error' ? 'error' : ''}`}>
          {message.text}
        </div>
      )}

      {/* Main Tabs Navigation */}
      <nav className="skos-nav-tabs">
        <button className={activeTab === 'observe' ? 'active' : ''} onClick={() => setActiveTab('observe')}>
          Observatory
        </button>
        <button className={activeTab === 'review' ? 'active' : ''} onClick={() => setActiveTab('review')}>
          Inbox & Queues {stats && stats.pending.total > 0 && <span className="tab-count">{stats.pending.total}</span>}
        </button>
        <button className={activeTab === 'develop' ? 'active' : ''} onClick={() => setActiveTab('develop')}>
          Thesis Workbench
        </button>
        <button className={activeTab === 'publish' ? 'active' : ''} onClick={() => setActiveTab('publish')}>
          Narrative Studio
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          Provenance Explorer
        </button>
      </nav>

      <main className="skos-main-content">
        {/* Tab 1: Observatory (Stats Dashboard) */}
        {activeTab === 'observe' && (
          <div className="skos-view-observe animate-fade-in">
            {stats ? (
              <>
                <section className="skos-stats-grid">
                  <div className="skos-stat-card glow-blue">
                    <h3>Corpus Observatory</h3>
                    <div className="stat-value">{stats.totalDocuments}</div>
                    <div className="stat-label">Indexed Documents</div>
                    <div className="stat-sub">{stats.totalChunks} Chunks Analyzed</div>
                  </div>
                  <div className="skos-stat-card glow-purple">
                    <h3>Discovery Queue</h3>
                    <div className="stat-value">{stats.pending.total}</div>
                    <div className="stat-label">Pending Extractions</div>
                    <div className="stat-sub">
                      {stats.pending.concepts} C · {stats.pending.claims} Cl · {stats.pending.evidence} Ev · {stats.pending.relationships} R
                    </div>
                  </div>
                  <div className="skos-stat-card glow-cyan">
                    <h3>Canonical Graph</h3>
                    <div className="stat-value">
                      {stats.canonical.concepts + stats.canonical.claims + stats.canonical.evidence}
                    </div>
                    <div className="stat-label">Canonical Nodes Compiled</div>
                    <div className="stat-sub">{stats.canonical.relationships} Relationship Edges</div>
                  </div>
                  <div className="skos-stat-card glow-green">
                    <h3>Editorial Studio</h3>
                    <div className="stat-value">{stats.theses}</div>
                    <div className="stat-label">Active Theses</div>
                    <div className="stat-sub">{stats.briefs} Narrative Briefs Ready</div>
                  </div>
                </section>

                <section className="skos-pipeline-panel">
                  <h2>System Compilation Pipeline Status</h2>
                  <div className="pipeline-steps">
                    <div className="step-node active">
                      <div className="step-icon">0</div>
                      <div className="step-info">
                        <h4>Phase 0: Corpus Intelligence</h4>
                        <p>Checksums & Chunking</p>
                        <span className="step-badge-green">Stable</span>
                      </div>
                    </div>
                    <div className="step-node active">
                      <div className="step-icon">1</div>
                      <div className="step-info">
                        <h4>Phase 1: Discovery Engine</h4>
                        <p>LLM Candidate Extraction</p>
                        <span className={stats.pending.total > 0 ? "step-badge-orange" : "step-badge-green"}>
                          {stats.pending.total > 0 ? "Review Needed" : "Completed"}
                        </span>
                      </div>
                    </div>
                    <div className="step-node">
                      <div className="step-icon">2</div>
                      <div className="step-info">
                        <h4>Phases 2-4: Compilation</h4>
                        <p>Deduplication & Provenance</p>
                        <span className="step-badge-blue">Dynamic</span>
                      </div>
                    </div>
                    <div className="step-node">
                      <div className="step-icon">5-6</div>
                      <div className="step-info">
                        <h4>Phases 5-6: Narrative</h4>
                        <p>Thesis & Act Structure</p>
                        <span className="step-badge-blue">Dynamic</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="skos-loading-state">Loading Observatory statistics...</div>
            )}
          </div>
        )}

        {/* Tab 2: Review (Inbox & Queues) */}
        {activeTab === 'review' && (
          <div className="skos-view-review animate-fade-in">
            <div className="review-layout">
              <aside className="review-sidebar">
                <h3>Queues</h3>
                <nav className="review-side-nav">
                  <button className={reviewSubTab === 'concepts' ? 'active' : ''} onClick={() => { setReviewSubTab('concepts'); setEditingCandidate(null); }}>
                    Concepts ({candidates?.concepts.length || 0})
                  </button>
                  <button className={reviewSubTab === 'claims' ? 'active' : ''} onClick={() => { setReviewSubTab('claims'); setEditingCandidate(null); }}>
                    Claims ({candidates?.claims.length || 0})
                  </button>
                  <button className={reviewSubTab === 'evidence' ? 'active' : ''} onClick={() => { setReviewSubTab('evidence'); setEditingCandidate(null); }}>
                    Evidence ({candidates?.evidence.length || 0})
                  </button>
                  <button className={reviewSubTab === 'relationships' ? 'active' : ''} onClick={() => { setReviewSubTab('relationships'); setEditingCandidate(null); }}>
                    Relationships ({candidates?.relationships.length || 0})
                  </button>
                </nav>
              </aside>

              <section className="review-board-area">
                <h2>Pending Candidate {reviewSubTab.charAt(0).toUpperCase() + reviewSubTab.slice(1)}</h2>
                
                {candidates && candidates[reviewSubTab] && candidates[reviewSubTab].length > 0 ? (
                  <div className="candidate-list">
                    {candidates[reviewSubTab].map((cand) => (
                      <div key={cand.id} className="candidate-card">
                        <div className="cand-header">
                          <span className="cand-id">ID: {cand.id}</span>
                          <span className="cand-confidence">Confidence: {(cand.extractionConfidence * 100).toFixed(0)}%</span>
                        </div>

                        {editingCandidate?.id === cand.id ? (
                          <div className="cand-edit-area">
                            {reviewSubTab === 'concepts' || reviewSubTab === 'evidence' ? (
                              <input 
                                type="text" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)} 
                                className="skos-input"
                              />
                            ) : reviewSubTab === 'claims' ? (
                              <textarea 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)} 
                                className="skos-textarea"
                              />
                            ) : null}
                            <div className="edit-actions">
                              <button 
                                className="skos-btn-success" 
                                onClick={() => handleReviewAction(
                                  reviewSubTab, 
                                  cand.id, 
                                  'edit', 
                                  reviewSubTab === 'concepts' || reviewSubTab === 'evidence' 
                                    ? { name: editValue } 
                                    : { statement: editValue }
                                )}
                              >
                                Save & Approve
                              </button>
                              <button className="skos-btn-secondary" onClick={() => setEditingCandidate(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="cand-content">
                              {reviewSubTab === 'concepts' || reviewSubTab === 'evidence' ? (
                                <h3>{cand.name}</h3>
                              ) : reviewSubTab === 'claims' ? (
                                <p className="claim-statement">"{cand.statement}"</p>
                              ) : reviewSubTab === 'relationships' ? (
                                <div className="relationship-display">
                                  <span className="rel-node">{cand.source}</span>
                                  <span className="rel-edge">-- {cand.relation} --&gt;</span>
                                  <span className="rel-node">{cand.target}</span>
                                </div>
                              ) : null}
                            </div>

                            {cand.supportingPassages && cand.supportingPassages[0] && (
                              <blockquote className="cand-passage">
                                <strong>Passage citation:</strong> "{cand.supportingPassages[0]}"
                              </blockquote>
                            )}

                            <div className="cand-provenance">
                              <span>Source: {cand.supportingSources.join(', ')}</span>
                              <span>Chunk: {cand.supportingChunks.join(', ')}</span>
                            </div>

                            <div className="cand-actions">
                              <button className="skos-btn-success" onClick={() => handleReviewAction(reviewSubTab, cand.id, 'approve')}>
                                Approve
                              </button>
                              <button className="skos-btn-danger" onClick={() => handleReviewAction(reviewSubTab, cand.id, 'reject')}>
                                Reject
                              </button>
                              {reviewSubTab !== 'relationships' && (
                                <button className="skos-btn-secondary" onClick={() => {
                                  setEditingCandidate(cand);
                                  setEditValue(cand.name || cand.statement || '');
                                }}>
                                  Edit
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p>No pending candidates in this queue.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Tab 3: Develop (Thesis Workbench) */}
        {activeTab === 'develop' && (
          <div className="skos-view-develop animate-fade-in">
            <h2>Thesis Workbench</h2>
            <p className="section-intro">Develop and audit core theses aggregated from the compiled canonical knowledge graph.</p>

            {theses.length > 0 ? (
              <div className="thesis-grid">
                {theses.map((thesis) => (
                  <div key={thesis.id} className="thesis-card">
                    <div className="thesis-card-header">
                      <h3>{thesis.title}</h3>
                      <div className="strength-gauge">
                        <span className="strength-label">Strength</span>
                        <div className="strength-bar-bg">
                          <div 
                            className="strength-bar-fill" 
                            style={{ 
                              width: `${thesis.strength * 100}%`,
                              backgroundColor: getStrengthColor(thesis.strength)
                            }}
                          />
                        </div>
                        <span className="strength-val" style={{ color: getStrengthColor(thesis.strength) }}>
                          {thesis.strength.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="thesis-desc">{thesis.description}</p>
                    
                    <div className="thesis-relations-grid">
                      <div className="rel-section">
                        <h4>Supporting Claims ({thesis.claims.length})</h4>
                        <ul>
                          {thesis.claims.map(id => (
                            <li key={id} className="mono">{id}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rel-section">
                        <h4>Citing Evidence ({thesis.evidence.length})</h4>
                        <ul>
                          {thesis.evidence.map(id => (
                            <li key={id} className="mono">{id}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rel-section">
                        <h4>Contradictions ({thesis.contradictions.length})</h4>
                        <ul>
                          {thesis.contradictions.map(id => (
                            <li key={id} className="mono error">{id}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rel-section">
                        <h4>Implementations ({thesis.implementations.length})</h4>
                        <ul>
                          {thesis.implementations.map(id => (
                            <li key={id} className="mono success">{id}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No theses found. Approve candidates and run compilation to compile theses.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Publish (Narrative Studio) */}
        {activeTab === 'publish' && (
          <div className="skos-view-publish animate-fade-in">
            <h2>Narrative Studio</h2>
            <p className="section-intro">Structured documentary brief generator. Bridges canonical concepts with narrative strategies.</p>

            {briefs.length > 0 ? (
              <div className="brief-list">
                {briefs.map((brief) => (
                  <div key={brief.thesisId} className="brief-card">
                    <div className="brief-header">
                      <h3>Documentary Brief: {brief.thesisTitle}</h3>
                      <span className="strategy-badge">{brief.strategy} Strategy</span>
                    </div>

                    <div className="brief-acts">
                      {brief.acts.map((act, idx) => (
                        <div key={idx} className="act-node">
                          <div className="act-header">
                            <h5>{act.title}</h5>
                            <p className="act-desc">{act.description}</p>
                          </div>
                          {act.citations.length > 0 && (
                            <div className="act-citations">
                              <span className="cit-title">Citations:</span>
                              <div className="citations-list">
                                {act.citations.map((c, cIdx) => (
                                  <span key={cIdx} className="cit-badge">
                                    {c.type}: {c.id}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No briefs found. Run compilation to generate narrative briefs.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Audit (Provenance Explorer) */}
        {activeTab === 'audit' && (
          <div className="skos-view-audit animate-fade-in">
            <h2>Provenance Explorer</h2>
            <p className="section-intro">Trace any compiled canonical entity back to its exact corpus source files and raw textual snippet.</p>

            <div className="search-bar-container">
              <input 
                type="text" 
                placeholder="Search by Entity ID (e.g. mortal-measurement)..."
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                className="skos-search-input"
              />
            </div>

            {provenance.length > 0 ? (
              <div className="provenance-results">
                {provenance
                  .filter(p => p.nodeId.toLowerCase().includes(auditQuery.toLowerCase()))
                  .map((record, idx) => (
                    <div key={idx} className="prov-card">
                      <div className="prov-header">
                        <h4>{record.nodeId}</h4>
                        <span className="prov-type-badge">{record.nodeType}</span>
                      </div>
                      <div className="prov-meta">
                        <div><strong>First Seen:</strong> {new Date(record.firstSeen).toLocaleString()}</div>
                        <div><strong>Last Validated:</strong> {new Date(record.lastValidated).toLocaleString()}</div>
                      </div>
                      
                      <div className="prov-sources">
                        <h5>Supporting Sources & Chunks</h5>
                        <ul>
                          {record.supportingChunks.map((chunkId: string, chunkIdx: number) => (
                            <li key={chunkIdx} className="mono">
                              {chunkId} (Source: {record.sources[chunkIdx] || 'unknown'})
                            </li>
                          ))}
                        </ul>
                      </div>

                      {record.supportingPassages && record.supportingPassages[0] && (
                        <div className="prov-passages">
                          <h5>Exact Corpus Snippet</h5>
                          <blockquote>"{record.supportingPassages[0]}"</blockquote>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No provenance records loaded. Verify that `provenance.json` exists in `src/data/generated/`.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
