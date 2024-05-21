import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Button, Image } from 'react-native';
import {Link, router, useLocalSearchParams} from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Credentials} from "@/types";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function Linklist() {

    const [message, setMessage] = useState<string>('welcome!');
    const [loggedIn, setLoggedIn] = useState(false)
    const { lastUpdateTime } = useLocalSearchParams();

    useEffect(() => {
        (async () => {
            console.log("Loading credentials using AsyncStorage");
            const json = await AsyncStorage.getItem('credentials')
            const credentials: Credentials|null = json != null ? JSON.parse(json) : null;
            if (credentials != null) {
                // TODO: Update this when we login
                setMessage("Logged for API: " + credentials.baseUrl);
                setLoggedIn(true);
            } else {
                setMessage("Not logged")
            }
        })();
    }, [lastUpdateTime]);

    function loadItems(fromApi: boolean) {
        router.push({ pathname: 'itemList', params: {
                lastUpdateTime: new Date().getTime(),
                loadItemsFromLocalStorage: fromApi ? "no" : "yes" // can't use boolean in router.push()
        } });
    }

    async function logout() {
        try {
            await AsyncStorage.removeItem('credentials');
            setMessage('Logged out');
            setLoggedIn(false);
        } catch (e) {
            setMessage('Error on logout: ' + e);
        }
    }

    function login() {
        router.push({ pathname: 'login' });
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>

            <ThemedView style={styles.mainContainer}>
                <ThemedText type="title">Linklist!</ThemedText>
                <Text>{message}</Text>
                <View style={{margin: 10}}/>
                {loggedIn
                    ? <>
                        <Button title="Load items from API" onPress={() => loadItems(true)} />
                        <Button title="Logout" onPress={logout} />
                    </>
                    : <>
                        <Button title="Login" onPress={login} />
                    </>}
                <Button title="Load items from local storage" onPress={() => loadItems(false)} />
                <View style={{margin: 10}}/>
                <Link href="other">sample link</Link>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'center',
        padding: 10,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
