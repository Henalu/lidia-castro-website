import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title text-[clamp(2.4rem,5vw,4rem)]">{title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
