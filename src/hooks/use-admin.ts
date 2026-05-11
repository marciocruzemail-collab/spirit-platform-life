import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdmin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const check = async (uid: string | null) => {
      if (!uid) {
        if (active) { setIsAdmin(false); setUserId(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (active) { setIsAdmin(!!data); setUserId(uid); setLoading(false); }
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoading(true);
      check(session?.user.id ?? null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return { isAdmin, loading, userId };
}
