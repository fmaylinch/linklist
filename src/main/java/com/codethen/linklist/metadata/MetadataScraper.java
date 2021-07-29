package com.codethen.linklist.metadata;

import java.util.List;
import java.util.Map;

import com.codethen.linklist.items.Item;
import com.google.gson.Gson;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import javax.annotation.Nullable;
import javax.inject.Singleton;

@Singleton
public class MetadataScraper {

    @Nullable
    public Item itemDataFromUrl(String url) {
        try {
            final Document doc = Jsoup.connect(url).header("Accept-Language", "en-US").get();

            final String title = getMeta(doc, "og:title");

            final Item.ItemBuilder builder = Item.builder()
                    .title(title != null ? title : doc.title())
                    .url(url)
                    .image(getMeta(doc, "og:image"))
                    .notes(getMeta(doc, "og:description"))
                    .score(Item.DEFAULT_SCORE);

            if (url.contains(".imdb.com/")) {
                fillFromImdb(doc, builder);
            } else if (url.contains("spotify.com/")) {
                fillFromSpotify(doc, builder);
            }

            return builder.build();

        } catch (Exception e) {
            return null;
        }
    }

    private void fillFromSpotify(Document doc, Item.ItemBuilder builder) {

        builder.title(getMeta(doc, "twitter:audio:artist_name") + " - " + getMeta(doc, "og:title"));
        builder.tags(List.of("spotify", "music", "top"));
    }

    private void fillFromImdb(Document doc, Item.ItemBuilder builder) {

        String json = doc.select("script[type='application/ld+json']").get(0).data();
        Map<?, ?> map = new Gson().fromJson(json, Map.class);

        builder.title((String) map.get("name"));
        String type = (String) map.get("@type");
        builder.tags(List.of("imdb", type.toLowerCase()));

        final Object aggregateRating = map.get("aggregateRating");
        if (aggregateRating instanceof Map) {
            final Number ratingValue = (Number) ((Map<?, ?>) aggregateRating).get("ratingValue");
            builder.score((int) (ratingValue.doubleValue() * 10));
        }
    }

    @Nullable
    private static String getMeta(Document doc, String name) {
        final Element element = doc
                .select("meta[property='" + name + "']")
                .first();
        return element == null ? null : element.attr("content");
    }
}
