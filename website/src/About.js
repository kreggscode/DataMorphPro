import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

function About() {
  return (
    <div className="about">
      <div className="about-container">
        <header className="about-header">
          <Link to="/" className="back-link">← Back to Converter</Link>
          <h1>About DataMorphPro</h1>
          <p className="about-tagline">Transform your data with ease and precision</p>
        </header>

        <section className="about-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="aboutBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                    <stop offset="50%" stopColor="#764ba2" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f093fb" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="64" cy="64" r="60" fill="url(#aboutBgGradient)" stroke="#ffffff" strokeWidth="2" opacity="0.95"/>
                <circle cx="64" cy="64" r="45" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
                <circle cx="64" cy="64" r="35" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="64" cy="64" r="25" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="64" cy="64" r="4" fill="#ffffff" opacity="1"/>
              </svg>
            </div>
            <h2>What We Do</h2>
            <p>
              DataMorphPro is your ultimate tool for seamlessly converting between different data formats.
              Whether you're working with CSV files, JSON structures, or SQL databases, we make data transformation
              simple, fast, and reliable.
            </p>
          </div>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Process large datasets in seconds with our optimized conversion algorithms</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure & Private</h3>
            <p>All processing happens locally in your browser. Your data never leaves your device.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Accurate Results</h3>
            <p>Industry-standard conversion logic ensures your data integrity is maintained</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Cross-Platform</h3>
            <p>Works on any device with a modern web browser. No installation required.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Multiple Formats</h3>
            <p>Support for CSV, JSON, and SQL formats with more coming soon</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Intuitive interface designed for the best user experience</p>
          </div>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="workflow">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Choose Your Formats</h4>
              <p>Select your input and output formats from the available options</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h4>Input Your Data</h4>
              <p>Paste your data directly or upload a file for processing</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h4>Convert Instantly</h4>
              <p>Click convert and get your transformed data immediately</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h4>Download or Copy</h4>
              <p>Save your converted data or copy it to clipboard</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <span>React</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🎨</span>
              <span>Tailwind CSS</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🔄</span>
              <span>JavaScript</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🌐</span>
              <span>Web Standards</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Browser Extension</h2>
          <p>
            DataMorphPro is also available as a Chrome browser extension for even faster access.
            Install it from the Chrome Web Store and convert data directly from any webpage.
          </p>
          <div className="extension-features">
            <div className="ext-feature">
              <span className="ext-icon">📎</span>
              <span>Quick Access</span>
            </div>
            <div className="ext-feature">
              <span className="ext-icon">💾</span>
              <span>Local Storage</span>
            </div>
            <div className="ext-feature">
              <span className="ext-icon">🚀</span>
              <span>Instant Popup</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Get Started</h2>
          <p>
            Ready to transform your data? Head back to the converter and start converting your files today.
            It's completely free and works offline!
          </p>
          <Link to="/" className="cta-button">
            Start Converting Now
          </Link>
        </section>
      </div>
    </div>
  );
}

export default About;
