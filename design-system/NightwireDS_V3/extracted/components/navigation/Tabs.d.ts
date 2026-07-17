import React from 'react';

export interface TabItem { value: string; label: React.ReactNode; }

export interface TabsProps {
  /** string[] or {value,label}[]. */
  tabs?: (string | TabItem)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Underline tab bar with a glowing neon active indicator. */
export function Tabs(props: TabsProps): JSX.Element;
