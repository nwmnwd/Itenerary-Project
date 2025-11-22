import { useState, useRef, useEffect } from "react";
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

  return (
    <div className="flex-1">
      <div
        ref={timeRef}
        className="time-text text-md mb-3 font-semibold text-gray-400"
        style={{ marginTop: "4px" }}
      >
        {!isEditing ? time : ""}
      </div>

      {/* CARD */}
      <div
        className={`group rounded-md p-4 outline-1 -outline-offset-1 ${
          isActive
            ? "bg-violet-50 outline-violet-400"
            : "bg-white outline-gray-300"
        } relative`}
      >
        {/* ACTION BUTTONS */}
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

            <button
              className="text-sm text-gray-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <DeleteIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* EDIT MODE */}
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <InputActivity
              value={newActivity}
              onChange={setNewActivity}
              isEditing={isEditing}
              autoFocus={true}
            />
            <InputLocation
              value={newLocation}
              onChange={setNewLocation}
              isEditing={isEditing}
            />
            <InputTime
              value={newTime}
              onChange={setNewTime}
              isEditing={isEditing}
            />

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
                    activity:
                      newActivity.trim() === "" ? "No Activity" : newActivity,
                    location: newLocation.trim() === "" ? "" : newLocation,
                    time: newTime.trim() === "" ? "--:--" : newTime,
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
          /* VIEW MODE */
          <>
            <div>
              <h3 className="text-md font-semibold">{activity}</h3>
            </div>

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
