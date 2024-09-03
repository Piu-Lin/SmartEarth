// //导入CesiumGeometry.js文件
// import {
//     cesiumGeometry
// } from '../../../../public/jsPlugin/CesiumGeometry';
import {ElMessage} from 'element-plus'

export function addLeida(viewer, bigScreenMap) {
    var modelUrl = '/static/model/satellite_comms.glb';
    // Define the model URL and the initial position
    var initialPosition = Cesium.Cartographic.fromDegrees(120.38680304612735, 30.859990057028273);

    // Load the terrain height at the specified location
    Cesium.sampleTerrainMostDetailed(bigScreenMap.viewer.terrainProvider, [initialPosition])
        .then(function (updatedPositions) {
            // Set the height to the terrain height
            var height = updatedPositions[0].height;
            var positionWithHeight = Cesium.Cartesian3.fromDegrees(120.38680304612735, 30.859990057028273, height);

            // Define the heading, pitch, and roll
            var heading = Cesium.Math.toRadians(135);
            var pitch = 0;
            var roll = 0;
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(positionWithHeight, hpr);

            // Add the model to the scene
            var model = viewer.entities.add({
                name: 'Model',
                position: positionWithHeight,
                orientation: orientation,
                model: {
                    uri: modelUrl,
                    minimumPixelSize: 128,
                    maximumScale: 1 // Prevent model from scaling too much
                }
            });
            // Calculate a position slightly above and behind the model
            var cameraDestination = Cesium.Cartesian3.fromDegrees(120.38680304612735, 30.859990057028273, height + 200); // Adjust height to move the camera up
            bigScreenMap.zoomTo({
                longitude: 120.38518296151653,
                latitude: 30.858408095513028,
                height: 129.17801595908796,
                heading: 0.7039855983670327,
                pitch: -0.45518513235195535,
                roll: 0.0000066017125543993416,
            });
        });
}
let sensorEntity; // 声明sensorEntity变量
// let radarRadius=100000
const state = reactive({
    halfWidth: 45, // 半径初始值
    scanPlaneRate:3,//扫描速度
});
export default state;
export function saomiao(viewer, bigScreenMap,colorArray) {
    // console.log(colorArray.value.length,'颜色')
    if(sensorEntity!==null){
        viewer.entities.remove(sensorEntity)
    }
    let r = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90),
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(0));

    let l = Cesium.Cartesian3.fromDegrees(120.38674978947417, 30.85994251825833, 25);
    sensorEntity = viewer.entities.add({
        position: l,
        orientation: Cesium.Transforms.headingPitchRollQuaternion(l, r),
        //雷达
        rectangularSensor: new Cesium.RectangularSensorGraphics({
            radius:  100000,//传感器半径
            xHalfAngle: Cesium.Math.toRadians(state.halfWidth),//传感器在水平方向上的半角宽度
            yHalfAngle: Cesium.Math.toRadians(state.halfWidth),//传感器在水平垂直方向上的半角宽度
            material: colorArray ? new Cesium.Color(
                colorArray[0] / 255,
                colorArray[1] / 255,
                colorArray[2] / 255,
                0.4
            ) :new Cesium.Color(1.0, 0.0, 1.0, 0.4) ,//颜色
            lineColor:colorArray ? new Cesium.Color(
                colorArray[0] / 255,
                colorArray[1] / 255,
                colorArray[2] / 255,
                1.0
            ) :  new Cesium.Color(1.0, 0.0, 1.0, 1.0),//边框颜色
            showScanPlane: true,//是否显示扫描平面
            scanPlaneColor:  colorArray ? new Cesium.Color(
                colorArray[0] / 255,
                colorArray[1] / 255,
                colorArray[2] / 255,
                1.0
            ) :  new Cesium.Color(1.0, 0.0, 1.0, 1.0),//扫描颜色
            // scanPlaneMode: "vertical",//扫描平面的模式（水平或垂直）
            scanPlaneRate: state.scanPlaneRate,//扫描速度
            showThroughEllipsoid: !1
        })
    })
    bigScreenMap.zoomTo({
        longitude: 116.22976754910898,
        latitude: 32.82664201251266,
        height: 302805.57626047835,
        heading: 2.0096988686048647,
        pitch: -0.5114225293494741,
        roll: 0.0003957079216139192,
    });
}
import { reactive } from 'vue';
export function addPlane(){
    state.halfWidth +=5
    if(state.halfWidth>=90){
        state.halfWidth=90
        ElMessage.error('覆盖面已达最大值')
    }
}
export function reducePlane(){
    state.halfWidth -=5
    if(state.halfWidth<=20){
        state.halfWidth=20
        ElMessage.error('覆盖面已达最小值')
    }
}
export function addPlaneRate(){
    state.scanPlaneRate--
    if (state.scanPlaneRate<=1){
        state.scanPlaneRate=1
        ElMessage.error('速度已达最快')
    }
}
export function reducePlaneRate(){
    state.scanPlaneRate++
    if (state.scanPlaneRate>=10){
        state.scanPlaneRate=10
        ElMessage.error('速度已达最慢')
    }
}
