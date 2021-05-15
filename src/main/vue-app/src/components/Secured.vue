<template>
  <div v-if="credentials">
    <slot />
  </div>
  <div v-else>
    <Login @login="login" />
  </div>
</template>

<script>
import Login from "@/components/Login";
import Cookies from "js-cookie";

export default {
  name: 'Secured',
  components: {
    Login
  },
  created() {
    this.reloadCredentials();
  },
  data: () => ({
    credentials: null
  }),
  methods: {
    login(credentials) {
      console.log("Secured: storing cookies for credentials");
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
      // TODO: store credentials object stringified
      Cookies.set("token", credentials.token, { sameSite: "strict" });
      Cookies.set("username", credentials.username, { sameSite: "strict" });
      this.reloadCredentials();
    },
    logout() {
      this.removeCredentials();
    },
    removeCredentials() {
      console.log("Secured: removing credentials");
      // TODO: store credentials object stringified
      Cookies.remove("token");
      Cookies.remove("username");
      this.updateCredentials(null);
    },
    reloadCredentials() {
      console.log("Secured: reloading credentials");
      // TODO: store credentials object stringified
      const token = Cookies.get("token");
      const username = Cookies.get("username");
      if (token && username) {
        console.log("Secured: credentials found");
        this.updateCredentials({ username, token });
      } else {
        console.log("Secured: credentials not found");
        this.removeCredentials();
      }
    },
    updateCredentials(credentials) {
      console.log("Secured: updating credentials");
      this.credentials = credentials;
      this.$emit("credentials-changed", credentials)
    }
  }
}
</script>
