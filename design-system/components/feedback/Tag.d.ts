import * as React from 'react';

/** Small monospace tag / label pill, optionally removable or clickable. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Show the leading "#". @default true */
  hash?: boolean;
  /** If provided, renders a remove (×) button. */
  onRemove?: () => void;
  /** Accent colour (hex or CSS var). */
  color?: string;
  children?: React.ReactNode;
}

export function Tag(props: TagProps): React.JSX.Element;
