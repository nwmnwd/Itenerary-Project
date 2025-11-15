import Header from "./components/Header.jsx";
import IndexPage from "./components/Calendar.jsx";
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
          <IndexPage />
          <SearchBox />
        </div>
      </div>

      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto">
        <Timeline />
      </main>
    </div>
  );
}

export default App;
