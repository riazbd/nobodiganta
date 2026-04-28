<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
@foreach($articles as $article)
    <url>
        <loc>https://nobodiganta.com/{{ $article->category->slug }}/{{ $article->slug_bn }}</loc>
        <news:news>
            <news:publication>
                <news:name>নবদিগন্ত</news:name>
                <news:language>bn</news:language>
            </news:publication>
            <news:publication_date>{{ $article->published_at->toIso8601String() }}</news:publication_date>
            <news:title>{{ $article->title_bn }}</news:title>
        </news:news>
    </url>
@endforeach
</urlset>
