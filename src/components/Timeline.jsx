import { useState, useRef } from "react";
import TimelineCard from "./TimelineCard.jsx";
import TimelineIndicator from "./TimelineIndicator.jsx";
import itinerary from "../../data/itineraries.js";

export default function Timeline() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedUpTo, setCompletedUpTo] = useState(-1);
  const refs = useRef([]);

  refs.current = itinerary.map((_, i) => refs.current[i] ?? null);

  function goTo(i) {
    const el = refs.current[i];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function handleStepClick(i) {
    if (i <= completedUpTo) {
      setCurrentIndex(i);
      setCompletedUpTo(i - 1);
      goTo(i);
      return;
    }

    setCompletedUpTo((prev) => Math.max(prev, i));
    const next = Math.min(i + 1, itinerary.length - 1);
    setCurrentIndex(next);
    goTo(next);
  }

  return (
    <div className="mx-8 mt-5 mb-8">
      <div className="relative flex gap-4">
        {/* Left timeline indicator */}
        <TimelineIndicator
          currentIndex={currentIndex}
          completedUpTo={completedUpTo}
          onClick={handleStepClick}
        />

        {/* Right timeline cards */}
        <div className="flex flex-1 flex-col gap-0">
          {itinerary.map((it, i) => (
            <div ref={(el) => (refs.current[i] = el)} key={it.id}>
              <TimelineCard
                time={it.time}
                title={it.activity}
                location={it.location}
                isActive={i === currentIndex}
                onClick={() => handleStepClick(i)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
