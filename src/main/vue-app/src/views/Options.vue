<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Options</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-file-input v-model="uploadForm.file" label="File" />
          <v-text-field v-model="uploadForm.tags" label="Tags" />
          <v-btn @click="upload" elevation="2">Import CSV <v-icon right>mdi-cloud-upload</v-icon></v-btn>
        </v-container>
        <v-container>
          <v-alert
            v-model="uploadForm.error.visible"
            color="red"
            dismissible
            elevation="2"
            type="error"
          >{{ uploadForm.error.message }}</v-alert>
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
import { EventBus } from "@/event-bus.js";

export default {
  name: 'Options',
  data: () => ({
    uploadForm: {
      file: null,
      tags: "",
      error: { message: "", visible: false }
    }
  }),
  methods: {
    logout() {
      EventBus.$emit('logout');
      this.$router.go(-1);
    },
    upload() {
      console.log("tags", this.uploadForm.tags);
      console.log("file", this.uploadForm.file);

      if (!this.uploadForm.file) {
        this.uploadForm.error = { message: "Select a file", visible: true };
        return;
      }

      this.uploadForm.error = { message: "Not implemented yet", visible: true }; // TODO
    }
  }
};
</script>
