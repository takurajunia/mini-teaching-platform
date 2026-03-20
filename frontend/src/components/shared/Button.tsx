interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children, loading, variant = 'primary', size = 'md', className = '', ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const variants = {
    primary: 'bg-amber-400 text-slate-900 hover:bg-amber-300 font-semibold shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium border border-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 font-semibold',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 font-medium',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}