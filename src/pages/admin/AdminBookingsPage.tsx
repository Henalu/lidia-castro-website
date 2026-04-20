import { useEffect, useMemo, useState } from "react";
import { FormField, Select, TextInput } from "../../components/shared/FormField";
import { PageIntro } from "../../components/shared/PageIntro";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { useAuth } from "../../context/auth-context";
import { getBookingContact, listBookings, listUsers, updateBookingStatus } from "../../lib/data";
import { formatLongDate } from "../../lib/format";
import type { BookingRequest, BookingStatus, Profile } from "../../lib/types";

export function AdminBookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({
    status: "all" as BookingStatus | "all",
    query: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [nextBookings, nextUsers] = await Promise.all([
        listBookings({ status: filters.status, query: filters.query }),
        listUsers(),
      ]);

      if (!cancelled) {
        setBookings(nextBookings);
        setUsers(nextUsers);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const groupedBookings = useMemo(() => bookings, [bookings]);

  async function handleStatusChange(booking: BookingRequest, status: BookingStatus) {
    if (!profile) {
      return;
    }

    const contact = getBookingContact(booking, users);
    const result = await updateBookingStatus(booking.id, status, profile.email, {
      email: contact.email || profile.email,
      name: contact.name,
    });

    setBookings((currentValue) =>
      currentValue.map((item) => (item.id === booking.id ? { ...item, status: result.booking.status, updatedAt: result.booking.updatedAt } : item)),
    );
    setFeedback(result.warning ?? `Reserva ${status === "confirmed" ? "confirmada" : "rechazada"} correctamente.`);
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Reservas"
        title="Solicitudes y estados"
        description="Revision manual de solicitudes pendientes, confirmacion o rechazo y seguimiento del estado actual de cada franja."
      />

      <div className="grid gap-4 rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:grid-cols-[14rem_minmax(0,1fr)] md:p-6">
        <FormField label="Estado" htmlFor="booking-filter-status">
          <Select
            id="booking-filter-status"
            value={filters.status}
            onChange={(event) => setFilters((currentValue) => ({ ...currentValue, status: event.target.value as BookingStatus | "all" }))}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="rejected">Rechazada</option>
          </Select>
        </FormField>

        <FormField label="Buscar" htmlFor="booking-filter-query">
          <TextInput
            id="booking-filter-query"
            value={filters.query}
            onChange={(event) => setFilters((currentValue) => ({ ...currentValue, query: event.target.value }))}
            placeholder="Nombre, email, telefono o motivo"
          />
        </FormField>
      </div>

      {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

      <div className="space-y-4">
        {groupedBookings.length ? (
          groupedBookings.map((booking) => {
            const contact = getBookingContact(booking, users);
            return (
              <article key={booking.id} className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                        {formatLongDate(booking.selectedDate)} | {booking.selectedTime}
                      </p>
                      <StatusBadge status={booking.status} />
                      {booking.isDirectBooking ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900">
                          Reserva directa
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-1 text-sm text-on-surface-variant">
                      <p>
                        <strong className="text-on-surface">Paciente:</strong> {contact.name}
                      </p>
                      <p>
                        <strong className="text-on-surface">Email:</strong> {contact.email || "No disponible"}
                      </p>
                      <p>
                        <strong className="text-on-surface">Telefono:</strong> {contact.phone || "No disponible"}
                      </p>
                      <p>
                        <strong className="text-on-surface">Canal preferido:</strong> {booking.contactPreference}
                      </p>
                    </div>
                    <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">{booking.reason}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900"
                      onClick={() => void handleStatusChange(booking, "confirmed")}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-rose-300 bg-rose-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-900"
                      onClick={() => void handleStatusChange(booking, "rejected")}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-on-surface/10 bg-surface px-5 py-10 text-sm text-on-surface-variant">
            No hay reservas que coincidan con los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
}
