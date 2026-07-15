self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'JEE 2027 Hub Update!',
    icon: 'logo.png',
    badge: 'logo.png'
  };
  event.waitUntil(
    self.registration.showNotification('JEE 2027 Hub', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
