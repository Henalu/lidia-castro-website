import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Circle, CircleDot, Minus, X } from "lucide-react";
import { PageIntro } from "../../components/shared/PageIntro";
import { useAuth } from "../../context/auth-context";
import { generateTimeSlots, getSlotState } from "../../lib/availability";
import { createCalendarBlock, deleteCalendarBlock, getPublicAvailability } from "../../lib/data";
import { formatLongDate } from "../../lib/format";
import { useSiteSettingsData } from "../../lib/hooks";
import type { BookingRequest, CalendarBlock, SiteSettings } from "../../lib/types";

type CalendarDayState = "available" | "limited" | "full" | "blocked" | "closed" | "past" | "outside";

type CalendarDay = {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isDisabled: boolean;
  state: CalendarDayState;
  availableSlots: number;
};

const weekdayLabels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function toMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
}

function toIsoDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getFirstSelectableDateInMonth(monthDate: Date, settings: SiteSettings, todayIso: string) {
  const monthStart = toMonthStart(monthDate);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const candidate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day, 12, 0, 0, 0);
    const iso = toIsoDate(candidate);
    const weekday = candidate.getDay();

    if (iso >= todayIso && settings.workingDays.includes(weekday)) {
      return iso;
    }
  }

  return "";
}

function getCalendarDayStatusLabel(day: CalendarDay) {
  switch (day.state) {
    case "available":
      return "Dia totalmente disponible.";
    case "limited":
      return day.availableSlots === 1 ? "Disponibilidad parcial. Queda 1 hueco." : `Disponibilidad parcial. Quedan ${day.availableSlots} huecos.`;
    case "full":
      return "Agenda completa por reservas.";
    case "blocked":
      return "Dia bloqueado manualmente.";
    case "closed":
      return "Dia no laborable.";
    case "past":
      return "Fecha pasada.";
    case "outside":
      return "Fuera del mes actual.";
  }
}

function getCalendarDayAriaLabel(day: CalendarDay, isSelected: boolean) {
  const selectionLabel = isSelected ? " Dia seleccionado." : "";
  return `${formatLongDate(day.iso)}. ${getCalendarDayStatusLabel(day)}${selectionLabel}`;
}

function AdminCalendarDayMarker({ day, isSelected }: { day: CalendarDay; isSelected: boolean }) {
  switch (day.state) {
    case "available":
      return (
        <Circle
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${isSelected ? "fill-surface text-surface" : "fill-emerald-500 text-emerald-500"}`}
          strokeWidth={1.8}
        />
      );
    case "limited":
      return <CircleDot aria-hidden="true" className={`h-3.5 w-3.5 ${isSelected ? "text-surface" : "text-amber-600"}`} strokeWidth={1.9} />;
    case "full":
      return <Minus aria-hidden="true" className={`h-3.5 w-3.5 ${isSelected ? "text-surface" : "text-on-surface/60"}`} strokeWidth={2.4} />;
    case "blocked":
      return <X aria-hidden="true" className={`h-3.5 w-3.5 ${isSelected ? "text-surface" : "text-rose-500"}`} strokeWidth={2.1} />;
    default:
      return null;
  }
}

function getAdminCalendarDayState(
  date: Date,
  monthDate: Date,
  todayIso: string,
  settings: SiteSettings,
  bookings: BookingRequest[],
  blocks: CalendarBlock[],
  slots: string[],
): CalendarDay {
  const iso = toIsoDate(date);
  const inCurrentMonth = date.getMonth() === monthDate.getMonth();
  const weekday = date.getDay();
  const isWorkingDay = settings.workingDays.includes(weekday);

  if (!inCurrentMonth) {
    return {
      iso,
      dayNumber: date.getDate(),
      inCurrentMonth,
      isDisabled: true,
      state: "outside",
      availableSlots: 0,
    };
  }

  if (iso < todayIso) {
    return {
      iso,
      dayNumber: date.getDate(),
      inCurrentMonth,
      isDisabled: true,
      state: "past",
      availableSlots: 0,
    };
  }

  if (!isWorkingDay) {
    return {
      iso,
      dayNumber: date.getDate(),
      inCurrentMonth,
      isDisabled: true,
      state: "closed",
      availableSlots: 0,
    };
  }

  const hasDayBlock = blocks.some((block) => block.blockDate === iso && block.blockType === "day");
  const availableSlots = slots.filter((slot) => getSlotState(bookings, blocks, iso, slot) === "available").length;
  const state: CalendarDayState =
    hasDayBlock ? "blocked" : availableSlots === slots.length ? "available" : availableSlots > 0 ? "limited" : "full";

  return {
    iso,
    dayNumber: date.getDate(),
    inCurrentMonth,
    isDisabled: false,
    state,
    availableSlots,
  };
}

export function AdminCalendarPage() {
  const { profile } = useAuth();
  const { settings, isLoading: settingsLoading } = useSiteSettingsData();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityReloadKey, setAvailabilityReloadKey] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(() => toMonthStart(new Date()));

  const todayIso = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return toIsoDate(today);
  }, []);

  const slots = useMemo(() => generateTimeSlots(settings), [settings]);
  const currentMonth = useMemo(() => toMonthStart(new Date(`${todayIso}T12:00:00`)), [todayIso]);
  const minVisibleMonth = useMemo(() => addMonths(currentMonth, -11), [currentMonth]);
  const maxVisibleMonth = useMemo(() => addMonths(currentMonth, 11), [currentMonth]);

  useEffect(() => {
    setVisibleMonth(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const availability = await getPublicAvailability();
        if (!cancelled) {
          setBookings(availability.bookings);
          setBlocks(availability.blocks);
          setAvailabilityError(null);
        }
      } catch {
        if (!cancelled) {
          setAvailabilityError("No hemos podido cargar la agenda ahora mismo. Vuelve a intentarlo en unos segundos.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [availabilityReloadKey]);

  useEffect(() => {
    if (selectedDate) {
      return;
    }

    const firstSelectableDate = getFirstSelectableDateInMonth(currentMonth, settings, todayIso);
    if (firstSelectableDate) {
      setSelectedDate(firstSelectableDate);
    }
  }, [currentMonth, selectedDate, settings, todayIso]);

  const calendarDays = useMemo(() => {
    const monthStart = toMonthStart(visibleMonth);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return getAdminCalendarDayState(day, visibleMonth, todayIso, settings, bookings, blocks, slots);
    });
  }, [blocks, bookings, settings, slots, todayIso, visibleMonth]);

  const monthNavigation = useMemo(
    () => ({
      canGoPrev: getMonthKey(visibleMonth) !== getMonthKey(minVisibleMonth),
      canGoNext: getMonthKey(visibleMonth) !== getMonthKey(maxVisibleMonth),
    }),
    [maxVisibleMonth, minVisibleMonth, visibleMonth],
  );

  const selectedDateSummary = selectedDate ? formatLongDate(selectedDate) : "Selecciona un dia para gestionar la agenda";
  const selectedDayIsBlocked = selectedDate
    ? blocks.some((block) => block.blockType === "day" && block.blockDate === selectedDate)
    : false;

  function handleMonthChange(amount: number) {
    const nextMonth = addMonths(visibleMonth, amount);
    setVisibleMonth(nextMonth);
    setFeedback(null);

    const selectedMonthKey = selectedDate ? getMonthKey(toMonthStart(new Date(`${selectedDate}T12:00:00`))) : "";
    if (selectedMonthKey !== getMonthKey(nextMonth)) {
      const nextSelectableDate = getFirstSelectableDateInMonth(nextMonth, settings, todayIso);
      if (nextSelectableDate) {
        setSelectedDate(nextSelectableDate);
      }
    }
  }

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
        description="Vista operativa de disponibilidad. Desde aqui Lidia puede revisar la agenda mes a mes y bloquear dias completos o sesiones concretas."
      />

      {feedback ? (
        <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm" role="status">
          {feedback}
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-on-surface/10 bg-surface-container/55 p-5 sm:p-6" aria-busy={isLoading || settingsLoading}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-on-surface/8 pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-on-surface/50">Agenda operativa</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Navega por meses, revisa el estado de cada jornada y bloquea solo donde realmente lo necesites.
            </p>
          </div>
          <span className="rounded-full bg-on-surface/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface/60">
            Horario base {settings.workStart} - {settings.workEnd}
          </span>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(20rem,0.86fr)_minmax(0,1.14fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">1. Elige un dia</p>
                <p className="mt-1 text-sm text-on-surface-variant">Puedes abrir dias disponibles, completos o bloqueados para gestionarlos.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-on-surface/10 bg-surface transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                  onClick={() => handleMonthChange(-1)}
                  disabled={!monthNavigation.canGoPrev}
                  aria-label="Mes anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-on-surface/10 bg-surface transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                  onClick={() => handleMonthChange(1)}
                  disabled={!monthNavigation.canGoNext}
                  aria-label="Mes siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-on-surface/10 bg-surface p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-on-surface/55">{formatMonthLabel(visibleMonth)}</p>
                <p className="text-xs text-on-surface-variant">Gestion manual de disponibilidad</p>
              </div>

              {availabilityError ? (
                <div className="mb-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">
                  <p>{availabilityError}</p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-rose-300"
                    onClick={() => setAvailabilityReloadKey((currentValue) => currentValue + 1)}
                  >
                    Reintentar
                  </button>
                </div>
              ) : null}

              {!availabilityError && (isLoading || settingsLoading) ? (
                <div className="mb-4 rounded-[1.25rem] border border-on-surface/8 bg-on-surface/[0.03] px-4 py-3 text-sm text-on-surface-variant" role="status">
                  Cargando agenda...
                </div>
              ) : null}

              <div className="grid grid-cols-7 gap-2">
                {weekdayLabels.map((weekday) => (
                  <div key={weekday} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface/40">
                    {weekday}
                  </div>
                ))}

                {calendarDays.map((day) => {
                  const isSelected = selectedDate === day.iso;
                  const stateStyles: Record<CalendarDayState, string> = {
                    available: "border-on-surface/10 bg-surface text-on-surface hover:border-accent/45",
                    limited: "border-accent/20 bg-accent/7 text-on-surface hover:border-accent/45",
                    full: "border-on-surface/8 bg-on-surface/[0.035] text-on-surface/72 hover:border-on-surface/20",
                    blocked: "border-rose-200 bg-rose-50/80 text-on-surface/78 hover:border-rose-300",
                    closed: "border-transparent bg-transparent text-on-surface/42",
                    past: "border-transparent bg-transparent text-on-surface/42",
                    outside: "border-transparent bg-transparent text-on-surface/28",
                  };

                  return (
                    <button
                      key={day.iso}
                      type="button"
                      disabled={day.isDisabled || settingsLoading || isLoading}
                      className={`relative min-h-16 rounded-[1.1rem] border p-2 text-left transition-colors sm:min-h-[4.75rem] ${
                        isSelected ? "border-on-surface bg-on-surface text-surface" : stateStyles[day.state]
                      } ${day.isDisabled ? "cursor-not-allowed" : ""}`}
                      onClick={() => {
                        setSelectedDate(day.iso);
                        setFeedback(null);
                      }}
                      aria-pressed={isSelected}
                      aria-label={getCalendarDayAriaLabel(day, isSelected)}
                      title={getCalendarDayStatusLabel(day)}
                    >
                      <span className="block text-sm font-semibold">{day.dayNumber}</span>
                      <span className="sr-only">{getCalendarDayStatusLabel(day)}</span>
                      {day.state !== "closed" && day.state !== "past" && day.state !== "outside" ? (
                        <span className="mt-3 inline-flex items-center justify-start">
                          <AdminCalendarDayMarker day={day} isSelected={isSelected} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-on-surface/48">
                <span className="inline-flex items-center gap-2">
                  <Circle aria-hidden="true" className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" strokeWidth={1.8} />
                  Disponible
                </span>
                <span className="inline-flex items-center gap-2">
                  <CircleDot aria-hidden="true" className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.9} />
                  Quedan huecos
                </span>
                <span className="inline-flex items-center gap-2">
                  <Minus aria-hidden="true" className="h-3.5 w-3.5 text-on-surface/60" strokeWidth={2.4} />
                  Completo
                </span>
                <span className="inline-flex items-center gap-2">
                  <X aria-hidden="true" className="h-3.5 w-3.5 text-rose-500" strokeWidth={2.1} />
                  Bloqueado
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-on-surface/10 bg-surface p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="eyebrow">Dia seleccionado</p>
                  <h2 className="mt-2 font-headline text-3xl tracking-tight">{selectedDateSummary}</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {selectedDayIsBlocked
                      ? "La jornada esta cerrada manualmente. Puedes reabrirla cuando quieras."
                      : "Gestiona desde aqui los bloqueos puntuales sin perder de vista la disponibilidad real."}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-editorial inline-flex items-center justify-center"
                  onClick={() => void toggleDayBlock()}
                  disabled={!selectedDate || isLoading || settingsLoading}
                >
                  {selectedDayIsBlocked ? "Desbloquear dia" : "Bloquear dia"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">2. Gestiona las franjas</p>
                <p className="text-sm text-on-surface-variant">Las horas reservadas se muestran bloqueadas para accion manual y las libres pueden cerrarse con un clic.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
                {slots.map((slot) => {
                  const state = getSlotState(bookings, blocks, selectedDate, slot);
                  const statusLabel =
                    state === "available" ? "Libre para reservar" : state === "reserved" ? "Reservada por paciente" : "Bloqueada manualmente";

                  return (
                    <article key={slot} className="rounded-[1.5rem] border border-on-surface/10 bg-surface p-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em]">{slot}</p>
                        <span
                          className={`max-w-full text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] ${
                            state === "available"
                              ? "text-emerald-700"
                              : state === "reserved"
                                ? "text-on-surface/58"
                                : "text-rose-700"
                          }`}
                        >
                          {state === "available" ? "Disponible" : state === "reserved" ? "Reservada" : "Bloqueada"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-on-surface-variant">{statusLabel}</p>

                      <button
                        type="button"
                        className="mt-4 rounded-full border border-on-surface/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() => void toggleSlotBlock(slot)}
                        disabled={state === "reserved" || !selectedDate || isLoading || settingsLoading}
                      >
                        {state === "blocked" ? "Desbloquear" : state === "reserved" ? "Reservada" : "Bloquear"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
