/**
 * 全局拾取，包括模型、地形、地表
 *
 * @param {Viewer} viewer 视图
 * @param {Cartesian2} windowPosition 屏幕坐标
 *
 * @return {Cartesian3}  3D坐标
 */
const pickGloble = function (viewer, windowPosition) {
  let position;
  const pickedObject = viewer.scene.pick(windowPosition) || {};
  if (viewer.scene.pickPositionSupported && pickedObject && pickedObject.primitive instanceof Cesium.Cesium3DTileset) {
    position = viewer.scene.pickPosition(windowPosition);
  } else {
    const ray = viewer.camera.getPickRay(windowPosition);
    position = viewer.scene.globe.pick(ray, viewer.scene);
  }
  return position;
};

export default pickGloble;
