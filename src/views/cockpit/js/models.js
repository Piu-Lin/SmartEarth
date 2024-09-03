/**
 * 加载卫星
 * @param {Viewer} viewer
 * @param {Cartesian3} position
 * @returns {Entity}
 */
export function loadSatellite(viewer, position) {
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

/**
 * 加载游艇
 * @param {Viewer} viewer
 * @param {Cartesian3} position
 * @returns {Entity}
 */
export function loadYacht(viewer, position) {
  return viewer.entities.add({
    name: "yacht",
    position: position,
    model: {
      uri: "/models/游艇.glb",
      minimumPixelSize: 2000000,
      maximumScale: 20000,
      scale: 0.5,
    },
  });
}

/**
 * 加载游艇
 * @param {Viewer} viewer
 * @param {Cartesian3} position
 * @returns {Entity}
 */
export function loadSpaceShuttle(viewer, position) {
  return viewer.entities.add({
    name: "space shuttle",
    position: position,
    model: {
      uri: "/models/航天飞机.glb",
      minimumPixelSize: 2000000,
      maximumScale: 20000,
      scale: 0.5,
    },
  });
}
