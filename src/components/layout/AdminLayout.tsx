import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { adminNavigation } from "../../lib/navigation";
import { getInitials } from "../../lib/utils";

export function AdminLayout() {
  const { profile, signOutAction } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setMenuOpen(false);
      }
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-on-surface/8 bg-surface/86 backdrop-blur-xl">
        <div className="container-shell flex min-h-[var(--header-height)] items-center justify-between gap-4 px-5 sm:px-6 md:px-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold uppercase tracking-[0.14em]">
              Lidia Castro
            </Link>
            <span className="hidden rounded-full border border-on-surface/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55 md:inline-flex">
              Superadmin
            </span>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link to="/mi-cuenta" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">
              Mi cuenta
            </Link>
            <button type="button" onClick={() => void signOutAction()} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">
              Salir
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10 bg-surface-container text-sm font-semibold">
              {getInitials(profile?.fullName ?? "LC")}
            </div>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10 md:hidden"
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
            aria-label={menuOpen ? "Cerrar menu admin" : "Abrir menu admin"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[70] bg-on-surface/25 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              className="safe-screen absolute inset-3 flex flex-col overflow-hidden rounded-[2rem] border border-on-surface/10 bg-surface/96 shadow-[0_30px_80px_rgba(26,26,26,0.16)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-on-surface/8 px-5 py-5">
                <div className="space-y-1">
                  <p className="eyebrow text-accent">Panel de gestion</p>
                  <p className="text-sm text-on-surface-variant">Reservas, agenda, usuarios y contenido en una sola vista operativa.</p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar menu admin"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <AdminSidebar compact onNavigate={() => setMenuOpen(false)} />
              </div>

              <div className="border-t border-on-surface/8 px-5 py-5">
                <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-on-surface/8 bg-surface-container/60 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface/45">Sesion activa</p>
                    <p className="mt-1 truncate text-sm font-semibold text-on-surface/72">{profile?.fullName ?? "Lidia Castro"}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-on-surface/10 bg-surface text-sm font-semibold">
                    {getInitials(profile?.fullName ?? "LC")}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link to="/mi-cuenta" className="btn-editorial flex-1 text-center">
                    Mi cuenta
                  </Link>
                  <button
                    type="button"
                    onClick={() => void signOutAction()}
                    className="rounded-full border border-on-surface/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="container-shell flex min-h-[calc(100vh-var(--header-height))] flex-col px-5 sm:px-6 md:flex-row md:px-10">
        <aside className="hidden w-72 shrink-0 border-r border-on-surface/8 py-10 pr-8 md:block">
          <AdminSidebar />
        </aside>

        <main className="min-w-0 flex-1 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="eyebrow">Panel admin</p>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Gestion de reservas, agenda, contenido y parametros operativos.
        </p>
      </div>

      <nav className={compact ? "grid gap-2" : "grid gap-2"}>
        {adminNavigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-[1.25rem] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-colors ${
                isActive ? "bg-on-surface text-surface" : "text-on-surface/60 hover:bg-surface-container"
              }`
            }
            end={item.href === "/admin"}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
