import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import About from './About';

function Converter() {
  const [inputType, setInputType] = useState('csv');
  const [outputType, setOutputType] = useState('json');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  // Conversion functions (same as extension)
  const csvToJson = (csv) => {
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          result.push(obj);
        }
      }

      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`CSV to JSON conversion failed: ${error.message}`);
    }
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const jsonToCsv = (json) => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON must be an array of objects');
      }

      const headers = Object.keys(data[0]);
      let csv = headers.join(',') + '\n';

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return '"' + value.replace(/"/g, '""') + '"';
          }
          return value;
        });
        csv += values.join(',') + '\n';
      });

      return csv.trim();
    } catch (error) {
      throw new Error(`JSON to CSV conversion failed: ${error.message}`);
    }
  };

  const jsonBeautifier = (json) => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error(`JSON beautification failed: ${error.message}`);
    }
  };

  const jsonToSql = (json, tableName = 'converted_table') => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON must be an array of objects');
      }

      const headers = Object.keys(data[0]);
      const columns = headers.map(header => `"${header}" TEXT`).join(', ');

      let sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});\n\n`;

      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return 'NULL';
          }
          return `'${String(value).replace(/'/g, "''")}'`;
        });
        sql += `INSERT INTO "${tableName}" (${headers.map(h => `"${h}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      });

      return sql.trim();
    } catch (error) {
      throw new Error(`JSON to SQL conversion failed: ${error.message}`);
    }
  };

  const sqlToJson = (sql) => {
    try {
      const insertRegex = /INSERT INTO ["`]?(\w+)["`]? \(([^)]+)\) VALUES \(([^)]+)\)/gi;
      const results = [];
      let match;

      while ((match = insertRegex.exec(sql)) !== null) {
        const [, tableName, columnsStr, valuesStr] = match;
        const columns = columnsStr.split(',').map(col => col.trim().replace(/["`]/g, ''));
        const values = parseSQLValues(valuesStr);

        if (columns.length === values.length) {
          const obj = {};
          columns.forEach((col, index) => {
            obj[col] = values[index];
          });
          results.push(obj);
        }
      }

      if (results.length === 0) {
        throw new Error('No INSERT statements found in SQL');
      }

      return JSON.stringify(results, null, 2);
    } catch (error) {
      throw new Error(`SQL to JSON conversion failed: ${error.message}`);
    }
  };

  const parseSQLValues = (valuesStr) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];

      if (!inQuotes && (char === "'" || char === '"')) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        if (valuesStr[i + 1] === quoteChar) {
          current += quoteChar;
          i++;
        } else {
          inQuotes = false;
        }
      } else if (!inQuotes && char === ',') {
        values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^["']|["']$/g, ''));
    return values;
  };

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setStatus('Please enter some data to convert');
      return;
    }

    setIsConverting(true);
    setStatus('');

    try {
      let result = '';

      if (outputType === 'beautify') {
        if (inputType !== 'json') {
          throw new Error('Beautify only works with JSON input');
        }
        result = jsonBeautifier(inputText);
      } else {
        let jsonIntermediate = '';

        switch (inputType) {
          case 'csv':
            jsonIntermediate = csvToJson(inputText);
            break;
          case 'json':
            jsonIntermediate = jsonBeautifier(inputText);
            break;
          case 'sql':
            jsonIntermediate = sqlToJson(inputText);
            break;
          default:
            throw new Error('Invalid input type');
        }

        switch (outputType) {
          case 'json':
            result = jsonIntermediate;
            break;
          case 'csv':
            result = jsonToCsv(jsonIntermediate);
            break;
          case 'sql':
            result = jsonToSql(jsonIntermediate);
            break;
          default:
            throw new Error('Invalid output type');
        }
      }

      setOutputText(result);
      setStatus('Conversion successful!');
    } catch (error) {
      setOutputText('');
      setStatus(error.message);
    }

    setIsConverting(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      setStatus(`File "${file.name}" loaded successfully!`);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!outputText) return;

    let filename = `converted.${outputType === 'beautify' ? 'json' : outputType}`;
    let mimeType = '';

    switch (outputType) {
      case 'json':
      case 'beautify':
        mimeType = 'application/json';
        break;
      case 'csv':
        mimeType = 'text/csv';
        break;
      case 'sql':
        mimeType = 'application/sql';
        break;
      default:
        mimeType = 'text/plain';
    }

    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setStatus('Copied to clipboard!');
    } catch (error) {
      setStatus('Failed to copy to clipboard');
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: '📊' },
    { value: 'json', label: 'JSON', icon: '🔧' },
    { value: 'sql', label: 'SQL', icon: '🗄️' }
  ];

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <div className="hero-icon">
              <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={1} />
                    <stop offset="50%" stopColor="#764ba2" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f093fb" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="64" cy="64" r="60" fill="url(#logoGradient)" stroke="#ffffff" strokeWidth="2" opacity="0.95"/>
                <circle cx="64" cy="64" r="45" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
                <circle cx="64" cy="64" r="35" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="64" cy="64" r="25" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="64" cy="64" r="4" fill="#ffffff" opacity="1"/>
              </svg>
            </div>
            DataMorph<span className="highlight">Pro</span>
          </h1>
          <p className="hero-subtitle">
            Convert between CSV, JSON, and SQL formats with stunning ease
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Lightning Fast</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🛡️</span>
              <span>Secure & Private</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <span>Beautiful UI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="converter">
        <div className="converter-container">
          <div className="format-selector">
            <div className="format-group">
              <label className="format-label">Input Format</label>
              <div className="format-buttons">
                {formatOptions.map(option => (
                  <button
                    key={option.value}
                    className={`format-btn ${inputType === option.value ? 'active' : ''}`}
                    onClick={() => setInputType(option.value)}
                  >
                    <span className="format-icon">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="arrow-container">
              <div className="arrow">→</div>
            </div>

            <div className="format-group">
              <label className="format-label">Output Format</label>
              <div className="format-buttons">
                {formatOptions.map(option => (
                  <button
                    key={option.value}
                    className={`format-btn ${outputType === option.value ? 'active' : ''}`}
                    onClick={() => setOutputType(option.value)}
                  >
                    <span className="format-icon">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
                <button
                  className={`format-btn ${outputType === 'beautify' ? 'active' : ''} ${inputType !== 'json' ? 'disabled' : ''}`}
                  onClick={() => setOutputType('beautify')}
                  disabled={inputType !== 'json'}
                >
                  <span className="format-icon">✨</span>
                  Beautify
                </button>
              </div>
            </div>
          </div>

          <div className="converter-area">
            <div className="input-section">
              <div className="section-header">
                <h3>Input</h3>
                <button
                  className="file-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  📁 Upload File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.sql,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <textarea
                className="data-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Paste your ${inputType.toUpperCase()} data here or upload a file...`}
              />
            </div>

            <div className="output-section">
              <div className="section-header">
                <h3>Output</h3>
                <div className="output-actions">
                  <button
                    className="action-btn"
                    onClick={handleCopy}
                    disabled={!outputText}
                  >
                    📋 Copy
                  </button>
                  <button
                    className="action-btn download"
                    onClick={handleDownload}
                    disabled={!outputText}
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              <textarea
                className="data-textarea"
                value={outputText}
                readOnly
                placeholder="Converted data will appear here..."
              />
            </div>
          </div>

          <div className="convert-section">
            <button
              className={`convert-btn ${isConverting ? 'converting' : ''}`}
              onClick={handleConvert}
              disabled={!inputText.trim() || isConverting}
            >
              {isConverting ? (
                <>
                  <span className="spinner"></span>
                  Converting...
                </>
              ) : (
                <>
                  <span className="convert-icon">⚡</span>
                  Convert
                </>
              )}
            </button>
          </div>

          {status && (
            <div className={`status-message ${status.includes('successful') ? 'success' : status.includes('Error') || status.includes('failed') ? 'error' : 'info'}`}>
              {status}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 DataMorphPro. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router basename="/DataMorphPro">
      <Routes>
        <Route path="/" element={<Converter />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
