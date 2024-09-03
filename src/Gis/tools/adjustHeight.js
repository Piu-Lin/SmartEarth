/* eslint-disable */
// import * as Cesium from 'cesium';

export const adjustHeight = function (tileset, height) {
  const heightOffset = height;
  const { boundingSphere } = tileset;
  const cartographic = Cesium.Cartographic.fromCartesian(
    boundingSphere.center,
  );
  const surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    0.0,
  );
  const offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    heightOffset,
  );
  const translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3(),
  );
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};
