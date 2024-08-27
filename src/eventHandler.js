import { Cartographic, ScreenSpaceEventType, Math as CesiumMath } from "cesium";

export function leftClickHandler(viewer) {
  viewer.screenSpaceEventHandler.setInputAction(function (event) {
    // 使用Cesium的地形或模型拾取工具获取点击位置的地理坐标
    const cartesian = viewer.scene.camera.pickEllipsoid(
      event.position,
      viewer.scene.globe.ellipsoid
    );

    if (cartesian) {
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
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
}
