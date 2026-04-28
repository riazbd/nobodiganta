<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php $__currentLoopData = $articles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $article): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <url>
        <loc>https://nobodiganta.com/<?php echo e($article->category->slug); ?>/<?php echo e($article->slug_bn); ?></loc>
        <lastmod><?php echo e($article->updated_at->toIso8601String()); ?></lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <?php if($article->slug_en): ?>
    <url>
        <loc>https://nobodiganta.com/en/<?php echo e($article->category->slug); ?>/<?php echo e($article->slug_en); ?></loc>
        <lastmod><?php echo e($article->updated_at->toIso8601String()); ?></lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    <?php endif; ?>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</urlset>
<?php /**PATH C:\projects\provati\resources\views\sitemaps\full.blade.php ENDPATH**/ ?>