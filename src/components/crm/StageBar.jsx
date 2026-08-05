import { cn } from '@/lib/utils';
import { STAGES, STAGE_BAR, STAGE_LABELS } from '@/lib/crmConstants';

// Proportional horizontal pipeline bar with a legend beneath it.
// `counts` is a { stage: number } map.
export default function StageBar({ counts = {} }) {
  const total = STAGES.reduce((sum, s) => sum + (counts[s] || 0), 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {total === 0
          ? null
          : STAGES.map((stage) => {
              const count = counts[stage] || 0;
              if (count === 0) return null;
              const pct = (count / total) * 100;
              return (
                <div
                  key={stage}
                  className={cn('h-full', STAGE_BAR[stage])}
                  style={{ width: `${pct}%` }}
                  title={`${STAGE_LABELS[stage]}: ${count}`}
                />
              );
            })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {STAGES.map((stage) => (
          <div key={stage} className="flex items-center gap-2 text-sm">
            <span
              className={cn('h-2.5 w-2.5 rounded-full', STAGE_BAR[stage])}
            />
            <span className="text-gray-600">{STAGE_LABELS[stage]}</span>
            <span className="ml-auto font-medium tabular-nums text-gray-900">
              {counts[stage] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
