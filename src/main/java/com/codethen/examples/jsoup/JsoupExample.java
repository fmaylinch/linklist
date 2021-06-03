package com.codethen.examples.jsoup;

import java.util.Map;

import com.google.gson.Gson;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import org.jsoup.nodes.Element;

public class JsoupExample {

    public static void main(String[] args) throws Exception {

        //final String url = "https://www.imdb.com/title/tt0120338"; // Titanic - Movie
        final String url = "https://www.imdb.com/title/tt5421602/"; // Anne with an E - TVSeries
        //final String url = "https://open.spotify.com/album/3NJLH1LhVdZBeYDrTCbdnO"; // Kuedo - Severant

        Document doc = Jsoup.connect(url).header("Accept-Language", "en-US").get();
        String title = doc.title();
        System.out.println(title);

        // TODO: metas
        System.out.println(getMeta(doc, "og:title"));
        System.out.println(getMeta(doc, "twitter:audio:artist_name")); // TODO: For Spotify
        System.out.println(getMeta(doc, "og:image"));
        System.out.println(getMeta(doc, "og:type"));
        System.out.println(getMeta(doc, "og:description"));

        // TODO: JSON with data (IMDB)
        if (url.startsWith("https://www.imdb.com")) {
            String json = doc.select("script[type='application/ld+json']").get(0).data();
            Map<?, ?> map = new Gson().fromJson(json, Map.class);
            System.out.println(map.get("name"));
            System.out.println(map.get("@type"));
            System.out.println(map.get("image"));
            System.out.println(map.get("duration"));
            final Object director = map.get("director");
            if (director instanceof Map) {
                System.out.println(((Map<?, ?>) director).get("name"));
            }
            final Object aggregateRating = map.get("aggregateRating");
            if (aggregateRating instanceof Map) {
                System.out.println(((Map<?, ?>) aggregateRating).get("ratingValue"));
            }
        }
    }

    private static String getMeta(Document doc, String name) {
        final Element element = doc
                .select("meta[property='" + name + "']")
                .first();
        return element == null ? null : element.attr("content");
    }
}
