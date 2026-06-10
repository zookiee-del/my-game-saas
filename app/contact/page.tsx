"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to an API endpoint
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: "#05050a", color: "#39ff14", fontFamily: "monospace", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "#39ff14", textDecoration: "none", border: "1px solid #39ff14", padding: "0.5rem 1rem", borderRadius: "4px", display: "inline-block", marginBottom: "2rem" }}>
          ← Back to Home
        </Link>

        <h1 style={{ color: "#ff0055", fontSize: "2rem", marginBottom: "0.5rem" }}>Contact Us</h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Have questions, feedback, or need support? Reach out and we will respond as soon as possible.
        </p>

        <div style={{ border: "1px solid #39ff14", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem", backgroundColor: "#0a0a14" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.3rem" }}>✉</span>
            <div>
              <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>Email Us Directly</p>
              <a href="mailto:admin@speh.cc" style={{ color: "#00ffaa", fontSize: "1.1rem", textDecoration: "none" }}>
                admin@speh.cc
              </a>
            </div>
          </div>
          <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>
            Response time: typically within 24-48 hours on business days.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", color: "#00ffaa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Your Name <span style={{ color: "#ff0055" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  backgroundColor: "#0a0a14",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#39ff14",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#00ffaa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Email Address <span style={{ color: "#ff0055" }}>*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  backgroundColor: "#0a0a14",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#39ff14",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#00ffaa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Bug Report / Feature Request / General Inquiry"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  backgroundColor: "#0a0a14",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#39ff14",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#00ffaa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                Message <span style={{ color: "#ff0055" }}>*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Describe your question, feedback, or issue in detail..."
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  backgroundColor: "#0a0a14",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  color: "#39ff14",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "0.8rem 2rem",
                backgroundColor: "transparent",
                color: "#39ff14",
                border: "2px solid #39ff14",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#39ff14";
                e.currentTarget.style.color = "#05050a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#39ff14";
              }}
            >
              [ SUBMIT MESSAGE ]
            </button>

            <p style={{ color: "#444", fontSize: "0.75rem", margin: 0 }}>
              By submitting this form, you agree to our Privacy Policy. We will never share your information with third parties.
            </p>
          </form>
        ) : (
          <div style={{ border: "1px solid #00ffaa", borderRadius: "8px", padding: "2rem", backgroundColor: "#001a0a", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</p>
            <h2 style={{ color: "#00ffaa", fontSize: "1.3rem", marginBottom: "0.5rem" }}>Message Received</h2>
            <p style={{ color: "#39ff14", marginBottom: "1rem" }}>
              Thank you for reaching out. We will review your message and respond to <strong>{email}</strong> within 24-48 hours.
            </p>
            <p style={{ color: "#666", fontSize: "0.85rem" }}>
              You can also email us directly at{" "}
              <a href="mailto:admin@speh.cc" style={{ color: "#00ffaa" }}>admin@speh.cc</a>
            </p>
          </div>
        )}

        <div style={{ marginTop: "3rem", padding: "1.5rem", border: "1px solid #222", borderRadius: "8px", backgroundColor: "#0a0a0f" }}>
          <h3 style={{ color: "#ff0055", fontSize: "1rem", marginBottom: "0.8rem" }}>Frequently Asked Questions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
            <div>
              <p style={{ color: "#00ffaa", margin: "0 0 0.2rem" }}>Are the calculators free to use?</p>
              <p style={{ color: "#888", margin: 0 }}>Yes. All tools and calculators on speh.cc are completely free for personal and commercial use.</p>
            </div>
            <div>
              <p style={{ color: "#00ffaa", margin: "0 0 0.2rem" }}>Can I request a new tool or feature?</p>
              <p style={{ color: "#888", margin: 0 }}>Absolutely. Use the contact form above or email us with your suggestion. We review all requests.</p>
            </div>
            <div>
              <p style={{ color: "#00ffaa", margin: "0 0 0.2rem" }}>Is the tax information accurate?</p>
              <p style={{ color: "#888", margin: 0 }}>Our calculators are based on current IRS guidelines and tax code. However, they are for educational purposes only. Always consult a licensed tax professional for your specific situation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}