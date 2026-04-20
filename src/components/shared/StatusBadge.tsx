import type { BookingStatus } from "../../lib/types";
import { cn } from "../../lib/utils";

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        status === "pending" && "bg-amber-100 text-amber-900",
        status === "confirmed" && "bg-emerald-100 text-emerald-900",
        status === "rejected" && "bg-rose-100 text-rose-900",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
