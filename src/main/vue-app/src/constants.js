import Vue from "vue";

// https://stackoverflow.com/questions/49257650/how-check-if-vue-is-in-development-mode
const devMode = Vue.config.devtools;
console.log("Development mode?", devMode);

export default {
  apiUrl: "https://linklist.onrender.com" // Don't forget http:// or https://
};
