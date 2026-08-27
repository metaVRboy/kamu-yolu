"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Duyuru = { id: string; baslik: string; icerik: string; createdAt: string };

export function AdminDuyuruPanel({ duyurular }: { duyurular: Duyuru[] }) {
  const router = useRouter();
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/duyurular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, icerik }),
      });
      setBaslik("");
      setIcerik("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/duyurular/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="gap-3 border-primary/20 bg-white/70 p-5 backdrop-blur-md">
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
          <Card key={d.id} className="flex-row items-start justify-between gap-3 border-primary/20 bg-white/70 p-4 backdrop-blur-md">
            <div>
              <p className="text-sm font-semibold text-slate-900">{d.baslik}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{d.icerik}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(d.id)}
              aria-label="Sil"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
