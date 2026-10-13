"use client";

/**
 * Kok layout'un kendisi hata verirse (ör. veritabanina ulasilamiyor): beyaz ekran yerine sade bir
 * Turkce sayfa. Layout calismadigi icin stiller satir icinde; html/body burada kurulur.
 */
export default function GenelHata({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f1f5f9", color: "#0f172a" }}>
        <div style={{ maxWidth: 440, margin: "15vh auto", padding: 32, background: "#fff", borderRadius: 24, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Kamu Yolu şu an yanıt veremiyor</h1>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>Kısa süreli bir sorun yaşıyoruz. Lütfen birkaç dakika sonra tekrar dene.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 8, border: 0, borderRadius: 12, padding: "10px 20px", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
