const ONE_SIGNAL_APP_ID = "48d40efc-bfd6-44f5-ada5-30f2d1a17718";
const ONE_SIGNAL_REST_KEY = process.env.ONE_SIGNAL_REST_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { title, content, deliveryTime } = req.body;

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONE_SIGNAL_REST_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONE_SIGNAL_APP_ID,
      included_segments: ["Subscribed Users"], // Kirim ke semua yang subscribe
      contents: { en: content }, // Isi pesan
      headings: { en: title }, // Judul pesan
      send_after: deliveryTime, // Waktu pengiriman yang dijadwalkan (format ISO 8601)
    }),
  });

  const data = await response.json();

  if (response.status !== 200) {
    console.error("OneSignal Error:", data);
    return res.status(500).json({ error: "Failed to schedule notification" });
  }

  return res.status(200).json({ success: true, notificationId: data.id });
}
