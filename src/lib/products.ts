export type Category =
  | "Semua"
  | "Sembako"
  | "Minuman"
  | "Makanan ringan"
  | "Mandi & cuci"
  | "Bumbu dapur"
  | "Obat & lainnya";

export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  category: Exclude<Category, "Semua">;
  mark: string;
};

export const categories: Category[] = [
  "Semua",
  "Sembako",
  "Minuman",
  "Makanan ringan",
  "Mandi & cuci",
  "Bumbu dapur",
  "Obat & lainnya",
];

export const products: Product[] = [
  {
    id: "beras",
    name: "Beras Ramos",
    unit: "5 kg",
    price: 72000,
    stock: 8,
    category: "Sembako",
    mark: "Br",
  },
  {
    id: "minyak",
    name: "Minyak goreng pouch",
    unit: "1 L",
    price: 17000,
    stock: 5,
    category: "Sembako",
    mark: "Mg",
  },
  {
    id: "telur",
    name: "Telur ayam",
    unit: "1 butir",
    price: 2500,
    stock: 14,
    category: "Sembako",
    mark: "Ta",
  },
  {
    id: "teh",
    name: "Teh melati",
    unit: "1 bungkus",
    price: 8000,
    stock: 6,
    category: "Minuman",
    mark: "Tm",
  },
  {
    id: "keripik",
    name: "Keripik singkong",
    unit: "1 bungkus",
    price: 9000,
    stock: 0,
    category: "Makanan ringan",
    mark: "Ks",
  },
  {
    id: "sabun",
    name: "Sabun mandi",
    unit: "1 batang",
    price: 4500,
    stock: 7,
    category: "Mandi & cuci",
    mark: "Sm",
  },
];

export function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "unit" in value &&
    typeof value.unit === "string" &&
    "price" in value &&
    typeof value.price === "number" &&
    "stock" in value &&
    typeof value.stock === "number" &&
    "category" in value &&
    typeof value.category === "string" &&
    "mark" in value &&
    typeof value.mark === "string"
  );
}
