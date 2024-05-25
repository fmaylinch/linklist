import {useLocalSearchParams} from 'expo-router';

export function navigationParams(pathname: string, params?: object) {
    if (!params) {
        return { pathname };
    }
    return { pathname, params: { stringifiedParams: JSON.stringify(params) }}
}

export function useLocalSearchParamsWithJson() {
    const { stringifiedParams } = useLocalSearchParams();
    return JSON.parse(stringifiedParams?.toString() || "{}");
}
