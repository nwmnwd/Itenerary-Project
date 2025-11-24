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
