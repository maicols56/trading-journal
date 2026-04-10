import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import AuthPage from "./AuthPage";
import TradingJournal from "./TradingJournal";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!session) return <AuthPage />;

  return <TradingJournal user={session.user} />;
}