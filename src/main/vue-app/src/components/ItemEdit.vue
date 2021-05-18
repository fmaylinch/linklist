<template>
  <div id="editDiv">
    <v-app-bar app dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isDataCorrect && !readonly" @click="saveItem" icon><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="cancel" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-card flat tile>
        <v-container>
          <v-alert
              v-model="error.visible"
              color="red"
              dismissible
              type="error"
          >{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field :readonly="readonly" v-model="itemForm.title" label="Title" />
          <v-text-field :readonly="readonly" v-model="itemForm.url" label="Url"
              :append-icon="itemForm.url ? 'mdi-open-in-new' : ''" @click:append="openUrl" />
          <v-text-field :readonly="readonly" v-model="itemForm.image" label="Image url"
              :append-icon="itemForm.image ? 'mdi-open-in-new' : ''" @click:append="openImage" />
          <v-textarea :readonly="readonly" v-model="itemForm.notes" label="Notes"
                      auto-grow rows="1" />
          <v-text-field :readonly="readonly" v-model="itemForm.tags" label="Tags" />
          <v-container />
          <v-slider :readonly="readonly"
                    v-model="itemForm.score"
                    label="Score"
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
          <v-btn
              v-if="isEditing && !readonly"
              @click="deleteItem"
              color="error"
              elevation="2">
            Delete <v-icon right>mdi-delete</v-icon>
          </v-btn>
        </v-container>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import Util from "@/util";

export default {
  name: 'ItemEdit',
  props: {
    ctx: Object
  },
  data: () => ({
    itemForm: {},
    item: null,
    error: { message: "", visible: false }
  }),
  computed: {
    readonly() {
     return this.ctx.viewingSharedLink;
    },
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
      if (this.readonly) return "View Item";
      return this.isEditing ? "Edit Item" : "Create Item";
    }
  },
  methods: {
    setItem(item) {
      console.log("EditItem:", item ? item.title : "(new item)");
      this.item = item;
      this.itemForm = this.itemToForm(this.item);
      // Since we reuse this component, reset the scroll because it could be currently in another position.
      this.scrollToTop();
    },
    scrollToTop() {
      document.getElementById("editDiv").scrollTop = 0;
    },
    cancel() {
      this.$emit("canceled");
    },
    deleteItem() {
      this.ctx.axios
          .post("items/deleteOne", {id: this.item.id})
          .then(() => {
            // we send this.item and not resp.data, because we need this.item.index
            this.$emit("deleted", this.item);
          })
          .catch(e => this.handleError(e));
    },
    saveItem() {
      const itemFromForm = this.formToItem(this.itemForm);
      this.ctx.axios
          .post("items/upsertOne", itemFromForm)
          .then(resp => {
            if (this.isEditing) {
              this.$emit("updated", {
                newItem: resp.data,
                oldItem: this.item
              });
            } else {
              this.$emit("created", resp.data);
            }
          })
          .catch(e => this.handleError(e));
    },
    handleError(e) {
      console.error("API Error", e);
      this.error = { message: e, visible: true };
      this.scrollToTop();
    },
    openUrl() {
      const url = this.itemForm.url;
      if (url) {
        window.open(url);
      }
    },
    openImage() {
      const url = this.itemForm.image;
      if (url) {
        window.open(url);
      }
    },
    formToItem(form) {
      return {
        id: form.id,
        userId: form.userId,
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
          userId: item.userId,
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
          userId: null,
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
