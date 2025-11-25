// api/schedule-reminder.js (untuk Vercel serverless function)
// atau bisa juga pakai Express.js

export default async function handler(req, res) {
  // Hanya terima POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, deliveryTime, userId } = req.body; // Tambah userId

  // Validasi input
  if (!title || !content || !deliveryTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    // Konversi deliveryTime ke format yang OneSignal terima
    // Format input: "2024-11-26 10:00:00 GMT+0800"
    // Format OneSignal: Unix timestamp
    const deliveryDate = new Date(deliveryTime.replace(' GMT+0800', '+08:00'));
    const sendAfter = Math.floor(deliveryDate.getTime() / 1000);

    // Kirim notification ke OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, // Simpan di .env
      },
      body: JSON.stringify({
        app_id: '48d40efc-bfd6-44f5-ada5-30f2d1a17718',
        // Pilih salah satu:
        // Option 1: Kirim ke semua user
        included_segments: ['Subscribed Users'],
        // Option 2: Kirim ke user tertentu (uncomment jika pakai userId)
        // include_subscription_ids: [userId],
        headings: { en: title },
        contents: { en: content },
        send_after: sendAfter, // Schedule notification
        // Optional: Tambahkan data custom
        data: {
          type: 'activity_reminder',
          scheduled_time: deliveryTime
        }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        notificationId: data.id,
        message: 'Notification scheduled successfully',
      });
    } else {
      console.error('OneSignal API Error:', data);
      return res.status(400).json({
        success: false,
        error: data.errors?.[0] || 'Failed to schedule notification',
      });
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}