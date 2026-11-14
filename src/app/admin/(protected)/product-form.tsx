"use client";

import { useActionState } from "react";
import { createProduct } from "../actions";
import { initialAdminActionState } from "../action-state";

type Category = {
  id: string;
  name: string;
};

export function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    createProduct,
    initialAdminActionState,
  );

  return (
    <form
      className="admin-form admin-create-product-form"
      action={formAction}
      aria-labelledby="product-create-heading"
    >
      <label className="admin-field" htmlFor="new-product-name">
        Nama produk <span className="admin-required">(wajib)</span>
        <input
          id="new-product-name"
          name="name"
          type="text"
          maxLength={120}
          autoComplete="off"
          required
        />
      </label>

      <label className="admin-field" htmlFor="new-product-category">
        Kategori <span className="admin-required">(wajib)</span>
        <select
          id="new-product-category"
          name="category_id"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-field" htmlFor="new-product-unit">
        Satuan <span className="admin-required">(wajib)</span>
        <input
          id="new-product-unit"
          name="unit"
          type="text"
          maxLength={40}
          placeholder="Contoh: 1 kg"
          required
        />
      </label>

      <label className="admin-field" htmlFor="new-product-price">
        Harga (Rp) <span className="admin-required">(wajib)</span>
        <input
          id="new-product-price"
          name="price"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          required
        />
      </label>

      <label className="admin-field" htmlFor="new-product-stock">
        Stok awal <span className="admin-required">(wajib)</span>
        <input
          id="new-product-stock"
          name="stock"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          defaultValue={0}
          required
        />
      </label>

      {state.message && (
        <p
          className={`admin-form-message is-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}

      <button className="admin-primary-button" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah produk"}
      </button>
    </form>
  );
}
