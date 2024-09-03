<template>
  <panel-container ref="panelContainer" title="编辑面" :visible="visible" @close="close" @miniaturized="miniaturized"
    class="xt-edit-face-panel">
    <template v-slot:panel-content class="xt-paths-content">
      <div class="add-line-body">
        <label title="名称" class="xt-form-item-label">名称</label>
        <el-input v-model="name" />
        <label title="操作" class="xt-form-item-label">操作</label>
        <div class="xt-polyline-edit">
          <template v-for="element in polylineEdit">
            <a :title="element.title" :class="[
              element.css,
              { 'a-focus': handlerType === element.type },
            ]" @click="changeHandlerType(element.type)">{{ element.title }}</a>
          </template>
        </div>
        <label title="填充" class="xt-form-item-label">填充</label>
        <div class="xt-form-item">
          <label title="颜色">颜色</label>
          <el-color-picker show-alpha v-model="polyFaceColor" @change="modifyPolylineMaterial"></el-color-picker>
          <label title="大小">边框颜色</label>
          <el-color-picker show-alpha v-model="borderColor" @change="modifyBorderMaterial"></el-color-picker>
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
import { inject, reactive, ref } from "vue";
import PanelContainer from "../../PanelContainer";
import localMapManageStorage from "../storage/localMapManageStorage";
import { handleColorType } from "../../../utils/raba_color";
import pickGloble from "../../pickGloble";

const gisViewer = inject("bigScreenMap");

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

// 点击面编辑传递的数据
const faceInfo = ref({});
let faceLayer = ({}); // 当前图层
const id = ref("");
let pointIndex = ref(0);
const isEndit = ref(false);
let pointId = ref([]);
const isStrecth = ref(false);
const isUpDown = ref(false);
const isUpDownObj = ref(false);
let handler = ({});

// 打开编辑页面执行的方法
function openFun() {
  let editFacePositions = faceInfo.value.attributesFace.positions;
  faceLayer = gisViewer.value.viewer.dataSources.getByName(
    "mapManagePolygonLayer"
  )[0];
  editFacePositions.forEach((item, index) => {
    pointId.value.push(faceInfo.value.id + index + "Facepoint");
    const entity = faceLayer.entities.add(
      {
        id: faceInfo.value.id + index + "Facepoint",
        position: new Cesium.CallbackProperty((e) => {
          return editFacePositions[index];
        }, false),
        index: index,
        type: "EditFace",
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
  polyFaceColor.value = faceInfo.value.attributesFace.faceColor;
  borderColor.value = faceInfo.value.attributesFace.lineColor;
  name.value = faceInfo.value.label;
  id.value = faceInfo.value.id;
  handler = new Cesium.ScreenSpaceEventHandler(
    gisViewer.value.viewer.scene.canvas
  );

  //鼠标左键下压事件
  handler.setInputAction((e) => {
    if (handlerType.value === "move") {
      let id = gisViewer.value.viewer.scene.pick(e.position);
      // 拾取到对象 判断拾取到的对象类型
      if (!id || !id.id || !id.id.type) {
        return;
      }
      if (id.id.type == "EditFace") {
        pointIndex.value = id.id.index;
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
      if (id.id.type == "EditFace") {
        pointIndex.value = id.id.index;
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
      if (id.id.type == "EditFace") {
        pointIndex.value = id.id.index;
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
        let b = faceLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
        a = 0;
        faceLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex.value, 1, cartesian);
          return new Cesium.PolygonHierarchy(b);
        });
      }
    }
    if (isStrecth.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (faceInfo.value.attributesFace.extrudedHeight) {
        faceInfo.value.attributesFace.extrudedHeight += height;
      } else {
        faceInfo.value.attributesFace.extrudedHeight = 10 + height;
      }
      faceLayer.entities.getById(id.value).polygon.extrudedHeight = faceInfo.value.attributesFace.extrudedHeight;
    }
    if (isUpDown.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = faceLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
        const c = b[pointIndex.value];
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
        faceLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
          b.splice(pointIndex.value, 1, d);
          return new Cesium.PolygonHierarchy(b);
        });
      }
    }
    if (isUpDownObj.value) {
      let height = e.startPosition.y - e.endPosition.y;
      if (a) {
        let b = faceLayer.entities.getById(id.value).polygon.hierarchy.getValue().positions;
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
        faceLayer.entities.getById(id.value).polygon.hierarchy = new Cesium.CallbackProperty(function () {
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

defineExpose({
  visible,
  open,
  close,
  miniaturized,
  faceInfo,
  openFun,
});

// 名称输入框中的内容
const name = ref("");

// 操作
const polylineEdit = ref([
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
const handlerType = ref('move');

// 点击操作类型执行的方法
function changeHandlerType(type) {
  handlerType.value = type;
}

// 颜色
const polyFaceColor = ref('rgba(255, 255, 0, 1)');

// 点击颜色执行的方法
function modifyPolylineMaterial() {
  faceLayer.entities.getById(id.value).polygon.material = handleColorType(polyFaceColor.value);
}

// 边框颜色
const borderColor = ref('rgba(255, 0, 0, 1)');

// 点击颜色执行的方法
function modifyBorderMaterial() {
  faceLayer.entities.getById(id.value).polygon.outlineColor = handleColorType(borderColor.value);
}

// 子组件向父组件事件传递
const emit = defineEmits([]);

// 点击确定触发事件，添加线实体和线的图层管理
function addLayerPanel() {
  if (handler) {
    handler.destroy();
    handler = null;
  }
  faceInfo.value.label = name.value;
  faceInfo.value.attributesFace.faceColor = polyFaceColor.value;
  faceInfo.value.attributesFace.lineColor = borderColor.value;
  pointId.value.forEach((item) => {
    faceLayer && faceLayer.entities.removeById(item);
  });
  pointId.value = [];
  const item = faceInfo.value;
  localMapManageStorage.update(item);
  pointId.value = [];
  faceInfo.value = {};
  faceLayer.value = {}; // 当前图层
  pointIndex.value = 0;
  emit('changeData', id.value);
  id.value = "";
  visible.value = false;
}

const cancleData = ref({})

// 取消操作
function closePanel() {
  if (handler) {
    handler.destroy();
    handler = null;
  }
  cancleData.value = localMapManageStorage.getById(id.value);
  let faceDataSource = gisViewer.value.viewer.dataSources.getByName(
    "mapManagePolygonLayer"
  )[0];
  faceDataSource && faceDataSource.entities.removeById(id.value);
  pointId.value.forEach((item) => {
    faceDataSource && faceDataSource.entities.removeById(item);
  })
  pointId.value = [];
  faceInfo.value = {};
  faceLayer.value = {}; // 当前图层
  id.value = "";
  pointIndex.value = 0;
  emit('cancleFun', cancleData.value);
  visible.value = false;
}

</script>

<style lang="scss" scoped>
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

.a-focus {
  background-color: #43738ab8;
}

/* 操作部分样式 */
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

.xt-form-item-label {
  font-size: 14px;
}


.add-line-body {
  padding: 10px;
}

.xt-form-item {
  margin: 0px 5px;
  justify-content: space-around;
}


.xt-form-item label {
  line-height: 25px;
  font-size: 12px;
  margin-left: 10px;
  text-align: left;
}


.form-panel-footer {
  height: 38px;
  line-height: 57px;
  font-size: 14px;
  text-align: right;
}
</style>
