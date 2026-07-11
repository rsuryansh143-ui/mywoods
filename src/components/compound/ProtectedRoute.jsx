// ─────────────────────────────────────────────────────────────
//  ProtectedRoute.jsx
//  Wraps any route that requires authentication.
//  If the user has no token  → redirect to /login.
//  If the user is logged in  → render the child route.
// ─────────────────────────────────────────────────────────────

import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";

/**
 * Usage in App.jsx:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/cms" element={<CMS />} />
 *   </Route>
 *
 * <Outlet /> renders whatever nested Route matched.
 * The `replace` prop in Navigate prevents a back-button loop.
 */
export default function ProtectedRoute() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
