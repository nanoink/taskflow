import { Check } from 'lucide-react';

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="TaskFlow">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)]">
        <Check size={19} strokeWidth={3} aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className={`text-xl font-bold tracking-[-0.035em] ${inverse ? 'text-white' : 'text-slate-950'}`}>
          TaskFlow
        </span>
      )}
    </div>
  );
}
