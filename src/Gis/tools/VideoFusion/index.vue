<template>
  <panel-container
    ref="panelContainer"
    title="视频融合"
    :visible="visible"
    v-show="visible"
    @close="close"
    @miniaturized="miniaturized"
  >
    <template v-slot:panel-content>
      <div class="container">
        <div class="control-panel">
          <el-radio-group v-model="analyzeType" @change="radioChange">
            <el-radio :label="1">矩形</el-radio>
            <el-radio :label="3">多边形</el-radio>
            <el-radio :label="2">视锥线</el-radio>
          </el-radio-group>
          <div class="btns">
            <el-button type="primary" @click="beginAnalyze">创建视频</el-button>
            <el-button type="danger" @click="removeAnalyze" style="float: right"
              >清除图层</el-button
            >
          </div>
        </div>
      </div>
      <video id="daolu" v-show="false" muted autoplay loop crossorigin controls>
        <source
          src="http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4"
          type="video/mp4"
        />
      </video>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import pickGloble from "../pickGloble";
import videoFusion from "./js/videoFusion";
import { ref, inject, reactive } from "vue";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let analyzeType = ref(3); // 绘制的样式
let handler = reactive({}); // 事件句柄
let pointLayer = ref(null); // 点图层
let polygonLayer = ref(null); // 面图层
let polygon = ref(null); // 面
let startPosition = ref(null); // 起点
let endPosition = ref(null); // 终点
let videoView = reactive({}); // 可视域

function open() {
  visible.value = !visible.value;
  if (!visible.value) {
    removeAnalyze();
  }
}

function close() {
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

// 开始分析
function beginAnalyze() {
  removeAnalyze();
  if (analyzeType.value != 2) {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
    pointLayer.value = new Cesium.CustomDataSource("videoFusionPointLayer");
    polygonLayer.value = new Cesium.CustomDataSource("videoFusionPolygonLayer");
    handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
    );
    let tempPoints = [];
    let drawStep = 0; //绘制步骤
    let dynamicPositions;
    gisViewer.value.mapTooltip.create("单击开始绘制!");
    handler.setInputAction(function (movement) {
      let cartesian = pickGloble(gisViewer.value.viewer, movement.endPosition);
      let newCartesian = increaseHeight(cartesian, 0.1);
      if (tempPoints.length >= 2) {
        tempPoints.pop();
        tempPoints.push(newCartesian);
        if (!Cesium.defined(polygon.value)) {
          switch (analyzeType.value) {
            case 1:
              dynamicPositions = new Cesium.CallbackProperty(function () {
                return new Cesium.Rectangle.fromCartesianArray(tempPoints);
              });
              break;
            case 2:
              break;
            case 3:
              dynamicPositions = new Cesium.CallbackProperty(function () {
                return new Cesium.PolygonHierarchy(tempPoints);
              });
              break;
          }
          polygon.value = drawPolygon(gisViewer.value.viewer, dynamicPositions);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (movement) {
      let cartesian = pickGloble(gisViewer.value.viewer, movement.position);
      let newCartesian = increaseHeight(cartesian, 0.1);
      if (tempPoints.length === 0) {
        tempPoints.push(newCartesian.clone());
      }
      tempPoints.push(newCartesian);
      //在三维场景中添加点
      drawStep++;
      if (drawStep === 1) {
        if (analyzeType.value != 3) {
          gisViewer.value.mapTooltip.create("单击结束绘制!");
        } else {
          gisViewer.value.mapTooltip.create("单击增加点!");
        }
        addPoint(gisViewer.value.viewer, newCartesian);
      } else {
        if (drawStep === 2) {
          if (analyzeType.value != 3) {
            if (analyzeType.value == 1) {
              addPoint(gisViewer.value.viewer, newCartesian);
            }
            handler.destroy();
            tempPoints.pop();
            gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
            gisViewer.value.mapTooltip.destroy();
          } else {
            gisViewer.value.mapTooltip.create("单击增加点,双击完成绘制!");
            addPoint(gisViewer.value.viewer, newCartesian);
          }
        } else {
          addPoint(gisViewer.value.viewer, newCartesian);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function (movement) {
      handler.destroy();
      handler = {};
      tempPoints.pop();
      gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
      gisViewer.value.mapTooltip.destroy();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    gisViewer.value.viewer.dataSources.add(pointLayer.value);
  } else if (analyzeType.value === 2) {
    drawFrustumOutline();
  }
}

// 清除分析
function removeAnalyze() {
  console.log(Object.keys(videoView));
  if (Object.keys(videoView).length != 0) {
    videoView.clear();
  }
  gisViewer.value.viewer.dataSources.remove(pointLayer.value);
  gisViewer.value.viewer.dataSources.remove(polygonLayer.value);
  pointLayer.value = null;
  polygonLayer.value = null;
  polygon.value = null;
  console.log(handler);
  if (Object.keys(handler).length != 0) {
    handler.destroy(); //关闭事件句柄
    handler = {};
  }
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  gisViewer.value.mapTooltip.destroy();
}

// 添加点
function addPoint(viewer, pointPosition) {
  let data = {
    position: pointPosition,
    point: {
      color: Cesium.Color.GREEN, //颜色
      pixelSize: 10, //点大小
    },
  };
  pointLayer.value.entities.add(data);
}

// 添加面
function drawPolygon(viewer, positions) {
  const videoElement = document.getElementById("daolu");
  new Cesium.VideoSynchronizer({
    clock: gisViewer.value.viewer.clock,
    element: videoElement,
  });
  gisViewer.value.viewer.clock.shouldAnimate = true;
  let data;
  switch (analyzeType.value) {
    case 1:
      data = {
        rectangle: {
          coordinates: positions,
          material: videoElement,
        },
      };
      break;
    case 2:
      break;
    case 3:
      data = {
        polygon: {
          hierarchy: positions,
          perPositionHeight: false, //允许三角形使用点的高度
          material: videoElement,
          clampToGround: true,
        },
      };
      break;
  }
  polygonLayer.value.entities.add(data);
  return viewer.dataSources.add(polygonLayer.value);
}

// 改变画图类型
function radioChange(type) {
  removeAnalyze();
}

function drawFrustumOutline() {
  let i = 0;
  handler = new Cesium.ScreenSpaceEventHandler(
    gisViewer.value.viewer.scene.canvas
  );
  handler.setInputAction((movement) => {
    i++;
    if (i === 1) {
      startPosition.value = pickGloble(
        gisViewer.value.viewer,
        movement.position
      );
      if (!startPosition.value) return;
      videoView = new videoFusion(gisViewer.value.viewer, {
        viewPosition: startPosition.value,
        viewPositionEnd: startPosition.value,
        horizontalViewAngle: 90,
        verticalViewAngle: 60,
      });
      handler.setInputAction(
        (
          movement //鼠标移动的事件
        ) => {
          endPosition.value = pickGloble(
            gisViewer.value.viewer,
            movement.endPosition
          );
          if (!endPosition.value) return;
          videoView.updatePosition(endPosition.value);
          if (!videoView.sketch) {
            videoView.drawSketch();
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }
    if (i === 2) {
      //鼠标点击两次获取结束坐标
      i = 0;
      endPosition.value = pickGloble(gisViewer.value.viewer, movement.position);
      videoView.updatePosition(endPosition.value);
      videoView.update();
      handler.destroy(); //销毁鼠标事件
      handler = {};
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
}

.el-radio-group {
  margin-bottom: 1vh;
}

::v-deep .el-radio__label {
  color: white;
  font-size: 17px;
}

/* #daolu {
  width: 0;
  height: 0;
} */
</style>
