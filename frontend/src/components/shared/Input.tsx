interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        className={`border rounded-lg px-4 py-2.5 text-sm bg-white text-slate-800
          placeholder:text-slate-400 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
          ${error ? 'border-red-400' : 'border-slate-200'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}