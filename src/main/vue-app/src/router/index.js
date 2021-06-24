import Vue from 'vue'
import VueRouter from 'vue-router'
//import Home from '@/views/Home.vue'
import Options from '@/views/Options.vue'
import AppStart from '@/views/AppStart';
import SampleView from '@/views/SampleView';

Vue.use(VueRouter)

const routes = [
/* We go directly to AppStart
  {
    path: '/',
    name: 'Home',
    component: Home
  },
*/
  {
    path: '/',
    name: 'AppStart',
    component: AppStart
  },
  {
    path: '/sample',
    name: 'SampleView',
    component: SampleView
  },
  {
    path: '/options',
    name: 'Options',
    component: Options
  }
]

const router = new VueRouter({
  // Without history mode, the url path is always the root (so Quarkus won't be confused)
  // Let's wee what we do when you share a list view (e.g. linklist.es/may/movie).
  //mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
