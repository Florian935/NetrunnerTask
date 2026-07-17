import React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** String[] or {value,label}[]. */
  options?: (string | SelectOption)[];
  placeholder?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  hud?: boolean;
  style?: React.CSSProperties;
}

/** Dropdown select with neon chevron + focus glow. */
export function Select(props: SelectProps): JSX.Element;
