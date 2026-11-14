import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Milano | Belanja Kebutuhan Harian",
  description: "Katalog kebutuhan harian Toko Milano.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
