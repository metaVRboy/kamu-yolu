"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";

type Duyuru = { id: string; baslik: string; icerik: string; createdAt: string };

export function AdminDuyuruPanel({ duyurular }: { duyurular: Duyuru[] }) {
  const router = useRouter();
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [loading, setLoading] = useState(false);
  const [silinecek, setSilinecek] = useState<Duyuru | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/duyurular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, icerik }),
      });
      if (!res.ok) {
        toast.error("Duyuru yayınlanamadı.", "Lütfen tekrar dene.");
        return;
      }
      setBaslik("");
      setIcerik("");
      toast.success("Duyuru yayınlandı.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!silinecek) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/duyurular/${silinecek.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Duyuru silinemedi.", "Lütfen tekrar dene.");
        return;
      }
      toast.success("Duyuru silindi.");
      setSilinecek(null);
      router.refresh();
    } finally {
      setSiliniyor(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="gap-3 border-primary/20 bg-white p-5 shadow-sm">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            placeholder="Duyuru başlığı"
            required
            className="border-primary/20 bg-white"
          />
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            placeholder="Duyuru içeriği"
            rows={3}
            required
            className="w-full rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Yayınlanıyor..." : "Duyuru Yayınla"}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {duyurular.map((d) => (
          <Card key={d.id} className="flex-row items-start justify-between gap-3 border-primary/20 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">{d.baslik}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{d.icerik}</p>
            </div>
            <button
              type="button"
              onClick={() => setSilinecek(d)}
              aria-label="Sil"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!silinecek} onOpenChange={(open) => !open && setSilinecek(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyuruyu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{silinecek?.baslik}&quot; kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={siliniyor}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={siliniyor} onClick={handleDelete}>
              {siliniyor ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
