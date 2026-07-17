import React from 'react';

/**
 * Signature framed container with neon edge + title bar. `variant="terminal"`
 * gives the thin hairline / corner-tick terminal-OS look.
 * @startingPoint section="Surfaces" subtitle="Signature beveled HUD frame with neon edge + title bar" viewport="700x260"
 */
export interface HudPanelProps {
  title?: React.ReactNode;
  /** Right-aligned mono status readout, e.g. "SYS 24.06.99". */
  status?: React.ReactNode;
  /** @default "cyan" */
  accent?: 'cyan' | 'magenta' | 'mint' | 'violet';
  /** "solid" = beveled filled frame; "terminal" = thin hairline + corner ticks. @default "solid" */
  variant?: 'solid' | 'terminal';
  /** Show the hatch stripe in the title bar. @default true */
  hatch?: boolean;
  /** Animate the neon edge with a pulsing glow (V3). @default false */
  pulse?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** The signature beveled HUD frame: neon chamfered edge, title bar, hatch, status. */
export function HudPanel(props: HudPanelProps): JSX.Element;
