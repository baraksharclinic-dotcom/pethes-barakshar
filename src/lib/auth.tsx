import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { session: Session | null; isAdmin: boolean; loading: boolean };
const Ctx = createContext<AuthState>({ session: null, isAdmin: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isAdmin: false, loading: true });

  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let revision = 0;
    let disposed = false;
    const load = async (session: Session | null) => {
      const current = ++revision;
      // Publish the new identity before role lookup; stale lookups must never restore an old session.
      setState({ session, isAdmin: false, loading: !!session });
      let isAdmin = false;
      if (session) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        isAdmin = !!data;
      }
      if (!disposed && current === revision) setState({ session, isAdmin, loading: false });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // No awaited Supabase calls inside the auth callback (the SDK holds its auth lock).
      setState({ session, isAdmin: false, loading: !!session });
      ++revision;
      setTimeout(() => {
        if (disposed) return;
        void load(session);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
      }, 0);
    });
    // INITIAL_SESSION is delivered by the single subscriber; no competing initial session read.
    return () => { disposed = true; ++revision; sub.subscription.unsubscribe(); };
  }, [queryClient, router]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
