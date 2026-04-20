import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { adminNavigation } from "../../lib/navigation";
import { getInitials } from "../../lib/utils";

export function AdminLayout() {
  const { profile, signOutAction } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

      <div className="container-shell flex min-h-[calc(100vh-var(--header-height))] flex-col px-5 sm:px-6 md:flex-row md:px-10">
        <aside className="hidden w-72 shrink-0 border-r border-on-surface/8 py-10 pr-8 md:block">
          <AdminSidebar />
        </aside>

        {menuOpen ? (
          <aside className="border-b border-on-surface/8 py-5 md:hidden">
            <AdminSidebar compact onNavigate={() => setMenuOpen(false)} />
          </aside>
        ) : null}

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
