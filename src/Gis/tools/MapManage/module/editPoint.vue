<template>
  <panel-container
      ref="panelContainer"
      title="编辑标注"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-point-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="edit-point-body">
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
import localMapManageStorage from "../storage/localMapManageStorage";
import {ref, inject, reactive, watch, onMounted} from "vue";

const gisViewer = inject("bigScreenMap");
const emit = defineEmits([]);
let tag = ref(0);	// 标记当前是否添加了点

// 用于控制组件的显示与隐藏
const visible = ref(false);

const activeName = ref("first");

function miniaturized() {
  visible.value = false;
}

function close() {
  visible.value = false;
}

function open() {
  visible.value = true;
}

// 用于保存编辑前的数据
const cancleData = ref({});

// 接收父组件传来的标注信息
function getPointData(mapInfo) {
  let data = mapInfo.attributes;
  let att = {
    id: mapInfo.id,
    label: mapInfo.label,
    parId: mapInfo.parId,
    type: mapInfo.type,
    value: mapInfo.value,
    attributes: {
      id: data.id,
      name: data.name,
      position: data.position,
      label: {
        text: data.label.text, //描述内容
        font: data.label.font, //字体大小 类型
        fillColor: data.label.fillColor, //颜色
        pixelOffset: data.label.pixelOffset,
      },
      billboard: {
        image: data.billboard.image,
        color: data.billboard.color,
        width: data.billboard.width,
        height: data.billboard.height,
      },
      attributeContent: data.attributeContent,
      labelColor: data.labelColor,
      billboardColor: data.billboardColor,
    },
  };
  cancleData.value = att;
  pId.value = mapInfo.parId;
  entityAttributes = data;
  layerId.value = data.id;
  pointLayer = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePointLayer"
  )[0];
  pointName.value = data.label.text;
  let cart = getDegrees(data.position);
  pointLon.value = cart.x;
  pointLat.value = cart.y;
  pointHeight.value = cart.z;
  pointImg.value = data.billboard.image;
  let a = pointImg.value.split(".svg")[0];
  svgActive.value = parseInt(a.split("dingwei")[1]);
  polyIconWidth.value = data.billboard.width;
  polyIconColor.value = data.billboardColor;
  polyTagColor.value = data.labelColor;
  polyTagWidth.value = data.label.font.split("px sans-serif")[0];
  contentAttribute.value = data.attributeContent;
}

// 对外开放的方法和变量
defineExpose({
  visible,
  open,
  close,
  miniaturized,
  getPointData,
});

// 图标颜色绑定参数及方法
const polyIconColor = ref("rgba(19, 206, 102, 0.8)");

function modifyPolyIconMaterial() {
  entityAttributes.billboardColor = polyIconColor.value;
  pointLayer.entities.getById(layerId.value).billboard.color = handleColorType(
      polyIconColor.value
  );
}

// 图标大小
const polyIconWidth = ref(70);

function modifyPolyIconWidth() {
  entityAttributes.billboard.width = polyIconWidth.value;
  entityAttributes.billboard.height = polyIconWidth.value;
  pointLayer.entities.getById(layerId.value).billboard.width =
      polyIconWidth.value;
  pointLayer.entities.getById(layerId.value).billboard.height =
      polyIconWidth.value;
}

// 标签颜色颜色绑定参数及方法
const polyTagColor = ref("rgba(19, 206, 102, 0.8)");

function modifyPolyTagMaterial() {
  entityAttributes.labelColor = polyTagColor.value;
  pointLayer.entities.getById(layerId.value).label.fillColor = handleColorType(
      polyTagColor.value
  );
}

// 标签大小
const polyTagWidth = ref(30);

function modifyPolyTagWidth() {
  entityAttributes.label.font = polyTagWidth.value + "px sans-serif";
  pointLayer.entities.getById(layerId.value).label.font =
      polyTagWidth.value + "px sans-serif";
}

// 添加标注点操作
function addLayerPanel() {
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
    attributes: entityAttributes,
  };
  localMapManageStorage.update(item);
  emit("changeData", item.id);
  visible.value = false;
}

// 取消操作
function closePanel() {
  let pointDataSource = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePointLayer"
  )[0];
  pointDataSource && pointDataSource.entities.removeById(cancleData.value.attributes.id);
  emit("canclePoint", cancleData.value);
  visible.value = false;
}

let pointLayer = ({}); // 当前点图层
let pointName = ref(""); // 当前点的名称
let pointLon = ref(null); // 当前点的经度
let pointLat = ref(null); // 当前点的纬度
let pointHeight = ref(null); // 当前点的高度
let contentAttribute = ref(""); // 当前点的属性
let layerId = ref(0); // 当前点的id
let pId = ref(0);	// 当前item的parid
let entityAttributes = ({}); // 存放entity的属性
let svgActive = ref(1); // 当前选择的svg
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
  pointLayer.entities.getById(layerId.value).label.text = pointName.value;
});

// 监听位置变化
watch([pointLon, pointLat, pointHeight], () => {
  let cart = Cesium.Cartesian3.fromDegrees(
      pointLon.value,
      pointLat.value,
      pointHeight.value
  );
  entityAttributes.position = cart;
  pointLayer.entities.getById(layerId.value).position = cart;
});

// 监听属性变化
watch(contentAttribute, () => {
  entityAttributes.attributeContent = contentAttribute.value;
  pointLayer.entities.getById(layerId.value).attributeContent =
      contentAttribute.value;
});

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
</script>

<style lang="scss" scoped>
.xt-point-panel {
  width: 300px;
  height: 600px;
}

.edit-point-body {
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
