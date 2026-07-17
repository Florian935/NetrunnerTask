import React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Square checkbox; cyan fill + glow when checked. */
export function Checkbox(props: CheckboxProps): JSX.Element;
