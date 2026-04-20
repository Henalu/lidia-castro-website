import type { BookingRequest, CalendarBlock, Profile, SiteContent, SiteSettings } from "./types";

const now = "2026-04-20T10:00:00.000Z";

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: "Fisioterapia especializada en Madrid",
    title: "El arte de",
    highlight: "sanar",
    description:
      "Un espacio de fisioterapia para aliviar el dolor, recuperar movimiento y entender que necesita tu cuerpo. Atencion cercana, criterio clinico y tratamiento personalizado desde la primera sesion.",
    primaryCtaLabel: "Reservar primera sesion",
    secondaryCtaLabel: "Ver especialidades",
    imageUrl:
      "https://images.pexels.com/photos/20860621/pexels-photo-20860621.jpeg?cs=srgb&dl=pexels-funkcines-terapijos-centras-927573878-20860621.jpg&fm=jpg",
    imageAlt: "Sesion guiada de recuperacion funcional en clinica",
    principles: [
      "Valoracion individual",
      "Terapia manual y ejercicio terapeutico",
      "Atencion personalizada en Madrid",
    ],
  },
  servicesIntro: {
    eyebrow: "Filosofia y servicios",
    title: "Fisioterapia adaptada",
    highlight: "a ti",
    description:
      "Cada tratamiento parte de una valoracion clara y de objetivos realistas. Menos soluciones genericas y mas trabajo ajustado a tu dolor, tu historia y tu momento.",
    imageUrl:
      "https://images.pexels.com/photos/20860606/pexels-photo-20860606.jpeg?cs=srgb&dl=pexels-funkcines-terapijos-centras-927573878-20860606.jpg&fm=jpg",
    imageAlt: "Fisioterapeuta trabajando terapia manual con una paciente",
  },
  services: [
    {
      page: "01",
      title: "Fisioterapia General",
      description:
        "Valoracion completa y terapia manual para aliviar dolencias musculoesqueleticas agudas y cronicas. Un tratamiento pensado para ti, desde el primer momento.",
      icon: "accessibility",
    },
    {
      page: "02",
      title: "Suelo Pelvico",
      description:
        "Atencion especializada y discreta para la rehabilitacion del suelo pelvico. Cuidado integral de la salud femenina en todas sus etapas.",
      icon: "leaf",
    },
    {
      page: "03",
      title: "Recuperacion Funcional",
      description:
        "Protocolos de ejercicio y reeducacion del movimiento para restaurar tu biomecanica optima y prevenir futuras lesiones.",
      icon: "move",
    },
  ],
  methodologyIntro: {
    eyebrow: "Metodologia",
    label: "NUESTRA METODOLOGIA",
  },
  methodologySteps: [
    {
      number: "01",
      tag: "Valoracion",
      title: "Escuchar antes de intervenir",
      description:
        "Empezamos con una valoracion completa para entender tu historial, tus sintomas y que esta limitando hoy tu dia a dia. A partir de ahi definimos un plan con sentido para tu caso.",
    },
    {
      number: "02",
      tag: "Tratamiento",
      title: "Terapia manual precisa",
      description:
        "Cada tecnica se elige segun lo que necesitas en ese momento. El objetivo es aliviar el dolor, mejorar la movilidad y ayudarte a recuperar seguridad en el movimiento.",
    },
    {
      number: "03",
      tag: "Movimiento",
      title: "Recuperacion que perdura",
      description:
        "La sesion no termina en la camilla. Te guiamos con ejercicio terapeutico y pautas claras para consolidar la mejoria y prevenir recaidas.",
    },
  ],
  about: {
    eyebrow: "La especialista",
    title: "Lidia Castro",
    highlight: "Rodriguez",
    paragraphs: [
      "Mi forma de trabajar parte de una idea sencilla: cada persona necesita una valoracion seria, un tratamiento bien explicado y un espacio donde sentirse atendida de verdad.",
      "Con experiencia en fisioterapia musculoesqueletica y recuperacion funcional, mi enfoque combina terapia manual, ejercicio terapeutico y seguimiento cercano para adaptar cada sesion a la evolucion de tu caso.",
    ],
    badges: [
      "Valoracion individual",
      "Tratamiento manual y ejercicio",
      "Seguimiento cercano",
      "Enfoque personalizado",
    ],
    note: "Un enfoque centrado en explicar bien cada proceso, adaptar el tratamiento y acompanar la evolucion de cada persona con cercania y criterio clinico.",
    imageUrl:
      "https://images.pexels.com/photos/35260720/pexels-photo-35260720.jpeg?cs=srgb&dl=pexels-8pcarlos-morocho-2150734957-35260720.jpg&fm=jpg",
    imageAlt: "Retrato profesional femenino en una clinica moderna",
  },
  testimonialsIntro: {
    eyebrow: "Pacientes",
    title: "Opiniones que transmiten confianza",
    description: "Experiencias que reflejan una atencion cercana, profesional y orientada a resultados reales.",
  },
  testimonials: [
    {
      name: "Carmen R.",
      service: "Fisioterapia General",
      quote:
        "Llevaba meses con dolor lumbar cronico. Despues de cuatro sesiones con Lidia, volvi a dormir del tiron. Su forma de escuchar antes de tratar marca la diferencia.",
    },
    {
      name: "Marta L.",
      service: "Rehabilitacion de Suelo Pelvico",
      quote:
        "Acudi por problemas de suelo pelvico despues del parto. El trato fue tan delicado y profesional que me senti completamente segura desde el primer momento.",
    },
    {
      name: "Sofia M.",
      service: "Recuperacion Funcional",
      quote:
        "Volvi a correr seis semanas antes de lo que esperaba. El protocolo de recuperacion que disenyo para mi fue completamente personalizado.",
    },
  ],
  clinic: {
    eyebrow: "El espacio",
    title: "Una consulta pensada para tratar con calma y precision",
    conceptLabel: "Concepto",
    conceptValue: "Calma, luz y privacidad",
    description:
      "Un entorno cuidado para que la sesion sea comoda, tranquila y centrada en tu tratamiento desde que entras por la puerta.",
    location: "Madrid",
    imageUrl:
      "https://images.pexels.com/photos/5619453/pexels-photo-5619453.jpeg?cs=srgb&dl=pexels-nicobecker-5619453.jpg&fm=jpg",
    imageAlt: "Interior luminoso de una clinica de tratamiento",
  },
  finalCta: {
    eyebrow: "Reserva",
    title: "Da el primer paso",
    highlight: "con confianza",
    description:
      "Si quieres valorar tu caso, elige dia y hora y envia tu solicitud. A partir de ahi, Lidia podra revisar la agenda y responderte personalmente.",
    buttonLabel: "Solicitar cita",
  },
  contact: {
    eyebrow: "Contacto",
    title: "Hablemos sobre tu caso.",
    description:
      "Si prefieres escribir antes de reservar, aqui tienes un punto de contacto claro para resolver dudas y valorar el siguiente paso.",
    email: "info@lidiacastro.es",
    addressHint: "Pendiente de confirmar con la clinica.",
    instagramLabel: "Instagram",
    linkedinLabel: "LinkedIn",
  },
};

export const defaultSiteSettings: SiteSettings = {
  workStart: "09:00",
  workEnd: "17:00",
  slotMinutes: 60,
  workingDays: [1, 2, 3, 4, 5],
  contactEmail: "info@lidiacastro.es",
  contactPhone: "+34 600 000 000",
  notificationEmail: "lidia@demo.local",
};

export const seededProfiles: Array<Profile & { password: string }> = [
  {
    id: "superadmin-lidia",
    fullName: "Lidia Castro Rodriguez",
    email: "lidia@demo.local",
    phone: "+34 600 000 001",
    age: 37,
    sex: "female",
    contactPreference: "email",
    role: "superadmin",
    canBookDirect: true,
    status: "active",
    createdAt: now,
    adminNotes: "Cuenta demo de superadmin.",
    password: "demo1234",
  },
  {
    id: "patient-demo",
    fullName: "Clara Fuentes",
    email: "clara@demo.local",
    phone: "+34 600 000 002",
    age: 31,
    sex: "female",
    contactPreference: "whatsapp",
    role: "patient",
    canBookDirect: false,
    status: "active",
    createdAt: now,
    adminNotes: "",
    password: "demo1234",
  },
  {
    id: "patient-direct",
    fullName: "Andrea Ruiz",
    email: "andrea@demo.local",
    phone: "+34 600 000 003",
    age: 42,
    sex: "female",
    contactPreference: "phone",
    role: "patient",
    canBookDirect: true,
    status: "active",
    createdAt: now,
    adminNotes: "Paciente recurrente con permiso de reserva directa.",
    password: "demo1234",
  },
];

export const seededBookings: BookingRequest[] = [
  {
    id: "booking-seeded-1",
    profileId: "patient-demo",
    guestName: null,
    guestEmail: null,
    guestPhone: null,
    contactPreference: "whatsapp",
    selectedDate: "2026-04-22",
    selectedTime: "10:00",
    reason: "Dolor lumbar y tension acumulada despues de varias semanas de trabajo sentado.",
    status: "pending",
    isDirectBooking: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "booking-seeded-2",
    profileId: null,
    guestName: "Laura Vega",
    guestEmail: "laura@example.com",
    guestPhone: "+34 600 000 050",
    contactPreference: "email",
    selectedDate: "2026-04-23",
    selectedTime: "12:00",
    reason: "Recuperacion de hombro y revision de movilidad.",
    status: "confirmed",
    isDirectBooking: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const seededBlocks: CalendarBlock[] = [
  {
    id: "block-seeded-1",
    blockType: "slot",
    blockDate: "2026-04-24",
    blockTime: "15:00",
    reason: "Cita externa bloqueada por la clinica.",
    createdAt: now,
    createdBy: "superadmin-lidia",
  },
];

export const localDemoCredentials = {
  superadmin: {
    email: "lidia@demo.local",
    password: "demo1234",
  },
  patient: {
    email: "clara@demo.local",
    password: "demo1234",
  },
  directBookingPatient: {
    email: "andrea@demo.local",
    password: "demo1234",
  },
};
