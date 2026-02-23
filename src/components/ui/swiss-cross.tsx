export function SwissCross({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Swiss cross"
    >
      <rect width="32" height="32" rx="6" fill="var(--color-just-tag)" />
      <path
        d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6V8z"
        fill="white"
      />
    </svg>
  );
}

export function SwissCrossIcon({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.5 4h3v4.5H16v3h-4.5V16h-3v-4.5H4v-3h4.5V4z"
        fill="currentColor"
      />
    </svg>
  );
}
