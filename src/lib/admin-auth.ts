import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const unauthenticated = {
    supabase,
    isAuthenticated: false,
    isAdmin: false,
  };
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return unauthenticated;
    }

    console.error("Admin session verification failed.", error);
    throw new Error("The admin session could not be verified.");
  }

  const claims = data?.claims;
  if (!claims || typeof claims.sub !== "string") return unauthenticated;

  const metadata = claims.app_metadata;
  const isAdmin =
    typeof metadata === "object" &&
    metadata !== null &&
    "role" in metadata &&
    metadata.role === "admin";

  return {
    supabase,
    isAuthenticated: true,
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
