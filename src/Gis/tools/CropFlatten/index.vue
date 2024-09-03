<template>
  <panel-container ref="panelContainer" title="裁剪压平" :visible="visible" v-show="visible" @close="close"
    @miniaturized="miniaturized">
    <template v-slot:panel-content>
      <div class="container">
        <div class="control-panel">
          <el-radio-group v-model="editType" @change="radioChange">
            <el-radio :label="1">裁剪</el-radio>
            <el-radio :label="2">压平</el-radio>
            <el-radio :label="3">拉伸</el-radio>
          </el-radio-group>
          <el-form-item v-show="editType===2" label="压平高度" style="color: white">
            <el-input v-model="flatHeight" type="number" @change="changeFlatHeight" :step="0.1" />
          </el-form-item>
          <div class="btns">
            <el-button type="primary" @click="beginAnalyze">开始</el-button>
            <el-button type="danger" @click="removeAnalyze" style="float: right">清除</el-button>
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import { ref, inject, reactive } from "vue";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let analyzeType = ref(3); // 绘制的样式
let editType = ref(1); // 编辑类型
let flatHeight = ref(56.4); // 压平高度
let showData = ref(false);

function open() {
  visible.value = !visible.value;
  if (!visible.value) {
    removeAnalyze();
    flatHeight.value = 56.4;
  }
}

function close() {
  removeAnalyze();
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

// 改变画图类型
function radioChange() {
  removeAnalyze();
}

// 开始
function beginAnalyze() {
  if (editType.value === 1) {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
    gisViewer.value.map.graphicLayer.clear();
    gisViewer.value.map.graphicLayer.startDraw({
      type: "polygon",
      style: {
        color: "#007be6",
        opacity: 0.5
      },
      success: function (graphic) {
        // 绘制成功后回调
        const positions = graphic.positionsShow;
        gisViewer.value.map.graphicLayer.clear();
        gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;

        gisViewer.value.map._layerList.values.forEach(layer => {
          if (layer.name === 'nanxun' || layer.name === 'nanxun_industry' || layer.name === 'nanxun_industry' || layer.name === 'nanxun-fbx' || layer.name === 'nanxun-fbx-sw' || layer.name === 'nanxun-fbx-dx') {
            layer.clip.addArea(positions);
          }
        })
      }
    })
  }
  if (editType.value === 2) {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
    gisViewer.value.map.graphicLayer.clear();
    gisViewer.value.map.graphicLayer.startDraw({
      type: "polygon",
      style: {
        color: "#007be6",
        opacity: 0.5
      },
      success: function (graphic) {
        // 绘制成功后回调
        const positions = graphic.positionsShow;
        gisViewer.value.map.graphicLayer.clear();
        gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;

        gisViewer.value.map._layerList.values.forEach(layer => {
          if (layer.name === 'nanxun' || layer.name === 'nanxun_industry' || layer.name === 'nanxun_industry' || layer.name === 'nanxun-fbx' || layer.name === 'nanxun-fbx-sw' || layer.name === 'nanxun-fbx-dx') {
            layer.flat.addArea(positions, { height: flatHeight.value });
          }
        })
      }
    })
  }
  if (editType.value === 3) {
    measureVolume();
  }
}

// 改变压平的高度
function changeFlatHeight(val) {
  gisViewer.value.map._layerList.values.forEach(layer => {
    if (layer.name === 'nanxun' || layer.name === 'nanxun_industry' || layer.name === 'nanxun_industry' || layer.name === 'nanxun-fbx' || layer.name === 'nanxun-fbx-sw' || layer.name === 'nanxun-fbx-dx') {
      layer.flat.updateHeight(val);
    }
  })
}

// 清除
function removeAnalyze() {
  gisViewer.value.map._layerList.values.forEach(layer => {
    if (layer.name === 'nanxun' || layer.name === 'nanxun_industry' || layer.name === 'nanxun_industry' || layer.name === 'nanxun-fbx' || layer.name === 'nanxun-fbx-sw' || layer.name === 'nanxun-fbx-dx') {
      layer.clip.clear();
      layer.flat.clear();
    }
  })
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  gisViewer.value.viewer.dataSources.getByName("measuretemp").forEach(item => {
    item.entities.removeAll();
  });
}

// 添加线
function addTestLine(positions) {
  const graphic = new mars3d.graphic.PolylineEntity({
    positions: positions,
    style: {
      closure: true,
      color: "#ffffff",
      opacity: 0.8,
      width: 2,
      clampToGround: true
    }
  })
  let lineLayer = new mars3d.layer.GraphicLayer();
  lineLayer.id = 'line';
  gisViewer.value.map.addLayer(lineLayer);
  lineLayer.addGraphic(graphic);
}

import pickGloble from "@/Gis/tools/pickGloble";
let volumePolygon = ref(null);  // 体积底面
let volumeId = ref(null);
const EntityLayerName = "measuretemp";
import PolygonPrimitive from "@/Gis/feature/PolygonPrimitive";
// 测量体积
function measureVolume() {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  let layer = null;
  if (gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length > 0) {
    layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  } else {
    layer = new Cesium.CustomDataSource(EntityLayerName);
    gisViewer.value.viewer.dataSources.add(layer);
  }
  volumeId.value = new Date().getTime();
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal('volumeHandler', handler);
  let positions = [];
  let tempPoints = [];
  volumePolygon.value = null;
  let floatingPoint; //浮动点
  let drawStep = 0; //绘制步骤
  gisViewer.value.mapTooltip.create("单击开始绘制!");
  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(
        gisViewer.value.viewer,
        movement.endPosition
    );

    let newCartesian = increaseHeight(cartesian, 0.1);
    if (positions.length >= 2) {
      if (!Cesium.defined(volumePolygon.value)) {
        volumePolygon.value = new PolygonPrimitive(
            gisViewer.value.viewer,
            positions,
            layer,
            6,
            Cesium.Color.RED.withAlpha(0.5),
            volumeId.value,
            true
        );
      } else {
        positions.pop();
        positions.push(newCartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(
        gisViewer.value.viewer,
        movement.position
    );
    let newCartesian = increaseHeight(cartesian, 0.1);
    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    //在三维场景中添加点
    let cartographic = Cesium.Cartographic.fromCartesian(
        positions[positions.length - 1]
    );
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    let heightString = cartographic.height;
    tempPoints.push({
      lon: longitudeString,
      lat: latitudeString,
      hei: heightString
    });
    floatingPoint = layer.entities.add({
      // parent: layer,
      name: 6,
      position: positions[positions.length - 1],
      type: "volumPoint",
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE
      }
    });

    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("单击增加点!");
    } else if (drawStep === 2) {
      gisViewer.value.mapTooltip.create("单击增加点,双击完成绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function (movement) {
    handler.destroy();
    positions.pop();
    positions.pop();
    tempPoints.pop();
    layer.entities.remove(floatingPoint);
    editVolume(tempPoints, positions, layer, volumeId.value);
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
// 编辑体
function editVolume(tempPoints, positions, layer, volumeId) {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.MOVE;
  let height = 0;
  let edit = false;
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  let cameraHeight = gisViewer.value.viewer.camera.positionCartographic.height;
  let rate = 1; // 放缩比
  if (cameraHeight < 300) {
    rate = 0.5;
  } else if (cameraHeight <= 500) {
    rate = 1;
  } else if (cameraHeight <= 1500) {
    rate = 2;
  } else if (cameraHeight <= 3000) {
    rate = 3;
  } else if (cameraHeight > 3000) {
    rate = 4;
  }
  let mouseRateHeight;  // 乘以缩放比之后的鼠标位查
  let polygonHeight;  // 实体真实高度，用于计算
  //鼠标左键下压事件
  handler.setInputAction((e) => {
    let id = gisViewer.value.viewer.scene.pick(e.position);
    if (!id || !id.id || !id.id.name) {
      return;
    } else {
      if (id.id.name == 6) {
        edit = true;
        gisViewer.value.mapTooltip.create("移动鼠标升降!");
        gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  // 鼠标移动事件
  handler.setInputAction((e) => {
    if (edit) {
      gisViewer.value.mapTooltip.create("右键点击结束！");
      height = e.startPosition.y - e.endPosition.y;
      mouseRateHeight = height * rate;
      if (layer.entities.getById(volumeId).polygon.extrudedHeight) {
        layer.entities.getById(volumeId).polygon.extrudedHeight += mouseRateHeight;
      } else {
        layer.entities.getById(volumeId).polygon.extrudedHeight = 0.1 + mouseRateHeight;
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 鼠标右键点击事件
  handler.setInputAction((e) => {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    polygonHeight = layer.entities.getById(volumeId).polygon.extrudedHeight;
    let modelPointHeightSum = 0;
    positions.forEach((element) => {
      let cartographic = Cesium.Cartographic.fromCartesian(element);
      let pointHeight = cartographic.height > 0 ? cartographic.height : 0;
      modelPointHeightSum += pointHeight;
    })
    let modelPointHeightAvg = modelPointHeightSum / positions.length;
    polygonHeight -= modelPointHeightAvg;
    handler.destroy();
    gisViewer.value.mapTooltip.destroy();
    edit = false;
    gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = true;
    if (polygonHeight < 0) {
      polygonHeight = 0;
    }
    gisViewer.value.mapTooltip.destroy();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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
</script>

<style scoped>
.container {
  margin-top: 1vh;
  margin-bottom: 1vh;
  width: 16vw;
}
:deep(.el-radio__label) {
  color: white;
  font-size: 17px;
}
:deep(.el-form-item__label) {
  color: white;
}

.btns {
  margin-top: 1vh;
}
</style>
