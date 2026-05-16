import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from './Card';
import { getRecentCheckIns, type CheckInData } from '../../utils/checkInUtils';

type TimePeriod = '7days' | '30days' | '6months' | '1year';

interface ProgressGraphProps {
  className?: string;
}

export function ProgressGraph({ className = '' }: ProgressGraphProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7days');

  const periods: { value: TimePeriod; label: string; days: number }[] = [
    { value: '7days', label: '7 Days', days: 7 },
    { value: '30days', label: '30 Days', days: 30 },
    { value: '6months', label: '6 Months', days: 180 },
    { value: '1year', label: '1 Year', days: 365 }
  ];

  const selectedPeriodData = periods.find(p => p.value === selectedPeriod)!;

  const formatDateForPeriod = (date: Date, period: TimePeriod): string => {
    if (period === '7days') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === '30days') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === '6months') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const graphData = useMemo(() => {
    const checkIns = getRecentCheckIns(selectedPeriodData.days);

    // Create a map of dates to stress levels
    const dataMap = new Map<string, { stress: number; count: number }>();

    checkIns.forEach(checkIn => {
      if (checkIn.stressLevel !== undefined) {
        const date = new Date(checkIn.date);
        const dateKey = date.toISOString().split('T')[0];

        const existing = dataMap.get(dateKey);
        if (existing) {
          existing.stress += checkIn.stressLevel;
          existing.count += 1;
        } else {
          dataMap.set(dateKey, { stress: checkIn.stressLevel, count: 1 });
        }
      }
    });

    // Generate array of dates for the period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selectedPeriodData.days);

    const result = [];
    const currentDate = new Date(startDate);
    let index = 0;

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const data = dataMap.get(dateKey);

      const uniqueId = `${currentDate.getTime()}-${index}`;
      result.push({
        id: uniqueId, // Unique key based on timestamp
        date: dateKey,
        displayDate: formatDateForPeriod(currentDate, selectedPeriod),
        stress: data ? Math.round(data.stress / data.count) : null
      });

      index++;

      // Increment by appropriate amount based on period
      if (selectedPeriod === '7days') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (selectedPeriod === '30days') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (selectedPeriod === '6months') {
        currentDate.setDate(currentDate.getDate() + 7); // Weekly for 6 months
      } else {
        currentDate.setDate(currentDate.getDate() + 30); // Monthly for 1 year
      }
    }

    return result;
  }, [selectedPeriod, selectedPeriodData.days]);

  const hasData = graphData.some(d => d.stress !== null);

  return (
    <Card className={className}>
      <div className="mb-4">
        <h3 className="text-lg text-foreground mb-3">Stress Level Trends</h3>

        {/* Period selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedPeriod === period.value
                  ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)] text-white shadow-md'
                  : 'bg-[var(--muted)] text-muted-foreground hover:bg-[var(--muted)]/70'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph */}
      <motion.div
        key={selectedPeriod}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-64"
      >
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={`stressGradient-${selectedPeriod}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--lavender)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--soft-purple)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis
                dataKey="id"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => {
                  const item = graphData.find(d => d.id === value);
                  return item ? item.displayDate : '';
                }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: 'var(--foreground)', fontSize: '12px', marginBottom: '4px' }}
                itemStyle={{ color: 'var(--lavender)', fontSize: '12px' }}
                formatter={(value: any) => [`${value}/10`, 'Stress Level']}
                labelFormatter={(value) => {
                  const item = graphData.find(d => d.id === value);
                  return item ? item.displayDate : '';
                }}
              />
              <Area
                type="monotone"
                dataKey="stress"
                stroke="var(--lavender)"
                strokeWidth={3}
                fill={`url(#stressGradient-${selectedPeriod})`}
                connectNulls
                isAnimationActive={false}
                dot={{ fill: 'var(--soft-purple)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--lavender)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--lavender)]/10 to-[var(--soft-purple)]/10 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-1">No data for this period</p>
            <p className="text-xs text-muted-foreground">Complete check-ins to see your progress</p>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      {hasData && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--soft-purple)]" />
            <span>Stress Level (0-10)</span>
          </div>
          <span>Lower is better</span>
        </div>
      )}
    </Card>
  );
}
