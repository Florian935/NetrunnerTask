import * as React from 'react';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/**
 * Rarity chip for cosmetics and loot — five colour-coded tiers with a neon glow;
 * the `mythic` tier reads "Corrupted".
 *
 * @startingPoint section="Game" subtitle="Cosmetic rarity tiers" viewport="700x150"
 */
export interface RarityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "common" */
  rarity?: Rarity;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Show the leading glow dot. @default true */
  showDot?: boolean;
  /** Override the tier label. */
  label?: string;
}

/** Tier → { label, color, glow } lookup. */
export declare const RARITY: Record<Rarity, { label: string; color: string; glow: string }>;

export function RarityBadge(props: RarityBadgeProps): React.JSX.Element;
