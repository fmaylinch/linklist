<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isEditing" @click="deleteItem()" icon><v-icon>mdi-delete</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-text-field v-model="itemForm.title" label="Title" />
          <v-text-field v-model="itemForm.url" label="Url" />
          <v-text-field v-model="itemForm.image" label="Image url" />
          <v-textarea v-model="itemForm.notes" label="Notes" auto-grow rows="1" />
          <v-text-field v-model="itemForm.tags" label="Tags" />
          <v-slider :color="sliderColor" label="Score" v-model="itemForm.score" min="0" max="100" />
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import {AppEvent, EventBus, UpdateAction} from "@/event-bus.js";
import Util from "@/util.js";

export default {
  props: {
    item: Object // route params that comes as props thanks to configuration in routes
  },
  data: () => ({
    itemForm: {}
  }),
  computed: {
    sliderColor() {
      return Util.colorFromScore(this.itemForm.score);
    },
    isEditing() {
      return this.item != null;
    },
    title() {
      return this.isEditing ? "Edit Item" : "Create Item";
    }
  },
  created() {
    // Note that we pass an object to params, the card won't be available if page is reloaded.
    // It will then think that we are going to create a new item. See computed title.
    this.itemForm = this.itemToForm(this.item);
  },
  beforeRouteLeave(to, from, next) {
    // When going back home, notify the action in the card
    if (from.name === "EditItem" && to.name === "Home") {
      EventBus.$emit(AppEvent.itemChanged, this.buildItemUpdate());
    }
    next();
  },
  methods: {
    deleteItem() {
      EventBus.$emit(AppEvent.itemChanged, {
        action: UpdateAction.delete,
        item: this.item
      });
      this.$router.go(-1); // go back to CardList
    },
    buildItemUpdate() {
      let item = this.formToItem(this.itemForm);
      return {
        action: this.decideAction(item),
        item: item
      };
    },
    decideAction(item) {
      if (item.title.length === 0)
        return UpdateAction.nothing;

      if (!this.item)
        return UpdateAction.update;

      if (Util.getItemRawContent(item) === Util.getItemRawContent(this.item))
        return UpdateAction.nothing;

      return UpdateAction.update;
    },
    formToItem(form) {
      return {
        id: form.id,
        title: form.title,
        url: form.url,
        image: form.image,
        notes: form.notes,
        tags: form.tags.trim().split(/[, ]+/).filter(it => !!it),
        score: form.score
      };
    },
    itemToForm(item) {
      if (item) {
        return {
          id: item.id,
          title: item.title,
          url: item.url,
          image: item.image,
          notes: item.notes,
          tags: item.tags.join(" "),
          score: item.score,
        };
      } else {
        return {
          id: null,
          title: "",
          url: "",
          image: "",
          notes: "",
          tags: "",
          score: 50,
        };
      }
    }
  }
};
</script>
