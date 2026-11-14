import { createClient } from "@supabase/supabase-js";
import {
  categories as sampleCategories,
  products as sampleProducts,
  type Product,
} from "@/lib/products";

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  is_active: boolean;
};

function isCategoryRow(value: unknown): value is CategoryRow {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "sort_order" in value &&
    typeof value.sort_order === "number"
  );
}

function isProductRow(value: unknown): value is ProductRow {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "category_id" in value &&
    typeof value.category_id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "unit" in value &&
    typeof value.unit === "string" &&
    "price" in value &&
    typeof value.price === "number" &&
    "stock" in value &&
    typeof value.stock === "number" &&
    "is_active" in value &&
    typeof value.is_active === "boolean"
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url && !publishableKey) {
    return Response.json({
      products: sampleProducts,
      categories: sampleCategories.filter((category) => category !== "Semua"),
      isPreview: true,
    });
  }

  if (!url || !publishableKey) {
    console.error("Supabase URL or publishable key is missing.");
    return Response.json(
      { error: "Katalog Supabase belum dikonfigurasi dengan lengkap." },
      { status: 503 },
    );
  }

  const supabase = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .order("sort_order")
      .order("name"),
    supabase
      .from("products")
      .select("id, category_id, name, unit, price, stock, is_active")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (categoryResult.error || productResult.error) {
    console.error("Public catalog query failed.", {
      categories: categoryResult.error,
      products: productResult.error,
    });
    return Response.json(
      { error: "Katalog belum bisa dimuat dari Supabase." },
      { status: 503 },
    );
  }

  const rawCategories: unknown = categoryResult.data;
  const rawProducts: unknown = productResult.data;
  if (
    !Array.isArray(rawCategories) ||
    !rawCategories.every(isCategoryRow) ||
    !Array.isArray(rawProducts) ||
    !rawProducts.every(isProductRow)
  ) {
    console.error("Supabase returned an invalid catalog response.");
    return Response.json(
      { error: "Data katalog Supabase tidak sesuai." },
      { status: 500 },
    );
  }

  const categoryNameById = new Map(
    rawCategories.map((category) => [category.id, category.name]),
  );
  const publicProducts: Product[] = [];
  for (const product of rawProducts) {
    const category = categoryNameById.get(product.category_id);
    if (category === undefined) {
      console.error("A public product refers to a missing category.");
      return Response.json(
        { error: "Sebagian produk belum memiliki kategori yang tersedia." },
        { status: 500 },
      );
    }

    publicProducts.push({
      id: product.id,
      name: product.name,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
      category,
      mark: product.name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.slice(0, 1))
        .join("")
        .toLocaleUpperCase("id-ID"),
    });
  }

  return Response.json({
    products: publicProducts,
    categories: rawCategories.map((category) => category.name),
    isPreview: false,
  });
}
