import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { useSiteContentData, useSiteSettingsData } from "../../lib/hooks";
import { publicSections } from "../../lib/navigation";
import { cn } from "../../lib/utils";

function getSectionId(href: string) {
  return href.split("#")[1] ?? "";
}

function getHeaderOffset() {
  if (typeof window === "undefined") {
    return 96;
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue("--header-height");
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 96;
}

function getPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function PublicLayout() {
  const { profile, signOutAction } = useAuth();
  const { content } = useSiteContentData();
  const { settings } = useSiteSettingsData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

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

  useEffect(() => {
    if (location.pathname !== "/" || typeof window === "undefined") {
      setActiveSection("");
      return;
    }

    let frameId = 0;

    const updateActiveSection = () => {
      const threshold = window.scrollY + getHeaderOffset() + 32;
      let nextActiveSection = "";

      for (const item of publicSections) {
        const sectionId = getSectionId(item.href);
        const element = document.getElementById(sectionId);

        if (element && element.offsetTop <= threshold) {
          nextActiveSection = item.href;
        }
      }

      setActiveSection(nextActiveSection);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface" id="top">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-on-surface/8 bg-surface/80 backdrop-blur-xl">
        <div className="container-shell flex min-h-[var(--header-height)] items-center justify-between gap-6 px-5 sm:px-6 md:px-10">
          <Link to="/#top" aria-label="Inicio - Lidia Castro Fisioterapia" className="text-lg font-semibold uppercase tracking-[0.14em] sm:text-xl">
            Lidia Castro
            <span className="ml-2 align-top text-[10px] font-normal opacity-45">R</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {publicSections.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-link text-[11px] font-semibold uppercase tracking-[0.22em]",
                  location.pathname === "/" && activeSection === item.href && "is-active",
                )}
                aria-current={location.pathname === "/" && activeSection === item.href ? "location" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/reservar" className="btn-editorial !px-5 !py-3">
              Reservar
            </Link>
            {profile ? (
              <>
                <NavLink to={profile.role === "superadmin" ? "/admin" : "/mi-cuenta"} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface/65">
                  {profile.role === "superadmin" ? "Admin" : "Mi cuenta"}
                </NavLink>
                <button type="button" onClick={() => void signOutAction()} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface/45 transition-colors hover:text-on-surface">
                  Salir
                </button>
              </>
            ) : (
              <NavLink to="/login" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface/65">
                Acceder
              </NavLink>
            )}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10 md:hidden"
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] bg-on-surface/25 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="safe-screen absolute inset-3 flex flex-col overflow-hidden rounded-[2rem] border border-on-surface/10 bg-surface/96 shadow-[0_30px_80px_rgba(26,26,26,0.16)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-on-surface/8 px-5 py-5">
                <div className="space-y-1">
                  <p className="eyebrow text-accent">Lidia Castro Fisioterapia</p>
                  <p className="text-sm text-on-surface-variant">Fisioterapia especializada, reserva online y atencion personalizada.</p>
                </div>
                <button type="button" aria-label="Cerrar menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10" onClick={() => setMenuOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
                {publicSections.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn("mobile-nav-link block", location.pathname === "/" && activeSection === item.href && "is-active")}
                    aria-current={location.pathname === "/" && activeSection === item.href ? "location" : undefined}
                  >
                    <p className="text-xl font-medium tracking-tight">{item.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
                  </Link>
                ))}
                <Link to="/reservar" className="mobile-nav-link block bg-accent/10">
                  <p className="text-xl font-medium tracking-tight">Reservar cita</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Elige dia y hora, comparte tu caso y envia tu solicitud de cita.</p>
                </Link>
              </div>

              <div className="border-t border-on-surface/8 px-5 py-5">
                {profile ? (
                  <div className="flex gap-3">
                    <Link to={profile.role === "superadmin" ? "/admin" : "/mi-cuenta"} className="btn-editorial flex-1 text-center">
                      {profile.role === "superadmin" ? "Ir al admin" : "Mi cuenta"}
                    </Link>
                    <button type="button" onClick={() => void signOutAction()} className="rounded-full border border-on-surface/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Salir
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="btn-editorial flex-1 text-center">
                      Acceder
                    </Link>
                    <Link to="/registro" className="rounded-full border border-on-surface/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Registro
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="section-anchor border-t border-on-surface/10 bg-surface" id="contact">
        <div className="container-shell grid gap-10 px-5 py-12 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:px-10 md:py-16">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="eyebrow">{content.contact.eyebrow}</span>
              <h2 className="section-title text-[clamp(2.4rem,6vw,4.6rem)]">{content.contact.title}</h2>
            </div>
            <p className="max-w-xl text-base leading-relaxed text-on-surface-variant">{content.contact.description}</p>
            <a href={`mailto:${content.contact.email}`} className="btn-editorial inline-flex w-fit items-center justify-center">
              {content.contact.email}
            </a>
          </div>

          <div className="grid gap-6 self-end sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-on-surface/38">Ubicacion</span>
              <p className="font-headline text-2xl italic">Gijon, Asturias</p>
              <p className="text-sm leading-relaxed text-on-surface-variant">{content.contact.addressHint}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-on-surface/38">Contacto directo</span>
              <div className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
                <a href={getPhoneHref(settings.contactPhone)} className="text-on-surface/72 transition-colors duration-300 hover:text-accent">
                  {settings.contactPhone}
                </a>
                <Link to="/reservar" className="text-on-surface/72 transition-colors duration-300 hover:text-accent">
                  Reservar online
                </Link>
                <Link to="/#top" className="text-accent transition-colors duration-300 hover:text-on-surface">
                  Volver arriba
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-on-surface/8 px-5 py-5 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface/35 sm:px-6 md:px-10">
          Copyright 2026 Lidia Castro Rodriguez
        </div>
      </footer>
    </div>
  );
}
