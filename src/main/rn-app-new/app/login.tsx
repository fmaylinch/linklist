import { SafeAreaView, View, Button, StyleSheet, TextInput, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link, router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Credentials} from "../types";
import {useState} from "react";
import axios from "axios";

export default function Login() {

    const [baseUrl, setBaseUrl] = useState<string>('http://158.160.43.18:8090');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const login = async () => {
        try {
            const url = baseUrl + "/security/login";
            const loginData = { username: username, password: password, password2: "" };
            const resp = await axios.post(url, loginData);
            let credentials: Credentials = {...resp.data, baseUrl};
            await AsyncStorage.setItem('credentials', JSON.stringify(credentials));
            // TODO - doesn't refresh because I guess this params go to the tabs layout component.
            //  I could add an intermediate screen out of the tabs, to make sure we go back there.
            router.navigate({ pathname: '/linklist', params: {
                    lastUpdateTime: new Date().getTime()
                } });
        } catch (e) {
            setMessage('Error on login: ' + e);
        }
    }

    return (
        <SafeAreaView>
            <ThemedView style={styles.mainContainer}>
                <ThemedText type="title">Login</ThemedText>
            </ThemedView>
            <TextInput style={styles.input} value={baseUrl} onChangeText={setBaseUrl} />
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} secureTextEntry={true} value={password} onChangeText={setPassword} />
            <Button title={"Login"} onPress={login} />
            <Text>{message}</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'center',
        padding: 10,
    },
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
