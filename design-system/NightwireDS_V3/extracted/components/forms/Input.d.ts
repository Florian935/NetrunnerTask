import React from 'react';

export interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading Lucide icon name. */
  icon?: string;
  error?: boolean;
  disabled?: boolean;
  hud?: boolean;
  style?: React.CSSProperties;
}

/** Text field with neon focus glow. Value renders in the mono face. */
export function Input(props: InputProps): JSX.Element;
