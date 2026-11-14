import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Admin | Toko Milano",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const configStatus = getSupabaseConfigStatus();

  if (configStatus === "ready") {
    const access = await getAdminAccess();
    if (access.isAdmin) redirect("/admin");
  }

  return (
    <div className="admin-login-layout">
      <header className="admin-header">
        <Link className="admin-brand" href="/">
          <span className="admin-brand-mark" aria-hidden="true">
            M
          </span>
          <span>
            <strong>Toko Milano</strong>
            <small>Panel admin</small>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Navigasi">
          <Link href="/">Lihat etalase</Link>
        </nav>
      </header>
      <main className="admin-login-page">
        <section
          className="admin-login-panel"
          aria-labelledby="admin-login-title"
        >
          <p className="admin-kicker">Akses pemilik toko</p>
          <h1 id="admin-login-title">Masuk ke panel admin</h1>
          <p className="admin-login-description">
            Kelola produk, kategori, harga, dan stok etalase.
          </p>

          {configStatus === "ready" ? (
            <LoginForm />
          ) : (
            <div className="admin-setup-notice" role="status">
              <strong>Supabase belum siap digunakan.</strong>
              <p>
                {configStatus === "missing"
                  ? "Tambahkan kedua variabel ini di environment deployment:"
                  : "Lengkapi kedua variabel ini di environment deployment:"}
              </p>
              <ul className="admin-setup-variables">
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_URL</code>
                </li>
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
                </li>
              </ul>
            </div>
          )}
        </section>
      </main>
      <footer className="admin-footer">
        <p>Toko Milano</p>
      </footer>
    </div>
  );
}
