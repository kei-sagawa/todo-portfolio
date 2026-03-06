<template>
  <router-view />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activePath = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath
  },
)
</script>
