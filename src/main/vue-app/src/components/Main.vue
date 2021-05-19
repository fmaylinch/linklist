<template>
    <div class="fixed-div">
      <ItemList
          class="fixed-div"
          ref="itemList"
          :style="styleForView(this.views.ItemList)"
          :ctx="ctx"
          @open-item="openItem"
          @add-item="addItem"
          @options="options"
          @permissions="displayPermissionList"
      />
      <ItemEdit
          class="fixed-div"
          ref="editItem"
          :style="styleForView(this.views.ItemEdit)"
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
          @items-uploaded="refreshItemList"
          @close="displayList"
          @permissions="permissions"
          @logout="logout"
      />
      <PermissionList
          class="fixed-div"
          ref="permissionList"
          :style="styleForView(this.views.PermissionList)"
          :ctx="ctx"
          @open-permission="openPermission"
          @add-permission="addPermission"
          @close="displayList"
      />
      <PermissionEdit
          class="fixed-div"
          ref="editPermission"
          :style="styleForView(this.views.PermissionEdit)"
          :ctx="ctx"
          @updated="permissionUpdated"
          @created="permissionCreated"
          @deleted="permissionDeleted"
          @canceled="displayPermissionList"
      />
    </div>
</template>

<script>
import ItemEdit from '@/components/ItemEdit';
import ItemList from '@/components/ItemList';
import Options from '@/views/Options';
import PermissionList from '@/components/PermissionList';
import PermissionEdit from '@/components/PermissionEdit';

export default {
  name: 'Main',
  components: {
    PermissionEdit,
    ItemList,
    ItemEdit,
    Options,
    PermissionList
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
      ItemEdit: "ItemEdit",
      Options: "Options",
      PermissionList: "PermissionList",
      PermissionEdit: "PermissionEdit"
    },
    // This component doesn't use routes. It just swaps different components.
    // We used some hacky CSS to avoid layout problems (see "fixed-div").
    // It would be great to find a better solution.
    currentView: null
  }),
  methods: {
    addItem() {
      this.displayItemEdit(null);
    },
    openItem(item) {
      console.log("Main: open item", item.id, item.title)
      this.displayItemEdit(item);
    },
    displayItemEdit(item) {
      // I wanted to use v-if to pass item as props and re-render EditItem, but it created some layout problems.
      // So, now I tell EditItem to refresh the item.
      this.$refs.editItem.setItem(item);
      // The setItem performs animations, so wait a little bit to change the view.
      setTimeout(() => {
        this.currentView = this.views.ItemEdit;
      }, 300);
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
    refreshItemList() {
      this.$refs.itemList.refreshItems();
      this.displayList();
    },
    displayList() {
      this.currentView = this.views.ItemList;
    },

    addPermission() {
      this.displayPermissionEdit(null);
    },
    openPermission(permission) {
      console.log("Main: open permission", permission.id, permission.tags)
      this.displayPermissionEdit(permission);
    },
    displayPermissionEdit(permission) {
      this.$refs.editPermission.setPermission(permission);
      setTimeout(() => {
        this.currentView = this.views.PermissionEdit;
      }, 300);
    },
    permissionUpdated(permissionUpdate) {
      console.log("Main: permission updated", permissionUpdate);
      this.$refs.permissionList.permissionUpdated(permissionUpdate);
      this.displayPermissionList();
    },
    permissionCreated(permission) {
      console.log("Main: permission created", permission.tags)
      this.$refs.permissionList.permissionAdded(permission);
      this.displayPermissionList();
    },
    permissionDeleted(permission) {
      console.log("Main: permission deleted", permission.id, permission.index, permission.tags)
      this.$refs.permissionList.permissionDeleted(permission.index);
      this.displayPermissionList();
    },
    refreshPermissionList() {
      this.$refs.permissionList.refreshPermissions();
      this.displayPermissionList();
    },
    displayPermissionList() {
      this.currentView = this.views.PermissionList;
    },

    handleError(e) {
      console.error("API Error", e);
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
    permissions() {
      this.currentView = this.views.PermissionList;
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
