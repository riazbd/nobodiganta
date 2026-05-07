<!DOCTYPE html>
<html lang="<?php echo e($htmlEdition ?? 'bn'); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title inertia><?php echo e(config('app.name', 'নবদিগন্ত')); ?></title>

        
        <?php ($faviconUrl = \App\Models\Setting::where('key', 'site_favicon')->value('value')); ?>
        <link rel="icon" href="<?php echo e($faviconUrl ?: '/favicon.ico'); ?>" type="<?php echo e($faviconUrl && str_ends_with($faviconUrl, '.png') ? 'image/png' : 'image/x-icon'); ?>">

        
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#e8001e">
        <link rel="apple-touch-icon" href="<?php echo e($faviconUrl ?: '/icons/icon-192.png'); ?>">

        
        <link rel="preconnect" href="https://fonts.maateen.me" crossorigin>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

        
        <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
        <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet">

        
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap" rel="stylesheet">

        
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
        <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>

        <!-- Scripts -->
        <?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.jsx']); ?>

        
        <?php if(config('services.adsense.client_id')): ?>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?php echo e(config('services.adsense.client_id')); ?>" crossorigin="anonymous"></script>
        <?php endif; ?>

        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
    </head>
    <body class="font-sans antialiased">
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } elseif (config('inertia.use_script_element_for_initial_page')) { ?><script data-page="app" type="application/json"><?php echo json_encode($page); ?></script><div id="app"></div><?php } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
    </body>
</html>
<?php /**PATH C:\projects\provati\resources\views/app.blade.php ENDPATH**/ ?>