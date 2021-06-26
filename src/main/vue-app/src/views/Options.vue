<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Options</v-toolbar-title>
      <v-progress-circular v-if="loading" class="load-progress"
          :width="3" :size="20" indeterminate color="primary" />
      <v-spacer></v-spacer>
      <v-btn @click="close" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-alert
              v-model="error.visible"
              color="red"
              dismissible
              elevation="2"
              type="error"
          >{{ error.message }}</v-alert>
        </v-container>
      </v-card>
      <v-card flat tile>
        <v-container>
          <v-file-input v-model="uploadForm.file" label="CSV File" accept=".csv" />
          <v-text-field v-model="uploadForm.tags" label="Tags for all items" prepend-icon="mdi-tag" />
          <v-btn @click="upload" elevation="2">Import CSV <v-icon right>mdi-cloud-upload</v-icon></v-btn>
        </v-container>
      </v-card>
      <v-divider />
      <v-card flat tile>
        <v-container>
          <v-btn @click="permissions" elevation="2">Permissions <v-icon right>mdi-lock</v-icon></v-btn>
        </v-container>
      </v-card>
      <v-divider />
      <v-card flat tile>
        <v-container>
          <v-btn @click="logout" elevation="2">Logout <v-icon right>mdi-logout</v-icon></v-btn>
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>

import Util from '@/util';

export default {
  name: 'Options',
  props: {
    ctx: Object
  },
  data: () => ({
    uploadForm: {
      file: null,
      tags: ""
    },
    error: { message: "", visible: false },
    loading: false
  }),
  methods: {
    logout() {
      this.$emit("logout");
    },
    permissions() {
      this.$emit("permissions");
    },
    close() {
      this.$emit("close");
    },
    upload() {
      if (!this.uploadForm.file) {
        this.error = { message: "Select a file", visible: true };
        return;
      }

      if (this.uploadForm.file.size > 1024 * 1024) {
        this.error = { message: "The file is too big. Max 1MB.", visible: true };
        return;
      }

      const formData = new FormData();
      formData.append('tags', this.uploadForm.tags);
      formData.append('file', this.uploadForm.file);

      Util.loadWithAxios("import CSV", this, () =>
        this.ctx.axios
            .post("items/import", formData, { "Content-Type": "multipart/form-data" })
            .then(resp => {
              this.error = { message: resp.data.error, visible: !!resp.data.error };
              if (!resp.data.error) {
                this.$emit("items-uploaded");
              }
            })
      );
    },
    handleError(e) {
      console.error("Error: " + e);
      this.error = { message: e, visible: true };
    }
  }
};
</script>

<style scoped lang="scss">
.load-progress {
  margin-left: 10px;
}
</style>
