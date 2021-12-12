package com.codethen.examples.jsoup;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.codethen.linklist.items.Item;
import com.codethen.linklist.metadata.MetadataScraper;
import com.google.gson.Gson;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import org.jsoup.nodes.Element;

public class JsoupExample {

    public static void main(String[] args) throws Exception {

        String url;
        url = "https://www.imdb.com/title/tt5421602/"; // Anne with an E - TVSeries
        url = "https://www.imdb.com/title/tt5421602/"; // Anne with an E - TVSeries (mobile)
        url = "https://www.imdb.com/title/tt0209144/"; // Movie
        url = "https://open.spotify.com/album/3NJLH1LhVdZBeYDrTCbdnO"; // Album
        url = "https://deezer.page.link/S9ixbKEagAUSgKHcA"; // Song
        url = "https://open.spotify.com/track/0DYXeq2whfySFHh7lXLC2k"; // Song
        url = "https://open.spotify.com/album/49MNmJhZQewjt06rpwp6QR?si=LVJcDrstRyuf-i0SZCMNBw"; // Long link

        if (url.contains("spotify.com/") && url.contains("?si=")) {
            // Remove Spotify query params
            url = url.substring(0, url.indexOf("?si="));
        }

        Document doc = Jsoup.connect(url).header("Accept-Language", "en-US").get();
        String title = doc.title();
        System.out.println(title);

        System.out.println(getMeta(doc, "og:title"));
        System.out.println(getMeta(doc, "twitter:audio:artist_name"));
        System.out.println(getMeta(doc, "og:image"));
        System.out.println(getMeta(doc, "og:type"));
        System.out.println(getMeta(doc, "og:description"));

        // TODO: JSON with data (IMDB)
        if (url.startsWith("https://www.imdb.com")) {
            String json = doc.select("script[type='application/ld+json']").get(0).data();
            Map<?, ?> map = new Gson().fromJson(json, Map.class);
            System.out.println("imdb name: " + map.get("name"));
            System.out.println("imdb @type: " + map.get("@type"));
            System.out.println("imdb genre: " + map.get("genre"));
            System.out.println("imdb image: " + map.get("image"));
            System.out.println("imdb duration: " + map.get("duration"));
            System.out.println("imdb datePublished: " + map.get("datePublished"));
            final Object director = map.get("director");
            if (director instanceof List) {
                final String directors = ((List<?>) director).stream()
                        .map(x -> (String) ((Map) x).get("name"))
                        .collect(Collectors.joining(", "));
                System.out.println("imdb directors: " + directors);
            }
            final Object aggregateRating = map.get("aggregateRating");
            if (aggregateRating instanceof Map) {
                System.out.println("imdb aggregateRating.ratingValue: " + ((Map<?, ?>) aggregateRating).get("ratingValue"));
            }
        }

        final MetadataScraper metadataScraper = new MetadataScraper();
        final Item item = metadataScraper.itemDataFromUrl(url);
        System.out.println(item);
    }

    private static String getMeta(Document doc, String name) {
        final Element element = doc
                .select("meta[property='" + name + "']")
                .first();
        return name + ": " + (element == null ? null : element.attr("content"));
    }
}
