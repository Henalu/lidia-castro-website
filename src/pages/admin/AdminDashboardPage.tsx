import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageIntro } from "../../components/shared/PageIntro";
import { getDashboardStats, listBookings } from "../../lib/data";
import { formatLongDate } from "../../lib/format";
import type { BookingRequest, DashboardStats } from "../../lib/types";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingBookings: 0,
    confirmedBookings: 0,
    rejectedBookings: 0,
    totalUsers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [nextStats, nextBookings] = await Promise.all([getDashboardStats(), listBookings()]);
      if (!cancelled) {
        setStats(nextStats);
        setRecentBookings(nextBookings.slice(0, 5));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Panel admin"
        title="Resumen general"
        description="Vista general de reservas, pacientes y accesos directos para el trabajo diario."
        action={
          <Link to="/admin/reservas" className="btn-editorial inline-flex items-center justify-center">
            Ver reservas
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pendientes", value: stats.pendingBookings },
          { label: "Confirmadas", value: stats.confirmedBookings },
          { label: "Rechazadas", value: stats.rejectedBookings },
          { label: "Usuarios", value: stats.totalUsers },
        ].map((item) => (
          <article key={item.label} className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface/45">{item.label}</p>
            <p className="mt-3 font-headline text-5xl tracking-tight">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Actividad reciente</p>
              <h2 className="mt-2 font-headline text-3xl tracking-tight">Ultimas reservas</h2>
            </div>
            <Link to="/admin/reservas" className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              Abrir listado
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <article key={booking.id} className="rounded-[1.25rem] border border-on-surface/10 bg-surface p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.14em]">
                  {formatLongDate(booking.selectedDate)} | {booking.selectedTime}
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">{booking.reason}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-on-surface/10 bg-on-surface p-6 text-surface">
          <p className="eyebrow text-surface/55">Gestion</p>
          <h2 className="mt-3 font-headline text-3xl tracking-tight">Vision rapida del negocio</h2>
          <p className="mt-4 text-sm leading-relaxed text-surface/72">
            Desde aqui puedes seguir la actividad reciente, revisar el estado de las solicitudes y acceder rapidamente a las areas clave de gestion.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "Reservas organizadas por estado",
              "Bloqueos manuales de agenda",
              "Pacientes con reserva directa",
              "Contenido editable por secciones",
            ].map((item) => (
              <div key={item} className="rounded-[1rem] border border-surface/10 bg-surface/6 px-4 py-3 text-sm uppercase tracking-[0.16em] text-surface/76">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
