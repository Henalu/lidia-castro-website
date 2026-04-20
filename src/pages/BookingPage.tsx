import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { FormField, Select, TextInput, Textarea } from "../components/shared/FormField";
import { useAuth } from "../context/auth-context";
import { createBooking, getPublicAvailability } from "../lib/data";
import { generateTimeSlots, getSlotState, getUpcomingWorkingDays } from "../lib/availability";
import { formatLongDate } from "../lib/format";
import { useSiteSettingsData } from "../lib/hooks";
import type { BookingFormInput, CalendarBlock, BookingRequest, ContactPreference, SiteSettings } from "../lib/types";

type CalendarDayState = "available" | "limited" | "full" | "blocked" | "closed" | "past" | "outside";

type CalendarDay = {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isDisabled: boolean;
  state: CalendarDayState;
  availableSlots: number;
};

const emptyForm: BookingFormInput = {
  fullName: "",
  email: "",
  phone: "",
  contactPreference: "email",
  selectedDate: "",
  selectedTime: "",
  reason: "",
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

function getCalendarDayState(
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

  const availableSlots = slots.filter((slot) => getSlotState(bookings, blocks, iso, slot) === "available").length;
  const state: CalendarDayState =
    availableSlots === 0
      ? blocks.some((block) => block.blockDate === iso && block.blockType === "day")
        ? "blocked"
        : "full"
      : availableSlots === slots.length
        ? "available"
        : "limited";

  return {
    iso,
    dayNumber: date.getDate(),
    inCurrentMonth,
    isDisabled: availableSlots === 0,
    state,
    availableSlots,
  };
}

export function BookingPage() {
  const { profile } = useAuth();
  const { settings, isLoading: settingsLoading } = useSiteSettingsData();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<BookingFormInput>(emptyForm);
  const todayIso = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return toIsoDate(today);
  }, []);

  const firstAvailableDate = useMemo(() => getUpcomingWorkingDays(settings, 1)[0] ?? "", [settings]);
  const slots = useMemo(() => generateTimeSlots(settings), [settings]);
  const minVisibleMonth = useMemo(() => {
    const source = firstAvailableDate ? new Date(`${firstAvailableDate}T12:00:00`) : new Date();
    return toMonthStart(source);
  }, [firstAvailableDate]);
  const maxVisibleMonth = useMemo(() => addMonths(minVisibleMonth, 2), [minVisibleMonth]);
  const [visibleMonth, setVisibleMonth] = useState<Date>(minVisibleMonth);

  useEffect(() => {
    setVisibleMonth(minVisibleMonth);
  }, [minVisibleMonth]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const availability = await getPublicAvailability();
        if (!cancelled) {
          setBookings(availability.bookings);
          setBlocks(availability.blocks);
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
  }, []);

  useEffect(() => {
    setForm((currentValue) => ({
      ...currentValue,
      fullName: profile?.fullName ?? currentValue.fullName,
      email: profile?.email ?? currentValue.email,
      phone: profile?.phone ?? currentValue.phone,
      contactPreference: profile?.contactPreference ?? currentValue.contactPreference,
    }));
  }, [profile]);

  useEffect(() => {
    if (!form.selectedDate && firstAvailableDate) {
      setForm((currentValue) => ({ ...currentValue, selectedDate: firstAvailableDate }));
    }
  }, [firstAvailableDate, form.selectedDate]);

  useEffect(() => {
    if (!form.selectedDate || !form.selectedTime) {
      return;
    }

    if (getSlotState(bookings, blocks, form.selectedDate, form.selectedTime) !== "available") {
      setForm((currentValue) => ({ ...currentValue, selectedTime: "" }));
    }
  }, [blocks, bookings, form.selectedDate, form.selectedTime]);

  useEffect(() => {
    if (!form.selectedDate) {
      return;
    }

    const selectedMonth = toMonthStart(new Date(`${form.selectedDate}T12:00:00`));
    if (getMonthKey(selectedMonth) !== getMonthKey(visibleMonth)) {
      setVisibleMonth(selectedMonth);
    }
  }, [form.selectedDate, visibleMonth]);

  const calendarDays = useMemo(() => {
    const monthStart = toMonthStart(visibleMonth);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return getCalendarDayState(day, visibleMonth, todayIso, settings, bookings, blocks, slots);
    });
  }, [blocks, bookings, settings, slots, todayIso, visibleMonth]);

  const monthNavigation = useMemo(
    () => ({
      canGoPrev: getMonthKey(visibleMonth) !== getMonthKey(minVisibleMonth),
      canGoNext: getMonthKey(visibleMonth) !== getMonthKey(maxVisibleMonth),
    }),
    [maxVisibleMonth, minVisibleMonth, visibleMonth],
  );

  const selectedDateSummary = form.selectedDate ? formatLongDate(form.selectedDate) : "Selecciona un dia en el calendario";

  function updateField<Key extends keyof BookingFormInput>(key: Key, value: BookingFormInput[Key]) {
    setForm((currentValue) => ({ ...currentValue, [key]: value }));
    setErrors((currentValue) => ({ ...currentValue, [key]: "" }));
  }

  function selectDate(date: string) {
    setForm((currentValue) => ({
      ...currentValue,
      selectedDate: date,
      selectedTime: "",
    }));
    setErrors((currentValue) => ({ ...currentValue, selectedDate: "", selectedTime: "" }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.selectedDate) {
      nextErrors.selectedDate = "Selecciona un dia.";
    }
    if (!form.selectedTime) {
      nextErrors.selectedTime = "Selecciona una hora.";
    }
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Introduce tu nombre y apellidos.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Introduce tu email.";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Introduce tu telefono.";
    }
    if (!form.reason.trim()) {
      nextErrors.reason = "Cuentanos brevemente tu motivo de consulta.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setWarning(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBooking(form, profile, settings);
      setBookings((currentValue) => [result.booking, ...currentValue]);
      setFeedback(
        result.booking.status === "confirmed"
          ? "Tu cita ha quedado registrada y confirmada."
          : "Solicitud enviada correctamente. Lidia revisara tu reserva y contactara contigo en breve.",
      );
      setWarning(result.warning ?? null);
      setForm((currentValue) => ({
        ...emptyForm,
        fullName: profile?.fullName ?? "",
        email: profile?.email ?? "",
        phone: profile?.phone ?? "",
        contactPreference: profile?.contactPreference ?? "email",
        selectedDate: currentValue.selectedDate,
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se ha podido enviar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section-shell">
      <div className="container-shell grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">Reserva</p>
            <h1 className="section-title text-[clamp(2.7rem,6vw,4.6rem)]">Elige dia, hora y cuentanos que necesitas.</h1>
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
              Selecciona la fecha que mejor te encaje, comparte tu motivo de consulta y envia tu solicitud de cita de forma sencilla.
            </p>
          </div>

          <div className="rounded-[2rem] border border-on-surface/10 bg-surface-container/55 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-on-surface/8 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-on-surface/50">Agenda disponible</p>
                <p className="mt-1 text-sm text-on-surface-variant">Lunes a viernes, sesiones de 1 hora entre {settings.workStart} y {settings.workEnd}.</p>
              </div>
              {profile ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900">
                  {profile.canBookDirect ? "Reserva directa" : "Paciente registrado"}
                </span>
              ) : (
                <span className="rounded-full bg-on-surface/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface/60">
                  Reserva como invitado
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">1. Elige un dia</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Solo se activan dias laborables con al menos una franja libre.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-on-surface/10 bg-surface transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                      onClick={() => setVisibleMonth((currentValue) => addMonths(currentValue, -1))}
                      disabled={!monthNavigation.canGoPrev}
                      aria-label="Mes anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-on-surface/10 bg-surface transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                      onClick={() => setVisibleMonth((currentValue) => addMonths(currentValue, 1))}
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
                    <p className="text-xs text-on-surface-variant">Horario base: {settings.workStart} - {settings.workEnd}</p>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekdayLabels.map((weekday) => (
                      <div key={weekday} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface/40">
                        {weekday}
                      </div>
                    ))}

                    {calendarDays.map((day) => {
                      const isSelected = form.selectedDate === day.iso;
                      const stateStyles: Record<CalendarDayState, string> = {
                        available: "border-on-surface/10 bg-surface text-on-surface hover:border-accent/45",
                        limited: "border-accent/20 bg-accent/7 text-on-surface hover:border-accent/45",
                        full: "border-on-surface/8 bg-on-surface/[0.03] text-on-surface/35",
                        blocked: "border-on-surface/8 bg-on-surface/[0.04] text-on-surface/35",
                        closed: "border-transparent bg-transparent text-on-surface/20",
                        past: "border-transparent bg-transparent text-on-surface/18",
                        outside: "border-transparent bg-transparent text-on-surface/12",
                      };
                      const markerStyles: Record<Exclude<CalendarDayState, "closed" | "past" | "outside">, string> = {
                        available: "bg-emerald-500",
                        limited: "bg-amber-500",
                        full: "bg-on-surface/20",
                        blocked: "bg-rose-400",
                      };

                      return (
                        <button
                          key={day.iso}
                          type="button"
                          disabled={day.isDisabled || settingsLoading || isLoading}
                          className={`relative min-h-16 rounded-[1.1rem] border p-2 text-left transition-colors sm:min-h-[4.75rem] ${
                            isSelected ? "border-on-surface bg-on-surface text-surface" : stateStyles[day.state]
                          } ${day.isDisabled ? "cursor-not-allowed" : ""}`}
                          onClick={() => selectDate(day.iso)}
                          aria-pressed={isSelected}
                        >
                          <span className="block text-sm font-semibold">{day.dayNumber}</span>
                          {day.state === "available" || day.state === "limited" ? (
                            <span className={`mt-3 inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? "bg-surface" : markerStyles[day.state]}`} />
                          ) : null}
                          {day.state === "full" || day.state === "blocked" ? (
                            <span className={`mt-3 inline-flex h-2.5 w-2.5 rounded-full ${isSelected ? "bg-surface" : markerStyles[day.state]}`} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-on-surface/48">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Disponible
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      Quedan huecos
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-on-surface/20" />
                      Completo
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      Bloqueado
                    </span>
                  </div>
                </div>
                {errors.selectedDate ? <p className="text-xs text-rose-700">{errors.selectedDate}</p> : null}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">2. Selecciona una franja</p>
                  <p className="text-sm text-on-surface-variant">{selectedDateSummary}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const slotState = getSlotState(bookings, blocks, form.selectedDate, slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={slotState !== "available" || settingsLoading || isLoading}
                        className={`rounded-[1.25rem] border px-4 py-3 text-left text-sm transition-colors ${
                          form.selectedTime === slot
                            ? "border-on-surface bg-on-surface text-surface"
                            : "border-on-surface/10 bg-surface"
                        } ${slotState !== "available" ? "cursor-not-allowed opacity-45" : "hover:border-on-surface/25"}`}
                        onClick={() => updateField("selectedTime", slot)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{slot}</span>
                          <span className="text-[10px] uppercase tracking-[0.16em]">
                            {slotState === "available" ? "Disponible" : slotState === "reserved" ? "Reservada" : "Bloqueada"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.selectedTime ? <p className="text-xs text-rose-700">{errors.selectedTime}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-on-surface/10 bg-surface-container/55 p-5 sm:p-6">
          <div className="mb-6 space-y-2">
            <p className="eyebrow">Tus datos</p>
            <h2 className="font-headline text-3xl tracking-tight">Enviar solicitud de reserva</h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {profile
                ? "Tus datos ya aparecen precargados desde tu perfil. Solo revisalos y describe tu motivo de consulta."
                : "Puedes reservar sin registrarte. Si en el futuro quieres agilizar nuevas reservas, tambien podras crear tu cuenta."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="Nombre y apellidos" htmlFor="booking-name" error={errors.fullName}>
              <TextInput
                id="booking-name"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Nombre y apellidos"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="booking-email" error={errors.email}>
                <TextInput
                  id="booking-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </FormField>

              <FormField label="Telefono" htmlFor="booking-phone" error={errors.phone}>
                <TextInput
                  id="booking-phone"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+34 600 000 000"
                />
              </FormField>
            </div>

            <FormField label="Canal preferido de contacto" htmlFor="booking-contact">
              <Select
                id="booking-contact"
                value={form.contactPreference}
                onChange={(event) => updateField("contactPreference", event.target.value as ContactPreference)}
              >
                <option value="email">Email</option>
                <option value="phone">Telefono</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </FormField>

            <FormField
              label="Motivo de consulta"
              htmlFor="booking-reason"
              error={errors.reason}
              hint="Cuentanos brevemente que te ocurre o que necesitas tratar."
            >
              <Textarea
                id="booking-reason"
                value={form.reason}
                onChange={(event) => updateField("reason", event.target.value)}
                placeholder="Describe tu problema, molestias actuales o el motivo por el que quieres reservar."
              />
            </FormField>

            {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}
            {warning ? <div className="rounded-[1.25rem] bg-amber-100 px-4 py-3 text-sm text-amber-900">{warning}</div> : null}

            <button type="submit" className="btn-editorial inline-flex w-full items-center justify-center" disabled={isSubmitting || isLoading || settingsLoading}>
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </button>

            {!profile ? (
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Si prefieres guardar tus datos para futuras reservas, puedes <Link to="/registro" className="text-accent underline">crear una cuenta</Link>.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
