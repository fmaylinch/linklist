
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
