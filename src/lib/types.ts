export type StorageMode = "supabase" | "local";

export type ContactPreference = "whatsapp" | "phone" | "email";
export type SexOption = "male" | "female" | "not_specified";
export type UserRole = "patient" | "superadmin";
export type ProfileStatus = "active" | "inactive";
export type BookingStatus = "pending" | "confirmed" | "rejected";
export type BlockType = "day" | "slot";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  sex: SexOption;
  contactPreference: ContactPreference;
  role: UserRole;
  canBookDirect: boolean;
  status: ProfileStatus;
  createdAt: string;
  adminNotes: string;
}

export interface BookingRequest {
  id: string;
  profileId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  contactPreference: ContactPreference;
  selectedDate: string;
  selectedTime: string;
  reason: string;
  status: BookingStatus;
  isDirectBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarBlock {
  id: string;
  blockType: BlockType;
  blockDate: string;
  blockTime: string | null;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface BookingFormInput {
  fullName: string;
  email: string;
  phone: string;
  contactPreference: ContactPreference;
  selectedDate: string;
  selectedTime: string;
  reason: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  age: number | null;
  sex: SexOption;
  contactPreference: ContactPreference;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SiteContent {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    imageUrl: string;
    imageAlt: string;
    principles: string[];
  };
  servicesIntro: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
  };
  services: Array<{
    page: string;
    title: string;
    description: string;
    icon: "accessibility" | "leaf" | "move";
  }>;
  methodologyIntro: {
    eyebrow: string;
    label: string;
  };
  methodologySteps: Array<{
    number: string;
    tag: string;
    title: string;
    description: string;
  }>;
  about: {
    eyebrow: string;
    title: string;
    highlight: string;
    paragraphs: string[];
    badges: string[];
    note: string;
    imageUrl: string;
    imageAlt: string;
  };
  testimonialsIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  testimonials: Array<{
    name: string;
    service: string;
    quote: string;
  }>;
  clinic: {
    eyebrow: string;
    title: string;
    conceptLabel: string;
    conceptValue: string;
    description: string;
    location: string;
    imageUrl: string;
    imageAlt: string;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    buttonLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    email: string;
    addressHint: string;
  };
}

export interface SiteSettings {
  workStart: string;
  workEnd: string;
  slotMinutes: number;
  workingDays: number[];
  contactEmail: string;
  contactPhone: string;
  notificationEmail: string;
}

export interface DashboardStats {
  pendingBookings: number;
  confirmedBookings: number;
  rejectedBookings: number;
  totalUsers: number;
}

export interface AuthSessionState {
  mode: StorageMode;
  profile: Profile | null;
  isLoading: boolean;
}

export interface BookingFilters {
  status?: BookingStatus | "all";
  date?: string;
  query?: string;
}

export interface NotificationPayload {
  type: "booking-requested" | "booking-confirmed" | "booking-rejected";
  adminEmail: string;
  booking: BookingRequest;
  recipientEmail: string;
  recipientName: string;
}
