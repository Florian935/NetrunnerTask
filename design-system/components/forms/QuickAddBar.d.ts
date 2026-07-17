import * as React from 'react';

/**
 * Fast task-capture field. Glass container, a leading + button and a ⌘K hint;
 * Enter or the + button submits and clears. The quickest path to logging a task.
 *
 * @startingPoint section="Forms" subtitle="Fast task capture field" viewport="700x120"
 */
export interface QuickAddBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** @default "Ajouter une tâche, une note…" */
  placeholder?: string;
  /** Called with the trimmed text on submit. */
  onAdd?: (value: string) => void;
  /** Show the "⌘K" hint. @default true */
  showHint?: boolean;
  /** Initial value. */
  defaultValue?: string;
}

export function QuickAddBar(props: QuickAddBarProps): React.JSX.Element;
