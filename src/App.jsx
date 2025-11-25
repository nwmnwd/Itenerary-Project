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

        promptOptions: {
          slidedown: {
            enabled: true,
            autoPrompt: true,
            timeDelay: 5,
            pageViews: 1,

            text: {
              actionMessage:
                "Allow notifications so we can remind you about your schedule.",
              acceptButton: "Allow",
              cancelButton: "Maybe later",
              permissionMessage:
                "Enable notifications to receive timely reminders for your activities.",
            },
          },
        },
      });

      await OneSignal.Slidedown.promptPush();

      // Tambahkan ini untuk dapatkan Player ID
      OneSignal.User.PushSubscription.addEventListener("change", (event) => {
        console.log("OneSignal Subscription Changed:", event);
        if (event.current.id) {
          console.log("🎯 Your Player ID:", event.current.id);
          console.log("🎯 Token:", event.current.token);
        }
      });

      // Cek subscription saat ini
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
