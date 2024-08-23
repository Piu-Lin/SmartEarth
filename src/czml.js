import {
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    CzmlDataSource,
} from "cesium";

import { geoSoT_encode_3D_32bits } from "./sot";

export function loadCzml(viewer) {
  const dataSource = new CzmlDataSource();
  viewer.dataSources.add(dataSource);
  dataSource
    .load("/asd.czml")
    .then(() => {
      const Geoeye1entity = dataSource.entities.getById("Satellite/Geoeye1");
      const ISSentity = dataSource.entities.getById("Satellite/ISS");
      const Molniya1 = dataSource.entities.getById("Satellite/Molniya_1-92");
      const Geoeye1ToISS = dataSource.entities.getById(
        "Satellite/Geoeye1-to-Satellite/ISS",
      );
      const AGIToISS = dataSource.entities.getById(
        "Facility/AGI-to-Satellite/ISS",
      );
      const AGI = dataSource.entities.getById("Facility/AGI");

      if (Geoeye1entity && ISSentity && Molniya1 && Geoeye1ToISS && AGIToISS) {
        const clock = viewer.clock;
        const updateDescription = () => {
          const Geoeye1entityPosition = Geoeye1entity.position.getValue(
            clock.currentTime,
          );
          const ISSentityPosition = ISSentity.position.getValue(
            clock.currentTime,
          );
          const Molniya1Position = Molniya1.position.getValue(
            clock.currentTime,
          );
          const AGIPosition = AGI.position.getValue(clock.currentTime);

          if (AGIPosition) {
            const agiPosition = Cartographic.fromCartesian(AGIPosition);
            const longitude = CesiumMath.toDegrees(
              agiPosition.longitude,
            ).toFixed(2);
            const latitude = CesiumMath.toDegrees(agiPosition.latitude).toFixed(
              2,
            );
            const height = agiPosition.height.toFixed(2);
            const geoSoT = geoSoT_encode_3D_32bits(
              latitude,
              longitude,
              height,
              31,
            );
            AGI.description = `名称：地面雷达站<br>纬度：${longitude}°<br>经度: ${latitude}°<br>海拔：0m<br> 网格编码： ${geoSoT}</p>`;
          }

          if (Geoeye1entityPosition) {
            const cartographicPosition = Cartographic.fromCartesian(
              Geoeye1entityPosition,
            );
            const longitude = CesiumMath.toDegrees(
              cartographicPosition.longitude,
            ).toFixed(6);
            const latitude = CesiumMath.toDegrees(
              cartographicPosition.latitude,
            ).toFixed(6);
            const height = cartographicPosition.height.toFixed(2);
            Geoeye1entity.description = `名称: GeoEye-1<br>类型: SSO 太阳同步轨道 <br>经度: ${longitude}<br>纬度: ${latitude} <br>高度: ${height} <br> 光谱范围: 450-900 纳米</p>`;
          }
          if (ISSentityPosition) {
            const cartographicPosition =
              Cartographic.fromCartesian(ISSentityPosition);
            const longitude = CesiumMath.toDegrees(
              cartographicPosition.longitude,
            ).toFixed(6);
            const latitude = CesiumMath.toDegrees(
              cartographicPosition.latitude,
            ).toFixed(6);
            const height = cartographicPosition.height.toFixed(2);
            const geoSoT = geoSoT_encode_3D_32bits(
              latitude,
              longitude,
              height,
              31,
            );
            ISSentity.description = `名称: ISS 国际空间站 <br>类型: LEO 近地轨道 <br>经度: ${longitude}<br>纬度: ${latitude} <br>高度: ${height} <br>空间网格编号：${geoSoT} <br></p>`;
          }
          if (Molniya1Position) {
            const cartographicPosition =
              Cartographic.fromCartesian(Molniya1Position);
            const longitude = CesiumMath.toDegrees(
              cartographicPosition.longitude,
            ).toFixed(6);
            const latitude = CesiumMath.toDegrees(
              cartographicPosition.latitude,
            ).toFixed(6);
            const height = cartographicPosition.height.toFixed(2);
            const geoSoT = geoSoT_encode_3D_32bits(
              latitude,
              longitude,
              height,
              31,
            );
            Molniya1.description = `名称: Molniya军用通讯卫星 <br>类型: HEO 高椭圆轨道 <br>经度: ${longitude}<br>纬度: ${latitude} <br>高度: ${height} <br>空间网格编号：${geoSoT} <br></p>`;
          }
          if (Geoeye1ToISS) {
            const distance = Cartesian3.distance(
              Geoeye1entityPosition,
              ISSentityPosition,
            );
            Geoeye1ToISS.description = `距离： ${distance} 米<br></p>`;
          }
          if (AGIToISS) {
            const distance = Cartesian3.distance(
              AGIPosition,
              ISSentityPosition,
            );
            AGIToISS.description = `距离： ${distance} 米<br></p>`;
          }
        };
        // 每帧调用更新函数
        viewer.scene.preRender.addEventListener(updateDescription);
      } else {
        console.error("未找到实体: Satellite/Geoeye1");
      }
    })
    .catch((error) => {
      console.error("加载CZML数据失败:", error);
    });
}
