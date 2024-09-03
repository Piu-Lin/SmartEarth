<template>
  <div class="testxiaoguo">
    <button class="feature-button" @click="modelLoad">导入固定目标</button>
    <button class="feature-button" @click="gridDrawing">网格</button>
    <button class="feature-button" @click="weixing">卫星轨迹</button>
    <button class="feature-button" @click="satelliteConfig">配置卫星</button>
    <button class="feature-button" @click="leida">导入雷达</button>
    <button class="feature-button" @click="tongxin">卫星与雷达通信</button>
    <button class="feature-button" @click="openModal('1')">雷达测试</button>
    <button class="feature-button" @click="openModal('2')">卫星测试</button>
    <button class="feature-button" @click="satelliteRange('加')">辐射范围增加</button>
    <button class="feature-button" @click="satelliteRange('减')">辐射范围减小</button>

  </div>
  <div class="move_model">
    <place-poly-model class="place_model" ref="model"></place-poly-model>
    <ChangeRadarModal ref="radarModal"></ChangeRadarModal>
    <SatelliteConfigModel ref="satelliteConfigModal"></SatelliteConfigModel>
  </div>
</template>

<script setup>
import PlacePolyModel from "@/Gis/tools/MapManage/module/PlacePolyModel.vue";
import SatelliteConfigModel from "@/Gis/tools/SatelliteConfig";
import bus from '@/utils/bus';
import { inject, nextTick, onMounted, ref } from "vue";
import ChangeRadarModal from './ChangeRadarModal.vue';
import { gridDrawingFun } from "./js/gridding.js";
import { addLeida, addPlane, addPlaneRate, reducePlane, reducePlaneRate, saomiao } from "./js/leida";
import { satelliteRangeFun } from "./js/leidaTest.js";
import { addModel } from "./js/modelLoad.js";
import { leidaAndweixingTongxin, signalAdd, signalReduce } from "./js/tongxing";
import { satellite } from "./js/weixingGuiji.js";

import { loadBall } from "./js/ball.js";
import { loadCzml } from "./js/czml.js";
import {
  drawCircleAroundSatellite,
  drawCone4
} from "./js/draw.js";
import { loadSatellite, loadSpaceShuttle, loadYacht } from "./js/models.js";


let colorArray = []
const bigScreenMap = inject("bigScreenMap");
// 获取添加标注点的组件引用
const model = ref(null);

const radarModal = ref(null)
const satelliteConfigModal = ref(null)

function rgbaStringToArray(rgbaString) {
  // 使用正则表达式提取 RGBA 值
  const rgbaPattern = /rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;
  const match = rgbaString.match(rgbaPattern);
  if (match) {
    // 提取并转换匹配的值
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = parseFloat(match[4]);
    return [r, g, b, a];
  } else {
    throw new Error('Invalid RGBA string');
  }
}

/**
 * 打开卫星配置界面
 */
function satelliteConfig() {
  satelliteConfigModal.value.open();
}

/**
 * 打开雷达测试弹窗
 * @param val
 */
function openModal(val) {
  bigScreenMap.value.viewer.entities.removeAll();
  radarModal.value.open(val)
}


/**
 * 加载卫星轨迹
 */
function weixing() {
  bigScreenMap.value.viewer.entities.removeAll();
  satellite(bigScreenMap.value.viewer);
}

/**
 * 改变雷达辐射范围
 * @param val
 */
function satelliteRange(val) {
  satelliteRangeFun(val);
}

/**
 * 加载模型
 */
function modelLoad() {
  bigScreenMap.value.viewer.entities.removeAll();
  addModel(bigScreenMap.value.viewer, model);
}

/**
 * 绘制网格
 */
function gridDrawing() {
  bigScreenMap.value.viewer.entities.removeAll();
  gridDrawingFun(bigScreenMap.value.viewer);
  bigScreenMap.value.flyTobyType('太空');
}


function radarSolidScan(options) {
  let positionArr = calculatePane(119.92403014202115, 29.259877196707844, 1000.0, 5.0);
  let coneEntity = options.viewer.entities.add({
    name: "雷达锥体扫描",
    position: Cesium.Cartesian3.fromDegrees(options.position[0], options.position[1], 100),
    cylinder: {
      length: options.height,
      topRadius: options.radius,
      bottomRadius: 0.0,
      material: options.color.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
    }
  });

  let heading = 0;
  // 每一帧刷新时调用
  options.viewer.clock.onTick.addEventListener(() => {
    heading += options.speed;
    positionArr = calculatePane(119.92403014202115, 29.259877196707844, 1000.0, heading);
  })

  // 创建1/4圆形立体墙
  let radarWall = options.viewer.entities.add({
    wall: {
      positions: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegreesArrayHeights(positionArr);
      }, false),
      material: options.color,
    }
  })

  function calculateSector(x1, y1, x2, y2) {
    let positionArr = [];
    positionArr.push(x1);
    positionArr.push(y1);
    positionArr.push(0);
    var radius = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(x1, y1), Cesium.Cartesian3.fromDegrees(x2, y2));
    // 扇形是1/4圆，因此角度设置为0-90
    for (let i = 0; i <= 90; i++) {
      let h = radius * Math.sin(i * Math.PI / 180.0);
      let r = Math.cos(i * Math.PI / 180.0);
      let x = (x2 - x1) * r + x1;
      let y = (y2 - y1) * r + y1;
      positionArr.push(x);
      positionArr.push(y);
      positionArr.push(h);
    }
    return positionArr;
  }

  function calculatePane(x1, y1, radius, heading) {
    var m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(x1, y1));
    var rx = radius * Math.cos(heading * Math.PI / 180.0);
    var ry = radius * Math.sin(heading * Math.PI / 180.0);
    var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
    var d = Cesium.Matrix4.multiplyByPoint(m, translation, new Cesium.Cartesian3());
    var c = Cesium.Cartographic.fromCartesian(d);
    var x2 = Cesium.Math.toDegrees(c.longitude);
    var y2 = Cesium.Math.toDegrees(c.latitude);
    return calculateSector(x1, y1, x2, y2);
  }
}


/**
 * 导入雷达
 */
function leida() {
  bigScreenMap.value.viewer.entities.removeAll();
  const dataSource = new Cesium.CustomDataSource("satellite_add");
  bigScreenMap.value.viewer.dataSources.add(dataSource);
  addLeida(dataSource, bigScreenMap.value);
  leida_saomiao();
}

/**
 * 雷达扫描
 */
function leida_saomiao() {
  saomiao(bigScreenMap.value.viewer, bigScreenMap.value);
}

/**
 * 雷达通信
 */
function tongxin() {
  bigScreenMap.value.viewer.entities.removeAll();
  const dataSource = new Cesium.CustomDataSource("leidaAndweixingTongxin");
  bigScreenMap.value.viewer.dataSources.add(dataSource);
  leidaAndweixingTongxin(bigScreenMap.value.viewer, bigScreenMap.value);
}

onMounted(() => {
  nextTick(() => {
    /** 模型位置 */
    const positions = {
      satellite: Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
      ball: Cesium.Cartesian3.fromDegrees(120.0988, 0, 4000),
      circle: Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
      spaceShuttle: Cesium.Cartesian3.fromDegrees(120.0988, 23.123, 5000),
      yacht: Cesium.Cartesian3.fromDegrees(120.0988, -25.023),
    };

    /** 加载模型 */
    // loadCzml(bigScreenMap.value.viewer);
    loadSatellite(bigScreenMap.value.viewer, positions["satellite"]); // 卫星
    loadBall(bigScreenMap.value.viewer, positions["ball"]); // 地面接收站球体
    loadSpaceShuttle(bigScreenMap.value.viewer, positions["spaceShuttle"]); // 航天飞机
    loadYacht(bigScreenMap.value.viewer, positions["yacht"]); // 游艇

    /** 绘制线条 */
    drawCircleAroundSatellite(bigScreenMap.value.viewer, positions["circle"]); // 卫星轨迹线
    drawCone4(bigScreenMap.value.viewer); // 卫星信号四棱锥
    bus.on('radarColor', (radarColor) => {
      colorArray = rgbaStringToArray(radarColor.value)
      saomiao(bigScreenMap.value.viewer, bigScreenMap.value, colorArray);
    })

    bus.on('add', () => {
      addPlane()
      saomiao(bigScreenMap.value.viewer, bigScreenMap.value, colorArray.length ? colorArray : '');
    })
    bus.on('reduce', () => {
      reducePlane()
      saomiao(bigScreenMap.value.viewer, bigScreenMap.value, colorArray.length ? colorArray : '');
    })
    bus.on('addRate', () => {
      addPlaneRate()
      saomiao(bigScreenMap.value.viewer, bigScreenMap.value, colorArray.length ? colorArray : '');
    })
    bus.on('recudeRate', () => {
      reducePlaneRate()
      saomiao(bigScreenMap.value.viewer, bigScreenMap.value, colorArray.length ? colorArray : '');
    })
    bus.on('addFrequency', () => {
      signalAdd()
      leidaAndweixingTongxin(bigScreenMap.value.viewer, bigScreenMap.value);
    })
    bus.on('recudeFrequency', () => {
      signalReduce()
      leidaAndweixingTongxin(bigScreenMap.value.viewer, bigScreenMap.value);
    })
  })
})
</script>

<style>
.testxiaoguo {
  width: 6vw;
  /*height: 20vh;*/
  background: rgba(30, 187, 238, 0.5);
  position: absolute;
  top: 4vh;
  left: 1vw;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.move_model {
  background: rgba(30, 187, 238, 1);
  position: absolute;
  top: 4vh;
  left: 10vw;
  text-align: center;
}

.feature-button {
  width: 5vw;
  display: block;
  margin: 3px auto;
  /*margin-top: ;*/
}

.xt-panel-content {
  padding: 9px 24px;
  /*min-height: 200px;*/
}
</style>
