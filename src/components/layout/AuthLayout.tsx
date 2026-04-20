import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)]">
        <section className="relative hidden overflow-hidden bg-on-surface px-10 py-12 text-surface lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,136,112,0.3),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(249,247,242,0.12),transparent_34%)]" />
          <div className="relative space-y-8">
            <Link to="/" className="text-lg font-semibold uppercase tracking-[0.14em]">
              Lidia Castro
            </Link>
            <div className="space-y-5">
              <p className="eyebrow text-surface/55">Acceso y perfil</p>
              <h1 className="font-headline text-[clamp(3rem,6vw,5rem)] leading-[0.92] tracking-[-0.05em]">
                Tu area personal para reservar, revisar y gestionar cada solicitud.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-surface/76">
                Un acceso claro para pacientes y gestion interna, pensado para que la experiencia sea fluida desde la reserva
                hasta el seguimiento posterior.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4">
            {[
              "Registro con perfil personal",
              "Reserva mas agil para usuarios registrados",
              "Gestion de reservas, agenda y contenido",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-surface/10 bg-surface/6 px-5 py-4 text-sm uppercase tracking-[0.18em] text-surface/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-10 sm:px-6 md:px-10">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="text-lg font-semibold uppercase tracking-[0.14em] lg:hidden">
              Lidia Castro
            </Link>
            <Link to="/reservar" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">
              Ir a reservas
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 items-center">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
