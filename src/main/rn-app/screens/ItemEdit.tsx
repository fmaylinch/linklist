import {
    Button, Dimensions, Linking, ScrollView, StyleSheet,
    Text, TextInput, Alert} from 'react-native';
import Image from 'react-native-scalable-image';
import {View} from '../components/Themed';
import {Item, RootStackScreenProps} from "../types";
import React, {useState} from "react";
import {Slider} from "@miblanchard/react-native-slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {apiService} from "../service/ApiService";
import * as cheerio from 'cheerio';
import {CheerioAPI} from 'cheerio';
import axios from "axios";

export default function ItemEdit({ navigation, route }: RootStackScreenProps<'ItemEdit'>) {
    console.log("route", route.name);

    let item = route.params.item;
    let editingItem = !!item.id;

    const [title, setTitle] = useState<string>(item.title);
    const [author, setAuthor] = useState<string>(item.author || "");
    const [url, setUrl] = useState<string>(item.url);
    const [image, setImage] = useState<string>(item.image);
    const [notes, setNotes] = useState<string>(item.notes);
    const [score, setScore] = useState<number[]>([item.score]);
    const [tags, setTags] = useState<string>(item.tags.join(" "));

    function saveButtonTitle() {
        return editingItem ? "Save" : "Create";
    }

    function saveLocalButtonTitle() {
        return item.localId ? "Save" : "Create";
    }

    function prepareItemToSave(): Item {
        return {
            id: item.id,
            localId: item.localId,
            userId: item.userId,
            title: title,
            author: author,
            url: url,
            image: image,
            tags: tags.trim() ? tags.trim().toLowerCase().split(/[ ,]+/) : [],
            notes: notes,
            score: score[0]
        };
    }

    async function saveButtonAction() {
        try {
            const itemToSave = prepareItemToSave();
            await saveItem(itemToSave);
            if (itemToSave.localId) {
                await deleteItemLocally(itemToSave.localId!);
            }
            goBackToList();
        } catch (e) {
            Alert.alert("Error saving item", `${e}`);
        }
    }

    async function saveLocalButtonAction() {
        const itemToSave = prepareItemToSave();
        await saveItemLocally(itemToSave);
        goBackToList(true);
    }

    async function deleteButtonAction() {
        await deleteItem(item.id!);
        goBackToList();
    }

    async function deleteLocallyButtonAction() {
        await deleteItemLocally(item.localId!);
        goBackToList(true);
    }

    function goBackToList(itemModifiedLocally: boolean = false) {
        navigation.navigate('ItemList', {
            lastUpdateTime: new Date().getTime(),
            loadItemsFromLocalStorage: itemModifiedLocally
        });
    }

    function openUrl() {
        if (url) {
            Linking.openURL(url);
        }
    }

    async function retrieveMetadataFromUrl() {
        if (!url) {
            return;
        }
        // Scrap locally, so we don't need server connection
        const resp = await scrapUrl(url)
        //const resp = await apiService.axios().post("metadata/getFromUrl", {url});
        const scrappedItem : Item | undefined = resp.data;
        if (scrappedItem) {
            if (!title && scrappedItem.title) {
                setTitle(scrappedItem.title);
            }
            if (!author && scrappedItem.author) {
                setAuthor(scrappedItem.author);
            }
            if (tags.length == 0 && scrappedItem.tags) {
                setTags(scrappedItem.tags.join(" "));
            }
            if (!image && scrappedItem.image) {
                setImage(scrappedItem.image)
            }
            if (!notes && scrappedItem.notes) {
                setNotes(scrappedItem.notes)
            }
            if (scrappedItem.score) {
                setScore([scrappedItem.score])
            }
            if (scrappedItem.url) {
                setUrl(scrappedItem.url)
            }
        }
    }

    const urlButtonColor = url ? "#099" : "#003333";
    const placeHolderColor = '#444';

    // Higher score is more green, lower score is more red.
    // When the score is in the middle, it will be a bit blue.
    const greenWeight = Math.max(0, Math.round((score[0]-10)/10));
    const redWeight = Math.max(0, 7 - greenWeight);
    const blueWeight = Math.max(0, 6 - Math.abs(6 - greenWeight));
    const sliderColor = "#" + redWeight + greenWeight + blueWeight;

    return (
        <ScrollView>
            <View style={styles.container}>
                {image ? <Image source={{uri: image}} width={Dimensions.get('window').width - 10} /> : <View/>}
                <View style={{height: 20}} />
                <TextInput style={styles.input} placeholderTextColor={placeHolderColor} placeholder={"title"} value={title} onChangeText={title => setTitle(title)} />
                <TextInput style={styles.input} placeholderTextColor={placeHolderColor} placeholder={"author"} value={author} onChangeText={author => setAuthor(author)} />
                <TextInput style={styles.input} placeholderTextColor={placeHolderColor} placeholder={"url"} value={url} onChangeText={setUrl} />
                <View style={{flex:1, flexDirection:"row"}}>
                    <Button title={"Open url"} color={urlButtonColor} onPress={openUrl} />
                    <View style={{width: 20}}/>
                    <Button title={"Get metadata"} color={urlButtonColor} onPress={retrieveMetadataFromUrl} />
                </View>
                <TextInput style={styles.input} placeholderTextColor={placeHolderColor} placeholder={"image"} value={image} onChangeText={setImage} />
                <TextInput style={styles.input} placeholderTextColor={placeHolderColor} placeholder={"tags"} value={tags} onChangeText={setTags} />
                <View style={styles.slider}>
                  <Slider
                      thumbTintColor={sliderColor}
                      minimumTrackTintColor={sliderColor}
                      maximumTrackTintColor={sliderColor}
                      step={1} minimumValue={0} maximumValue={100}
                      value={score} onValueChange={s => setScore(s as number[])} />
                </View>
                <Text style={styles.sliderText}>{score}</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={placeHolderColor}
                    placeholder={"notes"} value={notes}
                    onChangeText={setNotes}
                    multiline={true}
                    // Check this solution, because calcNoteLines doesn't always equal
                    // to the lines actually displayed (there may be line wraps).
                    // https://medium.com/@manojsinghnegi/react-native-auto-growing-text-input-8638ac0931c8
                    numberOfLines={calcNoteLines(notes) + 1} // Add extra lines as margin and workaround
                />
                <Button title={saveButtonTitle()} color={"#a079c2"} onPress={saveButtonAction} />
                <Text style={styles.text}>ID: {item.id}</Text>
                <Button title={saveLocalButtonTitle() + " locally"} color={"#aac01f"} onPress={saveLocalButtonAction} />
                <Text style={styles.text}>local ID: {item.localId}</Text>
                {(editingItem || item.localId) &&
                    <View style={styles.dangerZone}>
                        {editingItem &&
                            <Button color={"#d70202"} title={"Delete"} onPress={deleteButtonAction} />
                        }
                        {item.localId &&
                            <Button color={"#d94112"} title={"Delete locally"} onPress={deleteLocallyButtonAction} />
                        }
                    </View>
                }
                {/* dummy margin, because notes input might get hidden behind the keyboard */}
                <View style={{height: 200}} />
            </View>
        </ScrollView>
  );
}

async function scrapUrl(url: string) : Promise<{data?: Item}> {
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
            score: 50
        };

        if (url.indexOf("youtube.com/") >= 0) {
            fillFromYoutube(item);
        } else if (url.indexOf("music.yandex.com/") >= 0) {
            fillFromYandexMusic(item);
        } else if (url.indexOf(".imdb.com/") >= 0) {
            fillFromImdb($, item);
        }

        console.log("item: ", item);

        return {data: item};

    } catch (e) {
        Alert.alert("Error scrapping url", `Url: ${url}\n\n${e}`);
    }

    return {data: undefined};
}

const musicYoutubeLink = "https://music.youtube.com/watch?v=";
const youtubeSuffix = " - YouTube Music";

function fillFromYoutube(item: Item) {
    if (item.title.endsWith(youtubeSuffix)) {
        item.title = item.title.substring(0, item.title.length - youtubeSuffix.length)
    }
    item.tags = ["music", "top", "dance", "song"];
    item.notes = ""; // useless
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
            duration = duration.substring(2).toLowerCase() + ". ";
        } else {
            duration = "";
        }
        item.notes = obj["datePublished"] + ". " + duration + "With " + actors + ".";
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

async function saveItem(item: Item) : Promise<Item> {
    console.log("Saving item", item);
    const resp = await apiService.axios().post("items/upsertOne", item);
    let savedItem = resp.data;
    console.log("Saved item", savedItem.id, savedItem.title);
    return savedItem;
}

async function deleteItem(itemId : string) : Promise<Item> {
    console.log("Deleting item with id", itemId);
    const resp = await apiService.axios().post("items/deleteOne", {id: itemId});
    let deletedItem = resp.data;
    console.log("Deleted item", deletedItem.id, deletedItem.title);
    return deletedItem;
}

// TODO this is also used in ItemList.tsx
const pendingItemsKey = "pendingItems";

async function saveItemLocally(itemToSave: Item) {
    console.log("Saving item locally", itemToSave);
    const json = await AsyncStorage.getItem(pendingItemsKey);
    const pendingItems: Array<Item> = json != null ? JSON.parse(json) : [];
    if (itemToSave.localId) {
        // Replace item if already present
        const foundIndex = pendingItems.findIndex(item => item.localId === itemToSave.localId);
        if (foundIndex >= 0) {
            console.log("Updating item with localId: " + itemToSave.localId)
            pendingItems[foundIndex] = itemToSave;
        } else {
            console.log("Adding item because, unexpectedly, we didn't find the localId: " + itemToSave.localId)
            pendingItems.unshift(itemToSave);
        }
    } else {
        itemToSave.localId = new Date().getTime().toString();
        console.log("Adding item with localId: " + itemToSave.localId)
        pendingItems.unshift(itemToSave);
    }
    await AsyncStorage.setItem(pendingItemsKey, JSON.stringify(pendingItems));
}

async function deleteItemLocally(itemLocalId: string) {
    const json = await AsyncStorage.getItem(pendingItemsKey);
    const pendingItems: Array<Item> = json != null ? JSON.parse(json) : [];
    const foundIndex = pendingItems.findIndex(item => item.localId === itemLocalId);
    if (foundIndex >= 0) {
        console.log("Deleting item with localId: " + itemLocalId)
        pendingItems.splice(foundIndex, 1);
        await AsyncStorage.setItem(pendingItemsKey, JSON.stringify(pendingItems));
    } else {
        console.log("Unexpectedly, we didn't find the item with localId: " + itemLocalId)
    }
}

function calcNoteLines(notes: string) {
    // https://stackoverflow.com/a/43820645/1121497
    return (notes.match(/\n/g) || '').length + 1;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 5,
    },
    dangerZone: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        backgroundColor: '#380000',
        borderTopWidth: 2,
        borderTopColor: "#6e0000",
        borderBottomWidth: 2,
        borderBottomColor: "#6e0000",
        marginTop: 20,
        marginBottom: 40,
    },
    input: {
        color: "#aaa",
        backgroundColor: '#171717',
        marginTop: 10,
        padding: 10,
        width: '100%',
    },
    text: {
        color: "#444",
        marginBottom: 5,
        padding: 5,
    },
    sliderText: {
        color: "#444",
        marginTop: -15,
    },
    slider: {
        margin: 5,
        padding: 5,
        width: '100%',
    },
});
