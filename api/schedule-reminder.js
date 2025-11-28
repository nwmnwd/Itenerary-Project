// api/schedule-reminder.js - Vercel Serverless Function
/* eslint-disable no-undef */
/* global process */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, deliveryTime, userId } = req.body;

  // ✅ ENVIRONMENT DETECTION
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                        process.env.VERCEL_ENV === 'development';

  // ✅ Gunakan API Key yang sesuai environment
  const ONESIGNAL_APP_ID = isDevelopment 
    ? process.env.ONESIGNAL_DEV_APP_ID  // Development App ID
    : process.env.ONESIGNAL_APP_ID;     // Production App ID

  const ONESIGNAL_API_KEY = isDevelopment
    ? process.env.ONESIGNAL_DEV_REST_API_KEY  // Development API Key
    : process.env.ONESIGNAL_REST_API_KEY;     // Production API Key

  console.log('🌍 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
  console.log('🔧 Using App ID:', ONESIGNAL_APP_ID);

  // ✅ Validasi Environment Variables
  if (!ONESIGNAL_API_KEY) {
    console.error('❌ ONESIGNAL API KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Missing API key',
      environment: isDevelopment ? 'development' : 'production'
    });
  }

  // Validasi input
  if (!title || !content || !deliveryTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (title, content, deliveryTime)' 
    });
  }

  try {
    // ✅ CRITICAL FIX: Konversi deliveryTime ke string terlebih dahulu
    let deliveryTimeStr;
    
    if (typeof deliveryTime === 'string') {
      deliveryTimeStr = deliveryTime;
    } else if (typeof deliveryTime === 'number') {
      // Jika unix timestamp (seconds)
      deliveryTimeStr = new Date(deliveryTime * 1000).toISOString();
    } else if (deliveryTime && typeof deliveryTime === 'object') {
      // Jika Date object atau object dengan toISOString
      if (typeof deliveryTime.toISOString === 'function') {
        deliveryTimeStr = deliveryTime.toISOString();
      } else if (deliveryTime.unixTimestamp) {
        // Jika object dengan unixTimestamp property
        deliveryTimeStr = new Date(deliveryTime.unixTimestamp * 1000).toISOString();
      } else {
        // Fallback: coba convert ke string
        deliveryTimeStr = String(deliveryTime);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid deliveryTime format',
        received: deliveryTime,
        type: typeof deliveryTime
      });
    }

    // ✅ Debug: Log received data
    console.log('📥 Received data:', {
      title,
      content,
      deliveryTime,
      deliveryTimeType: typeof deliveryTime,
      deliveryTimeStr,
      userId
    });

    // ✅ Parse waktu dengan timezone yang benar
    let deliveryDate;
    
    if (deliveryTimeStr.includes('GMT+0800')) {
      // Format: "2025-11-25 23:10:00 GMT+0800"
      // Convert GMT+0800 to ISO format
      const isoString = deliveryTimeStr.replace(' GMT+0800', '+08:00');
      deliveryDate = new Date(isoString);
    } else if (deliveryTimeStr.includes('+08:00')) {
      // Format: "2025-11-25T23:10:00+08:00"
      deliveryDate = new Date(deliveryTimeStr);
    } else if (deliveryTimeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      // ISO format tanpa timezone (assume UTC)
      deliveryDate = new Date(deliveryTimeStr);
    } else {
      // Try parsing as-is
      deliveryDate = new Date(deliveryTimeStr);
    }
    
    // Validasi format tanggal
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use: YYYY-MM-DD HH:mm:ss GMT+0800 or ISO format',
        received: deliveryTimeStr
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
      deliveryTimeOriginal: deliveryTime,
      deliveryTimeProcessed: deliveryTimeStr,
      deliveryDateISO: deliveryDate.toISOString(),
      sendAfter,
      userId: userId || 'All subscribers',
      currentTime: now.toISOString()
    });

    // ✅ Prepare OneSignal payload
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      
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
        scheduled_time: deliveryTimeStr,
        timestamp: Date.now(),
        environment: isDevelopment ? 'development' : 'production'
      },

      // ✅ Tambahan: Pastikan notif muncul meskipun app terbuka
      web_push_topic: 'reminder',
    };

    console.log('📡 Sending to OneSignal:', JSON.stringify(payload, null, 2));

    // ✅ Kirim ke OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
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
        environment: isDevelopment ? 'development' : 'production',
        debug: {
          localTime: deliveryTimeStr,
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