<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
@foreach($articles as $article)
    <url>
        <loc>https://nobodiganta.com/en/{{ $article->category->slug }}/{{ $article->slug_en ?? $article->slug_bn }}</loc>
        <news:news>
            <news:publication>
                <news:name>NoboDiganta</news:name>
                <news:language>en</news:language>
            </news:publication>
            <news:publication_date>{{ $article->published_at->toIso8601String() }}</news:publication_date>
            <news:title>{{ $article->title_en ?? $article->title_bn }}</news:title>
        </news:news>
    </url>
@endforeach
</urlset>
