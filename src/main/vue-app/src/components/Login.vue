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
          <v-alert v-model="info.visible" dismissible type="info">{{ info.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field v-model="loginData.username" label="username" auto-grow rows="1" />
          <v-text-field v-model="loginData.password" type="password" label="password" auto-grow rows="1" />
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
    error: { visible: false },
    info: { visible: false },
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
      let url = constants.apiUrl + "/security/" + action;
      console.log("Login with url: ", url);

      Util.loadWithAxios("login", this, () =>
          axios
              .post(url, this.loginData)
              .then(resp => this.handleCredentials(resp.data))
      );
    },
    handleCredentials(credentials) {
      // const tokenPart = credentials.token ? credentials.token.substr(0, 10) + "..." : "(none)";
      // this.info = { message: "Received user " + credentials.username + " and token " + tokenPart, visible: true }
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
