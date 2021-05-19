<template>
  <div id="listDiv">
    <v-app-bar app dark>
      <v-toolbar-title>Permissions</v-toolbar-title>
      <div>
        <span style="margin-left: 10px; font-size: 75%;">
          {{ permissionCount }}
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-btn @click="close" icon><v-icon>mdi-close</v-icon></v-btn>
      <v-btn icon @click="addPermission"><v-icon>mdi-plus</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container>
          <v-alert v-model="error.visible" color="red" dismissible type="error">{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field
            clearable
            v-model="query"
            label="Search"
          />
        </v-container>
        <v-list>
          <!-- If the v-list-item is inside PermissionListItem, the @click handler doesn't work -->
          <v-list-item
            v-for="permission in searchedPermissions"
            :key="permission.id"
            @click="openPermission(permission)">
            <PermissionListItem :permission="permission" />
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
import PermissionListItem from '@/components/PermissionListItem';

export default {
  name: 'PermissionList',
  components: { PermissionListItem },
  props: {
    ctx: Object
  },
  created() {
    this.retrievePermissionsFromApi();
  },
  data: () => ({
    query: null,
    permissions: [],
    error: { message: "", visible: false }
  }),
  computed: {
    lowerSearch() {
      return this.query ? this.query.trim().toLowerCase() : "";
    },
    searchedPermissions: function() {
      if (!this.lowerSearch) {
        return this.permissions;
      }
      const parts = this.lowerSearch.split(/ +/)
        .map(x => x[0] === "#" ? x + " " : x); // Add space at the end of tag, for exact search
      return this.permissions.filter(it => {
        for (let part of parts) {
          // Search for all parts
          if (it.rawContent.indexOf(part) < 0) return false;
        }
        return true;
      });
    },
    permissionCount() {
      if (this.lowerSearch) {
        return this.searchedPermissions.length + " of " + this.permissions.length;
      } else {
        return this.permissions.length;
      }
    }
  },
  methods: {
    retrievePermissionsFromApi() {
      console.log("Loading permissions from API", this.ctx.search);
      this.ctx.axios
        .post("permissions/search")
        .then(resp => this.preparePermissions(resp.data))
        .catch(e => this.handleError(e));
    },
    preparePermissions(searchResult) {
      console.log("Preparing permissions", searchResult);
      this.fillRawContent(searchResult.permissions);
      this.sortAndSetPermissions(searchResult.permissions);
    },
    sortAndSetPermissions(permissions) {
      let byRawContent = (x,y) => {
        if (x.rawContent < y.rawContent) return -1;
        if (x.rawContent > y.rawContent) return 1;
        return 0;
      };
      permissions.sort(byRawContent);
      for (let i = 0; i < permissions.length; i++) {
        permissions[i].index = i;
      }
      this.permissions = permissions;
    },
    fillRawContent(permissions) {
      for (let permission of permissions) {
        Util.fillPermissionRawContent(permission);
      }
    },
    addPermission() {
      this.$emit("add-permission");
    },
    openPermission(item) {
      this.$emit("open-permission", item);
    },
    permissionUpdated(permissionUpdate) {
      Util.fillPermissionRawContent(permissionUpdate.newPermission);
      this.permissions[permissionUpdate.oldPermission.index] = permissionUpdate.newPermission;
      this.sortAndSetPermissions(this.permissions);
    },
    permissionAdded(permission) {
      Util.fillPermissionRawContent(permission);
      this.permissions.push(permission);
      this.sortAndSetPermissions(this.permissions);
    },
    permissionDeleted(permissionIndex) {
      this.permissions.splice(permissionIndex, 1);
      this.sortAndSetPermissions(this.permissions);
    },
    refreshPermissions() {
      this.retrievePermissionsFromApi();
    },
    scrollToTop() {
      document.getElementById("listDiv").scrollTop = 0;
    },
    close() {
      this.$emit("close");
    },
    handleError(e) {
      this.error = Util.messageObjectFromApiError(e);
      this.scrollToTop();
    }
  }
}
</script>
