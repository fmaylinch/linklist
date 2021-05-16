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
  },
  methods: {
    updateCredentials(credentials) {
      console.log("Main: update credentials", credentials);
      if (credentials) {
        this.ctx.credentials = credentials;
        this.ctx.axios = this.createAxiosInstance(credentials);
        const searchFromSharedLink = this.createSearchFromSharedLink();
        this.ctx.search = searchFromSharedLink || { username: credentials.username };
        this.ctx.viewingMyItems = this.ctx.credentials.username === this.ctx.search.username;
        this.ctx.viewingSharedLink = searchFromSharedLink !== null;
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
      return axios.create({
        baseURL: constants.apiUrl,
        headers: { Authorization: "Bearer " + credentials.token }
      });
    },
    logout() {
      this.$refs.secured.logout();
      location.href = "/"; // To remove possible url parameters, to view your items
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
