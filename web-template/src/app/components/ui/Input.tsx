import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm mb-2 text-[var(--foreground)]">{label}</label>}
      <input
        className={`w-full px-5 py-3 rounded-2xl bg-[var(--input-background)] border-2 border-transparent focus:border-[var(--lavender)] focus:outline-none transition-all ${error ? 'border-[var(--destructive)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-[var(--destructive)] mt-1">{error}</p>}
    </div>
  );
}
