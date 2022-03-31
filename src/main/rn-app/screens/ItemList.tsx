import {FlatList, StatusBar, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

import { Text, View } from '../components/Themed';
import {Item, ItemExt, RootStackScreenProps} from "../types";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ItemList({ navigation, route }: RootStackScreenProps<'ItemList'>) {
    console.log("route", route);

    const [items, setItems] = useState<Array<ItemExt>>([]);
    const [search, setSearch] = useState("");

    function toItemDataArray(items: Array<Item>) : Array<ItemExt> {
        return items.map(item => ({
            ...item,
            searchableText: item.title.toLowerCase() + " " + item.url + " " + item.notes.toLowerCase()
        }));
    }

    useEffect(() => {
      (async () => {
          try {
              const jsonValue = await AsyncStorage.getItem('credentials')
              const credentials = jsonValue != null ? JSON.parse(jsonValue) : null;
              if (credentials == null) {
                  navigation.navigate('Login');
              } else {
                  console.log("Loading items");
                  const config = {
                      baseURL: credentials.baseUrl,
                      headers: { Authorization: "Bearer " + credentials.token },
                  };
                  const resp = await axios.create(config).post("items/search",
                      {username: credentials.username, tags: null});
                  const items : Array<Item> = resp.data.items;
                  console.log("Loaded items", items.length)
                  items.sort((a,b) => {
                      return a.title.localeCompare(b.title);
                  });
                  setItems(toItemDataArray(items));
              }
          } catch(e) {
              console.log("Error: " + e);
          }
      })();
    }, [route.params?.lastUpdateTime]); // used to force refresh

    const renderItem = (item : Item) => (
        <TouchableOpacity onPress={() => navigation.navigate("ItemEdit", {item})}>
            <ItemRow {...item} />
        </TouchableOpacity>
    );

    return (
    <View style={styles.container}>
        <TextInput style={styles.search} placeholder={"search"}
            value={search} onChangeText={search => setSearch(search)} />
        <FlatList
            data={filteredData(items, search)}
            renderItem={listItem => renderItem(listItem.item)}
            keyExtractor={item => item.id!}
        />
    </View>
  );
}

function filteredData(items: Array<ItemExt>, search: string) : Array<ItemExt> {
    const query = search.trim().toLowerCase();
    console.log("query", query);
    if (!query) {
        return items;
    }
    const parts = query.split(/ +/);
    const positive = wordsAndTags(parts.filter(x => x[0] !== "-"));
    // Negative words and tags (starting with '-'). We will NOT include items that have them.
    const negative = wordsAndTags(parts.filter(x => x[0] === "-").map(x => x.substr(1)));
    return items.filter(it => {
        for (const word of positive.words) {
            if (it.searchableText.indexOf(word) < 0) return false;
        }
        for (const word of negative.words) {
            if (it.searchableText.indexOf(word) >= 0) return false;
        }
        for (const tag of positive.tags) {
            if (it.tags.indexOf(tag) < 0) return false;
        }
        for (const tag of negative.tags) {
            if (it.tags.indexOf(tag) >= 0) return false;
        }
        return true;
    });
}

function wordsAndTags(parts: Array<string>) : QueryParts {
    const words = parts.filter(x => x[0] !== "#");
    const tags = parts.filter(x => x[0] === "#").map(x => x.substr(1));
    return {words, tags};
}

type QueryParts = {
    words: Array<string>;
    tags: Array<string>;
}

const ItemRow : React.FC<Item> = (item: Item) => (
    <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.url}</Text>
        <Text style={styles.text}>{item.tags.join(" ")}</Text>
        <Text style={styles.text}>{item.notes}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    search: {
        color: 'white',
        fontSize: 20,
        marginVertical: 10,
        marginHorizontal: 16,
    },
    item: {
        backgroundColor: '#505050',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 20,
        marginBottom: 6,
    },
    text: {
        fontSize: 16,
        marginBottom: 7,
    },
});

