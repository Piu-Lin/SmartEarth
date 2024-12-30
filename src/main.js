import { Cartesian3, Ion, Terrain, Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { RadarPrimitive } from "./radar.ts";
import { loadCzml } from "./czml.js";

import { VisualRadarPrimitive } from "./visual-radar.ts";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NmM4ODRiMC05NzUwLTRkMGUtOTkxMS05ZGFhNTAyMWEzM2QiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjU0MzI5OTV9._rqnZtZbsaCVfb4XY_U2GpR-gmHy_iMZ2ebf-VigRiE";

const viewer = new Viewer("cesiumContainer", {
  // terrain: Terrain.fromWorldTerrain(),
  shouldAnimate: true,
  contextOptions: {
    // 确保WebGL支持纹理拉取
    webgl2: true,
  },
});

/** 加载模型 */
loadCzml(viewer);

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