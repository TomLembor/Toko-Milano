"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  isProduct,
  type Category,
  type Product,
} from "@/lib/products";

type Profile = {
  name: string;
  whatsapp: string;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const emptyProfile: Profile = { name: "", whatsapp: "" };

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogState, setCatalogState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const cartDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      setCatalogState("loading");
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Catalog request failed.");

        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every(isProduct)) {
          throw new Error("Catalog response is invalid.");
        }

        setCatalog(payload);
        setCatalogState("ready");
      } catch {
        if (controller.signal.aborted) return;
        setCatalogState("error");
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [catalogAttempt]);

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem("toko-milano-profile");
      if (savedProfile) {
        const parsedProfile: unknown = JSON.parse(savedProfile);
        if (
          typeof parsedProfile === "object" &&
          parsedProfile !== null &&
          "name" in parsedProfile &&
          "whatsapp" in parsedProfile &&
          typeof parsedProfile.name === "string" &&
          typeof parsedProfile.whatsapp === "string"
        ) {
          setProfile({
            name: parsedProfile.name,
            whatsapp: parsedProfile.whatsapp,
          });
        } else {
          setProfileMessage("Data profil tersimpan tidak dapat dibaca.");
        }
      }
    } catch {
      setProfileMessage("Profil tidak dapat dimuat dari penyimpanan perangkat.");
    } finally {
      setProfileReady(true);
    }
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return catalog.filter((product) => {
      const matchesCategory =
        activeCategory === "Semua" || product.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLocaleLowerCase("id-ID").includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, catalog, query]);

  const cartItems = catalog
    .filter((product) => (quantities[product.id] ?? 0) > 0)
    .map((product) => ({
      ...product,
      quantity: quantities[product.id],
    }));
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const whatsappNumber = (process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "").replace(
    /\D/g,
    "",
  );
  const whatsappMessage = [
    "Halo Toko Milano, saya ingin menanyakan pesanan.",
    "",
    ...cartItems.map(
      (item) =>
        `- ${item.name} (${item.quantity}x): ${formatPrice(item.price * item.quantity)}`,
    ),
    "",
    `Subtotal contoh: ${formatPrice(subtotal)}`,
    profile.name ? `Nama: ${profile.name}` : "",
    profile.whatsapp ? `No. WhatsApp: ${profile.whatsapp}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : undefined;

  function changeQuantity(product: Product, change: number) {
    setQuantities((current) => {
      const nextQuantity = Math.max(
        0,
        Math.min(product.stock, (current[product.id] ?? 0) + change),
      );
      return { ...current, [product.id]: nextQuantity };
    });
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(
        "toko-milano-profile",
        JSON.stringify(profile),
      );
      setProfileMessage("Profil tersimpan di perangkat ini.");
    } catch {
      setProfileMessage("Profil tidak dapat disimpan di perangkat ini.");
    }
  }

  return (
    <>
      <div className="preview-notice">
        <p>
          Pratinjau toko: produk, harga, dan stok di halaman ini adalah contoh.
        </p>
      </div>

      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="Toko Milano, ke beranda">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>
            <strong>Toko Milano</strong>
            <small>Kebutuhan harian</small>
          </span>
        </a>
        <p className="store-status">
          <span className="status-mark" aria-hidden="true" />
          Status toko belum diatur
        </p>
      </header>

      <main id="beranda">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker">Belanja dekat, belanja secukupnya</p>
            <h1 id="hero-title">Kebutuhan rumah, ada di dekat sini.</h1>
            <p className="hero-description">
              Lihat katalog Toko Milano dan susun belanjaan harian Anda.
            </p>
            <a className="primary-link" href="#etalase">
              Lihat katalog
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="hero-sun" />
            <div className="market-bag">
              <span className="bag-handle" />
              <span className="bag-label">MILANO</span>
              <span className="bag-product bag-product-one" />
              <span className="bag-product bag-product-two" />
              <span className="bag-product bag-product-three" />
            </div>
            <p>Isi dapur, mulai dari yang perlu.</p>
          </div>
        </section>

        <section className="delivery-note" aria-label="Informasi pengiriman">
          <span className="delivery-icon" aria-hidden="true">
            10
          </span>
          <p>
            Aturan toko: gratis ongkir hingga 10 km. Penghitungan jarak belum
            aktif di pratinjau ini.
          </p>
        </section>

        <section className="catalog-section" id="etalase">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Etalase</p>
              <h2>Pilih yang dibutuhkan</h2>
            </div>
            <p className="sample-label">Katalog contoh</p>
          </div>

          <search className="catalog-tools" aria-label="Cari dan pilih produk">
            <label className="search-field">
              <span>Cari barang</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Contoh: beras"
              />
            </label>
            <div className="category-area">
              <p id="category-label">Kategori</p>
              <div className="category-list" aria-labelledby="category-label">
                {categories.map((category) => (
                  <button
                    className="category-button"
                    type="button"
                    key={category}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </search>

          {catalogState === "loading" ? (
            <p className="catalog-status" role="status" aria-live="polite">
              Memuat katalog contoh...
            </p>
          ) : catalogState === "error" ? (
            <div className="empty-state" role="alert">
              <h3>Katalog belum bisa dimuat</h3>
              <p>Periksa koneksi lalu coba muat katalog lagi.</p>
              <button
                className="text-button"
                type="button"
                onClick={() => setCatalogAttempt((attempt) => attempt + 1)}
              >
                Coba lagi
              </button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <ul className="product-grid" aria-live="polite">
              {visibleProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <li className="product-card" key={product.id}>
                    <div className="product-placeholder" aria-hidden="true">
                      <span className="placeholder-mark">{product.mark}</span>
                      <span className="placeholder-caption">
                        Foto belum tersedia
                      </span>
                    </div>
                    <div className="product-info">
                      <p className="product-category">{product.category}</p>
                      <h3>{product.name}</h3>
                      <p className="product-unit">{product.unit}</p>
                      <p className="product-stock">
                        {product.stock > 0
                          ? `Stok contoh: ${product.stock}`
                          : "Habis"}
                      </p>
                      <div className="product-buy-row">
                        <p className="product-price">
                          {formatPrice(product.price)}
                        </p>
                        {quantity > 0 ? (
                          <div
                            className="quantity-control"
                            aria-label={`Jumlah ${product.name}`}
                          >
                            <button
                              className="quantity-button"
                              type="button"
                              aria-label={`Kurangi ${product.name}`}
                              onClick={() => changeQuantity(product, -1)}
                            >
                              −
                            </button>
                            <span aria-live="polite">{quantity}</span>
                            <button
                              className="quantity-button"
                              type="button"
                              aria-label={`Tambah ${product.name}`}
                              disabled={quantity >= product.stock}
                              onClick={() => changeQuantity(product, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-button"
                            type="button"
                            disabled={product.stock === 0}
                            aria-label={`Tambah ${product.name} ke keranjang`}
                            onClick={() => changeQuantity(product, 1)}
                          >
                            {product.stock > 0 ? "Tambah" : "Habis"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-state" role="status">
              <h3>Barang belum ditemukan</h3>
              <p>
                Coba kata pencarian lain atau pilih kategori yang berbeda.
              </p>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("Semua");
                }}
              >
                Tampilkan semua contoh barang
              </button>
            </div>
          )}
        </section>

        <section className="orders-section" id="pesanan">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Pesanan</p>
              <h2>Riwayat belanja</h2>
            </div>
          </div>
          <div className="empty-state orders-empty">
            <h3>Belum ada riwayat pesanan</h3>
            <p>
              Riwayat pesanan akan tersedia setelah toko terhubung ke sistem
              pemesanan.
            </p>
          </div>
        </section>

        <section className="profile-section" id="profil">
          <div className="profile-intro">
            <p className="section-kicker">Profil</p>
            <h2>Data untuk pesanan Anda</h2>
            <p>
              Simpan nama dan nomor WhatsApp di perangkat ini agar mudah diisi
              saat pemesanan tersedia.
            </p>
          </div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              Nama lengkap
              <input
                type="text"
                autoComplete="name"
                value={profile.name}
                disabled={!profileReady}
                onChange={(event) => {
                  setProfile({ ...profile, name: event.target.value });
                  setProfileMessage("");
                }}
              />
            </label>
            <label>
              Nomor WhatsApp
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={profile.whatsapp}
                disabled={!profileReady}
                onChange={(event) => {
                  setProfile({ ...profile, whatsapp: event.target.value });
                  setProfileMessage("");
                }}
              />
            </label>
            <button
              className="save-button"
              type="submit"
              disabled={!profileReady}
            >
              Simpan profil
            </button>
            <p className="form-message" role="status" aria-live="polite">
              {profileReady
                ? profileMessage
                : "Memuat profil dari perangkat..."}
            </p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <p>Toko Milano</p>
        <p>Harga dan ketersediaan perlu dikonfirmasi ke toko.</p>
      </footer>

      {itemCount > 0 && (
        <aside className="cart-bar" aria-label="Ringkasan keranjang">
          <p>
            <strong>{itemCount} barang</strong>
            <span>{formatPrice(subtotal)}</span>
          </p>
          <button
            className="cart-open-button"
            type="button"
            onClick={() => cartDialog.current?.showModal()}
          >
            Lihat keranjang
          </button>
        </aside>
      )}

      <nav className="bottom-nav" aria-label="Navigasi utama">
        <a href="#etalase">
          <span className="nav-symbol" aria-hidden="true">
            E
          </span>
          Etalase
        </a>
        <a href="#pesanan">
          <span className="nav-symbol" aria-hidden="true">
            P
          </span>
          Pesanan
        </a>
        <a href="#profil">
          <span className="nav-symbol" aria-hidden="true">
            D
          </span>
          Profil
        </a>
      </nav>

      <dialog
        className="cart-dialog"
        ref={cartDialog}
        aria-labelledby="cart-title"
      >
        <form method="dialog" className="dialog-heading">
          <div>
            <p className="section-kicker">Keranjang contoh</p>
            <h2 id="cart-title">Belanjaan Anda</h2>
          </div>
          <button
            className="dialog-close"
            type="submit"
            aria-label="Tutup keranjang"
          >
            Tutup
          </button>
        </form>
        {cartItems.length > 0 ? (
          <>
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li className="cart-item" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p>{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <span>Subtotal contoh</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {whatsappHref ? (
              <a
                className="checkout-link"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                Tanyakan pesanan via WhatsApp
              </a>
            ) : (
              <div className="checkout-unavailable">
                <strong>WhatsApp toko belum diatur</strong>
                <p>
                  Tambahkan nomor toko sebelum mengaktifkan pemesanan. Pesanan
                  belum dikirim atau disimpan.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h3>Keranjang masih kosong</h3>
            <p>Pilih barang dari etalase untuk mulai menyusun belanjaan.</p>
          </div>
        )}
      </dialog>
    </>
  );
}
