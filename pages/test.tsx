import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function TestPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("❌ Supabase auth error:", error);
      } else {
        console.log("✅ User:", data.user);
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test</h1>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>No user session found</p>
      )}
    </div>
  );
}
