import * as React from 'react';

/** Faction tag: a coloured sigil chip plus the faction name, with a soft glow. */
export interface FactionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Faction name. */
  name: string;
  /** Faction accent colour (hex or CSS var). @default "var(--accent)" */
  color?: string;
  /** 1–2 char sigil; defaults to the first two letters of `name`. */
  sigil?: string;
}

export function FactionBadge(props: FactionBadgeProps): React.JSX.Element;
