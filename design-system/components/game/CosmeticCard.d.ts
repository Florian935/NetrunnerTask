import * as React from 'react';
import type { Rarity } from './RarityBadge';

/**
 * Inventory item card for a cosmetic (V2 style: chamfered frame + rarity-tinted
 * neon halo). Frame, art-well gradient and halo are all driven by rarity.
 *
 * @startingPoint section="Game" subtitle="Cosmetic inventory item" viewport="700x300"
 */
export interface CosmeticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Item name. */
  name: string;
  /** Category / slot label, e.g. "Deck Skin". */
  category?: string;
  /** @default "common" */
  rarity?: Rarity;
  /** Display glyph shown in the art well when no `children` are provided. */
  glyph?: React.ReactNode;
  /** Show the "Équipé" flag. @default false */
  equipped?: boolean;
  /** Not yet owned — greyed with a lock overlay. @default false */
  locked?: boolean;
  /** Custom art (image/SVG) for the art well. */
  children?: React.ReactNode;
}

export function CosmeticCard(props: CosmeticCardProps): React.JSX.Element;
