<template>
  <panel-container
      ref="panelContainer"
      title="添加标注"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-point-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="add-point-body">
        <el-tabs v-model="activeName">
          <el-tab-pane label="基本信息" name="first">
            <label title="名称" class="xt-form-item-label">名称</label>
            <div class="xt-form-item">
              <el-input v-model="pointName"></el-input>
            </div>
            <label title="位置" class="xt-form-item-label">位置</label>
            <div class="xt-form-item">
              <label title="经度" class="label">经度</label>
              <el-input v-model="pointLon"></el-input>
            </div>
            <div class="xt-form-item">
              <label title="纬度" class="label">纬度</label>
              <el-input v-model="pointLat"></el-input>
            </div>
            <div class="xt-form-item">
              <label title="高度" class="label">高度</label>
              <el-input v-model="pointHeight"></el-input>
            </div>
            <label title="图标" class="xt-form-item-label">图标</label>
            <div class="xt-icon-element">
              <img
                  v-for="svg in svgs"
                  :class="{ backStyle: svg.id === svgActive }"
                  :src="svg.src"
                  @click="iconChoose(svg.id)"
              />
            </div>
            <label title="图标样式" class="xt-form-item-label">图标样式</label>
            <div class="xt-form-item">
              <label title="颜色" class="label"> 颜色 </label>
              <el-color-picker
                  show-alpha
                  v-model="polyIconColor"
                  @change="modifyPolyIconMaterial"
              ></el-color-picker>
              <label title="大小">宽度</label>
              <el-input-number
                  :min="1"
                  :max="100"
                  v-model="polyIconWidth"
                  @input="modifyPolyIconWidth"
              />
            </div>
            <label title="标签样式" class="xt-form-item-label">标签样式</label>
            <div class="xt-form-item">
              <label title="颜色" class="label">颜色</label>
              <el-color-picker
                  show-alpha
                  v-model="polyTagColor"
                  @change="modifyPolyTagMaterial"
              ></el-color-picker>
              <label title="大小">宽度</label>
              <el-input-number
                  :min="1"
                  :max="100"
                  v-model="polyTagWidth"
                  @input="modifyPolyTagWidth"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="属性信息" name="second">
            <el-input
                type="textarea"
                placeholder="请输入属性"
                v-model="contentAttribute"
            ></el-input>
          </el-tab-pane>
        </el-tabs>
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
import {ref, inject, reactive, watch, onMounted} from "vue";
import localMapManageStorage from "../storage/localMapManageStorage";
import {guid} from "../../../utils/coding";
import pickGloble from "../../pickGloble";
import {nextTick} from "vue";

const gisViewer = inject("bigScreenMap");
const emit = defineEmits([]);
let tag = ref(0);
let layerId = ref("0");
// 用于控制组件的显示与隐藏
const visible = ref(false);

function miniaturized() {
  visible.value = false;
}

function close() {
  visible.value = false;
}

function open() {
  visible.value = true;
  addMapPoint();
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

// tab切换绑定的参数
const activeName = ref("first");

// 图标颜色绑定参数及方法
const polyIconColor = ref("rgba(19, 206, 102, 0.8)");

function modifyPolyIconMaterial() {
  entityAttributes.billboardColor = polyIconColor.value;
  if (tag.value) {
    pointLayer.entities.getById(layerId.value).billboard.color =
        handleColorType(polyIconColor.value);
  }
}

// 图标大小
const polyIconWidth = ref(70);

function modifyPolyIconWidth() {
  entityAttributes.billboard.width = polyIconWidth.value;
  entityAttributes.billboard.height = polyIconWidth.value;
  if (tag.value) {
    pointLayer.entities.getById(layerId.value).billboard.width =
        polyIconWidth.value;
    pointLayer.entities.getById(layerId.value).billboard.height =
        polyIconWidth.value;
  }
}

// 标签颜色颜色绑定参数及方法
const polyTagColor = ref("rgba(19, 206, 102, 0.8)");

function modifyPolyTagMaterial() {
  entityAttributes.labelColor = polyTagColor.value;
  if (tag.value) {
    pointLayer.entities.getById(layerId.value).label.fillColor =
        handleColorType(polyTagColor.value);
  }
}

// 标签大小
const polyTagWidth = ref(30);

function modifyPolyTagWidth() {
  entityAttributes.label.font = polyTagWidth.value + "px sans-serif";
  if (tag.value) {
    pointLayer.entities.getById(layerId.value).label.font =
        polyTagWidth.value + "px sans-serif";
  }
}

// 添加标注点操作
function addLayerPanel() {
  handler.destroy();
  gisViewer.value.mapTooltip.destroy();
  let labelName = "";
  if (pointName.value != "") {
    labelName = pointName.value;
  } else {
    labelName = "标注";
  }
  const item = {
    label: labelName,
    parId: pId.value,
    value: 5,
    id: layerId.value,
    type: "XT_POINT",
    children: [],
    attributes: entityAttributes,
  };
  localMapManageStorage.add(item);
  emit("changeData", layerId.value);
  setNull();
  visible.value = false;
}

// 取消操作
function closePanel() {
  handler.destroy();
  gisViewer.value.mapTooltip.destroy();
  pointLayer.entities.removeById(layerId.value);
  closetag.value = true;
  setNull();
  visible.value = false;
}

let handPoint = ref(null); // 记录当前点击的点
let pointLayer = ({}); // 当前点图层
let pointName = ref("未命名"); // 当前点的名称
let pointLon = ref(0); // 当前点的经度
let pointLat = ref(0); // 当前点的纬度
let pointHeight = ref(0); // 当前点的高度
let entityData = ({});
let closetag = ref(false); // 关闭标志
let entityAttributes = ({}); // 存放entity的属性
// 置空
function setNull() {
  tag.value = 0;
  handPoint.value = null;
  pointLayer = {};
  pointName.value = "";
  pointLon.value = null;
  pointLat.value = null;
  pointHeight.value = null;
  entityData = {};
  contentAttribute.value = "";
  svgActive.value = 1;
  pointImg.value = "static/images/pointMarker/dingwei1.svg";
  polyIconColor.value = "rgba(19, 206, 102, 0.8)";
  polyIconWidth.value = 70;
  polyTagColor.value = "rgba(19, 206, 102, 0.8)";
  polyTagWidth.value = 30;
  entityAttributes = {
    id: "",
    name: "",
    position: {},
    label: {
      text: "", //描述内容
      font: "", //字体大小 类型
      fillColor: "", //颜色
      pixelOffset: new Cesium.Cartesian2(0, -50),
    },
    billboard: {
      image: "",
      color: "",
      width: "",
      height: "",
    },
    attributeContent: "",
    labelColor: "",
    billboardColor: "",
  };
}

let handler = ({}); // 鼠标事件
let svgActive = ref(1); // 当前选择的svg
let contentAttribute = ref(""); // 当前用户填写的点的属性信息
let pointImg = ref("static/images/pointMarker/dingwei1.svg"); // 当前点的默认图标
let svgs = [
  {
    src: "static/images/pointMarker/dingwei1.svg",
    id: 1,
  },
  {
    src: "static/images/pointMarker/dingwei2.svg",
    id: 2,
  },
  {
    src: "static/images/pointMarker/dingwei3.svg",
    id: 3,
  },
  {
    src: "static/images/pointMarker/dingwei4.svg",
    id: 4,
  },
  {
    src: "static/images/pointMarker/dingwei5.svg",
    id: 5,
  },
  {
    src: "static/images/pointMarker/dingwei6.svg",
    id: 6,
  },
  {
    src: "static/images/pointMarker/dingwei7.svg",
    id: 7,
  },
  {
    src: "static/images/pointMarker/dingwei8.svg",
    id: 8,
  },
];

// 弹窗显示的时候就可以开始在地图上点击点了
function addMapPoint() {
  setNull();
  closetag.value = false;
  layerId.value = guid();
  entityData = {};
  pointLayer = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePointLayer"
  )[0];
  let drawStep = 0; //绘制步骤
  handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  handler.setInputAction(function (movement) {
    if (drawStep) {
      pointLayer.entities.remove(entityData);
    }
    handPoint.value = pickGloble(gisViewer.value.viewer, movement.position);
    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("单击增加点!");
    } else if (drawStep === 2) {
      gisViewer.value.mapTooltip.create("单击增加点,右键完成绘制!");
    }
    tag.value++;
    drawPoint(
        pointName.value,
        increaseHeight(handPoint.value, 0.3),
        handleColorType(polyIconColor.value),
        polyIconWidth.value,
        polyTagWidth.value + "px sans-serif",
        handleColorType(polyTagColor.value),
        pointImg.value
    );
    let pointDegree = getDegrees(handPoint.value);
    pointLon.value = pointDegree.x;
    pointLat.value = pointDegree.y;
    pointHeight.value = pointDegree.z;
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(function (movement) {
    handler.destroy();
    gisViewer.value.mapTooltip.destroy();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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

// 在地图上绘制点
function drawPoint(
    pointName,
    pointPosition,
    pointColor,
    pointSize,
    labelFont,
    labelColor,
    ImagerySplitDirection
) {
  entityAttributes = {
    id: layerId.value,
    name: pointName,
    position: pointPosition,
    label: {
      text: pointName, //描述内容
      font: labelFont, //字体大小 类型
      fillColor: labelColor, //颜色
      pixelOffset: new Cesium.Cartesian2(0, -50),
    },
    billboard: {
      image: ImagerySplitDirection,
      color: pointColor,
      width: pointSize,
      height: pointSize,
      disableDepthTestDistance: 1e9,
    },
    attributeContent: contentAttribute.value,
    labelColor: polyTagColor.value,
    billboardColor: polyIconColor.value,
  };
  entityData = pointLayer.entities.add(entityAttributes);
}

// 选择图标
function iconChoose(type) {
  switch (type) {
    case 1:
      pointImg.value = "static/images/pointMarker/dingwei1.svg";
      svgActive.value = 1;
      break;
    case 2:
      pointImg.value = "static/images/pointMarker/dingwei2.svg";
      svgActive.value = 2;
      break;
    case 3:
      pointImg.value = "static/images/pointMarker/dingwei3.svg";
      svgActive.value = 3;
      break;
    case 4:
      pointImg.value = "static/images/pointMarker/dingwei4.svg";
      svgActive.value = 4;
      break;
    case 5:
      pointImg.value = "static/images/pointMarker/dingwei5.svg";
      svgActive.value = 5;
      break;
    case 6:
      pointImg.value = "static/images/pointMarker/dingwei6.svg";
      svgActive.value = 6;
      break;
    case 7:
      pointImg.value = "static/images/pointMarker/dingwei7.svg";
      svgActive.value = 7;
      break;
    case 8:
      pointImg.value = "static/images/pointMarker/dingwei8.svg";
      svgActive.value = 8;
      break;
  }
  entityAttributes.billboard.image = pointImg.value;
  pointLayer.entities.getById(layerId.value).billboard.image = pointImg.value;
}

// 监听名称变化
watch(pointName, () => {
  entityAttributes.label.text = pointName.value;
  if (tag.value && !closetag.value) {
    pointLayer.entities.getById(layerId.value).label.text = pointName.value;
  }
});

// 监听位置变化
watch([pointLon, pointLat, pointHeight], () => {
  let cart = Cesium.Cartesian3.fromDegrees(
      pointLon.value,
      pointLat.value,
      pointHeight.value
  );
  entityAttributes.position = cart;
  // if (!tag.value && pointLon.value != null && pointLat.value != null) {
  // 	pointLayer.entities.getById(layerId.value).position = cart;
  // 	drawPoint(
  // 		pointName.value,
  // 		increaseHeight(cart, 0.3),
  // 		handleColorType(polyIconColor.value),
  // 		polyIconWidth.value,
  // 		polyTagWidth.value + "px sans-serif",
  // 		handleColorType(polyTagColor.value),
  // 		pointImg.value
  // 	);
  // } else if(tag.value) {
  // 	pointLayer.entities.getById(layerId.value).position = cart;
  // }
  if (tag.value && !closetag.value) {
    pointLayer.entities.getById(layerId.value).position = cart;
  }
});

// 监听属性变化
watch(contentAttribute, () => {
  entityAttributes.attributeContent = contentAttribute.value;
  if (tag.value && !closetag.value) {
    pointLayer.entities.getById(layerId.value).attributeContent =
        contentAttribute.value;
  }
});

// 修改entites实体的样式
function changeEntityStyle() {
  pointLayer.entities.getById(layerId.value).billboard.color = handleColorType(
      polyIconColor.value
  );
  pointLayer.entities.getById(layerId.value).billboard.width =
      polyIconWidth.value;
  pointLayer.entities.getById(layerId.value).billboard.height =
      polyIconWidth.value;
  pointLayer.entities.getById(layerId.value).billboard.image = pointImg.value;
  pointLayer.entities.getById(layerId.value).label.text = pointName.value;
  pointLayer.entities.getById(layerId.value).label.font =
      polyTagWidth.value + "px sans-serif";
  pointLayer.entities.getById(layerId.value).label.fillColor = handleColorType(
      polyTagColor.value
  );
}
const EntityLayerName = "mapManagePointLayer";

// 创建临时实体作为图层实体
function createTempEntity() {
  if (gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length > 0) {
    return;
  }
  const pointDataSources = new Cesium.CustomDataSource(EntityLayerName);
  gisViewer.value.viewer.dataSources.add(pointDataSources);
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

<style lang="scss" scoped>
.xt-point-panel {
  width: 300px;
  height: 600px;
}

.add-point-body {
  padding: 10px;
}

::v-deep .el-tabs__item {
  color: #ffffff;
}

::v-deep .el-tabs__nav {
  display: flex;
  min-width: 100%;
  text-align: center;
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

::v-deep.el-input-number {
  width: 120px;
}

::v-deep .el-input-number__decrease {
  top: 6px;
  bottom: 4px;
  width: 28px;
}

::v-deep .el-input-number__increase {
  top: 6px;
  bottom: 4px;
  width: 28px;
}

.xt-icon-element {
  height: 80px;
  margin: 5px 2px;
  text-align: center;
  position: relative;
  -webkit-box-shadow: 0 0 4px 1px #eee;

  img {
    width: 30px;
    height: 30px;
    margin-left: 18px;
    margin-top: 4px;
  }

  img:hover {
    cursor: pointer;
    background-color: rgb(14, 240, 89);
  }

  .backStyle {
    background-color: rgb(240, 180, 14);
  }
}
</style>
