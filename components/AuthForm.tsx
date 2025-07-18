import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import React from 'react';

export default function AuthForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    let authResponse:any;

    if (isLogin) {
      // ✅ Login flow
      authResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      // ✅ Signup flow
      authResponse = await supabase.auth.signUp({
        email,
        password,
      });
    }

    const { error: authError } = authResponse;

    if (authError) {
      setError(authError.message);
    } else {
      onLogin(); // 🔁 Navigate to chat
    }

  } catch (err: any) {
    console.error('Unexpected error:', err);
    setError('An unexpected error occurred.');
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input type="email" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </form>
  );
}
