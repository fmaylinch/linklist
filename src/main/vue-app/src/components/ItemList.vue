<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Item List</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout"><v-icon>mdi-logout</v-icon></v-btn>
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
            @click="editItem(item)">
            <ItemListItem :item="item" />
          </v-list-item>
        </v-list>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import constants from "@/constants.js";
import {AppEvent, EventBus, UpdateAction} from '@/event-bus.js';
import Util from "@/util.js";
import Cookies from "js-cookie";
import ItemListItem from "@/components/ItemListItem";

export default {
  name: 'ItemList',
  components: {ItemListItem},
  created() {
    this.axiosInstance = this.createAxiosInstance();
    this.retrieveItemsFromApi();
    this.listenToItemUpdated();
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
    logout() {
      EventBus.$emit('logout');
    },
    createAxiosInstance() {
      const token = Cookies.get("token");
      console.log("Creating axios instance");
      return axios.create({
        baseURL: constants.apiUrl,
        headers: { Authorization: "Bearer " + token }
      });
    },
    retrieveItemsFromApi() {
      console.log("Loading items from API");
      const username = Cookies.get("username");
      const search = { username };
      this.axiosInstance
        .post("items/search", search)
        .then(resp => this.prepareItems(resp.data))
        .catch(e => this.handleError(e));
    },
    prepareItems(searchResult) {
      console.log("Preparing items");
      this.fillRawContent(searchResult.items);
      this.items = searchResult.items;
    },
    fillRawContent(items) {
      for (let item of items) {
        item.rawContent = Util.getItemRawContent(item).toLowerCase();
      }
    },
    listenToItemUpdated() {
      EventBus.$on(AppEvent.itemChanged, event => {
        console.log("Item changed", event);

        if (event.action === UpdateAction.update) {
          console.log("Inserting or updating item", event.item.id, event.item.title);
          this.axiosInstance
            .post("items/upsertOne", event.item)
            .then(() => this.retrieveItemsFromApi())
            .catch(e => console.error("API Error", e));

        } else if (event.action === UpdateAction.delete) {
          console.log("Deleting item", event.item.id, event.item.title);
          this.axiosInstance
            .post("items/deleteOne", {id: event.item.id})
            .then(() => this.retrieveItemsFromApi())
            .catch(e => console.error("API Error", e));
        }
      });
    },
    colorForItem(item) {
      return Util.colorFromScore(item.score);
    },
    addItem() {
      this.editItem(null);
    },
    editItem(item) {
      if (item) {
        console.log("Going to edit item", item.id, item.title);
      } else {
        console.log("Going to create a new item");
      }
      // The name of the route is defined in "src/router/index.js".
      // The route definition there doesn't have params like :id, so we're
      // actually passing an object directly. As you can read in
      // https://forum.vuejs.org/t/passing-objects-to-vue-router/32070
      // when the page is reloaded it won't contain the props.
      this.$router.push({ name: "EditItem", params: { item: item } });
    },
    handleError(error) {
      console.error("API Error:", error);
      if (error.response.status === 401) {
        this.logout();
      }
    }
  }
}
</script>
