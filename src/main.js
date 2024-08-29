import { Cartesian3, Ion, Terrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { loadBall } from "./ball";
import { loadCzml } from "./czml";
import {
  drawCircleAroundSatellite,
  drawCone,
  drawCone3,
  drawCone4,
  drawLine,
} from "./draw";
import { loadSatellite, loadSpaceShuttle, loadYacht } from "./models";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMGRmMDMwMS1kNWExLTQ0ODgtYTFiYi0zMDJkZjMxMjUxNGQiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjEwMDgwODR9.8MaR-sOFXpZ3G3i21O_3J4XpogxbQgOpnqg7uznsrPU";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

/** 模型位置 */
const positions = {
  satellite: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
  ball: Cartesian3.fromDegrees(120.0988, 0, 4000),
  circle: Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
  spaceShuttle: Cartesian3.fromDegrees(120.0988, 23.123, 5000),
  yacht: Cartesian3.fromDegrees(120.0988, -25.023),
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
