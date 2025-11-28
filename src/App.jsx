import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import SchedulePage from "./components/SchedulePage.jsx";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

function App() {
  // ✅ Prevent double initialization dengan useRef
  const oneSignalInitialized = useRef(false);

  useEffect(() => {
    async function runOneSignal() {
      // ✅ Cek jika sudah diinisialisasi
      if (oneSignalInitialized.current) {
        console.log("⚠️ OneSignal already initialized, skipping...");
        return;
      }

      try {
        oneSignalInitialized.current = true;

        console.log("🚀 Initializing OneSignal...");

        // ✅ Konfigurasi yang benar untuk Vercel
        await OneSignal.init({
          appId: "48d40efc-bfd6-44f5-ada5-30f2d1a17718",
          allowLocalhostAsSecureOrigin: true,
          
          // ✅ Path untuk Service Worker (tanpa leading slash)
          serviceWorkerParam: { 
            scope: '/' 
          },
          serviceWorkerPath: 'OneSignalSDKWorker.js', // ← Benar: tanpa '/'
          
          // ✅ Notifikasi otomatis
          notifyButton: {
            enable: false, // Set true jika ingin tombol subscribe
          },
        });

        console.log("✅ OneSignal initialized successfully");

        // Check if notifications are supported
        if (!OneSignal.Notifications.isPushSupported()) {
          console.error("❌ Push notifications are not supported");
          return;
        }

        // Check current permission status
        const currentPermission = OneSignal.Notifications.permission;
        console.log("📋 Current permission:", currentPermission);

        // Request permission if not already granted
        if (currentPermission !== "granted") {
          console.log("🔔 Requesting notification permission...");
          
          // ✅ Tambahkan user interaction sebelum request permission
          const permission = await OneSignal.Notifications.requestPermission();
          console.log("✅ Permission result:", permission);
          
          if (!permission) {
            console.warn("⚠️ User denied notification permission");
            return;
          }
        }

        // Small delay to ensure SDK is fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user is subscribed
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log("📬 Is subscribed:", isSubscribed);

        // Subscribe if not already subscribed
        if (!isSubscribed) {
          console.log("📲 Subscribing user...");
          await OneSignal.User.PushSubscription.optIn();
          console.log("✅ User opted in to push notifications");
          
          // Wait for subscription to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Get subscription ID (Player ID) - dengan retry
        let subscriptionId = null;
        let retries = 0;
        const maxRetries = 10;

        console.log("🔍 Getting subscription ID...");

        while (!subscriptionId && retries < maxRetries) {
          subscriptionId = OneSignal.User.PushSubscription.id;
          
          if (!subscriptionId) {
            console.log(`⏳ Waiting for subscription ID... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            retries++;
          }
        }

        if (subscriptionId) {
          console.log("🎯 ✅ Subscription ID (Player ID):", subscriptionId);
          // Simpan ke localStorage untuk backup
          localStorage.setItem('onesignal_player_id', subscriptionId);
        } else {
          console.error("❌ Could not get subscription ID after", maxRetries, "attempts");
          console.log("💡 Possible reasons:");
          console.log("   1. User blocked notifications");
          console.log("   2. Domain not configured in OneSignal dashboard");
          console.log("   3. Service worker registration failed");
          
          // Debug info
          console.log("🔍 Debug Info:");
          console.log("   - Permission:", OneSignal.Notifications.permission);
          console.log("   - Opted In:", await OneSignal.User.PushSubscription.optedIn);
          console.log("   - Token:", OneSignal.User.PushSubscription.token);
        }

        // Get OneSignal User ID
        const userId = OneSignal.User.onesignalId;
        console.log("🆔 OneSignal User ID:", userId);

        // Debug: Log full subscription object
        console.log("📊 Full PushSubscription object:", {
          id: OneSignal.User.PushSubscription.id,
          token: OneSignal.User.PushSubscription.token,
          optedIn: await OneSignal.User.PushSubscription.optedIn
        });

        // Listen for subscription changes
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          console.log("🔄 Subscription changed:", event);
          const newId = event.current.id;
          console.log("🎯 New subscription ID:", newId);
          if (newId) {
            localStorage.setItem('onesignal_player_id', newId);
          }
        });

        // Listen for notification clicks
        OneSignal.Notifications.addEventListener("click", (event) => {
          console.log("👆 Notification clicked:", event);
        });

        // ✅ PENTING: Handle notifikasi saat tab aktif (foreground)
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
          console.log("📬 Notification received (foreground):", event.notification);
          // Notifikasi akan tetap muncul karena tidak ada preventDefault()
        });

        // Optional: Send a test tag
        await OneSignal.User.addTag("app_user", "true");
        console.log("✅ User tag added");

      } catch (error) {
        console.error("❌ Error initializing OneSignal:", error);
        console.error("Error details:", error.message);
        
        // Reset flag jika error
        oneSignalInitialized.current = false;
      }
    }

    runOneSignal();
  }, []); // Empty dependency array

  return (
    <>
      <SchedulePage />
      <Analytics />
    </>
  );
}

export default App;