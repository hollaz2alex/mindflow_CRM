import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STAGE_BADGE, STAGE_LABELS, labelize } from '@/lib/crmConstants';

export default function StageBadge({ stage, className }) {
  if (!stage) return null;
  // Custom (admin-added) stages have no preset color/label — fall back.
  const color = STAGE_BADGE[stage] ?? 'bg-gray-100 text-gray-600';
  const label = STAGE_LABELS[stage] ?? labelize(stage);
  return (
    <Badge variant="secondary" className={cn('border-transparent', color, className)}>
      {label}
    </Badge>
  );
}
