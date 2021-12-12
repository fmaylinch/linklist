package com.codethen.linklist.metadata;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
            if (url.contains("spotify.com/") && url.contains("?si=")) {
                // Remove Spotify query params
                url = url.substring(0, url.indexOf("?si="));
            }

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

        var tags = new ArrayList<>(List.of("music", "top"));

        if (doc.title().endsWith(SPOTIFY_SUFFIX)) {
            // Example: Mezzanine - Album by Massive Attack | Spotify
            var titleAndArtist = doc.title().substring(0, doc.title().length() - SPOTIFY_SUFFIX.length());
            var notes = getMeta(doc, "og:description");
            if (titleAndArtist.contains(ALBUM_SEPARATOR)) {
                // Example: Mezzanine - Album by Massive Attack
                builder.title(buildSpotifyTitle(titleAndArtist, ALBUM_SEPARATOR));
                builder.notes(processSpotifyNotes(notes, " · Album · ")); // Massive Attack · Album · 1998 · 11 songs.
                tags.add("album");
            } else if (titleAndArtist.contains(SONG_SEPARATOR)) {
                // Example: A Life So Beautiful - Extended Mix - song by Costa, Katty Heath
                builder.title(buildSpotifyTitle(titleAndArtist, SONG_SEPARATOR));
                builder.notes(processSpotifyNotes(notes, " · Song · ")); // Costa · Song · 2021
                tags.add("song");
            }
        }

        builder.tags(tags);
    }

    private String processSpotifyNotes(String notes, String separator) {
        if (notes == null || !notes.contains(separator)) return notes;
        return notes.substring(notes.indexOf(separator) + separator.length());
    }

    private static final String ALBUM_SEPARATOR = " - Album by ";
    private static final String SONG_SEPARATOR = " - song by ";
    private static final String SPOTIFY_SUFFIX = " | Spotify";

    private String buildSpotifyTitle(String titleAndArtist, String separator) {
        var parts = titleAndArtist.split(separator);
        var title = parts[0];
        var artist = parts[1];
        return artist + " - " + title;
    }

    private void fillFromImdb(Document doc, Item.ItemBuilder builder) {

        String json = doc.select("script[type='application/ld+json']").get(0).data();
        Map<?, ?> map = new Gson().fromJson(json, Map.class);

        builder.title((String) map.get("name"));
        String type = (String) map.get("@type");
        builder.tags(List.of(type.toLowerCase()));

        final Object aggregateRating = map.get("aggregateRating");
        if (aggregateRating instanceof Map) {
            final Number ratingValue = (Number) ((Map<?, ?>) aggregateRating).get("ratingValue");
            builder.score((int) (ratingValue.doubleValue() * 10));
        }

        try {
            final String notes = buildImdbNotes(map);
            builder.notes(notes);
        } catch (Exception e) {
            // leave standard notes
        }
    }

    private String buildImdbNotes(Map<?, ?> map) {
        final String directors = getImdbPeople(map, "director");
        final String actors = getImdbPeople(map, "actor");
        final Object genres = ((List) map.get("genre")).stream().collect(Collectors.joining(", "));

        String duration = (String) map.get("duration");
        if (duration.startsWith("PT")) {
            duration = duration.substring(2).toLowerCase();
        }

        final String notes = directors + ". " +
                map.get("datePublished") + ". " +
                duration + ". " +
                genres + ". " +
                actors + ".";
        return notes;
    }

    private String getImdbPeople(Map<?, ?> map, String key) {
        return ((List<?>) map.get(key)).stream()
                .map(x -> (String) ((Map) x).get("name"))
                .collect(Collectors.joining(", "));
    }

    @Nullable
    private static String getMeta(Document doc, String name) {
        final Element element = doc
                .select("meta[property='" + name + "']")
                .first();
        return element == null ? null : element.attr("content");
    }
}
