import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { signOutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Panel Admin | Toko Milano",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function SupabaseSetupNotice({
  partial,
}: {
  partial: boolean;
}) {
  return (
    <div className="admin-shell">
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
          <Link href="/admin/login">Masuk admin</Link>
        </nav>
      </header>
      <main className="admin-setup-page">
        <section
          className="admin-setup-notice"
          aria-labelledby="admin-setup-title"
        >
          <h1 id="admin-setup-title">Panel admin belum terhubung</h1>
          <p>
            {partial
              ? "Lengkapi kedua variabel ini pada environment aplikasi:"
              : "Atur kedua variabel ini pada environment aplikasi:"}
          </p>
          <ul className="admin-setup-variables">
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
            </li>
          </ul>
        </section>
      </main>
      <footer className="admin-footer">
        <p>Toko Milano</p>
      </footer>
    </div>
  );
}

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configStatus = getSupabaseConfigStatus();
  if (configStatus !== "ready") {
    return <SupabaseSetupNotice partial={configStatus === "partial"} />;
  }

  const access = await getAdminAccess();
  if (!access.isAuthenticated || !access.isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <a className="admin-skip-link" href="#admin-main">
        Lewati ke konten
      </a>
      <header className="admin-header">
        <Link className="admin-brand" href="/admin">
          <span className="admin-brand-mark" aria-hidden="true">
            M
          </span>
          <span>
            <strong>Toko Milano</strong>
            <small>Panel admin</small>
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Navigasi admin">
          <Link href="/admin" aria-current="page">
            Produk
          </Link>
          <Link href="/">Lihat etalase</Link>
          <form action={signOutAdmin}>
            <button type="submit">Keluar</button>
          </form>
        </nav>
      </header>
      {children}
      <footer className="admin-footer">
        <p>Toko Milano</p>
        <p>Panel pengelolaan katalog</p>
      </footer>
    </div>
  );
}
