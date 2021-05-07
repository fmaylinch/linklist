export default class Util {

  static getItemRawContent(item) {
    const tags = item.tags ? item.tags.join(" ") : "";
    return item.title + " " + item.url + " " + item.image + " " + item.notes + " " + tags;
  }

  static colorFromScore(score) {
    if (score < 10) return "red";
    if (score < 20) return "deep-orange";
    if (score < 30) return "orange";
    if (score < 40) return "amber";
    if (score < 50) return "yellow";
    if (score < 60) return "grey darken-3";
    if (score < 70) return "blue lighten-2";
    if (score < 80) return "blue";
    if (score < 90) return "teal";
    return "green";
  }
}