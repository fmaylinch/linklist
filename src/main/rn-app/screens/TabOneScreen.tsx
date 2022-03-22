import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import styles from './styles';
import {Button} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {useState} from "react";

export default function TabOneScreen({ navigation, route }: RootTabScreenProps<'TabOne'>) {
  console.log(route);

  const [message, setMessage] = useState<string>('');

  return (
  <View style={styles.container}>
    <Button
        title={"Open Item List"}
        onPress={() => {
            setMessage('');
            navigation.navigate("ItemList", {date: new Date().getDate()});
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
