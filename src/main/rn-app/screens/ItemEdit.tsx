import {Button, StyleSheet, TextInput} from 'react-native';

import {View} from '../components/Themed';
import {Item, RootStackScreenProps} from "../types";
import React, {useState} from "react";
import {Slider} from "@miblanchard/react-native-slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ItemEdit({ navigation, route }: RootStackScreenProps<'ItemEdit'>) {
    console.log("route", route.name);

    let item = route.params.item;
    let editingItem = !!item.id;

    const [title, setTitle] = useState<string>(item.title);
    const [url, setUrl] = useState<string>(item.url);
    const [image, setImage] = useState<string>(item.image);
    const [notes, setNotes] = useState<string>(item.notes);
    const [score, setScore] = useState<number[]>([item.score]);
    const [tags, setTags] = useState<string>(item.tags.join(" "));

    function saveButtonTitle() {
      return editingItem ? "Save" : "Create";
    }

    async function deleteButtonAction() {
      const deletedItem = await deleteItem(item.id!);
      console.log("Deleted item", deletedItem.id, deletedItem.title);
      goBackToList();
    }

    function prepareItemToSave(): Item {
        return {
            id: item.id,
            localId: item.localId,
            userId: item.userId,
            title: title,
            url: url,
            image: image,
            tags: tags.trim() ? tags.trim().toLowerCase().split(/[ ,]+/) : [],
            notes: notes,
            score: score[0]
        };
    }

    async function saveButtonAction() {
        const itemToSave = prepareItemToSave();
        removeLocalTag(itemToSave);
        try {
          console.log("Saving item", itemToSave);
          const savedItem = await saveItem(itemToSave);
          console.log("Saved item", savedItem.id, savedItem.title);
          if (itemToSave.localId) {
              deleteItemLocally(itemToSave.localId!);
          }
          goBackToList();
      } catch(e) {
          console.log("Error: " + e);
      }
    }

    async function saveLocalButtonAction() {
        const itemToSave = prepareItemToSave();
        addLocalTag(itemToSave);
        try {
            console.log("Saving item locally", itemToSave);
            await saveItemLocally(itemToSave);
            goBackToList(true);
      } catch(e) {
          console.log("Error: " + e);
      }
    }

    function goBackToList(itemSavedLocally: boolean = false) {
        navigation.navigate('ItemList', {
            lastUpdateTime: new Date().getTime(),
            loadItemsFromLocalStorage: itemSavedLocally
        });
    }

    async function getMetadataButtonAction() {
      const cleanUrl = url.trim();
      if (!cleanUrl) {
          return;
      }
      const axiosInstance = await prepareAxios();
      const resp = await axiosInstance.post("metadata/getFromUrl", {url: cleanUrl});
      const scrappedItem : Item = resp.data;
      if (scrappedItem) {
          if (!title && scrappedItem.title) { // keep existing title
              setTitle(scrappedItem.title);
          }
          if (tags.length == 0 && scrappedItem.tags) { // keep existing tags
              setTags(scrappedItem.tags.join(" "));
          }
          if (scrappedItem.image) {
              setImage(scrappedItem.image)
          }
          if (scrappedItem.notes) {
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

    return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder={"title"} value={title} onChangeText={title => setTitle(title)} />
      <TextInput style={styles.input} placeholder={"url"} value={url} onChangeText={setUrl} />
      <TextInput style={styles.input} placeholder={"image"} value={image} onChangeText={setImage} />
      <TextInput style={styles.input} placeholder={"tags"} value={tags} onChangeText={setTags} />
      <View style={styles.slider}>
          <Slider
              step={1} minimumValue={0} maximumValue={100}
              value={score} onValueChange={s => setScore(s as number[])} />
      </View>
      <TextInput style={styles.input} placeholder={"notes"} value={notes}
          onChangeText={setNotes}
          multiline={true}
          // Check this solution, because calcNoteLines doesn't always equal
          // to the lines actually displayed (there may be line wraps).
          // https://medium.com/@manojsinghnegi/react-native-auto-growing-text-input-8638ac0931c8
          numberOfLines={calcNoteLines(notes) + 1} // Add extra lines as margin and workaround
      />
      <Button title={saveButtonTitle()} onPress={saveButtonAction} />
      <Button title={"Save locally"} onPress={saveLocalButtonAction} />
      <Button title={"Get metadata from url"} onPress={getMetadataButtonAction} />
      {editingItem &&
          <Button color={"red"} title={"Delete"} onPress={deleteButtonAction} />
      }
    </View>
  );
}

async function saveItem(item: Item) : Promise<Item> {
    const axiosInstance = await prepareAxios();
    const resp = await axiosInstance.post("items/upsertOne", item);
    return resp.data;
}

async function deleteItem(itemId : string) : Promise<Item> {
    const axiosInstance = await prepareAxios();
    const resp = await axiosInstance.post("items/deleteOne", {id: itemId});
    return resp.data;
}

// TODO this is also used in ItemList.tsx
const pendingItemsKey = "pendingItems";

async function saveItemLocally(itemToSave: Item) {
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
            pendingItems.push(itemToSave);
        }
    } else {
        itemToSave.localId = new Date().getTime().toString();
        console.log("Adding item with localId: " + itemToSave.localId)
        pendingItems.push(itemToSave);
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

const localTag = "local";

function addLocalTag(item: Item) {
    if (item.tags.indexOf(localTag) < 0) {
        item.tags.push(localTag); // add this tag just to mark the item as saved locally
    }
}

function removeLocalTag(item: Item) {
    let index = item.tags.indexOf(localTag);
    if (index >= 0) {
        item.tags.splice(index, 1);
    }
}

async function prepareAxios() {
    // TODO: We do something similar in ItemList.tsx
    //  Here we suppose that credentials always exist.
    const jsonValue = await AsyncStorage.getItem('credentials')
    const credentials = JSON.parse(jsonValue!);
    const config = {
        baseURL: credentials.baseUrl,
        headers: {Authorization: "Bearer " + credentials.token},
    };
    let axiosInstance = axios.create(config);
    return axiosInstance;
}

function calcNoteLines(notes: string) {
    // https://stackoverflow.com/a/43820645/1121497
    return (notes.match(/\n/g) || '').length + 1;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    input: {
        color: "#fff",
        backgroundColor: '#343434',
        margin: 5,
        padding: 5,
        width: '100%',
    },
    slider: {
        margin: 5,
        padding: 5,
        width: '100%',
    }
});
