<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Item List</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="options"><v-icon>mdi-cog</v-icon></v-btn>
      <v-btn icon @click="addItem"><v-icon>mdi-plus</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container>
          <v-text-field
            clearable
            v-model="search"
            placeholder="Search…"
          />
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
    </v-main>
  </div>
</template>

<script>
import Util from "@/util.js";
import ItemListItem from "@/components/ItemListItem";

export default {
  name: 'ItemList',
  components: {ItemListItem},
  props: {
    ctx: Object
  },
  created() {
    this.retrieveItemsFromApi();
  },
  data: () => ({
    search: null,
    items: []
  }),
  computed: {
    searchedItems: function() {
      const lowerSearch = this.search ? this.search.trim().toLowerCase() : "";
      const parts = lowerSearch.split(/ +/)
        .map(x => x[0] === "#" ? x + " " : x); // Add space at the end of tag, for exact search
      return this.items.filter(it => {
        for (let part of parts) {
          // Search for all parts
          if (it.rawContent.indexOf(part) < 0) return false;
        }
        return true;
      });
    }
  },
  methods: {
    retrieveItemsFromApi() {
      console.log("Loading items from API");
      const search = { username: this.ctx.credentials.username };
      this.ctx.axios
        .post("items/search", search)
        .then(resp => this.prepareItems(resp.data))
        .catch(e => this.handleError(e));
    },
    prepareItems(searchResult) {
      console.log("Preparing items", searchResult);
      this.fillRawContent(searchResult.items);
      this.sortAndSetItems(searchResult.items);
    },
    sortAndSetItems(items) {
      let byTitle = (x,y) => {
        if (x.title < y.title) return -1;
        if (x.title > y.title) return 1;
        return 0;
      };
      items.sort(byTitle);
      for (let i = 0; i < items.length; i++) {
        items[i].index = i;
      }
      this.items = items;
    },
    fillRawContent(items) {
      for (let item of items) {
        Util.fillItemRawContent(item);
      }
    },
    addItem() {
      this.$emit("add-item");
    },
    openItem(item) {
      this.$emit("open-item", item);
    },
    itemUpdated(itemUpdate) {
      Util.fillItemRawContent(itemUpdate.newItem);
      this.items[itemUpdate.oldItem.index] = itemUpdate.newItem;
      this.sortAndSetItems(this.items);
    },
    itemAdded(item) {
      Util.fillItemRawContent(item);
      this.items.push(item);
      this.sortAndSetItems(this.items);
    },
    itemDeleted(item) {
      this.items.splice(item.index, 1);
      this.sortAndSetItems(this.items);
    },
    refreshItems() {
      this.retrieveItemsFromApi();
    },
    options() {
      this.$emit("options")
    },
    handleError(error) {
      console.error("API Error:", error);
    }
  }
}
</script>
