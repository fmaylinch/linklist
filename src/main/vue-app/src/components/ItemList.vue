<template>
  <div id="listDiv">
    <v-app-bar app dark>
      <v-toolbar-title>Item List</v-toolbar-title>
      <div>
        <span style="margin-left: 10px; font-size: 75%;">
          {{ itemCount }}
        </span>
      </div>
      <v-progress-circular v-if="loading" class="load-progress"
          :width="3" :size="20" indeterminate color="primary" />
      <v-spacer></v-spacer>
      <v-menu left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-sort</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="() => sortItemsWith({ property:'author', direction: 1 })">
            <v-list-item-title>By author ↑</v-list-item-title>
          </v-list-item>
          <v-list-item @click="() => sortItemsWith({ property:'author', direction: -1 })">
            <v-list-item-title>By author ↓</v-list-item-title>
          </v-list-item>
          <v-list-item @click="() => sortItemsWith({ property:'score', direction: 1 })">
            <v-list-item-title>By score ↑</v-list-item-title>
          </v-list-item>
          <v-list-item @click="() => sortItemsWith({ property:'score', direction: -1 })">
            <v-list-item-title>By score ↓</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu left bottom v-if="favorites.length > 0">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-star</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="fav in favorites" :key="fav.query" @click="() => searchFav(fav)">
            <v-list-item-title>{{fav.query}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn v-if="ctx.credentials" icon @click="options"><v-icon>mdi-cog</v-icon></v-btn>
      <v-btn v-if="!ctx.viewingSharedLink" icon @click="addItem"><v-icon>mdi-plus</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container v-if="ctx.viewingSharedLink">
          <v-alert dismissible type="info">
            Items of <strong>{{ ctx.search.username }}</strong>
            with tags <strong>{{ ctx.search.tags.join(", ") }}</strong>.
          </v-alert>
          <a v-if="ctx.viewingMyItems" href="#" @click="goToPermissions">Edit permissions to allow access</a>
        </v-container>
        <v-container>
          <v-alert v-model="error.visible" color="red" dismissible type="error">{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field
            clearable
            v-model="query"
            label="Search"
            placeholder="Search words or #tags"
            prepend-inner-icon="mdi-pound-box"
            @click:prepend-inner="addHashChar"
          />
          <v-text-field
            v-if="shareable"
            clearable
            v-model="tagsToUpdate"
            label="Add or remove tags"
            placeholder="+tag1 +tag2 -tag3 -tag4"
            :append-icon="itemsMultiUpdate ? 'mdi-content-save' : ''"
            @click:append="updateTags"
          />
          <div v-if="shareable">
            Share link: <a :href="shareLink()" target="_blank"> {{shareLink()}}</a>
          </div>
        </v-container>
        <v-list>
          <!-- If the v-list-item is inside ItemListItem, the @click handler doesn't work -->
          <v-list-item
            v-for="item in searchedItems"
            :key="item.id"
            @click="openItem(item)">
            <ItemListItem :item="item" />
          </v-list-item>
        </v-list>
      </v-card>
      <v-btn
          style="z-index: 3; position: fixed; right: 20px; bottom: 20px;"
          @click="scrollToTop"
          elevation="2">
        <v-icon>mdi-chevron-double-up</v-icon>
      </v-btn>
    </v-main>
  </div>
</template>

<script>
import Util from '@/util.js';
import ItemListItem from '@/components/ItemListItem';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export default {
  name: 'ItemList',
  components: {ItemListItem},
  props: {
    ctx: Object
  },
  created() {
    this.setupObserverForRefreshSearchedItems();
    this.retrieveItemsFromApi();
    this.prepareFavorites();
  },
  watch: {
    lowerSearch() {
      this.sendRefreshSearchedItems();
    }
  },
  data: () => ({
    query: "",
    tagsToUpdate: "",
    items: [],
    searchedItems: [],
    favorites: [],
    error: { message: "", visible: false },
    loading: false,
    sort: { property: "author", direction: 1 }
  }),
  computed: {
    lowerSearch() {
      return this.query ? this.query.trim().toLowerCase() : "";
    },
    shareable() {
      if (!this.ctx.viewingMyItems) return false;
      if (this.lowerSearch[0] !== "#") return false;
      if (this.searchedItems.length === 0) return false;
      // We could refactor this and use the positive/negative in refreshSearchedItems()
      return this.lowerSearch.split(/ +/).filter(x => x[0] !== "#").length === 0; // Only searching tags
    },
    itemsMultiUpdate() {
      if (!this.tagsToUpdate) return null;
      const parts = this.tagsToUpdate.split(/ +/);
      const tagsToAdd = parts.filter(x => x[0] === "+").map(x => x.substr(1)).filter(x => x);
      const tagsToRemove = parts.filter(x => x[0] === "-").map(x => x.substr(1)).filter(x => x);
      return tagsToAdd.length > 0 || tagsToRemove.length > 0
          ? {tagsToAdd, tagsToRemove}
          : null;
    },
    itemCount() {
      if (this.lowerSearch) {
        return this.searchedItems.length + " of " + this.items.length;
      } else {
        return this.items.length;
      }
    }
  },
  methods: {
    setupObserverForRefreshSearchedItems() {
      const component = this;
      new Observable(subscriber => {
        this.subscriber = subscriber;
      }).pipe(debounceTime(500)).subscribe({
        next(query) { component.refreshSearchedItems(query); },
        error(err) { console.error('something wrong occurred: ' + err); },
        complete() { console.log('done'); }
      });
    },
    addHashChar() {
      console.log("#");
      if (this.query) {
        this.query += " #";
      } else {
        this.query = "#";
      }
    },
    retrieveItemsFromApi() {
      console.log("Loading items from API", this.ctx.search);
      const search = this.ctx.search;
      Util.loadWithAxios("get items", this, () =>
          this.ctx.axios
              .post("items/search", search)
              .then(resp => this.prepareItems(resp.data))
      );
    },
    prepareItems(searchResult) {
      console.log("Preparing items", searchResult);
      this.fillCalculatedData(searchResult.items);
      this.sortAndSetItems(searchResult.items);
    },
    sortItemsWith(sort) {
      this.sort = sort;
      this.sortAndSetItems(this.items);
    },
    sortAndSetItems(items) {
      let property = this.sort.property;
      let sortFunction = (x,y) => {
        const px = x[property] || x.title; // fallback to title
        const py = y[property] || y.title; // fallback to title
        if (px < py) return -this.sort.direction;
        if (px > py) return this.sort.direction;
        return 0;
      };
      items.sort(sortFunction);
      for (let i = 0; i < items.length; i++) {
        items[i].index = i;
      }
      this.items = items;
      this.sendRefreshSearchedItems();
    },
    sendRefreshSearchedItems() {
      this.subscriber.next(this.lowerSearch);
    },
    wordsAndTags(parts) {
      const words = parts.filter(x => x[0] !== "#");
      const tags = parts.filter(x => x[0] === "#").map(x => x.substr(1));
      return {words, tags};
    },
    refreshSearchedItems(query) {
      console.log("Searching", query);
      if (!query) {
        this.searchedItems = this.items;
      }
      const parts = query.split(/ +/);
      const positive = this.wordsAndTags(parts.filter(x => x[0] !== "-"));
      // Negative words and tags (starting with '-'). We will NOT include items that have them.
      const negative = this.wordsAndTags(parts.filter(x => x[0] === "-").map(x => x.substr(1)));
      this.searchedItems = this.items.filter(it => {
        for (let word of positive.words) {
          if (it.rawContent.indexOf(word) < 0) return false;
        }
        for (let word of negative.words) {
          if (it.rawContent.indexOf(word) >= 0) return false;
        }
        for (let tag of positive.tags) {
          if (!it.tagSet.has(tag)) return false;
        }
        for (let tag of negative.tags) {
          if (it.tagSet.has(tag)) return false;
        }
        return true;
      });
    },
    fillCalculatedData(items) {
      for (let item of items) {
        Util.fillItemCalculatedData(item);
      }
    },
    updateTags() {
      // We could refactor this and use the positive.tags in refreshSearchedItems()
      const tagsToSearch = this.lowerSearch.split(/ +/).map(x => x.substr(1));
      const updateMany = {...this.itemsMultiUpdate, tagsToSearch};
      console.log("updateMany", updateMany);
      this.tagsToUpdate = "";
      Util.loadWithAxios("update many items", this, () =>
          this.ctx.axios
              .post("items/updateMany", updateMany)
              .then(() => this.retrieveItemsFromApi())
      );
    },
    addItem() {
      this.$emit("add-item");
    },
    openItem(item) {
      this.$emit("open-item", item);
    },
    itemUpdated(itemUpdate) {
      Util.fillItemCalculatedData(itemUpdate.newItem);
      this.items[itemUpdate.oldItem.index] = itemUpdate.newItem;
      this.sortAndSetItems(this.items);
    },
    itemAdded(item) {
      Util.fillItemCalculatedData(item);
      this.items.push(item);
      this.sortAndSetItems(this.items);
    },
    itemDeleted(itemIndex) {
      this.items.splice(itemIndex, 1);
      this.sortAndSetItems(this.items);
    },
    applyQuery(query) {
      this.query = query;
    },
    refreshItems() {
      this.retrieveItemsFromApi();
    },
    prepareFavorites() {
      // This call is also done in PermissionsList.vue
      // Here we will use the permissions to build the favorite list
      console.log("Loading permissions from API, to prepare favorites", this.ctx.search);
      this.ctx.axios
          .post("permissions/search")
          .then(resp => this.prepareFavoritesMenu(resp.data.permissions))
          .catch(e => console.error("Error retrieving list of permissions", e));
    },
    // Create favorites from permissions
    // Each permission has tags, so for now we create favorites to see those tags
    prepareFavoritesMenu(permissions) {
      const favorites = [];
      for (const p of permissions) {
        let fav = { query: p.tags.map(tag => "#"+tag).join(" ") };
        favorites.push(fav);
      }
      let byQuery = (x,y) => {
        if (x.query < y.query) return -1;
        if (x.query > y.query) return 1;
        return 0;
      };
      favorites.sort(byQuery);
      this.favorites = favorites;
    },
    searchFav(fav) {
      this.query = fav.query;
    },
    scrollToTop() {
      document.getElementById("listDiv").scrollTop = 0;
    },
    options() {
      this.$emit("options")
    },
    goToPermissions() {
      this.$emit("permissions")
    },
    openShareLink() {
      window.open(this.shareLink());
    },
    shareLink() {
      const tags = this.lowerSearch.split(/ +/).map(x => x.substr(1)); // Remove "#" from tags
      return Util.buildShareLink(tags, this.ctx);
    },
    handleError(e) {
      this.error = Util.messageObjectFromApiError(e);
      this.scrollToTop();
    }
  }
}
</script>

<style scoped lang="scss">
.load-progress {
  margin-left: 10px;
}
.v-application--is-ltr .v-list-item__icon:first-child {
}
.v-list-item.v-list-item--link {
  padding: 0;
}
</style>
