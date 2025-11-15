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
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);

  useEffect(() => {
    // clear activity when date changes
    setCurrentActivity(null);
    setCompletedCount(0);
  }, [selectedDay]);

  useEffect(() => {
    // track today's current activity separately
    const todayDate = startOfDay(new Date());
    if (selectedDay.getTime() === todayDate.getTime()) {
      setTodayCurrentActivity(currentActivity);
    }
  }, [currentActivity, selectedDay]);

  // first activity for today (always shown in header title)
  const todayDateStr = useMemo(
    () => format(startOfDay(new Date()), "yyyy-MM-dd"),
    [],
  );
  const todayFirstActivity = useMemo(() => {
    const list = itineraryData[todayDateStr] || [];
    return list.length > 0 ? list[0] : null;
  }, [todayDateStr]);

  // today's day number and total items
  const todayDayNumber = useMemo(() => {
    const dates = Object.keys(itineraryData).sort();
    if (dates.length === 0) return 1;
    const first = dates[0];
    try {
      const diff = differenceInCalendarDays(
        parseISO(todayDateStr),
        parseISO(first),
      );
      return diff >= 0 ? diff + 1 : 1;
    } catch {
      return 1;
    }
  }, [todayDateStr]);

  const todayTotalItems = useMemo(
    () => (itineraryData[todayDateStr] || []).length,
    [todayDateStr],
  );

  return (
    <div className="flex h-screen flex-col">
      {/* Top area: stays visible */}
      <div className="sticky top-0 z-30 bg-white">
        <Header
          todayCurrentActivity={todayCurrentActivity ?? todayFirstActivity}
          completedCount={completedCount}
          totalItems={todayTotalItems}
          dayNumber={todayDayNumber}
        />
        <div className="bg-white">
          <div className="mx-4 mt-4">
            <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
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
