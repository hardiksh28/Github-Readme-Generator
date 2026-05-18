import React, { useState } from 'react';
import { ReadmeGenerator } from './components/ReadmeGenerator';
import { Sparkles, GitBranch, ArrowRight, AlertCircle, FileCode2 } from 'lucide-react';
import { parseGithubUrl } from './utils/github';
import './App.css';

function App() {
  const [inputMode, setInputMode] = useState<'url' | 'code'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  
  const [activeTask, setActiveTask] = useState<{type: 'url' | 'code', payload: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (inputMode === 'url') {
      if (!urlInput.trim()) return;
      const parsed = parseGithubUrl(urlInput);
      if (!parsed) {
        setError('Please enter a valid GitHub repository URL.');
        return;
      }
      setError(null);
      setActiveTask({ type: 'url', payload: urlInput });
    } else {
      if (!codeInput.trim()) {
        setError('Please paste some code to analyze.');
        return;
      }
      setError(null);
      setActiveTask({ type: 'code', payload: codeInput });
    }
  };

  const reset = () => {
    setActiveTask(null);
    setUrlInput('');
    setCodeInput('');
    setError(null);
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <button onClick={reset} className="brand">
          <Sparkles className="brand-icon" size={24} />
          Autodoc <span className="text-gradient">Live</span>
        </button>
        <div className="nav-links">
          <a href="https://github.com" target="_blank" rel="noreferrer" title="View Source">
            <GitBranch size={20} />
          </a>
        </div>
      </nav>

      <main className="main-content">
        {!activeTask ? (
          <div className="hero-container">
            <h1 className="hero-title">
              Craft the perfect <span className="text-gradient">README</span> instantly.
            </h1>
            <p className="hero-subtitle">
              Provide your repository URL or paste your code directly. Our engine analyzes your codebase to generate a beautiful, comprehensive README.md in seconds.
            </p>
            
            <div className="input-mode-toggles">
              <button 
                className={`mode-toggle ${inputMode === 'url' ? 'active' : ''}`}
                onClick={() => { setInputMode('url'); setError(null); }}
              >
                <GitBranch size={16} /> GitHub URL
              </button>
              <button 
                className={`mode-toggle ${inputMode === 'code' ? 'active' : ''}`}
                onClick={() => { setInputMode('code'); setError(null); }}
              >
                <FileCode2 size={16} /> Paste Code
              </button>
            </div>

            <form className={`search-box ${inputMode === 'code' ? 'code-mode' : ''}`} onSubmit={handleStart}>
              {inputMode === 'url' ? (
                <>
                  <GitBranch className="search-icon" size={20} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="https://github.com/facebook/react"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setError(null);
                    }}
                  />
                  <button 
                    type="submit" 
                    className="search-button"
                    disabled={!urlInput.trim()}
                  >
                    Generate
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <div className="code-input-wrapper">
                  <textarea
                    className="code-textarea"
                    placeholder="// Paste your code snippet here...&#10;function example() {&#10;  console.log('Hello World');&#10;}"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value);
                      setError(null);
                    }}
                    rows={8}
                  />
                  <div className="code-submit-row">
                    <button 
                      type="submit" 
                      className="search-button code-submit-button"
                      disabled={!codeInput.trim()}
                    >
                      Analyze & Generate
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <ReadmeGenerator task={activeTask} onReset={reset} />
        )}
      </main>
    </div>
  );
}

export default App;
