import Link from "next/link";
import type { ReactNode } from "react";

export type StorePage = "etalase" | "pesanan" | "profil";
type StoreIconName = "basket" | "receipt" | "profile" | "pin";

const navigation: {
  id: StorePage;
  label: string;
  icon: StoreIconName;
  href: string;
}[] = [
  { id: "etalase", label: "Etalase", icon: "basket", href: "/" },
  { id: "pesanan", label: "Pesanan", icon: "receipt", href: "/pesanan" },
  { id: "profil", label: "Profil", icon: "profile", href: "/profil" },
];

export function StoreIcon({
  name,
  className,
}: {
  name: StoreIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "basket" && (
        <>
          <path d="M3.5 9.5h17l-1.6 11H5.1l-1.6-11Z" />
          <path d="m7 9.5 2-6m8 6-2-6M9 13v4m6-4v4" />
        </>
      )}
      {name === "receipt" && (
        <>
          <path d="M5 3h14v18l-3.5-2-3.5 2-3.5-2L5 21V3Z" />
          <path d="M8.5 8h7m-7 4h7m-7 4h4" />
        </>
      )}
      {name === "profile" && (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 21c0-4.1 3.1-6.5 7.5-6.5s7.5 2.4 7.5 6.5" />
        </>
      )}
      {name === "pin" && (
        <>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      )}
    </svg>
  );
}

export function StoreShell({
  activePage,
  children,
}: {
  activePage: StorePage;
  children: ReactNode;
}) {
  return (
    <div className="store-app">
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
            <span className="nav-icon">
              <StoreIcon name={item.icon} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
