<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="method"><v-icon>mdi-cog</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile dark>
        <v-container>
          {{ message }}
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import Util from '@/util';

export default {
  name: 'SampleComponent',
  props: {
    ctx: Object
  },
  created() {
    this.message = "Component created"
  },
  data: () => ({
    title: "Sample component",
    message: null
  }),
  methods: {
    method() {
      const color = Util.colorFromScore(75);
      console.log("Color: " + color);
    }
  }
}
</script>
