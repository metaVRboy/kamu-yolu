"use client";

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

export type TesvikTemasi = "sis" | "sinyal" | "gece";

/** Arka plan sahnesi (yalniz susleme): globals.css'teki .tsv-* kurallariyla canlanir. */
function Sahne({ tema }: { tema: TesvikTemasi }) {
  if (tema === "sis") {
    return (
      <>
        <div className="tsv-dekor tsv-vitrin" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="tsv-mini">
              <div className="tsv-cizgi" />
              <div className="tsv-cizgi" />
              <div className="tsv-etk">
                <span>Süresi doldu</span>
                <span>Zamanında</span>
              </div>
            </div>
          ))}
        </div>
        <div className="tsv-perde" aria-hidden />
      </>
    );
  }
  if (tema === "sinyal") {
    return (
      <svg className="tsv-dekor tsv-anten" viewBox="0 0 170 150" aria-hidden>
        <circle className="tsv-halka" cx="70" cy="68" r="40" />
        <circle className="tsv-halka" cx="70" cy="68" r="40" />
        <circle className="tsv-halka" cx="70" cy="68" r="40" />
        <g className="tsv-zil">
          <g className="tsv-zilg">
            <svg x="46" y="44" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </g>
        </g>
        <line className="tsv-kesik" x1="48" y1="46" x2="92" y2="92" strokeWidth="2.4" strokeLinecap="round" />
        <rect className="tsv-cubuk" x="128" y="118" width="7" height="10" rx="2" />
        <rect className="tsv-cubuk" x="139" y="110" width="7" height="18" rx="2" />
        <rect className="tsv-cubuk" x="150" y="100" width="7" height="28" rx="2" />
        <rect className="tsv-cubuk" x="161" y="88" width="7" height="40" rx="2" />
      </svg>
    );
  }
  return (
    <div className="tsv-dekor tsv-gokyuzu" aria-hidden>
      {/* Yildizlar metnin disinda: alt yarida butonun sagi. */}
      {[
        [5, 60],
        [12, 82],
        [22, 68],
        [30, 88],
        [9, 72],
        [16, 56],
      ].map(([sag, ust]) => (
        <span key={`${sag}-${ust}`} className="tsv-yildiz" style={{ right: `${sag}%`, top: `${ust}%` }} />
      ))}
      <span className="tsv-ay" />
      <span className="tsv-gunes" />
      <span className="tsv-ufuk" />
    </div>
  );
}

/**
 * Pro tesvik karti: "su an kotu" sahnesi, ana butonun uzerine gelince "Pro ile iyi" sahnesine doner.
 * `iyi`: ozelligin sahibi (Pro) karti hep iyi halde gorur. Dokunmatikte (hover yok) kart ekrana girince donusum
 * bir kez oynar. Ana buton `tsv-btn` sinifini, ikincil baglanti `tsv-ikincil` sinifini alir (ikincil tetiklemez).
 */
export function TesvikKarti({
  tema,
  baslik,
  metin,
  aksiyon,
  iyi = false,
  className,
}: {
  tema: TesvikTemasi;
  baslik: ReactNode;
  metin?: ReactNode;
  aksiyon?: ReactNode;
  iyi?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [uzerinde, setUzerinde] = useState(false);
  const [onizleme, setOnizleme] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (iyi || !el || !window.matchMedia("(hover: none)").matches) return;
    let zamanlayici: number | undefined;
    const gozcu = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        gozcu.disconnect();
        setOnizleme(true);
        zamanlayici = window.setTimeout(() => setOnizleme(false), 1800);
      },
      { threshold: 0.6 },
    );
    gozcu.observe(el);
    return () => {
      gozcu.disconnect();
      window.clearTimeout(zamanlayici);
    };
  }, [iyi]);

  const sec = (e: SyntheticEvent) => {
    const hedef = (e.target as HTMLElement).closest("a,button");
    setUzerinde(!!hedef && !hedef.classList.contains("tsv-ikincil"));
  };
  const birak = () => setUzerinde(false);

  return (
    <section ref={ref} className={cn("tsv", `tsv-${tema}`, (iyi || uzerinde || onizleme) && "on", className)}>
      <Sahne tema={tema} />
      <div className="tsv-icerik">
        <div>
          <p className="tsv-baslik">{baslik}</p>
          {metin && <p className="tsv-metin">{metin}</p>}
        </div>
        {aksiyon && (
          <div className="tsv-aksiyon" onPointerOver={sec} onPointerLeave={birak} onFocus={sec} onBlur={birak}>
            {aksiyon}
          </div>
        )}
      </div>
    </section>
  );
}
