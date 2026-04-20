import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FormField, TextInput } from "../../components/shared/FormField";
import { PageIntro } from "../../components/shared/PageIntro";
import { saveSiteSettings } from "../../lib/data";
import { useSiteSettingsData } from "../../lib/hooks";
import type { SiteSettings } from "../../lib/types";

export function AdminSettingsPage() {
  const { settings } = useSiteSettingsData();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      await saveSiteSettings(draft);
      setFeedback("Ajustes guardados correctamente.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se han podido guardar los ajustes.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<Key extends keyof SiteSettings>(key: Key, value: SiteSettings[Key]) {
    setDraft((currentValue) => ({ ...currentValue, [key]: value }));
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Ajustes"
        title="Parametros operativos"
        description="Horario visible, datos de contacto y direccion donde se reciben las notificaciones de nuevas reservas."
      />

      <form className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Inicio jornada" htmlFor="settings-work-start">
            <TextInput id="settings-work-start" type="time" value={draft.workStart} onChange={(event) => updateField("workStart", event.target.value)} />
          </FormField>
          <FormField label="Fin jornada" htmlFor="settings-work-end">
            <TextInput id="settings-work-end" type="time" value={draft.workEnd} onChange={(event) => updateField("workEnd", event.target.value)} />
          </FormField>
          <FormField label="Duracion de sesion (min)" htmlFor="settings-slot-minutes">
            <TextInput
              id="settings-slot-minutes"
              type="number"
              min="15"
              step="15"
              value={String(draft.slotMinutes)}
              onChange={(event) => updateField("slotMinutes", Number(event.target.value))}
            />
          </FormField>
          <FormField label="Email contacto" htmlFor="settings-contact-email">
            <TextInput id="settings-contact-email" value={draft.contactEmail} onChange={(event) => updateField("contactEmail", event.target.value)} />
          </FormField>
          <FormField label="Telefono contacto" htmlFor="settings-contact-phone">
            <TextInput id="settings-contact-phone" value={draft.contactPhone} onChange={(event) => updateField("contactPhone", event.target.value)} />
          </FormField>
          <FormField label="Email notificaciones" htmlFor="settings-notification-email" hint="Direccion a la que llegan los avisos de nuevas solicitudes.">
            <TextInput
              id="settings-notification-email"
              value={draft.notificationEmail}
              onChange={(event) => updateField("notificationEmail", event.target.value)}
            />
          </FormField>
        </div>

        {feedback ? <div className="mt-4 rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn-editorial inline-flex items-center justify-center" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar ajustes"}
          </button>
        </div>
      </form>
    </div>
  );
}
