import React, { useState, useEffect } from 'react';
import { ReadmeGenerator } from './components/ReadmeGenerator';
import { Sparkles, GitBranch, ArrowRight, AlertCircle, FileCode2, Settings } from 'lucide-react';
import { parseGithubUrl } from './utils/github';
import { getApiKey, setApiKey } from './utils/ai';
import './App.css';

function App() {
  const [inputMode, setInputMode] = useState<'url' | 'code'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  
  const [activeTask, setActiveTask] = useState<{type: 'url' | 'code', payload: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    setApiKeyInput(getApiKey());
  }, []);

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput.trim());
    setShowSettings(false);
  };

  const handleStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!getApiKey()) {
      setShowSettings(true);
      return;
    }

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
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">API Configuration</h2>
            <p className="modal-desc">
              Autodoc Live uses the Google Gemini API to analyze your code and generate accurate documentation. 
              Get your free API key from Google AI Studio.
            </p>
            <input
              type="password"
              className="modal-input"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveApiKey}>Save Key</button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <button onClick={reset} className="brand">
          <Sparkles className="brand-icon" size={24} />
          Auto<span className="text-gradient">Doc</span>
        </button>
        <div className="nav-links">
          <button onClick={() => setShowSettings(true)} title="Settings" style={{ padding: '0.5rem' }}>
            <Settings size={20} />
          </button>
          <a href="https://github.com" target="_blank" rel="noreferrer" title="View Source" style={{ padding: '0.5rem' }}>
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
              Provide your repository URL or paste your code directly. Our engine analyzes your codebase using Gemini to generate a beautiful, comprehensive README.md in seconds.
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
