import { Cartographic, ScreenSpaceEventType, Math as CesiumMath } from "cesium";

export function leftClickHandler(viewer) {
  viewer.screenSpaceEventHandler.setInputAction(function (event) {
    // 使用Cesium的地形或模型拾取工具获取点击位置的对象
    const pickedObject = viewer.scene.pick(event.position);
    const cartesian = viewer.scene.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid
    );

    if (pickedObject && pickedObject.id && pickedObject.id.description) {
      // 如果有拾取到的对象，并且对象有描述属性，则使用Cesium自带的InfoBox显示该描述
      viewer.selectedEntity = pickedObject.id;
      document.getElementById("position").innerText = "";
    } else if (cartesian) {
      // 将Cartesian坐标转换为地理坐标（经纬度）
      const cartographic = Cartographic.fromCartesian(cartesian);

      // 获取经度、纬度和高度
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      // 构建位置对象
      const MouseLocation = {
        x: longitude,
        y: latitude,
        z: height,
      };

      // 构建消息对象
      const message = {
        type: "meshClick",
        payload: {
          MouseLocation: MouseLocation,
          source: "cesiumMap",
        },
      };

      // 输出到控制台
      console.log(JSON.stringify(message));

      document.getElementById("position").innerText =
        `x: ${message.payload.MouseLocation.x}\ny: ${message.payload.MouseLocation.y}\nz: ${message.payload.MouseLocation.z}`;

      // 清除选中的实体，使InfoBox不再显示内容
      viewer.selectedEntity = undefined;
    } else {
      // 如果既没有拾取到对象，也没有点击到地球表面，则清空位置显示并隐藏InfoBox
      document.getElementById("position").innerText = "";
      viewer.selectedEntity = undefined;
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
}
