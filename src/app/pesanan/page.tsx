import type { Metadata } from "next";
import { StoreShell } from "../store-shell";

export const metadata: Metadata = {
  title: "Pesanan | Toko Milano",
  description: "Riwayat pesanan Toko Milano.",
};

export default function OrdersPage() {
  return (
    <StoreShell activePage="pesanan">
      <main>
        <section className="orders-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Pesanan</p>
              <h1>Riwayat belanja</h1>
            </div>
          </div>
          <div className="empty-state orders-empty">
            <h2>Belum ada riwayat pesanan</h2>
            <p>
              Riwayat pesanan akan tersedia setelah toko terhubung ke sistem
              pemesanan.
            </p>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
