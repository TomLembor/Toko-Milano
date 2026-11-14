"use server";

import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "../action-state";

export async function signInAdmin(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (getSupabaseConfigStatus() !== "ready") {
    return {
      status: "error",
      message: "Panel belum terhubung ke Supabase. Lengkapi environment variable.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { status: "error", message: "Masukkan email dan kata sandi." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Email atau kata sandi tidak cocok.",
    };
  }

  const access = await getAdminAccess();
  if (!access.isAdmin) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Non-admin sign-out failed after login.", signOutError);
      throw new Error("Akun tidak memiliki akses admin dan sesi gagal ditutup.");
    }
    return {
      status: "error",
      message: "Akun ini belum diberi akses admin.",
    };
  }

  redirect("/admin");
}
