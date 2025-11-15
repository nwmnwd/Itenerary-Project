import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import {
  add,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  isEqual,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Calendar({ selectedDay, onSelectDay }) {
  let today = startOfToday();

  // awal minggu yang sedang ditampilkan
  let [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(today));

  // daftar 7 hari dalam minggu
  let days = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart),
  }).map((date) => ({ date }));

  // pindah minggu berikutnya
  function next() {
    setCurrentWeekStart(add(currentWeekStart, { weeks: 1 }));
  }

  // pindah minggu sebelumnya
  function previous() {
    setCurrentWeekStart(add(currentWeekStart, { weeks: -1 }));
  }

  // label bulan (jika minggu melewati dua bulan)
  let monthStart = format(currentWeekStart, "MMMM yyyy");
  let monthEnd = format(endOfWeek(currentWeekStart), "MMMM yyyy");
  let monthLabel =
    monthStart === monthEnd ? monthStart : `${monthStart} - ${monthEnd}`;

  return (
    <div className="pt-8">
      <div className="mx-auto max-w-4xl px-2">
        {/* Header */}
        <div className="flex items-center px-6">
          <h2 className="flex-auto font-semibold text-gray-900">
            {monthLabel}
          </h2>

          <button
            onClick={previous}
            className="-my-1.5 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            onClick={next}
            className="-my-1.5 ml-2 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nama hari */}
        <div className="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Tanggal dalam minggu */}
        <div className="mt-2 grid grid-cols-7 text-sm">
          {days.map((day, dayIdx) => (
            <div
              key={day.date.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day.date)],
                "pt-4 pb-2",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day.date)}
                className={classNames(
                  isEqual(day.date, selectedDay) && "bg-gray-900 text-white",
                  !isEqual(day.date, selectedDay) &&
                    isEqual(day.date, today) &&
                    "text-violet-600",
                  !isEqual(day.date, selectedDay) && "hover:bg-gray-200",
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full font-semibold",
                )}
              >
                <time dateTime={day.date}>{format(day.date, "d")}</time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
