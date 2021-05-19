<template>
  <div id="editDiv">
    <v-app-bar app dark>
      <v-toolbar-title>Edit Permission</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isDataCorrect" @click="savePermission" icon><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="cancel" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-alert
              v-model="error.visible"
              color="red"
              dismissible
              type="error"
          >{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field v-model="permissionForm.tags" label="Tags" />
          <div v-if="isDataCorrect">
            Share link: <a :href="shareLink()" target="_blank"> {{shareLink()}}</a>
          </div>
          <v-text-field v-model="permissionForm.usernames" label="Allowed usernames"
              placeholder="Leave empty to allow access to all users"/>
        </v-container>
      </v-card>
      <v-divider />
      <v-card flat tile>
        <v-container>
          <v-btn
              v-if="isEditing"
              @click="deletePermission"
              color="error"
              elevation="2">
            Delete <v-icon right>mdi-delete</v-icon>
          </v-btn>
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>

import Util from '@/util';

export default {
  name: 'PermissionEdit',
  props: {
    ctx: Object
  },
  data: () => ({
    permissionForm: {},
    permission: null,
    error: { message: "", visible: false }
  }),
  computed: {
    isEditing() {
      return this.permission != null;
    },
    isDataCorrect() {
      return this.permissionForm.tags && this.permissionForm.tags.trim();
    }
  },
  methods: {
    setPermission(permission) {
      this.error = { message: "", visible: false };
      this.permission = permission;
      this.permissionForm = this.permissionToForm(this.permission);
      // Since we reuse this component, reset the scroll because it could be currently in another position.
      this.scrollToTop();
    },
    scrollToTop() {
      document.getElementById("editDiv").scrollTop = 0;
    },
    cancel() {
      this.$emit("canceled");
    },
    deletePermission() {
      this.ctx.axios
          .post("permissions/deleteOne", {id: this.permission.id})
          .then(() => {
            // we send this.permission and not resp.data, because we need this.permission.index
            this.$emit("deleted", this.permission);
          })
          .catch(e => this.handleError(e));
    },
    savePermission() {
      const permissionFromForm = this.formToPermission(this.permissionForm);
      this.ctx.axios
          .post("permissions/upsertOne", permissionFromForm)
          .then(resp => {
            if (this.isEditing) {
              this.$emit("updated", {
                newPermission: resp.data,
                oldPermission: this.permission
              });
            } else {
              this.$emit("created", resp.data);
            }
          })
          .catch(e => this.handleError(e));
    },
    shareLink() {
      const permission = this.formToPermission(this.permissionForm);
      return Util.buildShareLink(permission.tags, this.ctx);
    },
    handleError(e) {
      this.error = Util.messageObjectFromApiError(e);
      this.scrollToTop();
    },
    formToPermission(form) {
      return {
        id: form.id,
        userId: form.userId,
        usernames: form.usernames.trim().split(/[, ]+/).filter(it => !!it),
        tags: form.tags.trim().split(/[, ]+/).filter(it => !!it)
      };
    },
    permissionToForm(permission) {
      if (permission) {
        return {
          id: permission.id,
          userId: permission.userId,
          usernames: permission.usernames.join(" "),
          tags: permission.tags.join(" ")
        };
      } else {
        return {
          id: null,
          userId: null,
          usernames: "",
          tags: ""
        };
      }
    }
  }
};
</script>
