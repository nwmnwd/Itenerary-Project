// api/schedule-reminder.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, deliveryTime, userId } = req.body;

  // Validasi input
  if (!title || !content || !deliveryTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (title, content, deliveryTime)' 
    });
  }

  try {
    // Parse waktu dengan benar
    const deliveryDate = new Date(deliveryTime.replace(' GMT+0800', '+08:00'));
    
    // Validasi format tanggal
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use: YYYY-MM-DD HH:mm:ss GMT+0800'
      });
    }

    // Validasi waktu harus di masa depan
    const now = new Date();
    if (deliveryDate <= now) {
      return res.status(400).json({
        success: false,
        error: 'Delivery time must be in the future',
        deliveryDate: deliveryDate.toISOString(),
        currentTime: now.toISOString()
      });
    }

    const sendAfter = Math.floor(deliveryDate.getTime() / 1000);

    // Log untuk debugging
    console.log('Scheduling notification:', {
      title,
      deliveryTime,
      sendAfter,
      deliveryDate: deliveryDate.toISOString()
    });

    // Kirim ke OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID || '48d40efc-bfd6-44f5-ada5-30f2d1a17718',
        
        // Pilih target audience
        ...(userId 
          ? { include_subscription_ids: [userId] }
          : { included_segments: ['Subscribed Users'] }
        ),
        
        headings: { en: title },
        contents: { en: content },
        send_after: sendAfter,
        
        // Tambahan untuk meningkatkan delivery rate
        priority: 10,
        ttl: 86400, // 24 jam
        
        // Data custom
        data: {
          type: 'activity_reminder',
          scheduled_time: deliveryTime,
          timestamp: Date.now()
        }
      }),
    });

    const data = await response.json();

    // Log response dari OneSignal
    console.log('OneSignal Response:', data);

    if (response.ok) {
      return res.status(200).json({
        success: true,
        notificationId: data.id,
        recipients: data.recipients,
        message: 'Notification scheduled successfully',
        scheduledFor: deliveryDate.toISOString()
      });
    } else {
      console.error('OneSignal API Error:', data);
      return res.status(400).json({
        success: false,
        error: data.errors?.[0] || 'Failed to schedule notification',
        details: data
      });
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}