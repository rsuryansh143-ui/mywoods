// ─────────────────────────────────────────────────────────────
//  auth.js — JWT token management for MyWoods CMS
//  All token logic lives here so no component touches
//  localStorage directly.
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "mw_token";

/** Save the JWT returned by the login API */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Read the stored JWT. Returns null if not logged in. */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Remove the token — effectively logs the user out */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Boolean convenience — true when a token is present */
export function isLoggedIn() {
  return Boolean(getToken());
}
