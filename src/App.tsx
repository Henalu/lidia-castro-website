import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { RequireAuth, RequireSuperadmin } from "./routes/guards";
import { PublicLayout } from "./components/layout/PublicLayout";
import { ScrollToTop } from "./components/shared/ScrollToTop";

const AuthLayout = lazy(() => import("./components/layout/AuthLayout").then((module) => ({ default: module.AuthLayout })));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout").then((module) => ({ default: module.AdminLayout })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const BookingPage = lazy(() => import("./pages/BookingPage").then((module) => ({ default: module.BookingPage })));
const AccountPage = lazy(() => import("./pages/AccountPage").then((module) => ({ default: module.AccountPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage").then((module) => ({ default: module.AdminBookingsPage })));
const AdminCalendarPage = lazy(() => import("./pages/admin/AdminCalendarPage").then((module) => ({ default: module.AdminCalendarPage })));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const AdminContentPage = lazy(() => import("./pages/admin/AdminContentPage").then((module) => ({ default: module.AdminContentPage })));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage").then((module) => ({ default: module.AdminSettingsPage })));

function AppFallback() {
  return (
    <div className="section-shell">
      <div className="container-shell py-16 text-sm uppercase tracking-[0.18em] text-on-surface/50">Cargando interfaz...</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reservar" element={<BookingPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/mi-cuenta" element={<AccountPage />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireSuperadmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/reservas" element={<AdminBookingsPage />} />
              <Route path="/admin/calendario" element={<AdminCalendarPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/contenido" element={<AdminContentPage />} />
              <Route path="/admin/ajustes" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
