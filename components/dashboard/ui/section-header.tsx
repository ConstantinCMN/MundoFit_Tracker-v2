import { ChevronRight } from 'lucide-react';

type SectionHeaderProps = {
  label: string;
  action?: { label: string; onClick: () => void };
};

export function SectionHeader({ label, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
        {label}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-[#aaff00]/60"
        >
          {action.label}
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}
