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
        description="Actualiza los textos e imagenes visibles en la web manteniendo la estructura, el tono y la jerarquia general."
      />

      <form className="space-y-6" onSubmit={handleSave}>
        <section className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
          <div className="mb-5 space-y-2">
            <p className="eyebrow">Hero</p>
            <h2 className="font-headline text-3xl tracking-tight">Encabezado principal</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Antetitulo" htmlFor="hero-eyebrow">
              <TextInput id="hero-eyebrow" value={draft.hero.eyebrow} onChange={(event) => updateDraft("hero", { ...draft.hero, eyebrow: event.target.value })} />
            </FormField>
            <FormField label="Inicio del titulo" htmlFor="hero-title">
              <TextInput id="hero-title" value={draft.hero.title} onChange={(event) => updateDraft("hero", { ...draft.hero, title: event.target.value })} />
            </FormField>
            <FormField label="Palabra destacada" htmlFor="hero-highlight">
              <TextInput id="hero-highlight" value={draft.hero.highlight} onChange={(event) => updateDraft("hero", { ...draft.hero, highlight: event.target.value })} />
            </FormField>
            <FormField label="Boton principal" htmlFor="hero-cta">
              <TextInput id="hero-cta" value={draft.hero.primaryCtaLabel} onChange={(event) => updateDraft("hero", { ...draft.hero, primaryCtaLabel: event.target.value })} />
            </FormField>
            <FormField label="Imagen principal" htmlFor="hero-image" hint="Introduce la URL completa de la imagen que se mostrara en portada.">
              <TextInput id="hero-image" value={draft.hero.imageUrl} onChange={(event) => updateDraft("hero", { ...draft.hero, imageUrl: event.target.value })} />
            </FormField>
            <FormField label="Descripcion accesible de imagen" htmlFor="hero-alt" hint="Explica brevemente que se ve en la foto.">
              <TextInput id="hero-alt" value={draft.hero.imageAlt} onChange={(event) => updateDraft("hero", { ...draft.hero, imageAlt: event.target.value })} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Texto principal" htmlFor="hero-description">
                <Textarea id="hero-description" value={draft.hero.description} onChange={(event) => updateDraft("hero", { ...draft.hero, description: event.target.value })} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Mensajes cortos" htmlFor="hero-principles" hint="Una linea por mensaje. Se muestran como pildoras en portada.">
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
            <p className="eyebrow">Servicios y perfil profesional</p>
            <h2 className="font-headline text-3xl tracking-tight">Secciones de confianza</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Titulo de servicios" htmlFor="services-title">
                <TextInput
                  id="services-title"
                  value={draft.servicesIntro.title}
                  onChange={(event) => updateDraft("servicesIntro", { ...draft.servicesIntro, title: event.target.value })}
                />
              </FormField>
              <FormField label="Palabra destacada de servicios" htmlFor="services-highlight">
                <TextInput
                  id="services-highlight"
                  value={draft.servicesIntro.highlight}
                  onChange={(event) => updateDraft("servicesIntro", { ...draft.servicesIntro, highlight: event.target.value })}
                />
              </FormField>
              <FormField label="Texto de servicios" htmlFor="services-description">
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
              <FormField label="Apellido o palabra destacada" htmlFor="about-highlight">
                <TextInput id="about-highlight" value={draft.about.highlight} onChange={(event) => updateDraft("about", { ...draft.about, highlight: event.target.value })} />
              </FormField>
              <FormField label="Parrafos sobre Lidia" htmlFor="about-paragraphs" hint="Escribe un parrafo por linea para mantener una lectura clara.">
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
            <p className="eyebrow">Testimonios, espacio y contacto</p>
            <h2 className="font-headline text-3xl tracking-tight">Tramo final de la pagina</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField label="Titulo de testimonios" htmlFor="testimonials-title">
                <TextInput
                  id="testimonials-title"
                  value={draft.testimonialsIntro.title}
                  onChange={(event) => updateDraft("testimonialsIntro", { ...draft.testimonialsIntro, title: event.target.value })}
                />
              </FormField>
              <FormField label="Titulo del espacio" htmlFor="clinic-title">
                <TextInput id="clinic-title" value={draft.clinic.title} onChange={(event) => updateDraft("clinic", { ...draft.clinic, title: event.target.value })} />
              </FormField>
              <FormField label="Texto del espacio" htmlFor="clinic-description">
                <Textarea
                  id="clinic-description"
                  value={draft.clinic.description}
                  onChange={(event) => updateDraft("clinic", { ...draft.clinic, description: event.target.value })}
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <FormField label="Titular de contacto" htmlFor="contact-title">
                <TextInput id="contact-title" value={draft.contact.title} onChange={(event) => updateDraft("contact", { ...draft.contact, title: event.target.value })} />
              </FormField>
              <FormField label="Texto de contacto" htmlFor="contact-description">
                <Textarea
                  id="contact-description"
                  value={draft.contact.description}
                  onChange={(event) => updateDraft("contact", { ...draft.contact, description: event.target.value })}
                />
              </FormField>
              <FormField label="Email de contacto" htmlFor="contact-email">
                <TextInput id="contact-email" value={draft.contact.email} onChange={(event) => updateDraft("contact", { ...draft.contact, email: event.target.value })} />
              </FormField>
              <FormField label="Ubicacion orientativa" htmlFor="contact-address" hint="Texto breve para indicar la zona o como se comparte la direccion.">
                <TextInput
                  id="contact-address"
                  value={draft.contact.addressHint}
                  onChange={(event) => updateDraft("contact", { ...draft.contact, addressHint: event.target.value })}
                />
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
