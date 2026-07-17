import * as React from 'react';

export type IconButtonVariant = 'ghost' | 'solid' | 'accent';
export type IconButtonSize = 'sm' | 'md' | 'lg';

/** Square, label-less button holding a single icon node. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "ghost" */
  variant?: IconButtonVariant;
  /** @default "md" */
  size?: IconButtonSize;
  /** Accessible label (also used as tooltip). */
  label?: string;
  /** The icon node. */
  children?: React.ReactNode;
}

export function IconButton(props: IconButtonProps): React.JSX.Element;
