<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>Item List</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout"><v-icon>mdi-logout</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-row>
        <v-col>
          Items here
        </v-col>
      </v-row>
    </v-main>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus.js';

export default {
  name: 'ItemList',
  methods: {
    logout() {
      EventBus.$emit('logout');
    }
  }
}
</script>
