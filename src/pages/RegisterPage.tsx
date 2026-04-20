import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField, Select, TextInput } from "../components/shared/FormField";
import { useAuth } from "../context/auth-context";
import type { ContactPreference, SexOption } from "../lib/types";

export function RegisterPage() {
  const { signUpAction } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    sex: "not_specified" as SexOption,
    contactPreference: "email" as ContactPreference,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signUpAction({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        age: form.age ? Number(form.age) : null,
        sex: form.sex,
        contactPreference: form.contactPreference,
        password: form.password,
      });
      navigate("/mi-cuenta", { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No se ha podido crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((currentValue) => ({ ...currentValue, [key]: value }));
  }

  return (
    <div className="w-full rounded-[2rem] border border-on-surface/10 bg-surface-container/70 p-6 sm:p-8">
      <div className="mb-8 space-y-3">
        <p className="eyebrow">Registro</p>
        <h1 className="font-headline text-4xl tracking-tight">Crear cuenta</h1>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Guarda tus datos para reservar con mas rapidez y mantener tu informacion siempre actualizada.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField label="Nombre y apellidos" htmlFor="register-name">
          <TextInput id="register-name" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="register-email">
            <TextInput id="register-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
          </FormField>

          <FormField label="Telefono" htmlFor="register-phone">
            <TextInput id="register-phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Edad" htmlFor="register-age">
            <TextInput id="register-age" type="number" min="0" value={form.age} onChange={(event) => updateField("age", event.target.value)} />
          </FormField>

          <FormField label="Sexo" htmlFor="register-sex">
            <Select id="register-sex" value={form.sex} onChange={(event) => updateField("sex", event.target.value as SexOption)}>
              <option value="female">Femenino</option>
              <option value="male">Masculino</option>
              <option value="not_specified">No quiere indicarlo</option>
            </Select>
          </FormField>

          <FormField label="Contacto preferido" htmlFor="register-contact">
            <Select
              id="register-contact"
              value={form.contactPreference}
              onChange={(event) => updateField("contactPreference", event.target.value as ContactPreference)}
            >
              <option value="email">Email</option>
              <option value="phone">Telefono</option>
              <option value="whatsapp">WhatsApp</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Contrasena" htmlFor="register-password">
          <TextInput id="register-password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
        </FormField>

        {error ? <div className="rounded-[1.25rem] bg-rose-100 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

        <button type="submit" className="btn-editorial inline-flex w-full items-center justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-sm text-on-surface-variant">
        Ya tienes cuenta?{" "}
        <Link to="/login" className="text-accent underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
