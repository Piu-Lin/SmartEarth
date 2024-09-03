<template>
  <panel-container ref="panelContainer" title="测量工具" :visible="visible" v-if="visible" @close="close"
                   @miniaturized="miniaturized">
    <template v-slot:panel-content>
      <el-tabs v-model="selectedTab" @tab-click="tabsClick"
               :class="['xt-measure-panel', selectedTab === '3' || selectedTab === '5' ? 'xt-measure-panel-height-250' : 'xt-measure-panel-height-200']">
        <el-tab-pane label="距离" name="1">
          <div class="xt-measure-item">
            <span>长度</span>
            <el-input class="xt-input-width-115" size="small" v-model="distanceTop"/>
            <el-select class="xt-select-width-70" size="small" v-model="distanceLabelSelected"
                       @change="distanceHandleChange">
              <el-option value="m" label="米"></el-option>
              <el-option value="km" label="千米"></el-option>
            </el-select>
          </div>
        </el-tab-pane>
        <el-tab-pane label="面积" name="2">
          <div class="xt-measure-item">
            <span>面积</span>
            <el-input class="xt-input-width-93" size="small" v-model="areaTop"/>
            <el-select class="xt-select-width-110" size="small" v-model="areaLabelSelected" @change="areaHandleChange">
              <el-option value="m2" label="平方米"></el-option>
              <el-option value="km2" label="平方公里"></el-option>
            </el-select>
          </div>
        </el-tab-pane>
        <el-tab-pane label="高度" name="3">
          <div class="xt-measure-item-x">
            <span>高度</span>
            <el-input class="xt-input-width-160" size="small" v-model="heightTop"/>
            <span style="margin-left: 10px">米</span>
          </div>
          <div class="xt-measure-item-x">
            <span>平距</span>
            <el-input class="xt-input-width-160" size="small" v-model="horizontalDistanceTop"/>
            <span style="margin-left: 10px">米</span>
          </div>
          <div class="xt-measure-item-x">
            <span>斜距</span>
            <el-input class="xt-input-width-160" size="small" v-model="slantDistanceTop"/>
            <span style="margin-left: 10px">米</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="角度" name="5">
          <div class="xt-measure-item-x">
            <span>内角</span>
            <el-input class="xt-input-width-160" size="small" :value="angleMin"/>
            <span style="margin-left: 10px">度</span>
          </div>
          <div class="xt-measure-item-x">
            <span>外角</span>
            <el-input class="xt-input-width-160" size="small" :value="angleMax"/>
            <span style="margin-left: 10px">度</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="体积" name="6">
          <div class="xt-measure-item">
            <span>体积</span>
            <el-input class="xt-input-width-93" size="small" v-model="volume"/>
            <el-select class="xt-select-width-110" size="small" v-model="volumeLabelSelected">
              <el-option value="m3" label="立方米"></el-option>
              <el-option value="km3" label="立方公里"></el-option>
            </el-select>
          </div>
        </el-tab-pane>
        <div class="xt-measure-panel-footer">
          <el-button size="small" icon="caret-right" @click="startMeasure">开始</el-button>
          <el-button size="small" icon="close" @click="cleanUp">清空</el-button>
        </div>
      </el-tabs>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import MeasureType from "@/Gis/enum/MeasureType";
import PolylinePrimitive from "@/Gis/feature/PolylinePrimitive";
import PolygonPrimitive from "@/Gis/feature/PolygonPrimitive";
import TriangleLinePrimitive from "@/Gis/feature/TriangleLinePrimitive";
import pickGloble from "@/Gis/tools/pickGloble";
import CursorStyle from "@/Gis/enum/CursorStyle";
import {ref, onMounted, watch, nextTick, inject} from "vue";

const gisViewer = inject("bigScreenMap");
const EntityLayerName = "measuretemp";
const EarthRadiusMeters = 6371000.0;
const RadiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
const DegreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
const MeasureUnit = {
  METER: "米",
  KILOMETER: "千米",
  SQUAREMETER: "平方米",
  SQUAREKILOMETRE: "平方公里",
  CUBEMETER: "立方米",
  CUBEKILOMETRE: "立方公里",
};

const visible = ref(false);
const selectedTab = ref("1");
const distanceLabelSelected = ref("m");
const areaLabelSelected = ref("m2");
const isMeasure = ref(false);
const handlerName = ref({
  Distance_Handler: "distanceHandler",
  Area_Handler: "areaHandler",
  Height_Handler: "heightHandler",
  Angle_Handler: "angleHandler",
  Volume_Handler: "volumeHandler"
});
const distanceTop = ref(0);
const areaTop = ref(0);
const heightTop = ref(0);
const horizontalDistanceTop = ref(0);
const slantDistanceTop = ref(0);
const angleMin = ref(0);
const angleMax = ref(0);
const volume = ref(0);
const volumeLabelSelected = ref("m3");
let volumePolygon = ref(null);  // 体积底面
let volumeId = ref(null);
// let volumeTmp = ref("m3");  // 暂存当前选择的体积单位

onMounted(() => {
  nextTick(() => {
    initialize();
  })
});

function open() {
  visible.value = true;
}

function close() {
  cleanUp();
  visible.value = false;
  // $emit("update:show",visible.value);
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

function initialize() {
  createTempEntity();
}

function tabsClick(tab, event) {
  tabsChange(tab.paneName);
}

function tabsChange(value) {
  selectedTab.value = value;
  endMeasure();
  cleanData();
}

function startMeasure() {
  let type = selectedTab.value;
  if (typeof selectedTab.value === "string") {
    type = parseInt(selectedTab.value);
  }
  destroyHandler();
  if (isMeasure.value) {
    return;
  }
  isMeasure.value = true;
  switch (type) {
    case MeasureType.XT_MEASURE_DISTANCE:
      measureDistance();
      break;
    case MeasureType.XT_MEASURE_AREA:
      measureArea();
      break;
    case MeasureType.XT_MEASURE_HEIGHT:
      measureHeight();
      break;
    case MeasureType.XT_ACTION_COORDINATE:
      measureCoordinate();
      break;
    case MeasureType.XT_MEASURE_ANGLE:
      measureAngle();
      break;
    case MeasureType.XT_MEASURE_VOLUME:
      measureVolume();
      break;
    default:
      break;
  }
}

function endMeasure() {
  isMeasure.value = false;
  gisViewer.value.mapTooltip.destroy();
}

function distanceHandleChange(value) {
  changeDistanceUnit(value);
}

function areaHandleChange(value) {
  changeAreaUnit(value);
}

//开启距离测量
function measureDistance() {
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal(
      handlerName.value.Distance_Handler,
      handler
  );
  let positions = [];
  let poly = null;
  let distance = 0;
  let floatingPoint;
  let drawStep = 0;
  gisViewer.value.mapTooltip.create("单击开始绘制!");

  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(
        gisViewer.value.viewer,
        movement.endPosition
    );
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm

    if (positions.length >= 2 && newCartesian) {
      if (!Cesium.defined(poly)) {
        poly = new PolylinePrimitive(
            gisViewer.value.viewer,
            positions,
            layer,
            MeasureType.XT_MEASURE_DISTANCE
        );
      } else {
        positions.pop();
        positions.push(newCartesian);
      }
      distance = calculateSpaceDistance(positions);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(
        gisViewer.value.viewer,
        movement.position
    );
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm

    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    //在三维场景中添加Label
    distanceTop.value = distance;
    let textDisance = distance + MeasureUnit.METER;
    floatingPoint = layer.entities.add({
      // parent: layer,
      name: MeasureType.XT_MEASURE_DISTANCE,
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE
      },
      label: {
        text: textDisance,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: 1e9
      },
      distance: distanceTop.value
    });

    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("单击增加点,双击完成绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function (movement) {
    handler.destroy(); //关闭事件句柄
    positions.pop(); //最后一个点无效
    layer.entities.remove(floatingPoint);
    endMeasure();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

//测量面积
function measureArea() {
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal(handlerName.value.Area_Handler, handler);
  let positions = [];
  let tempPoints = [];
  let polygon = null;
  // let cartesian = null;
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
      if (!Cesium.defined(polygon)) {
        polygon = new PolygonPrimitive(
            gisViewer.value.viewer,
            positions,
            layer,
            MeasureType.XT_MEASURE_AREA
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
      name: MeasureType.XT_MEASURE_AREA,
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
    let area = calculateSpaceArea(tempPoints, positions);
    let textArea = area + "平方米";
    areaTop.value = area;
    layer.entities.add({
      // parent: layer,
      name: MeasureType.XT_MEASURE_AREA,
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
        disableDepthTestDistance: 1e9
      },
      area: areaTop.value
    });
    endMeasure();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

//测量高度
function measureHeight() {
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal(handlerName.value.Height_Handler, handler);

  let positionsTriangle = [];
  let tempPoints; //保存直角点
  let poly = null;
  let cartesian = null;
  let floatingPoint; //浮动点
  let drawStep = 0;
  gisViewer.value.mapTooltip.create("单击增加点!");

  handler.setInputAction(function (movement) {
    cartesian = pickGloble(gisViewer.value.viewer, movement.endPosition);
    if (positionsTriangle.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new TriangleLinePrimitive(
            gisViewer.value.viewer,
            positionsTriangle,
            layer,
            MeasureType.XT_MEASURE_HEIGHT,
            calculateSpaceDistance,
            {unit: MeasureUnit.METER}
        );
      } else {
        positionsTriangle.pop();
        positionsTriangle.push(cartesian.clone());
        tempPoints = createTempPoint(positionsTriangle);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function (movement) {
    if (positionsTriangle.length === 0) {
      cartesian = pickGloble(gisViewer.value.viewer, movement.position);

      positionsTriangle.push(cartesian.clone());
      positionsTriangle.push(cartesian.clone());

      floatingPoint = layer.entities.add({
        // parent: layer,
        name: MeasureType.XT_MEASURE_HEIGHT,
        position: positionsTriangle[0],
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE
        }
      });
    }
    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("双击完成绘制!");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function (movement) {
    handler.destroy();

    //在三维场景中添加线
    let tempPositions1 = [];
    let tempPositions2 = [];
    tempPositions1.push(positionsTriangle[0].clone());
    tempPositions1.push(tempPoints.clone());
    let height = calculateHeight(tempPositions1);
    let textDistance = height + MeasureUnit.METER;
    console.log("高度" + height + "::" + textDistance)
    heightTop.value = height;

    layer.entities.add({
      // parent: layer,
      name: MeasureType.XT_MEASURE_HEIGHT,
      position: tempPositions1[0].clone(),
      polyline: {
        show: true,
        positions: tempPositions1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED
        }),
        width: 2
      },
      label: {
        text: textDistance,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20)
      }
    });

    tempPositions2.push(tempPoints.clone());
    tempPositions2.push(positionsTriangle[1].clone());
    let horizontalDistance = calculateSpaceDistance(tempPositions2); //计算平距
    textDistance = horizontalDistance + MeasureUnit.METER;
    console.log("计算平距" + horizontalDistanceTop.value)
    horizontalDistanceTop.value = horizontalDistance;

    //let slantDistance = calculateSpaceDistance(tempPositions1); //计算斜距
    let slantDistance = Math.sqrt(
        Math.pow(horizontalDistanceTop.value, 2) + Math.pow(heightTop.value, 2)
    );
    console.log("计算斜距" + slantDistance)
    // let slantDistance = calculateSpaceDistance(tempPositions1); //计算斜距
    slantDistanceTop.value = slantDistance.toFixed(2);

    layer.entities.add({
      // parent: layer,
      name: MeasureType.XT_MEASURE_HEIGHT,
      position: tempPositions2[0].clone(),
      polyline: {
        show: true,
        positions: tempPositions2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED
        }),
        width: 2
      },
      label: {
        text: textDistance,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(60, -20)
      }
    });
    let drawStep = 0;
    gisViewer.value.mapTooltip.destroy();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

//测量坐标
function measureCoordinate() {
}

// 测量角度
function measureAngle() {
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal(
      handlerName.value.Angle_Handler,
      handler
  );
  let positions = [];
  let poly = null;
  let floatingPoint;
  let drawStep = 0;
  gisViewer.value.mapTooltip.create("单击开始绘制!");
  handler.setInputAction(function (movement) {
    let cartesian = pickGloble(
        gisViewer.value.viewer,
        movement.endPosition
    );
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm
    if (positions.length >= 2 && newCartesian) {
      if (!Cesium.defined(poly)) {
        poly = new PolylinePrimitive(
            gisViewer.value.viewer,
            positions,
            layer,
            MeasureType.XT_MEASURE_ANGLE
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
    let newCartesian = increaseHeight(cartesian, 0.1); //调整高度离地20cm
    if (positions.length === 0) {
      positions.push(newCartesian.clone());
    }
    positions.push(newCartesian);
    //在三维场景中添加Label
    floatingPoint = layer.entities.add({
      name: MeasureType.XT_MEASURE_ANGLE,
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE
      },
    });

    drawStep++;
    if (drawStep === 1) {
      gisViewer.value.mapTooltip.create("单击增加点");
    }
    if (drawStep === 3) {
      positions.pop();
      let a = calculateAngle(getDegrees(positions[0]), getDegrees(positions[1]), getDegrees(positions[2])) / RadiansPerDegree;
      if (a > 180) {
        angleMax.value = a.toFixed(2);
        angleMin.value = (360 - a).toFixed(2);
      } else {
        angleMax.value = (360 - a).toFixed(2);
        angleMin.value = a.toFixed(2);
      }
      handler.destroy(); //关闭事件句柄
      endMeasure();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// 测量体积
function measureVolume() {
  volumeId.value = new Date().getTime();
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  let handler = new Cesium.ScreenSpaceEventHandler(
      gisViewer.value.viewer.scene.canvas
  );
  gisViewer.value.addTempGlobal(handlerName.value.Volume_Handler, handler);
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
            MeasureType.XT_MEASURE_VOLUME,
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
      name: MeasureType.XT_MEASURE_VOLUME,
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
    endMeasure();
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

//销毁句柄
function destroyHandler() {
  let handler1 = gisViewer.value.tempGlobal[handlerName.value.Distance_Handler];
  if (handler1) {
    if (!handler1.isDestroyed()) {
      handler1.destroy();
    }
  }
  let handler2 = gisViewer.value.tempGlobal[handlerName.value.Area_Handler];
  if (handler2) {
    if (!handler2.isDestroyed()) {
      handler2.destroy();
    }
  }
  let handler3 = gisViewer.value.tempGlobal[handlerName.value.Height_Handler];
  if (handler3) {
    if (!handler3.isDestroyed()) {
      handler3.destroy();
    }
  }
  let handler4 = gisViewer.value.tempGlobal[handlerName.value.Angle_Handler];
  if (handler4) {
    if (!handler4.isDestroyed()) {
      handler4.destroy();
    }
  }
  let handler5 = gisViewer.value.tempGlobal[handlerName.value.Volume_Handler];
  if (handler5) {
    if (!handler5.isDestroyed()) {
      handler5.destroy();
    }
  }
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

//创建临时实体作为图层实体
function createTempEntity() {
  if (
      gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length > 0
  ) {
    return;
  }
  const measureDataSource = new Cesium.CustomDataSource(EntityLayerName);
  gisViewer.value.viewer.dataSources.add(measureDataSource);
}

//清空所有测量数据
function cleanUp() {
  let measureDataSource = gisViewer.value.viewer.dataSources.getByName(
      EntityLayerName
  )[0];
  measureDataSource && measureDataSource.entities.removeAll();
  endMeasure();
  cleanData();
}

//清空数据
function cleanData() {
  distanceTop.value = 0;
  areaTop.value = 0;
  heightTop.value = 0;
  horizontalDistanceTop.value = 0;
  slantDistanceTop.value = 0;
  angleMin.value = '';
  angleMax.value = '';
  volume.value = 0;
}

//改变距离单位
function changeDistanceUnit(type) {
  let measureDataSource = gisViewer.value.viewer.dataSources.getByName(
      EntityLayerName
  )[0];

  measureDataSource.entities.values.forEach((e, i) => {
    if (e.name && e.label) {
      if (e.name === MeasureType.XT_MEASURE_DISTANCE) {
        if (type === "m") {
          let distance = e.distance;
          e.label.text = e.distance + MeasureUnit.METER;
          distanceTop.value = distance;
        } else if (type === "km") {
          let distance = Math.floor((e.distance / 1000) * 1e5) / 1e5;
          e.label.text = distance + MeasureUnit.KILOMETER;
          distanceTop.value = distance;
        }
      }
    }
  });
}

//改变面积单位
function changeAreaUnit(type) {
  let measureDataSource = gisViewer.value.viewer.dataSources.getByName(
      EntityLayerName
  )[0];
  measureDataSource.entities.values.forEach((e, i) => {
    if (e.name && e.label) {
      if (e.name === MeasureType.XT_MEASURE_AREA) {
        if (type === "m2") {
          let area = e.area;
          e.label.text = area + "平方米";
          areaTop.value = area;
        } else if (type === "km2") {
          let area = Math.floor((e.area / 1000000.0) * 1e5) / 1e5;
          e.label.text = area + "平方公里";
          areaTop.value = area;
        }
      }
    }
  });
}

//计算距离
function calculateSpaceDistance(positions) {
  let distance = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    let point1cartographic = Cesium.Cartographic.fromCartesian(
        positions[i]
    );
    let point2cartographic = Cesium.Cartographic.fromCartesian(
        positions[i + 1]
    );
    /**根据经纬度计算出距离**/
    let geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(
        Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
    );
    distance = distance + s;
  }
  return distance.toFixed(2);
}

//计算多边形面积
function calculateSpaceArea(points, positions) {
  let res = 0;
  //拆分三角曲面
  for (let i = 0; i < points.length - 2; i++) {
    let j = (i + 1) % points.length;
    let k = (i + 2) % points.length;
    let totalAngle = calculateAngle(points[0], points[j], points[k]);

    let dis_temp1 = calculateDistance(positions[j], positions[0]);
    let dis_temp2 = calculateDistance(positions[k], positions[0]);
    res += (dis_temp1 * dis_temp2 * Math.sin(totalAngle)) / 2;
  }
  return Math.abs(Number(res.toFixed(4)));
}

//计算角度
function calculateAngle(p1, p2, p3) {
  let bearing21 = calculateBearing(p2, p1);
  let bearing23 = calculateBearing(p2, p3);
  let angle = bearing21 - bearing23;
  // if (angle < 0) {
  //   angle = Math.abs(angle);
  // } else if (angle > 180) {
  //   angle = angle - 180;
  // }
  return Math.abs(angle) * RadiansPerDegree;
  // return angle.toFixed(2);
}

//方向
function calculateBearing(from, to) {
  let lat1 = from.lat * RadiansPerDegree;
  let lon1 = from.lon * RadiansPerDegree;
  let lat2 = to.lat * RadiansPerDegree;
  let lon2 = to.lon * RadiansPerDegree;
  let angle = -Math.atan2(
      Math.sin(lon1 - lon2) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  );
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  angle = angle * DegreesPerRadian; //角度
  return angle;
}

//世界坐标转为经纬度
function getDegrees(cart) {
  let ellipsoid = gisViewer.value.viewer.scene.globe.ellipsoid;
  let cartograhphic = ellipsoid.cartesianToCartographic(cart);
  let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
  let lon = Cesium.Math.toDegrees(cartograhphic.longitude);
  let alt = cartograhphic.height;
  return {lon: lon, lat: lat, alt: alt};
}

//两点之间距离
function calculateDistance(point1, point2) {
  let point1cartographic = Cesium.Cartographic.fromCartesian(point1);
  let point2cartographic = Cesium.Cartographic.fromCartesian(point2);
  /**根据经纬度计算出距离**/
  let geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1cartographic, point2cartographic);
  let s = geodesic.surfaceDistance;
  //返回两点之间的距离
  s = Math.sqrt(
      Math.pow(s, 2) +
      Math.pow(point2cartographic.height - point1cartographic.height, 2)
  );
  return s;
}

//计算高度
function calculateHeight(points) {
  let cartographic1 = Cesium.Cartographic.fromCartesian(points[0]);
  let cartographic2 = Cesium.Cartographic.fromCartesian(points[1]);
  let height = cartographic2.height - cartographic1.height;
  return height.toFixed(2);
}

//计算两点的中心点
function getCenter(point1, point2) {
  let x = (point1.x + point2.x) / 2.0;
  let y = (point1.y + point2.y) / 2.0;
  let z = (point1.z + point2.z) / 2.0;
  return new Cesium.Cartesian3(x, y, z);
}

//构造不同高度的等经纬度点
function createTempPoint(positionsTriangle) {
  let cartographic1 = Cesium.Cartographic.fromCartesian(
      positionsTriangle[0]
  );
  let cartographic2 = Cesium.Cartographic.fromCartesian(
      positionsTriangle[1]
  );
  let longitude = Cesium.Math.toDegrees(cartographic1.longitude);
  let latitude = Cesium.Math.toDegrees(cartographic1.latitude);
  let height = cartographic2.height;
  let cartesian = new Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
  );
  return cartesian;
}

// 编辑体
function editVolume(tempPoints, positions, layer, volumeId) {
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
    polygonHeight = layer.entities.getById(volumeId).polygon.extrudedHeight;
    let modelPointHeightSum = 0;
    positions.forEach((element) => {
      let cartographic = Cesium.Cartographic.fromCartesian(element);
      let pointHeight = cartographic.height > 0 ? cartographic.height : 0;
      modelPointHeightSum += pointHeight;
    })
    let modelPointHeightAvg = modelPointHeightSum / positions.length;
    polygonHeight -= modelPointHeightAvg;
    console.log(calculateSpaceArea(tempPoints, positions), "底面积");
    console.log(polygonHeight, "高度");
    handler.destroy();
    gisViewer.value.mapTooltip.destroy();
    edit = false;
    gisViewer.value.viewer.scene.screenSpaceCameraController.enableRotate = true;
    if (polygonHeight < 0) {
      polygonHeight = 0;
    }
    // 计算体积
    let polygonVolume, textVolume;
    if (volumeLabelSelected.value === "m3") {
      polygonVolume = calculateSpaceArea(tempPoints, positions) * polygonHeight;
      textVolume = polygonVolume.toFixed(2) + "立方米";
      volume.value = polygonVolume.toFixed(2);
    } else if (volumeLabelSelected.value === "km3") {
      polygonVolume = calculateSpaceArea(tempPoints, positions) * polygonHeight;
      let a = polygonVolume / 1000000000;
      volume.value = a.toFixed(7);
      textVolume = a.toFixed(7) + "立方公里";
    }
    layer.entities.add({
      id: volumeId + 'label',
      name: MeasureType.XT_MEASURE_VOLUME,
      position: positions[positions.length - 1],
      label: {
        text: textVolume,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
        disableDepthTestDistance: 1e9
      },
      volume: volume.value
    });
    endMeasure();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

watch(volumeLabelSelected, (newval, oldval) => {
  console.log(newval, oldval);
  let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
  console.log(layer.entities.getById(volumeId.value + 'label'), newval === "km3" && oldval === "m3");
  if (layer.entities.getById(volumeId.value + 'label')) {
    if (newval === "km3" && oldval === "m3") {
      let a = volume.value / 1000000000;
      volume.value = a.toFixed(7);
      layer.entities.getById(volumeId.value + 'label').label.text = volume.value + "立方公里";
    } else if (newval === "m3" && oldval === "km3") {
      let a = volume.value * 1000000000;
      volume.value = a.toFixed(2)
      layer.entities.getById(volumeId.value + 'label').label.text = volume.value + "立方米";
    }
  }
})
watch(isMeasure, (value) => {
  if (value) {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  } else {
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  }
})
</script>

<style>
.xt-measure-panel {
  height: 180px;
  width: 280px;
  left: calc(50% - 472px);
  top: 200px;
}

.xt-measure-panel-height-200 {
  height: 140px;
}

.xt-measure-panel-height-250 {
  height: 200px;
}

.xt-measure-body .el-tab-pane::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #e4e7ed;
  z-index: 1;
}

.xt-measure-panel-footer {
  float: right;
  padding: 5px 0;
  left: 10px;
  padding-right: 29px;
}

.xt-measure-item {
  padding: 5px 10px;
}

.xt-measure-item-x {
  padding: 5px 20px;
}

.xt-measure-item > span,
.xt-measure-item-x > span {
  margin-right: 10px;
}

.xt-measure-item > .el-input {
  margin-right: 10px;
}

.xt-measure-item-x > input {
  margin-right: 10px;
  width: 135px;
}

.xt-input-width-160 {
  width: 160px;
}

.xt-input-width-115 {
  width: 115px;
}

.xt-input-width-93 {
  width: 93px;
}

.xt-select-width-70 {
  width: 73px;
}

.xt-select-width-110 {
  width: 95px;
}

.xt-measure-panel .el-tabs__nav div:not(:first-child) {
  padding: 0 30px;
}

.xt-measure-panel .el-tabs__nav div:nth-child(2) {
  padding-left: 32px !important;
}

.xt-measure-panel .el-tabs__nav div:nth-child(4) {
  padding-right: 32px !important;
}

.xt-measure-panel .el-tabs__content {
  padding-bottom: 5px;
}

.xt-measure-panel .el-tabs__item {
  color: #fff;
}

.xt-measure-panel .el-input__inner {
  border: 1px solid #5b95cc;
  background-color: #407cb455 !important;
  color: #fff;
}

.xt-measure-panel .el-button {
  background: #407cb455;
  color: #fff;
  border: 1px solid #5b95cc;
}
</style>
