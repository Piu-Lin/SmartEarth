<template>
  <div ref="cesiumViewer" className="cesiumViewer"></div>
  <img class="logo" src="/static/images/logo2.png">
</template>

<script setup>
import ToolsMap from './ToolsMap';
import {defineExpose} from "vue";
import PolygonPrimitive from "../feature/PolygonPrimitive";
import PolylinePrimitive from "../feature/PolylinePrimitive";
import pickGloble from "@/Gis/tools/pickGloble";
import { listPosition } from "@/api/basics/position";

const props = defineProps({
  positionType: Number,
  positionId: String,
  position: Object,
})

let toolsMap = null;
let layer = null;
const cesiumViewer = ref(null);

onMounted(() => {
  toolsMap = new ToolsMap(cesiumViewer.value);
  toolsMap._positionType = props.positionType;
  toolsMap._positionId = props.positionId;
  layer = new Cesium.CustomDataSource("admin-area");
  toolsMap.viewer.dataSources.add(layer);
});

function initToolsMap() {
  cleanMap();
  toolsMap._positionType = props.positionType;
  if (props.positionType === 1) {
    // 点位回显
    let position = JSON.parse(props.position);
    if (position && position.type === 'Point') {
      toolsMap.addMark(toolsMap.viewer, {
        coordinate: {
          x: position.coordinates[0],
          y: position.coordinates[1],
          z: position.coordinates[2]
        }, image: '/static/images/marker/normal.png'
      });
      toolsMap.flyTo({x: position.coordinates[0], y: position.coordinates[1], z: position.coordinates[2]});
    }
  } else if (props.positionType === 2) {
    // 单体化面回显
    if (props.positionId) {
      toolsMap.highlightEntity(props.positionId);
      let position = JSON.parse(props.position);
      if (position && position.type === 'Point') {
        toolsMap.flyTo({x: position.coordinates[0], y: position.coordinates[1], z: position.coordinates[2]});
      }
    }
  } else if (props.positionType === 3) {
    // 绘制面
    layer.entities.removeAll();
    // 自定义面回显
    if (props.position) {
      setPositions(props.position);
      drawArea(layer);
      toolsMap.mapTooltip.create("右键删除重新绘制!");
    } else {
      toolsMap.viewer._element.style.cursor = "crosshair";
      toolsMap.mapTooltip.create("单击开始绘制!");
    }
  } else if (props.positionType === 4) {
    listPosition({ positionId: props.positionId }).then(res => {
      res.rows.forEach(item => {
        setPositions(item.position);
      })
    })
  }
}

function setPositions(str) {
  let positions = [];
  let position = JSON.parse(str);
  if (position.type === 'Polygon') {
    position.coordinates.forEach(coordinate => {
      coordinate.forEach(item => {
        positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1]))
      })
    })
    new PolygonPrimitive(toolsMap.viewer, positions, layer, 2);
  }
  if (position.type === 'MultiPolygon') {
    position.coordinates.forEach(coordinate => {
      coordinate.forEach(polygon => {
        polygon.forEach(item => {
          positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1]))
        })
      })
    })
    new PolygonPrimitive(toolsMap.viewer, positions, layer, 2);
  }
  if (position.type === 'MultiLineString') {
    position.coordinates.forEach(coordinate => {
      coordinate.forEach(item => {
        positions.push(Cesium.Cartesian3.fromDegrees(item[0], item[1]))
      })
    })
    new PolylinePrimitive(toolsMap.viewer, positions, layer, 2, { clampToGround: true });
  }
}
// 绘制面
function drawArea(layer) {
  let handler = new Cesium.ScreenSpaceEventHandler(toolsMap.viewer.scene.canvas);
  handler.setInputAction(() => {
    let positions = [];
    layer.entities.removeAll();
    toolsMap.viewer._element.style.cursor = "crosshair";
    toolsMap.mapTooltip.create("单击开始绘制!");
    repaintArea(layer, positions, handler);
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

// 重绘面
function repaintArea(layer, positions, handler) {
  let polygon = null;
  let floatingPoint; //浮动点
  let drawStep = 0; //绘制步骤
  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(toolsMap.viewer, movement.endPosition);
    let newCartesian = increaseHeight(cartesian, 0.1);
    if (positions.length >= 2) {
      if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(
            toolsMap.viewer,
            positions,
            layer,
            2
        );
      } else {
        positions.pop();
        positions.push(newCartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(toolsMap.viewer, movement.position);
    let newCartesian = increaseHeight(cartesian, 0.1);
    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    floatingPoint = layer.entities.add({
      name: 2,
      position: positions[positions.length - 1],
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
      toolsMap.mapTooltip.create("单击增加点!");
    } else if (drawStep >= 2) {
      toolsMap.mapTooltip.create("单击增加点,双击完成绘制!右键删除重新绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(() => {
    handler.destroy();
    toolsMap.mapTooltip.destroy();
    // toolsMap.mapTooltip.create("右键删除重新绘制!");
    positions.pop();
    positions.pop();
    layer.entities.remove(floatingPoint);
    layer.entities.add({
      name: 2,
      position: positions[positions.length - 1]
    });
    let coordinates = [];
    positions.forEach(item => {
      setCoordinates(coordinates, item);
    })
    // 添加第一个点  形成闭环
    setCoordinates(coordinates, positions[0]);
    toolsMap.viewer._element.style.cursor = "default";
    toolsMap._coordinate = {"type": "Polygon", "coordinates": [coordinates]};
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

// 选取面时push
function setCoordinates(coordinates, cartesian) {
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  let longitude = Cesium.Math.toDegrees(cartographic.longitude);
  let latitude = Cesium.Math.toDegrees(cartographic.latitude);
  coordinates.push([longitude, latitude]);
}

//增加高度
function increaseHeight(cartesian, value) {
  let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  let longitude = Cesium.Math.toDegrees(cartographic.longitude);
  let latitude = Cesium.Math.toDegrees(cartographic.latitude);
  let height = cartographic.height > 0 ? cartographic.height + value : 0 + value;
  let cartesian1 = new Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
  );
  return cartesian1;
}

// 清除地图上的标记
function cleanMap() {
  toolsMap.removeHighlightPolygonLayer();
  toolsMap.viewer.entities.removeAll();
  layer.entities.removeAll();
}

function getPositionInfo() {
  return toolsMap._coordinate;
}

defineExpose({
  initToolsMap,
  getPositionInfo,
});
</script>

<style lang="scss" scoped>
.cesiumViewer {
  margin: 10px 0;

  ::v-deep(.cesium-widget-credits),
  ::v-deep(.cesium-infoBox) {
    display: none !important;
  }

  height: 500px;
}
.logo {
  position: absolute;
  z-index: 2;
  bottom: 55px;
  left: 0;
  width: 160px;
  pointer-events: none;
}
</style>
