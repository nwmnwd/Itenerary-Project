import { PinIcon, Calendar } from "../assets/icons";
import { format } from "date-fns";

function Header({ currentActivity, completedCount = 0, totalItems = 0, dayNumber = 1 }) {
  const today = new Date();
  const formatted = format(today, "EEEE, MMMM yyyy");

  const title = currentActivity?.activity || "Arrival at Hotel";
  const location = currentActivity?.location || "Natural View";
  const time = currentActivity?.time || null;

  return (
    <>
      <div className="w-full bg-violet-500 px-8 pt-6 pb-6">
        <div className="mb-1 text-left text-xl font-semibold text-white">
          {title}
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <PinIcon className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-xs font-normal text-white">
              {location}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-xs font-normal text-white">
              {formatted}
              {time ? ` — ${time}` : ""}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-md m-0 inline-flex items-center justify-center rounded-sm bg-violet-900 px-4 py-1 text-sm leading-none font-normal text-white">
            Day {dayNumber}
          </div>
          <div className="text-md rounded-sm bg-amber-50 px-4 py-1 font-normal text-black">
            {completedCount}/{totalItems} completed
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
