import { ImlecIsigi } from "@/components/ImlecIsigi";
import { YolCizimi } from "@/components/YolCizimi";

/**
 * Ana sayfanin hareketli zemini (tamami dekoratif, aria-hidden):
 * - ustte yavasca suzulen renk lekeleri + nokta deseni,
 * - sayfa boyunca kivrilan altin "yol" (logodaki yol, YolCizimi); kesik cizgiler akar, sayfa kaydirildikca
 *   yol asagi dogru cizilir (CSS scroll-driven animation; desteklemeyen tarayicida yol tamamen gorunur),
 * - masaustunde imleci takip eden hafif isik.
 */
export function AnaSayfaZemini() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="zemin-leke zemin-leke-1" />
      <div className="zemin-leke zemin-leke-2" />
      <div className="zemin-leke zemin-leke-3" />
      <div className="zemin-desen absolute inset-x-0 top-0 h-[900px]" />
      <YolCizimi />
      <ImlecIsigi />
    </div>
  );
}
