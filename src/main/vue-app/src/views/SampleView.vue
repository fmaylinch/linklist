<template>
  <SampleComponent />
</template>

<script>
import SampleComponent from '@/components/SampleComponent';

export default {
  name: 'SampleView',
  components: {
    SampleComponent
  },
  beforeRouteLeave(to, from, next) {
    console.log("Going back")
    if (from.name === "A" && to.name === "B") {
      next();
    } else {
      next(false);
    }
  }
}
</script>
