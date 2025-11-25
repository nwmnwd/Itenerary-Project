export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const ONE_SIGNAL_APP_ID = "48d40efc-bfd6-44f5-ada5-30f2d1a17718";
  const ONE_SIGNAL_REST_KEY = process.env.ONE_SIGNAL_REST_KEY;

  if (!ONE_SIGNAL_REST_KEY) {
    return res
      .status(500)
      .json({ error: "Missing ONE_SIGNAL_REST_KEY in server environment." });
  }

  try {
    const { title, content, deliveryTime, playerIds } = req.body;

    // Validasi: hanya title dan content yang wajib
    if (!title || !content) {
      return res.status(400).json({ 
        error: "Missing required fields: title and content" 
      });
    }

    // Buat payload
    const payload = {
      app_id: ONE_SIGNAL_APP_ID,
      contents: { en: content },
      headings: { en: title },
    };

    // Tambahkan send_after hanya jika deliveryTime ada
    if (deliveryTime) {
      payload.send_after = deliveryTime;
    }

    // Jika ada playerIds, kirim ke specific users. Jika tidak, ke semua subscribers
    if (playerIds && playerIds.length > 0) {
      payload.include_player_ids = playerIds;
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_REST_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OneSignal API error",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: deliveryTime ? "Notification scheduled successfully" : "Notification sent successfully",
      data: data
    });

  } catch (error) {
    console.error("Error scheduling notification:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}