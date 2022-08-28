import {Button, StyleSheet, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Text, View} from '../components/Themed';
import {Credentials, RootStackScreenProps} from "../types";
import React, {useState} from "react";
import axios from "axios";

export default function Login({ navigation, route }: RootStackScreenProps<'Login'>) {
  console.log("route", route.name);

  const [baseUrl, setBaseUrl] = useState<string>('https://linklist.onrender.com/8080');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const login = async () => {
      try {
          const url = baseUrl + "/security/login";
          const loginData = { username: username, password: password, password2: "" };
          const resp = await axios.post(url, loginData);
          let credentials: Credentials = {...resp.data, baseUrl};
          // TODO: Use https://docs.expo.dev/versions/latest/sdk/securestore/
          await AsyncStorage.setItem('credentials', JSON.stringify(credentials));
          navigation.navigate('ItemList', {lastUpdateTime: new Date().getTime()});
      } catch (e) {
          setMessage('Error on login: ' + e);
      }
  }

  return (
    <View style={styles.container}>
        <TextInput style={styles.input} value={baseUrl} onChangeText={setBaseUrl} />
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} secureTextEntry={true} value={password} onChangeText={setPassword} />
        <Button title={"Login"} onPress={login} />
        <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        color: "#fff",
        backgroundColor: '#343434',
        margin: 5,
        padding: 5,
        width: '100%',
    }
});
