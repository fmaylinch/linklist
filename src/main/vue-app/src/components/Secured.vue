<template>
  <div v-if="credentials || bypass">
    <slot />
  </div>
  <div v-else>
    <Login @login="login" />
    <!--
      <v-alert dismissible>{{ message }}</v-alert>
    -->
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
  props: {
    bypass: Boolean
  },
  data: () => ({
    credentials: null,
    message: "debug message",
  }),
  methods: {
    login(credentials) {
      console.log("Secured: storing cookies for credentials");
      this.message += ", storing cookies for credentials";
      const cookie = JSON.stringify(credentials);
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
      Cookies.set("credentials", cookie, { sameSite: "strict", expires: 30 });
      // this.reloadCredentials(); // TODO: in mobile, cookies are sometimes not found, even after setting them
      this.updateCredentials(credentials);
    },
    logout() {
      this.removeCredentials();
    },
    removeCredentials() {
      console.log("Secured: removing credentials");
      Cookies.remove("credentials");
      this.updateCredentials(null);
    },
    reloadCredentials() {
      console.log("Secured: reloading credentials");
      this.message += ", reloading credentials";
      const cookie = Cookies.get("credentials");
      if (cookie) {
        console.log("Secured: credentials found");
        this.message += ", credentials found";
        this.updateCredentials(JSON.parse(cookie));
      } else {
        console.log("Secured: credentials not found");
        this.message += ", credentials NOT found";
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
