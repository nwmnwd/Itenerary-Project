import { useState, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { PinIcon, EditIcon, DeleteIcon } from "../assets/icons";
import NotesInput from "./NotesInput";
import InputActivity from "./InputActivity";
import InputLocation from "./InputLocation";
import InputTime from "./InputTime";

function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-gray-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function TimelineCard({
  id, 
  time,
  activity,
  location,
  notes,
  isNew,
  isActive,
  onDelete,
  searchQuery = "",
  onSaveAttempt,
}) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSwiped, setIsSwiped] = useState(false);

  const [newActivity, setNewActivity] = useState(activity);
  const [newLocation, setNewLocation] = useState(location);
  const [newTime, setNewTime] = useState(time);
  const [newNotes, setNewNotes] = useState(notes || "");
  const timeRef = useRef(null);

  useEffect(() => {
    setNewActivity(activity);
    setNewLocation(location);
    setNewTime(time);
    setNewNotes(notes || "");
  }, [activity, location, time, notes]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setIsEditing(false) || setIsSwiped(true),
    onSwipedRight: () => setIsSwiped(false),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });
  const handleSave = (e) => {
    e.stopPropagation();

    const activityData = {
      activity: newActivity || "No Activity",
      location: newLocation,
      time: newTime || "--:--",
      notes: newNotes,
    };

    onSaveAttempt?.(id, activityData, isNew, () => setIsEditing(false));
  };


  return (
    <div className="relative" style={{ touchAction: "pan-y" }}>
      <div
        ref={timeRef}
        className="time-text text-md mb-3 font-semibold text-gray-400"
        style={{ minHeight: "24px", lineHeight: "24px" }}
      >
        {!isEditing ? time : ""}
      </div>


      <div className="relative">
        <div
          className={`absolute top-0 right-0 z-0 flex h-full w-26 items-center justify-center rounded-md bg-red-400 text-white transition-opacity duration-300 ${
            isSwiped ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onDelete}
        >
          <DeleteIcon className="h-6 w-6" />
        </div>

        <div
          className={`group relative z-10 rounded-xl p-6  transition-transform duration-300 ${
            isActive
              ? " bg-white border-l-3 border-violet-600 shadow-md"
              : "bg-white outline-gray-300 shadow-md"
          } ${isSwiped ? "-translate-x-24" : "translate-x-0"} `}
          {...(!isEditing ? handlers : {})}
        >

          {!isEditing && (
            <div className="absolute top-5 right-4 flex gap-2 transition-opacity duration-200">
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
            <div className="relative z-30 flex flex-col gap-2">
              <InputActivity
                value={newActivity}
                onChange={setNewActivity}
                isEditing={isEditing}
                autoFocus={true}
              />
              <div className="mt-1 flex flex-1 gap-2 flex-row justify-between">
                <div className="flex-1">
                  <InputLocation
                    value={newLocation}
                    onChange={setNewLocation}
                    isEditing={isEditing}
                  />
                </div>
                <div className="flex-1">
                  <InputTime
                    value={newTime}
                    onChange={setNewTime}
                    isEditing={isEditing}
                  />
                </div>
              </div>

              <NotesInput
                value={newNotes}
                onChange={setNewNotes}
                isEditing={isEditing}
              />

              <div className="mt-2 flex  grow justify-end-safe gap-4">
                <button
                  className="rounded-md outline-1 outline-gray-400 px-4 py-1 text-sm text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isNew) {
                      onDelete(); 
                    } else {
                      setIsEditing(false); 
                    }
                  }}
                >
                  Discard
                </button>

                <button
                  className="rounded-md bg-indigo-600 px-6 py-1 text-sm text-white"
                  onClick={handleSave} 
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-md font-semibold text-violet-800">
                <HighlightText text={activity} query={searchQuery} />
              </h3>

              <div className="mt-2 mb-3 flex items-center gap-2">
                <PinIcon className="h-3 w-3 text-gray-400" />
                <div className="text-sm text-gray-400">
                  {location ? (
                    <HighlightText text={location} query={searchQuery} />
                  ) : (
                    <span className="text-gray-300">No location</span>
                  )}
                </div>
              </div>
              <h3 className="text-sm">
                <NotesInput
                  value={notes}
                  onChange={() => {}}
                  isEditing={false}
                />
              </h3>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
