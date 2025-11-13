import Header from "./components/Header.jsx";
import Calendar from "./components/Calendar.jsx";
import SearchBox from "./components/SearchBox.jsx";
import Timeline from "./components/Timeline.jsx";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen flex-col">
      {/* Top controls: stay visible */}
      <div className="sticky top-0 z-30 bg-white pb-6 shadow-transparent">
        <Header />
        <div className="bg-white">
          <Calendar />
          <SearchBox />
        </div>
      </div>

      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto ">
        <Timeline
          items={[
            {
              time: "07:00 AM",
              title: "Arrival at Hotel",
              location: "Natural View House",
            },
            {
              time: "09:00 AM",
              title: "Breakfast & Briefing",
              location: "Hotel Dining",
            },
            { time: "11:00 AM", title: "Beach Visit", location: "Kuta Beach" },
            { time: "02:00 PM", title: "Lunch", location: "Local Cafe" },
            {
              time: "05:00 PM",
              title: "Return to Hotel",
              location: "Sidemen Hotel",
            },
          ]}
        />
      </main>
    </div>
  );
}

export default App;
