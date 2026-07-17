import React from 'react';

export interface ToastProps {
  /** @default "info" */
  kind?: 'success' | 'warning' | 'danger' | 'info';
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

/** Floating transient notification card (320px). App owns stacking/timers. */
export function Toast(props: ToastProps): JSX.Element;
