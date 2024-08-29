import { Cartesian3, Ion, Terrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { loadBall } from "./ball";
import { loadCzml } from "./czml";
import { drawCircleAroundSatellite, drawCone, drawCone3, drawCone4, drawLine } from "./draw";
import { loadSatellite } from "./satellite";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMGRmMDMwMS1kNWExLTQ0ODgtYTFiYi0zMDJkZjMxMjUxNGQiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjEwMDgwODR9.8MaR-sOFXpZ3G3i21O_3J4XpogxbQgOpnqg7uznsrPU";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

loadCzml(viewer);
const satellite = loadSatellite(
  viewer,
  Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
);
const ball = loadBall(viewer, Cartesian3.fromDegrees(120.0988, 0, 4000));
drawCircleAroundSatellite(
  viewer,
  Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000),
);
// drawLine(viewer);
drawCone4(viewer);
