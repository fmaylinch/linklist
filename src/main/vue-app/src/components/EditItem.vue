<template>
  <div>
    <v-app-bar app dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <v-btn v-if="isEditing" @click="deleteItem" icon><v-icon>mdi-delete</v-icon></v-btn> -->
      <v-btn v-if="isDataCorrect" @click="saveItem" icon><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="close" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-text-field v-model="itemForm.title" label="Title" />
          <v-text-field v-model="itemForm.url" label="Url" />
          <v-text-field v-model="itemForm.image" label="Image url" />
          <v-textarea v-model="itemForm.notes" label="Notes"
                      auto-grow rows="1" />
          <v-text-field v-model="itemForm.tags" label="Tags" />
          <v-container />
          <v-slider v-model="itemForm.score" label="Score"
                    :color="sliderColor"
                    thumb-label="always"
                    min="0" max="100">
            <!-- <template v-slot:append>{{ itemForm.score }}</template> -->
          </v-slider>
        </v-container>
      </v-card>
      <v-divider />
      <v-card flat tile>
        <v-container>
          <v-btn v-if="isEditing" @click="deleteItem" elevation="2">Delete <v-icon right>mdi-delete</v-icon></v-btn>
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import Util from "@/util";

export default {
  name: 'EditItem',
  props: {
    ctx: Object
  },
  data: () => ({
    itemForm: {},
    item: null
  }),
  computed: {
    sliderColor() {
      return Util.colorFromScore(this.itemForm.score);
    },
    isEditing() {
      return this.item != null;
    },
    isDataCorrect() {
      return this.itemForm.title && this.itemForm.title.trim();
    },
    title() {
      return this.isEditing ? "Edit Item" : "Create Item";
    }
  },
  methods: {
    setItem(item) {
      console.log("EditItem:", item ? item.title : "(new item)");
      this.item = item;
      this.itemForm = this.itemToForm(this.item);
    },
    close() {
      this.$emit("close");
    },
    deleteItem() {
      this.$emit("delete", this.item);
    },
    saveItem() {
      if (this.isEditing) {
        this.$emit("update", {
          newItem: this.formToItem(this.itemForm),
          oldItem: this.item
        });
      } else {
        this.$emit("create", this.formToItem(this.itemForm));
      }
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
