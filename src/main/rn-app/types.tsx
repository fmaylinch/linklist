/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NoModal: undefined;
  NotFound: undefined;
  ItemList: {
    lastUpdateTime: number, // used to refresh the component
    loadItemsFromLocalStorage?: boolean,
    search?: string
  };
  ItemEdit: {item: Item, lastUpdateTime?: number};
  Login: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type Item = {
  id?: string;
  localId?: string; // for pending items saved locally
  userId?: string;
  title: string;
  author?: string;
  url: string;
  image: string;
  notes: string;
  tags: Array<string>;
  score: number;
};

export type ItemExt = Item & {
  listKey: string;
  searchableText: string;
}

export type Credentials = {
  username: string;
  token: string;
  baseUrl: string;
}
