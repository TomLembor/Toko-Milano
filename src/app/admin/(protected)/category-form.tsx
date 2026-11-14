"use client";

import { useActionState } from "react";
import { createCategory } from "../actions";
import { initialAdminActionState } from "../action-state";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategory,
    initialAdminActionState,
  );

  return (
    <form
      className="admin-form admin-category-form"
      action={formAction}
      aria-labelledby="category-heading"
    >
      <label className="admin-field" htmlFor="new-category-name">
        Nama kategori <span className="admin-required">(wajib)</span>
        <input
          id="new-category-name"
          name="name"
          type="text"
          maxLength={80}
          autoComplete="off"
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
      <button className="admin-secondary-button" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah kategori"}
      </button>
    </form>
  );
}
