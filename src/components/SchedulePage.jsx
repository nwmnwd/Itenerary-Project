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
import OneSignal from "react-onesignal";

const PREMIUM_STORAGE_KEY = "user_is_premium";

/* -------------------------------------------------------------
   ⭐ FIX UTAMA: HITUNG REMINDER 5 MENIT SEBELUM, FORMAT ISO AMAN
--------------------------------------------------------------*/
const calculateReminderTime = (dateStr, timeStr) => {
  const activityDate = new Date(`${dateStr}T${timeStr}:00+08:00`);
  const reminderTime = new Date(activityDate.getTime() - 5 * 60000);
  return reminderTime.toISOString(); // 👉 OneSignal expects UTC ISO
};

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  const [isPremium, setIsPremium] = useState(() => {
    try {
      return localStorage.getItem(PREMIUM_STORAGE_KEY) === "true";
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

  /* -------------------------------------------------------------
     GET PLAYER ID FROM ONESIGNAL
  --------------------------------------------------------------*/
  useEffect(() => {
    const getPlayerId = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const subscriptionId = OneSignal.User.PushSubscription.id;

        if (subscriptionId) {
          setPlayerId(subscriptionId);
          return;
        }

        // fallback
        const saved = localStorage.getItem("onesignal_player_id");
        if (saved) setPlayerId(saved);
      } catch (error) {
        console.error("Error getting Player ID:", error);
      }
    };
    getPlayerId();
  }, []);

  /* -------------------------------------------------------------
     ⭐ FIX: FUNCTION SCHEDULE NOTIFICATION TANPA ALERT()
  --------------------------------------------------------------*/
  const scheduleNewReminder = useCallback(
    async (title, content, deliveryTime) => {
      try {
        const isoTime =
          typeof deliveryTime === "string"
            ? deliveryTime
            : deliveryTime.toISOString();

        if (!playerId) {
          console.warn("Player ID not available. Cannot target user.");
          return;
        }

        const response = await fetch("/api/schedule-reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            deliveryTime: isoTime,
            userId: playerId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to schedule push:", data);
        } else {
          console.log("Push scheduled successfully:", data);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    },
    [playerId],
  );

  /* -------------------------------------------------------------
     INITIALIZE ITINERARY DATA STORAGE
  --------------------------------------------------------------*/
  useEffect(() => {
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    setItineraryData((prev) => {
      if (prev[dateStr]) return prev;
      return { ...prev, [dateStr]: [] };
    });
  }, [selectedDay]);

  useEffect(() => {
    try {
      const cleaned = {};
      for (const date in itineraryData) {
        if (itineraryData[date].length > 0) cleaned[date] = itineraryData[date];
      }
      localStorage.setItem("itinerary_data", JSON.stringify(cleaned));
    } catch {}
  }, [itineraryData]);

  /* -------------------------------------------------------------
     ⭐ FIX: SCHEDULE ACTIVITY (BENAR-BENAR 5 MENIT SEBELUM)
  --------------------------------------------------------------*/
  const scheduleActivity = useCallback(
    async (activityData, dateStr) => {
      if (!activityData.activity) return;

      try {
        const title = activityData.activity;
        const deliveryTimeISO = calculateReminderTime(dateStr, activityData.time);

        const reminderTime = new Date(deliveryTimeISO);
        const now = new Date();
        const minTime = new Date(now.getTime() + 60000);

        if (reminderTime <= minTime) {
          console.warn("Reminder terlalu dekat, tidak dijadwalkan.");
          return;
        }

        await scheduleNewReminder(
          title,
          `Aktivitasmu akan dimulai pukul ${activityData.time}!`,
          deliveryTimeISO,
        );
      } catch (error) {
        console.error("Error scheduling activity:", error);
      }
    },
    [scheduleNewReminder],
  );

  /* -------------------------------------------------------------
     HANDLE PREMIUM & PENDING ACTIVITY
  --------------------------------------------------------------*/
  const scheduleAndSavePendingActivity = useCallback(async () => {
    if (!pendingActivity || !pendingDateStr) return;

    const newActivity = {
      id: crypto.randomUUID(),
      ...pendingActivity,
      isNew: false,
    };

    try {
      const title = pendingActivity.activity;
      const deliveryTimeISO = calculateReminderTime(
        pendingDateStr,
        pendingActivity.time,
      );

      const reminderTime = new Date(deliveryTimeISO);
      const now = new Date();
      const minTime = new Date(now.getTime() + 60000);

      if (reminderTime > minTime) {
        await scheduleNewReminder(
          title,
          `Aktivitasmu akan dimulai pukul ${pendingActivity.time}!`,
          deliveryTimeISO,
        );
      }
    } catch (error) {
      console.error("Error scheduling pending activity:", error);
    }

    // Save itinerary item
    setItineraryData((prev) => ({
      ...prev,
      [pendingDateStr]: [...(prev[pendingDateStr] || []), newActivity],
    }));

    setPendingActivity(null);
    setPendingDateStr(null);
  }, [pendingActivity, pendingDateStr, scheduleNewReminder]);

  const handlePaymentSuccess = useCallback(async () => {
    setIsPremium(true);
    localStorage.setItem(PREMIUM_STORAGE_KEY, "true");
    setShowSubscriptionModal(false);
    await scheduleAndSavePendingActivity();
  }, [scheduleAndSavePendingActivity]);

  const handleShowSubscriptionForSave = useCallback((data, dateStr) => {
    setPendingActivity(data);
    setPendingDateStr(dateStr);
    setShowSubscriptionModal(true);
  }, []);

  /* -------------------------------------------------------------
     TODAY / TIMELINE LOGIC
  --------------------------------------------------------------*/
  const selectedDayRef = useRef(selectedDay);
  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  const todayStr = useMemo(
    () => format(startOfDay(new Date()), "yyyy-MM-dd"),
    [],
  );

  useEffect(() => {
    const today = startOfDay(new Date());
    setTodayCurrentActivity(
      selectedDayRef.current.getTime() === today.getTime()
        ? currentActivity
        : null,
    );
  }, [currentActivity]);

  const todayActivities = itineraryData[todayStr] || [];

  const todayFirstActivity = useMemo(() => {
    if (todayActivities.length === 0) return null;

    const sorted = [...todayActivities].sort((a, b) => {
      const [h1, m1] = a.time.split(":").map(Number);
      const [h2, m2] = b.time.split(":").map(Number);
      return h1 * 60 + m1 - (h2 * 60 + m2);
    });

    return sorted[0];
  }, [todayActivities]);

  const todayDayNumber = useMemo(() => {
    const keys = Object.keys(itineraryData).filter(
      (k) => itineraryData[k]?.length > 0,
    );

    if (keys.length === 0) return 1;

    keys.sort();
    const diff = differenceInCalendarDays(parseISO(todayStr), parseISO(keys[0]));
    return diff >= 0 ? diff + 1 : 1;
  }, [itineraryData, todayStr]);

  const todayTotalItems = todayActivities.length;

  const ToggleIcon = isCalendarOpen ? ChevronUpIcon : CalendarDate;

  /* -------------------------------------------------------------
     RENDER PAGE
  --------------------------------------------------------------*/
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 bg-white shadow-xs">
        <Header
          todayCurrentActivity={todayCurrentActivity ?? todayFirstActivity}
          completedCount={completedCount}
          totalItems={todayTotalItems}
          dayNumber={todayDayNumber}
        />

        <div className="mx-2 mt-2 bg-white pb-2">
          <div
            id="calendar-panel"
            className={`overflow-hidden transition-all duration-300 ${
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
              className="rounded-full pr-4 text-indigo-500 hover:bg-gray-100"
              aria-expanded={isCalendarOpen}
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
          onScheduleActivity={scheduleActivity}
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
