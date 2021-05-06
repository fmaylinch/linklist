<template>
  <div v-if="credentials">
    <slot />
  </div>
  <div v-else>
    <Login />
  </div>
</template>

<script>
// @ is an alias to /src
import { EventBus } from '@/event-bus.js';
import Login from "@/components/Login";
import Cookies from "js-cookie";

export default {
  name: 'Secured',
  components: {
    Login
  },
  created() {
    this.reloadCredentials();
    EventBus.$on('login', (credentials) => {
      console.log("Secured: received login event");
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
      Cookies.set("token", credentials.token, { sameSite: "strict" });
      Cookies.set("username", credentials.username, { sameSite: "strict" });
      this.reloadCredentials();
    });
    EventBus.$on('logout', () => {
      console.log("Secured: received logout event");
      this.removeCredentials();
    });
  },
  data: () => ({
    credentials: null
  }),
  methods: {
    removeCredentials() {
      console.log("Secured: removing credentials");
      Cookies.remove("token");
      Cookies.remove("username");
      this.credentials = null;
    },
    reloadCredentials() {
      const token = Cookies.get("token");
      const username = Cookies.get("username");
      if (token && username) {
        console.log("Secured: credentials found");
        this.credentials = { username, token }
      } else {
        console.log("Secured: credentials not found");
        this.credentials = null;
      }
    }
  }
}
</script>
