import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** Pill toggle for instant-apply binary settings; mint gradient + glow when on. */
export function Switch(props: SwitchProps): JSX.Element;
