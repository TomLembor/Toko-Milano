import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { StorefrontStateProvider } from "./storefront-state";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="id" className={oswald.variable}>
      <body>
        <StorefrontStateProvider>{children}</StorefrontStateProvider>
      </body>
    </html>
  );
}
