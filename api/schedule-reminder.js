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
    const { title, content, deliveryTime } = req.body;

    // Validasi input
    if (!title || !content || !deliveryTime) {
      return res.status(400).json({ 
        error: "Missing required fields: title, content, or deliveryTime" 
      });
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        contents: { en: content },
        headings: { en: title },
        send_after: deliveryTime,
      }),
    });

    const data = await response.json();

    // Cek apakah OneSignal berhasil
    if (!response.ok) {
      return res.status(response.status).json({
        error: "OneSignal API error",
        details: data
      });
    }

    // Kirim response sukses
    return res.status(200).json({
      success: true,
      message: "Notification scheduled successfully",
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