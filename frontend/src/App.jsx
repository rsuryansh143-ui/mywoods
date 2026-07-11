// App.jsx — Root router with auth-protected CMS route
import { Routes, Route, Navigate } from "react-router-dom";
import About from "./routes/About";
import Contact from "./routes/Contact";
import Woods from "./routes/Woods/pages";
import WoodDetails from "./routes/Woods/[id]/pages";
import Home from "./routes/Home";
import Header from "./components/compound/Header";
import Footer from "./components/compound/Footer";
import ProtectedRoute from "./components/compound/ProtectedRoute";
import CMS from "./routes/cms";
import Login from "./routes/login";
import { isLoggedIn } from "./utils/auth";

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* ── Public routes ─────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/woods" element={<Woods />} />
          <Route path="/woods/:id" element={<WoodDetails />} />

          {/* ── Login — if already logged in, go straight to CMS ── */}
          <Route
            path="/login"
            element={isLoggedIn() ? <Navigate to="/cms" replace /> : <Login />}
          />

          {/* ── Protected: must be authenticated ──────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cms" element={<CMS />} />
          </Route>

          {/* ── Fallback ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;