import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
};

export function FormField({ label, error, hint, htmlFor, children }: FormFieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface/55">{label}</span>
      {children}
      {hint ? <span className="text-xs text-on-surface/45">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: InputProps) {
  return <input {...props} className={cn("app-input", className)} />;
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea {...props} className={cn("app-input min-h-32 resize-y", className)} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return <select {...props} className={cn("app-input", className)} />;
}
