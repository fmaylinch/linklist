import {useLocalSearchParams} from 'expo-router';

// TODO: TypeScript complains about types when using this function
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
