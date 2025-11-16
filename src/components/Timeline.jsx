import { useState, useRef, useEffect, useMemo } from "react";
import TimelineCard from "./TimelineCard.jsx";
import TimelineIndicator from "./TimelineIndicator.jsx";
import itineraryData from "../../data/itineraryData.js";
import { format, startOfDay } from "date-fns";

const STORAGE_KEY = "timeline_state";

export default function Timeline({ selectedDay, onActiveChange, onCompletedChange }) {
  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");
  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");

  // ---------------------------
  // State per tanggal
  // ---------------------------
  const [timelineState, setTimelineState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getDateState = (dateStr) =>
    timelineState[dateStr] || { currentIndex: 0, completedUpTo: -1 };

  const updateDateState = (dateStr, newState) =>
    setTimelineState((prev) => {
      const updated = {
        ...prev,
        [dateStr]: {
          ...getDateState(dateStr),
          ...newState,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

  const { currentIndex, completedUpTo } = getDateState(selectedDateStr);
  const refs = useRef([]);
  const lastDateRef = useRef(null);

  // ---------------------------
  // Auto scroll per tanggal
  // ---------------------------
  useEffect(() => {
    const isToday = selectedDateStr === todayStr;

    // Tanggal berubah
    if (lastDateRef.current !== selectedDateStr) {
      lastDateRef.current = selectedDateStr;

      // Reset state untuk tanggal baru (selain hari ini)
      if (!isToday) {
        updateDateState(selectedDateStr, { currentIndex: 0, completedUpTo: -1 });

        requestAnimationFrame(() => {
          refs.current[0]?.scrollIntoView({ behavior: "auto", block: "center" });
        });
      } else {
        requestAnimationFrame(() => {
          refs.current[currentIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }

    // Jika hari ini → scroll otomatis ke currentIndex
    if (isToday) {
      requestAnimationFrame(() => {
        refs.current[currentIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [selectedDateStr, todayStr, currentIndex]);

  // ---------------------------
  // Filter data per tanggal
  // ---------------------------
  const filteredData = useMemo(
    () => itineraryData[selectedDateStr] || [],
    [selectedDateStr]
  );

  // ---------------------------
  // Notify parent
  // ---------------------------
  useEffect(() => {
    onActiveChange?.(filteredData[currentIndex] ?? null);
  }, [currentIndex, filteredData, onActiveChange]);

  useEffect(() => {
    // Hitung completedUpTo hanya untuk hari ini
    if (selectedDateStr === todayStr) {
      onCompletedChange?.(completedUpTo >= 0 ? completedUpTo + 1 : 0);
    }
  }, [completedUpTo, selectedDateStr, todayStr, onCompletedChange]);

  // Update refs
  refs.current = filteredData.map((_, i) => refs.current[i] ?? null);

  // ---------------------------
  // Scroll helper
  // ---------------------------
  const goTo = (i) => {
    const el = refs.current[i];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ---------------------------
  // Step click logic
  // ---------------------------
  const handleStepClick = (i) => {
    const isToday = selectedDateStr === todayStr;

    if (i <= completedUpTo) {
      updateDateState(selectedDateStr, {
        currentIndex: i,
        ...(isToday ? { completedUpTo: i - 1 } : {}),
      });
      goTo(i);
      return;
    }

    const next = Math.min(i + 1, filteredData.length - 1);
    updateDateState(selectedDateStr, {
      currentIndex: next,
      ...(isToday ? { completedUpTo: Math.max(completedUpTo, i) } : {}),
    });
    goTo(next);
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="mx-8 mt-5 mb-8">
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-lg font-semibold text-gray-500">No schedule</p>
        </div>
      ) : (
        <div className="relative flex gap-4">
          <TimelineIndicator
            data={filteredData}
            currentIndex={currentIndex}
            completedUpTo={completedUpTo}
            onClick={handleStepClick}
          />
          <div className="flex flex-1 flex-col gap-0">
            {filteredData.map((it, i) => (
              <div ref={(el) => (refs.current[i] = el)} key={it.id}>
                <TimelineCard
                  {...it}
                  isActive={i === currentIndex}
                  onClick={() => {
                    updateDateState(selectedDateStr, { currentIndex: i });
                    goTo(i);
                    onActiveChange?.(it);
                  }}
                  onToggleDone={() => handleStepClick(i)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
