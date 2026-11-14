export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabaseConfigStatus(): "missing" | "partial" | "ready" {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasPublishableKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  if (hasUrl && hasPublishableKey) return "ready";
  if (hasUrl || hasPublishableKey) return "partial";
  return "missing";
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to connect Supabase.",
    );
  }

  return { url, publishableKey };
}
