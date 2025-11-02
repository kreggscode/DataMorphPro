import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="policy-container">
        <header className="policy-header">
          <Link to="/" className="back-link">← Back to Converter</Link>
          <div className="policy-logo">
            <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="policyLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="64" cy="64" r="60" fill="url(#policyLogoGradient)" stroke="#ffffff" strokeWidth="2" opacity="0.95"/>
              <circle cx="64" cy="64" r="45" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
              <circle cx="64" cy="64" r="35" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="64" cy="64" r="25" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="64" cy="64" r="4" fill="#ffffff" opacity="1"/>
            </svg>
          </div>
          <h1>Privacy Policy</h1>
          <p className="policy-date">Last updated: October 14, 2025</p>
        </header>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>
            DataMorphPro is a client-side web application that processes data entirely within your browser.
            We do not collect, store, or transmit any personal information or data that you upload or convert.
          </p>
          <ul>
            <li><strong>No Data Storage:</strong> All conversions happen locally in your browser</li>
            <li><strong>No Personal Information:</strong> We don't collect names, emails, or any user data</li>
            <li><strong>No Tracking:</strong> We don't use cookies, analytics, or tracking technologies</li>
            <li><strong>No Third Parties:</strong> Your data never leaves your device</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Information</h2>
          <p>
            Since we don't collect any information, we don't use any information for any purpose.
            The converter works entirely offline and processes your data locally.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Data Security</h2>
          <p>
            Your data security is our top priority. Since all processing happens in your browser:
          </p>
          <ul>
            <li>Data never leaves your device</li>
            <li>No server-side processing or storage</li>
            <li>No risk of data breaches or unauthorized access</li>
            <li>You maintain full control over your data</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Chrome Extension Permissions</h2>
          <p>
            The Chrome extension requests the following permissions:
          </p>
          <ul>
            <li><strong>activeTab:</strong> Allows the extension to work on the current tab (required for popup functionality)</li>
            <li><strong>storage:</strong> Allows saving user preferences locally on your device</li>
          </ul>
          <p>These permissions are only used to provide the core functionality and do not access your browsing history or personal data.</p>
        </section>

        <section className="policy-section">
          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our website.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of any changes by updating the "Last updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
