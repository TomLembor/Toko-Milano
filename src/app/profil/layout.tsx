import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil | Toko Milano",
  description: "Data profil pelanggan Toko Milano.",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
