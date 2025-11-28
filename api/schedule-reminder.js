// api/schedule-reminder.js - Vercel Serverless Function
/* eslint-disable no-undef */
/* global process */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, deliveryTime, userId } = req.body;

  // ✅ Validasi Environment Variables
  if (!process.env.ONESIGNAL_REST_API_KEY) {
    console.error('❌ ONESIGNAL_REST_API_KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Missing API key' 
    });
  }

  // Validasi input
  if (!title || !content || !deliveryTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (title, content, deliveryTime)' 
    });
  }

  // Validasi tipe data deliveryTime harus string
  if (typeof deliveryTime !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'deliveryTime must be a string in format: YYYY-MM-DD HH:mm:ss GMT+0800',
      receivedType: typeof deliveryTime
    });
  }

  try {
    // ✅ Debug: Log received data
    console.log('📥 Received data:', {
      title,
      content,
      deliveryTime,
      deliveryTimeType: typeof deliveryTime,
      userId
    });

    // ✅ Pastikan deliveryTime adalah string
    if (typeof deliveryTime !== 'string') {
      // Convert to string if not
      console.warn('⚠️ deliveryTime bukan string, converting...');
      deliveryTime = String(deliveryTime);
    }

    // ✅ Parse waktu dengan timezone yang benar
    let deliveryDate;
    
    if (deliveryTime.includes('GMT+0800')) {
      // Format: "2025-11-25 23:10:00 GMT+0800"
      // Convert GMT+0800 to ISO format
      const isoString = deliveryTime.replace(' GMT+0800', '+08:00');
      deliveryDate = new Date(isoString);
    } else if (deliveryTime.includes('+08:00')) {
      // Format: "2025-11-25T23:10:00+08:00"
      deliveryDate = new Date(deliveryTime);
    } else {
      // Assume UTC if no timezone specified
      deliveryDate = new Date(deliveryTime);
    }
    
    // Validasi format tanggal
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use: YYYY-MM-DD HH:mm:ss GMT+0800 or ISO format',
        received: deliveryTime
      });
    }

    // ✅ Validasi waktu harus di masa depan (dengan 1 menit buffer)
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 60000); // 60 seconds buffer
    
    if (deliveryDate <= bufferTime) {
      return res.status(400).json({
        success: false,
        error: 'Delivery time must be at least 1 minute in the future',
        deliveryDate: deliveryDate.toISOString(),
        currentTime: now.toISOString(),
        minimumTime: bufferTime.toISOString()
      });
    }

    // ✅ Convert ke UNIX timestamp (dalam detik)
    const sendAfter = Math.floor(deliveryDate.getTime() / 1000);

    // Log untuk debugging
    console.log('📤 Scheduling notification:', {
      title,
      content,
      deliveryTime,
      deliveryDateISO: deliveryDate.toISOString(),
      sendAfter,
      userId: userId || 'All subscribers',
      currentTime: now.toISOString()
    });

    // ✅ DEVELOPMENT MODE: Jika di localhost, gunakan test mode
    const isLocalhost = req.headers.host?.includes('localhost');
    
    if (isLocalhost && !userId) {
      console.log('⚠️ LOCALHOST TEST MODE: Sending to test segment');
    }

    // ✅ Prepare OneSignal payload
    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID || '48d40efc-bfd6-44f5-ada5-30f2d1a17718',
      
      // ✅ FIXED: Gunakan include_player_ids (bukan include_subscription_ids)
      ...(userId 
        ? { include_player_ids: [userId] }  // ← Ini yang benar!
        : { included_segments: ['Subscribed Users'] }
      ),
      
      headings: { en: title },
      contents: { en: content },
      
      // ✅ send_after dalam UNIX timestamp (detik, bukan milidetik)
      send_after: sendAfter,
      
      // ✅ Tambahan untuk meningkatkan delivery rate
      priority: 10,
      ttl: 86400, // 24 jam
      
      // ✅ Data custom
      data: {
        type: 'activity_reminder',
        scheduled_time: deliveryTime,
        timestamp: Date.now()
      },

      // ✅ Tambahan: Pastikan notif muncul meskipun app terbuka
      web_push_topic: 'reminder',
      chrome_web_icon: 'https://your-icon-url.com/icon.png', // Optional
    };

    console.log('📡 Sending to OneSignal:', JSON.stringify(payload, null, 2));

    // ✅ Kirim ke OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Log response dari OneSignal
    console.log('📬 OneSignal Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Notification scheduled successfully!');
      
      return res.status(200).json({
        success: true,
        notificationId: data.id,
        recipients: data.recipients,
        message: 'Notification scheduled successfully',
        scheduledFor: deliveryDate.toISOString(),
        scheduledForUTC: deliveryDate.toUTCString(),
        sendAfter: sendAfter,
        debug: {
          localTime: deliveryTime,
          utcTime: deliveryDate.toISOString(),
          unixTimestamp: sendAfter
        }
      });
    } else {
      console.error('❌ OneSignal API Error:', data);
      
      // ✅ Better error handling
      const errorMessage = data.errors?.[0] || 'Failed to schedule notification';
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        details: data,
        payload: payload // Include payload for debugging
      });
    }
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}