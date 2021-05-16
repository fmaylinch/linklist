<template>
    <div class="fixed-div">
      <ItemList
          class="fixed-div"
          :style="styleForView(this.views.ItemList)"
          ref="itemList"
          :ctx="ctx"
          @open-item="openItem"
          @add-item="addItem"
          @options="options"
      />
      <EditItem
          class="fixed-div"
          :style="styleForView(this.views.EditItem)"
          ref="editItem"
          :ctx="ctx"
          @updated="itemUpdated"
          @created="itemCreated"
          @deleted="itemDeleted"
          @canceled="displayList"
      />
      <Options
          class="fixed-div"
          :style="styleForView(this.views.Options)"
          :ctx="ctx"
          @items-uploaded="refreshList"
          @close="displayList"
          @logout="logout"
      />
    </div>
</template>

<script>
import ItemList from '@/components/ItemList';
import EditItem from '@/components/EditItem';
import Options from '@/views/Options';

export default {
  name: 'Main',
  components: {
    Options,
    EditItem,
    ItemList
  },
  props: {
    ctx: Object
  },
  created() {
    this.currentView = this.views.ItemList;
  },
  data: () => ({
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
      // The setItem performs animations, so wait a little bit to change the view.
      setTimeout(() => {
        this.currentView = this.views.EditItem;
      }, 300);
    },
    onNavigation(to, from) {
      console.log("Tried to navigate from " + from.name + " to " + to.name);
      // For now, we suppose that the user pressed the back button on the browser,
      // We will probably need more sophisticated logic.
      if (this.currentView === this.views.ItemList) {
        // If the user is viewing items from another user, go back to his items
        if (this.ctx.viewingSharedLink) {
          location.href = "/"; // remove url parameters from share link, to view your items
        }
      } else {
        this.displayList();
      }
    },
    styleForView(view) {
      // We use zIndex instead of v-show or v-if, to preserve component scroll position, especially for ItemList.
      // We could use v-if for the other components (in fact, it would be preferable), but I had problems with that.
      return {
        zIndex: this.currentView === view ? 2 : 1
      };
    },
    options() {
      this.currentView = this.views.Options;
    },
    logout() {
      this.$emit("logout");
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
