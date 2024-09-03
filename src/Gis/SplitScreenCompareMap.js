/* eslint-disable no-plusplus */
/* eslint-disable vars-on-top */
// import * as Cesium from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';
// import "cesium/Widgets/widgets.css";
import {
    mix
} from './tools';
import BaseMap from './BaseMap';
import BaseTileset from './BaseTileset';
import BaseHandler from './BaseHandler';
import BaseToolTip from './BaseToolTip';
import BaseFlyTo from './BaseFlyTo';
import BaseMark from './BaseMark';
import BaseMaterial from './BaseMaterial';
import BaseLayer from './BaseLayer';
import Icons from "./enum/Icons";
import Tooltip from "./tools/tooltip";
import FogEffect from "./FogEffect";
import SnowEffect from "./SnowEffect";
import RainEffect from "./RainEffect";
import "./PolylineTrailLinkMaterial/EllipsoidElectricMaterialProperty";

export default class BigScreenMap extends mix(
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
        // 初始化模型边界
        this.initBorderLine('/static/data/倾斜边界.geojson',200, '#1064cc', true);
        // 初始化点击事件
        this.initLeftClick();
        // 初始化地图气泡
        this.initMapToolTip();
        // 添加影像
        this.addImageryProvider('TDT_IMG');
        // 添加水面图层
        this.addWaterLayerJson('/static/data/water.geojson',-3.5);
        // 飞到指定位置
        this.flyTo({
            longitude: 120.3738731981985,
            latitude: 30.830813116126173,
            height: 160.85309142019682,
            heading: 0.1412121281632679,
            pitch: -0.5242177630391769,
            roll: 0.0004806152783949358,
        });

        //临时全局变量
        this.tempGlobal = {};
        //提示框
        this.mapTooltip = new Tooltip(this.viewer);
        const {
            viewer
        } = this;
        this.rainEffect = new Cesium.RainEffect(viewer, {});
        this.snowEffect = new Cesium.SnowEffect(viewer, {});
        this.fogEffect = new Cesium.FogEffect(viewer, {});
        // 摧毁自动旋转
        this.destroyAroundPoint = true;
    }

    addTempGlobal(name, object) {
        this.tempGlobal[name] = object;
    }

    removeTempGlobal(name) {
        delete this.tempGlobal[name];
    }

}
