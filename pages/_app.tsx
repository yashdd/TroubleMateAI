import React from 'react';
import type { AppProps } from 'next/app';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Navbar />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp; 