import type { ReactNode } from "react";

/** Title block for grid pages (Recent, Popular, Movies, Search). */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Filters / tabs rendered under the title */
  children?: ReactNode;
}) {
  return (
    <header className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-neutral-400 md:text-base">{description}</p>}
      </div>
      {children}
    </header>
  );
}
