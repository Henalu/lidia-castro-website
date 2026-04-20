const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type NotificationType = "booking-requested" | "booking-confirmed" | "booking-rejected";

type BookingPayload = {
  selectedDate: string;
  selectedTime: string;
  reason: string;
  status: "pending" | "confirmed" | "rejected";
};

type NotificationPayload = {
  type: NotificationType;
  adminEmail: string;
  booking: BookingPayload;
  recipientEmail: string;
  recipientName: string;
};

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${date}T12:00:00+02:00`));
}

function bookingSummary(booking: BookingPayload) {
  return `${formatDate(booking.selectedDate)} a las ${booking.selectedTime}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMessages(payload: NotificationPayload): EmailMessage[] {
  const summary = bookingSummary(payload.booking);
  const reason = escapeHtml(payload.booking.reason || "Sin detalle adicional.");

  if (payload.type === "booking-requested") {
    return [
      {
        to: payload.adminEmail,
        subject: `Nueva solicitud de reserva: ${summary}`,
        text: [
          "Ha entrado una nueva solicitud de reserva.",
          `Paciente: ${payload.recipientName}`,
          `Fecha: ${summary}`,
          `Motivo: ${payload.booking.reason || "Sin detalle adicional."}`,
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f1d1b;">
            <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#7b746f;">Lidia Castro Fisioterapia</p>
            <h1 style="font-size:28px;line-height:1.15;margin:0 0 16px;">Nueva solicitud de reserva</h1>
            <p style="font-size:16px;line-height:1.7;">${escapeHtml(payload.recipientName)} ha enviado una solicitud para <strong>${escapeHtml(summary)}</strong>.</p>
            <div style="margin-top:20px;padding:18px;border:1px solid #e4ddd6;border-radius:18px;background:#faf7f2;">
              <p style="margin:0 0 8px;"><strong>Motivo de consulta</strong></p>
              <p style="margin:0;line-height:1.7;">${reason}</p>
            </div>
          </div>
        `,
      },
      {
        to: payload.recipientEmail,
        subject: "Hemos recibido tu solicitud de reserva",
        text: [
          `Hola ${payload.recipientName},`,
          "",
          `Hemos recibido tu solicitud para ${summary}.`,
          "Lidia revisara la disponibilidad y te respondera en breve.",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f1d1b;">
            <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#7b746f;">Lidia Castro Fisioterapia</p>
            <h1 style="font-size:28px;line-height:1.15;margin:0 0 16px;">Solicitud recibida</h1>
            <p style="font-size:16px;line-height:1.7;">Hola ${escapeHtml(payload.recipientName)}, hemos recibido tu solicitud para <strong>${escapeHtml(summary)}</strong>.</p>
            <p style="font-size:16px;line-height:1.7;">Lidia revisara la agenda y te respondera lo antes posible por tu canal preferido.</p>
          </div>
        `,
      },
    ];
  }

  if (payload.type === "booking-confirmed") {
    return [
      {
        to: payload.recipientEmail,
        subject: "Tu cita ha sido confirmada",
        text: [
          `Hola ${payload.recipientName},`,
          "",
          `Tu cita para ${summary} ha quedado confirmada.`,
          "Si necesitas moverla, responde a este email.",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f1d1b;">
            <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#7b746f;">Lidia Castro Fisioterapia</p>
            <h1 style="font-size:28px;line-height:1.15;margin:0 0 16px;">Tu cita esta confirmada</h1>
            <p style="font-size:16px;line-height:1.7;">Hola ${escapeHtml(payload.recipientName)}, tu cita para <strong>${escapeHtml(summary)}</strong> ha quedado confirmada.</p>
          </div>
        `,
      },
    ];
  }

  return [
    {
      to: payload.recipientEmail,
      subject: "Necesitamos reprogramar tu solicitud",
      text: [
        `Hola ${payload.recipientName},`,
        "",
        `Tu solicitud para ${summary} no ha podido confirmarse en ese hueco.`,
        "Puedes responder a este email para proponer otra franja.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f1d1b;">
          <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#7b746f;">Lidia Castro Fisioterapia</p>
          <h1 style="font-size:28px;line-height:1.15;margin:0 0 16px;">Necesitamos reprogramar</h1>
          <p style="font-size:16px;line-height:1.7;">Hola ${escapeHtml(payload.recipientName)}, la solicitud para <strong>${escapeHtml(summary)}</strong> no ha podido confirmarse en ese hueco.</p>
          <p style="font-size:16px;line-height:1.7;">Si quieres, responde a este email y buscamos otra franja que te encaje.</p>
        </div>
      `,
    },
  ];
}

async function sendWithResend(message: EmailMessage, apiKey: string, from: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`resend_error:${response.status}:${details}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("BOOKING_FROM_EMAIL") ?? "Lidia Castro Demo <onboarding@resend.dev>";

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await request.json()) as NotificationPayload;

    if (!payload?.type || !payload?.booking?.selectedDate || !payload?.booking?.selectedTime || !payload?.recipientEmail) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = buildMessages(payload);
    await Promise.all(messages.map((message) => sendWithResend(message, resendApiKey, fromEmail)));

    return new Response(JSON.stringify({ ok: true, sent: messages.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
