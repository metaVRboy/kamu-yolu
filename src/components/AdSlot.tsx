import { cn } from "@/lib/utils";

/**
 * Reklam alani icin ayrilmis, henuz bos bir yer tutucu. Gercek bir reklam
 * agi (ör. AdSense) baglandiginda buradaki icerik degistirilecek; simdilik
 * sayfa duzeninin reklamlarla birlikte dogru calistigini gostermek icin var.
 */
export function AdSlot({ side }: { side: "left" | "right" }) {
  return (
    <div className="sticky top-24 hidden h-[600px] w-[160px] shrink-0 2xl:block">
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 text-center backdrop-blur-md",
        )}
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-primary/50">
          Reklam
        </span>
        <span className="text-[10px] text-primary/30">160 × 600</span>
      </div>
    </div>
  );
}
