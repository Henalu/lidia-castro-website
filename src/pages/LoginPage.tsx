import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField, TextInput } from "../components/shared/FormField";
import { useAuth } from "../context/auth-context";

export function LoginPage() {
  const { signInAction } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const profile = await signInAction({ email, password });
      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(nextPath ?? (profile.role === "superadmin" ? "/admin" : "/mi-cuenta"), { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se ha podido iniciar sesion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-[2rem] border border-on-surface/10 bg-surface-container/70 p-6 sm:p-8">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">Acceso</p>
        <h1 className="font-headline text-4xl tracking-tight">Iniciar sesion</h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Accede a tu area personal para revisar tus datos y gestionar tus solicitudes.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField label="Email" htmlFor="login-email">
          <TextInput id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" />
        </FormField>

        <FormField label="Contrasena" htmlFor="login-password">
          <TextInput id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contrasena" />
        </FormField>

        {error ? <div className="rounded-[1.25rem] bg-rose-100 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

        <button type="submit" className="btn-editorial inline-flex w-full items-center justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-on-surface-variant">
        No tienes cuenta?{" "}
        <Link to="/registro" className="text-accent underline">
          Registrate aqui
        </Link>
      </p>
    </div>
  );
}
