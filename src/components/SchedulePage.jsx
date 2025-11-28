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
  setMinutes,
  setHours,
  subMinutes,
} from "date-fns";
import SubscriptionModal from "./SubscriptionModal";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { CalendarDate } from "../assets/icons";
import OneSignal from "react-onesignal";

const PREMIUM_STORAGE_KEY = "user_is_premium";

const calculateReminderTime = (dateStr, timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);

  let reminderDate = parseISO(dateStr);
  reminderDate = setHours(reminderDate, hours);
  reminderDate = setMinutes(reminderDate, minutes);

  const finalReminderTime = subMinutes(reminderDate, 5);

  const year = finalReminderTime.getFullYear();
  const month = String(finalReminderTime.getMonth() + 1).padStart(2, "0");
  const day = String(finalReminderTime.getDate()).padStart(2, "0");
  const hour = String(finalReminderTime.getHours()).padStart(2, "0");
  const minute = String(finalReminderTime.getMinutes()).padStart(2, "0");
  const second = String(finalReminderTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second} GMT+0800`;
};

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [playerId, setPlayerId] = useState(null); // ✅ State untuk Player ID

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

  // ✅ Dapatkan Player ID dari OneSignal
  useEffect(() => {
    const getPlayerId = async () => {
      try {
        // Tunggu sampai OneSignal terinisialisasi
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionId = OneSignal.User.PushSubscription.id;
        
        if (subscriptionId) {
          console.log("✅ Player ID ditemukan:", subscriptionId);
          setPlayerId(subscriptionId);
        } else {
          console.warn("⚠️ Player ID tidak ditemukan. User mungkin belum subscribe.");
        }
      } catch (error) {
        console.error("❌ Error mendapatkan Player ID:", error);
      }
    };

    getPlayerId();
  }, []);

  // ✅ Fungsi schedule dengan Player ID
  const scheduleNewReminder = useCallback(
    async (title, content, deliveryTime) => {
      try {
        console.log("📤 Sending notification:", {
          title,
          content,
          deliveryTime,
          playerId, // Log Player ID
        });

        // ✅ Validasi Player ID
        if (!playerId) {
          console.warn("⚠️ Player ID tidak tersedia. Notifikasi akan dikirim ke semua subscriber.");
        }

        const apiUrl = window.location.origin + "/api/schedule-reminder";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            content: content,
            deliveryTime: deliveryTime,
            userId: playerId, // ✅ Kirim Player ID
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log("✅ Notifikasi berhasil dijadwalkan!", data);
          alert(
            `✅ Reminder successfully scheduled!\n\n` +
            `📌 Activity: ${title}\n` +
            `🕐 Time: ${deliveryTime}\n` +
            `👥 Recipients: ${data.recipients || 'All subscribers'}`
          );
        } else {
          console.error("❌ Gagal menjadwalkan notifikasi:", data);
          alert(
            `❌ Failed to schedule reminder\n\n` +
            `Error: ${data.error || "Unknown error"}`
          );
        }
      } catch (error) {
        console.error("❌ Error saat fetch API:", error);
        alert(`❌ Network Error: ${error.message}`);
      }
    },
    [playerId], // ✅ Tambahkan playerId ke dependency
  );

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

  const scheduleActivity = useCallback(
    async (activityData, dateStr) => {
      if (!activityData.activity) return;

      try {
        const title = activityData.activity || "Aktivitas";
        const deliveryTimeISO = calculateReminderTime(
          dateStr,
          activityData.time,
        );

        const reminderTime = new Date(
          deliveryTimeISO.replace(" GMT+0800", "+08:00"),
        );
        const now = new Date();

        // ✅ Validasi dengan buffer 1 menit (60 detik)
        const minTime = new Date(now.getTime() + 60000);

        if (reminderTime <= minTime) {
          alert(
            "⚠️ Waktu reminder terlalu dekat (kurang dari 1 menit). Aktivitas tetap disimpan tapi reminder tidak dijadwalkan.",
          );
          return;
        }

        await scheduleNewReminder(
          title,
          `Aktivitasmu akan dimulai pukul ${activityData.time}!`,
          deliveryTimeISO,
        );
      } catch (e) {
        console.error("Gagal menjadwalkan notifikasi:", e);
        alert(`Gagal menjadwalkan reminder: ${e.message}`);
      }
    },
    [scheduleNewReminder],
  );

  const scheduleAndSavePendingActivity = useCallback(async () => {
    if (!pendingActivity || !pendingDateStr) return;

    const newActivity = {
      id: crypto.randomUUID(),
      ...pendingActivity,
      isNew: false,
    };

    try {
      const title = pendingActivity.activity || "Aktivitas";
      const deliveryTimeISO = calculateReminderTime(
        pendingDateStr,
        pendingActivity.time,
      );

      const reminderTime = new Date(
        deliveryTimeISO.replace(" GMT+0800", "+08:00"),
      );
      const now = new Date();
      const minTime = new Date(now.getTime() + 60000);

      if (reminderTime <= minTime) {
        alert(
          "⚠️ Waktu aktivitas terlalu dekat. Reminder tidak dapat dijadwalkan, tapi jadwal tetap disimpan.",
        );
      } else {
        await scheduleNewReminder(
          title,
          `Aktivitasmu akan dimulai pukul ${pendingActivity.time}!`,
          deliveryTimeISO,
        );
      }
    } catch (e) {
      console.error("Gagal menjadwalkan notifikasi:", e);
    }

    setItineraryData((prev) => ({
      ...prev,
      [pendingDateStr]: [...(prev[pendingDateStr] || []), newActivity],
    }));

    setPendingActivity(null);
    setPendingDateStr(null);
  }, [setItineraryData, pendingActivity, pendingDateStr, scheduleNewReminder]);

  const handlePaymentSuccess = useCallback(async () => {
    console.log("DEBUG-1: handlePaymentSuccess dipanggil");
    setIsPremium(true);
    localStorage.setItem(PREMIUM_STORAGE_KEY, "true");
    setShowSubscriptionModal(false);
    await scheduleAndSavePendingActivity();
  }, [scheduleAndSavePendingActivity]);

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
      <div className="sticky top-0 z-50 bg-white shadow-xs">
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
              className="rounded-full pr-4 text-indigo-500 transition-colors hover:bg-gray-100"
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