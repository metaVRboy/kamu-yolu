"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  KURUM_TURLERI,
  isciAltMeslekleri,
  memurAltMeslekleri,
  meslekSecenekleri,
  meslekSeciminiCoz,
} from "@/lib/kurumMeslek";

const DIGER = "Diğer";
const ISCI = "İşçi";
const MEMUR = "Memur";

type DepartmentOption = { id: string; name: string };

const EDUCATION_LEVELS: { value: string; label: string }[] = [
  { value: "ILKOGRETIM", label: "İlköğretim" },
  { value: "LISE", label: "Lise" },
  { value: "ONLISANS", label: "Önlisans" },
  { value: "LISANS", label: "Lisans" },
  { value: "YUKSEK_LISANS", label: "Yüksek Lisans" },
];

export function ProfilForm({
  departments,
  initial,
}: {
  departments: DepartmentOption[];
  initial: {
    telefon: string | null;
    meslek: string | null;
    kurumTuru: string | null;
    kamuCalisaniDegil: boolean;
    departmentId: string | null;
    educationLevel: string | null;
  };
}) {
  const router = useRouter();
  const [telefon, setTelefon] = useState(initial.telefon ?? "");
  const [kurumTuru, setKurumTuru] = useState(initial.kurumTuru ?? "");
  const ilkCozum = meslekSeciminiCoz(initial.kurumTuru ?? "", initial.meslek ?? "");
  const [meslek, setMeslek] = useState(ilkCozum.meslek);
  const [meslekAltUnvan, setMeslekAltUnvan] = useState(ilkCozum.altUnvan);
  const [meslekSerbest, setMeslekSerbest] = useState(ilkCozum.serbest);
  const [kamuCalisaniDegil, setKamuCalisaniDegil] = useState(initial.kamuCalisaniDegil);
  const [departmentId, setDepartmentId] = useState(initial.departmentId ?? "");
  const [educationLevel, setEducationLevel] = useState(initial.educationLevel ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const meslekler = kurumTuru ? meslekSecenekleri(kurumTuru) : [];
  const altUnvanlar =
    meslek === ISCI ? isciAltMeslekleri(kurumTuru) : meslek === MEMUR ? memurAltMeslekleri(kurumTuru) : [];
  const serbestMetinGerekli = meslek === DIGER || meslekAltUnvan === DIGER;
  const nihaiMeslek = serbestMetinGerekli ? meslekSerbest.trim() : altUnvanlar.length > 0 ? meslekAltUnvan : meslek;

  function handleKurumTuruChange(value: string) {
    setKurumTuru(value);
    setMeslek("");
    setMeslekAltUnvan("");
    setMeslekSerbest("");
  }

  function handleMeslekChange(value: string) {
    setMeslek(value);
    setMeslekAltUnvan("");
    setMeslekSerbest("");
  }

  function handleMeslekAltUnvanChange(value: string) {
    setMeslekAltUnvan(value);
    setMeslekSerbest("");
  }

  function handleKamuCalisaniDegilChange(checked: boolean) {
    setKamuCalisaniDegil(checked);
    if (checked) {
      setKurumTuru("");
      setMeslek("");
      setMeslekAltUnvan("");
      setMeslekSerbest("");
    }
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: telefon || null,
          meslek: nihaiMeslek || null,
          kurumTuru: kurumTuru || null,
          kamuCalisaniDegil,
          departmentId: departmentId || null,
          educationLevel: educationLevel || null,
        }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5">Telefon</Label>
        <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} className="border-primary/20 bg-white" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>Çalıştığın Kurum Türü</Label>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={kamuCalisaniDegil}
              onChange={(e) => handleKamuCalisaniDegilChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-primary/30"
            />
            Kamu çalışanı değilim
          </label>
        </div>
        <select
          value={kurumTuru}
          onChange={(e) => handleKurumTuruChange(e.target.value)}
          disabled={kamuCalisaniDegil}
          className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm disabled:opacity-50"
        >
          <option value="">Seçilmedi</option>
          {KURUM_TURLERI.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="mb-1.5">Meslek / Unvan</Label>
        <select
          value={meslek}
          onChange={(e) => handleMeslekChange(e.target.value)}
          disabled={kamuCalisaniDegil || !kurumTuru}
          className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm disabled:opacity-50"
        >
          <option value="">{kurumTuru ? "Seçilmedi" : "Önce kurum türü seçin"}</option>
          {meslekler.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {altUnvanlar.length > 0 && (
          <div className="mt-2">
            <Label className="mb-1.5">{meslek} Unvanını Belirt</Label>
            <select
              value={meslekAltUnvan}
              onChange={(e) => handleMeslekAltUnvanChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
            >
              <option value="">Seçilmedi</option>
              {altUnvanlar.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
        {serbestMetinGerekli && (
          <div className="mt-2">
            <Label className="mb-1.5">Unvanını Yaz</Label>
            <input
              type="text"
              value={meslekSerbest}
              onChange={(e) => setMeslekSerbest(e.target.value)}
              placeholder="Unvanını yaz"
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
            />
          </div>
        )}
      </div>
      <div>
        <Label className="mb-1.5">Mezun Olduğun Bölüm</Label>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
        >
          <option value="">Seçilmedi</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Bölümünü seçersen, o bölüme uygun yeni ilan çıktığında bildirim alırsın.
        </p>
      </div>
      <div>
        <Label className="mb-1.5">Öğrenim Düzeyi</Label>
        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
        >
          <option value="">Seçilmedi</option>
          {EDUCATION_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Kaydedildi.</span>}
      </div>
    </div>
  );
}
