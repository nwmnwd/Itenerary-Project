import { useState, useEffect } from "react";
import Calendar from "./Calendar";
import Timeline from "./Timeline";
import Header from "./Header";
import SearchBox from "./SearchBox";
import { startOfDay } from "date-fns";
import { useMemo } from "react";
import itineraryData from "../../data/itineraryData.js";
import { parseISO, differenceInCalendarDays, format } from "date-fns";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // clear activity when date changes
    setCurrentActivity(null);
    setCompletedCount(0);
  }, [selectedDay]);

  const selectedDateStr = useMemo(() => format(selectedDay, "yyyy-MM-dd"), [selectedDay]);

  const totalItems = useMemo(() => (itineraryData[selectedDateStr] || []).length, [selectedDateStr]);

  const dayNumber = useMemo(() => {
    const dates = Object.keys(itineraryData).sort();
    if (dates.length === 0) return 1;
    const first = dates[0];
    try {
      const diff = differenceInCalendarDays(parseISO(selectedDateStr), parseISO(first));
      return diff >= 0 ? diff + 1 : 1;
    } catch {
      return 1;
    }
  }, [selectedDateStr]);

  // first activity for this date (used as header default when nothing selected)
  const firstActivity = useMemo(() => {
    const list = itineraryData[selectedDateStr] || [];
    return list.length > 0 ? list[0] : null;
  }, [selectedDateStr]);

  return (
    <div className="flex h-screen flex-col">
      {/* Top area: stays visible */}
      <div className="sticky top-0 z-30 bg-white">
        <Header
          currentActivity={currentActivity ?? firstActivity}
          completedCount={completedCount}
          totalItems={totalItems}
          dayNumber={dayNumber}
        />
        <div className="bg-white">
          <div className="mx-4 mt-4">
            <Calendar
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
            <SearchBox />
          </div>
        </div>
      </div>

      {/* Scrollable timeline */}
      <main className="flex-1 overflow-y-auto">
        <Timeline
          selectedDay={selectedDay}
          onActiveChange={setCurrentActivity}
          onCompletedChange={setCompletedCount}
        />
      </main>
    </div>
  );
}
