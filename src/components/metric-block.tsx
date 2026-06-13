import type { ReactNode } from "react";

type MetricBlockProps = {
  children?: ReactNode;
  label: string;
  value: string;
};

export function MetricBlock({ children, label, value }: MetricBlockProps) {
  return (
    <article className="min-h-60 min-w-0 overflow-hidden border border-line bg-white/[0.025] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog">{label}</p>
      <p className="mt-5 truncate text-3xl leading-none text-bone" title={value}>
        {value}
      </p>
      {children}
    </article>
  );
}
