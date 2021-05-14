import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import EditItem from '@/views/EditItem'
import Options from '@/views/Options.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: "/edit",
    name: "EditItem",
    component: EditItem,
    props: true
  },
  {
    path: '/options',
    name: 'Options',
    component: Options
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior (to, from, savedPosition) {
    // console.log("savedPosition", savedPosition);
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

export default router
