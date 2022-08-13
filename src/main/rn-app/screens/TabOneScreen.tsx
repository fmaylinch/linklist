import { Text, View } from '../components/Themed';
import {Credentials, RootTabScreenProps} from '../types';
import styles from './styles';
import {Button} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {useEffect, useState} from "react";

export default function TabOneScreen({ navigation, route }: RootTabScreenProps<'TabOne'>) {
  console.log("route", route.name);

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
      (async () => {
          const json = await AsyncStorage.getItem('credentials')
          const credentials: Credentials|null = json != null ? JSON.parse(json) : null;
          if (credentials != null) {
              // TODO: Update this when we login
              setMessage("API: " + credentials.baseUrl);
          }
      })();
  }, []);

  return (
  <View style={styles.container}>
    <Button
        title={"Open items from API"}
        onPress={() => {
            setMessage('');
            navigation.navigate("ItemList", {lastUpdateTime: new Date().getTime()});
        }}
    />
    <Button
        title={"Open items from local storage"}
        onPress={() => {
            setMessage('');
            navigation.navigate("ItemList", {lastUpdateTime: new Date().getTime(), loadItemsFromLocalStorage: true});
        }}
    />
    <Button
        title={"Logout"}
        onPress={async () => {
            try {
                await AsyncStorage.removeItem('credentials');
                setMessage('Logged out');
            } catch (e) {
                setMessage('Error on logout: ' + e);
            }
        }}
    />
    <Text style={{marginTop: 10}}>{message}</Text>
  </View>
  );
}
