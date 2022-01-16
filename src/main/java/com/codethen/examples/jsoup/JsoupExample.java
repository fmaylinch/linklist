package com.codethen.examples.jsoup;

import com.codethen.linklist.items.Item;
import com.codethen.linklist.metadata.MetadataScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import org.jsoup.nodes.Element;

public class JsoupExample {

    public static void main(String[] args) throws Exception {

        String url;
        //url = "https://www.deezer.com/en/album/136268022"; // Album
        url = "https://deezer.page.link/s1MmF4f8Db8ta8nC6"; // Album
        //url = "https://www.deezer.com/en/track/1553999772"; // Song
        //url = "https://deezer.page.link/34s9JjZrdrwqGNnE8"; // Song

        if (url.contains("spotify.com/") && url.contains("?si=")) {
            // Remove Spotify query params
            url = url.substring(0, url.indexOf("?si="));
        }

        Document doc = Jsoup.connect(url).header("Accept-Language", "en-US").get();
        String title = doc.title();
        System.out.println(title);

        System.out.println(getMeta(doc, "property", "og:title"));
        System.out.println(getMeta(doc, "property", "og:image"));
        System.out.println(getMeta(doc, "property", "og:type"));
        System.out.println(getMeta(doc, "property", "og:url"));
        System.out.println(getMeta(doc, "property", "og:description"));
        System.out.println(getMeta(doc, "name", "twitter:title"));
        System.out.println(getMeta(doc, "name", "twitter:creator"));
        System.out.println(getMeta(doc, "name", "twitter:audio:artist_name"));
        System.out.println(getMeta(doc, "name", "twitter:description"));
        System.out.println(getMeta(doc, "name", "twitter:artist_name"));

        final MetadataScraper metadataScraper = new MetadataScraper();
        final Item item = metadataScraper.itemDataFromUrl(url);
        System.out.println(item);

        System.out.println();
        //System.out.println(doc);
    }

    private static String getMeta(Document doc, String metaType, String name) {
        final Element element = doc
                .select("meta[" + metaType + "='" + name + "']")
                .first();
        return name + ": " + (element == null ? null : element.attr("content"));
    }
}
