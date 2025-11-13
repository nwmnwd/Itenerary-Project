const days = [
  { day: "Sun", date: 15 },
  { day: "Mon", date: 16 },
  { day: "Tue", date: 17 },
  { day: "Wed", date: 18 },
  { day: "Thu", date: 19 },
  { day: "Fri", date: 20 },
  { day: "Sat", date: 21 },
];

function Calendar() {
  return (
    <div className="flex justify-between mx-8 mt-5">
      {days.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {/* Day */}
          <div className="text-md font-medium text-[#65558F]">{item.day}</div>

          {/* Date */}
          <div className="text-sm font-semibold text-[#222B59]">{item.date}</div>
        </div>
      ))}
    </div>
  );
}

export default Calendar;
