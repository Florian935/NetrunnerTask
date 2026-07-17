import React from 'react';

export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "zap", "shield-alert"). */
  name: string;
  /** Pixel size. @default 18 */
  size?: number;
  /** @default 2 */
  strokeWidth?: number;
  /** @default "currentColor" */
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Line icon from the Lucide set (matches the NIGHTWIRE thin-stroke iconography).
 * The page must load the Lucide UMD script.
 */
export function Icon(props: IconProps): JSX.Element;
