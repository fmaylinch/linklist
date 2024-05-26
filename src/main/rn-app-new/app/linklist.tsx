import {useEffect, useState} from "react";
import {Button, Image, StyleSheet, View} from 'react-native';
import {router} from 'expo-router';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Credentials} from "@/types";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {navigationParams, useLocalSearchParamsWithJson} from "@/util/routerUtil";

export default function Linklist() {

    const [message, setMessage] = useState<string>('welcome!');
    const [loggedIn, setLoggedIn] = useState(false)
    const paramsObject = useLocalSearchParamsWithJson();
    const lastUpdateTime: number = paramsObject.lastUpdateTime;

    useEffect(() => {
        (async () => {
            console.log("Loading credentials using AsyncStorage");
            const json = await AsyncStorage.getItem('credentials')
            const credentials: Credentials|null = json != null ? JSON.parse(json) : null;
            if (credentials != null) {
                // TODO: Update this when we login
                setMessage("Logged in: " + credentials.baseUrl);
                setLoggedIn(true);
            } else {
                setMessage("Not logged")
            }
        })();
    }, [lastUpdateTime]);

    function loadItems(fromApi: boolean) {
        router.push(navigationParams('itemList', {
            lastUpdateTime: new Date().getTime(),
            loadItemsFromLocalStorage: !fromApi,
            search: "-song. | rnd" // TODO - add options from this same screen, so we don't need to reload items
        }))
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
        router.push(navigationParams('login'));
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
                <ThemedText type="default">{message}</ThemedText>
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
