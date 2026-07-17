import React from 'react';

export interface TooltipProps {
  /** Tooltip text. */
  label: React.ReactNode;
  children: React.ReactNode;
  /** @default "top" */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
}

/** Hover tooltip with neon hairline + bevel. Wraps its trigger. */
export function Tooltip(props: TooltipProps): JSX.Element;
