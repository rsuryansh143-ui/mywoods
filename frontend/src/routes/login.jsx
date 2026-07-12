// ─────────────────────────────────────────────────────────────
//  login.jsx — MyWoods CMS  Sign In / Sign Up
//
//  HOW IT WORKS:
//
//  Two tabs on one page:
//  ┌─ Sign In ──────────────────────────────────────────────┐
//  │  POST /api/auth/login  { email, password }             │
//  │  → { token }  → save to localStorage → go to /cms     │
//  └────────────────────────────────────────────────────────┘
//  ┌─ Sign Up ──────────────────────────────────────────────┐
//  │  POST /api/auth/register  { name, email, password }    │
//  │  → { token }  → save to localStorage → go to /cms     │
//  └────────────────────────────────────────────────────────┘
//
//  After a successful register the token is saved exactly
//  the same way as login — user lands straight in the CMS.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";

const BASE = `${import.meta.env.VITE_API_URL || ""}/api/auth`;

export default function AuthPage() {
  const navigate = useNavigate();
  // "signin" | "signup"
  const [tab, setTab] = useState("signin");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up only
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Switch tab — reset everything ──────────────────────────
  const switchTab = (t) => {
    setTab(t);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };

  // ── Sign In ────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      if (!data?.token) throw new Error("No token in response.");

      setToken(data.token);
      navigate("/cms", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e?.preventDefault();
    setError("");

    // Client-side validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      if (!data?.token) throw new Error("No token returned. Try signing in.");

      // Registered + logged in immediately
      setToken(data.token);
      navigate("/cms", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-icon">🌲</div>
          <h1 className="auth-title">MyWoods CMS</h1>
          <p className="auth-subtitle">Wood inventory management system</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "signin"}
            className={`auth-tab ${tab === "signin" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("signin")}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={tab === "signup"}
            className={`auth-tab ${tab === "signup" ? "auth-tab-active" : ""}`}
            onClick={() => switchTab("signup")}
          >
            Create Account
          </button>
        </div>

        {/* ── SIGN IN FORM ───────────────────────────────────── */}
        {tab === "signin" && (
          <form
            key="signin"
            className="auth-form"
            onSubmit={handleSignIn}
            aria-label="Sign in form"
          >
            <div className="auth-field">
              <label htmlFor="si-email" className="auth-label">Email address</label>
              <input
                id="si-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="si-password" className="auth-label">Password</label>
              <input
                id="si-password"
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="auth-error" role="alert">⚠ {error}</div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <><span className="auth-spinner" /> Signing in…</>
                : "Sign In →"
              }
            </button>

            <p className="auth-switch-hint">
              Don&apos;t have an account?{" "}
              <button type="button" className="auth-switch-link" onClick={() => switchTab("signup")}>
                Create one
              </button>
            </p>
          </form>
        )}

        {/* ── SIGN UP FORM ───────────────────────────────────── */}
        {tab === "signup" && (
          <form
            key="signup"
            className="auth-form"
            onSubmit={handleSignUp}
            aria-label="Create account form"
          >
            <div className="auth-field">
              <label htmlFor="su-name" className="auth-label">Full name</label>
              <input
                id="su-name"
                type="text"
                className="auth-input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-email" className="auth-label">Email address</label>
              <input
                id="su-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-password" className="auth-label">
                Password <span className="auth-label-hint">(min. 6 characters)</span>
              </label>
              <input
                id="su-password"
                type="password"
                className="auth-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="su-confirm" className="auth-label">Confirm password</label>
              <input
                id="su-confirm"
                type="password"
                className={`auth-input ${
                  confirmPassword && confirmPassword !== password ? "auth-input-err" : ""
                }`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <span className="auth-inline-err">Passwords don&apos;t match</span>
              )}
            </div>

            {error && (
              <div className="auth-error" role="alert">⚠ {error}</div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <><span className="auth-spinner" /> Creating account…</>
                : "Create Account →"
              }
            </button>

            <p className="auth-switch-hint">
              Already have an account?{" "}
              <button type="button" className="auth-switch-link" onClick={() => switchTab("signin")}>
                Sign in
              </button>
            </p>
          </form>
        )}

        <p className="auth-footer-note">
          🔒 Secure connection · MyWoods Admin Portal
        </p>
      </div>
    </div>
  );
}