
import { useRouter } from 'next/router';
import React from 'react';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <RegisterForm onRegister={() => router.push('chat')} />
    </div>
  );
}