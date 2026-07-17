import React from 'react';

/**
 * KPI metric tile with delta + icon.
 * @startingPoint section="Surfaces" subtitle="KPI metric tile with delta + icon" viewport="360x150"
 */
export interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Delta text, e.g. "+12.5%". */
  delta?: React.ReactNode;
  /** @default "up" */
  trend?: 'up' | 'down';
  /** Lucide icon name shown top-right. */
  icon?: string;
  /** @default "cyan" */
  accent?: 'cyan' | 'magenta' | 'mint' | 'violet' | 'amber' | 'red';
  style?: React.CSSProperties;
}

/** KPI tile: label, big display value, colored delta, corner icon. */
export function StatCard(props: StatCardProps): JSX.Element;
