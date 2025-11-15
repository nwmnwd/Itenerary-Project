import { PinIcon } from "../assets/icons";
import NotesInput from "./NotesInput";

export default function TimelineCard({
  time,
  activity,
  location,
  isActive,
  onClick,
}) {
  return (
    <div
      className="itinerary-start flex gap-3"
      style={{ minHeight: "260px" }}
      onClick={onClick}
    >
      <div className="flex-1">
        {/* TIME */}
        <div
          className="text-md mb-3 font-semibold text-gray-900"
          style={{ marginTop: "4px" }}
        >
          {time}
        </div>

        {/* CARD */}
        <div
          className={`rounded-md p-5 outline-1 -outline-offset-1 ${
            isActive
              ? "bg-violet-50 outline-violet-400"
              : "bg-white outline-gray-300"
          }`}
        >
          <h3 className="text-md font-semibold">{activity}</h3>

          <div className="mt-2 mb-3 flex items-center gap-2">
            <PinIcon className="h-3 w-3 text-gray-400" />
            <div className="text-xs text-gray-400">{location}</div>
          </div>

          <NotesInput />
        </div>
      </div>
    </div>
  );
}
