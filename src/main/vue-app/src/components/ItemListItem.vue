<template>
    <v-list-item-content>
      <v-list-item-title>
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ subtitle }}
      </v-list-item-subtitle>
      <v-list-item-subtitle style="color: #6d6d6d">
        {{ subtitle2 }}
      </v-list-item-subtitle>
      <v-progress-linear
        height="1"
        :color="colorForItem(item)"
        :value="item.score">
      </v-progress-linear>
    </v-list-item-content>
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
      return this.item.notes;
    },
    subtitle2() {
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
