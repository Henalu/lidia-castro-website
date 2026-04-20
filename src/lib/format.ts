const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatLongDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

export function formatShortDate(date: string) {
  return shortDateFormatter.format(new Date(`${date}T12:00:00`));
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
