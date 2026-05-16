import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon, value, label, color = 'var(--lavender)' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl" style={{ color }}>{value}</div>
        <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
      </div>
    </Card>
  );
}
