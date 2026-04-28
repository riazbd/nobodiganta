<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach($articles as $article)
    <url>
        <loc>https://nobodiganta.com/{{ $article->category->slug }}/{{ $article->slug_bn }}</loc>
        <lastmod>{{ $article->updated_at->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    @if($article->slug_en)
    <url>
        <loc>https://nobodiganta.com/en/{{ $article->category->slug }}/{{ $article->slug_en }}</loc>
        <lastmod>{{ $article->updated_at->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    @endif
@endforeach
</urlset>
