import React from 'react';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** @default "cyan" — or any CSS color/gradient token */
  accent?: 'cyan' | 'magenta' | 'mint' | 'violet' | 'gradient' | string;
  label?: React.ReactNode;
  showValue?: boolean;
  /** Track height px. @default 8 */
  height?: number;
  style?: React.CSSProperties;
}

/** Determinate neon progress bar with optional label + % readout. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
