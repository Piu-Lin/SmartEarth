<template>
  <div id="cesiumContainer"></div>
  <NavMenu v-if="showMenu"></NavMenu>
  <img class="logo" src="/static/images/logo.png">
  <demo></demo>
</template>

<script setup>
import BigScreenMap from "@/Gis/BigScreenMap";
import NavMenu from "./menu";
import {onMounted, provide, ref} from "vue";
import demo from "./demo.vue";

let bigScreenMap = ref(null);
provide('bigScreenMap', bigScreenMap);

onMounted(() => {
  bigScreenMap.value = new BigScreenMap("cesiumContainer");
});

const showMenu = ref(true);
import {useRouter} from 'vue-router';

const router = useRouter();
if (router.currentRoute.value.query.showMenu) {
  showMenu.value = false;
}
</script>

<style lang="scss" scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}

.logo {
  position: absolute;
  z-index: 2;
  bottom: 5px;
  left: 0;
  width: 160px;
  pointer-events: none;
}

</style>
