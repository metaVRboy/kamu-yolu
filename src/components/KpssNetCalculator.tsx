"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Subject = {
  id: string;
  name: string;
  correct: string;
  wrong: string;
};

let nextId = 0;

// Bilesen "use client" oldugu icin bu modul hem sunucuda (SSR) hem istemcide
// calisir; crypto.randomUUID() gibi rastgele bir id ureteci burada
// kullanilirsa sunucu ve istemci farkli id'ler uretip hydration hatasina yol
// acar. Varsayilan satirlar icin sabit id'ler, sonradan eklenenler icin ise
// (sadece kullanici tiklamasiyla, istemcide olustugu icin sorunsuz) artan
// bir sayac kullanilir.
function newSubject(name = ""): Subject {
  nextId += 1;
  return { id: `subject-${nextId}`, name, correct: "", wrong: "" };
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "default-turkce", name: "Türkçe", correct: "", wrong: "" },
  { id: "default-matematik", name: "Matematik", correct: "", wrong: "" },
  { id: "default-tarih", name: "Tarih", correct: "", wrong: "" },
  { id: "default-cografya", name: "Coğrafya", correct: "", wrong: "" },
  { id: "default-vatandaslik", name: "Vatandaşlık", correct: "", wrong: "" },
];

function netOf(subject: Subject): number {
  const correct = Number(subject.correct) || 0;
  const wrong = Number(subject.wrong) || 0;
  return Math.max(0, correct - wrong / 4);
}

export function KpssNetCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);

  function updateSubject(id: string, patch: Partial<Subject>) {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSubject() {
    setSubjects((prev) => [...prev, newSubject()]);
  }

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  const totalNet = subjects.reduce((sum, s) => sum + netOf(s), 0);

  return (
    <div className="space-y-4">
      <Card className="gap-0 divide-y divide-primary/10 border-primary/15 bg-white/70 p-0 backdrop-blur-md">
        {subjects.map((subject) => (
          <div key={subject.id} className="flex items-center gap-3 p-4">
            <Input
              value={subject.name}
              onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
              placeholder="Ders adı"
              className="flex-1 border-primary/20 bg-white"
            />
            <div className="flex items-center gap-1.5">
              <Label htmlFor={`c-${subject.id}`} className="text-xs text-muted-foreground">
                Doğru
              </Label>
              <Input
                id={`c-${subject.id}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={subject.correct}
                onChange={(e) => updateSubject(subject.id, { correct: e.target.value })}
                className="w-16 border-primary/20 bg-white text-center"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor={`w-${subject.id}`} className="text-xs text-muted-foreground">
                Yanlış
              </Label>
              <Input
                id={`w-${subject.id}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={subject.wrong}
                onChange={(e) => updateSubject(subject.id, { wrong: e.target.value })}
                className="w-16 border-primary/20 bg-white text-center"
              />
            </div>
            <div className="w-16 shrink-0 text-right text-sm font-semibold text-primary">
              {netOf(subject).toFixed(2)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeSubject(subject.id)}
              aria-label="Dersi sil"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </Card>

      <Button type="button" variant="outline" onClick={addSubject} className="border-primary/25">
        <Plus className="h-4 w-4" />
        Ders ekle
      </Button>

      <Card className="items-center gap-1 border-primary/20 bg-primary/10 p-6 text-center backdrop-blur-md">
        <p className="text-sm text-muted-foreground">Toplam Net</p>
        <p className="text-3xl font-bold text-primary">{totalNet.toFixed(2)}</p>
      </Card>
    </div>
  );
}
