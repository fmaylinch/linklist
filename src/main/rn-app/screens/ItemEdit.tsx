import {Button, StyleSheet, TextInput} from 'react-native';

import {View} from '../components/Themed';
import {Item, RootStackScreenProps} from "../types";
import React, {useState} from "react";
import { Slider } from "@miblanchard/react-native-slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ItemEdit({ navigation, route }: RootStackScreenProps<'ItemEdit'>) {
  console.log("route", route);

  let item = route.params.item;

  const [title, setTitle] = useState<string>(item.title);
  const [url, setUrl] = useState<string>(item.url);
  const [image, setImage] = useState<string>(item.image);
  const [notes, setNotes] = useState<string>(item.notes);
  const [score, setScore] = useState<number[]>([item.score]);
  const [tags, setTags] = useState<string>(item.tags.join(" "));

  function saveButtonTitle() {
      return item.id === null ? "Create" : "Save";
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
      <Button title={saveButtonTitle()} onPress={async () => {
          const cleanTags = tags.trim().toLowerCase();
          const itemToSave = {
              id: item.id,
              userId: item.userId,
              title: title,
              url: url,
              image: image,
              tags: cleanTags === "" ? [] : cleanTags.split(/[ ,]+/),
              notes: notes,
              score: score[0]
          };

          try {
              console.log("Saving item", itemToSave);
              const savedItem = await saveItem(itemToSave);
              console.log("Saved item", savedItem.id, savedItem.title);
              // TODO: we want to go back and refresh, how could we improve this?
              navigation.navigate('ItemList', {date: new Date()});
          } catch(e) {
              console.log("Error: " + e);
          }
      }} />
    </View>
  );
}

async function saveItem(item: Item) : Promise<Item> {
    // TODO: We do something similar in ItemList.tsx
    //  Here we suppose that credentials always exist.
    const jsonValue = await AsyncStorage.getItem('credentials')
    const credentials = JSON.parse(jsonValue!);
    const config = {
        baseURL: credentials.baseUrl,
        headers: { Authorization: "Bearer " + credentials.token },
    };
    const resp = await axios.create(config).post("items/upsertOne", item);
    return resp.data;
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
        margin: '5px',
        padding: '5px',
        width: '100%',
    },
    slider: {
        margin: '5px',
        padding: '5px',
        width: '100%',
    }
});
