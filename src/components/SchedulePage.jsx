// SchedulePage.jsx (KODE PERBAIKAN LENGKAP)

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

// 🔥 KUNCI LOCAL STORAGE UNTUK STATUS PREMIUM
const PREMIUM_STORAGE_KEY = "user_is_premium";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [currentActivity, setCurrentActivity] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayCurrentActivity, setTodayCurrentActivity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

// 櫨 STATE BARU UNTUK FITUR PREMIUM (TELAH DIPERBAIKI UNTUK MEMBACA DARI LOCALSTORAGE)
  const [isPremium, setIsPremium] = useState(() => {
    try {
        const saved = localStorage.getItem(PREMIUM_STORAGE_KEY);
        // Memuat status dari localStorage: jika tersimpan 'true', maka isPremium = true
        return saved === "true";
    } catch {
        return false;
    }
  }); 
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingActivity, setPendingActivity] = useState(null); 
  const [pendingDateStr, setPendingDateStr] = useState(null);
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
    const selectedDateStr = format(selectedDay, "yyyy-MM-dd");

    setItineraryData((prev) => {
      if (prev[selectedDateStr]) return prev;

      return { ...prev, [selectedDateStr]: [] };
    });
  }, [selectedDay, setItineraryData]); 
  // 櫨 END PERBAIKAN

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

  // 櫨 FUNGSI BARU: MENANGANI PEMBAYARAN SUKSES (TELAH DIPERBAIKI UNTUK MENYIMPAN KE LOCALSTORAGE)
  const handlePaymentSuccess = useCallback(() => {
    // 1. Ubah status premium pengguna DAN SIMPAN STATUSNYA
    setIsPremium(true);
    localStorage.setItem(PREMIUM_STORAGE_KEY, "true"); // 🔥 TAMBAHAN PENTING

    // 2. Tutup modal
    setShowSubscriptionModal(false);

    // 3. Simpan aktivitas yang tertunda (sama seperti addItem di Timeline)
    if (pendingActivity && pendingDateStr) {
        setItineraryData((prev) => ({
            ...prev,
            [pendingDateStr]: [
                ...(prev[pendingDateStr] || []),
                {
                    id: crypto.randomUUID(), 
                    ...pendingActivity, // Data yang sudah diisi pengguna
                    isNew: false, // Disimpan sebagai item normal
                },
            ],
        }));
        setPendingActivity(null); 
        setPendingDateStr(null);
    }
  }, [setItineraryData, pendingActivity, pendingDateStr]);

  // 櫨 FUNGSI BARU: MENAMPILKAN MODAL LANGGANAN
const handleShowSubscriptionForSave = useCallback((activityData, dateStr) => {
    setPendingActivity(activityData);
    setPendingDateStr(dateStr);
    setShowSubscriptionModal(true);
  }, []);
// ... (sisa kode)
// ... (sisa kode)
  const selectedDayRef = useRef(selectedDay);
  useEffect(() => {
    selectedDayRef.current = selectedDay;
  }, [selectedDay]);

  // Today date string
  const todayDateStr = useMemo(
    () => format(startOfDay(new Date()), "yyyy-MM-dd"),
    [],
  );

  // Track today's current activity
  useEffect(() => {
    const today = startOfDay(new Date());
    if (selectedDayRef.current.getTime() === today.getTime()) {
      setTodayCurrentActivity(currentActivity);
    } else {
      // Reset if not on today
      setTodayCurrentActivity(null);
    }
  }, [currentActivity]);

  // Reset todayCurrentActivity when itineraryData changes
  useEffect(() => {
    const todayActivities = itineraryData[todayDateStr] || [];

    // If no activities for today, reset
    if (todayActivities.length === 0) {
      setTodayCurrentActivity(null);
      setCurrentActivity(null);
    } else if (todayCurrentActivity) {
      // Check if current activity still exists
      const stillExists = todayActivities.some(
        (item) => item.id === todayCurrentActivity.id,
      );
      if (!stillExists) {
        setTodayCurrentActivity(null);
      }
    }
  }, [itineraryData, todayDateStr, todayCurrentActivity]);

  // First activity of today (sorted by time)
  const todayFirstActivity = useMemo(() => {
    const list = itineraryData[todayDateStr] || [];
    if (list.length === 0) return null;

    // Sort by time to get the earliest activity
    const sorted = [...list].sort((a, b) => {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    return sorted[0];
  }, [itineraryData, todayDateStr]);

  // Day number for today - only count dates with data
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
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto ">
        
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
      {/* 櫨 TAMPILKAN KOMPONEN SUBSCRIPTION MODAL DI SINI */}
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