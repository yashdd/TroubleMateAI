import React from 'react';

export default function HomePage() {
  return (
    <div className="home-bg">
      <main className="home-container">
        <section className="hero">
          <h1 className="hero-title">TroubleMateAI</h1>
          <p className="hero-desc">
            Your all-in-one AI assistant for error analysis, DevOps support, and instant troubleshooting.
          </p>
        </section>
        <section className="features">
          <div className="feature-card">
            <h2>🚦 Instant Error Analysis</h2>
            <p>Paste error logs or stack traces and get AI-driven root cause identification and fix suggestions.</p>
          </div>
          <div className="feature-card">
            <h2>💬 DevOps Chat Support</h2>
            <p>Ask questions about deployments, configurations, monitoring, and troubleshooting to get instant expert guidance.</p>
          </div>
          <div className="feature-card">
            <h2>🏢 Company-Specific Knowledge</h2>
            <p>Leverages internal Slack, Jira, and runbooks for contextualized solutions.</p>
          </div>
          <div className="feature-card">
            <h2>⚡ Smart Caching</h2>
            <p>Uses Redis to cache repeated errors and deliver instant responses.</p>
          </div>
          <div className="feature-card">
            <h2>🖥️ Clean Web Interface</h2>
            <p>Simple and intuitive UI built with Next.js and TypeScript.</p>
          </div>
        </section>
      </main>
      <style jsx>{`
        .home-bg {
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 60px;
          background: linear-gradient(135deg, #f6f7fb 0%, #e0e7ff 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .home-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .hero-title {
          font-size: 2.8rem;
          font-weight: bold;
          background: linear-gradient(90deg, #3b82f6, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.7rem;
        }
        .hero-desc {
          font-size: 1.25rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        .features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          width: 100%;
        }
        .feature-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
          padding: 1.5rem 1.2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-height: 120px;
        }
        .feature-card h2 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #3b82f6, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .feature-card p {
          color: #4b5563;
          font-size: 1rem;
        }
        @media (max-width: 800px) {
          .features {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 500px) {
          .home-bg {
            padding-top: 90px;
            padding-bottom: 30px;
          }
          .hero-title {
            font-size: 2rem;
          }
          .features {
            gap: 1rem;
          }
          .feature-card {
            padding: 1rem 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}