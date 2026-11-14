import Link from "next/link";
import type { ReactNode } from "react";

export type StorePage = "etalase" | "pesanan" | "profil";

const navigation: {
  id: StorePage;
  label: string;
  symbol: string;
  href: string;
}[] = [
  { id: "etalase", label: "Etalase", symbol: "E", href: "/" },
  { id: "pesanan", label: "Pesanan", symbol: "P", href: "/pesanan" },
  { id: "profil", label: "Profil", symbol: "D", href: "/profil" },
];

export function StoreShell({
  activePage,
  children,
}: {
  activePage: StorePage;
  children: ReactNode;
}) {
  return (
    <>
      {activePage === "etalase" && (
        <div className="preview-notice">
          <p>
            Pratinjau toko: produk, harga, dan stok di halaman ini adalah contoh.
          </p>
        </div>
      )}

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Toko Milano, ke beranda">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>
            <strong>Toko Milano</strong>
            <small>Kebutuhan harian</small>
          </span>
        </Link>
        <p className="store-status">
          <span className="status-mark" aria-hidden="true" />
          Status toko belum diatur
        </p>
      </header>

      {children}

      <footer className="site-footer">
        <p>Toko Milano</p>
        <p>Harga dan ketersediaan perlu dikonfirmasi ke toko.</p>
      </footer>

      <nav className="bottom-nav" aria-label="Navigasi utama">
        {navigation.map((item) => (
          <Link
            href={item.href}
            key={item.id}
            aria-current={activePage === item.id ? "page" : undefined}
          >
            <span className="nav-symbol" aria-hidden="true">
              {item.symbol}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
