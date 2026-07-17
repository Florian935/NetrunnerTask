import React from 'react';

export interface IconButtonProps {
  /** Lucide icon name. */
  name: string;
  /** @default "ghost" */
  variant?: 'ghost' | 'solid' | 'outline';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  hud?: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Square icon-only button. Use in toolbars, card headers, table rows. */
export function IconButton(props: IconButtonProps): JSX.Element;
