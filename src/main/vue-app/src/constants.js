import Vue from "vue";

// https://stackoverflow.com/questions/49257650/how-check-if-vue-is-in-development-mode
const devMode = Vue.config.devtools;
console.log("Development mode?", devMode);

export default {
  apiUrl: "http://130.193.46.10:8070/" // Now the backend is in another place
};
