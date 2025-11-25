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
        // Initialize OneSignal
        await OneSignal.init({
          appId: "48d40efc-bfd6-44f5-ada5-30f2d1a17718",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false, // Disable default notify button
          },
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: '/OneSignalSDKWorker.js',
        });

        console.log("OneSignal initialized successfully");

        // Check if notifications are supported
        if (!OneSignal.Notifications.isPushSupported()) {
          console.error("Push notifications are not supported");
          return;
        }

        // Check current permission status
        const currentPermission = OneSignal.Notifications.permission;
        console.log("Current permission:", currentPermission);

        // Request permission if not already granted
        if (currentPermission !== "granted") {
          const permission = await OneSignal.Notifications.requestPermission();
          console.log("Permission result:", permission);
        }

        // Check if user is subscribed
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log("Is subscribed:", isSubscribed);

        // Subscribe if not already subscribed
        if (!isSubscribed) {
          await OneSignal.User.PushSubscription.optIn();
          console.log("User opted in to push notifications");
        }

        // Get subscription ID (Player ID)
        const subscriptionId = OneSignal.User.PushSubscription.id;
        console.log("🎯 Subscription ID (Player ID):", subscriptionId);

        // Get OneSignal User ID (External ID)
        const userId = OneSignal.User.onesignalId;
        console.log("🎯 OneSignal User ID:", userId);

        // Debug: Log full subscription object
        console.log("Full PushSubscription object:", {
          id: OneSignal.User.PushSubscription.id,
          token: OneSignal.User.PushSubscription.token,
          optedIn: await OneSignal.User.PushSubscription.optedIn
        });

        // Listen for subscription changes
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          console.log("Subscription changed:", event);
          console.log("New subscription ID:", event.current.id);
        });

        // Listen for notifications received
        OneSignal.Notifications.addEventListener("click", (event) => {
          console.log("Notification clicked:", event);
        });

        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
          console.log("Notification received in foreground:", event);
          event.preventDefault(); // Prevent default handling
          event.notification.display(); // Manually display
        });

        // Optional: Send a test notification tag
        await OneSignal.User.addTag("test_user", "true");
        console.log("Test tag added");

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