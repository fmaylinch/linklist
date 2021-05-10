<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ subtitle }}
      </v-list-item-subtitle>
      <v-progress-linear
        height="1"
        :color="colorForItem(item)"
        :value="item.score">
      </v-progress-linear>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import Util from "@/util.js";

export default {
  name: 'ItemListItem',
  props: {
    item: Object
  },
  computed: {
    subtitle() {
      return Util.getTagsString(this.item);
    }
  },
  methods: {
    colorForItem(item) {
      return Util.colorFromScore(item.score);
    }
  }
}
</script>
