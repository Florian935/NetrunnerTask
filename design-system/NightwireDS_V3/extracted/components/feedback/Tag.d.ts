import React from 'react';

export interface TagProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: 'cyan' | 'magenta' | 'mint' | 'violet' | 'amber' | 'red' | 'neutral';
  /** Leading Lucide icon name. */
  icon?: string;
  /** If provided, renders an × affordance and calls this on click. */
  onRemove?: () => void;
  style?: React.CSSProperties;
}

/** Beveled label chip, optionally removable. Mono text. */
export function Tag(props: TagProps): JSX.Element;
