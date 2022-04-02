import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import styles from './styles';
import {Button} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {useState} from "react";

export default function TabOneScreen({ navigation, route }: RootTabScreenProps<'TabOne'>) {
  console.log("route", route.name);

  const [message, setMessage] = useState<string>('');

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
    <Text>{message}</Text>
  </View>
  );
}
