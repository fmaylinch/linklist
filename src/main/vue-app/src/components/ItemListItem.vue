<template>
    <v-list-item-content>
      <v-img class="image" :src="item.image" />
      <v-list-item-title class="item-title" style="color: #d7d451">
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle style="color: #50b5cc">
        {{ item.author }}
      </v-list-item-subtitle>
      <v-list-item-subtitle style="color: #8c8c8c">
        {{ item.notes }}
      </v-list-item-subtitle>
      <v-list-item-subtitle class="item-tags" style="color: #8d65ab">
        {{ tags }}
      </v-list-item-subtitle>
      <v-progress-linear
          class="item-score"
          height="2"
          :color="colorForItem(item)"
          :value="item.score">
      </v-progress-linear>
    </v-list-item-content>
</template>

<style scoped lang="scss">
.item-title {
  margin-top: 5px;
}
.item-tags {
  margin-bottom: 5px;
}
.item-score {
  margin-bottom: 5px;
}
.image {
  height: 250px;
}
</style>

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
