# Gunluk canli veritabani yedegi (Gorev Zamanlayicisi: KamuYoluYedek, pencere acmadan).
# Neon'dan bagimsiz kopya: %USERPROFILE%\KamuYoluYedek (OneDrive disi, yalniz bu Windows kullanicisi okur),
# son 14 yedek tutulur. Sonuc admin Taramalar sayfasina yazilir: 24 saattir basarili yedek yoksa kart kirmizi.
# Geri yukleme: pg_restore --clean --if-exists --no-owner -d <hedef db> <dosya>  (once dev branch'te dene)
$ErrorActionPreference = "Stop"
$proje = Split-Path -Parent $PSScriptRoot
$bin = "C:\Program Files\PostgreSQL\18\bin"
$hedef = Join-Path $env:USERPROFILE "KamuYoluYedek"
$log = Join-Path $proje "logs\yedek.log"
$tut = 14
$zamanAsimiDk = 20
New-Item -ItemType Directory -Force $hedef, (Split-Path $log) | Out-Null
function Yaz($m) { Add-Content -Path $log -Value ("{0:yyyy-MM-dd HH:mm:ss} {1}" -f (Get-Date), $m) }

# Canli adres .env.prod'dan; sifre komut satirina degil ortam degiskenine.
$satir = Get-Content (Join-Path $proje ".env.prod") | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
$url = [Uri]($satir -replace '^DATABASE_URL="?([^"]+)"?$', '$1')
$kullanici, $sifre = $url.UserInfo.Split(":", 2)
$env:PGPASSWORD = [Uri]::UnescapeDataString($sifre)
$env:PGSSLMODE = "require"
$env:PGCHANNELBINDING = "require"
$env:PGCONNECT_TIMEOUT = "30"
# pg_dump oturum ozellikleri kullanir: havuzlu (-pooler) degil dogrudan uc nokta.
$baglanti = "-h $($url.Host -replace '-pooler', '') -U $kullanici -d $($url.AbsolutePath.TrimStart('/'))"
$basla = (Get-Date).ToUniversalTime()

function Calistir($exe, $argumanlar) {
  $hata = [IO.Path]::GetTempFileName()
  $cikti = [IO.Path]::GetTempFileName()
  $p = Start-Process -FilePath "$bin\$exe" -ArgumentList $argumanlar -NoNewWindow -PassThru -RedirectStandardError $hata -RedirectStandardOutput $cikti
  $null = $p.Handle  # PS 5.1: handle onceden alinmazsa ExitCode bos doner
  if (-not $p.WaitForExit($zamanAsimiDk * 60000)) { $p.Kill(); throw "$exe $zamanAsimiDk dk icinde bitmedi" }
  $sonuc = @{ kod = $p.ExitCode; hata = (Get-Content $hata -Raw); cikti = (Get-Content $cikti) }
  Remove-Item $hata, $cikti
  if ($sonuc.kod -ne 0) { throw "$exe kod $($sonuc.kod): $($sonuc.hata)" }
  return $sonuc.cikti
}

# Taramalar sayfasina kayit (sourceName "Veritabani yedegi", Turkce harfler SQL unicode kacisiyla).
function Kayit($durum, $tablo, $mesaj) {
  $m = ($mesaj -replace "'", "''" -replace '"', '')
  if ($m.Length -gt 900) { $m = $m.Substring(0, 900) }
  $sql = "INSERT INTO \""ScrapeRun\"" (id, \""sourceName\"", status, \""startedAt\"", \""finishedAt\"", \""postingsFound\"", \""errorMessage\"") VALUES (gen_random_uuid()::text, U&'Veritaban\0131 yede\011Fi', '$durum', '$($basla.ToString("yyyy-MM-dd HH:mm:ss"))', now() AT TIME ZONE 'UTC', $tablo, '$m')"
  Calistir "psql.exe" "$baglanti -v ON_ERROR_STOP=1 -q -c ""$sql""" | Out-Null
}

$dosya = Join-Path $hedef ("kamuyolu-{0:yyyy-MM-dd_HHmm}.dump" -f (Get-Date))
try {
  Yaz "yedek basladi"
  Calistir "pg_dump.exe" "$baglanti -Fc --no-owner --no-privileges -f ""$dosya""" | Out-Null
  # Dosya gercekten okunabilir mi: icindekiler listesi + tablo verisi sayisi.
  $tablo = @(Calistir "pg_restore.exe" "--list ""$dosya""" | Where-Object { $_ -match ' TABLE DATA ' }).Count
  if ($tablo -lt 10) { throw "yedekte yalniz $tablo tablo var" }
  $mb = [math]::Round((Get-Item $dosya).Length / 1MB, 2)
  Get-ChildItem $hedef -Filter "kamuyolu-*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -Skip $tut | Remove-Item
  Kayit "SUCCESS" $tablo "$mb MB, $tablo tablo"
  Yaz "basarili: $dosya ($mb MB, $tablo tablo)"
} catch {
  Yaz "HATA: $_"
  if (Test-Path $dosya) { Remove-Item $dosya }
  try { Kayit "FAILED" "NULL" "$_" } catch { Yaz "kayit da yazilamadi: $_" }
  exit 1
}
