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
    ? process.env.ONESIGNAL_DEV_APP_ID
    : process.env.ONESIGNAL_APP_ID;

  const ONESIGNAL_API_KEY = isDevelopment
    ? process.env.ONESIGNAL_DEV_REST_API_KEY
    : process.env.ONESIGNAL_REST_API_KEY;

  console.log('🌍 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
  console.log('🔧 Using App ID:', ONESIGNAL_APP_ID);

  // --- VALIDASI PENTING ---

  // 1. Validasi Environment Variables
  if (!ONESIGNAL_API_KEY) {
    console.error('❌ ONESIGNAL API KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Missing API key',
      environment: isDevelopment ? 'development' : 'production'
    });
  }

  // 2. Validasi input wajib
  if (!title || !content || !deliveryTime) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields (title, content, deliveryTime)' 
    });
  }
  
  // 3. ✅ CRITICAL: Validasi userId. Hanya kirim ke user spesifik.
  if (!userId) {
    console.warn('⚠️ Scheduling stopped: userId is missing. Notification must be targeted.');
    return res.status(400).json({
      success: false,
      error: 'Cannot schedule notification: User ID (Player ID) is required for targeted delivery.'
    });
  }

  // --- PEMROSESAN WAKTU ---

  try {
    let deliveryTimeStr;
    
    // Konversi deliveryTime ke string/ISO format
    if (typeof deliveryTime === 'string') {
      deliveryTimeStr = deliveryTime;
    } else if (deliveryTime && typeof deliveryTime.toISOString === 'function') {
      deliveryTimeStr = deliveryTime.toISOString();
    } else {
      // Fallback string conversion for robustness
      deliveryTimeStr = String(deliveryTime);
    }

    console.log('📥 Received data:', { title, content, deliveryTime, userId });

    let deliveryDate;
    
    // Parse waktu dengan timezone yang benar (mengganti GMT+0800 ke +08:00)
    if (deliveryTimeStr.includes('GMT+0800')) {
      const isoString = deliveryTimeStr.replace(' GMT+0800', '+08:00');
      deliveryDate = new Date(isoString);
    } else {
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

    // Validasi waktu harus di masa depan (dengan 1 menit buffer)
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 60000);
    
    if (deliveryDate <= bufferTime) {
      return res.status(400).json({
        success: false,
        error: 'Delivery time must be at least 1 minute in the future',
        deliveryDate: deliveryDate.toISOString(),
        currentTime: now.toISOString()
      });
    }

    // Convert ke UNIX timestamp (dalam detik)
    const sendAfter = Math.floor(deliveryDate.getTime() / 1000);

    // --- PEMBANGUNAN PAYLOAD ONESIGNAL ---

    console.log('📤 Scheduling notification:', {
      deliveryDateISO: deliveryDate.toISOString(),
      sendAfter,
      userId
    });

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      
      // ✅ Hanya kirim ke USER ID yang spesifik
      include_player_ids: [userId],
      
      headings: { en: title },
      contents: { en: content },
      
      send_after: sendAfter,
      priority: 10,
      ttl: 86400,
      
      data: {
        type: 'activity_reminder',
        scheduled_time: deliveryTimeStr,
        timestamp: Date.now(),
        environment: isDevelopment ? 'development' : 'production'
      },
      web_push_topic: 'reminder',
    };

    console.log('📡 Sending to OneSignal...');

    // --- KIRIM KE ONESIGNAL ---
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📬 OneSignal Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Notification scheduled successfully!');
      
      return res.status(200).json({
        success: true,
        notificationId: data.id,
        recipients: data.recipients, // Harusnya 1 jika berhasil
        message: 'Notification scheduled successfully',
        scheduledFor: deliveryDate.toISOString(),
      });
    } else {
      console.error('❌ OneSignal API Error:', data);
      
      const errorMessage = data.errors?.[0] || 'Failed to schedule notification';
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        details: data,
        payload: payload
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