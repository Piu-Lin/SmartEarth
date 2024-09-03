<template>
  <panel-container
      ref="panelContainer"
      title="飞行漫游"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-fly-panel transition-box"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <el-button class="xt-paths-addButton" @click="addFlightPath" block>添加飞行路径</el-button>
      <div class="xt-paths" v-for="(path, i) in formData" :key="i">
        <div class="xt-paths-title">
          <div class="xt-paths-title-text">
            <i
                v-if="path.visible.list"
                class="icon iconfont xt-icon-down"
                @click="showOrHideList(path.id)"
            ></i>
            <i v-else class="icon iconfont xt-icon-right" @click="showOrHideList(path.id)"></i>
            <span v-if="!path.visible.pathname">{{ path.name }}</span>
            <input v-model="path.name" v-else class="xt-paths-title-input"/>
          </div>
          <div class="xt-paths-title-button">
            <i
                :title="TOOLTIP.PLAY"
                class="icon iconfont xt-icon-start"
                v-show="path.visible.play"
                @click="play(path.id)"
            ></i>
            <i
                :title="TOOLTIP.PAUSE"
                class="icon iconfont xt-icon-stop1"
                v-show="!path.visible.play"
                @click="pause(path.id)"
            ></i>
            <i :title="TOOLTIP.STOP" class="icon iconfont xt-icon-stop" @click="stop(path.id)"></i>
            <i
                :title="TOOLTIP.ADD"
                class="icon iconfont xt-icon-add"
                @click="addPointToPath(path.id)"
            ></i>
            <i
                :title="TOOLTIP.SAVE"
                v-show="path.visible.save"
                class="icon iconfont xt-icon-save"
                @click="savePath(path.id)"
            ></i>
            <i
                :title="TOOLTIP.SAVE"
                v-show="!path.visible.save"
                class="icon iconfont xt-icon-notsave xt-color-gray"
            ></i>
            <i
                :title="TOOLTIP.EDIT"
                class="icon iconfont xt-icon-path-edit"
                @click="modifyFlightPathName(path.id)"
            ></i>
            <i
                :title="TOOLTIP.DELETE"
                class="icon iconfont xt-icon-delete"
                @click="deletePath(path.id)"
            ></i>
          </div>
        </div>
        <div v-show="path.visible.list" class="xt-paths-divider"></div>
        <div
            class="xt-paths-list"
            v-show="path.visible.list"
            v-for="(point, j) in path.points"
            :key="j"
        >
          <div class="xt-paths-item">
            <div class="xt-paths-item-text">
              <i class="icon iconfont xt-icon-position"></i>
              <span
                  v-if="!point.visible.pointname"
                  @dblclick="flyToPoint(path.id, point.id)"
              >{{ point.name }}</span>
              <input v-model="point.name" v-else class="xt-paths-item-input"/>
            </div>
            <div class="xt-paths-item-button">
              <input class="xt-paths-item-input" type="number" v-model="point.time"/>
              <span>s</span>
              <i
                  :title="TOOLTIP.EDIT"
                  class="icon iconfont xt-icon-path-edit"
                  @click="modifyPointName(path.id, point.id)"
              ></i>
              <i
                  :title="TOOLTIP.DELETE"
                  class="icon iconfont xt-icon-delete"
                  @click="deletePoint(path.id, point.id)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import {guid} from "@/Gis/utils/coding.js";
import localFlightStorage from "./storage/localFlightStorage.js";
import {inject, ref, reactive, computed, watch} from "vue";

const gisViewer = inject("bigScreenMap");

const DEFAULT = {
  FLIGHTPATHNAME: "路径",
  FLIGHTPOINTNAME: "点位"
};
const FlightEntity = "FlightEntity";
const FlightListener = "FlightListener";

const TOOLTIP = reactive({
  PLAY: "播放",
  PAUSE: "暂停",
  STOP: "停止",
  ADD: "添加",
  SAVE: "保存",
  EDIT: "编辑",
  DELETE: "删除"
});
const visible = ref(false);
const formData = ref([]);
const selectedIndex = ref(0);
const startTime = ref(null);
const stopTime = ref(null);
const endTime = ref(null);
const speed = ref(90);

function open() {
  visible.value = true;
  loadFlightPath();
}

function close() {
  let flightEntity = gisViewer.value.tempGlobal[FlightEntity];
  if (Cesium.defined(flightEntity)) {
    stop(flightEntity.id);
  }
  formData.value = [];
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

//播放
function play(id) {
  let flightEntity = gisViewer.value.tempGlobal[FlightEntity];
  let flightListener = gisViewer.value.tempGlobal[FlightListener];
  if (Cesium.defined(flightEntity) && Cesium.defined(flightListener)) {
    //播放暂停
    if (flightEntity.id === id) {
      gisViewer.value.viewer.clock.shouldAnimate = true;
      forEachPathTodo(id, function (item, i) {
        item.visible.play = false;
      });
    } else {
      forEachPathTodo(flightEntity.id, function (item, i) {
        item.visible.play = true;
      });
      stop(flightEntity.id);
      play(id);
    }
  } else {
    createFlightPathPlayer(id);
    forEachPathTodo(id, function (item, i) {
      item.visible.play = false;
    });
  }
}

//暂停
function pause(id) {
  gisViewer.value.viewer.clock.shouldAnimate = false;
  forEachPathTodo(id, function (item, i) {
    item.visible.play = true;
  });
}

//停止
function stop(id) {
  let flightEntity = gisViewer.value.tempGlobal[FlightEntity];
  let flightListener = gisViewer.value.tempGlobal[FlightListener];
  if (Cesium.defined(flightEntity)) {
    if (flightEntity.id === id) {
      forEachPathTodo(flightEntity.id, function (item, i) {
        item.visible.play = true;
      });
      if (Cesium.defined(flightListener)) {
        removeSceneListener(flightListener);
      }
      if (Cesium.defined(flightEntity)) {
        gisViewer.value.viewer.entities.remove(flightEntity);
        gisViewer.value.removeTempGlobal(FlightEntity);
      }
      gisViewer.value.viewer.camera.lookAtTransform(
          Cesium.Matrix4.IDENTITY
      );
    }
  }
}

//显示或者隐藏列表
function showOrHideList(id) {
  forEachPathTodo(id, function (item, i) {
    item.visible.list = !item.visible.list;
  });
}

function loadFlightPath() {
  //TODO:从数据库里查询加载
  formData.value = [];
  formData.value.push({ "id": "8e36f107898748db93ebaccbaa74bbc3", "name": "飞行路径", "points": [ { "id": "e83761c6bece4c0eb1e5c20bc04711c9", "name": "点位", "x": 120.37415961716509, "y": 30.83080718846067, "z": 179.95423142052488, "heading": 0.1320006382470993, "pitch": -0.6115314532812857, "range": 179.95423142052488, "time": "0.00", "visible": { "pointname": false } }, { "id": "119dc6ecb6c74dba83ba8f0f0a6ae8e5", "name": "点位", "x": 120.37422643217121, "y": 30.831910890323847, "z": 86.60020032492517, "heading": 0.04605479481004959, "pitch": -0.672830049571675, "range": 86.60020032492517, "time": 5.71, "visible": { "pointname": false } }, { "id": "c7d7c3f0ba0948b892e9bfa0c0739e0e", "name": "点位", "x": 120.3739234341697, "y": 30.833152648299837, "z": 97.7478210718148, "heading": 0.12543244880836646, "pitch": -0.8031020161475411, "range": 97.7478210718148, "time": 5.57, "visible": { "pointname": false } }, { "id": "9801915b885e44c3ad4711df5534bbba", "name": "点位", "x": 120.37318040934767, "y": 30.834457561989694, "z": 134.527242332571, "heading": 2.4736883860492216, "pitch": -0.8442428544080682, "range": 134.527242332571, "time": 5.84, "visible": { "pointname": false } }, { "id": "aac02b95701d4cc4ab7bc7889b30a3da", "name": "点位", "x": 120.37476815561865, "y": 30.834642306548794, "z": 134.58769415521903, "heading": 2.4736883788588804, "pitch": -0.844242862508823, "range": 134.58769415521903, "time": 5.7, "visible": { "pointname": false } }, { "id": "ae8748a14087413188bcff470a87f97e", "name": "点位", "x": 120.37569055023677, "y": 30.83512762907576, "z": 115.17513272477682, "heading": 3.3062918396729994, "pitch": -0.6728334506606113, "range": 115.17513272477682, "time": 5.17, "visible": { "pointname": false } }, { "id": "5f79a58ea5c4446eae0a7e846822f9e1", "name": "点位", "x": 120.37584069999798, "y": 30.834100280979865, "z": 114.83896512850355, "heading": 3.3062918321766457, "pitch": -0.6728333940607012, "range": 114.83896512850355, "time": 5.28, "visible": { "pointname": false } }, { "id": "3798d7809ab3411598260d2baa6c85f1", "name": "点位", "x": 120.37725090820302, "y": 30.83409792227735, "z": 210.0837805671759, "heading": 4.221795608333503, "pitch": -0.7893681810307545, "range": 210.0837805671759, "time": 5.83, "visible": { "pointname": false } }, { "id": "ec7904eef3e34f4792ae972e81ac82e2", "name": "点位", "x": 120.38571639119476, "y": 30.843644574038304, "z": 1133.8227890156832, "heading": 3.8874413185994765, "pitch": -0.8049117205087244, "range": 1133.8227890156832, "time": 12.02, "visible": { "pointname": false } }, { "id": "7eb955da76734f29bc30abe65bda1ba3", "name": "点位", "x": 120.39485841321014, "y": 30.855660342312213, "z": 1137.755703499627, "heading": 3.887441791655153, "pitch": -0.8049122129408701, "range": 1137.755703499627, "time": 13.71, "visible": { "pointname": false } }, { "id": "46eb24265d084b95bc645d5f114668ea", "name": "点位", "x": 120.38557811415505, "y": 30.863722092553846, "z": 845.0116674423696, "heading": 3.232730782265625, "pitch": -0.7706379059269892, "range": 845.0116674423696, "time": "14.37", "visible": { "pointname": false } }, { "id": "ebb49ad1f2b7466c9e06b07de4d23621", "name": "点位", "x": 120.38545901057029, "y": 30.861043794129014, "z": 259.2590884226274, "heading": 3.3646615880494233, "pitch": -0.7500687581715422, "range": 259.2590884226274, "time": "7.30", "visible": { "pointname": false } }, { "id": "1b484d4722ef4e61bf185f664465d245", "name": "点位", "x": 120.38202800190078, "y": 30.85945126304936, "z": 231.27812290417944, "heading": 1.8444266111468552, "pitch": -0.6266560847580127, "range": 231.27812290417944, "time": "4.15", "visible": { "pointname": false } }, { "id": "a2c6c888a28246d499c1847dd39e60b7", "name": "点位", "x": 120.3832556630142, "y": 30.857189568650455, "z": 201.85248950354162, "heading": 0.686985540007977, "pitch": -0.7020743230329485, "range": 201.85248950354162, "time": "3.09", "visible": { "pointname": false } }, { "id": "a6e8d50b4fbe4a00b1d07a9488337613", "name": "点位", "x": 120.38446620777982, "y": 30.8570338251774, "z": 155.8721795219578, "heading": 0.686985552592235, "pitch": -0.7020743411704125, "range": 155.8721795219578, "time": 2.4, "visible": { "pointname": false } }, { "id": "273e0a5195024dc3bb91bf118589408f", "name": "点位", "x": 120.38648528173401, "y": 30.854420771650044, "z": 236.83418108659254, "heading": 6.137048130167884, "pitch": -0.7157871366128781, "range": 236.83418108659254, "time": "3.97", "visible": { "pointname": false } }, { "id": "5e846d44aac54f8ab2b8cb978d1c7faf", "name": "点位", "x": 120.3872349665909, "y": 30.85283098410935, "z": 190.16043662674093, "heading": 6.097258958917008, "pitch": -0.5580929176084917, "range": 190.16043662674093, "time": 3.18, "visible": { "pointname": false } }, { "id": "22ef78090f8943b5876b105dc4e9094a", "name": "点位", "x": 120.38483407268959, "y": 30.853459231749884, "z": 236.20210479444594, "heading": 1.9393560824274214, "pitch": -0.7089325213256767, "range": 236.20210479444594, "time": 3.72, "visible": { "pointname": false } }, { "id": "722ab2efbfe4483ca6c121e06bb5de6b", "name": "点位", "x": 120.38547596165714, "y": 30.849590444650893, "z": 212.67955787651857, "heading": 1.675367816942078, "pitch": -0.6060890677618724, "range": 212.67955787651857, "time": "4.82", "visible": { "pointname": false } }, { "id": "b965875d146a49dea147412accc06671", "name": "点位", "x": 120.38767753063142, "y": 30.849574424776375, "z": 79.382300366002, "heading": 1.675367817369123, "pitch": -0.6060890676972086, "range": 79.382300366002, "time": 3.77, "visible": { "pointname": false } }, { "id": "5e9428e14eea431e9080d9e26c1e34ce", "name": "点位", "x": 120.38835007951586, "y": 30.850094635207398, "z": 83.37570464503388, "heading": 2.9179687768048144, "pitch": -0.660939675495742, "range": 83.37570464503388, "time": 2.96, "visible": { "pointname": false } }, { "id": "e6f78d3f76d84c05a2a5022a989a84b7", "name": "点位", "x": 120.38884100538513, "y": 30.849830836939464, "z": 91.89463263982977, "heading": 3.922822931366981, "pitch": -0.7637862196802363, "range": 91.89463263982977, "time": 2.62, "visible": { "pointname": false } }, { "id": "3aa6a524b9e64d0d98a50340775a949c", "name": "点位", "x": 120.3902796880581, "y": 30.850527589533367, "z": 175.2719967345047, "heading": 3.9555232186504683, "pitch": -0.6677981945840621, "range": 175.2719967345047, "time": 2.98, "visible": { "pointname": false } }, { "id": "38ca4e8095854b358b5b72254482aa32", "name": "点位", "x": 120.391960398061, "y": 30.84860722393649, "z": 307.59845233544036, "heading": 4.96753156024136, "pitch": -0.7500714297137399, "range": 307.59845233544036, "time": "3.31", "visible": { "pointname": false } }, { "id": "7e01856f022b4af283e93cd44abef325", "name": "点位", "x": 120.39199199939094, "y": 30.847011011613965, "z": 307.0760102078189, "heading": 4.967531479937481, "pitch": -0.7500714521938803, "range": 307.0760102078189, "time": 2.97, "visible": { "pointname": false } }, { "id": "d406e6477dbc4682ab09f742b017bd8e", "name": "点位", "x": 120.38965309907857, "y": 30.847243790063043, "z": 61.613509272968706, "heading": 4.967531479937481, "pitch": -0.7500714521938798, "range": 61.613509272968706, "time": "3.70", "visible": { "pointname": false } }, { "id": "bf29143710ec43188f6f76928bef5600", "name": "点位", "x": 120.3883937332736, "y": 30.846754721543363, "z": 103.69570888385682, "heading": 0.7628215188061507, "pitch": -0.8186348822800964, "range": 103.69570888385682, "time": 2.54, "visible": { "pointname": false } }, { "id": "a447b202a70b4056b75c2d4b3270b84d", "name": "点位", "x": 120.38829713561427, "y": 30.844997731903323, "z": 216.95441677866143, "heading": 0.28760361107945176, "pitch": -0.6677960239107628, "range": 216.95441677866143, "time": "2.51", "visible": { "pointname": false } }, { "id": "4a5c39e20b4b43b4a01ae9950a7d01a0", "name": "点位", "x": 120.38541444935007, "y": 30.833918017290117, "z": 860.7964561183976, "heading": 0.28760366925223124, "pitch": -0.6677962732653393, "range": 860.7964561183976, "time": 10.71, "visible": { "pointname": false } } ], "totaltime": 153.9, "visible": { "pathname": false, "list": true, "play": true, "save": true } });
  let list = localFlightStorage.fetch();
  list.forEach((item, i) => {
    item.visible = {
      pathname: false,
      list: true,
      play: true,
      save: false
    };
    formData.value.push(item);
  });
}

//添加飞行路径
function addFlightPath() {
  let id = guid();
  formData.value.push({
    id: id,
    name: DEFAULT.FLIGHTPATHNAME,
    points: [],
    totaltime: 0,
    visible: {
      pathname: false,
      list: true,
      play: true,
      save: false
    }
  });
}

//遍历飞行路径，根据id执行输入操作
function forEachPathTodo(id, func) {
  formData.value.forEach((item, i) => {
    if (id === item.id) {
      func(item, i);
    }
  });
}

//遍历点位，根据id执行输入操作
function forEachPointTodo(pathid, pointid, func) {
  forEachPathTodo(pathid, function (item, i) {
    item.points.forEach((point, i) => {
      if (point.id === pointid) {
        func(point, i);
      }
    });
  });
}

//点击修改飞行路径名称
function modifyFlightPathName(id) {
  forEachPathTodo(id, function (item, i) {
    item.visible.pathname = !item.visible.pathname;
  });
}

//删除路径
function deletePath(id) {
  forEachPathTodo(id, function (item, i) {
    formData.value.splice(i, 1);
    localFlightStorage.delete(id);
  });
}

//保存路径
function savePath(id) {
  forEachPathTodo(id, function (item, i) {
    let list = localFlightStorage.fetch();
    let isexist = false;
    list.forEach((path, j) => {
      if (path.id === id) {
        isexist = true;
      }
    });
    if (isexist) {
      localFlightStorage.update(id, item);
    } else {
      list.push(item);
      localFlightStorage.save(list);
    }
    item.visible.save = false;
    // console.log(JSON.stringify(item))
  });
  // console.log(JSON.stringify(formData.value))
}

//向路径中添加点位
function addPointToPath(id) {
  let camera = gisViewer.value.viewer.camera;
  let cartographic = camera.positionCartographic;
  let x = Cesium.Math.toDegrees(cartographic.longitude);
  let y = Cesium.Math.toDegrees(cartographic.latitude);
  let z = cartographic.height > 0 ? cartographic.height : 0;
  let heading = camera.heading;
  let pitch = camera.pitch;
  let range = z;

  forEachPathTodo(id, function (item, i) {
    //计算当前视图与前一视图的距离
    let d = 0;
    if (item.points.length > 0) {
      let point = item.points[item.points.length - 1];
      let preCartographic = {
        longitude: Cesium.Math.toRadians(point.x),
        latitude: Cesium.Math.toRadians(point.y),
        height: point.z
      };
      d = calculateDistance(cartographic, preCartographic);
    }
    let time = (d / speed.value).toFixed(2);
    let pointId = guid();
    item.points.push({
      id: pointId,
      name: DEFAULT.FLIGHTPOINTNAME,
      x: x,
      y: y,
      z: z,
      heading: heading,
      pitch: pitch,
      range: range,
      time: time,
      visible: {
        pointname: false
      }
    });
  });
}

//修改点位名称
function modifyPointName(pathid, pointid) {
  forEachPointTodo(pathid, pointid, function (point, i) {
    point.visible.pointname = !point.visible.pointname;
  });
}

//删除点位
function deletePoint(pathid, pointid) {
  forEachPathTodo(pathid, function (item, i) {
    for (let j = 0; j < item.points.length; j++) {
      if (item.points[j].id === pointid) {
        item.points.splice(j, 1);
      }
    }
  });
}

function flyToPoint(pathid, pointid) {
  forEachPointTodo(pathid, pointid, function (point, i) {
    gisViewer.value.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z),
      orientation: {
        heading: Number(point.heading),
        pitch: Number(point.pitch),
        roll: 0.0
      }
    });
  });
}

//创建飞行路径
function createFlightPathPlayer(id) {
  let flightData = null;
  forEachPathTodo(id, function (item, i) {
    let totaltime = 0;
    item.points.forEach(function (point, j) {
      totaltime += Number(point.time);
    });
    item.totaltime = totaltime;
    flightData = item;
  });
  if (!flightData) {
    return;
  }
  if (flightData.totaltime <= 0) {
    return;
  }
  startTime.value = Cesium.JulianDate.fromDate(new Date());
  stopTime.value = Cesium.JulianDate.addSeconds(
      startTime.value,
      flightData.totaltime,
      new Cesium.JulianDate()
  );

  gisViewer.value.viewer.clock.startTime = startTime.value.clone();
  gisViewer.value.viewer.clock.stopTime = stopTime.value.clone();
  gisViewer.value.viewer.clock.currentTime = startTime.value.clone();
  gisViewer.value.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  gisViewer.value.viewer.clock.multiplier = 1.0;
  gisViewer.value.viewer.clock.shouldAnimate = true;

  let entity = gisViewer.value.viewer.entities.add({
    id: flightData.id,
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: startTime.value,
        stop: stopTime.value
      })
    ]),
    position: computeFlight(flightData),
    HPR: computeHPR(flightData)
  });
  gisViewer.value.addTempGlobal(FlightEntity, entity);
  gisViewer.value.tempGlobal[FlightEntity].position.setInterpolationOptions({
    interpolationDegree: 2,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation
  });
  addSceneListener();
}

//配置场景监听器
function setSceneListener() {
  let listener = null;
  let flightEntity = gisViewer.value.tempGlobal[FlightEntity];
  if (Cesium.defined(flightEntity)) {
    listener = (scene, time) => {
      let timeDif = time.secondsOfDay - startTime.value.secondsOfDay;
      let position = flightEntity.position.getValue(time);
      let hpr = flightEntity.HPR.getValue(timeDif);
      if (!Cesium.defined(position)) {
        return;
      }
      let hpRange = new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(hpr.h),
          Cesium.Math.toRadians(hpr.p),
          Cesium.Math.toRadians(hpr.r)
      );
      gisViewer.value.viewer.camera.lookAt(position, hpRange);
    };
  }
  return listener;
}

//添加场景监听器
function addSceneListener() {
  let listener = setSceneListener();
  gisViewer.value.addTempGlobal(FlightListener, listener);
  gisViewer.value.viewer.scene.postUpdate.addEventListener(listener);
}

//移除监听器
function removeSceneListener() {
  let listener = gisViewer.value.tempGlobal[FlightListener];
  gisViewer.value.viewer.scene.postUpdate.removeEventListener(listener);
  gisViewer.value.removeTempGlobal(FlightListener);
}

//计算路线
function computeFlight(flightData) {
  let property = new Cesium.SampledPositionProperty();
  let currentTime = startTime.value.clone();
  flightData.points.forEach((p, i) => {
    let position = Cesium.Cartesian3.fromDegrees(p.x, p.y, p.z);
    currentTime = Cesium.JulianDate.addSeconds(
        currentTime,
        Number(p.time),
        new Cesium.JulianDate()
    );
    property.addSample(currentTime.clone(), position);
  });
  return property;
}

//返回hpr值和时间
function computeHPR(flightData) {
  let hpr = [];
  let timeCount = 0;
  flightData["\x70\x6f\x69\x6e\x74\x73"]["\x66\x6f\x72\x45\x61\x63\x68"](
      (point, i) => {
        timeCount += window["\x4e\x75\x6d\x62\x65\x72"](
            point["\x74\x69\x6d\x65"]
        );
        hpr["\x70\x75\x73\x68"]({
          name: "\x70\x6f\x69\x6e\x74",
          time: timeCount,
          h: Cesium["\x4d\x61\x74\x68"]["\x74\x6f\x44\x65\x67\x72\x65\x65\x73"](point["\x68\x65\x61\x64\x69\x6e\x67"]),
          p: Cesium["\x4d\x61\x74\x68"]["\x74\x6f\x44\x65\x67\x72\x65\x65\x73"](point["\x70\x69\x74\x63\x68"]),
          r: point["\x72\x61\x6e\x67\x65"]
        });
      }
  );
  let HPRProperty = function (hpr) {
    this["\x68\x70\x72"] = hpr;
  };
  HPRProperty["\x70\x72\x6f\x74\x6f\x74\x79\x70\x65"]["\x67\x65\x74\x56\x61\x6c\x75\x65"] = function (time) {
    let result = null;
    let startHpr = null;
    let endHpr = null;
    for (let i = 0; i < hpr["\x6c\x65\x6e\x67\x74\x68"]; i++) {
      if (time < hpr[i]["\x74\x69\x6d\x65"]) {
        if (i - 1 < 0) {
          startHpr = hpr[i];
        } else {
          startHpr = hpr[i - 1];
        }
        endHpr = hpr[i];
        break;
      }
    }
    if (startHpr && endHpr) {
      let rate =
          (time - startHpr["\x74\x69\x6d\x65"]) /
          (endHpr["\x74\x69\x6d\x65"] - startHpr["\x74\x69\x6d\x65"]);
      let h = getDegrees(startHpr["\x68"], endHpr["\x68"], rate);
      let p = getDegrees(startHpr["\x70"], endHpr["\x70"], rate);
      let r = (endHpr["\x72"] - startHpr["\x72"]) * rate + startHpr["\x72"];
      result = {h: h, p: p, r: r};
    }

    function getDegrees(wOJkpj1, ozfI2, tszW3) {
      let difDegrees = ozfI2 - wOJkpj1;
      if (difDegrees < -180) {
        difDegrees = 360 + difDegrees;
      } else if (difDegrees > 180) {
        difDegrees = difDegrees - 360;
      }
      let degrees = wOJkpj1 + tszW3 * difDegrees;
      return degrees;
    }

    return result;
  };
  let hprHPRProperty = new HPRProperty(hpr);
  return hprHPRProperty;
}

//根据两点计算距离
function calculateDistance(point1, point2) {
  /**根据经纬度计算出距离**/
  let geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1, point2);
  let d = geodesic.surfaceDistance;
  //返回两点之间的距离
  d = Math.sqrt(
      Math.pow(d, 2) + Math.pow(point1.height - point2.height, 2)
  );
  return d;
}

let newFormData = computed(() => {
  return JSON.stringify(formData.value);
})
watch(newFormData, (newValue, oldValue) => {
  let newArr = JSON.parse(newValue);
  let oldArr = JSON.parse(oldValue);
  if (newArr.length === oldArr.length) {
    newArr.forEach((item, i) => {
      let flag = true;
      if (item.name !== oldArr[i].name) {
        flag = false;
      }
      if (item.points.length !== oldArr[i].points.length) {
        flag = false;
      } else {
        item.points.forEach((point, j) => {
          if (
              point.name !== oldArr[i].points[j].name ||
              point.time !== oldArr[i].points[j].time
          ) {
            flag = false;
          }
        });
      }
      if (!flag) {
        formData.value[i].visible.save = true;
      }
    });
  }
}, {deep: true})
</script>
<style scoped>
@import url("style/iconfont.css");

.xt-fly-panel {
  /* background-color: rgb(255, 255, 255);
  border: 1px solid rgb(204, 204, 204);
  box-shadow: 0 0 5px 1px #eee;
  -webkit-box-shadow: 0 0 4px 1px #eee; */
  width: 262px;
  left: calc(50% - 130px);
  top: 200px;
  height: 400px;
}

.xt-paths-content {
  /*height: 300px;*/
  overflow-y: auto;
  padding: 5px 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.xt-paths {
  background-color: #407cb455;
  border: 1px solid #5b95cc;
  box-shadow: 0 0 5px 1px #5b95cc;
  -webkit-box-shadow: 0 0 4px 1px #5b95cc;
}

.xt-paths-addButton {
  margin-bottom: 3px;
  width: 100%;
  font-size: 14px;
}

.xt-paths-title,
.xt-paths-item {
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}

.xt-paths-title {
  padding: 3px;
}

.xt-paths-divider {
  height: 1px;
  border-bottom: 1px dashed #999;
  margin: 0 15px;
}

.xt-paths-list {
  padding: 5px;
}

.xt-paths-item-text {
  cursor: pointer;
}

.xt-paths-item-input,
.xt-paths-title-input {
  width: 50px;
  height: 20px;
  border: 1px solid rgb(202, 202, 202);
}

.xt-color-gray {
  color: #999;
}

.xt-fly-panel .el-button {
  background: #407cb455;
  color: #fff;
  border: 1px solid #5b95cc;
}

/*去掉数字输入框的上下箭头*/
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
