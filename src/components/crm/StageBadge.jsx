import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STAGE_BADGE, STAGE_LABELS } from '@/lib/crmConstants';

export default function StageBadge({ stage, className }) {
  if (!stage) return null;
  return (
    <Badge
      variant="secondary"
      className={cn('border-transparent', STAGE_BADGE[stage], className)}
    >
      {STAGE_LABELS[stage] ?? stage}
    </Badge>
  );
}
