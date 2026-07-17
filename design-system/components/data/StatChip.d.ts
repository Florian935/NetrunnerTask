import * as React from 'react';

export type StatKind = 'xp' | 'credits' | 'rep' | 'level' | 'streak' | 'neutral';

/** Compact HUD stat readout — coloured dot, label and value in monospace. */
export interface StatChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Economy semantic → colour. @default "neutral" */
  kind?: StatKind;
  /** Small uppercase label. */
  label?: string;
  /** The value. */
  value: React.ReactNode;
  /** Stacked or inline label/value. @default "stack" */
  layout?: 'stack' | 'inline';
  /** Override colour. */
  color?: string;
}

export function StatChip(props: StatChipProps): React.JSX.Element;
