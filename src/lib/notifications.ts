import { supabase } from "./supabase";
import type { NotificationPayload } from "./types";

export async function sendBookingNotification(payload: NotificationPayload) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.functions.invoke("booking-notifications", {
    body: payload,
  });

  if (error) {
    throw error;
  }
}
