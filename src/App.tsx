/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Accessibility, 
  Leaf, 
  MoveHorizontal, 
  Menu,
  Instagram,
  Linkedin,
  MapPin,
  Circle,
  ArrowRight
} from "lucide-react";

const navLinks = [
  { name: "Servicios", href: "#services" },
  { name: "Metodología", href: "#methodology" },
  { name: "Nosotros", href: "#about" },
  { name: "Clínica", href: "#clinic" },
];

const services = [
  {
    title: "General Physiotherapy",
    description: "Comprehensive assessment and manual therapy designed to alleviate acute and chronic musculoskeletal conditions.",
    icon: Accessibility,
    page: "01"
  },
  {
    title: "Pelvic Floor Therapy",
    description: "Specialized, discreet care focusing on the rehabilitation of pelvic floor muscles for women's health and wellness.",
    icon: Leaf,
    page: "02"
  },
  {
    title: "Functional Recovery",
    description: "Targeted exercise regimens and movement re-education to restore optimal biomechanics and prevent future injury.",
    icon: MoveHorizontal,
    page: "03"
  },
];

const methodologySteps = [
  {
    number: "01",
    tag: "Assessment",
    title: "Deep Assessment",
    description: "We begin by listening. A thorough understanding of your history, lifestyle, and goals is essential before any physical intervention occurs.",
  },
  {
    number: "02",
    tag: "Manual",
    title: "Manual Craft",
    description: "Utilizing advanced manual therapy techniques, we address the root cause of dysfunction, not just the symptoms, with precision and care.",
  },
  {
    number: "03",
    tag: "Movement",
    title: "Empowered Movement",
    description: "Recovery is active. We design bespoke movement protocols to ensure you leave with the tools to maintain your health independently.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-surface selection:bg-accent/20">
      {/* Navigation - Editorial Style */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-sm border-b border-on-surface/5">
        <div className="flex justify-between items-baseline w-full px-8 md:px-16 py-8 max-w-[1600px] mx-auto">
          <div className="text-2xl font-semibold tracking-tighter uppercase">
            Lidia Castro<span className="text-[10px] align-top ml-1 font-normal opacity-50 font-body">®</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-12 text-[10px] uppercase tracking-[0.2em] font-semibold">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="hover:opacity-50 transition-opacity duration-300"
              >
                {link.name}
              </a>
            ))}
            <button className="ml-4 hover:text-accent transition-colors">
              Contacto
            </button>
          </div>

          <button className="md:hidden text-on-surface">
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <main className="relative pt-32">
        {/* Hero Section - Editorial Layout */}
        <section className="relative min-h-[90vh] grid grid-cols-12 gap-8 px-8 md:px-16 items-center overflow-hidden">
          <div className="col-span-1 hidden md:flex items-center justify-center">
            <div className="vertical-label">TEMPORADA 2026 — MADRID</div>
          </div>
          
          <div className="col-span-12 md:col-span-6 relative aspect-[4/5] md:aspect-auto md:h-[700px]">
            <div className="frame-corner -top-4 -left-4 border-t-2 border-l-2"></div>
            <div className="w-full h-full overflow-hidden bg-on-surface/5">
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC49OPq6tfxnQESPjW0BTBPdhWuxicx35613manjf8CW933VKDWt1heLf62OJE0GlvZuJT29_sM5OEnX9lUV-0fSQTJ1Tw3X14WhqItMD9Cc9EhSjxbBKlW4ykSS6lwVQn56igftvVlpo-2fwx3fqKVn_7g9jXR6X-IWdtqfPJ46uAkK0PKskhI16eWwkUqH72EfqucMLDYb2RS2TJDpPkXtMZWNRqmd7vgnzxwzFB7hV76OnVKOzMB-OvAVS3GxleHA17MWrae9Q" 
                alt="Architecture of Healing" 
                className="w-full h-full object-cover grayscale brightness-95"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-10 md:pl-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="space-y-4"
            >
              <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent">The Curated Sanctuary</span>
              <h1 className="font-headline text-6xl md:text-8xl leading-[0.9] tracking-tight">
                El Peso del <br /><span className="serif-italic">Silencio</span>
              </h1>
            </motion.div>
            
            <div className="editorial-divider w-24"></div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="max-w-sm"
            >
              <p className="text-sm md:text-base leading-relaxed opacity-80 font-body">
                Un refugio de bienestar donde la técnica se vuelve luz y el espacio se detiene para tu recuperación. Fisioterapia de autor en el corazón de Madrid.
              </p>
            </motion.div>
            
            <button className="btn-editorial w-fit">
              Reserva tu Cita
            </button>
          </div>
        </section>

        {/* Section 2: Value Proposition */}
        <section className="py-40 px-8 md:px-16 grid grid-cols-12 gap-12 items-start bg-surface">
          <div className="col-span-12 md:col-span-4 sticky top-40 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">FILOSOFÍA</span>
            <h2 className="font-headline text-5xl leading-tight tracking-tight">Experiencia <br /><span className="serif-italic">de Renovación</span></h2>
            <div className="editorial-divider w-16"></div>
          </div>
          
          <div className="col-span-12 md:col-span-7 col-start-1 md:col-start-6 space-y-12">
            <p className="text-xl md:text-2xl font-light leading-relaxed text-on-surface-variant">
              Creemos que la verdadera curación ocurre cuando el cuerpo y la mente están en paz. Nuestro espacio está intencionalmente diseñado para eliminar el estrés de los entornos clínicos tradicionales.
            </p>
            <div className="aspect-video overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZVaG0KpRjOKn-qwPNZNbuIxLxkxeV21umTw_C-WpL3DF13PgvPAjVYuXe2lz6Rtx3WMplF__j8QTaXMBI0ExadmPSv-ADfbeALav305bBFGk9h7wTU-QF4gmpzkOgfhuOPIjAbkZK56xl3a_qeicbxWtnv3VqEHp65ZTBKPyURRgdQjeJs1DvYLy6AnmF5Y_XxSprU_0rKY5aqdzKlZieEL2okjOcUBxXfma1nrB5yj92QqQM1kdD3k1QhsF4AgIAtCKaEBiEXw" 
                alt="Tactile Wellness" 
                className="w-full h-full object-cover grayscale opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Services - Grid Layout */}
        <section className="py-40 px-8 md:px-16 border-t border-on-surface/10 bg-surface" id="services">
          <div className="flex justify-between items-end mb-24">
            <h2 className="font-headline text-6xl tracking-tighter italic">Servicios</h2>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-30">ARQUIVO / 01 — 03</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {services.map((service) => (
              <div key={service.title} className="space-y-8 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="serif-italic text-2xl">/{service.page}</span>
                  <div className="w-10 h-10 flex items-center justify-center border border-on-surface/10 rounded-full group-hover:bg-on-surface group-hover:text-surface transition-all duration-500">
                    <Accessibility size={16} strokeWidth={1} />
                  </div>
                </div>
                <div className="editorial-divider"></div>
                <div className="space-y-4">
                  <h3 className="font-headline text-3xl tracking-tight uppercase group-hover:italic transition-all duration-300">{service.title}</h3>
                  <p className="text-sm leading-relaxed opacity-60 font-body">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Methodology - Numbered List */}
        <section className="py-40 px-8 md:px-16 bg-surface" id="methodology">
           <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <div className="vertical-label sticky top-40 mb-12">NUESTRA METODOLOGÍA</div>
              </div>
              <div className="col-span-12 md:col-span-8 space-y-24">
                {methodologySteps.map((step) => (
                  <div key={step.number} className="grid grid-cols-8 gap-8 group">
                    <span className="col-span-8 md:col-span-1 font-headline text-5xl opacity-10 group-hover:opacity-100 transition-opacity">{step.number}</span>
                    <div className="col-span-8 md:col-span-7 space-y-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-accent">{step.tag}</span>
                      <h3 className="font-headline text-4xl tracking-tight">{step.title}</h3>
                      <p className="text-lg opacity-70 leading-relaxed max-w-xl font-body">
                        {step.description}
                      </p>
                      <div className="editorial-divider opacity-20"></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* Section 5: Profile - Editorial Feature */}
        <section className="py-40 px-8 md:px-16 bg-on-surface text-surface overflow-hidden" id="about">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-16 items-center">
             <div className="col-span-12 md:col-span-6 order-2 md:order-1 space-y-12">
                <div className="space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.4em] font-bold opacity-50">LA AUTORA</span>
                  <h2 className="font-headline text-6xl md:text-8xl leading-[0.9] tracking-tighter italic">Lidia Castro Rodríguez</h2>
                </div>
                <div className="editorial-divider bg-surface/10 w-32"></div>
                <div className="space-y-8 text-lg md:text-xl font-light opacity-80 leading-relaxed max-w-lg">
                  <p>Mi práctica nació del deseo de redefinir la experiencia clínica. Vi una brecha entre el tratamiento fisiológico altamente eficaz y el entorno en el que se impartía.</p>
                  <p>Con más de una década de práctica dedicada, mi enfoque sigue siendo tratar al individuo de forma holística.</p>
                </div>
                <div className="pt-8">
                   <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8HoJgNBbAw5MebBjZafzCOaPuIv8ETQNeqKFDPwLM-8k1KreHmA8_TMB5VkaLxmwvrj3VUEqXqn5Y6N9O5G0YQZo1xIsjJl7cHcfqfuNCvReo-ciYIXuvdLeowjDh1ebvczP55vAZ3imw9RoVDJdx2Ldu_tTzrgu5QGnzLf5SQxAcFAoDs-Vs1yhDxOx4saBI4fNyyKdPYqs7trF3hl6Kby6GAeQOZyuu8_xHJ5M0nGW6rmR4rZxHhmqpx8stBUpfFUPMLRzP5w" 
                    alt="Signature" 
                    className="h-16 invert opacity-50"
                    referrerPolicy="no-referrer"
                  />
                </div>
             </div>
             <div className="col-span-12 md:col-span-5 col-start-1 md:col-start-8 order-1 md:order-2 relative">
                <div className="absolute -top-8 -right-8 w-32 h-32 border-t border-right border-surface/20"></div>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAD42zWqjtEdCI5-XEuelOe-b-CrJKjHZNWRRyoJdJxScUgzSGZWpHojqQEQPDH2JO5dSnks9Q5FDZSb9Dec44g9evZ5G_zoHcZzmQ-gLAbUGOB5F70FL-gzSxc0ytQml5vJrDmJiH10IXQKuhAowqKYDWsLGYuMQ-6nXDf3mJM6a9-JuDxuG7Pf0cWBn9GrrW-_Lo62h2xQL2qEjO2sqxMcxyA6xL2qOSDIXn94i-Szlm7dQrX7JUBmYtV0U0Aljoxw_7quBeuA" 
                  alt="Lidia Castro" 
                  className="w-full h-[700px] object-cover grayscale brightness-110 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
             </div>
          </div>
        </section>

        {/* Section 6: Clinic Gallery - Architecture View */}
        <section className="py-40 px-8 md:px-16 bg-surface" id="clinic">
           <div className="flex items-center justify-between mb-24 border-b border-on-surface/10 pb-8">
              <h2 className="font-headline text-5xl tracking-tighter uppercase">05 — EL ESPACIO</h2>
              <div className="flex items-center space-x-6">
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Concepto</span>
                  <span className="serif-italic text-sm">Minimalismo Sensorial</span>
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[600px]">
              <div className="md:col-span-8 overflow-hidden group">
                 <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDubBqsu5Ao1uuyY0It4tz7rUJrLqGp1YTFCb9H-NEDKXYMJ3kRhED_KHG6ucc4fck4edrdZT6nNEzXkEC_b5THSNRrUXQA5Ok5XHliZAAqeQrcc5f_OVrt9PJROyXzKd-WhfimGjyl4OsVxL8iusE_Kc1joGATI5nqwc60qAYd3PzUOl-3BnQP_ozg29Jql-G3mvAFihdZ3XDhpb4QFGnTThSFPIphslENBikj0NH6-qR2llTgA0zIloG4DkfH89aVBb92j4yX5w" 
                  alt="Main Lounge" 
                  className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:col-span-4 flex flex-col justify-between p-12 bg-on-surface text-surface">
                 <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">Localización</span>
                    <h3 className="font-headline text-3xl leading-tight italic">Diseñado para aquietar la mente</h3>
                 </div>
                 <p className="text-sm opacity-70 leading-relaxed font-body">Una arquitectura de la quietud, donde cada material ha sido seleccionado por su honestidad y capacidad para sanar.</p>
                 <ArrowRight className="opacity-40" />
              </div>
           </div>
        </section>

        {/* Section 7: Final Call to Action */}
        <section className="py-60 px-8 md:px-16 text-center bg-surface">
           <div className="max-w-2xl mx-auto space-y-12">
             <div className="space-y-4">
               <span className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-40 italic block">— El comienzo —</span>
               <h2 className="font-headline text-7xl md:text-9xl leading-[0.8] tracking-tighter">Tu sanación <br /><span className="serif-italic">empieza aquí</span></h2>
             </div>
             <p className="text-xl opacity-60 leading-relaxed font-body">Plazas limitadas para asegurar una atención personalizada y profunda.</p>
             <button className="btn-editorial">Reservar Sesión</button>
           </div>
        </section>
      </main>

      {/* Footer - Monolith Style */}
      <footer className="w-full bg-surface border-t border-on-surface/10 px-8 md:px-16 py-16">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="flex items-center space-x-12">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Dirección</span>
              <span className="serif-italic text-sm">Calle Serenidad 12, MADRID</span>
            </div>
            <div className="h-12 w-[1px] bg-on-surface/10"></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Contacto</span>
              <span className="text-xs font-semibold font-body tracking-wider">+34 912 345 678</span>
            </div>
          </div>

          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-12 h-[2px] ${i === 1 ? 'bg-on-surface' : 'bg-on-surface/10'}`}></div>
            ))}
          </div>

          <div className="text-[10px] tracking-tighter flex items-center space-x-4 font-body uppercase font-bold">
            <span className="opacity-40">INSTAGRAM</span>
            <span className="opacity-40">LINKEDIN</span>
            <span className="underline cursor-pointer">VOLVER ARRIBA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
