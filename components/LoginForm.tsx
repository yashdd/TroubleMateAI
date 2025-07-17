import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function LoginForm({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to your TroubleMateAI account</p>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {error && <p className="login-error">{error}</p>}
        <div className="login-footer">
          <p>Don't have an account? <a href="/register" className="login-link">Sign up</a></p>
        </div>
      </form>
      <style jsx>{`
        .login-bg {
          min-height: 100vh;
          padding-top: 120px;
          padding-bottom: 80px;
          background: transparent;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .login-card {
          background: #f6f7fb;
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10);
          padding: 2.5rem 2.5rem;
          width: 100%;
          max-width: 420px;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          align-items: stretch;
          transform: scale(0.96);
        }
        .login-title {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
          background: linear-gradient(90deg, #3b82f6, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
        }
        .login-input {
          padding: 1.1rem 1.2rem;
          border-radius: 0.75rem;
          border: 2px solid #e5e7eb;
          font-size: 1.08rem;
          background: #f7f8fa;
          transition: border 0.2s;
          margin-bottom: 0.1rem;
        }
        .login-input:focus {
          border-color: #9333ea;
          outline: none;
        }
        .login-btn {
          background: linear-gradient(90deg, #3b82f6 0%, #9333ea 100%);
          color: white;
          font-weight: 600;
          padding: 1.1rem 0;
          border-radius: 0.75rem;
          border: none;
          font-size: 1.15rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s, transform 0.1s;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
          transform: scale(1.03);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.98rem;
        }
        .login-footer {
          text-align: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .login-footer p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }
        .login-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .login-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .login-bg {
            padding-top: 140px;
            padding-bottom: 120px;
          }
          .login-card {
            padding: 1.2rem 0.5rem;
            max-width: 98vw;
            min-width: 0;
          }
          .login-title {
            font-size: 1.3rem;
          }
          .login-subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
} 