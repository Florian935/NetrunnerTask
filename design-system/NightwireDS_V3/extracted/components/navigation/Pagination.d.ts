import React from 'react';

export interface PaginationProps {
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
}

/** Numbered page control with neon active cell + prev/next arrows. */
export function Pagination(props: PaginationProps): JSX.Element;
