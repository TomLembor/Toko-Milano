import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return { supabase, isAuthenticated: false, isAdmin: false };
    }

    console.error("Admin session verification failed.", error);
    throw new Error("The admin session could not be verified.");
  }

  if (!data?.claims) {
    console.error("Admin session verification returned no claims.");
    throw new Error("The admin session could not be verified.");
  }

  const claims = data.claims;
  const metadata = claims.app_metadata;
  const isAdmin =
    typeof metadata === "object" &&
    metadata !== null &&
    "role" in metadata &&
    metadata.role === "admin";

  return {
    supabase,
    isAuthenticated: typeof claims.sub === "string",
    isAdmin,
  };
}

export async function requireAdmin() {
  const access = await getAdminAccess();

  if (!access.isAuthenticated || !access.isAdmin) {
    redirect("/admin/login");
  }

  return access.supabase;
}
