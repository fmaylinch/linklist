export default class Util {

  static getItemRawContent(item) {
    return item.title + " " + item.url + " " + item.image + " " + item.notes + " " + this.getTagsString(item) + " " + item.score;
  }

  static fillItemRawContent(item) {
    item.rawContent = Util.getItemRawContent(item).toLowerCase();
  }

  static getTagsString(item) {
    return item.tags ? item.tags.map(t => "#" + t + " ").join("") : "";
  }

  static colorFromScore(score) {
    if (score < 10) return "red darken-2";
    if (score < 20) return "deep-orange darken-2";
    if (score < 30) return "orange darken-3";
    if (score < 40) return "amber darken-3";
    if (score < 50) return "yellow darken-3";
    if (score < 60) return "grey darken-3";
    if (score < 70) return "blue";
    if (score < 80) return "cyan";
    if (score < 90) return "teal";
    return "green";
  }
}