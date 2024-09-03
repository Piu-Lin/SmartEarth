<template>
  <div class="testxiaoguo">
    <button class="feature-button" @click="modelLoad">导入固定目标</button>
    <button class="feature-button" @click="moveModel">网格</button>
    <button class="feature-button" @click="weixing">卫星轨迹</button>
    <button class="feature-button" @click="leida">导入雷达</button>
    <button class="feature-button" @click="leida_saomiao">雷达扫描</button>
    <button class="feature-button" @click="tongxin">卫星与雷达通信</button>
    <button class="feature-button" @click="openModal('1')">雷达测试</button>
    <button class="feature-button" @click="openModal('2')">卫星测试</button>
    <button class="feature-button" @click="satelliteRange('加')">辐射范围增加</button>
    <button class="feature-button" @click="satelliteRange('减')">辐射范围减小</button>

  </div>
  <div class="move_model">
    <place-poly-model class="place_model" ref="model"></place-poly-model>
    <ChangeRadarModal ref="radarModal"></ChangeRadarModal>
  </div>
</template>

<script setup>
import {inject, nextTick, onMounted} from "vue";
import {ref} from "vue";

import PlacePolyModel from "@/Gis/tools/MapManage/module/PlacePolyModel.vue";
import ChangeRadarModal from './ChangeRadarModal.vue'
import {addLeida, saomiao, addPlane, reducePlane, addPlaneRate, reducePlaneRate} from "./js/leida";
import state, {leidaAndweixingTongxin, signalAdd, signalReduce} from "./js/tongxing"
import {reactive, toRefs} from "vue";
import bus from '@/utils/bus'

let colorArray = []
onMounted(() => {
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

const bigScreenMap = inject("bigScreenMap");
let start = null;
let rrStates = [];
let arrStates = [];
let stop = null;

// 图层信息
let mapInfo = {};

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

// 获取添加标注点的组件引用
const model = ref(null);

const {radarRadius} = toRefs(state);
// function changeScanPlane () {
//   changePlane()
//   saomiao(bigScreenMap.value.viewer, bigScreenMap.value);
// }
const radarModal = ref(null)

function openModal(val) {
  // console.log(val,'val')
  // saomiao(bigScreenMap.value.viewer, bigScreenMap.value);
  radarModal.value.open(val)
}

// 添加模型
function addModel() {
  model.value.pId = mapInfo.id;
  model.value.open();
}

/**
 * 加载卫星轨迹
 */
function weixing() {
  bigScreenMap.value.viewer.entities.removeAll();
  satellite();
}

// 卫星
function satellite() {
  start = new Cesium.JulianDate.fromDate(new Date());  // 获取当前时间 这不是国内的时间
  start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate());  // 添加八小时，得到我们东八区的北京时间
  stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());  // 设置一个结束时间，意思是360秒之后时间结束
  bigScreenMap.value.viewer.clock.startTime = start.clone();   // 给cesium时间轴设置开始的时间，也就是上边的东八区时间
  bigScreenMap.value.viewer.clock.stopTime = stop.clone();     // 设置cesium时间轴设置结束的时间
  bigScreenMap.value.viewer.clock.currentTime = start.clone(); // 设置cesium时间轴设置当前的时间
  bigScreenMap.value.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;  // 时间结束了，再继续重复来一遍
  //时间变化来控制速度 // 时间速率，数字越大时间过的越快
  bigScreenMap.value.viewer.clock.multiplier = 2;
  //给时间线设置边界
  console.log(start, "start");
  console.log(stop, "stop");
  bigScreenMap.value.viewer.zoomTo(start, stop);

  rrStates = [];
  getRandState(arrStates, 1);
  startFunc();
}


function mySatePosition() {
  this.lon = 0;
  this.lat = 0;
  this.hei = 700000;          //卫星高度
  this.phei = 700000 / 2;     //轨道高度
  this.time = 20;
}

/**
 * 计算圆周飞行
 * @param source
 * @param panduan
 * @returns {*}
 */
function computeCirclularFlight(source, panduan) {
  console.log(source, panduan, 'source')
  var property = new Cesium.SampledPositionProperty();
  if (panduan == 1) {      //卫星位置
    for (var i = 0; i < source.length; i++) {
      var time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate);
      var position = Cesium.Cartesian3.fromDegrees(source[i].lon, source[i].lat, source[i].hei);
      // 添加位置，和时间对应
      property.addSample(time, position);
    }
  } else if (panduan == 2) {//轨道位置
    for (var i = 0; i < source.length; i++) {
      var time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate);
      var position = Cesium.Cartesian3.fromDegrees(source[i].lon, source[i].lat, source[i].phei);
      // 添加位置，和时间对应
      property.addSample(time, position);
    }
  }
  return property;
}

function getRandState(brr, count) {
  for (var m = 0; m < count; m++) {
    var arr = [];
    var t1 = Math.floor(Math.random() * 360);
    var t2 = Math.floor(Math.random() * 360);
    for (var i = t1; i <= 360 + t1; i += 30) {
      var aaa = new mySatePosition();
      aaa.lon = t2;
      aaa.lat = i;
      aaa.time = i - t1;
      arr.push(aaa);
    }
    brr.push(arr);
  }
}

let range = 450000

function satelliteRange(val) {
  if (val === '加') {
    range += 50000
  } else {
    range -= 50000
  }
  startFunc()
}

let entity_ty1

function getStatePath(aaa) {
  var entity_ty1p = computeCirclularFlight(aaa, 2);
  if (entity_ty1 !== null) {
    bigScreenMap.value.viewer.entities.remove(entity_ty1)
  }
  entity_ty1 = bigScreenMap.value.viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
      start: start,
      stop: stop
    })]),
    position: entity_ty1p,   //轨道高度
    orientation: new Cesium.VelocityOrientationProperty(entity_ty1p),
    cylinder: {
      HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      length: 700000,
      topRadius: 0,
      bottomRadius: range,
      // material: Cesium.Color.RED.withAlpha(.4),
      // outline: !0,
      numberOfVerticalLines: 0,
      // outlineColor: Cesium.Color.RED.withAlpha(.8),
      material: Cesium.Color.fromBytes(35, 170, 242, 80)
    },
  });
  entity_ty1.position.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
  });

  var test = bigScreenMap.value.viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
      start: start,
      stop: stop
    })]),
    position: computeCirclularFlight(aaa, 1),
    orientation: new Cesium.VelocityOrientationProperty(entity_ty1p),
    cylinder: {
      HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      length: 2000000,
      topRadius: 0,
      bottomRadius: 2000000 / 6,
      numberOfVerticalLines: 0,
      // outlineColor: Cesium.Color.RED.withAlpha(.8),
      material: Cesium.Color.YELLOWGREEN
    },
  });
  test.position.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
  });

  var entity1p = computeCirclularFlight(aaa, 1);
  //创建实体
  var entity1 = bigScreenMap.value.viewer.entities.add({
    // 将实体availability设置为与模拟时间相同的时间间隔。
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
      start: start,
      stop: stop
    })]),
    position: entity1p,//计算实体位置属性
    //基于位置移动自动计算方向.
    orientation: new Cesium.VelocityOrientationProperty(entity1p),
    //加载飞机模型
    model: {
      uri: '/static/model/weixing.glb',
      scale: 100000
    },
    //路径
    path: {
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.PINK
      }),
      width: 5
    }
  });
  //差值器
  entity1.position.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
  });
  console.log(entity1, 'entity1')
  // 更新相机位置（上帝视角）
  bigScreenMap.value.viewer.trackedEntity = entity1;
}

function startFunc() {
  for (var i = 0; i < arrStates.length; i++) {
    getStatePath(arrStates[i]);
  }
}

const modelX = ref(81);

const modelY = ref(0);

const modelZ = ref(0);


/**
 * 119.9247192204435, y: 29.260174000228226, z: 87.10647828935416
 * 加载模型
 */
function modelLoad() {
  bigScreenMap.value.viewer.entities.removeAll();
  const longitude = 119.92403014202115;
  const latitude = 29.259877196707844;
  const height = 87.10647828935416;
  const distance = 500;
  const dataSource = new Cesium.CustomDataSource("model_load");
  bigScreenMap.value.viewer.dataSources.add(dataSource);
  const handModel = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  // 转经纬度高度
  const modelDegree = getDegrees(handModel);
  let data = {
    position: {
      x: modelDegree.x,
      y: modelDegree.y,
      z: modelDegree.z,
    },
    orientation: {
      h: modelX.value,
      p: modelY.value,
      r: modelZ.value,
    }
  };
  const orientation = getOrientation(data);
  dataSource.entities.add({
    position: handModel,
    orientation: orientation,
    model: {
      uri: '/static/model/leida.glb',
      scale: 5
    }
  });
  // 视角飞到模型位置
  bigScreenMap.value.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + distance),
    orientation: {
      roll: 0.0 // 期望的视角滚动角（可选）
    },
    duration: 3 // 动画持续时间，以秒为单位（可选）
  });
  addModel();
}

// 世界坐标转为经纬度
function getDegrees(cart) {
  let ellipsoid = bigScreenMap.value.viewer.scene.globe.ellipsoid;
  let cartograhphic = ellipsoid.cartesianToCartographic(cart);
  let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
  let lon = Cesium.Math.toDegrees(cartograhphic.longitude);
  let alt = cartograhphic.height;
  return {x: lon, y: lat, z: alt};
}

function getOrientation(data) {
  let {x, y, z} = data.position;
  let {h, p, r} = data.orientation;
  h = (h / 180) * Math.PI;
  p = (p / 180) * Math.PI;
  r = (r / 180) * Math.PI;
  let position = Cesium.Cartesian3.fromDegrees(+x, +y, +z);
  let hpr = new Cesium.HeadingPitchRoll(+h, +p, +r);
  let orientation = new Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
  );
  return orientation;
}

function moveModel() {
  let LineRGB = {'0': "", "1": "#33FFFF", "2": "#FF33FF"}
  let markk = 0
  const entities = bigScreenMap.value.viewer.entities;
  for (let pHeight = 0; pHeight < 1000000; pHeight += 500000) {
    markk += 1
    for (let lang = -180, level = 0; lang <= 180; lang += 10) {
      let text = "";
      if (lang === 0) {
        text = "p0";
      }
      text = "p" + level
      if (lang === -180) {
        text = "p0";
      }
      level += 1

      entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            lang,
            -90,
            pHeight,
            lang,
            0,
            pHeight,
            lang,
            90,
            pHeight,
          ]),
          width: 1.0,
          material: Cesium.Color.fromCssColorString(LineRGB[markk]),
        },
        label: {
          text: text,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
        },

      });
      for (let labellevel = -90; labellevel <= 90; labellevel += 10) {
        entities.add({
          position: Cesium.Cartesian3.fromDegrees(lang + 5, labellevel),
          label: {
            text: "p" + (labellevel + level + 90),
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            font: "12px sans-serif",
            fillColor: Cesium.Color.WHITE,
          },

        });
      }

    }
    let langS = [];
    for (let lang = -180; lang <= 180; lang += 5) {
      langS.push(lang);
    }
    //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
    for (let lat = -80; lat <= 80; lat += 10) {
      let text = "";
      //text += "" + lat + "°";
      if (lat === 0) {
        text = "";
      }
      entities.add({
        // position: Cesium.Cartesian3.fromDegrees(0, lat),
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
              langS
                  .map((long) => {
                    return [long, lat, pHeight].join(",");
                  })
                  .join(",")
                  .split(",")
                  .map((item) => Number(item))
          ),
          width: 1.0,
          // material: Cesium.Color.WHITE,
          material: Cesium.Color.fromCssColorString(LineRGB[markk]),

        },
      });
    }
  }
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
  // radarSolidScan({
  //   viewer: bigScreenMap.value.viewer,
  //   position: [119.92403014202115, 29.259877196707844],
  //   radius: 1000.0,
  //   height: 1000.0,
  //   color: new Cesium.Color(1.0, 1.0, 0.0, 0.3),
  //   speed: 5.0
  // })
  const dataSource = new Cesium.CustomDataSource("satellite_add");
  bigScreenMap.value.viewer.dataSources.add(dataSource);
  addLeida(dataSource, bigScreenMap.value);
}


/**
 * 雷达扫描
 */
function leida_saomiao() {
  saomiao(bigScreenMap.value.viewer, bigScreenMap.value);
}

function tongxin() {
  const dataSource = new Cesium.CustomDataSource("leidaAndweixingTongxin");
  bigScreenMap.value.viewer.dataSources.add(dataSource);
  leidaAndweixingTongxin(bigScreenMap.value.viewer, bigScreenMap.value);
}

onMounted(() => {
  nextTick(() => {
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
