<template>
  <Secured>
    <ItemList/>
  </Secured>
</template>

<script>
// @ is an alias to /src
import ItemList from '@/components/ItemList';
import Secured from "@/components/Secured";

export default {
  name: 'Home',
  components: {
    Secured,
    ItemList
  }}
</script>
