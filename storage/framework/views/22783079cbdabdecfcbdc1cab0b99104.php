<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Google News Sitemaps (last 2 days) -->
    <sitemap>
        <loc>https://nobodiganta.com/sitemap-bn.xml</loc>
        <lastmod><?php echo e($lastModified->toIso8601String()); ?></lastmod>
    </sitemap>
    <sitemap>
        <loc>https://nobodiganta.com/sitemap-en.xml</loc>
        <lastmod><?php echo e($lastModified->toIso8601String()); ?></lastmod>
    </sitemap>
    
    <!-- Full Sitemap -->
    <sitemap>
        <loc>https://nobodiganta.com/sitemap-full.xml</loc>
        <lastmod><?php echo e($lastModified->toIso8601String()); ?></lastmod>
    </sitemap>
    
    <!-- Category Sitemap -->
    <sitemap>
        <loc>https://nobodiganta.com/sitemap-categories.xml</loc>
        <lastmod><?php echo e($lastModified->toIso8601String()); ?></lastmod>
    </sitemap>
</sitemapindex>
<?php /**PATH C:\projects\provati\resources\views\sitemaps\index.blade.php ENDPATH**/ ?>