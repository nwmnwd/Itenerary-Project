export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const ONE_SIGNAL_APP_ID = "48d40efc-bfd6-44f5-ada5-30f2d1a17718";
  const ONE_SIGNAL_REST_KEY = process.env.ONE_SIGNAL_REST_KEY;
  const { title, content, deliveryTime } = req.body;

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: ONE_SIGNAL_REST_KEY,
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

  res.status(response.status).json(data);
}
