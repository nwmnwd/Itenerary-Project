import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import SchedulePage from "./components/SchedulePage.jsx";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

// ==========================
// 🔧 ENVIRONMENT CONFIG
// ==========================

const ONESIGNAL_CONFIG = {
  development: {
    appId: "a22792a6-2f23-4d36-8c9f-12fccbb558bc",
    serviceWorkerPath: "OneSignalSDKWorker.js",
  },
  production: {
    appId: "48d40efc-bfd6-44f5-ada5-30f2d1a17718",
    serviceWorkerPath: "OneSignalSDKWorker.js",
  },
};

const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
const isProduction = !isLocalhost;

const currentConfig = isProduction
  ? ONESIGNAL_CONFIG.production
  : ONESIGNAL_CONFIG.development;

console.log("🌍 Environment:", isProduction ? "PRODUCTION" : "DEVELOPMENT");
console.log("🔧 Using App ID:", currentConfig.appId);

function App() {
  const oneSignalInitialized = useRef(false);

  useEffect(() => {
    async function initOneSignal() {
      if (oneSignalInitialized.current) {
        console.log("⚠️ OneSignal already initialized, skipping");
        return;
      }

      oneSignalInitialized.current = true;

      try {
        console.log("🚀 Initializing OneSignal...");

        await OneSignal.init({
          appId: currentConfig.appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: currentConfig.serviceWorkerPath,
          serviceWorkerParam: { scope: "/" },
          notifyButton: { enable: false },
        });

        console.log("✅ OneSignal initialized");

        // -----------------------------------------------------
        // 1️⃣ CEK SUPPORT
        // -----------------------------------------------------
        if (!OneSignal.Notifications.isPushSupported()) {
          console.error("❌ Browser tidak mendukung push notification");
          return;
        }

        // -----------------------------------------------------
        // 2️⃣ IZIN NOTIFIKASI
        // -----------------------------------------------------
        const permission = OneSignal.Notifications.permission;
        console.log("📋 Notification permission:", permission);

        if (permission !== "granted") {
          console.log("🔔 Requesting permission...");
          const granted = await OneSignal.Notifications.requestPermission();
          console.log("Permission result:", granted);
          if (!granted) return;
        }

        // -----------------------------------------------------
        // 3️⃣ OPT-IN JIKA BELUM SUBSCRIBE
        // -----------------------------------------------------
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log("📬 isSubscribed:", isSubscribed);

        if (!isSubscribed) {
          console.log("📲 Opting in user...");
          await OneSignal.User.PushSubscription.optIn();
        }

        // -----------------------------------------------------
        // 4️⃣ DAPATKAN PLAYER ID DENGAN RETRY (10X)
        // -----------------------------------------------------
        let playerId = null;
        for (let i = 0; i < 10; i++) {
          playerId = OneSignal.User.PushSubscription.id;
          if (playerId) break;
          console.log(`⏳ Waiting for Player ID... (${i + 1}/10)`);
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (!playerId) {
          console.error("❌ Failed to obtain Player ID");
        } else {
          console.log("🎯 Player ID:", playerId);

          // SIMPAN LOKAL
          localStorage.setItem("onesignal_player_id", playerId);

          // -----------------------------------------------------
          // 5️⃣ LOGIN UNTUK MENSTABILKAN PLAYER ID
          // -----------------------------------------------------
          await OneSignal.login(playerId);
          console.log("🔐 OneSignal login() success");
        }

        // -----------------------------------------------------
        // 6️⃣ LISTENER — Saat Player ID berganti
        // -----------------------------------------------------
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
          console.log("🔄 Subscription changed:", event);

          const newId = event.current?.id;
          if (newId) {
            console.log("🆕 New Player ID:", newId);
            localStorage.setItem("onesignal_player_id", newId);

            await OneSignal.login(newId);
            console.log("🔐 User re-logged with new Player ID");
          }
        });

        // -----------------------------------------------------
        // 7️⃣ NOTIFIKASI SAAT TAB AKTIF
        // -----------------------------------------------------
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
          console.log("📬 Foreground notification:", event.notification);
        });

        OneSignal.Notifications.addEventListener("click", (event) => {
          console.log("👆 Notification clicked:", event);
        });

        // -----------------------------------------------------
        // 8️⃣ TAGS UNTUK DEBUG
        // -----------------------------------------------------
        await OneSignal.User.addTag("environment", isProduction ? "production" : "development");
        await OneSignal.User.addTag("app_user", "true");

      } catch (error) {
        console.error("❌ OneSignal Initialization Error:", error);
        oneSignalInitialized.current = false;
      }
    }

    initOneSignal();
  }, []);

  return (
    <>
      <SchedulePage />
      <Analytics />
    </>
  );
}

export default App;
