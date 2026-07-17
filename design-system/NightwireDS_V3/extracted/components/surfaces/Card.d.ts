import React from 'react';

/**
 * Panel container with optional accent rail + header.
 * @startingPoint section="Surfaces" subtitle="Panel container with optional accent rail + header" viewport="700x220"
 */
export interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned header content (e.g. an IconButton). */
  actions?: React.ReactNode;
  /** Top accent rail + tinted border: cyan | magenta | mint | violet. */
  accent?: 'cyan' | 'magenta' | 'mint' | 'violet';
  /** Beveled HUD corners instead of rounded. @default false */
  hud?: boolean;
  glow?: boolean;
  padding?: string;
  style?: React.CSSProperties;
}

/** Base surface container with optional header, accent rail and HUD corners. */
export function Card(props: CardProps): JSX.Element;
