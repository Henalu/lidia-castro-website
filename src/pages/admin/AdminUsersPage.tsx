import { useEffect, useState } from "react";
import { FormField, TextInput } from "../../components/shared/FormField";
import { PageIntro } from "../../components/shared/PageIntro";
import { listUsers, updateUserDirectBooking } from "../../lib/data";
import { formatShortDate } from "../../lib/format";
import type { Profile } from "../../lib/types";

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const nextUsers = await listUsers(query);
      if (!cancelled) {
        setUsers(nextUsers);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [query]);

  async function handleToggle(user: Profile) {
    const updatedUser = await updateUserDirectBooking(user.id, !user.canBookDirect);
    setUsers((currentValue) => currentValue.map((item) => (item.id === user.id ? updatedUser : item)));
    setFeedback(
      updatedUser.canBookDirect
        ? `${updatedUser.fullName} ahora puede reservar directamente.`
        : `${updatedUser.fullName} vuelve a necesitar aprobacion manual.`,
    );
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Usuarios"
        title="Pacientes registrados"
        description="Busqueda simple por nombre, email o telefono y control del permiso de reserva directa para pacientes recurrentes."
      />

      <div className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
        <FormField label="Buscar usuario" htmlFor="users-query">
          <TextInput id="users-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, email o telefono" />
        </FormField>
      </div>

      {feedback ? <div className="rounded-[1.25rem] bg-on-surface/6 px-4 py-3 text-sm">{feedback}</div> : null}

      <div className="space-y-4">
        {users.map((user) => (
          <article key={user.id} className="rounded-[1.75rem] border border-on-surface/10 bg-surface-container/55 p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">{user.fullName}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Alta: {formatShortDate(user.createdAt.slice(0, 10))} | Rol: {user.role}
                  </p>
                </div>
                <div className="grid gap-1 text-sm text-on-surface-variant">
                  <p>
                    <strong className="text-on-surface">Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong className="text-on-surface">Telefono:</strong> {user.phone}
                  </p>
                  <p>
                    <strong className="text-on-surface">Contacto preferido:</strong> {user.contactPreference}
                  </p>
                </div>
                {user.adminNotes ? <p className="text-sm leading-relaxed text-on-surface-variant">{user.adminNotes}</p> : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    user.canBookDirect ? "bg-emerald-100 text-emerald-900" : "bg-on-surface/6 text-on-surface/65"
                  }`}
                >
                  {user.canBookDirect ? "Reserva directa" : "Con aprobacion"}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-on-surface/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  onClick={() => void handleToggle(user)}
                >
                  {user.canBookDirect ? "Quitar permiso" : "Permitir reserva directa"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
