import * as React from 'react';

/**
 * Frosted-glass panel — the foundational surface of the system. Optional
 * targeted neon glow and HUD corner brackets.
 *
 * @startingPoint section="Surfaces" subtitle="Glass panel with HUD brackets" viewport="700x200"
 */
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Targeted neon halo colour. @default "teal" */
  glow?: 'teal' | 'violet' | 'magenta';
  /** Soft rounded corners instead of the chamfered HUD cut. @default false */
  rounded?: boolean;
  /** Draw HUD corner brackets (top-left + bottom-right). @default false */
  brackets?: boolean;
  children?: React.ReactNode;
}

export function GlassCard(props: GlassCardProps): React.JSX.Element;
