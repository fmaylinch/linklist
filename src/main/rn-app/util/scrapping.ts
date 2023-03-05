import {Item} from "../types";
import axios from "axios";
import * as cheerio from "cheerio";
import {CheerioAPI} from "cheerio";
import {Alert} from "react-native";

export async function scrapUrl(url: string) : Promise<{data?: Item}> {
    try {
        url = fixUrlForMetadata(url);
        console.log("Trying to load url: " + url);
        const resp = await axios.get(url);
        const html = resp.data;
        //console.log(html);
        const $ = cheerio.load(html);

        const titleMeta = getMeta($, "property", "og:title");
        const titleHtml = $('head > title').text();

        const item : Item = {
            title: titleMeta || titleHtml,
            author: "",
            url: url,
            tags: [],
            image: getMeta($, "property", "og:image"),
            notes: getMeta($, "property", "og:description"),
            score: 0
        };

        if (url.indexOf("youtube.com/") >= 0) {
            fillFromYoutube(item);
        } else if (url.indexOf("spotify.com/") >= 0) {
            fillFromSpotify($, item);
        } else if (url.indexOf("music.yandex.com/") >= 0) {
            fillFromYandexMusic(item);
        } else if (url.indexOf("music.apple.com/") >= 0) {
            fillFromAppleMusic(item);
        } else if (url.indexOf(".imdb.com/") >= 0) {
            fillFromImdb($, item);
        } else if (url.indexOf(".steampowered.com/") >= 0) {
            fillFromSteam(item);
        }

        console.log("item: ", item);

        return {data: item};

    } catch (e) {
        Alert.alert("Error scrapping url", `Url: ${url}\n\n${e}`);
    }

    return {data: undefined};
}

const musicYoutubeLink = "https://music.youtube.com/watch?v=";

function fillFromYoutube(item: Item) {
    item.title = removeSuffix(" - YouTube Music", item.title);
    item.tags = ["music", "top", "dance", "song"];
    item.notes = ""; // useless
}

function fillFromSteam(item: Item) {
    item.title = removeSuffix(" on Steam", item.title);
    item.tags = ["computer", "game", "indie"];
}

function fillFromSpotify($: CheerioAPI, item: Item) {
    const authorPrefix = "song and lyrics by ";
    item.author = $('head > title').text();
    const authorIndex = item.author.indexOf(authorPrefix);
    if (authorIndex >= 0) {
        item.author = item.author.substr(authorIndex + authorPrefix.length);
    }
    item.author = removeSuffix(" | Spotify", item.author);
    item.tags = ["music", "top", "dance", "song"];
    item.notes = ""; // useless
}

function removeSuffix(suffix: string, str: string) {
    if (str.endsWith(suffix)) {
        return str.substr(0, str.length - suffix.length)
    }
    return str;
}

function fillFromYandexMusic(item: Item) {
    const queryParamsIndex = item.url.indexOf("?");
    if (queryParamsIndex >= 0) {
        item.url = item.url.substring(0, queryParamsIndex);
    }

    const albumWord = " альбом ";
    const albumWordIndex = item.title.indexOf(albumWord);
    if (albumWordIndex > 0) {
        item.author = item.title.substring(0, albumWordIndex);
        item.title = item.title.substring(albumWordIndex + albumWord.length);
    }

    let listenOnlineWordIndex = item.title.indexOf(" слушать онлайн");
    if (listenOnlineWordIndex > 0) {
        item.title = item.title.substring(0, listenOnlineWordIndex);
    }

    item.tags = ["music", "top", "album"];
    item.notes = ""; // useless
}

function fillFromAppleMusic(item: Item) {
    const byIndex = item.title.lastIndexOf(" by ");
    if (byIndex > 0) {
        item.author = item.title.substring(byIndex + " by ".length);
        item.title = item.title.substring(0, byIndex);
    }

    item.tags = ["music", "top", "album"];
    item.notes = "";
}

function fillFromImdb($: CheerioAPI, item: Item) {
    const json = $('script[type="application/ld+json"]').first().html();
    if (!json) {
        return;
    }
    const obj = JSON.parse(json);
    // console.log(obj);

    if (obj["director"]) {
        item.author = obj["director"].map((x:any) => x.name).join(", ");
    } else if (obj["creator"]) {
        item.author = obj["creator"].filter((x:any) => x["@type"] === "Person").map((x:any) => x.name).join(", ");
    }
    if (obj["actor"]) {
        const actors = obj["actor"].map((x:any) => x.name).join(", ");
        let duration = obj["duration"];
        if (duration && duration.startsWith("PT")) {
            duration = duration.substring(2).toLowerCase() + " / ";
        } else {
            duration = "";
        }
        item.notes = obj["datePublished"] + " / " + duration + actors;
    }

    item.title = obj["name"];

    const type = obj["@type"].toLowerCase();
    item.tags = [type, "watch"];
    if (type != "movie") {
        item.tags.unshift("movie");
    }

    const aggregateRating = obj["aggregateRating"];
    if (typeof aggregateRating === "object") {
        const ratingValue = aggregateRating["ratingValue"] as number;
        item.score = ratingValue * 10;
    }
}

function fixUrlForMetadata(url: string) {
    if (url.startsWith(musicYoutubeLink)) {
        // Get metadata from YouTube, because from YouTube Music we don't have the correct metadata
        let videoId = url.substring(musicYoutubeLink.length);
        const indexOtherParams = videoId.indexOf("&");
        if (indexOtherParams >= 0) {
            videoId = videoId.substring(0, indexOtherParams); // strip other params
        }
        url = musicYoutubeLink + videoId; // Use long url for now
    }
    return url;
}

function getMeta($: CheerioAPI, metaType: string, name: string) : string {
    let selector = "meta[" + metaType + "='" + name + "']";
    return $(selector).first().attr("content") || "";
}
