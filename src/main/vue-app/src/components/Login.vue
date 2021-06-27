<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Login</v-toolbar-title>
      <v-progress-circular v-if="loading" class="load-progress"
          :width="3" :size="20" indeterminate color="primary" />
      <v-spacer></v-spacer>
      <v-btn icon @click="loginOrRegister()"><v-icon>mdi-login</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container>
          <v-alert v-model="error.visible" color="red" dismissible type="error">{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field v-model="loginData.username" label="username" auto-grow rows="1" />
          <v-text-field v-model="loginData.password" type="password" label="password" auto-grow rows="1" />
          <v-text-field v-model="loginData.password2" type="password" label="repeat password to register" auto-grow rows="1" />
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import constants from "@/constants";
import Util from '@/util';

export default {
  name: 'Login',
  data: () => ({
    loginData: { username: "", password: "", password2: "" },
    error: { message: "", visible: false },
    loading: false
  }),
  methods: {
    loginOrRegister() {
      let action;
      if (!this.loginData.password2) {
        action = "login";
      } else if (this.loginData.password === this.loginData.password2) {
        action = "register";
      } else {
        this.error = { message: "Passwords don't match", visible: true };
        return;
      }
      console.log("Login: ", action);

      Util.loadWithAxios("login", this, () =>
          axios
              .post(constants.apiUrl + "/security/" + action, this.loginData)
              .then(resp => this.handleCredentials(resp.data))
      );
    },
    handleCredentials(credentials) {
      this.$emit("login", credentials);
    },
    handleError(e) {
      this.error = Util.messageObjectFromApiError(e);
    }
  }
};
</script>

<style scoped lang="scss">
.load-progress {
  margin-left: 10px;
}
</style>
