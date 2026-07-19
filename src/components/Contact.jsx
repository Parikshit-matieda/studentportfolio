import React, { useState } from 'react';
import './Contact.css';

function Contact({ email }) {
  // useState 1: Managing controlled form inputs (name, email, message)
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // useState 2: Toggling UI visibility (Live Preview Card)
  const [showPreview, setShowPreview] = useState(true);
  
  // State for form submission feedback
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() || message.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="contact-section" id="contact-page">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">💬 Get in Touch</span>
          <h2 className="section-title">Contact & Feedback</h2>
          <p className="section-subtitle">
            Have a project in mind or want to collaborate? Send me a message below.
          </p>
        </div>

        <div className="contact-grid">
          {/* Form Side */}
          <div className="contact-card form-card">
            <h3 className="card-title">Send a Message</h3>
            
            {submitted ? (
              <div className="success-banner">
                <span className="success-icon">✨</span>
                <h4>Thank you, {name || 'Friend'}!</h4>
                <p>Your message has been captured. I will get back to you soon.</p>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => { setSubmitted(false); setMessage(''); setName(''); setUserEmail(''); }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Your Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Message / Feedback</label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    rows="4"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline toggle-btn"
                    onClick={() => setShowPreview((prev) => !prev)}
                  >
                    {showPreview ? '🙈 Hide Live Preview' : '👁️ Show Live Preview'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Preview Side (Toggled by UI visibility state) */}
          {showPreview && (
            <div className="contact-card preview-card fade-in">
              <div className="preview-badge">Live Input Preview</div>
              <h3 className="card-title">Message Preview</h3>
              <p className="preview-instruction">
                Type in the form to see your inputs rendered here in real time:
              </p>

              <div className="preview-box">
                <div className="preview-field">
                  <span className="field-label">From:</span>
                  <span className="field-value highlight">{name || '(No name entered yet)'}</span>
                </div>
                <div className="preview-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{userEmail || '(No email entered yet)'}</span>
                </div>
                <div className="preview-field message-field">
                  <span className="field-label">Message:</span>
                  <div className="preview-text-box">
                    {message ? (
                      <p className="preview-text">{message}</p>
                    ) : (
                      <p className="preview-placeholder">Your live message preview will appear here...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="contact-direct-info">
                <h4>Direct Email</h4>
                <a href={`mailto:${email}`} className="email-link">
                  {email}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Contact;
