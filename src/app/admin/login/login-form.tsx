"use client";

import { useActionState, useState } from "react";
import { signInAdmin } from "./actions";
import { initialAdminActionState } from "../action-state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInAdmin,
    initialAdminActionState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="admin-login-form"
      action={formAction}
      aria-labelledby="admin-login-title"
    >
      <label className="admin-field" htmlFor="admin-email">
        Email <span className="admin-required">(wajib)</span>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </label>

      <div className="admin-field">
        <label htmlFor="admin-password">
          Kata sandi <span className="admin-required">(wajib)</span>
        </label>
        <span className="admin-password-field">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            className="admin-password-toggle"
            type="button"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </span>
      </div>

      {state.message && (
        <p
          className={`admin-form-message is-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}

      <button className="admin-primary-button" type="submit" disabled={pending}>
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
