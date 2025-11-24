import Header from "./components/Header.jsx";
import SearchBox from "./components/SearchBox.jsx";
import SchedulePage from "./components/SchedulePage.jsx";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

function App() {
  return (
    <>
      <SchedulePage />

      <Analytics />
    </>
  );
}
export default App;
