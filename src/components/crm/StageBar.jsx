import { cn } from '@/lib/utils';
import { STAGES, STAGE_BAR, STAGE_LABELS, labelize } from '@/lib/crmConstants';

// Proportional horizontal pipeline bar with a legend beneath it.
// `counts` is a { stageValue: number } map. `stages` is an optional
// [{ value, label }] list (e.g. including admin-added stages); it falls back to
// the built-in STAGES. Colors fall back to a neutral tone for custom stages.
export default function StageBar({ counts = {}, stages }) {
  const list =
    stages && stages.length
      ? stages
      : STAGES.map((v) => ({ value: v, label: STAGE_LABELS[v] }));

  const total = list.reduce((sum, s) => sum + (counts[s.value] || 0), 0);
  const barColor = (v) => STAGE_BAR[v] ?? 'bg-gray-400';
  const stageLabel = (s) => s.label ?? STAGE_LABELS[s.value] ?? labelize(s.value);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {total === 0
          ? null
          : list.map((s) => {
              const count = counts[s.value] || 0;
              if (count === 0) return null;
              const pct = (count / total) * 100;
              return (
                <div
                  key={s.value}
                  className={cn('h-full', barColor(s.value))}
                  style={{ width: `${pct}%` }}
                  title={`${stageLabel(s)}: ${count}`}
                />
              );
            })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {list.map((s) => (
          <div key={s.value} className="flex items-center gap-2 text-sm">
            <span className={cn('h-2.5 w-2.5 rounded-full', barColor(s.value))} />
            <span className="text-gray-600">{stageLabel(s)}</span>
            <span className="ml-auto font-medium tabular-nums text-gray-900">
              {counts[s.value] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
