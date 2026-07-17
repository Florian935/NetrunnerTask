import React from 'react';

export interface Crumb { label: React.ReactNode; href?: string; }

export interface BreadcrumbsProps {
  /** string[] or {label,href}[]. Last item is the current page. */
  items?: (string | Crumb)[];
  onNavigate?: (item: Crumb, index: number) => void;
  style?: React.CSSProperties;
}

/** Mono path trail with chevron separators; last crumb is highlighted. */
export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
