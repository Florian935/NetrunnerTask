import React from 'react';

export interface RadioProps {
  checked?: boolean;
  onChange?: (value?: string) => void;
  label?: React.ReactNode;
  name?: string;
  value?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Round single-choice control; magenta dot + glow when selected. */
export function Radio(props: RadioProps): JSX.Element;
