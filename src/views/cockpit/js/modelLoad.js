import {ref} from "vue";

export function addModel(viewer) {
  // 图层信息
  let mapInfo = {};
  // const modelX = 81;
  // const modelY = 0;
  // const modelZ = 0;
  // const longitude = 119.92403014202115;
  // const latitude = 29.259877196707844;
  // const height = 87.10647828935416;
  // const distance = 500;
  // const dataSource = new Cesium.CustomDataSource("model_load");
  // viewer.dataSources.add(dataSource);
  // const handModel = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  // // 转经纬度高度
  // const modelDegree = getDegrees(handModel, viewer);
  // let data = {
  //   position: {
  //     x: modelDegree.x,
  //     y: modelDegree.y,
  //     z: modelDegree.z,
  //   },
  //   orientation: {
  //     h: modelX,
  //     p: modelY,
  //     r: modelZ,
  //   }
  // };
  // const orientation = getOrientation(data);
  // dataSource.entities.add({
  //   position: handModel,
  //   orientation: orientation,
  //   model: {
  //     uri: '/static/model/leida.glb',
  //     scale: 5
  //   }
  // });
  // // 视角飞到模型位置
  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + distance),
  //   orientation: {
  //     roll: 0.0 // 期望的视角滚动角（可选）
  //   },
  //   duration: 3 // 动画持续时间，以秒为单位（可选）
  // });
  model.value.pId = mapInfo.id;
  model.value.open();
}

function getOrientation(data) {
  let {x, y, z} = data.position;
  let {h, p, r} = data.orientation;
  h = (h / 180) * Math.PI;
  p = (p / 180) * Math.PI;
  r = (r / 180) * Math.PI;
  let position = Cesium.Cartesian3.fromDegrees(+x, +y, +z);
  let hpr = new Cesium.HeadingPitchRoll(+h, +p, +r);
  let orientation = new Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );
  return orientation;
}

// 世界坐标转为经纬度
function getDegrees(cart, viewer) {
  let ellipsoid = viewer.scene.globe.ellipsoid;
  let cartograhphic = ellipsoid.cartesianToCartographic(cart);
  let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
  let lon = Cesium.Math.toDegrees(cartograhphic.longitude);
  let alt = cartograhphic.height;
  return {x: lon, y: lat, z: alt};
}
