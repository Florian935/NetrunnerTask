import * as React from 'react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'urgent' | 'neutral';
export type BadgeVariant = 'soft' | 'solid' | 'outline';

/** Status badge for state labels (Active, Overdue, Complete…). */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: BadgeTone;
  /** @default "soft" */
  variant?: BadgeVariant;
  /** Leading glow dot. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): React.JSX.Element;
