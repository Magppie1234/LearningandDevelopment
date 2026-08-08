/**
 * The Magppie L&D design system.
 *
 * One import site for every shared surface, control, state and chart. Pages
 * should build from these rather than re-styling a card or a badge locally —
 * that is what kept status colours and table behaviour inconsistent before.
 */

export {
  StatusBadge,
  DeltaPill,
  ProgressBar,
  StackedBar,
  Legend,
  toneFill,
  toneText,
  type Tone,
} from './Status'

export {
  Card,
  Section,
  PageHeader,
  Kpi,
  KpiGrid,
  CARD_BASE,
  type MetricDefinition,
} from './Surface'

export {
  Button,
  IconButton,
  Empty,
  Skeleton,
  LoadingRows,
  ErrorState,
  Notice,
  Drawer,
} from './Controls'

export { DataTable, type Column, type DataTableProps } from './DataTable'

export {
  FilterBar,
  Segmented,
  Select,
  type FilterSpec,
  type FilterOption,
  type FilterValues,
} from './FilterBar'

export { ChartFrame, TrendLine, CompareBars, Heatmap } from './Charts'
