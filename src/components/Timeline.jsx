import { useState, useRef, useEffect, useMemo } from "react";
import TimelineCard from "./TimelineCard.jsx";
import TimelineIndicator from "./TimelineIndicator.jsx";
import itineraryData from "../../data/itineraryData.js";
import { format } from "date-fns";

export default function Timeline({
  selectedDay,
  onActiveChange,
  onCompletedChange,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedUpTo, setCompletedUpTo] = useState(-1);
  const refs = useRef([]);

  // Get itinerary data for selected date
  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");
  const filteredData = useMemo(
    () => itineraryData[selectedDateStr] || [],
    [selectedDateStr],
  );

  // Reset state when date changes
  useEffect(() => {
    setCurrentIndex(0);
    setCompletedUpTo(-1);
    if (onActiveChange) onActiveChange(null);
  }, [selectedDateStr, onActiveChange]);

  // notify parent when active index changes
  useEffect(() => {
    if (onActiveChange) {
      const activeItem = filteredData[currentIndex] ?? null;
      onActiveChange(activeItem);
    }
  }, [currentIndex, filteredData, onActiveChange]);

  // notify parent when completedUpTo changes
  useEffect(() => {
    if (onCompletedChange) {
      const completedCount = completedUpTo >= 0 ? completedUpTo + 1 : 0;
      onCompletedChange(completedCount);
    }
  }, [completedUpTo, onCompletedChange]);

  refs.current = filteredData.map((_, i) => refs.current[i] ?? null);

  function goTo(i) {
    const el = refs.current[i];
    if (el?.scrollIntoView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }

  function handleStepClick(i) {
    // Normal logic
    if (i <= completedUpTo) {
      setCurrentIndex(i);
      setCompletedUpTo(i - 1);
      goTo(i);
      return;
    }

    setCompletedUpTo((prev) => Math.max(prev, i));
    const next = Math.min(i + 1, filteredData.length - 1);
    setCurrentIndex(next);
    goTo(next);
  }

  return (
    <div className="mx-8 mt-5 mb-8">
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-lg font-semibold text-gray-500">No schedule</p>
        </div>
      ) : (
        <div className="relative flex gap-4">
          {/* Left indicator (progress / done) */}
          <TimelineIndicator
            data={filteredData}
            currentIndex={currentIndex}
            completedUpTo={completedUpTo}
            onClick={handleStepClick}
          />

          {/* Right cards */}
          <div className="flex flex-1 flex-col gap-0">
            {filteredData.map((it, i) => (
              <div ref={(el) => (refs.current[i] = el)} key={it.id}>
                <TimelineCard
                  {...it}
                  isActive={i === currentIndex}
                  onClick={() => {
                    setCurrentIndex(i);
                    goTo(i);
                    if (onActiveChange) onActiveChange(it);
                  }}
                  onToggleDone={() => handleStepClick(i)} // ☑ only for a button inside card
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
