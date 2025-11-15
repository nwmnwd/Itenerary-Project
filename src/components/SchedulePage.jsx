import { useState } from "react";
import WeeklyCalendar from "./Calendar";
import Timeline from "./Timeline";
import { startOfDay } from "date-fns";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));

  return (
    <div>
      <WeeklyCalendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      <Timeline selectedDay={selectedDay} />
    </div>
  );
}
