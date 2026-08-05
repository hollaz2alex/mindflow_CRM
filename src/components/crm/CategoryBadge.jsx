import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_BADGE, CATEGORY_LABELS } from '@/lib/crmConstants';

export default function CategoryBadge({ category, className }) {
  if (!category) return null;
  return (
    <Badge
      variant="secondary"
      className={cn('border-transparent', CATEGORY_BADGE[category], className)}
    >
      {CATEGORY_LABELS[category] ?? category}
    </Badge>
  );
}
