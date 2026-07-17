import * as React from 'react';

/** Labelled text input with terminal styling; supports focus, error and disabled states. */
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label (uppercase mono). */
  label?: string;
  /** Show a required asterisk. @default false */
  required?: boolean;
  /** Icon node inside the field, leading edge. */
  leadingIcon?: React.ReactNode;
  /** Icon node inside the field, trailing edge. */
  trailingIcon?: React.ReactNode;
  /** Error message — turns the field red. */
  error?: string;
  /** Helper text below the field. */
  hint?: string;
}

export function TextField(props: TextFieldProps): React.JSX.Element;
