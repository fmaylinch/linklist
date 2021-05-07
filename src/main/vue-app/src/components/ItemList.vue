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
          <v-list-item
            v-for="item in searchedItems"
            :key="item.id"
            @click="editItem(item)"
          >
            <v-list-item-content>
              <v-list-item-title class="card-title">
                {{ item.title }}
              </v-list-item-title>
              <v-progress-linear
                height="1"
                :color="colorForItem(item)"
                :value="item.score">
              </v-progress-linear>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import constants from "@/constants.js";
import { EventBus } from '@/event-bus.js';
import Util from "@/util.js";
import Cookies from "js-cookie";

export default {
  name: 'ItemList',
  created() {
    this.axiosInstance = this.createAxiosInstance();
    this.retrieveItemsFromApi();
  },
  data: () => ({
    search: null,
    items: []
  }),
  computed: {
    searchedItems: function() {
      const lowerSearch = this.search ? this.search.toLowerCase() : "";
      return this.items.filter(it => it.rawContent.indexOf(lowerSearch) >= 0);
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
    colorForItem(item) {
      return Util.colorFromScore(item.score);
    },
    addItem() { // TODO
      console.log("Add item");
    },
    editItem(item) { // TODO
      console.log("Edit item", item.id, item.title);
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
