<template>
    <panel-container ref="panelContainer" title="填挖方分析" :visible="visible" v-if="visible" @close="close"
        @miniaturized="miniaturized">
        <template v-slot:panel-content>
            <div class="container">
                <div class="control-panel">
                    <!-- <span>最大高程(米)：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <el-input class="cutFillInput" v-model="maxHeight">
                    </el-input>
                    <br />
                    <span>最小高程(米)：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <el-input class="cutFillInput" v-model="minHeight">
                    </el-input>
                    <br /> -->
                    <span>开挖高程：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <el-input class="cutFillInput" v-model="cutHeight">
                    </el-input>
                    <br />
                    <!-- <span>开挖面积(平方米)：</span>
                    <el-input class="cutFillInput" v-model="cutArea">
                    </el-input>
                    <br /> -->
                    <span>开挖体积(立方米)：</span>
                    <el-input class="cutFillInput" v-model="cutVolume">
                    </el-input>
                    <br />
                    <!-- <span>填方面积(平方米)：</span>
                    <el-input class="cutFillInput" v-model="fillArea">
                    </el-input>
                    <br /> -->
                    <span>填方体积(立方米)：</span>
                    <el-input class="cutFillInput" v-model="fillVolume">
                    </el-input>
                    <br />
                    <!-- <span>横切面积(平方米)：</span>
                    <el-input class="cutFillInput" v-model="baseArea">
                    </el-input>
                    <br /> -->
                    <div v-if='showAnalyze' id="myProgress">
                        <div id="myBar">0</div>
                    </div>
                    <div class="btns">
                        <el-button type="primary" @click="begin">开始</el-button>
                        <el-button type="danger" @click="remove">清除</el-button>
                    </div>
                </div>
            </div>
        </template>
    </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import pickGloble from "../pickGloble";
import { ref, inject, watch } from "vue";
import computeCutAndFillVolumeVoronoi from "./cutFill.ts";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let cutHeight = ref(30);  // 开挖高程
let cutArea = ref(0);   // 开挖面积
let cutVolume = ref(0); // 开挖体积
let fillArea = ref(0); // 填方面积
let fillVolume = ref(0); // 填方体积
let baseArea = ref(0); // 横切面积
let maxHeight = ref(0); // 最大高程
let minHeight = ref(0); // 最小高程
let handler = reactive({}); // 事件句柄
let polygonLayer = ref(null); // 面图层
let polygon = ref(null); // 面
let showAnalyze = ref(false);   // 显示正在分析中

function open() {
    visible.value = !visible.value;
    if (!visible.value) {
        remove();
    }
}

function close() {
    remove();
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

// 开始
const begin = () => {
    remove();
    gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
    polygonLayer.value = new Cesium.CustomDataSource("cutFillPolygonLayer");
    handler = new Cesium.ScreenSpaceEventHandler(
        gisViewer.value.viewer.scene.canvas
    );
    let tempPoints = [];
    let points = [];
    let drawStep = 0; //绘制步骤
    let dynamicPositions;
    gisViewer.value.mapTooltip.create("单击开始绘制!");
    handler.setInputAction(function (movement) {
        let cartesian = pickGloble(gisViewer.value.viewer, movement.endPosition);
        if (tempPoints.length >= 2) {
            tempPoints.pop();
            tempPoints.push(cartesian);
            if (!Cesium.defined(polygon.value)) {
                dynamicPositions = new Cesium.CallbackProperty(function () {
                    return new Cesium.PolygonHierarchy(tempPoints);
                });
                polygon.value = drawPolygon(gisViewer.value.viewer, dynamicPositions);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (movement) {
        let cartesian = pickGloble(gisViewer.value.viewer, movement.position);
        polygonLayer.value.entities.add({
            position: cartesian,
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.NONE
            },
        });
        let pointHeight = Cesium.Cartographic.fromCartesian(cartesian).height;
        let data = {
            point: cartesian,
            height: pointHeight
        };
        points.push(data);
        if (tempPoints.length === 0) {
            tempPoints.push(cartesian.clone());
        }
        tempPoints.push(cartesian);
        //在三维场景中添加点
        drawStep++;
        if (drawStep === 1) {
            gisViewer.value.mapTooltip.create("单击增加点!");
        } else {
            gisViewer.value.mapTooltip.create("单击增加点,双击完成绘制!");
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function (movement) {
        showAnalyze.value = true;
        handler.destroy();
        points.pop();
        tempPoints.pop();
        tempPoints.pop();
        tempPoints.push(points[0].point);
        gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
        gisViewer.value.mapTooltip.destroy();
        beginAnalyze(points).then((res) => {
            cutVolume.value = res.cutVolume.toFixed(2);
            fillVolume.value = res.fillVolume.toFixed(2);
            baseArea.value = res.baseArea;
            maxHeight.value = res.maxHeight;
            minHeight.value = res.minHeight;
            console.log("最终结果", res);
        });
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
};

// 开始分析
async function beginAnalyze(points) {
    let result = computeCutAndFillVolumeVoronoi(points, cutHeight.value, gisViewer.value.viewer);
    await result;
    showAnalyze.value = false;
    return result;
}

// 清除
const remove = () => {
    cutVolume.value = 0;
    fillVolume.value = 0;
    gisViewer.value.viewer.dataSources.remove(polygonLayer.value);
    polygonLayer.value = null;
    polygon.value = null;
    if (JSON.stringify(handler) != "{}") {
        handler.destroy(); //关闭事件句柄
        handler = {};
    }
    gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    gisViewer.value.mapTooltip.destroy();
};

// 填坑
function fillPolygon() {
    polygonLayer.value.entities.getById("cutFillPolygon").polygon.extrudedHeight = cutHeight.value;
}

// 挖坑
function cutPolygon() {
    var position = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(120.37466976445806, 30.83264746001064, 10));
    var distance = 700
    var clippingPlanes = new Cesium.ClippingPlaneCollection({
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
        planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), distance),
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), distance)
        ],
        unionClippingRegions: true
    });
    gisViewer.value.viewer.scene.globe.clippingPlanes = clippingPlanes;
}

// 添加面
function drawPolygon(viewer, positions) {
    let data = {
        id: "cutFillPolygon",
        polygon: {
            hierarchy: positions,
            material: Cesium.Color.fromBytes(159, 159, 66, 200),
        },
    };
    polygonLayer.value.entities.add(data);
    return viewer.dataSources.add(polygonLayer.value);
}

// 添加点
function addPoint(pointPosition) {
    let cartographic1 = Cesium.Cartographic.fromCartesian(pointPosition);
    let data = {
        position: pointPosition,
        point: {
            color: Cesium.Color.GREEN, //颜色
            pixelSize: 10, //点大小
        },
    };
    pointLayer.value.entities.add(data);
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

.cutFillInput {
    width: 10vw;
    margin-left: 1vw;
    margin-bottom: 1vh;
}

.btns {
    float: right;
    margin-bottom: 1vh;
    margin-top: 1vh;
}

#myProgress {
    width: 100%;
    border-radius: 20px;
    background-color: #ddd;
}

#myBar {
    width: 0;
    height: 30px;
    border-radius: 20px;
    background-color: #4CAF50;
    text-align: center;
    line-height: 30px;
    color: white;
}
</style>
