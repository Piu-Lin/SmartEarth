export default class BaseModel {
  // 添加gltf或glb模型
  createModel(dataSource, url, coordinate, name, isCircleRipple = true, isBillboard = true) {
    if (!coordinate) return;
    let position = new Cesium.Cartesian3.fromDegrees(coordinate.x, coordinate.y, coordinate.z);
    let heading = 0;
    function getAxisValue() {
      heading = heading + Cesium.Math.toRadians(10);
      let hpr = new Cesium.HeadingPitchRoll(heading, 0, 0);
      let orientation=Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      return orientation;
    }
    let entity = dataSource.entities.add({
      name: url,
      position: position,
      orientation: new Cesium.CallbackProperty(getAxisValue, false),
      model: {
        uri: url,
        scale: 1,
        minimumPixelSize: 32,
        maximumScale: 64,
      },
    });
    if(isCircleRipple) {
      this.addCircleRipple(entity,coordinate.z);
    }
    if(isBillboard) {
      this.addMarkBillboard(dataSource, { name, image: '/static/images/marker/mark_bg9.png', coordinate });
    }
    return entity;
  }
}
