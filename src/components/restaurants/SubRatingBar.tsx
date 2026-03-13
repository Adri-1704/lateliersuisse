"use client";

interface SubRatingBarProps {
  label: string;
  value: number;
  max?: number;
}

export function SubRatingBar({ label, value, max = 5 }: SubRatingBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-just-tag)] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}
