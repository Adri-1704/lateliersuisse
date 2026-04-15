"use client";

interface DailyPoint {
  date: string;
  count: number;
}

export function TrafficCharts({ dailyChart }: { dailyChart: DailyPoint[] }) {
  if (!dailyChart.length) {
    return <p className="py-8 text-center text-sm text-gray-500">Pas encore de données.</p>;
  }

  const max = Math.max(...dailyChart.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex h-40 items-end gap-1">
        {dailyChart.map((d) => {
          const height = (d.count / max) * 100;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center group relative">
              <div
                className="w-full rounded-t bg-[var(--color-just-tag)] transition-all"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <span className="absolute -top-6 hidden rounded bg-gray-900 px-2 py-0.5 text-xs text-white group-hover:block">
                {d.count} · {d.date}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{dailyChart[0]?.date.slice(5)}</span>
        <span>{dailyChart[dailyChart.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}
