<template>
  <div id="editDiv">
    <v-app-bar app dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-progress-circular v-if="loading" class="load-progress"
          :width="3" :size="20" indeterminate color="primary" />
      <v-spacer></v-spacer>
      <v-btn v-if="isDataCorrect && !readonly" @click="saveItem" icon><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="cancel" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-img v-if="itemForm.image" class="image" :src="itemForm.image" />
      <v-card flat tile>
        <v-container>
          <v-alert v-model="error.visible" color="red" dismissible type="error">{{ error.message }}</v-alert>
        </v-container>
        <v-container>
          <v-text-field :readonly="readonly" v-model="itemForm.title" label="Title" />
          <v-text-field :readonly="readonly" v-model="itemForm.author" label="Author" />
          <v-text-field :readonly="readonly" v-model="itemForm.url" label="Url"
              :append-outer-icon="itemForm.url ? 'mdi-open-in-new' : ''" @click:append-outer="openUrl"
              :append-icon="itemForm.url ? 'mdi-cloud-download' : ''" @click:append="getMetadataFromUrl" />
          <v-text-field :readonly="readonly" v-model="itemForm.image" label="Image url"
              :append-icon="itemForm.image ? 'mdi-open-in-new' : ''" @click:append="openImage" />
          <v-textarea :readonly="readonly" v-model="itemForm.notes" label="Notes"
                      auto-grow rows="1" />
          <v-text-field :readonly="readonly" v-model="itemForm.tags" label="Tags"
              :append-icon="itemForm.tags ? 'mdi-eye' : ''" @click:append="openTags" />
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


<style scoped lang="scss">
.load-progress {
  margin-left: 10px;
}
</style>


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
    error: { message: "", visible: false },
    loading: false
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
      this.error = { message: "", visible: false };
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
      Util.loadWithAxios("delete item", this, () =>
        this.ctx.axios
            .post("items/deleteOne", {id: this.item.id})
            .then(() => {
              // we send this.item and not resp.data, because we need this.item.index
              this.$emit("deleted", this.item);
            })
      );
    },
    saveItem() {
      const itemFromForm = this.formToItem(this.itemForm);
      Util.loadWithAxios("upsert item", this, () =>
        this.ctx.axios
            .post("items/upsertOne", itemFromForm)
            .then(resp => {
              if (this.isEditing) {
                this.$emit("updated", { newItem: resp.data, oldItem: this.item });
              } else {
                this.$emit("created", resp.data);
              }
            })
      );
    },
    handleError(e) {
      this.error = Util.messageObjectFromApiError(e);
      this.scrollToTop();
    },
    openUrl() {
      const url = this.itemForm.url;
      if (url) {
        window.open(url);
      }
    },
    getMetadataFromUrl() {
      console.log("Getting metadata from url: " + this.itemForm.url);
      const url = this.itemForm.url;
      if (url) {
        Util.loadWithAxios("metadata from url", this, () =>
          this.ctx.axios
              .post("metadata/getFromUrl", {url: this.itemForm.url})
              .then((resp) => {
                const item = resp.data;
                if (item) {
                  const itemForm = this.itemToForm(item);
                  if (!this.itemForm.title) { // keep existing title
                    this.itemForm.title = itemForm.title;
                  }
                  if (!this.itemForm.tags) { // keep existing tags
                    this.itemForm.tags = itemForm.tags;
                  }
                  this.itemForm.author = itemForm.author;
                  this.itemForm.image = itemForm.image;
                  this.itemForm.notes = itemForm.notes;
                  this.itemForm.score = itemForm.score;
                  this.itemForm.url = itemForm.url; // we may decide to change it, like in Spotify
                }
              })
        );
      }
    },
    openImage() {
      const url = this.itemForm.image;
      if (url) {
        window.open(url);
      }
    },
    openTags() {
      const tags = this.parseFormTags(this.itemForm.tags);
      this.$emit("display-tags", tags);
    },
    formToItem(form) {
      return {
        id: form.id,
        userId: form.userId,
        title: form.title,
        author: form.author,
        url: form.url,
        image: form.image,
        notes: form.notes,
        tags: this.parseFormTags(form.tags),
        score: form.score
      };
    },
    parseFormTags(tags) {
      return tags.trim().split(/[, ]+/).filter(it => !!it).map(it => it.toLowerCase());
    },
    itemToForm(item) {
      if (item) {
        return {
          id: item.id,
          userId: item.userId,
          title: item.title,
          author: item.author,
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
          author: "",
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
