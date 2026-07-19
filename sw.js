// JEE2027 Hub — Ultimate Service Worker Engine
// Combine: Tab Focus + Background Sync + Persistent Notification (No Clear All)

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// 1. बैकग्राउंड टाइमर/पुश आने पर नोटिफिकेशन बार में शो करने का कोड
self.addEventListener('push', e => {
  const options = {
    body: e.data ? e.data.text() : 'समय हो गया है! अपना टास्क या टेस्ट चेक करें।',
    icon: 'logo.png',
    badge: 'logo.png',
    requireInteraction: true // 'Clear All' दबाने पर भी नोटिफिकेशन ऊपर बार में टिका रहेगा
  };
  e.waitUntil(self.registration.showNotification('JEE 2027 Hub', options));
});

// 2. इन-ऐप मैसेजेस को बैकग्राउंड टाइमर से हैंडल करने के लिए
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    const options = {
      body: e.data.body || 'टास्क रिमाइंडर!',
      icon: 'logo.png',
      badge: 'logo.png',
      requireInteraction: true // यूजर के खुद हटाने तक यह नोटिफिकेशन चिपका रहेगा
    };
    e.waitUntil(self.registration.showNotification(e.data.title || 'JEE 2027 Hub', options));
  }
});

// 3. आपका पुराना ओरिजिनल कोड: नोटिफिकेशन पर क्लिक करने पर ऐप या खुला हुआ टैब फोकस करना
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => {
    // अगर ऐप का टैब पहले से खुला है, तो सीधे उस पर ले जाएगा
    if (cs.length > 0) return cs[0].focus();
    // अगर ऐप बंद है, तो नया पेज खोलेगा
    return self.clients.openWindow('./');
  }));
});
