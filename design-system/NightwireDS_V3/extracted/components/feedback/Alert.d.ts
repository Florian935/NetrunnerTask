import React from 'react';

export interface AlertProps {
  /** @default "info" */
  kind?: 'success' | 'warning' | 'danger' | 'info';
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** If provided, shows a close × and calls this on click. */
  onClose?: () => void;
  style?: React.CSSProperties;
}

/** Inline status banner with neon left rail + status icon. */
export function Alert(props: AlertProps): JSX.Element;
