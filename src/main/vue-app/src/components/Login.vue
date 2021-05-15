<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Login</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="loginOrRegister()"><v-icon>mdi-login</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container>
          <v-text-field v-model="loginData.username" label="username" auto-grow rows="1" />
          <v-text-field v-model="loginData.password" type="password" label="password" auto-grow rows="1" />
          <v-text-field v-model="loginData.password2" type="password" label="repeat password to register" auto-grow rows="1" />
          <p style="color: red">{{error}}</p>
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import axios from "axios";
import constants from "@/constants";
import {AppEvent} from '@/event-bus';

export default {
  name: 'Login',
  data: () => ({
    loginData: { username: "", password: "", password2: "" },
    error: ""
  }),
  methods: {
    loginOrRegister() {
      this.error = "";

      let action;
      if (!this.loginData.password2) {
        action = "login";
      } else if (this.loginData.password === this.loginData.password2) {
        action = "register";
      } else {
        this.error = "Passwords don't match";
        return;
      }
      console.log("Login: ", action);
      axios
        .post(constants.apiUrl + "/security/" + action, this.loginData)
        .then(resp => this.handleCredentials(resp.data))
        .catch(e => this.handleError(e));
    },
    handleCredentials(credentials) {
      console.log("Login: emitting event", AppEvent.login);
      this.$emit(AppEvent.login, credentials);
    },
    handleError(error) {
      this.error = error;
    }
  }
};
</script>
