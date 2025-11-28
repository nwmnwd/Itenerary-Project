import { PinIcon, Calendar } from "../assets/icons";
import { format } from "date-fns";

function Header({
  todayCurrentActivity,
  completedCount = 0,
  totalItems = 0,
  dayNumber = 1,
}) {
  const today = new Date();
  const formatted = format(today, "EEEE, MMMM yyyy");

  const title = todayCurrentActivity?.activity || "No schedule";
  const location = todayCurrentActivity?.location || "";
  const time = todayCurrentActivity?.time || null;

  return (
    <>
      <div className="w-full bg-violet-500 px-8 pt-6 pb-6">
        <div className="flex flex-row items-center justify-between">
          <div className="mb-1 text-left text-sm font-light text-white">
            Current Focus:
          </div>
          <div className="rounded-4xl bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
            {time ? ` ${time}` : ""}
          </div>
        </div>
        <div className="mb-1 text-left text-2xl font-semibold text-white">
          {title}
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PinIcon className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-sm font-normal text-white">
              {location}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-sm font-normal text-white">
              {formatted}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-md m-0 inline-flex items-center justify-center rounded-md bg-violet-900 px-4 py-1 text-sm leading-none font-normal text-white">
            Day {dayNumber}
          </div>
          <div className="text-md rounded-md bg-amber-50 px-4 py-1 font-normal text-violet-800">
            {completedCount}/{totalItems} completed
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
