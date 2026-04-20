import { useEffect, useMemo, useState } from "react";
import { PageIntro } from "../../components/shared/PageIntro";
import { useAuth } from "../../context/auth-context";
import { createCalendarBlock, deleteCalendarBlock, getPublicAvailability } from "../../lib/data";
import { generateTimeSlots, getSlotState, getUpcomingWorkingDays, isDayBlocked } from "../../lib/availability";
import { formatLongDate } from "../../lib/format";
import { useSiteSettingsData } from "../../lib/hooks";
import type { BookingRequest, CalendarBlock } from "../../lib/types";

export function AdminCalendarPage() {
  const { profile } = useAuth();
  const { settings } = useSiteSettingsData();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const upcomingDays = useMemo(() => getUpcomingWorkingDays(settings, 15), [settings]);
  const slots = useMemo(() => generateTimeSlots(settings), [settings]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const availability = await getPublicAvailability();
      if (!cancelled) {
        setBookings(availability.bookings);
        setBlocks(availability.blocks);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate && upcomingDays.length) {
      setSelectedDate(upcomingDays[0]);
    }
  }, [selectedDate, upcomingDays]);

  async function toggleDayBlock() {
    if (!profile || !selectedDate) {
      return;
    }

    const existingDayBlock = blocks.find((block) => block.blockType === "day" && block.blockDate === selectedDate);

    if (existingDayBlock) {
      await deleteCalendarBlock(existingDayBlock.id);
      setBlocks((currentValue) => currentValue.filter((item) => item.id !== existingDayBlock.id));
      setFeedback("Dia desbloqueado correctamente.");
      return;
    }

    const block = await createCalendarBlock({
      blockType: "day",
      blockDate: selectedDate,
      blockTime: null,
      reason: "Bloqueo manual desde admin.",
      createdBy: profile.id,
    });
    setBlocks((currentValue) => [...currentValue, block]);
    setFeedback("Dia bloqueado correctamente.");
  }

  async function toggleSlotBlock(time: string) {
    if (!profile || !selectedDate) {
      return;
    }

    const existingBlock = blocks.find(
      (block) => block.blockType === "slot" && block.blockDate === selectedDate && block.blockTime === time,
    );

    if (existingBlock) {
      await deleteCalendarBlock(existingBlock.id);
      setBlocks((currentValue) => currentValue.filter((item) => item.id !== existingBlock.id));
      setFeedback(`Sesion ${time} desbloqueada.`);
      return;
    }

    const block = await createCalendarBlock({
      blockType: "slot",
      blockDate: selectedDate,
      blockTime: time,
      reason: "Bloqueo manual desde admin.",
      createdBy: profile.id,
    });
    setBlocks((currentValue) => [...currentValue, block]);
    setFeedback(`Sesion ${time} bloqueada.`);
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Calendario"
        title="Agenda y bloqueos"
        description="Vista operativa de disponibilidad. Desde aqui Lidia puede bloquear dias completos o sesiones concretas para mantener la agenda controlada."
      />

      {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5">
          <div className="mb-4 space-y-2">
            <p className="eyebrow">Dias</p>
            <h2 className="font-headline text-3xl tracking-tight">Proximas fechas</h2>
          </div>
          <div className="grid gap-2">
            {upcomingDays.map((day) => (
              <button
                key={day}
                type="button"
                className={`rounded-[1.25rem] border px-4 py-3 text-left text-sm transition-colors ${
                  selectedDate === day ? "border-on-surface bg-on-surface text-surface" : "border-on-surface/10 bg-surface"
                }`}
                onClick={() => setSelectedDate(day)}
              >
                {formatLongDate(day)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="eyebrow">Dia seleccionado</p>
                <h2 className="mt-2 font-headline text-3xl tracking-tight">{selectedDate ? formatLongDate(selectedDate) : "Selecciona una fecha"}</h2>
              </div>
              <button type="button" className="btn-editorial inline-flex items-center justify-center" onClick={() => void toggleDayBlock()}>
                {selectedDate && isDayBlocked(blocks, selectedDate) ? "Desbloquear dia" : "Bloquear dia"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot) => {
              const state = getSlotState(bookings, blocks, selectedDate, slot);
              return (
                <article key={slot} className="rounded-[1.5rem] border border-on-surface/10 bg-surface-container/55 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">{slot}</p>
                  <p className="mt-3 text-sm text-on-surface-variant">
                    {state === "available" ? "Libre para reservar" : state === "reserved" ? "Ocupada por reserva" : "Bloqueada manualmente"}
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-full border border-on-surface/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    onClick={() => void toggleSlotBlock(slot)}
                    disabled={state === "reserved"}
                  >
                    {state === "blocked" ? "Desbloquear" : "Bloquear"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
