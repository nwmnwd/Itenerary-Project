import { useLayoutEffect, useRef, useState } from "react";

export default function TimelineIndicator({
  data,
  currentIndex,
  completedUpTo,
  onClick,
}) {
  const containerRef = useRef(null);
  const [positions, setPositions] = useState([]);

  useLayoutEffect(() => {
    const update = () => {
      if (!containerRef.current) return;

      const parent = containerRef.current.closest('.relative.flex.gap-4');
      if (!parent) return;

      const times = parent.querySelectorAll('.time-text');
      if (times.length !== data.length) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const newPos = Array.from(times).map(time => {
        const rect = time.getBoundingClientRect();
        // Posisi TOP dari time + setengah HEIGHT untuk center
        return rect.top - containerRect.top + (rect.height / 2);
      });

      setPositions(newPos);
    };

    // Force multiple updates
    update();
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 300);
    const t3 = setTimeout(update, 600);
    const t4 = setTimeout(update, 1000);

    window.addEventListener('resize', update);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', update);
    };
  }, [data.length]);

  // Fallback positions jika belum ter-update
  const displayPos = positions.length === data.length 
    ? positions 
    : data.map((_, i) => i * 180 + 20);

  const lineTop = displayPos[0];
  const lineBottom = displayPos[displayPos.length - 1];
  const completedEnd = completedUpTo >= 0 ? displayPos[completedUpTo] : lineTop;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: "48px", minHeight: `${lineBottom + 50}px` }}
    >
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2"
        width="48"
        style={{ height: "100%", minHeight: `${lineBottom + 50}px` }}
      >
        <line
          x1="24"
          y1={lineTop}
          x2="24"
          y2={lineBottom}
          stroke="#e5e7eb"
          strokeWidth="3"
        />

        {completedUpTo >= 0 && (
          <line
            x1="24"
            y1={lineTop}
            x2="24"
            y2={completedEnd}
            stroke="#6d28d9"
            strokeWidth="4"
          />
        )}
      </svg>

      {data.map((it, i) => (
        <div
          key={it.id}
          className="absolute z-10"
          style={{
            top: `${displayPos[i]}px`,
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <button
            type="button"
            onClick={() => onClick(i)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              i <= completedUpTo
                ? "bg-violet-600 text-white"
                : i === currentIndex
                  ? "border-4 border-violet-300 bg-white"
                  : "bg-gray-300"
            }`}
          >
            {i <= completedUpTo ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : i === currentIndex ? (
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-600" />
            ) : null}
          </button>
        </div>
      ))}
    </div>
  );
}