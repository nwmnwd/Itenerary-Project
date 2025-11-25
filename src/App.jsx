import { useEffect } from "react";
import OneSignal from "react-onesignal";
import Header from "./components/Header.jsx";
import SearchBox from "./components/SearchBox.jsx";
import SchedulePage from "./components/SchedulePage.jsx";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

function App() {
  useEffect(() => {
    async function runOneSignal() {
      try {
        await OneSignal.init({
          appId: "48d40efc-bfd6-44f5-ada5-30f2d1a17718",
          allowLocalhostAsSecureOrigin: true,
        });

        // Request permission
        const permission = await OneSignal.Notifications.requestPermission();
        console.log("Permission:", permission);

        // Subscribe push
        const sub = await OneSignal.User.PushSubscription.subscribe();
        console.log("Subscribed:", sub);

        // Listener player ID
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          console.log("OneSignal Subscription Changed:", event);
        });

        const playerId = await OneSignal.User.PushSubscription.id;
        console.log("🎯 Current Player ID:", playerId);
      } catch (error) {
        console.error("Error initializing OneSignal:", error);
      }
    }

    runOneSignal();
  }, []);

  return (
    <>
      <SchedulePage />
      <Analytics />
    </>
  );
}

export default App;
