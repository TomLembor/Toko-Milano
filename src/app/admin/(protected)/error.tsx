"use client";

export default function AdminProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="admin-main" id="admin-main">
      <div className="admin-empty-state" role="alert">
        <h1>Data produk belum bisa dimuat</h1>
        <p>Periksa koneksi Supabase, lalu coba lagi.</p>
        <button
          className="admin-secondary-button"
          type="button"
          onClick={reset}
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
