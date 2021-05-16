<template>
  <Secured
      ref="secured"
      @credentials-changed="updateCredentials"
  >
    <div class="fixed-div">
      <div
          id="listDiv"
          class="fixed-div"
          :style="styleForView(this.views.ItemList)">
        <ItemList
            ref="itemList"
            :ctx="ctx"
            @open-item="openItem"
            @add-item="addItem"
            @options="options"
        />
      </div>
      <div
          id="editDiv"
          class="fixed-div"
          :style="styleForView(this.views.EditItem)">
        <EditItem
            ref="editItem"
            :ctx="ctx"
            @updated="itemUpdated"
            @created="itemCreated"
            @deleted="itemDeleted"
            @canceled="displayList"
            @scroll-to-top="scrollEditToTop"
        />
      </div>
      <div
          class="fixed-div"
          :style="styleForView(this.views.Options)">
        <Options
            :ctx="ctx"
            @items-uploaded="refreshList"
            @close="displayList"
            @logout="logout"
        />
      </div>
      <v-btn
          v-show="currentView === this.views.ItemList"
          style="z-index: 3; position: fixed; right: 20px; bottom: 20px;"
          @click="scrollListToTop"
          elevation="2">
        <v-icon>mdi-chevron-double-up</v-icon>
      </v-btn>
    </div>
  </Secured>
</template>

<script>
import Secured from '@/components/Secured';
import ItemList from '@/components/ItemList';
import EditItem from '@/components/EditItem';
import axios from 'axios';
import constants from '@/constants';
import Options from '@/views/Options';

export default {
  name: 'Main',
  components: {
    Options,
    EditItem, ItemList, Secured },
  data: () => ({
    ctx: { },
    views: {
      ItemList: "ItemList",
      EditItem: "EditItem",
      Options: "Options"
    },
    // This component doesn't use routes. It just swaps different components.
    // We used some hacky CSS to avoid layout problems (see "fixed-div").
    // It would be great to find a better solution.
    currentView: null
  }),
  methods: {
    createAxiosInstance(credentials) {
      console.log("Creating axios instance");
      return axios.create({
        baseURL: constants.apiUrl,
        headers: { Authorization: "Bearer " + credentials.token }
      });
    },
    updateCredentials(credentials) {
      console.log("Main: update credentials", credentials);
      if (credentials) {
        this.ctx.credentials = credentials;
        this.ctx.axios = this.createAxiosInstance(credentials);
        this.displayList();
      } else {
        this.hideCurrentView();
      }
    },
    addItem() {
      this.displayEdit(null);
    },
    openItem(item) {
      console.log("Main: open item", item.id, item.title)
      this.displayEdit(item);
    },
    itemUpdated(itemUpdate) {
      console.log("Main: item updated", itemUpdate);
      this.$refs.itemList.itemUpdated(itemUpdate);
      this.displayList();
    },
    itemCreated(item) {
      console.log("Main: item created", item.title)
      this.$refs.itemList.itemAdded(item);
      this.displayList();
    },
    itemDeleted(item) {
      console.log("Main: item deleted", item.id, item.index, item.title)
      this.$refs.itemList.itemDeleted(item.index);
      this.displayList();
    },

    handleError(e) {
      console.error("API Error", e);
    },
    refreshList() {
      this.$refs.itemList.refreshItems();
      this.displayList();
    },
    displayList() {
      this.currentView = this.views.ItemList;
    },
    displayEdit(item) {
      // I wanted to use v-if to pass item as props and re-render EditItem, but it created some layout problems.
      // So, now I tell EditItem to refresh the item.
      this.$refs.editItem.setItem(item);
      // Since we reuse this component, reset the scroll because it could be currently in another position.
      this.scrollEditToTop();
      // The setItem performs animations, so wait a little bit to change the view.
      setTimeout(() => {
        this.currentView = this.views.EditItem;
      }, 300);
    },
    scrollEditToTop() {
      document.getElementById("editDiv").scrollTop = 0;
    },
    scrollListToTop() {
      document.getElementById("listDiv").scrollTop = 0;
    },
    onNavigation(to, from) {
      console.log("Tried to navigate from " + from.name + " to " + to.name);
      // For now, we suppose that the user pressed the back button on the browser,
      // so we display the item list. We will probably need more sophisticated logic.
      this.displayList();
    },
    styleForView(view) {
      return {
        zIndex: this.currentView === view ? 2 : 1
      };
    },
    options() {
      this.currentView = this.views.Options;
    },
    logout() {
      this.hideCurrentView();
      this.$refs.secured.logout();
    },
    hideCurrentView() {
      this.currentView = null;
    }
  }
}
</script>

<style scoped lang="scss">
.fixed-div {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  position: fixed;
  background-color: black;
}
</style>
