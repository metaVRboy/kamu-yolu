import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bug, Clock, HelpCircle, Lightbulb, LifeBuoy, Mail, MessageSquareText, ShieldCheck, UserCog } from "lucide-react";
import { ILETISIM_EPOSTA } from "@/lib/site";

// Konu cipleri destek formunu o konu secili acar (/destek?konu=...).
const KONULAR = [
  { ad: "Genel soru", ikon: HelpCircle },
  { ad: "Hata bildirimi", ikon: Bug },
  { ad: "Öneri", ikon: Lightbulb },
  { ad: "Hesap ve kişisel veriler", ikon: UserCog },
] as const;

/** Ana sayfanin kapanis bolumu: iletisim yollari (destek formu, e-posta, KVKK basvurusu). */
export function BizeUlasin() {
  return (
    <section aria-labelledby="bize-ulasin" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#13306b] to-primary text-white shadow-xl shadow-primary/20">
      <div aria-hidden className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:20px_20px]" />
      <div aria-hidden className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
      <div aria-hidden className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
      <Image src="/brand/kamu-yolu-emblem.png" alt="" width={420} height={420} className="pointer-events-none absolute -right-14 -bottom-16 hidden h-80 w-80 opacity-[0.06] brightness-0 invert lg:block" />

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-widest uppercase ring-1 ring-white/20">
            <LifeBuoy className="h-3.5 w-3.5 text-sky-300" />
            Bize ulaşın
          </span>
          <h2 id="bize-ulasin" className="mt-4 font-sans text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Bir sorun, soru ya da <span className="bg-gradient-to-r from-sky-200 to-amber-100 bg-clip-text text-transparent">fikrin</span> mi var?
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            Kamu Yolu&apos;nu senden gelen geri bildirimlerle geliştiriyoruz. Yaz, yanıtımızı e-postana gönderelim.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {KONULAR.map(({ ad, ikon: Ikon }) => (
              <Link
                key={ad}
                href={`/destek?konu=${encodeURIComponent(ad)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold ring-1 ring-white/20 transition-colors hover:bg-white/20 sm:text-sm"
              >
                <Ikon className="h-4 w-4 text-sky-200" />
                {ad}
              </Link>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-white/70">
            <Clock className="h-3.5 w-3.5" />
            Genelde 1-2 iş günü içinde yanıt · Pro+ üyelere öncelikli destek
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/destek"
            className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5 sm:p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquareText className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Destek formu</span>
              <span className="block text-sm text-slate-600">Mesajını yaz, yanıtı e-postana gelsin.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href={`mailto:${ILETISIM_EPOSTA}`}
            className="group flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15 sm:p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-200">
              <Mail className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">E-posta</span>
              <span className="block truncate text-sm text-white/75">{ILETISIM_EPOSTA}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-white/70 transition-transform group-hover:translate-x-1" />
          </a>

          <Link
            href="/kvkk"
            className="group flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/15 sm:p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Kişisel veri talepleri</span>
              <span className="block text-sm text-white/75">KVKK başvuru yolları ve hakların</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-white/70 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
