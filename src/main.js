import { Cartesian3, Ion, Terrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { loadBall } from "./ball";
import { loadCzml } from "./czml";
import { createGridDrawer, drawCircleAroundSatellite, drawCone4 } from "./draw";
import { leftClickHandler } from "./eventHandler";
import { loadSatellite, loadSpaceShuttle, loadYacht } from "./models";
import { RadarPrimitive } from "./radar.ts";
import { VisualRadarPrimitive } from "./visual-radar.ts";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NmM4ODRiMC05NzUwLTRkMGUtOTkxMS05ZGFhNTAyMWEzM2QiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjU0MzI5OTV9._rqnZtZbsaCVfb4XY_U2GpR-gmHy_iMZ2ebf-VigRiE";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
  shouldAnimate: true,
  contextOptions: {
    // 确保WebGL支持纹理拉取
    webgl2: true,
  },
});

/** 模型位置 */
// const positions = {
//   satellite: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
//   ball: Cartesian3.fromDegrees(120.0988, 0, 4000),
//   circle: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
//   spaceShuttle: Cartesian3.fromDegrees(120.0988, 23.123, 5000),
//   yacht: Cartesian3.fromDegrees(120.0988, -40.023),
// };

/** 加载模型 */
// loadCzml(viewer);
// loadSatellite(viewer, positions["satellite"]); // 卫星
// loadBall(viewer, positions["ball"]); // 地面接收站球体
// loadSpaceShuttle(viewer, positions["spaceShuttle"]); // 航天飞机
// loadYacht(viewer, positions["yacht"]); // 游艇

// /** 绘制线条 */
// drawCircleAroundSatellite(viewer, positions["circle"]); // 卫星轨迹线
// drawCone4(viewer); // 卫星信号四棱锥

// /** 绘制网格 */
// let showGrid = false;
// const drawGrid = createGridDrawer(viewer); // 这里返回的是一个闭包，为了实现静态函数的效果
// document
//   .querySelector("#showGridButton")
//   .addEventListener("click", function showGridButtonClick() {
//     drawGrid(showGrid);
//     showGrid = !showGrid;
//   });

// /** 左键单击事件 */
// // leftClickHandler(viewer);
const radarOptions = {
  position: Cartesian3.fromDegrees(116.3914, 39.9067), // 示例坐标，北京市中心
  coefficient: 100000, // 自定义系数
  slicePartition: 72, // 分片数
  hasJammer: false // 无干扰机
};

// 创建RadarPrimitive并将viewer传入
const radar = new RadarPrimitive(radarOptions, viewer);

// // 设置雷达参数
// const radarParams = {
//   center: Cartesian3.fromDegrees(116.3914, 39.9067), // 雷达位置
//   radius: 2000, // 雷达半径
//   slicePartition: 72 // 雷达切片数量
// };

// // // 创建雷达对象
// const radar2 = new VisualRadarPrimitive(radarParams, viewer);