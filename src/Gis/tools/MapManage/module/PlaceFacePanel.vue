<template>
  <panel-container
      ref="panelContainer"
      title="添加面"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-face-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="add-face-body">
        <label title="名称" class="xt-form-item-label"> 名称</label>
        <div class="xt-form-item">
          <el-input v-model="polygonName"></el-input>
        </div>
        <label title="操作" class="xt-form-item-label"> 操作 </label>
        <div class="xt-polygon-handle">
          <template v-for="element in faceHandle">
            <a
                :title="element.title"
                :class="[
								element.css,
								{ 'a-focus': handlerType === element.type },
							]"
                @click="changeHandlerType(element.type)"
            >{{ element.title }}</a
            >
          </template>
        </div>
        <br/>
        <label title="标签样式" class="xt-form-item-label"> 标签样式</label>
        <div class="xt-form-item">
          <label title="填充颜色">填充颜色</label>
          <el-color-picker
              show-alpha
              v-model="faceFillColor"
              @change="modifyFaceFillColor"
          ></el-color-picker>
          <label title="填充颜色">边框颜色</label>
          <el-color-picker
              show-alpha
              v-model="faceBorderColor"
              @change="modifyFaceBorderColor"
          ></el-color-picker>
        </div>
        <div class="form-panel-footer">
          <div class="footer-group">
            <el-button @click="addLayerPanel">
              <span>确认</span>
            </el-button>
            <el-button @click="closePanel">
              <span>取消</span>
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import localMapManageStorage from "../storage/localMapManageStorage";
import pickGloble from "@/Gis/tools/pickGloble";
import {ref, reactive, inject, watch} from "vue";
import {guid} from "../../../utils/coding";
import { throttle } from '../../index.js';
import {nextTick, onMounted} from "vue";

const gisViewer = inject("bigScreenMap");
const emit = defineEmits([]);
let handler = reactive({});
let polygonLayer = reactive({}); // 面图层
let entityPolygon = ref(null); // 面
let startPoint = ref(null); // 初始点
const lineWidth = ref(3); // 面的边框的宽度
let pointIndex = ref(0);	// 点的id后面加的标识
let entityAttributes = reactive({
  id: "0",
  name: "",
  positions: [],
  faceColor: "", // 面填充颜色
  lineColor: "", // 面边框颜色
}); // 存放entity的属性
const visible = ref(false);

function close() {
  visible.value = false;
}

function miniaturized() {
  visible.value = false;
}

function open() {
  visible.value = true;
  addFaceLayer();
}

const pId = ref("");

// 对外开放的方法和变量
defineExpose({
  visible,
  pId,
  open,
  close,
  miniaturized,
});

// 面的名称
const polygonName = ref("未命名的面");

// 操作内容
const faceHandle = ref([
  {
    title: '平移节点',
    css: 'xt-point-move',
    type: 'move',
  },
  {
    title: '升降节点',
    css: 'xt-point-move-z',
    type: 'movez',
  },
  {
    title: '拉伸对象',
    css: 'xt_polyface-move-z',
    type: 'moveface',
  },
  {
    title: '升降对象',
    css: 'xt_polyline-move-z',
    type: 'movelinez',
  }
]);
// 选择的操作
const handlerType = ref("move");

// 点击操作类型执行的方法
function changeHandlerType(type) {
  handlerType.value = type;
}

// 面填充颜色
const faceFillColor = ref("rgba(255, 255, 0, 1)");

// 修改面填充颜色执行的方法
function modifyFaceFillColor() {
  polygonLayer.entities.getById(id.value).polygon.material = handleColorType(
      faceFillColor.value
  );
  entityAttributes.faceColor = faceFillColor.value;
}

// 面的边框颜色
const faceBorderColor = ref("rgba(255, 0, 0, 1)");

// 修改面的边框颜色触发的方法
function modifyFaceBorderColor() {
  polygonLayer.entities.getById(id.value).polygon.outlineColor =
      handleColorType(faceBorderColor.value);
  entityAttributes.lineColor = faceBorderColor.value;
}

// 存储所有需要使用的id
const id = ref("");

// 添加面图层
function addFaceLayer() {
  id.value = guid();
  setAll();
  gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  polygonLayer = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePolygonLayer"
  )[0];
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  let positions = [];
  let poly = null;
  let drawStep = 0; //绘制步骤
  let floatingPoint;	// 浮动点
  gisViewer.value.mapTooltip.create("单击开始绘制!");
  handler.setInputAction((movement) => {
    let cartesian = pickGloble(
        // 全局拾取，包括模型、地形、地表
        gisViewer.value.viewer, // 视图
        movement.position // 屏幕坐标
    );
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm
    // 判断positions中是否有position
    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    pointIndex.value++;
    // 在三维场景中添加label
    floatingPoint = polygonLayer.entities.add({
      id: id.value + "point" + pointIndex.value.toString(),
      position: positions[drawStep],
      index: drawStep,
      type: "addFace",
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE,
      },
    });
    //在三维场景中添加点
    drawStep++;
    if (drawStep === 1) {
      startPoint.value = newCartesian;
      gisViewer.value.mapTooltip.create("单击增加点!");
    } else if (drawStep === 2) {
      gisViewer.value.mapTooltip.create("单击增加点,双击左键完成绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(throttle((movement) => {
    // 获取鼠标位置返回一个cartesian类型位置
    let cartesian = pickGloble(
        // 全局拾取，包括模型、地形、地表
        gisViewer.value.viewer, // 视图
        movement.endPosition // 屏幕坐标
    );
    let newCartesian = increaseHeight(cartesian, 0.1);
    if (positions.length >= 2 && newCartesian) {
      positions.pop();
      positions.push(newCartesian);
      if (!Cesium.defined(entityPolygon.value)) {
        let dynamicPositions = new Cesium.CallbackProperty(function () {
          return new Cesium.PolygonHierarchy(positions);
        });
        drawPolygon(dynamicPositions);
      }
    }
  }, 10), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  handler.setInputAction(function (movement) {
    handler.destroy();
    positions.pop();
    positions.pop();
    entityAttributes.positions = positions;
    polygonLayer.entities.remove(floatingPoint);
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    gisViewer.value.mapTooltip.destroy();
    editFun();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

const isStrecth = ref(false);
const isUpDown = ref(false);
const isUpDownObj = ref(false);
const isEndit = ref(false);
let pointIndex2 = ref(0);
let extrudedHeight = ref(0);
let pointId = ref([]);

function editFun() {
  for (let i = 1; i < pointIndex.value; i++) {
    polygonLayer.entities.removeById(id.value + "point" + i.toString());
  }
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  let editFacePositions = entityAttributes.positions;
  editFacePositions.forEach((item, index) => {
    pointId.value.push(id.value + index + "addFace");
    const entity = polygonLayer.entities.add(
        {
          id: id.value + index + "addFace",
          position: new Cesium.CallbackProperty((e) => {
            return editFacePositions[index];
          }, false),
          index: index,
          type: "addFace",
          point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.NONE,
          },
        }
    );
  });
  //鼠标左键下压事件
  handler.setInputAction((e) => {
    if (handlerType.value === "move") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "addFace") {
        pointIndex2.value = id.id.index;
        isEndit.value = true;
        //禁用场景的旋转移动功能 保留缩放功能
        gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
    if (handlerType.value === "movez") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "addFace") {
        pointIndex2.value = id.id.index;
        isUpDown.value = true;
        //禁用场景的旋转移动功能 保留缩放功能
        gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }

    if (handlerType.value === "moveface") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      if (!id || !id.id) {
        return;
      }
      isStrecth.value = true;
      gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
    }

    if (handlerType.value === "movelinez") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "addFace") {
        pointIndex2.value = id.id.index;
        isUpDownObj.value = true;
        //禁用场景的旋转移动功能 保留缩放功能
        gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // 鼠标移动事件
  handler.setInputAction((e) => {
    let a = 1;
    if (isEndit.value) {
      // 获取鼠标位置返回一个cartesian类型位置
      let cartesian = pickGloble( // 全局拾取，包括模型、地形、地表
          gisViewer.value.viewer, // 视图
          e.endPosition // 屏幕坐标
      );
      if (a) {
        let b = polygonLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
        a = 0;
        polygonLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex2.value, 1, cartesian);
          return new Cesium.PolygonHierarchy(b);
        });
      }
    }
    if (isStrecth.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (extrudedHeight.value !== 0) {
        extrudedHeight.value += height;
      } else {
        extrudedHeight.value = 10 + height;
      }
      polygonLayer.entities.getById(id.value).polygon.extrudedHeight = extrudedHeight.value;
    }
    if (isUpDown.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = polygonLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
        const c = b[pointIndex2.value];
        // 笛卡尔3d转地图的
        let cartographic = Cesium.Cartographic.fromCartesian(c);
        // 获取3d笛卡尔坐标在地图上的经纬度高度
        // 纬度
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        // 经度
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        // 高度
        let alt = cartographic.height;
        alt += height;
        // 经纬度高度转3d笛卡尔坐标
        const d = Cesium.Cartesian3.fromDegrees(lng, lat, alt);
        a = 0;
        polygonLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex2.value, 1, d);
          return new Cesium.PolygonHierarchy(b);
        });
      }
    }
    if (isUpDownObj.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = polygonLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
        const c = [];
        b.forEach((item) => {
          // 笛卡尔3d转地图的
          let cartographic = Cesium.Cartographic.fromCartesian(item);
          // 获取3d笛卡尔坐标在地图上的经纬度高度
          // 纬度
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          // 经度
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          // 高度
          let alt = cartographic.height;
          alt += height;
          // 经纬度高度转3d笛卡尔坐标
          const d = Cesium.Cartesian3.fromDegrees(lng, lat, alt);
          item.x = d.x;
          item.y = d.y;
          item.z = d.z;
          c.push(item);
        });
        a = 0;
        polygonLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
          b = c;
          return new Cesium.PolygonHierarchy(b);
        });
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 鼠标左键弹起事件
  handler.setInputAction((e) => {
    if (isEndit.value || isStrecth.value || isUpDown.value || isUpDownObj.value) {
      isEndit.value = false;
      isStrecth.value = false;
      isUpDown.value = false;
      isUpDownObj.value = false;
      gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

}

// 添加面
function drawPolygon(positions) {
  let polygonData = {
    id: id.value,
    polygon: {
      show: true,
      hierarchy: positions,
      perPositionHeight: true, //允许三角形使用点的高度
      clampToGround: false,
      fill: true,
      outline: true,
      outlineColor: handleColorType(faceBorderColor.value),
      outlineWidth: lineWidth.value,
      material: handleColorType(faceFillColor.value),
    },
  };
  entityPolygon.value = polygonLayer.entities.add(polygonData);
}

watch(polygonName, () => {
  entityAttributes.name = polygonName.value;
});

// 点击确定触发事件
function addLayerPanel() {
  if (handler) {
    handler.destroy();
    handler = null;
  }
  entityAttributes.id = id.value;
  entityAttributes.name = polygonName.value;
  entityAttributes.faceColor = faceFillColor.value;
  entityAttributes.lineColor = faceBorderColor.value;
  for (let i = 1; i < pointIndex.value; i++) {
    polygonLayer.entities.removeById(id.value + "point" + i.toString());
  }
  ;
  pointId.value.forEach((item) => {
    polygonLayer && polygonLayer.entities.removeById(item);
  });
  pointIndex.value = 0;
  const item = {
    label: entityAttributes.name,
    parId: pId.value,
    value: 5,
    id: id.value,
    type: "XT_PLYGON",
    children: [],
    attributesFace: entityAttributes,
  };
  localMapManageStorage.add(item);
  emit("changeData", id.value);
  setAll();
  visible.value = false;
}

// 点击取消
function closePanel() {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  if (handler) {
    handler.destroy();
    handler = null;
  }
  gisViewer.value.mapTooltip.destroy();
  polygonLayer.entities.removeById(id.value);
  for (let i = 1; i < pointIndex.value; i++) {
    polygonLayer.entities.removeById(id.value + "point" + i.toString());
  }
  ;
  pointId.value.forEach((item) => {
    polygonLayer && polygonLayer.entities.removeById(item);
  });
  pointIndex.value = 0;
  setAll();
  visible.value = false;
}

// 重置
function setAll() {
  entityAttributes = {
    id: "0",
    name: "",
    point: [],
    faceColor: "",
    lineColor: "",
  };
  polygonName.value = "未命名的面";
  entityPolygon.value = null;
  handlerType.value = "move";
}

//增加高度
function increaseHeight(cartesian, value) {
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  let longitude = Cesium.Math.toDegrees(cartographic.longitude);
  let latitude = Cesium.Math.toDegrees(cartographic.latitude);
  let height =
      cartographic.height > 0 ? cartographic.height + value : 0 + value;
  let cartesian1 = new Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
  );
  return cartesian1;
}

// rgba => cesium.color
function handleColorType(color) {
  color = color.replace(/rgba\(/, "");
  color = color.replace(/\)/, "");
  let colorArr = color.split(",");
  let colorArr2 = new Array(colorArr.length).fill(0);
  for (let i = 0; i < colorArr.length - 1; i++) {
    colorArr2[i] = +colorArr[i] / 255;
  }
  colorArr2[colorArr.length - 1] = +colorArr[colorArr.length - 1];
  return new Cesium.Color(...colorArr2);
}


const EntityLayerName = "mapManagePolygonLayer";
// 创建临时实体作为图层实体
function createTempEntity() {
  if (gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length > 0) {
    return;
  }
  const faceDataSources = new Cesium.CustomDataSource(EntityLayerName);
  gisViewer.value.viewer.dataSources.add(faceDataSources);
}

// 初始化
function initialize() {
  createTempEntity();
}


onMounted(() => {
  nextTick(() => {
    initialize();
  });
});

</script>

<style scoped>
.xt-face-panel {
  width: 300px;
  height: 305px;
}

.xt-form-item-label {
  font-size: 14px;
  line-height: 20px;
}

.xt-form-item {
  margin: 5px 0;
}

.xt-form-item > label {
  margin-left: 10px;
  text-align: left;
  width: 65px;
  font-size: 12px;
  line-height: 28px;
}

.xt-form-item > label:not(:first-child) {
  margin-left: 20px;
}

/* 操作样式设置 */
.xt-polygon-handle {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  color: #dedede;
  font-size: 12px;
}

.xt-polygon-handle a {
  background-position: center 6px;
  color: #fff;
  line-height: 70px;
  text-align: center;
  height: 45px;
  width: 33%;
  cursor: pointer;
  display: inline-block;
  text-decoration: none !important;
  background-repeat: no-repeat;
}

.xt-point-move {
  background-image: url("@/assets/images/icons/polygon-1.svg");
  background-position: center 12px;
}

.xt-point-move-z {
  background-image: url("@/assets/images/icons/polygon-2.svg");
  background-position: center 12px;
}

.xt_polyline-move-z {
  background-image: url("@/assets/images/icons/polygon-4.svg");
  background-position: center 12px;
}

.xt_polyface-move-z {
  background-image: url("@/assets/images/icons/polygon-3.svg");
  background-position: center 12px;
}

/* 选中样式 */
.a-focus {
  background-color: #43738ab8;
}

/** 确认和取消button样式 **/
.form-panel-footer {
  height: 38px;
  line-height: 57px;
  font-size: 14px;
  text-align: right;
}

.footer-group {
  margin-right: 10px;
}
</style>
