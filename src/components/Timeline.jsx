import { useState, useRef, useEffect } from "react";
import TimelineCard from "./TimelineCard.jsx";
import TimelineIndicator from "./TimelineIndicator.jsx";
import { format, startOfDay } from "date-fns";

const STORAGE_KEY = "timeline_state";

export default function Timeline({
  selectedDay,
  onActiveChange,
  onCompletedChange,
  itineraryData,
  setItineraryData,
}) {
  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");
  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");

  useEffect(() => {
    setItineraryData((prev) => {
      if (prev[selectedDateStr]) return prev;
      return { ...prev, [selectedDateStr]: [] };
    });
  }, [selectedDateStr, setItineraryData]);

  const addItem = (dateStr) => {
    setItineraryData((prev) => ({
      ...prev,
      [dateStr]: [
        ...(prev[dateStr] || []),
        {
          id: crypto.randomUUID(),
          time: "00:00",
          activity: "New Activity",
          location: "Unknown",
          isNew: true,
        },
      ],
    }));
  };

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

  useEffect(() => {
    const isToday = selectedDateStr === todayStr;

    if (lastDateRef.current !== selectedDateStr) {
      lastDateRef.current = selectedDateStr;

      if (!isToday) {
        updateDateState(selectedDateStr, {
          currentIndex: 0,
          completedUpTo: -1,
        });

        requestAnimationFrame(() => {
          onActiveChange?.(filteredData[0]);
          refs.current[0]?.scrollIntoView({ behavior: "auto", block: "end" });
        });
      } else {
        requestAnimationFrame(() => {
          onActiveChange?.(filteredData[currentIndex]);
          refs.current[currentIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        });
      }

      return;
    }

    if (isToday) {
      requestAnimationFrame(() => {
        onActiveChange?.(filteredData[currentIndex]); // ← FIX
        refs.current[currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [selectedDateStr, todayStr, currentIndex]);

  const filteredData = itineraryData[selectedDateStr] || [];

  const editItem = (dateStr, id, newFields) => {
    setItineraryData((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].map((item) =>
        item.id === id ? { ...item, ...newFields } : item,
      ),
    }));
  };

  const deleteItem = (dateStr, id) =>
    setItineraryData((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((item) => item.id !== id),
    }));

  useEffect(() => {
    if (selectedDateStr === todayStr) {
      onCompletedChange?.(completedUpTo >= 0 ? completedUpTo + 1 : 0);
    }
  }, [completedUpTo, selectedDateStr, todayStr]);

  refs.current = filteredData.map((_, i) => refs.current[i] ?? null);

  const goTo = (i) => {
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleStepClick = (i) => {
    const isToday = selectedDateStr === todayStr;

    if (i <= completedUpTo) {
      updateDateState(selectedDateStr, {
        currentIndex: i,
        ...(isToday ? { completedUpTo: i - 1 } : {}),
      });
    } else {
      const next = Math.min(i + 1, filteredData.length - 1);
      updateDateState(selectedDateStr, {
        currentIndex: next,
        ...(isToday ? { completedUpTo: Math.max(completedUpTo, i) } : {}),
      });
    }
    onActiveChange?.(filteredData[i]);

    goTo(i);
  };

  const [positions, setPositions] = useState({});

  const handlePosition = (id, pos) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
  };

  return (
    <div className="mx-8 mt-5 mb-8">
      <div className="relative flex gap-4">
        <TimelineIndicator
          data={filteredData}
          currentIndex={currentIndex}
          completedUpTo={completedUpTo}
          positions={positions}
          onClick={handleStepClick}
        />

        <div className="flex flex-1 flex-col gap-4">
          {filteredData.map((item, i) => (
            <div ref={(el) => (refs.current[i] = el)} key={item.id}>
              <TimelineCard
                {...item}
                onPositionChange={(pos) => handlePosition(item.id, pos)}
                isNew={item.isNew}
                isActive={i === currentIndex}
                onClick={() => {
                  updateDateState(selectedDateStr, { currentIndex: i });

                  // 🔥 FIX — update current active item
                  onActiveChange?.(filteredData[i]);

                  goTo(i);
                }}
                onEdit={(fields) => editItem(selectedDateStr, item.id, fields)}
                onDelete={() => deleteItem(selectedDateStr, item.id)}
              />
            </div>
          ))}

          <button
            className="w-full rounded-md bg-violet-600 py-2 text-white hover:bg-violet-900"
            onClick={() => addItem(selectedDateStr)}
          >
            + New Activity
          </button>
        </div>
      </div>
    </div>
  );
}
