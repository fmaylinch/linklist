package com.codethen.examples.jsoup;

import com.codethen.linklist.items.Item;
import com.codethen.linklist.metadata.MetadataScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import org.jsoup.nodes.Element;

public class JsoupExample {

    public static void main(String[] args) throws Exception {

        String url;
        url = "https://youtu.be/X1chQvB1tfw"; // YouTube song
        url = "https://www.youtube.com/watch?v=X1chQvB1tfw"; // YouTube song
        //url = "https://music.youtube.com/watch?v=fP6ax3q_Wkk&feature=share"; // listen in YouTube Music
        //url = "https://music.youtube.com/watch?v=X1chQvB1tfw"; // made up link that works (using YouTube ID)


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
