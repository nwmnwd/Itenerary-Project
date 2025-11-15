import itinerary from "../../data/itineraryData.js";

export default function TimelineIndicator({
  currentIndex,
  completedUpTo,
  onClick,
}) {
  const rowHeight = 260;
  const btnCenterOffset = 26;

  const lineTop = btnCenterOffset;
  const lineBottom = (itinerary.length - 1) * rowHeight + btnCenterOffset;

  const totalHeight = itinerary.length * rowHeight + 24;

  return (
    <div
      className="relative"
      style={{ width: "48px", minHeight: `${totalHeight}px` }}
    >
      <svg
        className="absolute top-0 left-1/2 w-full -translate-x-1/2 transform"
        height={totalHeight}
        preserveAspectRatio="none"
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
            y2={completedUpTo * rowHeight + btnCenterOffset}
            stroke="#6d28d9"
            strokeWidth="4"
          />
        )}
      </svg>

      {itinerary.map((it, i) => (
        <div
          key={it.id}
          className="absolute z-10"
          style={{
            top: `${i * rowHeight + 2}px`,
            left: "50%",
            transform: "translateX(-50%)",
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
                aria-hidden
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
