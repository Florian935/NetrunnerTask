// Barrel des primitives du design system (portées en React/TS).
// Composants game/ (ContractCard, FactionBadge, RarityBadge, CosmeticCard)
// à porter dans leur US métier — voir docs/decisions.md #005.
export { GlassCard } from './GlassCard/GlassCard'
export type { GlassCardProps, GlassGlow } from './GlassCard/GlassCard'

export { Button } from './Button/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/Button'

export { IconButton } from './IconButton/IconButton'
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
} from './IconButton/IconButton'

export { TextField } from './TextField/TextField'
export type { TextFieldProps } from './TextField/TextField'

export { Checkbox } from './Checkbox/Checkbox'
export type { CheckboxProps } from './Checkbox/Checkbox'

export { QuickAddBar } from './QuickAddBar/QuickAddBar'
export type { QuickAddBarProps } from './QuickAddBar/QuickAddBar'

export { ProgressBar } from './ProgressBar/ProgressBar'
export type {
  ProgressBarProps,
  ProgressVariant,
  ProgressSize,
} from './ProgressBar/ProgressBar'

export { StatChip } from './StatChip/StatChip'
export type { StatChipProps, StatKind, StatLayout } from './StatChip/StatChip'

export { Badge } from './Badge/Badge'
export type { BadgeProps, BadgeTone, BadgeVariant } from './Badge/Badge'

export { Tag } from './Tag/Tag'
export type { TagProps } from './Tag/Tag'
