import type { BookingRequest, CalendarBlock, SiteSettings } from "./types";

export function generateTimeSlots(settings: SiteSettings) {
  const slots: string[] = [];
  const [startHour, startMinute] = settings.workStart.split(":").map(Number);
  const [endHour, endMinute] = settings.workEnd.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let current = start; current < end; current += settings.slotMinutes) {
    const hour = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const minute = (current % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
  }

  return slots;
}

export function getUpcomingWorkingDays(settings: SiteSettings, amount = 15) {
  const days: string[] = [];
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  while (days.length < amount) {
    const weekday = date.getDay();
    if (settings.workingDays.includes(weekday)) {
      days.push(date.toISOString().slice(0, 10));
    }
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export function isDayBlocked(blocks: CalendarBlock[], date: string) {
  return blocks.some((block) => block.blockType === "day" && block.blockDate === date);
}

export function isSlotBlocked(blocks: CalendarBlock[], date: string, time: string) {
  return blocks.some((block) => {
    if (block.blockDate !== date) {
      return false;
    }

    if (block.blockType === "day") {
      return true;
    }

    return block.blockTime === time;
  });
}

export function isSlotReserved(bookings: BookingRequest[], date: string, time: string) {
  return bookings.some(
    (booking) =>
      booking.selectedDate === date &&
      booking.selectedTime === time &&
      (booking.status === "pending" || booking.status === "confirmed"),
  );
}

export function getSlotState(bookings: BookingRequest[], blocks: CalendarBlock[], date: string, time: string) {
  if (isDayBlocked(blocks, date) || isSlotBlocked(blocks, date, time)) {
    return "blocked";
  }

  if (isSlotReserved(bookings, date, time)) {
    return "reserved";
  }

  return "available";
}
