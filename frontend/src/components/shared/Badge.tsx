interface BadgeProps {
  label: string;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'navy';
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border border-slate-200',
    navy: 'bg-slate-800 text-white border border-slate-700',
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${variants[variant]}`}>
      {label}
    </span>
  );
}