<template>
  <Secured
      ref="secured"
      :bypass="ctx.viewingSharedLink"
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
  },
  methods: {
    updateCredentials(credentials) {
      console.log("Main: update credentials", credentials);

      const searchFromSharedLink = this.createSearchFromSharedLink();
      this.ctx.viewingSharedLink = searchFromSharedLink !== null;

      this.ctx.credentials = credentials;
      this.ctx.axios = this.createAxiosInstance(credentials);

      let displayMain = credentials || this.ctx.viewingSharedLink;
      if (displayMain) {
        this.ctx.search = searchFromSharedLink || {username: credentials.username};
        this.ctx.viewingMyItems = credentials && credentials.username === this.ctx.search.username;
        this.displayMain = true;
      } else {
        this.displayMain = false;
      }
    },
    createSearchFromSharedLink() {
      const queryString = window.location.search;
      if (!queryString) {
        return null;
      }
      const urlParams = new URLSearchParams(queryString);
      return {
        username: urlParams.get("user"),
        tags: urlParams.get("tags").split(",")
      }
    },
    createAxiosInstance(credentials) {
      console.log("Creating axios instance");
      const config = {
        baseURL: constants.apiUrl
      };
      if (credentials) {
        config.headers = { Authorization: "Bearer " + credentials.token };
      }
      return axios.create(config);
    },
    logout() {
      this.$refs.secured.logout();
      location.href = "/"; // To remove possible url parameters, to view your items
    }
  },
  beforeRouteLeave(to, from, next) {
    // If AppStart is the start view (see `router/index.js`), navigation interception might not work
    console.log("Navigation intercepted")
    // This intercepts back button in browser,
    // but it also intercepts other route navigation, so in those cases we will
    // need to make an exception and call `next()`, not `next(false)`.
    next(false);
    // See how Main component handles this
    if (this.displayMain) {
      this.$refs.main.onNavigation(to, from);
    }
  }
}
</script>
