<template>
  <panel-container ref="panelContainer" title="空间统计" :visible="visible" v-show="visible" @close="close"
    @miniaturized="miniaturized">
    <template v-slot:panel-content>
      <div class="container">
        <div class="control-panel">
          <el-radio-group v-model="analyzeType" @change="radioChange">
            <el-radio :label="1">矩形</el-radio>
            <el-radio :label="2">圆形</el-radio>
            <el-radio :label="3">多边形</el-radio>
          </el-radio-group>
          <div class="btns">
            <el-button type="primary" @click="beginAnalyze">开始分析</el-button>
            <el-button type="danger" @click="removeAnalyze" style="float: right">清除分析</el-button>
          </div>
        </div>
        <div class="contentData" v-if="showData">
          <table cellspacing="0" border="1" class="tableData">
            <tr>
              <td>企业数量</td>
              <td>{{ numData.industryCount }}</td>
            </tr>
            <tr>
              <td>征迁房屋</td>
              <td>{{ numData.houseCount }}</td>
            </tr>
            <tr>
              <td>征迁人数</td>
              <td>{{ numData.personsCount }}</td>
            </tr>
            <!--<tr>
              <td>人口数量</td>
              <td>{{ numData.peopleNum }}</td>
            </tr>
            <tr>
              <td>房屋数量</td>
              <td>{{ numData.houseNum }}幢</td>
            </tr>
            <tr>
              <td>老人人数</td>
              <td>{{ numData.olderNum }}</td>
            </tr>
            <tr>
              <td>低保人数</td>
              <td>{{ numData.DibaoNum }}</td>
            </tr>
            <tr>
              <td>残障人数</td>
              <td>{{ numData.handicappedNum }}</td>
            </tr>
            <tr>
              <td>党员人数</td>
              <td>{{ numData.partyMemberNum }}</td>
            </tr>
            <tr>
              <td>乡贤人数</td>
              <td>{{ numData.xiangXianNum }}</td>
            </tr>-->
          </table>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import pickGloble from "../pickGloble";
import { ref, inject, reactive } from "vue";
import { selectCountByPolygon } from "@/api/basics/industry";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let analyzeType = ref(3); // 绘制的样式
let handler = reactive({}); // 事件句柄
let pointLayer = ref(null); // 点图层
let polygonLayer = ref(null); // 面图层
let polygon = ref(null); // 面
const numData = reactive({
  industryCount: 0,
  houseCount: 0,
  personsCount: 0,
  peopleNum: 320,
  houseNum: 8,
  olderNum: 30,
  DibaoNum: 9,
  handicappedNum: 23,
  partyMemberNum: 10,
  xiangXianNum: 10,
});
let showData = ref(false);

function open() {
  visible.value = !visible.value;
  if (!visible.value) {
    removeAnalyze();
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

// 开始分析
function beginAnalyze() {
  gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
  pointLayer.value = new Cesium.CustomDataSource("statisticsPointLayer");
  polygonLayer.value = new Cesium.CustomDataSource("statisticsPolygonLayer");
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
            dynamicPositions = {
              position: tempPoints[0],
              ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                  //半径 两点间距离
                  var r = Math.sqrt(
                    Math.pow(
                      tempPoints[0].x - tempPoints[tempPoints.length - 1].x,
                      2
                    ) +
                    Math.pow(
                      tempPoints[0].y - tempPoints[tempPoints.length - 1].y,
                      2
                    )
                  );
                  return r ? r : r + 1;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(function () {
                  var r = Math.sqrt(
                    Math.pow(
                      tempPoints[0].x - tempPoints[tempPoints.length - 1].x,
                      2
                    ) +
                    Math.pow(
                      tempPoints[0].y - tempPoints[tempPoints.length - 1].y,
                      2
                    )
                  );
                  return r ? r : r + 1;
                }, false),
                material: Cesium.Color.BLUE.withAlpha(0.5),
                outline: true,
              },
            };
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

    let ellipsoid=gisViewer.value.viewer.scene.globe.ellipsoid;
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
          if (analyzeType.value == 1) {
            let cartographic = ellipsoid.cartesianToCartographic(tempPoints[0]);
            let firstLat = Cesium.Math.toDegrees(cartographic.latitude);
            let firstLng = Cesium.Math.toDegrees(cartographic.longitude);
            let cartographic2 = ellipsoid.cartesianToCartographic(tempPoints[1]);
            let firstLat2 = Cesium.Math.toDegrees(cartographic2.latitude);
            let firstLng2 = Cesium.Math.toDegrees(cartographic2.longitude);
            let LINESTRING = `${firstLng>firstLng2?firstLng:firstLng2},${firstLat>firstLat2?firstLat:firstLat2},${firstLng<firstLng2?firstLng:firstLng2},${firstLat<firstLat2?firstLat:firstLat2}`;
            selectCountByPolygon({ analyzeType: analyzeType.value, polygon: LINESTRING }).then(res => {
              showData.value = true;
              numData.industryCount = res.data.industryCount;
              numData.houseCount = res.data.houseCount;
              numData.personsCount = res.data.personsCount;
            })
          }
          if (analyzeType.value == 2) {
            let cartographic = ellipsoid.cartesianToCartographic(tempPoints[0]);
            let firstLat = Cesium.Math.toDegrees(cartographic.latitude);
            let firstLng = Cesium.Math.toDegrees(cartographic.longitude);
            let LINESTRING = 'point (' + `${firstLng} ${firstLat}` + ')';
            let semiMajorAxis = polygonLayer.value.entities.values[0].ellipse.semiMajorAxis.getValue() / 100000;
            selectCountByPolygon({ analyzeType: analyzeType.value, polygon: LINESTRING, semiMajorAxis: semiMajorAxis }).then(res => {
              showData.value = true;
              numData.industryCount = res.data.industryCount;
              numData.houseCount = res.data.houseCount;
              numData.personsCount = res.data.personsCount;
            })
          }
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
    tempPoints.pop();
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    gisViewer.value.mapTooltip.destroy();

    let ellipsoid=gisViewer.value.viewer.scene.globe.ellipsoid;
    let LINESTRING = 'polygon (('
    tempPoints.forEach((val,i)=>{
      let cartographic=ellipsoid.cartesianToCartographic(val);
      let lat=Cesium.Math.toDegrees(cartographic.latitude);
      let lng=Cesium.Math.toDegrees(cartographic.longitude);
      LINESTRING += `${lng} ${lat},`
      if(i === tempPoints.length - 1){
        let cartographic=ellipsoid.cartesianToCartographic(tempPoints[0]);
        let firstLat=Cesium.Math.toDegrees(cartographic.latitude);
        let firstLng=Cesium.Math.toDegrees(cartographic.longitude);
        LINESTRING += `${firstLng} ${firstLat},`
        LINESTRING = LINESTRING.substring(0,LINESTRING.length - 1) + '))'
      }
    })
    selectCountByPolygon({ analyzeType: analyzeType.value, polygon: LINESTRING }).then(res => {
      showData.value = true;
      numData.industryCount = res.data.industryCount;
      numData.houseCount = res.data.houseCount;
      numData.personsCount = res.data.personsCount;
    })
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  gisViewer.value.viewer.dataSources.add(pointLayer.value);
}

// 清除分析
function removeAnalyze() {
  showData.value = false;
  gisViewer.value.viewer.dataSources.remove(pointLayer.value);
  gisViewer.value.viewer.dataSources.remove(polygonLayer.value);
  pointLayer.value = null;
  polygonLayer.value = null;
  polygon.value = null;
  if (JSON.stringify(handler) != "{}") {
    handler.destroy(); //关闭事件句柄
    handler = {};
  }
  gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
  gisViewer.value.mapTooltip.destroy();
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
  let data;
  switch (analyzeType.value) {
    case 1:
      data = {
        rectangle: {
          coordinates: positions,
          material: Cesium.Color.RED.withAlpha(0.5),
        },
      };
      break;
    case 2:
      data = positions;
      break;
    case 3:
      console.log(positions.getValue());
      data = {
        polygon: {
          hierarchy: positions,
          perPositionHeight: false, //允许三角形使用点的高度
          material: Cesium.Color.CHARTREUSE.withAlpha(0.5),
          clampToGround: true,
        },
      };
      break;
  }
  polygonLayer.value.entities.add(data);
  return viewer.dataSources.add(polygonLayer.value);
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

.contentData {
  width: 23vw;
}

.tableData {
  line-height: 5vh;
  margin-top: 2vh;
  border: 1px solid skyblue;
  width: 23vw;
  text-align: center;
  color: white;
  font-size: 17px;
}

.tableData td {
  padding: 0.1vh;
  width: 1vw;
}
</style>
