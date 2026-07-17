import * as React from 'react';

/** Custom checkbox; the box fills cyan with a glow when checked. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text beside the box. */
  label?: React.ReactNode;
}

export function Checkbox(props: CheckboxProps): React.JSX.Element;
