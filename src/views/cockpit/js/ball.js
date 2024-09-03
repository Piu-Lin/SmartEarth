/**
 * 
 * @param {Viewer} viewer 
 * @param {Cartesian3} position 
 * @returns {Entity}
 */
export function loadBall(viewer, position) {
  // 雷达辐射范围球
  return viewer.entities.add({
    name: "ball",
    position: position,
    model: {
      uri: "/models/Ball2_Geomitry.glb",
      minimumPixelSize: 20000,
      maximumScale: 20000,
      scale: 2,
    },
  });
}
