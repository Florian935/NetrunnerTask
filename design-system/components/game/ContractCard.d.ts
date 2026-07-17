import * as React from 'react';

export type ContractStatus = 'available' | 'active' | 'complete' | 'locked';

export interface Faction {
  name: string;
  color?: string;
  sigil?: string;
}

/**
 * Contract card — the core task unit (V2 style: chamfered glass + faction-colour
 * neon halo). Difficulty pips, issuing faction, XP / credit / reputation rewards,
 * and a "hack réussi" completion action.
 *
 * @startingPoint section="Game" subtitle="Task card with difficulty, faction & rewards" viewport="700x260"
 */
export interface ContractCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Short contract code, e.g. "NX-0042". */
  code?: string;
  /** Task title. */
  title: string;
  /** Optional brief. */
  description?: string;
  /** 1–5. @default 3 */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  /** Issuing faction. */
  faction?: Faction;
  /** Show the red "Urgent" tag. @default false */
  urgent?: boolean;
  /** XP reward. */
  xp?: number;
  /** Credit reward. */
  credits?: number;
  /** Reputation reward. */
  rep?: number;
  /** @default "available" */
  status?: ContractStatus;
  /** Fires when the completion button is pressed. */
  onComplete?: () => void;
}

export function ContractCard(props: ContractCardProps): React.JSX.Element;
