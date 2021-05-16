<template>
  <Secured
      ref="secured"
      @credentials-changed="updateCredentials">

    <Main
        v-if="displayMain"
        ref="main"
        :ctx="ctx"
        @logout="logout"
    />

  </Secured>
</template>

<script>
import Main from '@/components/Main';
import axios from 'axios';
import constants from '@/constants';
import Secured from '@/components/Secured';

export default {
  name: 'AppStart',
  components: {
    Secured,
    Main
  },
  data: () => ({
    ctx: { },
    displayMain: false
  }),
  created() {
    // TODO: test get url params for sharing link
    console.log("location", location.href);
    const queryString = window.location.search;
    console.log("queryString", queryString);
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      console.log(urlParams.get("user"));
      console.log(urlParams.get("tags").split(","));
    }
  },
  methods: {
    updateCredentials(credentials) {
      console.log("Main: update credentials", credentials);
      if (credentials) {
        this.ctx.credentials = credentials;
        this.ctx.axios = this.createAxiosInstance(credentials);
        this.displayMain = true;
      } else {
        this.displayMain = false;
      }
    },
    createAxiosInstance(credentials) {
      console.log("Creating axios instance");
      return axios.create({
        baseURL: constants.apiUrl,
        headers: { Authorization: "Bearer " + credentials.token }
      });
    },
    logout() {
      this.$refs.secured.logout();
    }
  },
  beforeRouteLeave(to, from, next) {
    console.log("Navigation intercepted")
    // This intercepts back button in browser,
    // but it also intercepts other route navigation, so in those cases we will
    // need to make an exception and call `next()`, not `next(false)`.
    next(false);
    // See how Main component handles this
    this.$refs.main.onNavigation(to, from);
  }
}
</script>
