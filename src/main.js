import { Cartesian3, Ion, Terrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { loadBall } from "./ball";
import { loadCzml } from "./czml";
import { createGridDrawer, drawCircleAroundSatellite, drawCone4 } from "./draw";
import { leftClickHandler } from "./eventHandler";
import { loadSatellite, loadSpaceShuttle, loadYacht } from "./models";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NmM4ODRiMC05NzUwLTRkMGUtOTkxMS05ZGFhNTAyMWEzM2QiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjU0MzI5OTV9._rqnZtZbsaCVfb4XY_U2GpR-gmHy_iMZ2ebf-VigRiE";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

/** 模型位置 */
const positions = {
  satellite: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
  ball: Cartesian3.fromDegrees(120.0988, 0, 4000),
  circle: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
  spaceShuttle: Cartesian3.fromDegrees(120.0988, 23.123, 5000),
  yacht: Cartesian3.fromDegrees(120.0988, -40.023),
};

/** 加载模型 */
loadCzml(viewer);
loadSatellite(viewer, positions["satellite"]); // 卫星
loadBall(viewer, positions["ball"]); // 地面接收站球体
loadSpaceShuttle(viewer, positions["spaceShuttle"]); // 航天飞机
loadYacht(viewer, positions["yacht"]); // 游艇

/** 绘制线条 */
drawCircleAroundSatellite(viewer, positions["circle"]); // 卫星轨迹线
drawCone4(viewer); // 卫星信号四棱锥

/** 绘制网格 */
let showGrid = false;
const drawGrid = createGridDrawer(viewer); // 这里返回的是一个闭包，为了实现静态函数的效果
document
  .querySelector("#showGridButton")
  .addEventListener("click", function showGridButtonClick() {
    drawGrid(showGrid);
    showGrid = !showGrid;
  });

/** 左键单击事件 */
leftClickHandler(viewer);
