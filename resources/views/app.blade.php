<!DOCTYPE html>
<html lang="bn">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'নবদিগন্ত') }}</title>

        {{-- Favicon — dynamic from settings, falls back to /favicon.ico --}}
        @php($faviconUrl = \App\Models\Setting::where('key', 'site_favicon')->value('value'))
        <link rel="icon" href="{{ $faviconUrl ?: '/favicon.ico' }}" type="{{ $faviconUrl && str_ends_with($faviconUrl, '.png') ? 'image/png' : 'image/x-icon' }}">

        {{-- PWA Manifest --}}
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#e8001e">
        <link rel="apple-touch-icon" href="{{ $faviconUrl ?: '/icons/icon-192.png' }}">

        {{-- Preconnect to font CDNs --}}
        <link rel="preconnect" href="https://fonts.maateen.me" crossorigin>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        {{-- Primary Bengali font (SolaimanLipi) — unicode-range subset for performance --}}
        {{-- Only loads Bengali Unicode block (U+0980-09FF) for smaller download --}}
        <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet">

        {{-- Secondary: Noto Sans Bengali & Noto Serif Bengali --}}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

        {{-- Quill RTE (for Admin) --}}
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
        <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])

        {{-- Google AdSense (Phase 5) --}}
        @if(config('services.adsense.client_id'))
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ config('services.adsense.client_id') }}" crossorigin="anonymous"></script>
        @endif

        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
