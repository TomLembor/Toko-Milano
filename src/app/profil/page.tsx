"use client";

import { StoreShell } from "../store-shell";
import { useStorefrontState } from "../storefront-state";

export default function ProfilePage() {
  const {
    profile,
    setProfile,
    profileReady,
    profileMessage,
    setProfileMessage,
    saveProfile,
  } = useStorefrontState();

  return (
    <StoreShell activePage="profil">
      <main>
        <section className="profile-section">
          <div className="profile-intro">
            <p className="section-kicker">Profil</p>
            <h1>Data untuk pesanan Anda</h1>
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
    </StoreShell>
  );
}
