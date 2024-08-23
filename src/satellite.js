import { Cartesian3, Entity, Viewer } from "cesium";

/**
 * 
 * @param {Viewer} viewer 
 * @param {Cartesian3} position 
 * @returns {Entity}
 */
export function loadSatellite(viewer, position) {
  // 卫星
  return viewer.entities.add({
    name: "satellite",
    position: position,
    model: {
      uri: "/models/weixing.glb",
      minimumPixelSize: 2000000,
      maximumScale: 200000,
      scale: 100,
    },
  });
}
