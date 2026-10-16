export default function Logo({
  size = 28,
  withText = true,
  glow = false,
}: {
  size?: number;
  withText?: boolean;
  glow?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        style={glow ? { filter: "drop-shadow(0 0 10px rgba(47,111,237,0.55))" } : undefined}
      >
        <defs>
          <linearGradient id="cf-logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2F6FED" />
            <stop offset="1" stopColor="#7C6AE8" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#cf-logo-grad)" />
        <g transform="translate(9 9)">
          <circle cx="4" cy="9" r="3" stroke="white" strokeWidth="1.5" />
          <circle cx="14" cy="9" r="3" stroke="white" strokeWidth="1.5" />
          <path d="M7 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
      {withText && (
        <span
          className="text-white font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: size * 0.5 }}
        >
          CogniFlow
        </span>
      )}
    </span>
  );
}