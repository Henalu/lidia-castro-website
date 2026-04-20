import { motion } from "motion/react";
import { Accessibility, ArrowRight, Leaf, MoveHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import type { SiteContent } from "../../lib/types";

const iconMap = {
  accessibility: Accessibility,
  leaf: Leaf,
  move: MoveHorizontal,
};

export function LandingSections({ content }: { content: SiteContent }) {
  return (
    <>
      <section className="hero-shell container-shell overflow-hidden px-5 pb-0 sm:px-6 md:px-10">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.82fr)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.72fr)] lg:gap-16">
          <div className="order-1 min-w-0 max-w-xl space-y-6 md:order-2 md:pl-6 lg:max-w-[34rem]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <span className="eyebrow text-accent">{content.hero.eyebrow}</span>
              <h1 className="display-hero">
                {content.hero.title} <span className="serif-italic">{content.hero.highlight}</span>
              </h1>
            </motion.div>

            <div className="editorial-divider max-w-24" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.7 }}
              className="space-y-5"
            >
              <p className="max-w-lg text-base leading-relaxed text-on-surface-variant sm:text-lg">{content.hero.description}</p>

              <div className="flex flex-wrap gap-2.5">
                {content.hero.principles.map((principle) => (
                  <span
                    key={principle}
                    className="rounded-full border border-on-surface/10 bg-surface-container/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant"
                  >
                    {principle}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/reservar" className="btn-editorial inline-flex w-fit items-center justify-center">
                  {content.hero.primaryCtaLabel}
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition-colors duration-300 hover:text-accent"
                >
                  {content.hero.secondaryCtaLabel}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 min-w-0 md:order-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-on-surface/5 sm:aspect-[5/4] md:h-[34rem] md:aspect-auto md:rounded-[2.5rem] lg:h-[42rem]">
              <div className="frame-corner left-4 top-4 hidden border-l-2 border-t-2 sm:block" />
              <img src={content.hero.imageUrl} alt={content.hero.imageAlt} loading="eager" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell section-anchor bg-surface" id="services">
        <div className="container-shell grid gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14">
          <div className="space-y-5 md:sticky md:top-32 md:self-start">
            <span className="eyebrow">{content.servicesIntro.eyebrow}</span>
            <h2 className="section-title">
              {content.servicesIntro.title}
              <span className="serif-italic"> {content.servicesIntro.highlight}</span>
            </h2>
            <div className="editorial-divider max-w-20" />
            <p className="max-w-md text-base leading-relaxed text-on-surface-variant sm:text-lg">{content.servicesIntro.description}</p>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem]">
              <img src={content.servicesIntro.imageUrl} alt={content.servicesIntro.imageAlt} loading="lazy" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {content.services.map((service) => {
                const ServiceIcon = iconMap[service.icon];
                return (
                  <article
                    key={service.title}
                    className="flex h-full flex-col gap-6 rounded-[1.75rem] border border-on-surface/10 bg-surface-container/65 p-6 shadow-[0_18px_50px_rgba(26,26,26,0.04)] transition-transform duration-500 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="serif-italic text-2xl text-on-surface/60">/{service.page}</span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-on-surface/10 bg-surface">
                        <ServiceIcon size={18} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="editorial-divider" />
                    <div className="space-y-3">
                      <h3 className="font-headline text-[1.9rem] leading-none tracking-tight">{service.title}</h3>
                      <p className="text-sm leading-relaxed text-on-surface-variant">{service.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-anchor bg-surface pt-0" id="methodology">
        <div className="container-shell grid gap-10 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:gap-12">
          <div className="space-y-4">
            <span className="eyebrow md:hidden">{content.methodologyIntro.eyebrow}</span>
            <div className="vertical-label hidden md:block md:sticky md:top-32">{content.methodologyIntro.label}</div>
          </div>

          <div className="space-y-5">
            {content.methodologySteps.map((step) => (
              <article key={step.number} className="grid gap-4 rounded-[1.75rem] border border-on-surface/8 bg-surface-container/45 p-6 md:grid-cols-[auto_1fr] md:gap-6 md:p-8">
                <span className="font-headline text-5xl leading-none text-on-surface/14 md:text-6xl">{step.number}</span>
                <div className="space-y-4">
                  <span className="eyebrow text-accent">{step.tag}</span>
                  <h3 className="font-headline text-3xl leading-tight tracking-tight sm:text-4xl">{step.title}</h3>
                  <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">{step.description}</p>
                  <div className="editorial-divider opacity-35" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-anchor overflow-hidden bg-on-surface text-surface" id="about">
        <div className="container-shell grid items-center gap-10 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.88fr)] md:gap-16">
          <div className="order-2 space-y-8 md:order-1">
            <div className="space-y-4">
              <span className="eyebrow text-surface/55">{content.about.eyebrow}</span>
              <h2 className="section-title max-w-3xl text-surface">
                {content.about.title}
                <span className="serif-italic"> {content.about.highlight}</span>
              </h2>
            </div>
            <div className="editorial-divider max-w-28 bg-surface/12" />
            <div className="space-y-5 text-base leading-relaxed text-surface/78 sm:text-lg">
              {content.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="rounded-[1.5rem] border border-surface/10 bg-surface/5 p-5 text-sm leading-relaxed text-surface/72">{content.about.note}</div>
            <div className="grid gap-3 border-t border-surface/10 pt-6 text-sm uppercase tracking-[0.18em] text-surface/58 sm:grid-cols-2">
              {content.about.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface/5 md:min-h-[40rem]">
              <div className="frame-corner right-5 top-5 hidden border-r border-t border-surface/18 sm:block" />
              <img src={content.about.imageUrl} alt={content.about.imageAlt} loading="lazy" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-surface" id="testimonios">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 border-b border-on-surface/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="eyebrow">{content.testimonialsIntro.eyebrow}</span>
              <h2 className="section-title">{content.testimonialsIntro.title}</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">{content.testimonialsIntro.description}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {content.testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-[1.75rem] border border-on-surface/10 p-6 md:p-7">
                <p className="font-headline text-[1.45rem] italic leading-relaxed text-on-surface/82">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="editorial-divider my-6 max-w-14" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em]">{testimonial.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-on-surface/45">{testimonial.service}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell section-anchor bg-surface pt-0" id="clinic">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 border-b border-on-surface/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="eyebrow">{content.clinic.eyebrow}</span>
              <h2 className="section-title">{content.clinic.title}</h2>
            </div>
            <div className="space-y-1 text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface/38">{content.clinic.conceptLabel}</span>
              <p className="serif-italic text-base text-on-surface/72">{content.clinic.conceptValue}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="group overflow-hidden rounded-[2rem] bg-on-surface/5 md:min-h-[34rem]">
              <img src={content.clinic.imageUrl} alt={content.clinic.imageAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>

            <div className="flex flex-col justify-between rounded-[2rem] bg-on-surface px-6 py-8 text-surface md:px-8 md:py-10">
              <div className="space-y-4">
                <span className="eyebrow text-surface/55">Localizacion</span>
                <h3 className="font-headline text-3xl leading-tight tracking-tight sm:text-4xl">Un entorno cuidado para que puedas centrarte en tu recuperacion.</h3>
              </div>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-surface/72">{content.clinic.description}</p>
              <div className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-surface/55">
                <ArrowRight aria-hidden="true" size={16} />
                {content.clinic.location}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-surface text-center">
        <div className="container-shell max-w-3xl space-y-8">
          <span className="eyebrow block">{content.finalCta.eyebrow}</span>
          <h2 className="display-hero text-[clamp(3rem,11vw,6.8rem)] leading-[0.86]">
            {content.finalCta.title}
            <span className="serif-italic"> {content.finalCta.highlight}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">{content.finalCta.description}</p>
          <Link to="/reservar" className="btn-editorial inline-flex items-center justify-center">
            {content.finalCta.buttonLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
