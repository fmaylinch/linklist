import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import swRegister from './sw/swRegister'

console.log("Calling swRegister()");
swRegister().then(result => {
  document.querySelector("#debug-message").textContent = result;
});

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
