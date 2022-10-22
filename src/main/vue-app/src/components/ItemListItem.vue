<template>
    <v-list-item-content>
      <v-list-item-title style="color: #d7d451">
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle style="color: #50b5cc">
        {{ item.author }}
      </v-list-item-subtitle>
      <v-list-item-subtitle style="color: #8c8c8c">
        {{ item.notes }}
      </v-list-item-subtitle>
      <v-list-item-subtitle style="color: #8d65ab">
        {{ tags }}
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
    tags() {
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
