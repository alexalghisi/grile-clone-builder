import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
}

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const env = isPaymentsConfigured() ? getStripeEnvironment() : "sandbox";

    async function load(uid: string | null) {
      if (!uid) {
        if (mounted) { setSub(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("id, status, price_id, current_period_end, cancel_at_period_end, stripe_customer_id")
        .eq("user_id", uid)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mounted) { setSub((data as any) ?? null); setLoading(false); }
    }

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      load(uid);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      load(uid);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const isActive = !!sub && (
    (["active", "trialing", "past_due"].includes(sub.status) &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date()))
    || (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date())
  );

  return { loading, subscription: sub, isActive: !!isActive, userId };
}