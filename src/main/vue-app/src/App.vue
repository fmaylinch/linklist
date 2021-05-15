<template>
  <v-app>
    <transition>
      <!-- https://vuejs.org/v2/api/#keep-alive -->
      <!--
        Actually, the routes are not used so far.
        See
      -->
      <keep-alive include="Home">
        <router-view />
      </keep-alive>
    </transition>
  </v-app>
</template>

<style lang="scss">
body {
  background-color: #1E1E1E;
}
</style>
