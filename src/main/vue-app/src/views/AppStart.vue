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
    console.log("Navigation intercepted")
    // This intercepts back button in browser,
    // but it also intercepts other route navigation, so in those cases we will
    // need to make an exception and call `next()`, not `next(false)`.
    next(false);
    // See how Main component handles this
    this.$refs.main.onNavigation(to, from);
  }
}
</script>
