export default class Util {

  static fillItemCalculatedData(item) {
    const raw = item.title + " " + item.url + " " + item.image + " " + item.notes + " " + item.score;
    item.rawContent = raw.toLowerCase();

    item.tagSet = new Set();
    if (item.tags) {
      item.tags.forEach(x => item.tagSet.add(x))
    }

    // Known tags and their respective icons
    if (item.tagSet.has("song")) {
      item.icon = "mdi-music-note";
    } else if (item.tagSet.has("music")) {
      item.icon = "mdi-music";
    } else if (item.tagSet.has("book")) {
      item.icon = "mdi-book-open-page-variant";
    } else if (item.tagSet.has("game")) {
      item.icon = "mdi-google-controller";
    } else if (item.tagSet.has("tvseries")) {
      item.icon = "mdi-movie-open-plus";
    } else if (item.tagSet.has("movie")) {
      item.icon = "mdi-movie-open";
    } else if (item.tagSet.has("learn")) {
      item.icon = "mdi-school";
    } else if (item.tagSet.has("dev")) {
      item.icon = "mdi-laptop";
    }
  }

  // TODO: check that usernames and tags are always stored in lowercase,
  //       when registering and when creating items and permissions

  static fillPermissionRawContent(permission) {
    permission.rawContent = this.getTagsString(permission) + " " + permission.usernames.join(" ");
  }

  static getTagsString(item) {
    return item.tags ? item.tags.map(t => "#" + t + " ").join("") : "";
  }

  static buildShareLink(tags, ctx) {
    tags.sort();
    const url = new URL(location.href);
    return url.protocol + "//" + url.host + "/?user=" + ctx.credentials.username + "&tags=" + tags.join(",");
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

  static messageFromApiError(e) {
    console.error("API Error", e);
    return e.response && e.response.data ? e.response.data : e;
  }

  static messageObjectFromApiError(e) {
    return { message: this.messageFromApiError(e), visible: true };
  }

  /**
   * To be used from a component that has typical properties used when doing an axios call.
   */
  static loadWithAxios(operation, component, axiosCall) {
    console.log("Performing axios call: " + operation);
    component.loading = true;
    component.error = { message: "", visible: false };
    axiosCall()
        .catch(e => component.handleError(e))
        .finally(() => {
          console.log("Finished axios call: " + operation);
          component.loading = false;
        });
  }
}