import { redirect } from "next/navigation";

// Duyurular artik hedefli bildirim yayinlama sayfasinda yonetiliyor.
export default function AdminDuyurularPage() {
  redirect("/admin/bildirimler");
}
