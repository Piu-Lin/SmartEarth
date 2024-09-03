<template>
  <panel-container ref="panelContainer" title="热力图" :visible="visible" v-if="visible" @close="close"
    @miniaturized="miniaturized">
    <template v-slot:panel-content>
      <div class="container">
        <div class="control-panel">
          <div class="btns">
            <el-button type="primary" @click="addHotMap">添加热力图</el-button>
            <el-button type="danger" @click="removeHotMap">清除图层 </el-button>
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import { ref, inject } from "vue";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let heatEntity = ref(null);
let canAdd = ref(true);

function open() {
  visible.value = !visible.value;
  if (!visible.value) {
    removeHotMap();
  }
}

function close() {
  removeHotMap();
  visible.value = false;
}

function miniaturized() {
  visible.value = false;
}

defineExpose({
  visible,
  open,
  close,
  miniaturized,
});

// 添加
const addHotMap = () => {
  if (canAdd.value) {
    let data = getData(1500, 120.38091730286874, 30.829199870913023, 120.38100985664026, 30.83507427735311);
    let heatMap = createHeatMap(data.max, data);
    // 创建矩形
    heatEntity.value = gisViewer.value.viewer.entities.add({
      show: true,
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(120.37291730286874, 30.829199870913023, 120.38100985664026, 30.83500427735311),
        material: heatMap._renderer.canvas, // 核心语句，填充热力图
      },
    });
    canAdd.value = false;
  }
};

// 清除
const removeHotMap = () => {
  canAdd.value = true;
  gisViewer.value.viewer.entities.remove(heatEntity.value);
  if (document.getElementById("heatDiv") != null) {
    document.body.removeChild(document.getElementById("heatDiv"));
  }
};

// 创建热力图
function createHeatMap(max, data) {
  // 创建元素
  let heatDoc = document.createElement("div");
  heatDoc.setAttribute("id", "heatDiv");
  heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
  document.body.appendChild(heatDoc);
  // 创建热力图对象
  let heatmap = h337.create({
    container: heatDoc,
    radius: 20,
    maxOpacity: .5,
    minOpacity: 0,
    blur: .75,
    gradient: {
      '0.9': 'red',
      '0.8': 'orange',
      '0.7': 'yellow',
      '0.5': 'blue',
      '0.3': 'green',
    },
  });
  // 添加数据
  heatmap.setData({
    max: max,
    data: data.data
  });
  return heatmap;
}

// 生成len个随机数据
function getData(len, lonMin, latMin, lonMax, latMax) {
  //构建一些随机数据点
  let points = [];
  let max = 100;
  let width = 1000;
  let height = 1000;
  let dataRaw = [];
  for (let i = 0; i < len; i++) {
    let point = {
      lat: latMin + Math.random() * (latMax - latMin),
      lon: lonMin + Math.random() * (lonMax - lonMin),
      value: Math.floor(Math.random() * 100)
    };
    dataRaw.push(point);
  }
  for (let i = 0; i < len; i++) {
    let dataItem = dataRaw[i];
    let point = {
      x: Math.floor((dataItem.lat - latMin) / (latMax - latMin) * width),
      y: Math.floor((dataItem.lon - lonMin) / (lonMax - lonMin) * height),
      value: Math.floor(dataItem.value)
    };
    max = Math.max(max, dataItem.value);
    points.push(point);
  }
  return { max: max, data: points }
}
</script>

<style scoped>
.container {
  margin-top: 1vh;
  margin-bottom: 1vh;
}
</style>
