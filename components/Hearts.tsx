"use client";

type Props = {
  value: number | null;
  onChange?: (v: number | null) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
  ariaLabel?: string;
};

export default function Hearts({
  value,
  onChange,
  size = "md",
  readOnly = false,
  ariaLabel = "Excitement",
}: Props) {
  const cls =
    size === "sm" ? "text-base leading-none" : "text-xl leading-none";
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${cls}`}
      role="group"
      aria-label={ariaLabel}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!onChange) return;
              onChange(value === n ? null : n);
            }}
            className={`select-none ${
              readOnly ? "cursor-default" : "cursor-pointer"
            } ${
              filled
                ? "text-[color:var(--accent)]"
                : "text-[color:var(--border)]"
            }`}
            aria-pressed={filled}
            aria-label={`${n} ${n === 1 ? "heart" : "hearts"}`}
          >
            {filled ? "♥" : "♡"}
          </button>
        );
      })}
    </div>
  );
}
