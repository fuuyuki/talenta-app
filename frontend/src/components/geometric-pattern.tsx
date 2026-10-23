export function GeometricPattern({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`h-full w-full ${className}`}>
      <defs>
        <pattern
          id="talenta-geometric"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M36 4 68 36 36 68 4 36Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M12 12 60 60M60 12 12 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <circle
            cx="36"
            cy="36"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#talenta-geometric)" />
    </svg>
  );
}
