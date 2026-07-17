import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "cyan" */
  tone?: 'cyan' | 'magenta' | 'mint' | 'violet' | 'amber' | 'red' | 'neutral';
  /** Filled instead of tinted-outline. @default false */
  solid?: boolean;
  /** Add a neon glow. @default false */
  glow?: boolean;
  style?: React.CSSProperties;
}

/** Tiny uppercase status pill: NEW, HOT, BETA, counts, statuses. */
export function Badge(props: BadgeProps): JSX.Element;
