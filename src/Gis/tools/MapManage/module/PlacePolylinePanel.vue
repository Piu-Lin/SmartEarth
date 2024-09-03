<template>
  <panel-container
      ref="panelContainer"
      title="添加线"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-line-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="add-line-body">
        <label title="名称" class="xt-form-item-label">名称</label>
        <el-input v-model="nameRef" @change="setName()"/>
        <label title="符号" class="xt-form-item-label">符号</label>
        <div class="xt-polyline-type">
          <template v-for="element in polylineType">
            <a
                :title="element.title"
                :class="[
								element.css,
								{ 'a-focus': selectedType === element.type },
							]"
                @click="changeSelectedType(element.type)"
            ></a>
          </template>
        </div>
        <label title="操作" class="xt-form-item-label">操作</label>
        <div class="xt-polyline-edit">
          <template v-for="element in polylineEdit">
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
        <label title="填充" class="xt-form-item-label">填充</label>
        <div class="xt-form-item">
          <label title="颜色">颜色</label>
          <el-color-picker
              show-alpha
              v-model="polylineColor"
              @change="modifyPolylineMaterial"
          ></el-color-picker>
          <label title="大小">宽度</label>
          <el-input-number
              :min="1"
              :max="100"
              v-model="polylineWidth"
              @change="modifyPolylineWidth"
          />
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
import {handleColorType} from "../../../utils/raba_color";
import PanelContainer from "../../PanelContainer";
import {ref, onMounted, inject, nextTick, reactive} from "vue";
import {guid} from "../../../utils/coding";
import pickGloble from "@/Gis/tools/pickGloble";
import DynamicPolylinePrimitive from "@/Gis/feature/DynamicPolylinePrimitive";
import localMapManageStorage from "../storage/localMapManageStorage";
import CursorStyle from "@/Gis/enum/CursorStyle";
import { throttle } from '../../index.js';

const gisViewer = inject("bigScreenMap");
let pointIndex = 0;	// 点的id后面加的标识
const visible = ref(false);

function miniaturized() {
  visible.value = false;
}

function close() {
  visible.value = false;
}

function open() {
  visible.value = true;
}

// 父Id
const parId = ref("");

// 对外开放的方法和变量
defineExpose({
  visible,
  parId,
  open,
  close,
  miniaturized,
  onLeftClick,
});
const nameRef = ref("未命名的线");
let name ="未命名的线";

function setName() {
  name = nameRef.value;
}
// 操作
const polylineEdit = ref([
  {
    title: "平移节点",
    css: "xt-point-move",
    type: "move",
  },
  {
    title: "升降节点",
    css: "xt-point-move-z",
    type: "movez",
  },
  {
    title: "升降对象",
    css: "xt_polyline-move-z",
    type: "moveLine",
  },
]);
const handlerType = ref("move");

// 点击操作类型执行的方法
function changeHandlerType(type) {
  handlerType.value = type;
}

// 颜色
const polylineColor = ref("rgba(255, 255, 0, 1)");

// 点击颜色执行的方法
function modifyPolylineMaterial() {
  changeTypeOrColor(selectedType.value);
}

function changeTypeOrColor(type) {
  switch (type) {
    case "line":
      lineLayer.entities.getById(id).polyline.material = handleColorType(
          polylineColor.value
      );
      break;
    case "dash":
      lineLayer.entities.getById(id).polyline.material =
          new Cesium.PolylineDashMaterialProperty({
            color: handleColorType(polylineColor.value),
            dashLength: 20, //短划线长度
          });
      break;
    case "arrow":
      lineLayer.entities.getById(id).polyline.material =
          new Cesium.PolylineArrowMaterialProperty(
              handleColorType(polylineColor.value)
          );
      break;
    case "outline":
      lineLayer.entities.getById(id).polyline.material =
          new Cesium.PolylineOutlineMaterialProperty({
            color: handleColorType(polylineColor.value),
            outlineWidth: 2,
            outlineColor: Cesium.Color.RED,
          });
      break;
    case "glow":
      lineLayer.entities.getById(id).polyline.material =
          new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.5,
            color: handleColorType(polylineColor.value),
          });
      break;
  }
}

// 宽度
const polylineWidth = ref(3);

// 点击宽度执行的方法
function modifyPolylineWidth(num) {
  lineLayer.entities.getById(id).polyline.width = num;
}

// 子组件向父组件事件传递
const emit = defineEmits([]);

const handlerName = {
  LINE_LAYER: "line",
};
// 符号
const polylineType = ref([
  {
    title: "实线",
    css: "xt-polyline-normal",
    type: "line",
  },
  {
    title: "虚线",
    css: "xt-polyline-dash",
    type: "dash",
  },
  {
    title: "箭头线",
    css: "xt-polyline-arrow",
    type: "arrow",
  },
  {
    title: "边框线",
    css: "xt-polyline-outline",
    type: "outline",
  },
  {
    title: "发光线",
    css: "xt-polyline-glow",
    type: "glow",
  },
]);
const selectedType = ref("line");
const editType = ref("XT_LINE_CREATE");
const EntityLayerName = "drawingline";
let lineLayer = {}; // 当前图层
let handler = {}; // 鼠标事件
let pointPos = [];
let polyline = {}; // 线的样式

// 点击符号调用的方法
function changeSelectedType(type) {
  selectedType.value = type;
  changeTypeOrColor(type);
}

let id = "";

// 左键点击画图
function onLeftClick() {
  id = guid();
  gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  lineLayer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  // 创建一个实例控制Cesium的canvas(帆布)
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );

  // 给临时全局变量tempGlobal{}添加name:object
  gisViewer.value.addTempGlobal(
      handlerName.LINE_LAYER, // name
      handler // object
  );
  let positions = [];
  let poly = null;
  let floatingPoint;
  let drawStep = 0;
  // 添加提示框
  gisViewer.value.mapTooltip.create("单击开始绘制");
  // 添加鼠标左键单击事件
  handler.setInputAction(function (movement) {
    // 获取鼠标位置
    let cartesian = pickGloble(
        gisViewer.value.viewer, // 视图
        movement.position
    );
    //调整高度离地20cm
    let newCartesian = increaseHeight(cartesian, 0.1);
    // 判断positions中是否有position
    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    pointIndex++;
    // 在三维场景中添加label
    floatingPoint = lineLayer.entities.add({
      id: id + "point" + pointIndex.toString(),
      name: "line1",
      position: positions[drawStep],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE,
      },
    });
    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("单击增加点,双击完成绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 添加鼠标移到事件
  handler.setInputAction(throttle((movement) => {
    // 获取鼠标位置返回一个cartesian类型位置
    let cartesian = pickGloble(
        // 全局拾取，包括模型、地形、地表
        gisViewer.value.viewer, // 视图
        movement.endPosition // 屏幕坐标
    );
    // 设置线样式
    const material = {
      color: handleColorType(polylineColor.value),
      type: selectedType.value,
      width: polylineWidth.value,
    };
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm
    if (positions.length >= 2 && newCartesian) {
      positions.pop();
      positions.push(newCartesian);
      if (!Cesium.defined(poly)) {
        poly = new DynamicPolylinePrimitive(
            gisViewer.value.viewer,
            positions,
            lineLayer,
            handlerName.LINE_LAYER,
            material,
            id
        );
      }
    }
  }, 10), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  // 添加鼠标左键双击点击事件
  handler.setInputAction(function (movement) {
    handler.destroy(); // 关闭事件句柄
    positions.pop(); // 最后一个点无效
    positions.pop();
    // 从集合中删除实体 如果已删除该项目，则为true；如果该集合中不存在该项目，则为false。
    lineLayer.entities.remove(floatingPoint);
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    // 结束画线
    gisViewer.value.mapTooltip.destroy();
    polyline = {
      width: polylineWidth.value,
      positions: positions,
    };
    editFun();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

let pointIndex2 = ref(0);
const isEndit = ref(false);
const isUpDown = ref(false);
const isUoDownObj = ref(false);
let pointId =[];

function editFun() {
  for (let i = 1; i < pointIndex; i++) {
    lineLayer.entities.removeById(id + "point" + i.toString());
  }
  let editPositions = polyline.positions;
  pointId = [];
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  editPositions.forEach((item, index) => {
    pointId.push(id + index + 'line');
    const entity = lineLayer.entities.add({
      id: id + index + 'line',
      clampToGround: false,
      position: new Cesium.CallbackProperty((e) => {
        return editPositions[index];
      }, false),
      index: index,
      type: "editLine",
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE
      }
    });
  });
  //鼠标左键下压事件
  handler.setInputAction((e) => {
    if (handlerType.value === "move") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "editLine") {
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
      if (id.id.type == "editLine") {
        pointIndex2.value = id.id.index;
        isUpDown.value = true;
        //禁用场景的旋转移动功能 保留缩放功能
        gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
    if (handlerType.value === "moveLine") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "editLine") {
        pointIndex2.value = id.id.index;
        isUoDownObj.value = true;
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
      let cartesian = pickGloble(
          // 全局拾取，包括模型、地形、地表
          gisViewer.value.viewer, // 视图
          e.endPosition // 屏幕坐标
      );
      if (a) {
        let b = lineLayer.entities.getById(id).polyline.positions.getValue();
        a = 0;
        lineLayer.entities.getById(id).polyline.positions = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex2.value, 1, cartesian);
          return b;
        });
      }
    }
    if (isUpDown.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = lineLayer.entities.getById(id).polyline.positions.getValue();
        let c = b[pointIndex2.value];
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
        lineLayer.entities.getById(id).polyline.positions = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex2.value, 1, d);
          return b;
        });
      }
    }
    if (isUoDownObj.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = lineLayer.entities.getById(id).polyline.positions.getValue();
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
        lineLayer.entities.getById(id).polyline.positions = new Cesium.CallbackProperty(function () {
          b = c;
          return b;
        });
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 鼠标左键弹起事件
  handler.setInputAction((e) => {
    if (isEndit.value || isUpDown.value || isUoDownObj.value) {
      isEndit.value = false;
      isUpDown.value = false;
      isUoDownObj.value = false;
      gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

// 增加高度
function increaseHeight(cartesian, value) {
  // 世界坐标转地理坐标（弧度）
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  // 弧度转换为度
  let longitude = Cesium.Math.toDegrees(cartographic.longitude);
  let latitude = Cesium.Math.toDegrees(cartographic.latitude);

  // 增加高度
  let height =
      cartographic.height > 0 ? cartographic.height + value : 0 + value;
  // 从以度为单位的经度和纬度值返回Cartesian3位置。
  let cartesian1 = new Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
  );
  return cartesian1;
}

// 创建临时实体作为图层实体
function createTempEntity() {
  if (
      gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length > 0
  ) {
    return;
  }
  const lineDataSources = new Cesium.CustomDataSource(EntityLayerName);
  gisViewer.value.viewer.dataSources.add(lineDataSources);
}

//销毁句柄
function destroyHandler() {
  let handler1 = gisViewer.value.tempGlobal[handlerName.LINE_LAYER];
  if (handler1) {
    if (!handler1.isDestroyed()) {
      handler1.destroy();
    }
  }
}


// 初始化
function initialize() {
  createTempEntity();
}

// 点击确定触发事件，添加线实体和线的图层管理
function addLayerPanel() {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  if (handler) {
    handler.destroy();
    handler = null;
  }
  let lineDataSource =
      gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  for (let i = 1; i < pointIndex; i++) {
    lineDataSource.entities.removeById(id + "point" + i.toString());
  }
  ;
  pointId.forEach((item) => {
    lineDataSource && lineDataSource.entities.removeById(item);
  });
  const options = {
    id: id,
    name: name,
    polyline: polyline,
  };
  const item = {
    label: name,
    parId: parId.value,
    value: 5,
    id: id,
    type: "XT_ONE_LINE",
    optional: options,
    rgba: polylineColor.value,
    polylineType: selectedType.value,
    children: [],
  };
  localMapManageStorage.add(item);
  emit("changeData", id);
  initData();
  visible.value = false;
}

// 取消操作
function closePanel() {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  if (handler) {
    handler.destroy();
    handler = null;
  }
  visible.value = false;
  let lineDataSource =
      gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  lineDataSource && lineDataSource.entities.removeById(id);
  gisViewer.value.mapTooltip.destroy();
  for (let i = 1; i < pointIndex; i++) {
    lineDataSource.entities.removeById(id + "point" + i.toString());
  }
  pointId.forEach((item) => {
    lineDataSource && lineDataSource.entities.removeById(item);
  });
  initData();
  destroyHandler();
}

function initData() {
  selectedType.value = "line";
  // 宽度
  polylineWidth.value = 3;
  nameRef.value = "未命名的线";
  handlerType.value = "move";
  // 颜色
  polylineColor.value = "rgba(255, 255, 0, 1)";
  // 宽度
  polylineWidth.value = 3;
}

onMounted(() => {
  nextTick(() => {
    initialize();
  });
});
</script>

<style lang="scss" scoped>
.xt-line-panel {
  width: 300px;
  height: 350px;
}

.add-line-body {
  padding: 10px;
}

.xt-form-item-label {
  font-size: 14px;
}

.a-focus {
  background-color: #43738ab8;
}

.xt-polyline-normal {
  background-image: url("@/assets/images/icons/line-1.svg");
}

.xt-polyline-dash {
  background-image: url("@/assets/images/icons/line-2.svg");
}

.xt-polyline-arrow {
  background-image: url("@/assets/images/icons/line-3.svg");
}

.xt-polyline-outline {
  background-image: url("@/assets/images/icons/line-4.svg");
}

.xt-polyline-glow {
  background-image: url("@/assets/images/icons/line-5.png");
}

.xt-polyline-type {
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

.xt-polyline-type a {
  background-position: 50%;
  height: 40px;
  width: 44px;
  cursor: pointer;
  display: inline-block;
  text-decoration: none !important;
  background-repeat: no-repeat;
}

.xt-point-move {
  background-image: url("@/assets/images/icons/option-1.svg");
  background-position: center 12px;
}

.xt-point-move-z {
  background-image: url("@/assets/images/icons/option-2.svg");
  background-position: center 12px;
}

.xt_polyline-move-z {
  background-image: url("@/assets/images/icons/option-3.svg");
  background-position: center 12px;
}

.xt-polyline-edit {
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

.xt-polyline-edit a {
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

.xt-form-item {
  margin: 5px 0;
  display: flex;
}

.xt-form-item label {
  line-height: 25px;
  font-size: 12px;
  margin-left: 10px;
  text-align: left;
  width: 40px;
}

.form-panel-footer {
  height: 38px;
  line-height: 57px;
  font-size: 14px;
  text-align: right;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number__decrease) {
  top: 6px;
  bottom: 4px;
  width: 28px;
}

:deep(.el-input-number__increase) {
  top: 6px;
  bottom: 4px;
  width: 28px;
}
</style>
