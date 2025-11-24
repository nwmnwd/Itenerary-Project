import { useState, useEffect, useMemo, useRef, useCallback } from "react";

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
import SubscriptionModal from "./SubscriptionModal";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { CalendarDate } from "../assets/icons";

// local storage premium
const PREMIUM_STORAGE_KEY = "user_is_premium";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isPremium, setIsPremium] = useState(() => {
    try {
      const saved = localStorage.getItem(PREMIUM_STORAGE_KEY);
      return saved === "true";
    } catch {
      return false;
    }
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingActivity, setPendingActivity] = useState(null);
  const [pendingDateStr, setPendingDateStr] = useState(null);
  const [itineraryData, setItineraryData] = useState(() => {
    try {
      const saved = localStorage.getItem("itinerary_data");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const selectedDateStr = format(selectedDay, "yyyy-MM-dd");

    setItineraryData((prev) => {
      if (prev[selectedDateStr]) return prev;

      return { ...prev, [selectedDateStr]: [] };
    });
  }, [selectedDay, setItineraryData]);

  useEffect(() => {
    try {
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

  const handlePaymentSuccess = useCallback(() => {
    setIsPremium(true);
    localStorage.setItem(PREMIUM_STORAGE_KEY, "true"); //

    setShowSubscriptionModal(false);

    if (pendingActivity && pendingDateStr) {
      setItineraryData((prev) => ({
        ...prev,
        [pendingDateStr]: [
          ...(prev[pendingDateStr] || []),
          {
            id: crypto.randomUUID(),
            ...pendingActivity,
            isNew: false,
          },
        ],
      }));
      setPendingActivity(null);
      setPendingDateStr(null);
    }
  }, [setItineraryData, pendingActivity, pendingDateStr]);

  const handleShowSubscriptionForSave = useCallback((activityData, dateStr) => {
    setPendingActivity(activityData);
    setPendingDateStr(dateStr);
    setShowSubscriptionModal(true);
  }, []);
  const selectedDayRef = useRef(selectedDay);
  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  const todayDateStr = useMemo(
    () => format(startOfDay(new Date()), "yyyy-MM-dd"),
    [],
  );

  useEffect(() => {
    const today = startOfDay(new Date());
    if (selectedDayRef.current.getTime() === today.getTime()) {
      setTodayCurrentActivity(currentActivity);
    } else {
      setTodayCurrentActivity(null);
    }
  }, [currentActivity]);

  useEffect(() => {
    const todayActivities = itineraryData[todayDateStr] || [];

    if (todayActivities.length === 0) {
      setTodayCurrentActivity(null);
      setCurrentActivity(null);
    } else if (todayCurrentActivity) {
      const stillExists = todayActivities.some(
        (item) => item.id === todayCurrentActivity.id,
      );
      if (!stillExists) {
        setTodayCurrentActivity(null);
      }
    }
  }, [itineraryData, todayDateStr, todayCurrentActivity]);

  const todayFirstActivity = useMemo(() => {
    const list = itineraryData[todayDateStr] || [];
    if (list.length === 0) return null;

    const sorted = [...list].sort((a, b) => {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    return sorted[0];
  }, [itineraryData, todayDateStr]);

  const todayDayNumber = useMemo(() => {
    const datesWithData = Object.keys(itineraryData)
      .filter(
        (dateStr) =>
          itineraryData[dateStr] && itineraryData[dateStr].length > 0,
      )
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

  const todayTotalItems = useMemo(() => {
    return (itineraryData[todayDateStr] || []).length;
  }, [itineraryData, todayDateStr]);

  const ToggleIcon = isCalendarOpen ? ChevronUpIcon : CalendarDate;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 bg-white shadow-md">
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

        <div className="mx-2 mt-2 bg-white pb-2">
          <div
            id="calendar-panel"
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isCalendarOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          </div>

          <div className="flex flex-row items-center gap-2.5">
            <div className="flex-1">
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </div>
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="rounded-full pr-4 text-violet-900 transition-colors hover:bg-gray-100"
              aria-expanded={isCalendarOpen}
              aria-controls="calendar-panel"
            >
              <ToggleIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <Timeline
          selectedDay={selectedDay}
          onActiveChange={setCurrentActivity}
          onCompletedChange={setCompletedCount}
          itineraryData={itineraryData}
          setItineraryData={setItineraryData}
          searchQuery={searchQuery}
          isPremium={isPremium}
          onShowSubscriptionForSave={handleShowSubscriptionForSave}
        />
      </main>
      {showSubscriptionModal && (
        <SubscriptionModal
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowSubscriptionModal(false);
            setPendingActivity(null);
            setPendingDateStr(null);
          }}
        />
      )}
    </div>
  );
}
