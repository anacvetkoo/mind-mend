import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  onClick?: () => void;
}

export function Card({ children, className = '', variant = 'default', onClick, style, ...props }: CardProps) {
  const variants = {
    default: 'bg-card shadow-lg border border-[var(--border)]',
    glass: 'bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-xl',
    // WebView fix: Tailwind arbitrary gradient with CSS variables was not always generated correctly,
    // so the gradient is applied with inline CSS below.
    gradient: 'shadow-xl border-0'
  };

  const gradientStyle = variant === 'gradient'
    ? {
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#ffffff',
        ...style,
      }
    : style;

  return (
    <div
      className={`rounded-3xl p-6 ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-2xl transition-shadow' : ''} ${className}`}
      style={gradientStyle}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
