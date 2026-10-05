import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_BADGE, CATEGORY_LABELS, labelize } from '@/lib/crmConstants';

export default function CategoryBadge({ category, className }) {
  if (!category) return null;
  // Custom (admin-added) categories have no preset color/label — fall back.
  const color = CATEGORY_BADGE[category] ?? 'bg-gray-100 text-gray-600';
  const label = CATEGORY_LABELS[category] ?? labelize(category);
  return (
    <Badge variant="secondary" className={cn('border-transparent', color, className)}>
      {label}
    </Badge>
  );
}
