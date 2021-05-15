<template>
  <Secured
      ref="secured"
      @credentials-changed="updateCredentials"
  >
    <div class="fixed-div">
      <div
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
            @update="itemToUpdate"
            @create="itemToCreate"
            @delete="itemToDelete"
            @close="displayList"
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
  beforeRouteLeave(to, from, next) {
    console.log("Going back")
    next(false); // Avoid leaving the app
  },
  data: () => ({
    ctx: { },
    views: {
      ItemList: "ItemList",
      EditItem: "EditItem",
      Options: "Options"
    },
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
        this.currentView = null;
      }
    },
    addItem() {
      this.displayEdit(null);
    },
    openItem(item) {
      console.log("Main: open item", item.id, item.title)
      this.displayEdit(item);
    },
    itemToUpdate(itemUpdate) {
      console.log("Main: item to update", itemUpdate);
      this.ctx.axios
          .post("items/upsertOne", itemUpdate.newItem)
          .then(resp => {
            this.$refs.itemList.itemUpdated({
              oldItem: itemUpdate.oldItem,
              newItem: resp.data
            });
            this.displayList();
          })
          .catch(e => this.handleError(e));
    },
    itemToCreate(item) {
      console.log("Main: item to create", item.title)
      this.ctx.axios
          .post("items/upsertOne", item)
          .then(resp => {
            this.$refs.itemList.itemAdded(resp.data);
            this.displayList();
          })
          .catch(e => this.handleError(e));
    },
    itemToDelete(item) {
      console.log("Main: item to delete", item.id, item.title)
      this.ctx.axios
          .post("items/deleteOne", {id: item.id})
          .then(resp => {
            this.$refs.itemList.itemDeleted(resp.data);
            this.displayList();
          })
          .catch(e => this.handleError(e));
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
      // I wanted to use v-if to pass item as props and re-render EditItem, but it created some layout problem.
      // So, now I tell EditItem to refresh the item.
      // https://stackoverflow.com/a/45463576/1121497
      this.$refs.editItem.setItem(item);
      // The previous update performs animations, so wait a little bit to change the view
      document.getElementById("editDiv").scrollTop = 0;
      setTimeout(() => {
        this.currentView = this.views.EditItem;
      }, 300);
    },
    backButtonPressed(to, from) {
      console.log("Tried to go navigate from " + from.name + " to " + to.name);
      this.displayList();
    },
    styleForView(view) {
      return {
        zIndex: this.currentView === view ? 2 : 1,
        backgroundColor: 'black'
      };
    },
    options() {
      this.currentView = this.views.Options;
    },
    logout() {
      this.currentView = null;
      this.$refs.secured.logout();
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
}
</style>