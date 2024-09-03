<template>
  <div class="cockpit-menu">
    <div class="menu-button" @click="openFly">飞行漫游</div>
    <div class="menu-button" @click="mapManageMethod">图层管理</div>
    <div class="menu-button" @click="openMeasure">测量</div>
  </div>
  <Fly class="tool-fly" ref="fly"></Fly>
  <Measure class="tool-measure" ref="measure"></Measure>
  <MapManage class="tool-map-manage" ref="mapManage"/>
</template>

<script setup>
import Fly from "@/Gis/tools/Fly";
import Measure from "@/Gis/tools/Measure";
import MapManage from "@/Gis/tools/MapManage";

import {ref, inject} from "vue";

const bigScreenMap = inject("bigScreenMap");

const fly = ref(null);

function openFly() {
  if (fly.value.visible) {
    fly.value.close();
  } else {
    fly.value.open();
  }
}

const mapManage = ref(null);

function mapManageMethod() {
  if (mapManage.value.visible) {
    mapManage.value.close();
  } else {
    mapManage.value.open();
  }
}

const measure = ref(null);

function openMeasure() {
  if (measure.value.visible) {
    measure.value.close();
  } else {
    measure.value.open();
  }
}

// 剖面分析模块
const particle = ref(null);
</script>

<style scoped>
.tool-fly {
  position: absolute;
  top: 5vh;
  left: 5vw;
}

.tool-map-manage {
  position: absolute;
  top: 35vh;
  left: 5vw;
}

.tool-measure {
  position: absolute;
  top: 71vh;
  left: 5vw;
}

.cockpit-menu {
  position: absolute;
  top: 2vh;
  right: 2vw;
  z-index: 2;
}

.menu-button {
  width: 5vw;
  height: 3vh;
  line-height: 3vh;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  margin-top: 1vh;
  color: #f8dc51;
}
</style>
