import React from 'react';

/**
 * Neon action button with gradient + HUD variants.
 * @startingPoint section="Forms" subtitle="Neon action button with gradient + HUD variants" viewport="700x160"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Beveled (chamfered) HUD corners instead of rounded. @default false */
  hud?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/**
 * Primary action control for NIGHTWIRE. Uppercase display type with wide
 * tracking; primary uses the violet→magenta gradient, others are neon outlines.
 */
export function Button(props: ButtonProps): JSX.Element;
