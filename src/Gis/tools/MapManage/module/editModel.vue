<template>
  <panel-container
      ref="panelContainer"
      title="添加模型"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-model-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="add-point-body">
        <label title="名称" class="xt-form-item-label">名称</label>
        <div class="xt-form-item">
          <el-input v-model="modelName"></el-input>
        </div>
        <label title="位置" class="xt-form-item-label">位置</label>
        <div class="xt-form-item">
          <label title="经度" class="label">经度</label>
          <el-input v-model="modelLon"></el-input>
        </div>
        <div class="xt-form-item">
          <label title="纬度" class="label">纬度</label>
          <el-input v-model="modelLat"></el-input>
        </div>
        <div class="xt-form-item">
          <label title="高度" class="label">高度</label>
          <el-input v-model="modelHeight"></el-input>
        </div>
        <label title="方位" class="xt-form-item-label">方位</label>
        <div class="xt-form-item">
          <label title="X 轴" class="label">h</label>
          <el-input v-model="modelX"
                    type="number"
          ></el-input>
        </div>
        <div class="xt-form-item">
          <label title="Y 轴" class="label">p</label>
          <el-input v-model="modelY"
                    type="number"
          ></el-input>
        </div>
        <div class="xt-form-item">
          <label title="Z 轴" class="label">r</label>
          <el-input v-model="modelZ"
                    type="number"
          ></el-input>
        </div>
        <label title="图标" class="xt-form-item-label">模型</label>
        <div class="model-classify-wrapper">
          <div
              class="model-item-wrapper"
              :class="{'active' : item.uri === uri}"
              v-for="(item, index) of modelList"
              :key="index"
              @click="modifyModel(item)"
          >
            <img
                class="cover-picture"
                :src="item.image"
                alt=""
            >
          </div>
        </div>
        <label title="大小" class="xt-form-item-label">大小</label>
        <div class="xt-form-item">
          <el-input
              v-model="sizeNum"
              @change="changeSize"
              type="number"
          ></el-input>
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
import {inject, ref, watch} from "vue";
import PanelContainer from "../../PanelContainer";
import pickGloble from "../../pickGloble";
import {increaseHeight} from "../../../utils/raba_color";
import CursorStyle from "../../../enum/CursorStyle";
import localMapManageStorage from "../storage/localMapManageStorage";

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

// 点击编辑传过来的数据
const modelInfo = ref({});


const pId = ref("");

const id = ref("");

let modelLayer = ({}); // 当前点图层
let handler = ({}); // 鼠标事件
let entityData = ({});
let handModel = ref(null); // 记录当前点击的点
let tag = ref(false);
let modelName = ref(""); // 当前模型的名称
let modelLon = ref(0); // 当前点的经度
let modelLat = ref(0); // 当前点的纬度
let modelHeight = ref(0); // 当前点的高度
const modelList = ref([
  {
    image: new URL("../../../../assets/images/icons/model1.png", import.meta.url).href,
    uri: "/static/model/JPMS01.gltf",
  },
  {
    image: new URL("../../../../assets/images/icons/model2.png", import.meta.url).href,
    uri: "/static/model/MF01.gltf",
  },
  {
    image: new URL("../../../../assets/images/icons/model3.png", import.meta.url).href,
    uri: "/static/model/SHY01.gltf",
  },
]);
const uri = ref('/static/model/JPMS01.gltf');


const sizeNum = ref(1);
const modelX = ref(81);
const modelY = ref(90);
const modelZ = ref(0);

function addModel() {
  tag.value = false;
  id.value = modelInfo.value.id;
  modelName.value = modelInfo.value.label;
  handModel.value = modelInfo.value.position;
  uri.value = modelInfo.value.model.uri;
  sizeNum.value = modelInfo.value.model.scale;
  const modelDegree = getDegrees(modelInfo.value.position);
  modelLon.value = modelDegree.x;
  modelLat.value = modelDegree.y;
  modelHeight.value = modelDegree.z;
  modelX.value = modelInfo.value.orientation.h;
  modelY.value = modelInfo.value.orientation.p;
  modelZ.value = modelInfo.value.orientation.r;
  tag.value = true;
  gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  modelLayer = gisViewer.value.viewer.dataSources.getByName(
      "drawingModel"
  )[0];
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  handler.setInputAction(function (e) {
    modelLayer.entities.removeById(id.value);
    let cartesian = pickGloble(gisViewer.value.viewer, e.position);
    //调整高度离地20cm
    handModel.value = increaseHeight(cartesian, 0.1);
    gisViewer.value.mapTooltip.create("单击改变模型位置,右键完成编辑!");
    // 转经纬度高度
    const modelDegree = getDegrees(handModel.value);
    modelLon.value = modelDegree.x;
    modelLat.value = modelDegree.y;
    modelHeight.value = modelDegree.z;
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
    }
    // 添加模型
    drawModel(
        modelName.value,
        handModel.value,
        uri.value,
        sizeNum.value,
        data,
    );
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(function (e) {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    handler.destroy();
    gisViewer.value.mapTooltip.destroy();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}

// 对外开放的方法和变量
defineExpose({
  visible,
  modelInfo,
  open,
  close,
  miniaturized,
  addModel,
});

function drawModel(name, modelPosition, uri, size, data) {
  const orientation = getOrientation(data);
  entityData = modelLayer.entities.add({
    id: id.value,
    name: name,
    position: modelPosition,
    orientation: orientation,
    model: {
      uri: uri,
      scale: size,
      miniaturized: 60,
      maximumScale: 512,
    }
  });
}


// 监听位置变化
watch([modelLon, modelLat, modelHeight], () => {
  let cart = Cesium.Cartesian3.fromDegrees(
      modelLon.value,
      modelLat.value,
      modelHeight.value
  );
  handModel.value = cart;
  if (tag.value) {
    modelLayer.entities.getById(id.value).position = cart;
  }
});

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

// 世界坐标转为经纬度
function getDegrees(cart) {
  let ellipsoid = gisViewer.value.viewer.scene.globe.ellipsoid;
  let cartograhphic = ellipsoid.cartesianToCartographic(cart);
  let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
  let lon = Cesium.Math.toDegrees(cartograhphic.longitude);
  let alt = cartograhphic.height;
  return {x: lon, y: lat, z: alt};
}

// 子组件向父组件事件传递
const emit = defineEmits([]);

// 点击确认按钮
function addLayerPanel() {
  tag.value = false;
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  if (handler) {
    handler.destroy();
    handler = null;
  }
  gisViewer.value.mapTooltip.destroy();
  const item = {
    label: modelName.value,
    parId: modelInfo.value.parId,
    value: 5,
    id: id.value,
    type: "XT_ONE_MODEL",
    position: handModel.value,
    orientation: {
      h: modelX.value,
      p: modelY.value,
      r: modelZ.value,
    },
    model: {
      uri: uri.value,
      scale: sizeNum.value,
    },
    children: [],
  };
  localMapManageStorage.update(item);
  emit("changeData", id.value);
  id.value = "";
  visible.value = false;
}

const cancleData = ref({})

// 点击取消按钮
function closePanel() {
  tag.value = false;
  cancleData.value = localMapManageStorage.getById(id.value);
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  if (handler) {
    handler.destroy();
    handler = null;
  }
  gisViewer.value.mapTooltip.destroy();
  let modelDataSource =
      gisViewer.value.viewer.dataSources.getByName("drawingModel")[0];
  modelDataSource && modelDataSource.entities.removeById(id.value);
  id.value = "";
  modelInfo.value = {};
  modelLayer = {};
  emit('cancleFun', cancleData.value);
  visible.value = false;
}


function modifyModel(item) {
  uri.value = item.uri;
  if (tag.value) {
    modelLayer.entities.getById(id.value).model.uri = item.uri;
  }
}


// 监听位置变化
watch([modelX, modelY, modelZ], () => {
  const data = {
    position: {
      x: modelLon.value,
      y: modelLat.value,
      z: modelHeight.value,
    },
    orientation: {
      h: modelX.value,
      p: modelY.value,
      r: modelZ.value,
    },
  }
  const orientation = getOrientation(data);
  if (tag.value) {
    modelLayer.entities.getById(id.value).orientation = orientation;
  }
});

function changeSize(currentSize) {
  if (tag.value) {
    modelLayer.entities.getById(id.value).model.scale = currentSize;
  }
}


</script>

<style lang="scss" scoped>
.xt-model-panel {
  width: 340px;
  height: 600px;
}

.add-point-body {
  padding: 10px;
}

.xt-form-item-label {
  font-size: 15px;
  line-height: 20px;
}

.xt-form-item {
  display: flex;
  align-items: center;
  margin: 3px 2px 10px;

  .label {
    margin-left: 10px;
    text-align: left;
    width: 45px;
  }
}

.model-classify-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin: 5px 0;
  max-height: 140px;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #919191;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #818181;
  }

  &::-webkit-scrollbar-thumb:active {
    background-color: #717171;
  }

  scrollbar-width: thin; // 火狐
  .model-item-wrapper {
    width: 74px;
    height: 60px;
    margin: 5px;
    transition: 0.3s;
    padding: 3px;
    cursor: pointer;

    &.active {
      box-shadow: 0 0 5px #ccc;
    }

    .cover-picture {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

</style>
