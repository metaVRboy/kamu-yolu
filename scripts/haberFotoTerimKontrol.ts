// Haber -> Unsplash arama terimi eslemesinin bilinen tuzaklari: npx tsx scripts/haberFotoTerimKontrol.ts
import assert from "node:assert";
import { haberAramaTerimi as t } from "../src/lib/haberFoto";

assert.equal(t({ baslik: "Gelir İdaresi Başkanlığı 860 Gelir Uzman Yardımcısı Alacak" }), "finance documents office"); // İ + /i
assert.equal(t({ baslik: "Kamu Gözetimi Kurumu 13 Uzman", ozet: "Muhasebe ve Denetim" }), "finance documents office"); // muhas-ebe
assert.equal(t({ baslik: "İETT 44 memur", ozet: "Elektrik Tramvay" }), "city tram bus public transport");
assert.equal(t({ baslik: "Strateji ve Bütçe Başkanlığı 7 Bilişim Personeli" }), "technology computer code");
assert.equal(t({ baslik: "Kalkınma Ajansı personel alımı" }), "office desk documents");
console.log("haberFoto terimleri tamam");
