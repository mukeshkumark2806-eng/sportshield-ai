import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u && u.id !== 'demo') fetchProfile(u.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u && u.id !== 'demo') fetchProfile(u.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    // Demo override (if someone uses the demo button without real keys)
    if (email === 'admin@sportshield.ai' && password === 'demo123') {
      const demoUser = { id: 'demo', email, user_metadata: { displayName: 'Demo Admin' }, role: 'broadcaster_admin' };
      setUser(demoUser);
      return demoUser;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName: name } }
    });
    if (error) throw error;

    // Upsert into public.profiles table for name/role/company
    if (data.user) {
      await supabase.from('profiles').upsert({
        id:           data.user.id,
        email:        email,
        display_name: name,
        role:         'broadcaster_admin',
        organization: 'SportShield Broadcasting',
      });
      await fetchProfile(data.user.id);
    }

    return data.user;
  };

  const logout = async () => {
    if (user?.id === 'demo') {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
