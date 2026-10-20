// npx tsx --env-file=.env.prod scripts/gosterimKontrol.ts — havuzdaki tum soru/sik/aciklama metinlerini KesirliMetin ile
// render eder: ham "^" kalmamali, ornek ust/kok/kesir ciktilari yazdirilir. Veritabanini yalniz okur.
import "dotenv/config";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prisma } from "../src/lib/prisma";
import { KesirliMetin } from "../src/components/KesirliMetin";

const html = (metin: string) => renderToStaticMarkup(createElement(KesirliMetin, { metin }));
const duzMetin = (h: string) => h.replace(/<[^>]+>/g, "");

// Bilinen bicimler
assert.equal(html("9^(x - y + 1)"), "9<sup class=\"text-[0.7em]\">x - y + 1</sup>");
assert.match(html("x^y + y^x"), /x<sup[^>]*>y<\/sup> \+ y<sup[^>]*>x<\/sup>/);
assert.match(html("2^{x+1}"), /2<sup[^>]*>x\+1<\/sup>/);
assert.match(html("a^-3"), /a<sup[^>]*>-3<\/sup>/);
assert.match(html("√112 + √7"), /border-t[^>]*>112<\/span>.*border-t[^>]*>7<\/span>/);
assert.match(html("√(6² + 8²) = 10"), /border-t[^>]*>6² \+ 8²<\/span>/);
assert.ok(!html("√2/2").includes("border-t-[1.5px] border-current pt-px"), "√2/2 kesir kalmali");

(async () => {
  const sorular = await prisma.denemeSoru.findMany({ select: { id: true, soruMetni: true, secenekler: true, aciklama: true } });
  let hata = 0;
  for (const s of sorular) {
    for (const metin of [s.soruMetni, ...s.secenekler, s.aciklama ?? ""]) {
      if (duzMetin(html(metin)).includes("^")) {
        hata++;
        if (hata <= 5) console.log("HAM ^ KALDI:", s.id, metin.slice(0, 80));
      }
    }
  }
  console.log(`${sorular.length} soru tarandi, ham ^ kalan metin: ${hata}`);
  assert.equal(hata, 0);
})().finally(() => prisma.$disconnect());
