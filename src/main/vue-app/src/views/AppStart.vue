<template>
  <Main ref="main" />
</template>

<script>
import Main from '@/components/Main';

export default {
  name: 'AppStart',
  components: {
    Main
  },
  beforeRouteLeave(to, from, next) {
    console.log("Intercepting back button")
    next(false);
    this.$refs.main.backButtonPressed(to, from);
  }
}
</script>
