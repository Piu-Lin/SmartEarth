<template>
  <panel-container
      ref="panelContainer"
      title="图层管理"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-manage-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="map-center-box">
        <div class="treeHeight">
          <el-tree
              :data="formData"
              show-checkbox
              node-key="id"
              :default-expand-all="true"
              :props="defaultProps"
              :default-checked-keys="choosedRole"
              @check-change="handleCheckChange"
              class="tree"
              :filter-node-method="filterNode"
              @node-contextmenu="rightContextMenu"
              auto-expand-parent
              ref="tree"
          >
            <template #default="{ node, data }">
              <el-input
                  v-model="labelName"
                  v-show="node.isEdit"
                  @blur.stop="handleInput(node, data)"
                  @keyup.enter.native="handleInput2(node, data)"
                  ref="editInput"
              ></el-input>
              <i
                  :class="{
									'xt-tree-layer':
										data.type === allType.cus_la ||
										data.type === allType.img_la ||
										data.type === allType.lay,
									'xt-tree-polyline-layer': data.type === allType.lin,
									'xt-tree-marker-layer': data.type === allType.lab,
									'xt-tree-polygon-layer':
										data.type === allType.fac || data.type === allType.img,
									'xt-tree-marker': data.type === allType.mark,
									'xt-tree-polyline': data.type === allType.one_line,
									'xt-tree-polygon': data.type === allType.plygon,
									'xt-tree-model': data.type === allType.model,
									'xt-tree-model-layer': data.type === allType.model_lay,
								}"
              ></i>
              &nbsp;
              <span v-show="!node.isEdit">{{ node.label }}</span>
            </template>
          </el-tree>
        </div>
        <div
            class="ref-search"
            style="
						width: 100%;
						height: 30px;
						position: absolute;
						left: 10px;
						bottom: 14px;
					"
        >
          <span>ref:</span>
          <input
              type="text"
              v-model="filterText"
              placeholder="输入关键字进行过滤"
              clearable
          />
        </div>
      </div>
    </template>
  </panel-container>
  <div id="contextmenu" v-show="menuVisible" class="menu-box" ref="menu">
    <ul class="list-unstyled">
      <li @click="createFile" v-show="menuVisi.image">
        <span>添加影像图层</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="createFile" v-show="menuVisi.file">
        <span>添加文件夹</span>
        <span style="float: right; display: block"></span>
      </li>
      <li class="divideron"></li>
      <li @click="addPoint" v-show="menuVisi.label">
        <span>添加标注</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="addLine" v-show="menuVisi.line">
        <span>添加线</span>
        <span style="float: right; display: block"></span>
      </li>
      <li class="divideron"></li>
      <li @click="addFace" v-show="menuVisi.face">
        <span>添加面</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="addLayer" v-show="menuVisi.layer">
        <span>添加图层</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="addModel" v-show="menuVisi.model">
        <span>添加模型</span>
        <span style="float: right; display: block"></span>
      </li>
      <li class="divideron"></li>
      <li @click="rename" v-show="menuVisi.update">
        <span>重命名</span>
        <span style="float: right; display: block"></span>
      </li>
      <li class="divideron"></li>
      <li @click="orientation" v-show="menuVisi.view">
        <span>定位</span>
        <span style="float: right; display: block"></span>
      </li>
      <li class="divideron"></li>
      <li @click="deleteMap" v-show="menuVisi.delete">
        <span>删除</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="lookLayer" v-show="menuVisi.look">
        <span>查看目标</span>
        <span style="float: right; display: block"></span>
      </li>
      <li @click="editLayer" v-show="menuVisi.edit">
        <span>编辑</span>
        <span style="float: right; display: block"></span>
      </li>
    </ul>
  </div>
  <layer-panel
      class="modoule-layer-panel"
      ref="layerPan"
      @changeData="updateFormData"
  ></layer-panel>
  <place-polyline-panel
      class="place_line"
      ref="line"
      @changeData="updateFormData"
  ></place-polyline-panel>
  <place-point-panel
      class="place_point"
      ref="point"
      @changeData="updatePointFormData"
  ></place-point-panel>
  <editPoint
      ref="editPointRef"
      class="edit_point_ref"
      @canclePoint="editCancle"
      @changeData="updatePointFormData"
  ></editPoint>
  <place-face-panel
      class="place_face"
      ref="face"
      @changeData="updateFormData"
  ></place-face-panel>
  <edit-line
      class="edit_line"
      ref="lineedit"
      @changeData="updateFormData"
      @cancleFun="editCancle"
  ></edit-line>
  <edit-face
      class="edit_face"
      ref="faceedit"
      @changeData="updateFormData"
      @cancleFun="editCancle"
  ></edit-face>
  <place-poly-model
      class="place_model"
      ref="model"
      @changeData="updateFormData"
  ></place-poly-model>
  <edit-model
      class="edit_model"
      ref="editmodel"
      @changeData="updateFormData"
      @cancleFun="editCancle"
  ></edit-model>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import {inject, nextTick, onMounted, reactive, ref, watch} from "vue";
import localMapManageStorage from "./storage/localMapManageStorage";
import {guid} from "../../utils/coding";
import DynamicPolylinePrimitive from "@/Gis/feature/DynamicPolylinePrimitive";
import LayerPanel from "./module/layerPanel";
import PlacePolylinePanel from "./module/PlacePolylinePanel";
import PlacePointPanel from "./module/PlacePointPanel";
import editPoint from "./module/editPoint";
import PlaceFacePanel from "./module/PlaceFacePanel";
import EditLine from "./module/editLine";
import EditFace from "./module/editFace";
import PlacePolyModel from "./module/PlacePolyModel";
import EditModel from "./module/editModel";
// import {updateLayerManager} from "../../../api/basics/layerManager";

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

defineExpose({
  visible,
  open,
  close,
  miniaturized,
});

const formData = ref([]);

const defaultProps = {
  children: "children",
  label: "label",
};

function handleCheckChange(data, node, chilNode) {
  if (node) {
    if (data.parId === "3") {
      gisViewer.value.setImageryProviderTrue(data.mapName);
    } else if (data.parId === "4") {
      if (data.id === "7") {
        gisViewer.value.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun');
      }
      if (data.id === "8") {
        gisViewer.value.createTileset('/static/data/2/tileset.json', 'building2');
      }
      if (data.id === "9") {
        gisViewer.value.createTileset2('/static/data/4/tileset.json', 'building');
      }
    } else {
      // 添加点
      if (data.attributes) {
        drawPoint(data.attributes);
      }
      // 添加线
      if (data.optional) {
        addLineFun(data);
      }
      if (data.attributesFace) {
        addFaceFun(data);
      }
      if (data.model) {
        addModelFun(data);
      }
    }
  } else {
    if (data.parId === "3") {
      gisViewer.value.setImageryProvider(data.mapName);
    } else if (data.parId === "4") {
      gisViewer.value.hide3DTileset(data.name);
    } else {
      if (data.attributes) {
        let pointLayer = gisViewer.value.viewer.dataSources.getByName(
            "mapManagePointLayer"
        )[0];
        pointLayer.entities.removeById(data.attributes.id);
      }
      if (data.optional) {
        let pointLayer =
            gisViewer.value.viewer.dataSources.getByName("drawingline")[0];
        pointLayer.entities.removeById(data.optional.id);
      }
      if (data.attributesFace) {
        let faceLayer = gisViewer.value.viewer.dataSources.getByName(
            "mapManagePolygonLayer"
        )[0];
        faceLayer.entities.removeById(data.attributesFace.id);
      }
      if (data.model) {
        let modelLayer = gisViewer.value.viewer.dataSources.getByName(
            "drawingModel"
        )[0];
        modelLayer.entities.removeById(data.id);
      }
    }
  }
}

// 传入数据添加线
function addLineFun(data) {
  let lineLayer = gisViewer.value.viewer.dataSources.getByName(
      "drawingline"
  )[0];
  const material = {
    color: handleColorType(data.rgba),
    type: data.polylineType,
    width: data.optional.polyline.width,
  };
  if (!lineLayer.entities.getById(data.id)) {
    const poly = new DynamicPolylinePrimitive(
        gisViewer.value.viewer,
        data.optional.polyline.positions,
        lineLayer,
        'line',
        material,
        data.id,
    );
  }
}

// 传入数据添加面
function addFaceFun(data) {
  let faceLayer = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePolygonLayer"
  )[0];
  let polygonData = {};
  if (data.attributesFace.extrudedHeight) {
    polygonData = {
      id: data.id,
      polygon: {
        extrudedHeight: data.attributesFace.extrudedHeight,
        hierarchy: data.attributesFace.positions,
        perPositionHeight: true, //允许三角形使用点的高度
        material: handleColorType(data.attributesFace.faceColor),
        outline: true,
        outlineColor: handleColorType(data.attributesFace.lineColor),
        outlineWidth: 5,
        clampToGround: false,
      }
    };
  } else {
    polygonData = {
      id: data.id,
      polygon: {
        hierarchy: data.attributesFace.positions,
        perPositionHeight: true, //允许三角形使用点的高度
        material: handleColorType(data.attributesFace.faceColor),
        outline: true,
        outlineColor: handleColorType(data.attributesFace.lineColor),
        outlineWidth: 5,
        clampToGround: false,
      }
    };
  }
  if (!faceLayer.entities.getById(data.id)) {
    faceLayer.entities.add(polygonData);
  }
}


const filterText = ref("");
const tree = ref(null);

watch(filterText, (newData, oldData) => {
  tree.value.filter(newData);
});

function filterNode(value, data) {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
}

// 菜单是否显示
const menuVisible = ref(false);
// 菜单内容
const menu = ref(null);
// 菜单是否显示
const menuVisi = ref({
  delete: false, // 删除
  update: false, // 重命名
  file: false, // 新建文件夹
  view: false, // 定位
  image: false, // 影像
  layer: false, // 图层
  label: false, // 标注
  line: false, // 线
  face: false, // 面
  look: false, // 查看目标
  edit: false, // 编辑
  model: false,// 模型
});
// 图层信息
let mapInfo = {};
// 当前树节点
let currentNode = ref(null);

// 右键显示菜单选项
function rightContextMenu(event, data, node, oneself) {
  menuVisi.value = {
    delete: false, // 删除
    update: false, // 重命名
    file: false, // 新建文件夹
    view: false, // 定位
    image: false, // 影像
    layer: false, // 图层
    label: false, // 标注
    line: false, // 线
    face: false, //面
    look: false, // 查看目标
    edit: false, // 编辑
  };
  // 将右键获取的数据信息赋值给mapInfo
  mapInfo = data;
  currentNode = node;
  event.preventDefault(); //关闭浏览器右键默认事件
  menuVisible.value = false;
  switchMenuByType(data.type);
  menuVisible.value = true;
  styleMenu(menu, event);
}

const allType = ref({
  cus_la: "XT_CUSTOM_LAYER",
  img_la: "XT_IMAGE_LAYER",
  img: "XT_IMAGE",
  lay: "XT_LAYER",
  lab: "XT_LABEL",
  fac: "XT_FACE",
  lin: "XT_LINE",
  mark: "XT_POINT",
  one_line: "XT_ONE_LINE",
  plygon: "XT_PLYGON",
  model_lay: "XT_MODEL",
  model: "XT_ONE_MODEL",
});

// 根据type显示菜单内容
function switchMenuByType(type) {
  switch (type) {
    case "XT_CUSTOM_LAYER":
      menuVisi.value.file = true;
      break;
    case "XT_IMAGE_LAYER":
      break;
    case "XT_IMAGE":
      menuVisi.value.view = true;
      break;
    case "XT_LAYER":
      menuVisi.value.delete = true;
      menuVisi.value.update = true;
      menuVisi.value.layer = true;
      break;
    case "XT_LABEL":
      menuVisi.value.delete = true;
      menuVisi.value.update = true;
      menuVisi.value.label = true;
      break;
    case "XT_FACE":
      menuVisi.value.delete = true;
      menuVisi.value.update = true;
      menuVisi.value.face = true;
      break;
    case "XT_LINE":
      menuVisi.value.delete = true;
      menuVisi.value.update = true;
      menuVisi.value.line = true;
      break;
      // 点图层（删除、查看目标、编辑）
    case "XT_POINT":
      menuVisi.value.delete = true;
      menuVisi.value.look = true;
      menuVisi.value.edit = true;
      break;
    case "XT_ONE_LINE":
      menuVisi.value.delete = true;
      menuVisi.value.look = true;
      menuVisi.value.edit = true;
      break;
    case "XT_PLYGON":
      menuVisi.value.delete = true;
      menuVisi.value.look = true;
      menuVisi.value.edit = true;
      break;
    case "XT_MODEL":
      menuVisi.value.delete = true;
      menuVisi.value.update = true;
      menuVisi.value.model = true;
      break;
    case "XT_ONE_MODEL":
      menuVisi.value.delete = true;
      menuVisi.value.look = true;
      menuVisi.value.edit = true;
      break;
  }
}

function foo() {
  // 取消鼠标监听事件 菜单栏
  menuVisible.value = false;
}

// choosedRole
let choosedRole = ref(["5", "7"]);

function updateFormData(id) {
  formData.value = localMapManageStorage.fetch();
  // updateLayerManager({
  //   id: 1,
  //   layerJson: JSON.stringify(formData.value)
  // });
  choosedRole.value = ["5", "7"];
  choosedRole.value.push(id);
}

function updatePointFormData(id) {
  formData.value = localMapManageStorage.fetch();
  // updateLayerManager({
  //   id: 1,
  //   layerJson: JSON.stringify(formData.value)
  // });
  choosedRole.value = ["5", "7"];
  choosedRole.value.push(id);
}

// 上传表单内容
const formDataInfo = ref({});

// 保存数据到localStorage
function saveLocalStorage() {
  console.log(localMapManageStorage.fetch().length, "localMapManageStorage.fetch().length");
  if (localMapManageStorage.fetch().length <= 0) {
    fetch('/static/json/tucengManage.json')
        .then(response => response.json())
        .then(data => {
          localMapManageStorage.save(JSON.parse(JSON.stringify(data)));
          formData.value = localMapManageStorage.fetch();
        })
        .catch(error => {
          console.error('Error:', error);
        });
  } else {
    formData.value = localMapManageStorage.fetch();
  }
}

function styleMenu(menu, e) {
  menu.value.style.left = e.clientX + "px";
  document.addEventListener("click", foo);
  menu.value.style.top = e.clientY + "px";
}

// 删除图层
function deleteMap() {
  if (mapInfo.children === null || mapInfo.children.length === 0) {
    localMapManageStorage.delete(mapInfo);
    choosedRole.value = ["5", "7"];
    formData.value = localMapManageStorage.fetch();
    // updateLayerManager({
    //   id: 1,
    //   layerJson: JSON.stringify(formData.value)
    // });
    // 删除地图上的点
    if (mapInfo.attributes) {
      let pointLayer =
          gisViewer.value.viewer.dataSources.getByName("mapManagePointLayer")[0];
      pointLayer.entities.removeById(mapInfo.attributes.id);
    }
    // 删除地图上的线
    if (mapInfo.optional) {
      let pointLayer =
          gisViewer.value.viewer.dataSources.getByName("drawingline")[0];
      pointLayer.entities.removeById(mapInfo.optional.id);
    }
    // 删除地图上的面
    if (mapInfo.attributesFace) {
      let pointFace =
          gisViewer.value.viewer.dataSources.getByName("mapManagePolygonLayer")[0];
      pointFace.entities.removeById(mapInfo.attributesFace.id);
      pointFace.entities.removeById(mapInfo.attributesFace.id + "line");
    }
    // 删除地图上的模型
    if (mapInfo.model) {
      let modelLayer =
          gisViewer.value.viewer.dataSources.getByName("drawingModel")[0];
      modelLayer.entities.removeById(mapInfo.id);
    }
  } else {
    alert("此文件夹下有图层信息不能删除");
  }
}

// 定位方法
function orientation() {
  gisViewer.value.flyTo(
      {
        longitude: 120.38050688712124,
        latitude: 30.792044302489575,
        height: 4072.976993257493,
        heading: 0.06614618954952345,
        pitch: -0.5394643069760185,
        roll: 0.00022754365231847373,
      }
  );
}

let labelName = ref("");
let editInput = ref(null);

// 重命名
function rename() {
  // 打开编辑状态
  if (!currentNode.isEdit) {
    currentNode.isEdit = true;
  }
  labelName.value = mapInfo.label;
  editInput.value.focus();
}

// 输入框输入名称
function handleInput(node, data) {
  const item = {
    label: labelName.value,
    parId: data.parId,
    value: data.value,
    id: data.id,
    type: data.type,
    children: data.children,
  };
  localMapManageStorage.update(item);
  node.isEdit = false;
  formData.value = localMapManageStorage.fetch();
  // updateLayerManager({
  //   id: 1,
  //   layerJson: JSON.stringify(formData.value)
  // });
}

// 输入框输入名称
function handleInput2(node, data) {
  node.isEdit = false;
}

// 新建文件夹
function createFile() {
  const id = guid();
  const item = {
    label: "新建文件夹",
    parId: "2",
    value: 3,
    id: id,
    type: "XT_LAYER",
    children: [],
  };
  localMapManageStorage.add(item);
  formData.value = localMapManageStorage.fetch();
  // updateLayerManager({
  //   id: 1,
  //   layerJson: JSON.stringify(formData.value)
  // });
}

// 获取组件引用
const layerPan = ref(null);

// 新建图层
function addLayer() {
  layerPan.value.open();
  layerPan.value.pId = mapInfo.id;
}

const line = ref(null);

// 点击添加线的方法
function addLine() {
  line.value.open();
  line.value.parId = mapInfo.id;
  line.value.onLeftClick();
}

// 获取添加标注点的组件引用
const point = ref(null);

// 点击添加点时执行的方法
function addPoint() {
  point.value.open();
  point.value.pId = mapInfo.id;
}

onMounted(() => {
  saveLocalStorage();
  nextTick(() => {
  });
});

// 查看目标
function lookLayer() {
  tree.value.setChecked(mapInfo.id, true, true);
  if (mapInfo.attributes) {
    gisViewer.value.flyTo(getDegrees(mapInfo.attributes.position));
  }
  if (mapInfo.optional) {
    let pointLayer =
        gisViewer.value.viewer.dataSources.getByName("drawingline")[0];
    addLineFun(mapInfo);
    const entity = pointLayer.entities.getById(mapInfo.optional.id);
    gisViewer.value.flyToLine(entity);
  }
  if (mapInfo.attributesFace) {
    let pointLayer =
        gisViewer.value.viewer.dataSources.getByName("mapManagePolygonLayer")[0];
    addFaceFun(mapInfo);
    let entity = pointLayer.entities.getById(mapInfo.id);
    gisViewer.value.flyToEntity(entity);
  }
  if (mapInfo.model) {
    let modelLayer = gisViewer.value.viewer.dataSources.getByName("drawingModel")[0];
    addModelFun(mapInfo);
    gisViewer.value.flyTo(getDegrees(mapInfo.position));
  }
}


function editLayer() {
  switch (mapInfo.type) {
    case "XT_ONE_LINE":
      linEdit(mapInfo);
      break;
    case "XT_POINT":
      pointEdit();
      break;
    case "XT_PLYGON":
      faceEdit(mapInfo);
      break;
    case "XT_ONE_MODEL":
      modelEdit(mapInfo);
      break;
  }
}

const editmodel = ref(null);

function modelEdit(modelInfo) {
  tree.value.setChecked(modelInfo.id, true, true);
  let modelLayer = gisViewer.value.viewer.dataSources.getByName(
      "drawingModel"
  )[0];
  modelLayer.entities.removeById(modelInfo.id);
  addModelFun(modelInfo);
  editmodel.value.open();
  editmodel.value.modelInfo = modelInfo;
  editmodel.value.addModel();
}

//
// 编辑线弹框的引用
const lineedit = ref(null);

// 编辑线执行的方法
function linEdit(lineInfo) {
  tree.value.setChecked(lineInfo.id, true, true);
  let lineLayer = gisViewer.value.viewer.dataSources.getByName(
      "drawingline"
  )[0];
  lineLayer.entities.removeById(lineInfo.id);
  addLineFun(lineInfo);
  lineedit.value.open();
  lineedit.value.lineInfo = lineInfo;
  lineedit.value.openFun();
}

// 编辑点的引用
const editPointRef = ref(null);

// 执行编辑点的方法
function pointEdit() {
  tree.value.setChecked(mapInfo.id, true, true);
  editPointRef.value.getPointData(mapInfo);
  editPointRef.value.open();
}

let pointEntities = reactive({});

// 在地图上绘制点
function drawPoint(data) {
  let layer = gisViewer.value.viewer.dataSources.getByName("mapManagePointLayer")[0];
  let entityAttributes = {
    id: data.id,
    name: data.label.text,
    position: data.position,
    label: {
      text: data.label.text, //描述内容
      font: data.label.font, //字体大小 类型
      fillColor: handleColorType(data.labelColor), //颜色
      pixelOffset: new Cesium.Cartesian2(0, -50),
    },
    billboard: {
      image: data.billboard.image,
      color: handleColorType(data.billboardColor),
      width: data.billboard.width,
      height: data.billboard.width,
    },
    attributeContent: data.attributeContent,
    labelColor: data.labelColor,
    billboardColor: data.billboardColor,
  };
  if (!layer.entities.getById(data.id)) {
    pointEntities = layer.entities.add(entityAttributes);
  }
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

// 添加面
const face = ref(null);

// 点击添加面执行的方法
function addFace() {
  face.value.open();
  face.value.pId = mapInfo.id;
}

const faceedit = ref(null);

// 点击编辑面执行的方法
function faceEdit(faceInfo) {
  tree.value.setChecked(faceInfo.id, true, true);
  let faceLayer = gisViewer.value.viewer.dataSources.getByName(
      "mapManagePolygonLayer"
  )[0];
  faceLayer.entities.removeById(faceInfo.id);
  addFaceFun(faceInfo);
  faceedit.value.open();
  faceedit.value.faceInfo = faceInfo;
  faceedit.value.openFun();
}


// 编辑取消按钮触发方法
function editCancle(cancleData) {
  switch (cancleData.type) {
    case "XT_ONE_LINE":
      updateFormData(cancleData.id);
      addLineFun(cancleData);
      break;
    case "XT_PLYGON":
      updateFormData(cancleData.id);
      addFaceFun(cancleData);
      break;
    case "XT_POINT":
      updateFormData(cancleData.attributes.id)
      drawPoint(cancleData.attributes);
      break;
    case "XT_ONE_MODEL":
      updateFormData(cancleData.id)
      addModelFun(cancleData);
      break;
  }
}

// 获取添加标注点的组件引用
const model = ref(null);

// 添加模型
function addModel() {
  model.value.pId = mapInfo.id;
  model.value.open();
}

// 传入数据添加模型
function addModelFun(data) {
  let modelLayer = gisViewer.value.viewer.dataSources.getByName(
      "drawingModel"
  )[0];
  // 转经纬度高度
  const modelDegree = getDegrees(data.position);
  let data1 = {
    position: {
      x: modelDegree.x,
      y: modelDegree.y,
      z: modelDegree.z,
    },
    orientation: data.orientation,
  }
  const orientation = getOrientation(data1);
  if (!modelLayer.entities.getById(data.id)) {
    modelLayer.entities.add({
      id: data.id,
      name: data.label,
      position: data.position,
      orientation: orientation,
      model: {
        uri: data.model.uri,
        scale: data.model.scale,
        miniaturized: 60,
        maximumScale: 512,
      }
    });
  }
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

</script>

<style lang="scss" scoped>
.xt-manage-panel {
  width: 300px;
  height: 300px;
}

.xt-paths-content {
  overflow-y: auto;
  padding: 5px 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.map-center-box {
  height: calc(100% - 44px);
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
}

span {
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
  Microsoft YaHei, \\5FAE\8F6F\96C5\9ED1, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #515a6e;
  color: rgb(255, 255, 255);
}

.tree {
  color: #ffffff;
  background: rgba(0, 0, 0, 0);
  overflow: hidden;
}

.tree :active {
  background-color: #5b95cc;
}

:deep .el-tree-node:focus > .el-tree-node__content {
  background-color: #5b95cc;
}

:deep(.el-tree-node__content:hover) {
  background-color: #5b95cc;
}

.menu-box {
  border-top: 4px solid #5b95cc;
  width: 150px;
  position: absolute;
  z-index: 10000;
  background: #696969;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.menu-box > ul {
  margin: auto;
}

ul,
li {
  margin: 0px;
  padding: 0px;
}

.menu-box ul li {
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  box-sizing: border-box;
  list-style: none;
}

.divideron {
  height: 2px !important;
  width: 100% !important;
  line-height: 2px !important;
  background: #5b95cc !important;
}

.menu-box ul li:hover {
  background: #5b95cc;
}

input {
  width: calc(100% - 49px);
  height: 28px;
  background: #407cb455;
  border-radius: 3px;
  border: none;
  color: #ddd;
  padding: 0 10px;
  margin-left: 4px;
}

input:focus {
  outline: 1px solid #5b95cc;
}

:deep(.el-input__inner) {
  height: 23px;
  width: calc(100% - 1px);
  font-size: 15px;
  border-radius: 3px;
  padding: 0 10px;
  border: none;
  background: #407cb455;
  color: #ddd;
}

:deep(.el-input__inner:focus) {
  outline: 1px solid #5b95cc;
}

/* 设置引用组件的位置 */
.modoule-layer-panel {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.place_line {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.place_point {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.xt-tree-layer {
  background-image: url("@/assets/images/icons/folder.svg");
}

.xt-tree-marker-layer {
  background-image: url("@/assets/images/icons/marklayer.svg");
}

.xt-tree-polyline-layer {
  background-image: url("@/assets/images/icons/polylinelayer.svg");
}

.xt-tree-polygon-layer {
  background-image: url("@/assets/images/icons/polygonlayer.svg");
}

.xt-tree-marker {
  background-image: url("@/assets/images/icons/mark.svg");
}

.xt-tree-polyline {
  background-image: url("@/assets/images/icons/polyline.svg");
}

.xt-tree-polygon {
  background-image: url("@/assets/images/icons/polygon.svg");
}

.xt-tree-model-layer {
  background-image: url("@/assets/images/icons/modellayer.svg");
}

.xt-tree-model {
  background-image: url("@/assets/images/icons/model.svg");
}

.map-center-box i {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: 16px;
  background-repeat: no-repeat;
}

/* 给添加面的弹窗设置位置 */
.place_face {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.edit_line {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.edit_face {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.place_model {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.edit_model {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.edit_point_ref {
  position: absolute;
  top: 6vh;
  left: 20vw;
}

.treeHeight {
  height: 200px;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 8px;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.1);
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: rgba(0, 0, 0, 0);
}
</style>
