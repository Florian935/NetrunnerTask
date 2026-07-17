import * as React from 'react';

export type ProgressVariant = 'xp' | 'rep' | 'credits' | 'streak' | 'level' | 'danger';

/**
 * Progress gauge for level, faction reputation and streaks. Glowing gradient
 * fill with a monospace readout above.
 *
 * @startingPoint section="Data" subtitle="Level / rep / streak gauges" viewport="700x150"
 */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Max value. @default 100 */
  max?: number;
  /** Colour semantic. @default "level" */
  variant?: ProgressVariant;
  /** Label shown above the track. */
  label?: string;
  /** Show the numeric readout. @default true */
  showValue?: boolean;
  /** Override the readout text (e.g. "LVL 12 · 340/500 XP"). */
  valueLabel?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Override fill colour (hex or CSS var). */
  color?: string;
}

export function ProgressBar(props: ProgressBarProps): React.JSX.Element;
