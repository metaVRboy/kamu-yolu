// Kamu Yolu service worker: yalniz tarayici bildirimi (Web Push). Onbellekleme yapmaz.
self.addEventListener("push", (event) => {
  let veri = { baslik: "Kamu Yolu", govde: "", link: "/" };
  try {
    veri = { ...veri, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(veri.baslik, {
      body: veri.govde,
      icon: "/brand/kamu-yolu-emblem.png",
      badge: "/brand/kamu-yolu-emblem.png",
      data: { link: veri.link },
      lang: "tr",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Yalniz site ici yol acilir (bildirim icerigi sunucudan gelir ama yine de dis adrese gidilmez).
  const link = typeof event.notification.data?.link === "string" && event.notification.data.link.startsWith("/") && !event.notification.data.link.startsWith("//")
    ? event.notification.data.link
    : "/";
  event.waitUntil(self.clients.openWindow(link));
});
