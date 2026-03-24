interface ETABadgeProps {
  label: string;
  minutes: number;
  tone?: 'slate' | 'emerald';
}

const toneClasses = {
  slate: 'border-slate-200 bg-slate-50 text-slate-800',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-800',
};

export default function ETABadge({ label, minutes, tone = 'slate' }: ETABadgeProps) {
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{minutes} min</p>
    </div>
  );
}
