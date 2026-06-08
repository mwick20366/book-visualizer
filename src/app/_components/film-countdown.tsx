// components/film-countdown.tsx

type FilmCountdownProps = {
  progress: number; // 0 -> 1
};

export function FilmCountdown({
  progress,
}: FilmCountdownProps) {
  const radius = 42;
  const circumference =
    2 * Math.PI * radius;

  const dashOffset =
    circumference *
    (1 - progress);

  return (
    <div className="flex items-center justify-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="overflow-visible"
      >
        {/* Outer ring */}

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
        />

        {/* Progress ring */}

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-300"
        />

        {/* Crosshair */}

        <line
          x1="60"
          y1="12"
          x2="60"
          y2="108"
          stroke="rgba(255,255,255,0.1)"
        />

        <line
          x1="12"
          y1="60"
          x2="108"
          y2="60"
          stroke="rgba(255,255,255,0.1)"
        />

        {/* Center circle */}

        <circle
          cx="60"
          cy="60"
          r="24"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.08)"
        />
      </svg>
    </div>
  );
}