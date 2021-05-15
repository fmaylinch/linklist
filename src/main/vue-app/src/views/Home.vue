<template>
    <div />
</template>

<script>

export default {
  name: 'Home',
  created() {
    // Although we rarely use routes, we start navigating to a route
    // because from there we can intercept the browser back button
    this.$router.push({ name: "AppStart" });
  }
}
</script>
