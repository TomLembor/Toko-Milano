import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { CategoryForm } from "./category-form";
import { CategoryRow } from "./category-row";
import { ProductForm } from "./product-form";
import { ProductRow } from "./product-row";

export const metadata: Metadata = {
  title: "Produk | Panel Admin Toko Milano",
};

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  is_active: boolean;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function AdminProductsPage() {
  const supabase = await requireAdmin();
  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, sort_order")
      .order("sort_order")
      .order("name"),
    supabase
      .from("products")
      .select("id, category_id, name, unit, price, stock, is_active")
      .order("name"),
  ]);

  if (categoryResult.error) {
    console.error("Admin category query failed.", categoryResult.error);
    throw new Error("Kategori tidak dapat dimuat.");
  }
  if (productResult.error) {
    console.error("Admin product query failed.", productResult.error);
    throw new Error("Produk tidak dapat dimuat.");
  }

  const categories: Category[] = categoryResult.data;
  const products: Product[] = productResult.data;
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <main className="admin-main" id="admin-main">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Katalog toko</p>
          <h1>Produk</h1>
        </div>
        <p>{products.length} produk terdaftar</p>
      </div>

      <div className="admin-workspace">
        <section className="admin-panel admin-product-create">
          <div className="admin-panel-heading">
            <h2 id="product-create-heading">Tambah produk</h2>
            <p>Masukkan harga satuan dan stok yang tersedia.</p>
          </div>
          {categories.length > 0 ? (
            <ProductForm categories={categories} />
          ) : (
            <p className="admin-inline-notice" role="status">
              Buat kategori terlebih dahulu sebelum menambah produk.
            </p>
          )}
        </section>

        <section className="admin-panel admin-category-panel">
          <div className="admin-panel-heading">
            <h2 id="category-heading">Kategori</h2>
            <p>Kelompokkan barang agar mudah dicari di etalase.</p>
          </div>
          <CategoryForm />
          {categories.length > 0 && (
            <ul className="admin-category-list" role="list">
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </ul>
          )}
          {categories.length === 0 && (
            <p className="admin-inline-notice" role="status">
              Belum ada kategori. Tambahkan kategori pertama di atas.
            </p>
          )}
        </section>
      </div>

      <section className="admin-panel admin-products-panel">
        <div className="admin-panel-heading">
          <h2>Daftar produk</h2>
          <p>Perbarui detail atau nonaktifkan barang dari etalase.</p>
        </div>

        {products.length === 0 ? (
          <div className="admin-empty-state" role="status">
            <h3>Belum ada produk</h3>
            <p>Produk yang ditambahkan akan muncul di daftar ini.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-product-table">
              <caption className="visually-hidden" id="product-table-caption">
                Daftar produk dan stok Toko Milano
              </caption>
              <thead>
                <tr>
                  <th scope="col">Nama dan satuan</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Harga</th>
                  <th scope="col">Stok</th>
                  <th scope="col">Status etalase</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={{
                      ...product,
                      price: Number(product.price),
                      stock: Number(product.stock),
                    }}
                    categories={categories}
                    categoryName={categoryNameById.get(product.category_id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
