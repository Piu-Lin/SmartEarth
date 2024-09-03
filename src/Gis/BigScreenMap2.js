/* eslint-disable no-plusplus */
/* eslint-disable vars-on-top */
// import * as Cesium from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';
// import "cesium/Widgets/widgets.css";
import {
    mix, throttle
} from './tools';
import BaseMap from './BaseMap';
import BaseTileset from './BaseTileset';
import BaseModel from './BaseModel';
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
import pickGloble from "./tools/pickGloble";

export default class BigScreenMap extends mix(
    BaseMap,
    BaseTileset,
    BaseModel,
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
        this.initMap(mapId,true);
        // 加载 3DTiles
        // this.createTileset('http://metagis.cc:20211/nanxun-3dtiles/tileset.json', 'nanxun');
        // this.createTileset('http://81.69.21.2:20211/zhoushan-zhujiajian/tileset.json', 'zhoushan');
        // this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun');
        // this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL2, 'nanxun');
        this.createTileset2(CUSTOM_URL.CUSTOM_TILESET_URL3, 'nanxun');
        this.createTileset2(CUSTOM_URL.CUSTOM_TILESET_URL2, 'nanxun');
        // this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_EDIT, 'nanxun');
        this.createTileset2(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SN, 'nanxun-fbx-sn');
        this.createTileset2(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SW, 'nanxun-fbx-sw');
        this.createTileset2(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_DX, 'nanxun-fbx-dx');
        // this.createTilesetMonomer(CUSTOM_URL.CUSTOM_MONOMER, 'monomer');
        // 初始化模型边界
        // this.initBorder('/static/data/nanxun-3dtiles-line.kml',200, '#1064cc');
        // 初始化园区
        this.initBorderLine(CUSTOM_URL.CUSTOM_URL_PARKLINE,70, '#6cc9cc', true);
        this.initBorderLine('/static/data/倾斜边界.geojson',200, '#1064cc', true);
        // 初始化点击事件
        this.initLeftClick();
        this.leftClick();
        // 初始化地图气泡
        this.initMapToolTip();
        // 添加影像
        this.addImageryProvider('TDT_IMG');
        // 添加水面图层
        this.addWaterLayerJson('/static/data/water.geojson',-3.5);
        // this.addWaterLayerJson('/static/data/route.geojson');
        this.createRoute('/static/data/route.geojson',{ name: 'route', width: 1, image: '/static/images/texture/colors16.png', color: Cesium.Color.fromCssColorString("#61f8ff").withAlpha(0.8), time: 4000 });
        // 飞到指定位置
        this.zoomTo({
            longitude: 120.38732573412301,
            latitude: 30.861474812640306,
            height: 296.5526811986166,
            heading: 3.781113402652086,
            pitch: -0.5614896396944102,
            roll: 6.281106379262646,
        });
        // this.autoRotation(0.01);
        this.aroundPoint();
        this.addLandmark();

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
        this.pickedType = '建筑'
    }

    // 添加地标
    addLandmark() {
        const dataSource = new Cesium.CustomDataSource('landMark');
        this.viewer.dataSources.add(dataSource);
        // 添加锥形模型
        let coordinate = { x: 120.38467004055735, y: 30.858617118966578, z: 100};
        this.createModel(dataSource, '/static/model/zhui.glb', coordinate, '经开区管委会');
        // let coordinate = { x: 120.38377686487064, y: 30.855239753593697, z: 50};
        // this.createModel(dataSource, '/static/model/zhui.glb', coordinate, '水晶晶公园');
    }

    addTempGlobal(name, object) {
        this.tempGlobal[name] = object;
    }

    removeTempGlobal(name) {
        delete this.tempGlobal[name];
    }

    leftClick() {
        const { viewer } = this;
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // 左键单击事件
        handler.setInputAction((e) => {
            this.mapTooltip.destroy();
            if (this.pickedType === '点位') {
                const cartesian = pickGloble(viewer, e.position);
                if (!cartesian) return;
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const clickLon = Cesium.Math.toDegrees(cartographic.longitude);
                const clickLat = Cesium.Math.toDegrees(cartographic.latitude);
                const clickHei = cartographic.height > 0 ? cartographic.height : 0;
                viewer.entities.removeAll();
                this.addMark(viewer,{coordinate: {x: clickLon, y: clickLat, z: clickHei}});
                // 调用父页面方法
                this.pickedPosition = {x: clickLon, y: clickLat, z: clickHei.toFixed(2)};
                window.parent.postMessage(this.pickedPosition,"*");
            }
            if (this.pickedType === '建筑') {
                const pickedObject = viewer.scene.pick(e.position);
                if (pickedObject) {
                    if(this.pickedEntityCLICK){
                        this.pickedEntityCLICK.color = Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.01);
                    }
                    if(pickedObject.primitive.name === 'monomer'){
                        this.mapTooltip.create(pickedObject.getProperty("floor")+"楼");
                        this.mapTooltip.setPosition(e.position.x, e.position.y);
                        pickedObject.color = Cesium.Color.fromCssColorString("#f6d603").withAlpha(0.7);
                        this.pickedEntityCLICK = pickedObject;
                        this.pickedPosition = {id: pickedObject.getProperty("id"), x: pickedObject.getProperty("X"), y: pickedObject.getProperty("Y"), z: pickedObject.getProperty("height")};
                        window.parent.postMessage(this.pickedPosition,"*");
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // 移动事件
        handler.setInputAction(
            throttle((e) => {
                this.mapTooltip.destroy();
                if(this.pickedEntity){
                    if (!this.pickedEntityCLICK || this.pickedEntity.getProperty("id") !== this.pickedEntityCLICK.getProperty("id")) {
                        this.pickedEntity.color = Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.01);
                    }
                }
                const pickedObject = viewer.scene.pick(e.endPosition);
                if (pickedObject && this.pickedType === '建筑') {
                    if(pickedObject.primitive.name === 'monomer'){
                        this.mapTooltip.create(pickedObject.getProperty("floor")+"楼");
                        this.mapTooltip.setPosition(e.startPosition.x, e.startPosition.y);
                        pickedObject.color = Cesium.Color.fromCssColorString("#f6d603").withAlpha(0.7);
                        this.pickedEntity = pickedObject;
                    }
                }
            }, 100), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

}
