import {Button, StyleSheet, TextInput} from 'react-native';

import {View} from '../components/Themed';
import {RootStackScreenProps} from "../types";
import React, {useState} from "react";

export default function ItemEdit({ navigation, route }: RootStackScreenProps<'ItemEdit'>) {
  console.log(route);

    let item = route.params.item;

    const [title, setTitle] = useState<string>(item?.title || "");
    const [url, setUrl] = useState<string>(item?.url || "");
    const [image, setImage] = useState<string>(item?.image || "");
    const [notes, setNotes] = useState<string>(item?.notes || "");
    const [noteLines, setNoteLines] = useState<number>(calcNoteLines(item?.notes || ''));
    const [score, setScore] = useState<number>(item?.score || 50);
    const [tags, setTags] = useState<string>(item?.tags.join(" ") || "");

    function calcNoteLines(notes: string) {
        // https://stackoverflow.com/a/43820645/1121497
        return (notes.match(/\n/g) || '').length + 1;
    }

    return (
    <View style={styles.container}>
        <TextInput style={styles.input} placeholder={"title"} value={title} onChangeText={title => setTitle(title)} />
        <TextInput style={styles.input} placeholder={"url"} value={url} onChangeText={setUrl} />
        <TextInput style={styles.input} placeholder={"image"} value={image} onChangeText={setImage} />
        <TextInput style={styles.input} placeholder={"tags"} value={tags} onChangeText={setTags} />
        <TextInput style={styles.input} placeholder={"notes"} value={notes}
            onChangeText={notes => {
                setNotes(notes);
                setNoteLines(calcNoteLines(notes))
            }}
            multiline={true}
            // Check this solution, because calcNoteLines doesn't always equal
            // to the lines actually displayed (there may be line wraps).
            // https://medium.com/@manojsinghnegi/react-native-auto-growing-text-input-8638ac0931c8
            numberOfLines={noteLines}
        />
        <Button title={"Save"} onPress={() => {}} />
    </View>
  );
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
    }
});
