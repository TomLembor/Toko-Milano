"use server";

import { revalidatePath } from "next/cache";
import { getAdminAccess } from "@/lib/admin-auth";
import type { AdminActionState } from "./action-state";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getInteger(formData: FormData, key: string) {
  const value = getText(formData, key);
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function isUuid(value: string) {
  return /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

function databaseError(message: string, error: unknown) {
  console.error(message, error);
  return {
    status: "error" as const,
    message: "Perubahan belum tersimpan. Periksa data lalu coba lagi.",
  };
}

async function getAuthorizedClient() {
  const access = await getAdminAccess();
  return access.isAdmin ? access.supabase : null;
}

export async function createCategory(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAuthorizedClient();
  if (!supabase) {
    return { status: "error", message: "Sesi admin tidak valid. Masuk lagi." };
  }

  const name = getText(formData, "name");
  if (!name || name.length > 80 || name.toLocaleLowerCase("id-ID") === "semua") {
    return {
      status: "error",
      message: "Nama kategori wajib diisi, maksimal 80 karakter, dan tidak boleh Semua.",
    };
  }

  const { error } = await supabase.from("categories").insert({ name });
  if (error?.code === "23505") {
    return { status: "error", message: "Kategori dengan nama itu sudah ada." };
  }
  if (error) return databaseError("Category creation failed.", error);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/products");
  return { status: "success", message: "Kategori berhasil ditambahkan." };
}

export async function updateCategory(
  categoryId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAuthorizedClient();
  if (!supabase) {
    return { status: "error", message: "Sesi admin tidak valid. Masuk lagi." };
  }

  const name = getText(formData, "name");
  if (
    !isUuid(categoryId) ||
    !name ||
    name.length > 80 ||
    name.toLocaleLowerCase("id-ID") === "semua"
  ) {
    return {
      status: "error",
      message: "Nama kategori wajib diisi, maksimal 80 karakter, dan tidak boleh Semua.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", categoryId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") {
    return { status: "error", message: "Kategori dengan nama itu sudah ada." };
  }
  if (error) return databaseError("Category update failed.", error);
  if (!data) {
    return { status: "error", message: "Kategori tidak ditemukan." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/products");
  return { status: "success", message: "Nama kategori diperbarui." };
}

export async function createProduct(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAuthorizedClient();
  if (!supabase) {
    return { status: "error", message: "Sesi admin tidak valid. Masuk lagi." };
  }

  const name = getText(formData, "name");
  const unit = getText(formData, "unit");
  const categoryId = getText(formData, "category_id");
  const price = getInteger(formData, "price");
  const stock = getInteger(formData, "stock");

  if (
    !name ||
    name.length > 120 ||
    !unit ||
    unit.length > 40 ||
    !isUuid(categoryId) ||
    price === null ||
    stock === null
  ) {
    return {
      status: "error",
      message: "Lengkapi nama, kategori, satuan, harga, dan stok dengan benar.",
    };
  }

  const { error } = await supabase.from("products").insert({
    name,
    unit,
    category_id: categoryId,
    price,
    stock,
  });
  if (error) return databaseError("Product creation failed.", error);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/products");
  return { status: "success", message: "Produk berhasil ditambahkan." };
}

export async function updateProduct(
  productId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const supabase = await getAuthorizedClient();
  if (!supabase) {
    return { status: "error", message: "Sesi admin tidak valid. Masuk lagi." };
  }

  const name = getText(formData, "name");
  const unit = getText(formData, "unit");
  const categoryId = getText(formData, "category_id");
  const price = getInteger(formData, "price");
  const stock = getInteger(formData, "stock");

  if (
    !isUuid(productId) ||
    !name ||
    name.length > 120 ||
    !unit ||
    unit.length > 40 ||
    !isUuid(categoryId) ||
    price === null ||
    stock === null
  ) {
    return {
      status: "error",
      message: "Lengkapi nama, kategori, satuan, harga, dan stok dengan benar.",
    };
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      unit,
      category_id: categoryId,
      price,
      stock,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) return databaseError("Product update failed.", error);
  if (!data) {
    return { status: "error", message: "Produk tidak ditemukan." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/products");
  return { status: "success", message: "Perubahan produk tersimpan." };
}

export async function signOutAdmin() {
  const access = await getAdminAccess();
  if (access.isAuthenticated) {
    const { error } = await access.supabase.auth.signOut();
    if (error) {
      console.error("Admin sign-out failed.", error);
      throw new Error("Sesi admin tidak dapat ditutup.");
    }
  }

  revalidatePath("/", "layout");
}
