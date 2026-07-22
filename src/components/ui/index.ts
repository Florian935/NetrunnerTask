// Barrel du design system NIGHTWIRE V3 (composants portés en React/TS).
// Organisation par famille : core / forms / feedback / surfaces / navigation.

// ---- core ----
export { Icon } from './core/Icon'
export type { IconProps } from './core/Icon'

// ---- forms ----
export { Button } from './forms/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './forms/Button'
export { IconButton } from './forms/IconButton'
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
} from './forms/IconButton'
export { Input } from './forms/Input'
export type { InputProps, InputSize } from './forms/Input'
export { Select } from './forms/Select'
export type { SelectProps, SelectOption, SelectSize } from './forms/Select'
export { Checkbox } from './forms/Checkbox'
export type { CheckboxProps } from './forms/Checkbox'
export { Radio } from './forms/Radio'
export type { RadioProps } from './forms/Radio'
export { Switch } from './forms/Switch'
export type { SwitchProps, SwitchSize } from './forms/Switch'
export { Slider } from './forms/Slider'
export type { SliderProps } from './forms/Slider'

// ---- feedback ----
export { Badge } from './feedback/Badge'
export type { BadgeProps, BadgeTone } from './feedback/Badge'
export { Tag } from './feedback/Tag'
export type { TagProps, TagTone } from './feedback/Tag'
export { Alert } from './feedback/Alert'
export type { AlertProps, AlertKind } from './feedback/Alert'
export { Toast } from './feedback/Toast'
export type { ToastProps, ToastKind } from './feedback/Toast'
export { Tooltip } from './feedback/Tooltip'
export type { TooltipProps, TooltipPlacement } from './feedback/Tooltip'
export { ProgressBar } from './feedback/ProgressBar'
export type { ProgressBarProps, ProgressAccent } from './feedback/ProgressBar'
export { ProgressRing } from './feedback/ProgressRing'
export type { ProgressRingProps } from './feedback/ProgressRing'

// ---- surfaces ----
export { Card } from './surfaces/Card'
export type { CardProps, CardAccent } from './surfaces/Card'
export { StatCard } from './surfaces/StatCard'
export type {
  StatCardProps,
  StatCardAccent,
  StatCardTrend,
} from './surfaces/StatCard'
export { HudPanel } from './surfaces/HudPanel'
export type { HudPanelProps, HudAccent, HudVariant } from './surfaces/HudPanel'

// ---- navigation ----
export { Tabs } from './navigation/Tabs'
export type { TabsProps, TabItem } from './navigation/Tabs'
export { Breadcrumbs } from './navigation/Breadcrumbs'
export type { BreadcrumbsProps, Crumb } from './navigation/Breadcrumbs'
export { Pagination } from './navigation/Pagination'
export type { PaginationProps } from './navigation/Pagination'
