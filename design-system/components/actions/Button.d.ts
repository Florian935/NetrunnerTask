import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'complete';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Primary action control for Netrunner Task. Uppercase display type with neon
 * glow on hover; `complete` is the signature phosphor-lime "hack successful"
 * task-completion action.
 *
 * @startingPoint section="Actions" subtitle="Buttons with neon glow states" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual role. @default "primary" */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** Stretch to container width. @default false */
  block?: boolean;
  /** Icon node before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon node after the label. */
  trailingIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): React.JSX.Element;
