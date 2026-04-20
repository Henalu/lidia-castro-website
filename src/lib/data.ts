import { defaultSiteContent, defaultSiteSettings, seededBlocks, seededBookings, seededProfiles } from "./defaults";
import { isDayBlocked, isSlotBlocked, isSlotReserved } from "./availability";
import { isSupabaseConfigured } from "./env";
import { sendBookingNotification } from "./notifications";
import { supabase } from "./supabase";
import type {
  BookingFilters,
  BookingFormInput,
  BookingRequest,
  BookingStatus,
  CalendarBlock,
  DashboardStats,
  LoginInput,
  Profile,
  RegisterInput,
  SiteContent,
  SiteSettings,
} from "./types";
import { createId } from "./utils";

type LocalStoredUser = Profile & { password: string };

const STORAGE_KEYS = {
  users: "lidia-demo-users",
  bookings: "lidia-demo-bookings",
  blocks: "lidia-demo-calendar-blocks",
  session: "lidia-demo-session",
  siteContent: "lidia-demo-site-content",
  siteSettings: "lidia-demo-site-settings",
} as const;

function canUseStorage() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function initializeLocalDemo() {
  if (isSupabaseConfigured || !canUseStorage()) {
    return;
  }

  readStorage(STORAGE_KEYS.users, seededProfiles);
  readStorage(STORAGE_KEYS.bookings, seededBookings);
  readStorage(STORAGE_KEYS.blocks, seededBlocks);
  readStorage(STORAGE_KEYS.siteContent, defaultSiteContent);
  readStorage(STORAGE_KEYS.siteSettings, defaultSiteSettings);
}

function getLocalUsers(): LocalStoredUser[] {
  initializeLocalDemo();
  return readStorage(STORAGE_KEYS.users, seededProfiles);
}

function setLocalUsers(users: LocalStoredUser[]) {
  writeStorage(STORAGE_KEYS.users, users);
}

function getLocalBookings(): BookingRequest[] {
  initializeLocalDemo();
  return readStorage(STORAGE_KEYS.bookings, seededBookings);
}

function setLocalBookings(bookings: BookingRequest[]) {
  writeStorage(STORAGE_KEYS.bookings, bookings);
}

function getLocalBlocks(): CalendarBlock[] {
  initializeLocalDemo();
  return readStorage(STORAGE_KEYS.blocks, seededBlocks);
}

function setLocalBlocks(blocks: CalendarBlock[]) {
  writeStorage(STORAGE_KEYS.blocks, blocks);
}

function getLocalContent(): SiteContent {
  initializeLocalDemo();
  return readStorage(STORAGE_KEYS.siteContent, defaultSiteContent);
}

function setLocalContent(content: SiteContent) {
  writeStorage(STORAGE_KEYS.siteContent, content);
}

function getLocalSettings(): SiteSettings {
  initializeLocalDemo();
  return readStorage(STORAGE_KEYS.siteSettings, defaultSiteSettings);
}

function setLocalSettings(settings: SiteSettings) {
  writeStorage(STORAGE_KEYS.siteSettings, settings);
}

function getLocalSessionId() {
  initializeLocalDemo();
  return readStorage<string | null>(STORAGE_KEYS.session, null);
}

function setLocalSessionId(sessionId: string | null) {
  writeStorage(STORAGE_KEYS.session, sessionId);
}

function sanitizeProfile(user: LocalStoredUser): Profile {
  const { password: _password, ...profile } = user;
  return profile;
}

function sortBookings(bookings: BookingRequest[]) {
  return [...bookings].sort((left, right) => {
    const leftValue = `${left.selectedDate}T${left.selectedTime}:00`;
    const rightValue = `${right.selectedDate}T${right.selectedTime}:00`;
    return rightValue.localeCompare(leftValue);
  });
}

function applyBookingFilters(bookings: BookingRequest[], filters?: BookingFilters) {
  const query = filters?.query?.trim().toLowerCase() ?? "";

  return sortBookings(bookings).filter((booking) => {
    if (filters?.status && filters.status !== "all" && booking.status !== filters.status) {
      return false;
    }

    if (filters?.date && booking.selectedDate !== filters.date) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      booking.guestName,
      booking.guestEmail,
      booking.guestPhone,
      booking.reason,
      booking.selectedDate,
      booking.selectedTime,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? row.fullName ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    age: row.age === null || row.age === undefined ? null : Number(row.age),
    sex: (row.sex as Profile["sex"]) ?? "not_specified",
    contactPreference: (row.contact_preference as Profile["contactPreference"]) ?? "email",
    role: (row.role as Profile["role"]) ?? "patient",
    canBookDirect: Boolean(row.can_book_direct ?? row.canBookDirect),
    status: (row.status as Profile["status"]) ?? "active",
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    adminNotes: String(row.admin_notes ?? row.adminNotes ?? ""),
  };
}

function mapBookingRow(row: Record<string, unknown>): BookingRequest {
  return {
    id: String(row.id),
    profileId: (row.profile_id as string | null) ?? null,
    guestName: (row.guest_name as string | null) ?? null,
    guestEmail: (row.guest_email as string | null) ?? null,
    guestPhone: (row.guest_phone as string | null) ?? null,
    contactPreference: (row.contact_preference as BookingRequest["contactPreference"]) ?? "email",
    selectedDate: String(row.selected_date ?? row.selectedDate ?? ""),
    selectedTime: String(row.selected_time ?? row.selectedTime ?? ""),
    reason: String(row.reason ?? ""),
    status: (row.status as BookingStatus) ?? "pending",
    isDirectBooking: Boolean(row.is_direct_booking ?? row.isDirectBooking),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  };
}

function mapBlockRow(row: Record<string, unknown>): CalendarBlock {
  return {
    id: String(row.id),
    blockType: (row.block_type as CalendarBlock["blockType"]) ?? "slot",
    blockDate: String(row.block_date ?? row.blockDate ?? ""),
    blockTime: (row.block_time as string | null) ?? null,
    reason: String(row.reason ?? ""),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    createdBy: String(row.created_by ?? row.createdBy ?? ""),
  };
}

async function getSupabaseCurrentProfile() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  if (error) {
    throw error;
  }

  return mapProfileRow(data);
}

export async function getCurrentProfile() {
  if (isSupabaseConfigured) {
    return getSupabaseCurrentProfile();
  }

  const sessionId = getLocalSessionId();
  if (!sessionId) {
    return null;
  }

  const user = getLocalUsers().find((entry) => entry.id === sessionId);
  return user ? sanitizeProfile(user) : null;
}

export async function signIn(input: LoginInput) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw error;
    }

    const profile = await getSupabaseCurrentProfile();
    if (!profile) {
      throw new Error("No se ha podido cargar el perfil.");
    }

    return profile;
  }

  const user = getLocalUsers().find(
    (entry) => entry.email.toLowerCase() === input.email.trim().toLowerCase() && entry.password === input.password,
  );

  if (!user) {
    throw new Error("Email o contraseña incorrectos.");
  }

  setLocalSessionId(user.id);
  return sanitizeProfile(user);
}

export async function signUp(input: RegisterInput) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const signUpResult = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    });

    if (signUpResult.error) {
      throw signUpResult.error;
    }

    const userId = signUpResult.data.user?.id;
    if (!userId) {
      throw new Error("No se ha podido crear la cuenta.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      age: input.age,
      sex: input.sex,
      contact_preference: input.contactPreference,
      role: "patient",
      can_book_direct: false,
      status: "active",
      admin_notes: "",
    });

    if (profileError) {
      throw profileError;
    }

    if (!signUpResult.data.session) {
      const signInResult = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (signInResult.error) {
        throw signInResult.error;
      }
    }

    const profile = await getSupabaseCurrentProfile();
    if (!profile) {
      throw new Error("No se ha podido cargar el perfil.");
    }

    return profile;
  }

  const users = getLocalUsers();
  const alreadyExists = users.some((entry) => entry.email.toLowerCase() === input.email.trim().toLowerCase());
  if (alreadyExists) {
    throw new Error("Ya existe una cuenta con este email.");
  }

  const user: LocalStoredUser = {
    id: createId("user"),
    fullName: input.fullName,
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    age: input.age,
    sex: input.sex,
    contactPreference: input.contactPreference,
    role: "patient",
    canBookDirect: false,
    status: "active",
    createdAt: new Date().toISOString(),
    adminNotes: "",
    password: input.password,
  };

  users.unshift(user);
  setLocalUsers(users);
  setLocalSessionId(user.id);
  return sanitizeProfile(user);
}

export async function signOut() {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return;
  }

  setLocalSessionId(null);
}

export async function getSiteContent() {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return defaultSiteContent;
    }

    const { data, error } = await supabase.from("site_content").select("content").eq("key", "global").maybeSingle();
    if (error) {
      throw error;
    }

    return (data?.content as SiteContent | null) ?? defaultSiteContent;
  }

  return getLocalContent();
}

export async function saveSiteContent(content: SiteContent) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { error } = await supabase.from("site_content").upsert({
      key: "global",
      content,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    return content;
  }

  setLocalContent(content);
  return content;
}

export async function getSiteSettings() {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return defaultSiteSettings;
    }

    const { data, error } = await supabase.from("site_settings").select("settings").eq("key", "global").maybeSingle();
    if (error) {
      throw error;
    }

    return (data?.settings as SiteSettings | null) ?? defaultSiteSettings;
  }

  return getLocalSettings();
}

export async function saveSiteSettings(settings: SiteSettings) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { error } = await supabase.from("site_settings").upsert({
      key: "global",
      settings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    return settings;
  }

  setLocalSettings(settings);
  return settings;
}

export async function listUsers(query = "") {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return [];
    }

    let request = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (query.trim()) {
      const escaped = query.trim();
      request = request.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`);
    }

    const { data, error } = await request;
    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapProfileRow(row));
  }

  const normalizedQuery = query.trim().toLowerCase();
  return getLocalUsers()
    .map(sanitizeProfile)
    .filter((user) => {
      if (!normalizedQuery) {
        return true;
      }

      return [user.fullName, user.email, user.phone].join(" ").toLowerCase().includes(normalizedQuery);
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function updateUserDirectBooking(userId: string, canBookDirect: boolean) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ can_book_direct: canBookDirect })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapProfileRow(data);
  }

  const users = getLocalUsers();
  const nextUsers = users.map((user) => (user.id === userId ? { ...user, canBookDirect } : user));
  setLocalUsers(nextUsers);
  const updatedUser = nextUsers.find((user) => user.id === userId);

  if (!updatedUser) {
    throw new Error("No se ha encontrado el usuario.");
  }

  return sanitizeProfile(updatedUser);
}

export async function updateProfile(profileId: string, patch: Partial<Omit<Profile, "id" | "role" | "createdAt">>) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const updatePayload = {
      full_name: patch.fullName,
      email: patch.email,
      phone: patch.phone,
      age: patch.age,
      sex: patch.sex,
      contact_preference: patch.contactPreference,
      can_book_direct: patch.canBookDirect,
      status: patch.status,
      admin_notes: patch.adminNotes,
    };

    const { data, error } = await supabase.from("profiles").update(updatePayload).eq("id", profileId).select("*").single();
    if (error) {
      throw error;
    }

    return mapProfileRow(data);
  }

  const users = getLocalUsers();
  const nextUsers = users.map((user) =>
    user.id === profileId
      ? {
          ...user,
          fullName: patch.fullName ?? user.fullName,
          email: patch.email ?? user.email,
          phone: patch.phone ?? user.phone,
          age: patch.age ?? user.age,
          sex: patch.sex ?? user.sex,
          contactPreference: patch.contactPreference ?? user.contactPreference,
          canBookDirect: patch.canBookDirect ?? user.canBookDirect,
          status: patch.status ?? user.status,
          adminNotes: patch.adminNotes ?? user.adminNotes,
        }
      : user,
  );
  setLocalUsers(nextUsers);
  const updatedUser = nextUsers.find((user) => user.id === profileId);

  if (!updatedUser) {
    throw new Error("No se ha encontrado el perfil.");
  }

  return sanitizeProfile(updatedUser);
}

export async function listCalendarBlocks() {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase.from("calendar_blocks").select("*").order("block_date", { ascending: true });
    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapBlockRow(row));
  }

  return [...getLocalBlocks()].sort((left, right) => {
    const leftValue = `${left.blockDate}T${left.blockTime ?? "00:00"}:00`;
    const rightValue = `${right.blockDate}T${right.blockTime ?? "00:00"}:00`;
    return leftValue.localeCompare(rightValue);
  });
}

export async function createCalendarBlock(input: Omit<CalendarBlock, "id" | "createdAt">) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { data, error } = await supabase
      .from("calendar_blocks")
      .insert({
        block_type: input.blockType,
        block_date: input.blockDate,
        block_time: input.blockTime,
        reason: input.reason,
        created_by: input.createdBy,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapBlockRow(data);
  }

  const block: CalendarBlock = {
    id: createId("block"),
    blockType: input.blockType,
    blockDate: input.blockDate,
    blockTime: input.blockTime,
    reason: input.reason,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };

  const blocks = [...getLocalBlocks(), block];
  setLocalBlocks(blocks);
  return block;
}

export async function deleteCalendarBlock(blockId: string) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.from("calendar_blocks").delete().eq("id", blockId);
    if (error) {
      throw error;
    }
    return;
  }

  setLocalBlocks(getLocalBlocks().filter((block) => block.id !== blockId));
}

export async function listBookings(filters?: BookingFilters) {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return [];
    }

    let request = supabase.from("booking_requests").select("*").order("selected_date", { ascending: false }).order("selected_time", { ascending: false });
    if (filters?.status && filters.status !== "all") {
      request = request.eq("status", filters.status);
    }
    if (filters?.date) {
      request = request.eq("selected_date", filters.date);
    }

    const { data, error } = await request;
    if (error) {
      throw error;
    }

    return applyBookingFilters((data ?? []).map((row) => mapBookingRow(row)), filters);
  }

  return applyBookingFilters(getLocalBookings(), filters);
}

export async function listMyBookings(profile: Profile | null) {
  if (!profile) {
    return [];
  }

  if (isSupabaseConfigured) {
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .order("selected_date", { ascending: false })
      .order("selected_time", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapBookingRow(row));
  }

  return sortBookings(getLocalBookings().filter((booking) => booking.profileId === profile.id));
}

export async function getPublicAvailability() {
  if (isSupabaseConfigured) {
    if (!supabase) {
      return { bookings: [], blocks: [] };
    }

    const [{ data: bookingRows, error: bookingError }, { data: blockRows, error: blockError }] = await Promise.all([
      supabase.from("public_booking_slots").select("*"),
      supabase.from("public_calendar_blocks").select("*"),
    ]);

    if (bookingError) {
      throw bookingError;
    }

    if (blockError) {
      throw blockError;
    }

    return {
      bookings: (bookingRows ?? []).map((row) =>
        mapBookingRow({
          id: row.id,
          selected_date: row.selected_date,
          selected_time: row.selected_time,
          status: row.status,
          contact_preference: "email",
          reason: "",
          is_direct_booking: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      ),
      blocks: (blockRows ?? []).map((row) => mapBlockRow(row)),
    };
  }

  return {
    bookings: getLocalBookings(),
    blocks: getLocalBlocks(),
  };
}

export async function createBooking(input: BookingFormInput, profile: Profile | null, settings: SiteSettings) {
  const { bookings, blocks } = await getPublicAvailability();
  const selectedDate = input.selectedDate;
  const selectedTime = input.selectedTime;

  if (isDayBlocked(blocks, selectedDate) || isSlotBlocked(blocks, selectedDate, selectedTime)) {
    throw new Error("La franja seleccionada esta bloqueada por la clinica.");
  }

  if (isSlotReserved(bookings, selectedDate, selectedTime)) {
    throw new Error("La franja seleccionada ya no esta disponible.");
  }

  const nextStatus: BookingStatus = profile?.canBookDirect ? "confirmed" : "pending";
  const isDirectBooking = Boolean(profile?.canBookDirect);
  const bookingPayload = {
    profileId: profile?.id ?? null,
    guestName: profile ? null : input.fullName,
    guestEmail: profile ? null : input.email,
    guestPhone: profile ? null : input.phone,
    contactPreference: input.contactPreference,
    selectedDate,
    selectedTime,
    reason: input.reason,
    status: nextStatus,
    isDirectBooking,
  };

  let booking: BookingRequest;

  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { data, error } = await supabase
      .from("booking_requests")
      .insert({
        profile_id: bookingPayload.profileId,
        guest_name: bookingPayload.guestName,
        guest_email: bookingPayload.guestEmail,
        guest_phone: bookingPayload.guestPhone,
        contact_preference: bookingPayload.contactPreference,
        selected_date: bookingPayload.selectedDate,
        selected_time: bookingPayload.selectedTime,
        reason: bookingPayload.reason,
        status: bookingPayload.status,
        is_direct_booking: bookingPayload.isDirectBooking,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("slot_already_taken")) {
        throw new Error("La franja seleccionada ya no esta disponible.");
      }

      if (error.message.toLowerCase().includes("slot_blocked")) {
        throw new Error("La franja seleccionada esta bloqueada por la clinica.");
      }

      throw error;
    }

    booking = mapBookingRow(data);
  } else {
    booking = {
      id: createId("booking"),
      profileId: bookingPayload.profileId,
      guestName: bookingPayload.guestName,
      guestEmail: bookingPayload.guestEmail,
      guestPhone: bookingPayload.guestPhone,
      contactPreference: bookingPayload.contactPreference,
      selectedDate: bookingPayload.selectedDate,
      selectedTime: bookingPayload.selectedTime,
      reason: bookingPayload.reason,
      status: bookingPayload.status,
      isDirectBooking: bookingPayload.isDirectBooking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalBookings([booking, ...getLocalBookings()]);
  }

  let warning: string | undefined;
  try {
    await sendBookingNotification({
      type: "booking-requested",
      adminEmail: settings.notificationEmail,
      booking,
      recipientEmail: profile?.email ?? input.email,
      recipientName: profile?.fullName ?? input.fullName,
    });
  } catch {
    warning = "La reserva se ha guardado, pero no se ha podido enviar el email automatico.";
  }

  return { booking, warning };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  adminEmail: string,
  recipient: { email: string; name: string },
) {
  let updatedBooking: BookingRequest;

  if (isSupabaseConfigured) {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }

    const { data, error } = await supabase
      .from("booking_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    updatedBooking = mapBookingRow(data);
  } else {
    const nextBookings = getLocalBookings().map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status,
            updatedAt: new Date().toISOString(),
          }
        : booking,
    );
    setLocalBookings(nextBookings);

    const booking = nextBookings.find((item) => item.id === bookingId);
    if (!booking) {
      throw new Error("No se ha encontrado la reserva.");
    }

    updatedBooking = booking;
  }

  let warning: string | undefined;
  try {
    await sendBookingNotification({
      type: status === "confirmed" ? "booking-confirmed" : "booking-rejected",
      adminEmail,
      booking: updatedBooking,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
    });
  } catch {
    warning = "El estado se ha guardado, pero el email no se ha podido enviar.";
  }

  return { booking: updatedBooking, warning };
}

export function getBookingContact(booking: BookingRequest, users: Profile[]) {
  const owner = booking.profileId ? users.find((user) => user.id === booking.profileId) : null;
  return {
    name: owner?.fullName ?? booking.guestName ?? "Invitado",
    email: owner?.email ?? booking.guestEmail ?? "",
    phone: owner?.phone ?? booking.guestPhone ?? "",
  };
}

export async function getDashboardStats() {
  const [users, bookings] = await Promise.all([listUsers(), listBookings()]);
  const stats: DashboardStats = {
    pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
    confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
    rejectedBookings: bookings.filter((booking) => booking.status === "rejected").length,
    totalUsers: users.length,
  };

  return stats;
}

export function getStorageMode() {
  return isSupabaseConfigured ? "supabase" : "local";
}
