// import * as Cesium from "cesium";
import PolylineTrailLinkMaterialPropertyAlong from "../PolylineTrailLinkMaterial/PolylineTrailLinkMaterialPropertyAlong";
import PolylineTrailLinkMaterialPropertyTop from "../PolylineTrailLinkMaterial/PolylineTrailLinkMaterialPropertyTop";
import { getBSRPoints } from "../tools/BSRPoints";

export default class BaseMaterial {
  /**
   * 画墙
   * @param Cesium
   * @param line 范围线数组
   * @param color 颜色
   * @param time 持续时间
   */
  createWall(Cesium, line, color, time) {
    PolylineTrailLinkMaterialPropertyTop(Cesium);
    this.viewer.entities.add({
      wall: {
        positions: new Cesium.Cartesian3.fromDegreesArrayHeights(
          line,
        ),
        material: new Cesium.PolylineTrailLinkMaterialPropertyTop(
          color,
          time
        ),
      },
    });
  }

  // 绘制路线
  createRoute(fileName, data) {
    Cesium.GeoJsonDataSource.load(fileName, {
      clampToGround: true,
      strokeWidth: data?.width || 5
    }).then((dataSource) => {
      dataSource.name = data?.name || 'route';
      dataSource.entities.values.forEach((entity) => {
        PolylineTrailLinkMaterialPropertyAlong(Cesium);
        entity.polyline.material = new Cesium.PolylineTrailLinkMaterialPropertyAlong(
            data?.color || Cesium.Color.YELLOW,
            data?.time || 2000,
            data?.image || '/static/images/texture/colors22.png'
        );
      })
      this.viewer.dataSources.add(dataSource);
    });
  }

  /**
   * 绘制飞线
   * @param dataSource 数据源
   * @param data { point：起始坐标点，point2：终止坐标点，height：高度 }
   */
  createFlyLine(dataSource, data) {
    PolylineTrailLinkMaterialPropertyAlong(Cesium);
    let arrAll = getBSRPoints(data.point.x, data.point.y, data.point2.x, data.point2.y, data.height);
    dataSource.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(arrAll),
        material: new Cesium.PolylineTrailLinkMaterialPropertyAlong(
          data?.color || Cesium.Color.WHEAT,
          data?.time || 5000,
          '/static/images/texture/colors16.png'
        )
      }
    });
  }
}
