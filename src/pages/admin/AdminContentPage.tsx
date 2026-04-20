import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FormField, TextInput, Textarea } from "../../components/shared/FormField";
import { PageIntro } from "../../components/shared/PageIntro";
import { saveSiteContent } from "../../lib/data";
import { useSiteContentData } from "../../lib/hooks";
import type { SiteContent } from "../../lib/types";

function joinLines(values: string[]) {
  return values.join("\n");
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminContentPage() {
  const { content } = useSiteContentData();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await saveSiteContent(draft);
      setFeedback("Contenido guardado correctamente.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se ha podido guardar el contenido.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateDraft(section: keyof SiteContent, value: SiteContent[keyof SiteContent]) {
    setDraft((currentValue) => ({ ...currentValue, [section]: value }));
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contenido web"
        title="Edicion por secciones"
        description="Campos clave para actualizar textos e imagenes sin alterar la estructura general de la web."
      />

      <form className="space-y-6" onSubmit={handleSave}>
        <section className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
          <div className="mb-5 space-y-2">
            <p className="eyebrow">Hero</p>
            <h2 className="font-headline text-3xl tracking-tight">Encabezado principal</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Eyebrow" htmlFor="hero-eyebrow">
              <TextInput id="hero-eyebrow" value={draft.hero.eyebrow} onChange={(event) => updateDraft("hero", { ...draft.hero, eyebrow: event.target.value })} />
            </FormField>
            <FormField label="Titulo" htmlFor="hero-title">
              <TextInput id="hero-title" value={draft.hero.title} onChange={(event) => updateDraft("hero", { ...draft.hero, title: event.target.value })} />
            </FormField>
            <FormField label="Highlight" htmlFor="hero-highlight">
              <TextInput id="hero-highlight" value={draft.hero.highlight} onChange={(event) => updateDraft("hero", { ...draft.hero, highlight: event.target.value })} />
            </FormField>
            <FormField label="CTA principal" htmlFor="hero-cta">
              <TextInput id="hero-cta" value={draft.hero.primaryCtaLabel} onChange={(event) => updateDraft("hero", { ...draft.hero, primaryCtaLabel: event.target.value })} />
            </FormField>
            <FormField label="URL imagen" htmlFor="hero-image" hint="La imagen se actualiza mediante una URL externa.">
              <TextInput id="hero-image" value={draft.hero.imageUrl} onChange={(event) => updateDraft("hero", { ...draft.hero, imageUrl: event.target.value })} />
            </FormField>
            <FormField label="Imagen alt" htmlFor="hero-alt">
              <TextInput id="hero-alt" value={draft.hero.imageAlt} onChange={(event) => updateDraft("hero", { ...draft.hero, imageAlt: event.target.value })} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Descripcion" htmlFor="hero-description">
                <Textarea id="hero-description" value={draft.hero.description} onChange={(event) => updateDraft("hero", { ...draft.hero, description: event.target.value })} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Pildoras" htmlFor="hero-principles" hint="Una linea por item.">
                <Textarea
                  id="hero-principles"
                  value={joinLines(draft.hero.principles)}
                  onChange={(event) => updateDraft("hero", { ...draft.hero, principles: splitLines(event.target.value) })}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
          <div className="mb-5 space-y-2">
            <p className="eyebrow">Servicios y sobre Lidia</p>
            <h2 className="font-headline text-3xl tracking-tight">Bloques de marca</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Intro servicios" htmlFor="services-title">
                <TextInput
                  id="services-title"
                  value={draft.servicesIntro.title}
                  onChange={(event) => updateDraft("servicesIntro", { ...draft.servicesIntro, title: event.target.value })}
                />
              </FormField>
              <FormField label="Highlight servicios" htmlFor="services-highlight">
                <TextInput
                  id="services-highlight"
                  value={draft.servicesIntro.highlight}
                  onChange={(event) => updateDraft("servicesIntro", { ...draft.servicesIntro, highlight: event.target.value })}
                />
              </FormField>
              <FormField label="Descripcion servicios" htmlFor="services-description">
                <Textarea
                  id="services-description"
                  value={draft.servicesIntro.description}
                  onChange={(event) => updateDraft("servicesIntro", { ...draft.servicesIntro, description: event.target.value })}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Titulo sobre Lidia" htmlFor="about-title">
                <TextInput id="about-title" value={draft.about.title} onChange={(event) => updateDraft("about", { ...draft.about, title: event.target.value })} />
              </FormField>
              <FormField label="Highlight sobre Lidia" htmlFor="about-highlight">
                <TextInput id="about-highlight" value={draft.about.highlight} onChange={(event) => updateDraft("about", { ...draft.about, highlight: event.target.value })} />
              </FormField>
              <FormField label="Parrafos sobre Lidia" htmlFor="about-paragraphs" hint="Un parrafo por linea.">
                <Textarea
                  id="about-paragraphs"
                  value={joinLines(draft.about.paragraphs)}
                  onChange={(event) => updateDraft("about", { ...draft.about, paragraphs: splitLines(event.target.value) })}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
          <div className="mb-5 space-y-2">
            <p className="eyebrow">Testimonios, clinica y contacto</p>
            <h2 className="font-headline text-3xl tracking-tight">Cierre de la web</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Titulo testimonios" htmlFor="testimonials-title">
                <TextInput
                  id="testimonials-title"
                  value={draft.testimonialsIntro.title}
                  onChange={(event) => updateDraft("testimonialsIntro", { ...draft.testimonialsIntro, title: event.target.value })}
                />
              </FormField>
              <FormField label="Titulo clinica" htmlFor="clinic-title">
                <TextInput id="clinic-title" value={draft.clinic.title} onChange={(event) => updateDraft("clinic", { ...draft.clinic, title: event.target.value })} />
              </FormField>
              <FormField label="Descripcion clinica" htmlFor="clinic-description">
                <Textarea
                  id="clinic-description"
                  value={draft.clinic.description}
                  onChange={(event) => updateDraft("clinic", { ...draft.clinic, description: event.target.value })}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Titulo contacto" htmlFor="contact-title">
                <TextInput id="contact-title" value={draft.contact.title} onChange={(event) => updateDraft("contact", { ...draft.contact, title: event.target.value })} />
              </FormField>
              <FormField label="Descripcion contacto" htmlFor="contact-description">
                <Textarea
                  id="contact-description"
                  value={draft.contact.description}
                  onChange={(event) => updateDraft("contact", { ...draft.contact, description: event.target.value })}
                />
              </FormField>
              <FormField label="Email contacto" htmlFor="contact-email">
                <TextInput id="contact-email" value={draft.contact.email} onChange={(event) => updateDraft("contact", { ...draft.contact, email: event.target.value })} />
              </FormField>
            </div>
          </div>
        </section>

        {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

        <div className="flex justify-end">
          <button type="submit" className="btn-editorial inline-flex items-center justify-center" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
