# Pequeno servidor HTTP local para la Quiniela (sin dependencias)
$ErrorActionPreference = "Stop"

$puerto = 8000
$raiz = $PSScriptRoot
$url = "http://localhost:$puerto/"

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Servidor de la Quiniela en: $url" -ForegroundColor Green
Write-Host "  Presiona Ctrl+C para detenerlo." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Start-Process $url

function ContenidoTipo($ext) {
    switch ($ext) {
        '.html' { return 'text/html; charset=utf-8' }
        '.js'   { return 'application/javascript; charset=utf-8' }
        '.mjs'  { return 'application/javascript; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.png'  { return 'image/png' }
        '.jpg'  { return 'image/jpeg' }
        '.svg'  { return 'image/svg+xml' }
        '.ico'  { return 'image/x-icon' }
        '.woff2' { return 'font/woff2' }
        default { return 'application/octet-stream' }
    }
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $ruta = $ctx.Request.Url.AbsolutePath.TrimStart('/')
        if ($ruta -eq '') { $ruta = 'index.html' }
        $archivo = [System.IO.Path]::GetFullPath((Join-Path $raiz ($ruta -replace '/', '\')))

        if (-not $archivo.StartsWith($raiz, [System.StringComparison]::OrdinalIgnoreCase)) {
            $ctx.Response.StatusCode = 403
            $ctx.Response.Close()
            continue
        }

        if (Test-Path -LiteralPath $archivo -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($archivo)
            $bytes = [System.IO.File]::ReadAllBytes($archivo)
            $ctx.Response.ContentType = ContenidoTipo $ext
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $ctx.Response.OutputStream.Close()
        } else {
            $ctx.Response.StatusCode = 404
            $ctx.Response.OutputStream.Close()
        }
    }
} finally {
    $listener.Stop()
}
