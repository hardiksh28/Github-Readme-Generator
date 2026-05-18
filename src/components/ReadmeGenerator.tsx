import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Copy, Download, Code2, Eye, 
  RefreshCw, GitBranch, AlertTriangle, FileCode, ArrowLeft, FileCode2
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { fetchRepoData, parseGithubUrl, type RepoData } from '../utils/github';
import { generateReadme, generateReadmeFromCode } from '../utils/ai';

interface ReadmeGeneratorProps {
  task: { type: 'url' | 'code'; payload: string };
  onReset: () => void;
}

interface Step {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}

export const ReadmeGenerator: React.FC<ReadmeGeneratorProps> = ({ task, onReset }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [repoDetails, setRepoDetails] = useState<RepoData | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  
  const initialStepsUrl: Step[] = [
    { id: 'fetch', name: 'Fetching repository details', status: 'pending' },
    { id: 'analyze', name: 'Analyzing project structure', status: 'pending' },
    { id: 'ai', name: 'Generating intelligent content', status: 'pending' },
    { id: 'format', name: 'Formatting Markdown', status: 'pending' },
  ];

  const initialStepsCode: Step[] = [
    { id: 'analyze', name: 'Analyzing code snippet', status: 'pending' },
    { id: 'ai', name: 'Generating intelligent content', status: 'pending' },
    { id: 'format', name: 'Formatting Markdown', status: 'pending' },
  ];

  const [steps, setSteps] = useState<Step[]>(task.type === 'url' ? initialStepsUrl : initialStepsCode);

  useEffect(() => {
    let mounted = true;

    const runGeneration = async () => {
      try {
        setIsGenerating(true);
        setError(null);
        setSteps(task.type === 'url' ? initialStepsUrl : initialStepsCode);
        
        let generated = '';

        if (task.type === 'url') {
          // Step 1: Fetch
          setSteps(s => s.map(step => step.id === 'fetch' ? { ...step, status: 'active' } : step));
          const data = await fetchRepoData(task.payload, () => {});
          if (!mounted) return;
          setRepoDetails(data);
          
          // Step 2: Analyze
          setSteps(s => s.map(step => {
            if (step.id === 'fetch') return { ...step, status: 'completed' };
            if (step.id === 'analyze') return { ...step, status: 'active' };
            return step;
          }));
          await new Promise(r => setTimeout(r, 1000));
          
          // Step 3 & 4: AI Gen
          setSteps(s => s.map(step => {
            if (step.id === 'analyze') return { ...step, status: 'completed' };
            if (step.id === 'ai') return { ...step, status: 'active' };
            return step;
          }));
          
          generated = await generateReadme(data, (msg) => {
            if (msg === 'Writing documentation...' && mounted) {
              setSteps(s => s.map(step => {
                if (step.id === 'ai') return { ...step, status: 'completed' };
                if (step.id === 'format') return { ...step, status: 'active' };
                return step;
              }));
            }
          });
        } else {
          // Code mode
          // Step 1: Analyze
          setSteps(s => s.map(step => step.id === 'analyze' ? { ...step, status: 'active' } : step));
          
          generated = await generateReadmeFromCode(task.payload, (msg) => {
            if (msg === 'Generating intelligent content...' && mounted) {
              setSteps(s => s.map(step => {
                if (step.id === 'analyze') return { ...step, status: 'completed' };
                if (step.id === 'ai') return { ...step, status: 'active' };
                return step;
              }));
            } else if (msg === 'Writing documentation...' && mounted) {
              setSteps(s => s.map(step => {
                if (step.id === 'ai') return { ...step, status: 'completed' };
                if (step.id === 'format') return { ...step, status: 'active' };
                return step;
              }));
            }
          });
        }
        
        if (!mounted) return;
        
        setSteps(s => s.map(step => ({ ...step, status: 'completed' })));
        setReadme(generated);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        if (mounted) setIsGenerating(false);
      }
    };

    runGeneration();
    return () => { mounted = false; };
  }, [task.payload, task.type]);

  const getSanitizedHtml = (markdown: string) => {
    return DOMPurify.sanitize(marked(markdown) as string);
  };

  const handleCopy = () => {
    if (readme) {
      navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (readme) {
      const blob = new Blob([readme], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'README.md';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const parsedUrl = task.type === 'url' ? parseGithubUrl(task.payload) : null;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="repo-card">
          <div className="repo-header">
            <button className="btn-icon" onClick={onReset} title="Back to Search" style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginRight: '0.5rem' }}>
              <ArrowLeft size={18} />
            </button>
            {task.type === 'url' ? <GitBranch size={20} /> : <FileCode2 size={20} />}
            <span className="repo-name">
              {task.type === 'url' ? `${parsedUrl?.owner} / ${parsedUrl?.repo}` : 'Raw Code Snippet'}
            </span>
          </div>
          
          {task.type === 'url' && repoDetails?.description && (
            <p className="repo-desc">{repoDetails.description}</p>
          )}

          {task.type === 'code' && (
            <p className="repo-desc">
              Analyzing provided source code to generate documentation.
            </p>
          )}

          {task.type === 'url' && (
            <div className="repo-meta">
              {repoDetails?.language && (
                <div className="meta-item">
                  <FileCode size={16} />
                  <span>{repoDetails.language}</span>
                </div>
              )}
              <div className="meta-item">
                <GitBranch size={16} />
                <span>{repoDetails?.defaultBranch || 'main'}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1.25rem' }}>
            Generation Status
          </h3>
          
          <div className="progress-container">
            {steps.map((step) => (
              <div key={step.id} className={`progress-step ${step.status}`}>
                <div className="step-indicator">
                  {step.status === 'completed' ? (
                    <CheckCircle2 size={14} />
                  ) : step.status === 'active' ? (
                    <RefreshCw size={12} className="spinner" />
                  ) : (
                    <Circle size={10} style={{ fill: 'currentColor' }} />
                  )}
                </div>
                <div className="step-connector"></div>
                <div className="step-content">
                  <div className="step-title">{step.name}</div>
                </div>
              </div>
            ))}
          </div>
          
          {error && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <section className="workspace">
        <div className="toolbar">
          <div className="view-toggles">
            <button 
              className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              <Eye size={16} /> Preview
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'raw' ? 'active' : ''}`}
              onClick={() => setViewMode('raw')}
            >
              <Code2 size={16} /> Markdown
            </button>
          </div>
          
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleCopy} disabled={!readme}>
              {copied ? <CheckCircle2 size={16} color="var(--success)" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="btn-secondary" onClick={handleDownload} disabled={!readme}>
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        <div className="editor-area">
          {isGenerating ? (
            <div className="markdown-preview">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-box"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          ) : readme ? (
            viewMode === 'preview' ? (
              <div 
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: getSanitizedHtml(readme) }}
              />
            ) : (
              <textarea 
                className="raw-editor"
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                spellCheck={false}
              />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
};
