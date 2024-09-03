<template>
  <div id="cesiumContainer"></div>
  <div class="btn-home" @click="flyHome()">
    <el-icon title="Home"><Refresh /></el-icon>
  </div>
  <div class="btn-location" @click="getLocation()">
    <el-icon><Aim /></el-icon>
<!--    <el-icon><LocationInformation /></el-icon>-->
    <p class="pfont">定位</p>
  </div>
  <div class="btn-switch" @click="switchPickedType()">
    <el-icon><Switch /></el-icon>
    <p class="pfont">{{ pickedType }}</p>
  </div>
  <div v-if="isBtn" class="submit-button" @click="submit()">确定</div>
<!--  <img class="logo" src="/static/images/logo2.png">-->
</template>

<script setup>
import SelectionMap from "@/Gis/SelectionMap";
import {onMounted, provide, ref} from "vue";

let script = document.createElement("script");
script.src = "https://res.wx.qq.com/open/js/jweixin-1.3.2.js";
document.getElementsByTagName("head")[0].appendChild(script);

let selectionMap = ref(null);
provide('selectionMap',selectionMap);

import { useRouter } from 'vue-router';
const router = useRouter();
const isBtn = ref(false);
const pickedType = ref("");
if (router.currentRoute.value.query.isBtn) {
  isBtn.value = router.currentRoute.value.query.isBtn;
}

onMounted(() => {
  selectionMap.value = new SelectionMap("cesiumContainer");
  if (router.currentRoute.value.query.pickedType) {
    selectionMap.value.pickedType = router.currentRoute.value.query.pickedType;
    pickedType.value = router.currentRoute.value.query.pickedType;
  }
});

const flyHome = () => {
  selectionMap.value.zoomTo(
      {
        longitude: 120.38461859899995,
        latitude: 30.849458808886137,
        height: 14922.809769754049,
        heading: 6.011646531364401,
        pitch: -1.4940782049987664,
        roll: 6.272457046025057,
      }
  );
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
          let latitude = position.coords.latitude; //获取纬度
          let longitude = position.coords.longitude; //获取经度
          selectionMap.value.viewer.entities.removeAll();
          selectionMap.value.addJumpMark(selectionMap.value.viewer,{coordinate:{x: longitude, y: latitude, z: 20},image:'/static/images/marker/industry2.png'});
          selectionMap.value.flyTo({x: longitude, y: latitude, z: 20,heading: Cesium.Math.toRadians(0),pitch: Cesium.Math.toRadians(-90),roll: Cesium.Math.toRadians(0)});
        }
    );
  }
}
getLocation();

const switchPickedType = () => {
  if (pickedType.value === '点位') {
    selectionMap.value.viewer.entities.removeAll();
    selectionMap.value.pickedType = "建筑";
    pickedType.value = "建筑";
  } else {
    selectionMap.value.pickedType = "点位";
    pickedType.value = "点位";
    if (!selectionMap.value.pickedEntityCLICK) return;
    selectionMap.value.pickedEntityCLICK.color = Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.01);
  }
}

const submit = () => {
  // wx.miniProgram.navigateTo({url: '/pages/index/index'});
  wx.miniProgram.postMessage({ data: selectionMap.value.pickedPosition });
  wx.miniProgram.navigateBack();
}

window.addEventListener('message',(e) => {
  let value = e.data;
  if (!value) return;
  if (value.type === 'flyToCamera') {
    selectionMap.value.flyTo(value.data);
  }
  if (value.type === 'flyToMarker') {
    selectionMap.value.flyTo({...value.data,heading: Cesium.Math.toRadians(0),pitch: Cesium.Math.toRadians(-90),roll: Cesium.Math.toRadians(0)});
  }
  if (value.type === 'addMarker') {
    selectionMap.value.addMark(selectionMap.value.viewer,value.data);
  }
  if (value.type === 'removeAll') {
    selectionMap.value.viewer.entities.removeAll();
  }
  if (value.type === 'setPickedType') {
    selectionMap.value.pickedType = value.data;
  }
  if (value.type === 'setPicked') {
    // let tiles = selectionMap.value.tileVisible??[];
    // for (let i = tiles.length - 1; i >= 0; i--) {
    //   for (let j = 0; j < tiles[i].content._features.length; j++) {
    //     let feature = tiles[i].content._features[j];
    //     if (feature.getProperty("_id") === value.data) {
    //       feature.color = Cesium.Color.fromCssColorString("#f6d603").withAlpha(0.7);
    //     }
    //   }
    // }
    selectionMap.value.viewer.scene.primitives._primitives.forEach(primitive => {
      if (primitive.name === 'monomer') {
        let event = primitive.tileVisible.addEventListener((tile) => {
          tile.content._features.forEach(feature => {
            if (feature.getProperty("_id") === value.data) {
              feature.color = Cesium.Color.fromCssColorString("#f6aa09").withAlpha(0.7);
              // primitive.tileVisible.removeEventListener(event);
            }
          })
        });
      }
    })
  }
}, false);
</script>

<style scoped lang="scss">
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
.submit-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 32px;
  line-height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  margin-top: 1vh;
  color: #f8dc51;
}
.btn-switch {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #0fb2b3;
  cursor: pointer;
  padding: 5px;
  width: 40px;
  height: 40px;
  font-size: 1rem;
  border-radius: 10px;
  text-align: center;
  .pfont {
    font-size: 0.6rem;
    color: #b8cbcb;
    margin-top: -5px;
  }
}
.btn-location {
  position: absolute;
  bottom: 130px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #0fb2b3;
  cursor: pointer;
  padding: 5px;
  width: 40px;
  height: 40px;
  font-size: 1rem;
  border-radius: 10px;
  text-align: center;
  .pfont {
    font-size: 0.6rem;
    color: #b8cbcb;
    margin-top: -5px;
  }
}
.btn-home {
  position: absolute;
  bottom: 180px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #0fb2b3;
  cursor: pointer;
  padding: 5px;
  width: 40px;
  height: 40px;
  font-size: 1.8rem;
  border-radius: 10px;
  text-align: center;
}
</style>
