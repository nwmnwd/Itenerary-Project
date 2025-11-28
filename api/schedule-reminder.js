/* eslint-disable no-undef */
/* global process */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, content, deliveryTime, userId } = req.body;

  // ENVIRONMENT
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "development";

  const ONESIGNAL_APP_ID = isDevelopment
    ? process.env.ONESIGNAL_DEV_APP_ID
    : process.env.ONESIGNAL_APP_ID;

  const ONESIGNAL_API_KEY = isDevelopment
    ? process.env.ONESIGNAL_DEV_REST_API_KEY
    : process.env.ONESIGNAL_REST_API_KEY;

  console.log("🌍 Environment:", isDevelopment ? "DEVELOPMENT" : "PRODUCTION");
  console.log("🔧 Using App ID:", ONESIGNAL_APP_ID);

  // VALIDATION
  if (!ONESIGNAL_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Missing OneSignal API key",
    });
  }

  if (!title || !content || !deliveryTime) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields (title, content, deliveryTime)",
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "Missing userId (Player ID)",
    });
  }

  // PROCESS DELIVERY TIME
  let deliveryTimeStr;
  if (typeof deliveryTime === "string") {
    deliveryTimeStr = deliveryTime;
  } else if (deliveryTime && typeof deliveryTime.toISOString === "function") {
    deliveryTimeStr = deliveryTime.toISOString();
  } else {
    deliveryTimeStr = String(deliveryTime);
  }

  console.log("📥 Received:", { title, content, deliveryTimeStr, userId });

  const deliveryDate = new Date(deliveryTimeStr);

  if (isNaN(deliveryDate.getTime())) {
    return res.status(400).json({
      success: false,
      error:
        "Invalid date format. Expected ISO with timezone: YYYY-MM-DDTHH:mm:ss+08:00",
      received: deliveryTimeStr,
    });
  }

  const now = new Date();
  const minTime = new Date(now.getTime() + 60000);

  if (deliveryDate <= minTime) {
    return res.status(400).json({
      success: false,
      error: "Delivery time must be at least 1 minute in the future",
      deliveryDate: deliveryDate.toISOString(),
      now: now.toISOString(),
    });
  }

  // ⭐ FIX KRITIS: OneSignal TIDAK menerima ISO string (+08:00)
  // OneSignal HARUS menerima format Date.toString()
  const sendAfterFormatted = deliveryDate.toString(); 
  console.log("⏰ OneSignal send_after:", sendAfterFormatted);

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [userId],

    headings: { en: title },
    contents: { en: content },

    // ⭐ FIX UTAMA
    send_after: sendAfterFormatted,

    priority: 10,
    ttl: 86400,

    data: {
      type: "activity_reminder",
      scheduled_time: deliveryTimeStr,
      timestamp: Date.now(),
      environment: isDevelopment ? "development" : "production",
    },

    web_push_topic: "reminder",
  };

  console.log("📡 Sending payload:", payload);

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📬 OneSignal Response:", data);

    if (response.ok) {
      return res.status(200).json({
        success: true,
        notificationId: data.id,
        recipients: data.recipients,
        message: "Notification scheduled successfully",
        scheduledFor: deliveryDate.toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      error: data.errors?.[0] || "Failed to schedule notification",
      details: data,
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
