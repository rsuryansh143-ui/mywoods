// ═══════════════════════════════════════════════════════════════
//  cms.jsx — MyWoods Timber Ledger (full CMS)
//
//  HOW IT WORKS — THE COMPLETE FLOW:
//
//  1. Page mounts → load() fires → GET /api/woods with auth header
//     → rows state filled → table renders
//
//  2. ADD WOOD:
//     User clicks "Add Wood" → modal opens (blank form)
//     User fills all 8 fields → clicks Add
//     → validation runs
//     → POST /api/woods with full payload + auth header
//     → new row prepended to table
//     → toast "Added Teak ✓"
//
//  3. EDIT WOOD:
//     User clicks Edit on a row → modal opens (form pre-filled)
//     User changes fields → clicks Save
//     → PUT /api/woods/:id with full payload + auth header
//     → that specific row updated in-place (no full refetch)
//     → toast "Updated Teak ✓"
//
//  4. DELETE WOOD:
//     User clicks Delete → confirm modal shows wood name
//     User confirms → DELETE /api/woods/:id with auth header
//     → row removed from rows array
//     → toast "Removed Teak 🗑"
//
//  5. LOGOUT:
//     User clicks Logout → clearToken() → navigate to /login
//
//  All API calls send: Authorization: Bearer <token>
//  Token comes from localStorage via getToken() in auth.js
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../utils/auth";

// ── Constants ──────────────────────────────────────────────────
const API = `${import.meta.env.VITE_API_URL || ""}/api/woods`;

const TYPES = ["hardwood", "softwood", "engineered", "other"];

// Map colour name → hex so the swatch column shows the real colour
const COLOR_MAP = [
  ["dark brown", "#4b2e18"], ["reddish", "#7c3a26"], ["light red", "#b34a3a"],
  ["red", "#8b3a2b"], ["light brown", "#c19a6b"], ["golden brown", "#c4932a"],
  ["golden", "#c9902e"], ["honey", "#cf9b3c"], ["yellow", "#d4b56b"],
  ["cream", "#e6d8b8"], ["white", "#ece2cb"], ["black", "#2a2320"],
  ["grey", "#8c857c"], ["gray", "#8c857c"], ["olive", "#6b7a4b"],
  ["green", "#5f7a4b"], ["pink", "#c98a7a"], ["purple", "#6b4e7a"],
  ["orange", "#c4702e"], ["tan", "#c49a6c"], ["brown", "#8b5a2b"],
];

function resolveColor(name = "") {
  const n = String(name).toLowerCase();
  for (const [key, hex] of COLOR_MAP) {
    if (n.includes(key)) return hex;
  }
  return "#b08d5b"; // default amber-wood
}

function readableInk(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#33291f" : "#f6f1e7";
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

// Blank form shape — matches every field the API accepts
const BLANK = {
  name: "", type: "hardwood", description: "",
  color: "", density: "", origin: "",
  pricePerUnit: "", available: true,
};

// Normalise a server record so _id is always present
const normalize = (r, i = 0) => ({
  ...BLANK, ...r,
  _id: r._id ?? r.id ?? null,
  id: r._id ?? r.id ?? `row-${i}`,
});

// Shape form data into the exact payload the API expects
const toPayload = (d) => ({
  name: String(d.name).trim(),
  type: d.type || "hardwood",
  origin: String(d.origin).trim(),
  color: String(d.color).trim(),
  density: d.density === "" ? null : Number(d.density),
  pricePerUnit: d.pricePerUnit === "" ? null : Number(d.pricePerUnit),
  description: String(d.description).trim(),
  available: Boolean(d.available),
});

// ── API helpers — each attaches the auth bearer token ──────────
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function apiList() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(API, {
      headers: authHeaders(),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function apiCreate(payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiUpdate(id, payload) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json().catch(() => ({}));
}

async function apiDelete(id) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ══════════════════════════════════════════════════════════════
//  Main CMS Component
// ══════════════════════════════════════════════════════════════
export default function CMS() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "live" | "error"
  const [modal, setModal] = useState(null);         // { mode, item } | null
  const [toast, setToast] = useState(null);         // { msg, tone } | null
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  // ── Toast helper ──────────────────────────────────────────
  const showToast = useCallback((msg, tone = "ok") => {
    setToast({ msg, tone });
    window.clearTimeout(showToast._tid);
    showToast._tid = window.setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Load all woods from API ────────────────────────────────
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const json = await apiList();
      if (!Array.isArray(json)) throw new Error("Unexpected response");
      setRows(json.map(normalize));
      setStatus("live");
    } catch (err) {
      console.error("Load error:", err);
      setStatus("error");
      showToast("Could not reach the API. Please try refreshing.", "warn");
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // ── Search filter (client-side, instant) ──────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.origin, r.color, r.type, r.description]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [rows, query]);

  // ── CREATE / UPDATE ────────────────────────────────────────
  const handleSave = async (draft) => {
    const payload = toPayload(draft);
    const isEdit = !!draft._id;

    try {
      if (isEdit) {
        // PUT — update the record on the server
        const updated = await apiUpdate(draft._id, payload);
        const merged = normalize({ ...draft, ...payload, ...(updated?._id ? updated : {}) });
        setRows((prev) => prev.map((r) => (r._id === draft._id ? merged : r)));
        showToast(`Updated "${payload.name}"`, "ok");
      } else {
        // POST — create a new record
        const created = await apiCreate(payload);
        const row = created?._id
          ? normalize(created)
          : normalize({ ...payload, _id: `local-${Date.now()}` });
        setRows((prev) => [row, ...prev]);
        showToast(`Added "${payload.name}"`, "ok");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("API error — could not save. Check console.", "danger");
    } finally {
      setModal(null);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────
  const handleDelete = async (item) => {
    setDeletingId(item._id);
    try {
      if (item._id && !String(item._id).startsWith("local-")) {
        await apiDelete(item._id);
      }
      setRows((prev) => prev.filter((r) => r._id !== item._id));
      showToast(`Removed "${item.name}"`, "danger");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Could not delete. Try again.", "danger");
    } finally {
      setDeletingId(null);
      setModal(null);
    }
  };

  // ── LOGOUT ─────────────────────────────────────────────────
  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="cms-app">
      {/* ── Masthead ──────────────────────────────────────── */}
      <header className="cms-mast">
        <div className="cms-mast-in">
          <div className="cms-brand">
            <span className="cms-brand-icon">🌲</span>
            <div>
              <h1 className="cms-brand-name">Timber Ledger</h1>
              <p className="cms-brand-sub">Wood inventory management</p>
            </div>
          </div>
          <div className="cms-mast-right">
            <StatusPill status={status} count={rows.length} />
            <button className="cms-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="cms-wrap">
        {/* Toolbar */}
        <div className="cms-toolbar">
          <div className="cms-search">
            <span className="cms-search-icon">🔍</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, origin, type, colour…"
              aria-label="Search woods"
            />
            {query && (
              <button className="cms-search-clear" onClick={() => setQuery("")} aria-label="Clear">
                ×
              </button>
            )}
          </div>
          <div className="cms-toolbar-right">
            <button
              className="cms-btn-ghost"
              onClick={load}
              title="Reload from API"
              disabled={status === "loading"}
            >
              {status === "loading" ? "⟳" : "↻"} Refresh
            </button>
            <button
              className="cms-btn-primary"
              onClick={() => setModal({ mode: "add", item: { ...BLANK } })}
            >
              + Add Wood
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="cms-card">
          <div className="cms-scroll">
            <table className="cms-table">
              <thead>
                <tr>
                  <th className="cms-col-name">Name</th>
                  <th>Type</th>
                  <th>Colour</th>
                  <th className="cms-num">Density<span className="cms-unit">kg/m³</span></th>
                  <th>Origin</th>
                  <th className="cms-num">Price / unit</th>
                  <th>Stock</th>
                  <th className="cms-actions-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading skeleton */}
                {status === "loading" && <SkeletonRows />}

                {/* Data rows */}
                {status !== "loading" &&
                  filtered.map((item) => {
                    const hex = resolveColor(item.color);
                    return (
                      <tr
                        key={item.id}
                        className={deletingId === item._id ? "cms-row-leaving" : ""}
                      >
                        <td className="cms-col-name">
                          <span className="cms-row-name">{item.name}</span>
                          {item.description && (
                            <span className="cms-row-sub">{item.description}</span>
                          )}
                        </td>
                        <td><TypeChip type={item.type} /></td>
                        <td>
                          <span
                            className="cms-swatch"
                            style={{ background: hex, color: readableInk(hex) }}
                          >
                            <span className="cms-dot" style={{ background: hex }} />
                            {item.color || "—"}
                          </span>
                        </td>
                        <td className="cms-num cms-fig">
                          {item.density != null && item.density !== "" ? item.density : "—"}
                        </td>
                        <td className="cms-origin">
                          📍 {item.origin || <span className="cms-empty">—</span>}
                        </td>
                        <td className="cms-num cms-fig cms-price">
                          {item.pricePerUnit != null && item.pricePerUnit !== ""
                            ? <><span className="cms-rupee">₹</span>{inr.format(item.pricePerUnit)}</>
                            : "—"
                          }
                        </td>
                        <td><StockBadge available={item.available} /></td>
                        <td>
                          <div className="cms-row-actions">
                            <button
                              className="cms-edit-btn"
                              onClick={() => setModal({ mode: "edit", item: { ...item } })}
                            >
                              ✏ Edit
                            </button>
                            <button
                              className="cms-delete-btn"
                              onClick={() => setModal({ mode: "delete", item })}
                              disabled={deletingId === item._id}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }

                {/* Empty state */}
                {status !== "loading" && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="cms-empty-state">
                        <span className="cms-empty-icon">📦</span>
                        {query
                          ? <>
                              <p>No woods match &ldquo;{query}&rdquo;</p>
                              <button className="cms-link-btn" onClick={() => setQuery("")}>
                                Clear search
                              </button>
                            </>
                          : <>
                              <p>The ledger is empty.</p>
                              <button
                                className="cms-link-btn"
                                onClick={() => setModal({ mode: "add", item: { ...BLANK } })}
                              >
                                Add the first wood
                              </button>
                            </>
                        }
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <p className="cms-foot-note">
          {status === "live" && `Connected to live API • ${rows.length} record${rows.length !== 1 ? "s" : ""}`}
          {status === "error" && "⚠ API connection failed — shown data may be stale"}
        </p>
      </div>

      {/* ── Modals ────────────────────────────────────────── */}
      {modal?.mode === "add" && (
        <FormModal
          title="Add a wood"
          submitLabel="Add wood"
          initial={modal.item}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
        />
      )}
      {modal?.mode === "edit" && (
        <FormModal
          title="Edit wood"
          submitLabel="Save changes"
          initial={modal.item}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
        />
      )}
      {modal?.mode === "delete" && (
        <DeleteModal
          item={modal.item}
          busy={deletingId === modal.item._id}
          onClose={() => setModal(null)}
          onConfirm={() => handleDelete(modal.item)}
        />
      )}

      {/* ── Toast notification ────────────────────────────── */}
      {toast && (
        <div
          className={`cms-toast cms-toast-${toast.tone}`}
          role="status"
          aria-live="polite"
        >
          {toast.tone === "ok" && "✓ "}
          {toast.tone === "warn" && "⚠ "}
          {toast.tone === "danger" && "✕ "}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function StatusPill({ status, count }) {
  const map = {
    loading: ["Loading…", "cms-pill-load"],
    live:    ["Live API", "cms-pill-live"],
    error:   ["API Error", "cms-pill-error"],
  };
  const [label, cls] = map[status] ?? map.live;
  return (
    <span className={`cms-pill ${cls}`}>
      <i />{label}{status === "live" && <em>{count} species</em>}
    </span>
  );
}

function TypeChip({ type = "" }) {
  const t = String(type).toLowerCase() || "other";
  const valid = TYPES.includes(t) ? t : "other";
  return (
    <span className={`cms-type cms-type-${valid}`}>
      {t[0].toUpperCase() + t.slice(1)}
    </span>
  );
}

function StockBadge({ available }) {
  return (
    <span className={`cms-stock ${available ? "cms-stock-in" : "cms-stock-out"}`}>
      <i />{available ? "In stock" : "Out"}
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: 8 }).map((__, j) => (
        <td key={j}>
          <span className="cms-skel" style={{ width: `${45 + ((i + j) % 4) * 12}%` }} />
        </td>
      ))}
    </tr>
  ));
}

// ── Form Modal (Add & Edit) ────────────────────────────────────
function FormModal({ title, submitLabel, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstRef = useRef(null);

  // Auto-focus first field when modal opens
  useEffect(() => { firstRef.current?.focus(); }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  // Generic field setter — works for any key
  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Validate before submitting
  const validate = () => {
    const err = {};
    if (!String(form.name).trim()) {
      err.name = "Name is required.";
    }
    if (form.density !== "" && isNaN(Number(form.density))) {
      err.density = "Must be a number.";
    }
    if (form.pricePerUnit !== "" && isNaN(Number(form.pricePerUnit))) {
      err.pricePerUnit = "Must be a number.";
    } else if (Number(form.pricePerUnit) < 0) {
      err.pricePerUnit = "Can't be negative.";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async () => {
    if (submitting || !validate()) return;
    setSubmitting(true);
    await onSubmit(form); // parent closes modal after save
  };

  const colorPreview = resolveColor(form.color);

  return (
    <Overlay onClose={() => !submitting && onClose()}>
      <div className="cms-modal" role="dialog" aria-modal="true" aria-label={title}>
        {/* Header */}
        <div className="cms-modal-head">
          <h2>{title}</h2>
          <button className="cms-modal-close" onClick={onClose} disabled={submitting} aria-label="Close">×</button>
        </div>

        {/* Body — all 8 fields */}
        <div className="cms-modal-body">
          {/* Name (required) */}
          <Field label="Name *" error={errors.name}>
            <input
              ref={firstRef}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Teak"
            />
          </Field>

          <div className="cms-grid2">
            {/* Type dropdown */}
            <Field label="Type">
              <select value={form.type} onChange={set("type")}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            {/* Availability toggle */}
            <Field label="Availability">
              <button
                type="button"
                className={`cms-switch ${form.available ? "cms-switch-on" : ""}`}
                onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                aria-pressed={form.available}
              >
                <span className="cms-switch-knob" />
                <span className="cms-switch-label">
                  {form.available ? "In stock" : "Out of stock"}
                </span>
              </button>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="Short description of this wood…"
            />
          </Field>

          <div className="cms-grid2">
            {/* Colour with live swatch */}
            <Field label="Colour">
              <div className="cms-color-input">
                <span
                  className="cms-dot cms-dot-lg"
                  style={{ background: colorPreview }}
                />
                <input
                  value={form.color}
                  onChange={set("color")}
                  placeholder="e.g. Dark Brown"
                />
              </div>
            </Field>

            {/* Density */}
            <Field label="Density (kg/m³)" error={errors.density}>
              <input
                value={form.density}
                onChange={set("density")}
                inputMode="decimal"
                placeholder="e.g. 660"
              />
            </Field>
          </div>

          <div className="cms-grid2">
            {/* Origin */}
            <Field label="Origin">
              <input
                value={form.origin}
                onChange={set("origin")}
                placeholder="e.g. Kerala, India"
              />
            </Field>

            {/* Price */}
            <Field label="Price per unit (₹)" error={errors.pricePerUnit}>
              <input
                value={form.pricePerUnit}
                onChange={set("pricePerUnit")}
                inputMode="decimal"
                placeholder="e.g. 3200"
              />
            </Field>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="cms-modal-foot">
          <button className="cms-btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="cms-btn-primary" onClick={submit} disabled={submitting}>
            {submitting
              ? <span className="cms-btn-spinner" aria-label="Saving…" />
              : submitLabel
            }
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Field wrapper ──────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <label className={`cms-field ${error ? "cms-field-err" : ""}`}>
      <span className="cms-field-label">{label}</span>
      {children}
      {error && <span className="cms-field-error">{error}</span>}
    </label>
  );
}

// ── Delete confirmation modal ──────────────────────────────────
function DeleteModal({ item, busy, onClose, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <Overlay onClose={() => !busy && onClose()}>
      <div
        className="cms-modal cms-modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-label="Confirm delete"
      >
        <div className="cms-danger-icon">⚠</div>
        <h2 className="cms-danger-title">Remove this wood?</h2>
        <p className="cms-danger-text">
          <strong>{item.name}</strong> will be permanently removed from the ledger.
          This action cannot be undone.
        </p>
        <div className="cms-modal-foot cms-modal-foot-center">
          <button className="cms-btn-ghost" onClick={onClose} disabled={busy}>
            Keep it
          </button>
          <button
            className="cms-delete-solid"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy
              ? <span className="cms-btn-spinner" aria-label="Deleting…" />
              : "🗑 Delete"
            }
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Backdrop overlay ───────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <div
      className="cms-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}