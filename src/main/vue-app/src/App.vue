<template>
  <v-app>
    <transition>
      <keep-alive>
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
