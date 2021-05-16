<template>
  <div id="listDiv">
    <v-app-bar app dark>
      <v-toolbar-title>Item List</v-toolbar-title>
      <div>
        <span style="margin-left: 10px; font-size: 75%;">
          {{ itemCount }}
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon @click="options"><v-icon>mdi-cog</v-icon></v-btn>
      <v-btn v-if="!ctx.viewingSharedLink" icon @click="addItem"><v-icon>mdi-plus</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container v-if="ctx.viewingSharedLink">
          <v-alert dismissible type="info">
            Viewing items from user <strong>{{ ctx.search.username }}</strong>
            with tags <strong>{{ ctx.search.tags.join(", ") }}</strong>.
          </v-alert>
        </v-container>
        <v-container>
          <v-text-field
            clearable
            v-model="query"
            label="Search"
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
    query: null,
    items: []
  }),
  computed: {
    lowerSearch() {
      return this.query ? this.query.trim().toLowerCase() : "";
    },
    searchedItems: function() {
      if (!this.lowerSearch) {
        return this.items;
      }
      const parts = this.lowerSearch.split(/ +/)
        .map(x => x[0] === "#" ? x + " " : x); // Add space at the end of tag, for exact search
      return this.items.filter(it => {
        for (let part of parts) {
          // Search for all parts
          if (it.rawContent.indexOf(part) < 0) return false;
        }
        return true;
      });
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
    retrieveItemsFromApi() {
      console.log("Loading items from API", this.ctx.search);
      const search = this.ctx.search;
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
    itemDeleted(itemIndex) {
      this.items.splice(itemIndex, 1);
      this.sortAndSetItems(this.items);
    },
    refreshItems() {
      this.retrieveItemsFromApi();
    },
    scrollToTop() {
      document.getElementById("listDiv").scrollTop = 0;
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
