<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
<?php $__currentLoopData = $articles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $article): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <url>
        <loc>https://nobodiganta.com/en/<?php echo e($article->category->slug); ?>/<?php echo e($article->slug_en ?? $article->slug_bn); ?></loc>
        <news:news>
            <news:publication>
                <news:name>NoboDiganta</news:name>
                <news:language>en</news:language>
            </news:publication>
            <news:publication_date><?php echo e($article->published_at->toIso8601String()); ?></news:publication_date>
            <news:title><?php echo e($article->title_en ?? $article->title_bn); ?></news:title>
        </news:news>
    </url>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</urlset>
<?php /**PATH C:\projects\provati\resources\views\sitemaps\english.blade.php ENDPATH**/ ?>