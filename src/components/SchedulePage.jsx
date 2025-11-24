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

// local storage premium
const PREMIUM_STORAGE_KEY = "user_is_premium";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
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
