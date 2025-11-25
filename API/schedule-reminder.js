export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Ambil REST Key dari Environment Variable
  const ONE_SIGNAL_REST_KEY = process.env.ONE_SIGNAL_REST_KEY; 

  // Kunci APP ID OneSignal Anda (dibiarkan hardcoded, seperti di kode sebelumnya)
  const ONE_SIGNAL_APP_ID = "48d40efc-bfd6-44f5-ada5-30f2d1a17718"; 
  
  const { title, content, deliveryTime } = req.body;

  // 🚨 Pengecekan Kunci Wajib
  if (!ONE_SIGNAL_REST_KEY) {
    console.error("ONE_SIGNAL_REST_KEY is not set in environment variables.");
    return res.status(500).json({ message: "Server configuration error: OneSignal key missing." });
  }
  
  // 🚨 MEMASTIKAN FORMAT BASIC: OneSignal memerlukan header Authorization: Basic YOUR_KEY
  const authorizationHeader = ONE_SIGNAL_REST_KEY.startsWith('Basic ') 
    ? ONE_SIGNAL_REST_KEY 
    : `Basic ${ONE_SIGNAL_REST_KEY}`;
  
  console.log("API Log: Mengirim notifikasi terjadwal ke OneSignal...");

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Menggunakan header yang sudah divalidasi formatnya
        Authorization: authorizationHeader, 
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        // Targetkan semua pengguna yang sudah subscribe
        included_segments: ["Subscribed Users"], 
        contents: { en: content },
        headings: { en: title },
        send_after: deliveryTime, // Format ISO 8601
      }),
    });

    const data = await response.json();
    
    // Periksa status respons dari OneSignal
    if (!response.ok) {
        // Jika OneSignal mengembalikan error (misal 401 Unauthorized), log error tersebut
        console.error("OneSignal API Error:", response.status, data);
    }
    
    // Kembalikan respons dari OneSignal ke frontend
    res.status(response.status).json(data);
    
  } catch (error) {
      console.error("Error saat berkomunikasi dengan OneSignal:", error);
      res.status(500).json({ message: "Internal Server Error during OneSignal communication." });
  }
}