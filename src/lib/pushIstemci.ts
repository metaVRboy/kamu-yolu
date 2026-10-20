"use client";

import { VAPID_ACIK_ANAHTAR } from "@/lib/vapid";

export type BildirimDurumu = "desteklenmiyor" | "acik" | "kapali" | "engelli";

export const pushDestekleniyor = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export async function bildirimDurumu(): Promise<BildirimDurumu> {
  if (!pushDestekleniyor()) return "desteklenmiyor";
  if (Notification.permission === "denied") return "engelli";
  const kayit = await navigator.serviceWorker.getRegistration("/");
  return (await kayit?.pushManager.getSubscription()) ? "acik" : "kapali";
}

function anahtarBaytlari(base64: string) {
  const b = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}

/** Izin ister, abone olur ve sunucuya kaydeder. Kullanici bir dugmeye bastiginda cagrilmali (tarayici kurali). */
export async function bildirimleriAc(): Promise<BildirimDurumu> {
  if (!pushDestekleniyor()) return "desteklenmiyor";
  const izin = await Notification.requestPermission();
  if (izin !== "granted") return izin === "denied" ? "engelli" : "kapali";
  const kayit = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const abonelik =
    (await kayit.pushManager.getSubscription()) ??
    (await kayit.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: anahtarBaytlari(VAPID_ACIK_ANAHTAR) }));
  const res = await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(abonelik.toJSON()) });
  return res.ok ? "acik" : "kapali";
}

export async function bildirimleriKapat(): Promise<void> {
  const kayit = await navigator.serviceWorker?.getRegistration("/");
  const abonelik = await kayit?.pushManager.getSubscription();
  if (!abonelik) return;
  await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: abonelik.endpoint }) });
  await abonelik.unsubscribe();
}
