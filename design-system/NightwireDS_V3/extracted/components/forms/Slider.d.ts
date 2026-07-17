import React from 'react';

export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** Show a trailing % readout. @default false */
  showValue?: boolean;
  /** Track/thumb color (any CSS color or token). @default cyan */
  accent?: string;
  style?: React.CSSProperties;
}

/** Neon range slider with glowing thumb + filled track. */
export function Slider(props: SliderProps): JSX.Element;
