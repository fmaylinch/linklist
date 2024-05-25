import {
    Alert,
    Button,
    DimensionValue,
    FlatList,
    ImageBackground,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import {Credentials, Item, ItemExt} from "@/types";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {apiService} from "@/service/ApiService";
//import * as Clipboard from 'expo-clipboard'; // TODO - does it work? maybe install UseHooks?
import {colorFromScore} from "@/util/util";
import {router, Stack} from 'expo-router';
import {navigationParams, useLocalSearchParamsWithJson} from "@/util/routerUtil";

export default function ItemList() {

    const paramsObject = useLocalSearchParamsWithJson();
    const lastUpdateTime: number = paramsObject.lastUpdateTime;
    const loadItemsFromLocalStorage: boolean = paramsObject.loadItemsFromLocalStorage;
    const initialSearch: string = paramsObject.initialSearch;

    const [items, setItems] = useState<Array<ItemExt>>([]);
    const [filteredItems, setFilteredItems] = useState<Array<ItemExt>>([]);
    const [search, setSearch] = useState(initialSearch as string);
    const [loading, setLoading] = useState(false);
    const [randomized, setRandomized] = useState(false);

    useEffect(() => {
        console.log("loadItemsFromLocalStorage", loadItemsFromLocalStorage);
        (async () => {
            try {
                const json = await AsyncStorage.getItem('credentials')
                const credentials: Credentials|null = json != null ? JSON.parse(json) : null;
                setLoading(true);
                let items : Array<Item>;
                if (loadItemsFromLocalStorage) {
                    items = await loadItemsFromStorage();
                } else {
                    items = await loadItemsFromApi(credentials!);
                    await saveItemsToStorage(items);
                }
                let itemsExt = extendItems(items);
                sortItems(itemsExt);
                await addPendingLocalItems(itemsExt);
                setItems(itemsExt);
                setLoading(false);
                // Randomize once in the beginning, to see random items when opening the app
                if (!search && !randomized) {
                    const initialSearch = "-song. | rnd";
                    setSearch(initialSearch);
                    setFilteredItems(filteredData(itemsExt, initialSearch))
                    setRandomized(true);
                } else {
                    setFilteredItems(filteredData(itemsExt, search))
                }
            } catch(e) {
                Alert.alert("Error loading items", `${e}`);
            }
        })();
    }, [lastUpdateTime]);

    useEffect(() => {
        (async () => {
            console.log("Search detected: " + initialSearch);
            if (initialSearch) {
                console.log("Updating search: " + initialSearch);
                onSearchUpdated(initialSearch as string);
            }
        })();
    }, [initialSearch])

    function openItemEdit(item: Item) {
        router.push(navigationParams('itemEdit', {
            lastUpdateTime: new Date().getTime(),
            item
        }));
    }

    const renderItem = (item : Item) => (
        <TouchableOpacity
            onPress={() => openItemEdit(item)}
            onLongPress={() => openUrl(item)}
        >
            <ItemRow {...item} />
        </TouchableOpacity>
    );

    function addNewItem() {
        openItemEdit(buildNewItem());
    }

    function buildNewItem() {
        return {
            image: "",
            notes: "",
            score: 0,
            tags: [],
            title: "",
            url: ""
        };
    }

    function onSearchUpdated(search: string) {
        setSearch(search);
        setFilteredItems(filteredData(items, search));
    }

    function clearSearch() {
        onSearchUpdated("");
    }

    function copyItemsToClipboard() {
        const info = filteredItems.map(item => (item.author ? item.author + " - " : "") + item.title + "\n" + item.url).join("\n\n");
        console.log(info);
        //Clipboard.setString(info);
        Alert.alert("Items copied to clipboard");
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerRight: () => <Button onPress={addNewItem} title="Add" />,
                }}
            />
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.searchContainer}>
                        <Text style={styles.loading}>Loading items...</Text>
                    </View>
                ) : (
                    <View style={styles.searchContainer}>
                        <TextInput style={styles.search} placeholder={"word tag. -not, other | func"}
                                   value={search} onChangeText={onSearchUpdated} />
                        {search.length > 0 && <Button title={"X"} onPress={clearSearch}/>}
                        <Text onLongPress={copyItemsToClipboard} style={styles.count}>{filteredItems.length} of {items.length}</Text>
                    </View>
                )}
                <FlatList
                    data={filteredItems}
                    renderItem={listItem => renderItem(listItem.item)}
                    keyExtractor={item => item.listKey}
                />
            </View>
        </>
    );
}

function openUrl(item: Item) {
    if (item.url) {
        Linking.openURL(item.url);
    }
}

async function loadItemsFromApi(credentials: Credentials) {
    console.log("Loading items from api");
    apiService.setCredentials(credentials);
    const resp = await apiService.axios().post("items/search",
        {username: credentials.username, tags: null});
    let items = resp.data.items;
    console.log(`Loaded ${items.length} items from api`)
    return items;
}

function sortItems(items: Array<Item>) {
    items.sort((a, b) => {
        let textA = a.author ?  a.author + a.title : a.title;
        let textB = b.author ?  b.author + b.title : b.title;
        return textA.localeCompare(textB);
    });
    return items;
}

async function loadItemsFromStorage() {
    console.log("Loading items from storage");
    const json = await AsyncStorage.getItem('items')
    const items: Array<Item> = json != null ? JSON.parse(json) : [];
    return items;
}

async function saveItemsToStorage(items: Array<Item>) {
    console.log(`Saving ${items.length} items to storage`);
    await AsyncStorage.setItem("items", JSON.stringify(items));
}

// TODO this is also used in itemEdit.tsx
const pendingItemsKey = 'pendingItems';

async function addPendingLocalItems(items: Array<ItemExt>) {
    console.log("Loading pending items from storage");
    const json = await AsyncStorage.getItem(pendingItemsKey)
    const pendingItems = extendItems(json != null ? JSON.parse(json) : []);
    console.log("Pending items:", pendingItems.length);
    items.unshift(...pendingItems);
}

function extendItems(items: Array<Item>) : Array<ItemExt> {
    return items.map(item => ({
        ...item,
        listKey: (item.id || "") + (item.localId || ""), // local items might not have item.id
        searchableText: item.title.toLowerCase() + " " + (item.author || "").toLowerCase() + " " + item.url + " " + item.notes.toLowerCase()
    }));
}

// TODO: transformer names could be more than just a name and also carry some parameters.
//  For example "random seed", "sort score", etc.
function getTransformers(names: string[]) {
    const result : Array<ItemsTransformer> = [];
    for (const name of names) {
        const f = transformersMap.get(name);
        if (f) {
            result.push(f);
        }
    }
    return result;
}

type ItemsTransformer = (items: Array<ItemExt>) => Array<ItemExt>;
const transformersMap = new Map<string, ItemsTransformer>();
transformersMap.set("random", randomizeItems);
transformersMap.set("rnd", randomizeItems);
transformersMap.set("score", sortByScore);
transformersMap.set("reverse", reverseItems);
transformersMap.set("rev", reverseItems);

function randomizeItems(items: Array<ItemExt>) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

function reverseItems(items: Array<ItemExt>) {
    return items.reverse();
}

function sortByScore(items: Array<ItemExt>) {
    items.sort((a, b) => {
        return b.score - a.score;
    });
    return items;
}

function dummyInfoItem(title: string, info: string) : ItemExt {
    return {
        title: title,
        author: "",
        notes: info,
        image: "", listKey: "",  score: 0, searchableText: "", tags: ["info"], url: ""
    };
}

function filteredData(items: Array<ItemExt>, search: string) : Array<ItemExt> {
    const query = search.trim().toLowerCase();
    console.log("query", query);

    // The regex starts with " *" to allow using transformers without queryWords.
    const splitQuery = query.split(/ *\| +/);

    const queryWords = splitQuery[0].trim();
    const transformerNames = splitQuery.slice(1);

    if (!queryWords && transformerNames.length == 0) {
        return items;
    }

    const transformers = getTransformers(transformerNames);
    if (transformers.length < transformerNames.length) {
        return [dummyInfoItem(
            "Enter correct functions",
            "Available: " + Array.from(transformersMap.keys()).join(", "))];
    }

    if (queryWords) {
        const orConditions: Array<QueryCondition> = queryWords.split(/ *, */) // comma is the OR operator
            .filter(part => part.length > 0)
            .map(queryPart => {
                const parts = queryPart.split(/ +/);
                const positive = wordsAndTags(parts.filter(x => x[0] !== "-"));
                // Negative words and tags (starting with '-'). We will NOT include items that have them.
                const negative = wordsAndTags(parts.filter(x => x[0] === "-").map(x => x.substr(1)));
                return {positive, negative};
            });

        items = items.filter(item => {
            for (const condition of orConditions) {
                if (matches(item, condition)) {
                    return true;
                }
            }
            return false;
        });
    }

    for (const transformer of transformers) {
        items = transformer(items.slice()); // copy array with slice, to avoid modifying the original array
    }

    if (items.length == 0) {
        return [dummyInfoItem(
            "Nothing found",
            "Examples:\ntop. album.\nmovie. -watched. | random")];
    }

    return items;
}

const tagChar = ".";

function wordsAndTags(parts: Array<string>) : QueryParts {
    const words = parts.filter(x => x[x.length-1] !== tagChar);
    const tags = parts.filter(x => x[x.length-1] === tagChar).map(x => x.substr(0, x.length-1));
    return {words, tags};
}

function matches(item: ItemExt, condition: QueryCondition) {
    for (const word of condition.positive.words) {
        if (item.searchableText.indexOf(word) < 0) return false;
    }
    for (const word of condition.negative.words) {
        if (item.searchableText.indexOf(word) >= 0) return false;
    }
    for (const tag of condition.positive.tags) {
        if (item.tags.indexOf(tag) < 0) return false;
    }
    for (const tag of condition.negative.tags) {
        if (item.tags.indexOf(tag) >= 0) return false;
    }
    return true;
}

type QueryParts = {
    words: Array<string>;
    tags: Array<string>;
}

type QueryCondition = {
    positive: QueryParts;
    negative: QueryParts;
}

const ItemRow : React.FC<Item> = (item: Item) => {
    const scoreColor = item.score > 0 ? colorFromScore(item.score) : "clear";
    const scoreColorFaded = item.score > 0 ? scoreColor + "77" : "clear";
    return (
        <View style={StyleSheet.flatten([styles.item, dynamicStyleForItem(item)])}>
            <ImageBackground source={{uri: item.image || undefined}} style={{flex: 1}}>
                <View style={{flex: 1, alignItems: "flex-start", minHeight: 175, padding: 10, backgroundColor: "rgba(0,0,0,0.40)"}}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={prepareStyle(styles.author, item.author)}>{item.author}</Text>
                    <Text style={styles.tags}>{item.tags.join(" ")}</Text>
                    <Text style={prepareStyle(styles.text, item.notes)}>{item.notes}</Text>
                </View>
            </ImageBackground>
            <View style={{flex: 1, flexDirection: "row"}}>
                <View style={{height: 2, backgroundColor: scoreColor, width: (item.score + "%") as DimensionValue}} />
                <View style={{height: 2, backgroundColor: scoreColorFaded, width: ((100 - item.score) + "%") as DimensionValue}} />
            </View>

        </View>
    );
}


function prepareStyle(style: any, value?: string) {
    if (value) {
        return {...style, backgroundColor: "rgba(0,0,0,0.55)"}; // add dark background when there is content
    } else {
        return style;
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: StatusBar.currentHeight || 0,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    search: {
        flex: 1,
        color: 'white',
        fontSize: 20,
        paddingVertical: 10,
    },
    loading: {
        flex: 1,
        color: 'gray',
        fontSize: 20,
        paddingVertical: 10,
    },
    count: {
        color: '#4f4f4f',
        textAlign: "right",
        marginStart: 5,
    },
    item: {
        marginVertical: 7,
        display: "flex",
    },
    title: {
        color: '#b9b940',
        fontSize: 20,
        marginBottom: 6,
        paddingHorizontal: 5,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    text: {
        fontSize: 16,
        marginBottom: 7,
        color: '#a2a2a2',
        paddingHorizontal: 5,
    },
    tags: {
        fontSize: 16,
        marginBottom: 7,
        color: '#b28ed3',
        paddingHorizontal: 5,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    author: {
        fontSize: 16,
        marginBottom: 7,
        color: '#5dd0cd',
        paddingHorizontal: 5,
    },
});

function dynamicStyleForItem(item: Item) : ViewStyle {
    let color = item.localId ? '#7a7c0f' : 'rgba(255,255,255,0)';
    let width = 2;
    return {
        borderStartWidth: width,
        borderEndWidth: width,
        borderTopWidth: width,
        borderBottomWidth: width,
        borderStartColor: color,
        borderEndColor: color,
        borderTopColor: color,
        borderBottomColor: color,
    };
}
