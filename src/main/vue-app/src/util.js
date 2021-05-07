export default class Util {

  static getItemRawContent(item) {
    const tags = item.tags ? item.tags.join(" ") : "";
    return item.title + " " + item.url + " " + item.image + " " + item.notes + " " + tags;
  }
}