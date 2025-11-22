import { useState, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { PinIcon, EditIcon, DeleteIcon } from "../assets/icons";
import NotesInput from "./NotesInput";
import InputActivity from "./InputActivity";
import InputLocation from "./InputLocation";
import InputTime from "./InputTime";

export default function TimelineCard({
  id,
  time,
  activity,
  location,
  isNew,
  isActive,
  onEdit,
  onDelete,
  onPositionChange,
}) {
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [isSwiped, setIsSwiped] = useState(false);

  const [newActivity, setNewActivity] = useState(activity);
  const [newLocation, setNewLocation] = useState(location);
  const [newTime, setNewTime] = useState(time);
  const timeRef = useRef(null);

  useEffect(() => {
    if (timeRef.current) {
      const rect = timeRef.current.getBoundingClientRect();
      onPositionChange?.({ id, top: rect.top + window.scrollY });
    }
  }, [isEditing, time, activity, location]);

  // Gesture handler
  const handlers = useSwipeable({
    onSwipedLeft: () => setIsSwiped(true),
    onSwipedRight: () => setIsSwiped(false),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <div className="relative flex-1" {...handlers}>
      {/* Time */}
      <div
        ref={timeRef}
        className="time-text text-md mb-3 font-semibold text-gray-400"
        style={{ marginTop: "4px" }}
      >
        {!isEditing ? time : ""}
      </div>

      {/* BACKGROUND DELETE LAYER */}
      <div
        className={`absolute right-0 top-0 h-full w-28 rounded-md bg-red-500 
          flex items-center justify-center text-white transition-opacity duration-200
          ${isSwiped ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onDelete}
      >
        <DeleteIcon className="h-6 w-6" />
      </div>

      {/* CARD FOREGROUND */}
      <div
        className={`group relative rounded-md p-4 outline-1 -outline-offset-1 transition-transform duration-300
          ${isActive ? "bg-violet-50 outline-violet-400" : "bg-white outline-gray-300"}
          ${isSwiped ? "-translate-x-24" : "translate-x-0"}
        `}
      >
        {!isEditing && (
          <div className="absolute top-5 right-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              className="text-sm text-gray-400 hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <EditIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="flex flex-col gap-1">
            <InputActivity
              value={newActivity}
              onChange={setNewActivity}
              isEditing={isEditing}
              autoFocus={true}
            />
            <InputLocation value={newLocation} onChange={setNewLocation} />
            <InputTime value={newTime} onChange={setNewTime} />

            <div className="mt-2 flex justify-end gap-2">
              <button
                className="text-xs text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>

              <button
                className="rounded-md bg-blue-600 px-4 py-1 text-xs text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.({
                    activity: newActivity || "No Activity",
                    location: newLocation,
                    time: newTime || "--:--",
                    isNew: false,
                  });
                  setIsEditing(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-md font-semibold">{activity}</h3>

            <div className="mt-2 mb-3 flex items-center gap-2">
              <PinIcon className="h-3 w-3 text-gray-400" />
              <div className="text-xs text-gray-400">{location}</div>
            </div>

            <NotesInput />
          </>
        )}
      </div>
    </div>
  );
}
