import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="section-shell">
      <div className="container-shell max-w-2xl space-y-6 text-center">
        <p className="eyebrow">404</p>
        <h1 className="section-title">Esta pagina no existe</h1>
        <p className="text-base leading-relaxed text-on-surface-variant">
          Puedes volver a la landing, reservar una cita o entrar al panel si ya tienes acceso.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-editorial inline-flex items-center justify-center">
            Volver al inicio
          </Link>
          <Link to="/reservar" className="rounded-full border border-on-surface/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
            Ir a reservas
          </Link>
        </div>
      </div>
    </section>
  );
}
