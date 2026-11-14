"use client";

import { useActionState } from "react";
import { updateProduct } from "../actions";
import { initialAdminActionState } from "../action-state";

type Category = {
  id: string;
  name: string;
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

export function ProductRow({
  product,
  categories,
  categoryName,
  formatPrice,
}: {
  product: Product;
  categories: Category[];
  categoryName: string | undefined;
  formatPrice: (value: number) => string;
}) {
  const formId = `update-product-${product.id}`;
  const [state, formAction, pending] = useActionState(
    updateProduct.bind(null, product.id),
    initialAdminActionState,
  );

  return (
    <tr>
      <td>
        <label className="admin-field" htmlFor={`${formId}-name`}>
          Nama produk <span className="admin-required">(wajib)</span>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            defaultValue={product.name}
            form={formId}
            maxLength={120}
            required
          />
        </label>
        <label className="admin-field" htmlFor={`${formId}-unit`}>
          Satuan <span className="admin-required">(wajib)</span>
          <input
            id={`${formId}-unit`}
            name="unit"
            type="text"
            defaultValue={product.unit}
            form={formId}
            maxLength={40}
            required
          />
        </label>
      </td>
      <td>
        <label className="admin-field" htmlFor={`${formId}-category`}>
          Kategori <span className="admin-required">(wajib)</span>
          <select
            id={`${formId}-category`}
            name="category_id"
            defaultValue={product.category_id}
            form={formId}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            {!categoryName && (
              <option value={product.category_id}>Kategori tidak tersedia</option>
            )}
          </select>
        </label>
      </td>
      <td>
        <label className="admin-field" htmlFor={`${formId}-price`}>
          Harga (Rp) <span className="admin-required">(wajib)</span>
          <input
            id={`${formId}-price`}
            name="price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            defaultValue={product.price}
            form={formId}
            required
          />
          <span className="admin-field-hint">{formatPrice(product.price)}</span>
        </label>
      </td>
      <td>
        <label className="admin-field" htmlFor={`${formId}-stock`}>
          Stok <span className="admin-required">(wajib)</span>
          <input
            id={`${formId}-stock`}
            name="stock"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            defaultValue={product.stock}
            form={formId}
            required
          />
        </label>
      </td>
      <td>
        <label className="admin-checkbox-field" htmlFor={`${formId}-active`}>
          <input
            id={`${formId}-active`}
            name="is_active"
            type="checkbox"
            defaultChecked={product.is_active}
            form={formId}
          />
          <span>{product.is_active ? "Aktif di etalase" : "Nonaktif"}</span>
        </label>
      </td>
      <td className="admin-row-actions">
        <form
          id={formId}
          action={formAction}
          aria-label={`Simpan perubahan ${product.name}`}
        >
          <button
            className="admin-secondary-button"
            type="submit"
            disabled={pending}
            aria-label={`Simpan perubahan ${product.name}`}
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
        {state.message && (
          <p
            className={`admin-form-message is-${state.status}`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
      </td>
    </tr>
  );
}
