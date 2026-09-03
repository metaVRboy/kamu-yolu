"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Haber = {
  id: string;
  baslik: string;
  ozet: string;
  kaynakUrl: string | null;
  gorselUrl: string | null;
  gorselLogoMu: boolean;
  yayinTarihi: string;
};

export function AdminHaberPanel({ haberler }: { haberler: Haber[] }) {
  const router = useRouter();
  const [baslik, setBaslik] = useState("");
  const [ozet, setOzet] = useState("");
  const [kaynakUrl, setKaynakUrl] = useState("");
  const [gorselUrl, setGorselUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [silinecek, setSilinecek] = useState<Haber | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/haberler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, ozet, kaynakUrl: kaynakUrl || undefined, gorselUrl: gorselUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      setBaslik("");
      setOzet("");
      setKaynakUrl("");
      setGorselUrl("");
      toast.success("Haber yayınlandı.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!silinecek) return;
    setSiliniyor(true);
    try {
      const res = await fetch(`/api/admin/haberler/${silinecek.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Haber silinemedi.", "Lütfen tekrar dene.");
        return;
      }
      toast.success("Haber silindi.");
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
          <div>
            <Label className="mb-1.5">Başlık</Label>
            <Input
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              required
              className="border-primary/20 bg-white"
            />
          </div>
          <div>
            <Label className="mb-1.5">Özet</Label>
            <textarea
              value={ozet}
              onChange={(e) => setOzet(e.target.value)}
              rows={3}
              required
              className="w-full rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label className="mb-1.5">Kaynak Bağlantısı (opsiyonel)</Label>
            <Input
              value={kaynakUrl}
              onChange={(e) => setKaynakUrl(e.target.value)}
              placeholder="https://..."
              className="border-primary/20 bg-white"
            />
          </div>
          <div>
            <Label className="mb-1.5">Görsel Bağlantısı (opsiyonel)</Label>
            <Input
              value={gorselUrl}
              onChange={(e) => setGorselUrl(e.target.value)}
              placeholder="https://..."
              className="border-primary/20 bg-white"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Yayınlanıyor..." : "Haberi Yayınla"}
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {haberler.map((h) => (
          <Card key={h.id} className="flex-row items-start justify-between gap-3 border-primary/20 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">{h.baslik}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{h.ozet}</p>
              {h.kaynakUrl && (
                <a href={h.kaynakUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-primary hover:underline">
                  {h.kaynakUrl}
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSilinecek(h)}
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
            <AlertDialogTitle>Haberi sil</AlertDialogTitle>
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
