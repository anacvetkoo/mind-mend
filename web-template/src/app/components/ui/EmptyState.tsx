import React from 'react';
import { OtterMascot } from '../mascot/OtterMascot';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <OtterMascot size="lg" emotion="calm" />
      <h3 className="text-xl text-[var(--foreground)] mt-6 mb-2">{title}</h3>
      <p className="text-[var(--muted-foreground)] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
