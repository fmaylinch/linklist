<template>
    <v-list-item-content>
      <v-list-item-title>
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ subtitle }}
      </v-list-item-subtitle>
      <v-progress-linear height="1" color="grey darken-3" value="100" />
    </v-list-item-content>
</template>

<script>

export default {
  name: 'PermissionListItem',
  props: {
    permission: Object
  },
  computed: {
    title() {
      return this.permission.tags.join(" ");
    },
    subtitle() {
      if (this.permission.usernames.length === 0) {
        return "(all users)";
      }
      return this.permission.usernames.join(" ");
    }
  }
}
</script>
