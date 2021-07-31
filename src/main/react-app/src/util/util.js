export default class Util {

  static fillItemRawContent(item) {
    const raw = item.title + " " + item.url + " " + item.image + " " + item.notes + " " + this.getTagsString(item) + " " + item.score;
    item.rawContent = raw.toLowerCase();
  }

  // TODO: check that usernames and tags are always stored in lowercase,
  //       when registering and when creating items and permissions

  static fillPermissionRawContent(permission) {
    permission.rawContent = this.getTagsString(permission) + " " + permission.usernames.join(" ");
  }

  static getTagsString(item) {
    return item.tags ? item.tags.map(t => "#" + t + " ").join("") : "";
  }

  static colorFromScore(score) {
    if (score < 10) return "red";
    if (score < 20) return "magenta";
    if (score < 30) return "orange";
    if (score < 40) return "amber";
    if (score < 50) return "yellow";
    if (score < 60) return "gray";
    if (score < 70) return "blue";
    if (score < 80) return "cyan";
    if (score < 90) return "teal";
    return "green";
  }
}