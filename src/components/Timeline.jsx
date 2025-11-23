import { useState, useRef, useEffect, useCallback } from "react";
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
  searchQuery = "",
  // 🔥 TAMBAH PROP BARU
  isPremium,
  onShowSubscriptionForSave,
}) {
  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");
  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");

  // *** BLOK useEffect YANG BERMASALAH TELAH DIHAPUS DI SINI ***

  const [timelineState, setTimelineState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getDateState = useCallback(
    (dateStr) =>
      timelineState[dateStr] || { currentIndex: 0, completedUpTo: -1 },
    [timelineState],
  );

  const updateDateState = useCallback((dateStr, newState) => {
    setTimelineState((prev) => {
      const updated = {
        ...prev,
        [dateStr]: {
          ...prev[dateStr],
          ...newState,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveItem = useCallback(
    (dateStr, id, newFields) => {
      setItineraryData((prev) => ({
        ...prev,
        [dateStr]: prev[dateStr].map((item) => {
          if (item.id === id) {
            // 🔥 PERBAIKAN: Set isNew menjadi false secara eksplisit saat menyimpan
            return {
              ...item,
              ...newFields,
              isNew: false, // <--- INI PENTING!
            };
          }
          return item;
        }),
      }));
    },
    [setItineraryData],
  );
  const addItem = useCallback(
    (dateStr) => {
      setItineraryData((prev) => ({
        ...prev,
        [dateStr]: [
          ...(prev[dateStr] || []),
          {
            id: crypto.randomUUID(),
            time: "23:59",
            activity: "",
            location: "",
            notes: "",
            isNew: true,
          },
        ],
      }));
    },
    [setItineraryData],
  );
  // Sort and filter data by time and search query
  const filteredData = [...(itineraryData[selectedDateStr] || [])]
    .sort((a, b) => {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const activity = (item.activity || "").toLowerCase();
      const location = (item.location || "").toLowerCase();
      const notes = (item.notes || "").toLowerCase();

      return (
        activity.includes(query) ||
        location.includes(query) ||
        notes.includes(query)
      );
    });

  const rawState = getDateState(selectedDateStr);

  // Safely clamp indices based on current data length
  const currentIndex =
    filteredData.length === 0
      ? 0
      : Math.min(Math.max(0, rawState.currentIndex), filteredData.length - 1);
  const completedUpTo =
    filteredData.length === 0
      ? -1
      : Math.min(rawState.completedUpTo, filteredData.length - 1);

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
            block: "center",
          });
        });
      }

      return;
    }

    if (isToday) {
      requestAnimationFrame(() => {
        onActiveChange?.(filteredData[currentIndex]);
        refs.current[currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [
    selectedDateStr,
    todayStr,
    currentIndex,
    filteredData,
    onActiveChange,
    updateDateState,
  ]);

  const deleteItem = useCallback(
    (dateStr, id) => {
      setItineraryData((prev) => {
        const newData = prev[dateStr].filter((item) => item.id !== id);

        // If all items deleted, reset state
        if (newData.length === 0) {
          requestAnimationFrame(() => {
            updateDateState(dateStr, {
              currentIndex: 0,
              completedUpTo: -1,
            });
          });
        } else {
          // Adjust indices if needed
          const state = getDateState(dateStr);
          const newCurrentIndex = Math.min(
            state.currentIndex,
            newData.length - 1,
          );
          const newCompletedUpTo = Math.min(
            state.completedUpTo,
            newData.length - 1,
          );

          if (
            newCurrentIndex !== state.currentIndex ||
            newCompletedUpTo !== state.completedUpTo
          ) {
            requestAnimationFrame(() => {
              updateDateState(dateStr, {
                currentIndex: Math.max(0, newCurrentIndex),
                completedUpTo: newCompletedUpTo,
              });
            });
          }
        }

        return {
          ...prev,
          [dateStr]: newData,
        };
      });
    },
    [setItineraryData, updateDateState, getDateState],
  );

  const handleSaveAttempt = useCallback(
    (itemId, activityData, isNew, setEditingToFalse) => {
      const dateStr = selectedDateStr; // Tanggal saat ini

      // 1. Cek Premium hanya jika ini item baru
      if (isNew && !isPremium && onShowSubscriptionForSave) {
        // Hapus kartu kosong (kartu yang baru dibuat) segera
        deleteItem(dateStr, itemId);

        // Panggil modal, kirim data aktivitas yang akan disimpan
        onShowSubscriptionForSave(activityData, dateStr);
        setEditingToFalse(); // Tutup mode edit
        return;
      }

      // 2. Jika Premium ATAU item lama, langsung simpan
      saveItem(dateStr, itemId, activityData);
      setEditingToFalse();
    },
    [
      isPremium,
      onShowSubscriptionForSave,
      selectedDateStr,
      saveItem,
      deleteItem,
    ],
  );

  useEffect(() => {
    if (selectedDateStr === todayStr) {
      const count = completedUpTo >= 0 ? completedUpTo + 1 : 0;

      requestAnimationFrame(() => {
        onCompletedChange?.(count);
      });
    }
  }, [completedUpTo, selectedDateStr, todayStr, onCompletedChange]);

  refs.current = filteredData.map((_, i) => refs.current[i] ?? null);

  const goTo = useCallback((i) => {
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleStepClick = useCallback(
    (i) => {
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
    },
    [
      selectedDateStr,
      todayStr,
      completedUpTo,
      filteredData,
      onActiveChange,
      goTo,
      updateDateState,
    ],
  );

  return (
    <div className="mx-4 mt-5 mb-8">
      {searchQuery && filteredData.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No results found for "{searchQuery}"
        </div>
      )}

      <div className="relative flex gap-1 px-2">
        <TimelineIndicator
          data={filteredData}
          currentIndex={currentIndex}
          completedUpTo={completedUpTo}
          onClick={handleStepClick}
        />

        <div className="flex flex-1 flex-col gap-6">
          {filteredData.map((item, i) => (
            <div ref={(el) => (refs.current[i] = el)} key={item.id}>
              <TimelineCard
                {...item}
                isNew={item.isNew}
                isActive={i === currentIndex}
                onClick={() => {
                  updateDateState(selectedDateStr, { currentIndex: i });
                  onActiveChange?.(filteredData[i]);
                  goTo(i);
                }}
                // 🔥 GANTI onEdit DENGAN onSaveAttempt
                onSaveAttempt={(
                  itemId,
                  activityData,
                  isNew,
                  setEditingToFalse,
                ) =>
                  handleSaveAttempt(
                    itemId,
                    activityData,
                    isNew,
                    setEditingToFalse,
                  )
                }
                onDelete={() => deleteItem(selectedDateStr, item.id)}
                searchQuery={searchQuery}
              />
            </div>
          ))}

          <button
            className="w-full rounded-md bg-violet-600 py-2 text-lg text-white hover:bg-violet-900"
            onClick={() => addItem(selectedDateStr)}
          >
            + New Activity
          </button>
        </div>
      </div>
    </div>
  );
}
