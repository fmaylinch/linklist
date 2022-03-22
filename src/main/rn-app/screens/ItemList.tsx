import {FlatList, StatusBar, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

import { Text, View } from '../components/Themed';
import {Item, ItemData, RootStackScreenProps} from "../types";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ItemList({ navigation, route }: RootStackScreenProps<'ItemList'>) {
  console.log("route", route);

  const [data, setData] = useState<Array<ItemData>>([]);
  const [search, setSearch] = useState("");

    function toItemDataArray(items: Array<Item>) : Array<ItemData> {

        // TODO: temporal quick way to search #tags, but better use a Set like I did in Vue
        function searchableTags(tags: Array<string>) {
            return tags.length == 0 ? "" :
                " #" + tags.join(" #");
        }

        return items.map(item => ({
            item: item,
            searchableText: item.title.toLowerCase() + searchableTags(item.tags)
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
                  setData(toItemDataArray(items));
              }
          } catch(e) {
              console.log("Error: " + e);
          }
      })();
  }, [route.params?.date]); // date can be used to force refresh

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
            data={filteredData(data, search)}
            renderItem={itemInfo => renderItem(itemInfo.item.item)} // first item is from a RN type
            keyExtractor={itemData => itemData.item.id!}
        />
    </View>
  );
}

function filteredData(data: Array<ItemData>, search: string) : Array<ItemData> {
    const cleanSearch = search.trim().toLowerCase();
    return data.filter(itemData => itemData.searchableText.indexOf(cleanSearch) >= 0);
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

