import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function RegisterForm({ onRegister }: { onRegister: () => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Name is required');
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 18) return setError('Valid age (18+) is required');
    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, age: Number(age) } }
    });
    setLoading(false);
    if (error) return setError(error.message);
    onRegister();
  };

  return (
    <div className="register-bg">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="register-title">Create your account</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="number"
          placeholder="Age (18+)"
          value={age}
          onChange={e => setAge(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="register-input"
          required
        />
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="register-error">{error}</p>}
        
        <div className="register-footer">
          <p>Already have an account? <a href="/login" className="register-link">Sign in</a></p>
        </div>
      </form>
      <style>{`
        .register-bg {
          min-height: 100vh;
          padding-top: 260px;
          padding-bottom: 80px;
          background: transparent;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .register-card {
          background: #f6f7fb;
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10);
          padding: 2.5rem 2.5rem;
          width: 100%;
          max-width: 480px;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          align-items: stretch;
          transform: scale(0.96);
        }
        .register-title {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #3b82f6, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .register-input {
          padding: 1.1rem 1.2rem;
          border-radius: 0.75rem;
          border: 2px solid #e5e7eb;
          font-size: 1.08rem;
          background: #f7f8fa;
          transition: border 0.2s;
          margin-bottom: 0.1rem;
        }
        .register-input:focus {
          border-color: #9333ea;
          outline: none;
        }
        .register-btn {
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
        .register-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
          transform: scale(1.03);
        }
        .register-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .register-error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.98rem;
        }
        .register-footer {
          text-align: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .register-footer p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }
        .register-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .register-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .register-bg {
            padding-top: 300px;
            padding-bottom: 120px;
          }
          .register-card {
            padding: 1.2rem 0.5rem;
            max-width: 98vw;
            min-width: 0;
          }
          .register-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}