<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Bangla Categories -->
    @foreach($categories as $category)
    <url>
        <loc>https://nobodiganta.com/category/{{ $category->slug }}</loc>
        <lastmod>{{ $category->updated_at->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    @endforeach
    
    <!-- English Categories -->
    @foreach($categories as $category)
    <url>
        <loc>https://nobodiganta.com/en/category/{{ $category->slug }}</loc>
        <lastmod>{{ $category->updated_at->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    @endforeach
</urlset>
