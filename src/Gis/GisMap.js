import {mix} from './tools';
import BaseMap from './BaseMap';
import BaseTileset from './BaseTileset';
import BaseHandler from './BaseHandler';
import BaseToolTip from './BaseToolTip';
import BaseFlyTo from './BaseFlyTo';
import BaseMark from './BaseMark';
import BaseMaterial from './BaseMaterial';
import BaseLayer from './BaseLayer';
import Tooltip from "./tools/tooltip";
import BaseEvent from './BaseEvent';
import {randomColor} from "./utils/index";

export default class gisMap extends mix(
  BaseMap,
  BaseTileset,
  BaseHandler,
  BaseToolTip,
  BaseFlyTo,
  BaseMark,
  BaseMaterial,
  BaseLayer,
) {
  constructor(mapId) {
    super();
    // 初始化地图
    this.initMap(mapId);
    // 加载 3DTiles 白模
    // this.createTileset('/static/data/2/tileset.json', 'building2');
    // this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun');
    // this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL2, 'nanxun');
    this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun');
    this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SN, 'nanxun-fbx-sn');
    this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SW, 'nanxun-fbx-sw');
    this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_DX, 'nanxun-fbx-dx');
    // 初始化街道边界
    this.initBorder('/static/data/南浔区.geojson', 200, '#1064cc');
    // 初始化电梯小镇边界
    this.initBorder('/static/data/电梯小镇.geojson', 50, '#59c8cc', true);
    // 初始化乡镇
    this.initGrid('/static/data/南浔区-乡镇.json', 6000, 2000000);
    // 添加水面图层
    this.addWaterLayerJson('/static/data/water.geojson', -3.5);
    this.createRoute('/static/data/route.geojson', {
      name: 'route',
      width: 1,
      image: '/static/images/texture/colors16.png',
      color: Cesium.Color.fromCssColorString("#61f8ff").withAlpha(0.8),
      time: 4000
    });
    // 初始化点击事件
    this.initLeftClick();
    // 初始化地图气泡
    this.initMapToolTip();
    // 添加影像
    this.addImageryProvider('TDT_IMG');
    // 飞到指定位置
    this.flyTo(
      {
        longitude: 120.38342272382314,
        latitude: 30.836347959654553,
        height: 171.42986316293258,
        heading: 0.12952613836712246,
        pitch: -0.2723344688216971,
        roll: 0.0003961477537171021,
      }
    );
    // 临时全局变量
    this.tempGlobal = {};
    // 提示框
    this.mapTooltip = new Tooltip(this.viewer);
    this.emitter = new BaseEvent();
    // 摧毁自动旋转
    this.destroyAroundPoint = true;
  }

  addTempGlobal(name, object) {
    this.tempGlobal[name] = object;
  }

  removeTempGlobal(name) {
    delete this.tempGlobal[name];
  }

  // 初始化网格
  initGrid(url, near, far) {
    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true
    }).then(dataSource => {
      dataSource.name = "grid";
      dataSource.show = true;
      this.viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const properties = entity.properties;
        entity.village = properties.village ? properties.village._value : "";
        entity.name = properties.name ? properties.name._value : "";
        entity.Type = "grid";
        entity.info = properties.info ? properties.info._value : "";
        entity.show = false;
        entity.polygon.material = Cesium.Color.fromCssColorString(
          randomColor()
        ).withAlpha(0.5);
        entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
          near || 0,
          far || 160000
        );
        const polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
        let polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(polyCenter);
        entity.position = Cesium.Cartesian3.fromDegrees((cartographic.longitude * 180) / Math.PI, (cartographic.latitude * 180) / Math.PI, 40);
        this.addLabel(entity, {name, type: 'village', near, far})
      }
    });
  }
}
