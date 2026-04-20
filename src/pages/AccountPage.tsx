import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FormField, Select, TextInput } from "../components/shared/FormField";
import { PageIntro } from "../components/shared/PageIntro";
import { StatusBadge } from "../components/shared/StatusBadge";
import { useAuth } from "../context/auth-context";
import { listMyBookings } from "../lib/data";
import { formatLongDate } from "../lib/format";
import type { BookingRequest, ContactPreference, SexOption } from "../lib/types";

export function AccountPage() {
  const { profile, updateProfileAction } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    age: profile?.age ? String(profile.age) : "",
    sex: profile?.sex ?? ("not_specified" as SexOption),
    contactPreference: profile?.contactPreference ?? ("email" as ContactPreference),
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      const nextBookings = await listMyBookings(profile);
      if (!cancelled) {
        setBookings(nextBookings);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      fullName: profile.fullName,
      phone: profile.phone,
      age: profile.age ? String(profile.age) : "",
      sex: profile.sex,
      contactPreference: profile.contactPreference,
    });
  }, [profile]);

  if (!profile) {
    return null;
  }

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((currentValue) => ({ ...currentValue, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      await updateProfileAction({
        fullName: form.fullName,
        phone: form.phone,
        age: form.age ? Number(form.age) : null,
        sex: form.sex,
        contactPreference: form.contactPreference,
      });
      setFeedback("Perfil actualizado correctamente.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se ha podido actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="section-shell">
      <div className="container-shell space-y-8">
        <PageIntro
          eyebrow="Mi cuenta"
          title={`Hola, ${profile.fullName.split(" ")[0]}`}
          description="Aqui puedes revisar tus datos, tu preferencia de contacto y el historial de tus solicitudes."
          action={
            <Link to="/reservar" className="btn-editorial inline-flex items-center justify-center">
              Nueva reserva
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(22rem,1.15fr)]">
          <form className="rounded-[2rem] border border-on-surface/10 bg-surface-container/55 p-6 sm:p-7" onSubmit={handleSubmit}>
            <div className="mb-6 space-y-2">
              <p className="eyebrow">Perfil</p>
              <h2 className="font-headline text-3xl tracking-tight">Tus datos personales</h2>
            </div>

            <div className="space-y-4">
              <FormField label="Nombre y apellidos" htmlFor="account-name">
                <TextInput id="account-name" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
              </FormField>

              <FormField label="Email" htmlFor="account-email" hint="El email esta vinculado al acceso de tu cuenta y no se edita desde esta pantalla.">
                <TextInput id="account-email" value={profile.email} readOnly disabled />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Telefono" htmlFor="account-phone">
                  <TextInput id="account-phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
                </FormField>

                <FormField label="Edad" htmlFor="account-age">
                  <TextInput id="account-age" type="number" min="0" value={form.age} onChange={(event) => updateField("age", event.target.value)} />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Sexo" htmlFor="account-sex">
                  <Select id="account-sex" value={form.sex} onChange={(event) => updateField("sex", event.target.value as SexOption)}>
                    <option value="female">Femenino</option>
                    <option value="male">Masculino</option>
                    <option value="not_specified">No quiere indicarlo</option>
                  </Select>
                </FormField>

                <FormField label="Canal preferido" htmlFor="account-contact">
                  <Select id="account-contact" value={form.contactPreference} onChange={(event) => updateField("contactPreference", event.target.value as ContactPreference)}>
                    <option value="email">Email</option>
                    <option value="phone">Telefono</option>
                    <option value="whatsapp">WhatsApp</option>
                  </Select>
                </FormField>
              </div>

              <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm text-on-surface-variant">
                {profile.canBookDirect
                  ? "Tu cuenta tiene permiso de reserva directa. Las nuevas reservas pueden quedar confirmadas automaticamente."
                  : "Tus reservas se enviaran como solicitud para que Lidia pueda revisarlas y confirmarlas."}
              </div>

              {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

              <button type="submit" className="btn-editorial inline-flex w-full items-center justify-center" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-on-surface/10 bg-surface-container/55 p-6 sm:p-7">
            <div className="mb-6 space-y-2">
              <p className="eyebrow">Solicitudes</p>
              <h2 className="font-headline text-3xl tracking-tight">Historial de reservas</h2>
            </div>

            {bookings.length ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <article key={booking.id} className="rounded-[1.5rem] border border-on-surface/10 bg-surface p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em]">
                          {formatLongDate(booking.selectedDate)} | {booking.selectedTime}
                        </p>
                        <p className="text-sm leading-relaxed text-on-surface-variant">{booking.reason}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-on-surface/10 bg-surface px-5 py-8 text-sm leading-relaxed text-on-surface-variant">
                Aun no tienes solicitudes guardadas. Puedes hacer la primera desde <Link to="/reservar" className="text-accent underline">Reservar cita</Link>.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
