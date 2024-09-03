// import * as Cesium from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';
import BaseMap from '../BaseMap';
import BaseTileset from "../BaseTileset";
import BaseHandler from '../BaseHandler';
import BaseFlyTo from '../BaseFlyTo';
import BaseMark from '../BaseMark';
import BaseLayer from '../BaseLayer';
import { mix } from '../tools';
import LayerType from "../enum/LayerType";

class ToolsMap extends mix(
  BaseMap,
  BaseTileset,
  BaseHandler,
  BaseFlyTo,
  BaseMark,
  BaseLayer,
) {
  constructor(mapId) {
    super();
    // 初始化地图
    this.initMap(mapId);
    // 初始化点击事件
    this.initLeftClick();
    // 添加影像
    this.addImageryProvider('TDT_IMG');
    // 添加三维模型
    this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, "nanxun");
    // 飞到指定位置
    this.zoomTo(
        {
          longitude: 120.38461859899995,
          latitude: 30.849458808886137,
          height: 14922.809769754049,
          heading: 6.011646531364401,
          pitch: -1.4940782049987664,
          roll: 6.272457046025057,
        }
    );
    // 摧毁自动旋转
    this.destroyAroundPoint = true;
  }

  // 高亮回显选中的单体化模型
  highlightEntity(positionId) {
    this.viewer.dataSources._dataSources.forEach((dataSource) => {
      if(dataSource.name === 'monomer') {
        dataSource.entities.values.forEach((entity) => {
          if(entity?.ID === positionId) {
            this.highlightPolygon(entity);
          }
        })
      }
    })
  }
}

export default ToolsMap;
