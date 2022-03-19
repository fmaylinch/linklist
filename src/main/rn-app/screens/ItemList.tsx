import {FlatList, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';

import { Text, View } from '../components/Themed';
import {Item, RootStackScreenProps} from "../types";
import React, {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ItemList({ navigation, route }: RootStackScreenProps<'ItemList'>) {
  console.log(route);

  const [data, setData] = useState<Array<Item>>([]);

  useEffect(() => {
      (async () => {
          try {
              const jsonValue = await AsyncStorage.getItem('credentials')
              const credentials = jsonValue != null ? JSON.parse(jsonValue) : null;
              if (credentials == null) {
                  navigation.navigate('Login');
              } else {
                  console.log("Loading data");
                  const config = {
                      baseURL: credentials.baseUrl,
                      headers: { Authorization: "Bearer " + credentials.token },
                  };
                  const resp = await axios.create(config).post("items/search",
                      {username: credentials.username, tags: null});
                  const items : Array<Item> = resp.data.items;
                  items.sort((a,b) => {
                      return a.title.localeCompare(b.title);
                  });
                  setData(items);
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
        <FlatList
            data={data}
            renderItem={p => renderItem(p.item)}
            keyExtractor={item => item.id}
        />
    </View>
  );
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
    item: {
        backgroundColor: '#505050',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 20,
        marginBottom: '5px',
    },
    text: {
        fontSize: 16,
        marginBottom: '5px',
    },
});

