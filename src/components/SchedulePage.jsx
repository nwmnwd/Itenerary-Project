import { useState, useEffect, useMemo, useRef } from "react";
import Calendar from "./Calendar";
import Timeline from "./Timeline";
import Header from "./Header";
import SearchBox from "./SearchBox";
import {
  startOfDay,
  parseISO,
  differenceInCalendarDays,
  format,
} from "date-fns";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);

  // Load itinerary data once
  const [itineraryData, setItineraryData] = useState(() => {
    try {
      const saved = localStorage.getItem("itinerary_data");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      // Clean up empty dates before saving
      const cleanedData = Object.keys(itineraryData).reduce((acc, dateStr) => {
        if (itineraryData[dateStr] && itineraryData[dateStr].length > 0) {
          acc[dateStr] = itineraryData[dateStr];
        }
        return acc;
      }, {});
      
      localStorage.setItem("itinerary_data", JSON.stringify(cleanedData));
    } catch {
      // optional handling
    }
  }, [itineraryData]);

  const selectedDayRef = useRef(selectedDay);
  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  // Track today's current activity
  useEffect(() => {
    const today = startOfDay(new Date());
    if (selectedDayRef.current.getTime() === today.getTime()) {
      setTodayCurrentActivity(currentActivity);
    }
  }, [currentActivity]);

  // Today date string
  const todayDateStr = useMemo(
    () => format(startOfDay(new Date()), "yyyy-MM-dd"),
    [],
  );

  // First activity of today
  const todayFirstActivity = useMemo(() => {
    const list = itineraryData[todayDateStr] || [];
    return list.length > 0 ? list[0] : null;
  }, [itineraryData, todayDateStr]);

  // Day number for today - only count dates with data
  const todayDayNumber = useMemo(() => {
    // Get only dates that have activities (not empty)
    const datesWithData = Object.keys(itineraryData)
      .filter(dateStr => itineraryData[dateStr] && itineraryData[dateStr].length > 0)
      .sort();
    
    if (datesWithData.length === 0) return 1;

    const first = datesWithData[0];
    try {
      const diff = differenceInCalendarDays(
        parseISO(todayDateStr),
        parseISO(first),
      );
      return diff >= 0 ? diff + 1 : 1;
    } catch {
      return 1;
    }
  }, [itineraryData, todayDateStr]);

  // Total items today
  const todayTotalItems = useMemo(() => {
    return (itineraryData[todayDateStr] || []).length;
  }, [itineraryData, todayDateStr]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        todayCurrentActivity={
          todayCurrentActivity == null
            ? todayFirstActivity
            : todayCurrentActivity
        }
        completedCount={completedCount}
        totalItems={todayTotalItems}
        dayNumber={todayDayNumber}
      />

      <div className="sticky top-0 z-30 bg-white pb-2">
        <div className="mx-2 mt-4">
          <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          <SearchBox />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <Timeline
          selectedDay={selectedDay}
          onActiveChange={setCurrentActivity}
          onCompletedChange={setCompletedCount}
          itineraryData={itineraryData}
          setItineraryData={setItineraryData}
        />
      </main>
    </div>
  );
}