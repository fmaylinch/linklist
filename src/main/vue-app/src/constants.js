import Vue from "vue";

// https://stackoverflow.com/questions/49257650/how-check-if-vue-is-in-development-mode
const devMode = Vue.config.devtools;
console.log("Development mode?", devMode);

export default {
  // Don't forget http:// or https://
  //apiUrl: "https://linklist.onrender.com"
  //apiUrl: "http://localhost:8090"
  apiUrl: "https://linklistz.herokuapp.com"
};
