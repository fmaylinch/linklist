<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Options</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-file-input v-model="uploadForm.file" label="CSV File" accept=".csv" />
          <v-text-field v-model="uploadForm.tags" label="Tags for all items" prepend-icon="mdi-tag" />
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
import {AppEvent, EventBus} from "@/event-bus.js";
import constants from "@/constants.js";
import Cookies from "js-cookie";
import axios from "axios";

export default {
  name: 'Options',
  data: () => ({
    uploadForm: {
      file: null,
      tags: "",
      error: { message: "", visible: false }
    }
  }),
  created() {
    this.axiosInstance = this.createAxiosInstance();
  },
  methods: {
    createAxiosInstance() { // TODO: Refactor, this is also used in ItemsApi
      const token = Cookies.get("token");
      console.log("Creating axios instance");
      return axios.create({
        baseURL: constants.apiUrl,
        headers: { Authorization: "Bearer " + token }
      });
    },
    logout() {
      EventBus.$emit(AppEvent.logout);
      this.$router.go(-1);
    },
    upload() {
      if (!this.uploadForm.file) {
        this.uploadForm.error = { message: "Select a file", visible: true };
        return;
      }

      const formData = new FormData();
      formData.append('tags', this.uploadForm.tags);
      formData.append('file', this.uploadForm.file);

      console.log("Uploading...");
      this.axiosInstance
        .post("items/import", formData, { "Content-Type": "multipart/form-data" })
        .then(resp => {
          console.log(resp.data);
          this.uploadForm.error = { message: resp.data.error, visible: !!resp.data.error };
          if (!resp.data.error) {
            EventBus.$emit(AppEvent.refreshList);
            this.$router.go(-1);
          }
        })
        .catch(e => console.error(e));
    }
  }
};
</script>
