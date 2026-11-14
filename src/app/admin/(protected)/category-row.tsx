"use client";

import { useActionState } from "react";
import { updateCategory } from "../actions";
import { initialAdminActionState } from "../action-state";

type Category = {
  id: string;
  name: string;
};

export function CategoryRow({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState(
    updateCategory.bind(null, category.id),
    initialAdminActionState,
  );

  return (
    <li>
      <form
        className="admin-category-row"
        action={formAction}
        aria-label={`Ubah kategori ${category.name}`}
      >
        <label className="admin-field" htmlFor={`category-${category.id}`}>
          Nama kategori <span className="admin-required">(wajib)</span>
          <input
            id={`category-${category.id}`}
            name="name"
            type="text"
            defaultValue={category.name}
            maxLength={80}
            required
          />
        </label>
        <button
          className="admin-secondary-button"
          type="submit"
          disabled={pending}
          aria-label={`Simpan nama kategori ${category.name}`}
        >
          {pending ? "Menyimpan..." : "Simpan nama"}
        </button>
        {state.message && (
          <p
            className={`admin-form-message is-${state.status}`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
      </form>
    </li>
  );
}
