import {mix, throttle} from './tools';
import BaseMap from './BaseMap';
import BaseTileset from './BaseTileset';
import BaseHandler from './BaseHandler';
import BaseToolTip from './BaseToolTip';
import BaseFlyTo from './BaseFlyTo';
import BaseMark from './BaseMark';
import BaseMaterial from './BaseMaterial';
import BaseLayer from './BaseLayer';
import { randomColor } from "./utils/index";
import pickGloble from "./tools/pickGloble";
import Tooltip from "./tools/tooltip";

export default class selectionMap extends mix(
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
        // 初始化街道边界
        this.initBorder('/static/data/南浔区.geojson',200, '#1064cc');
        // 加载 3DTiles
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun', true);
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL2, 'nanxun', true);
        this.createTilesetMonomer(CUSTOM_URL.CUSTOM_MONOMER, 'monomer');
        // 添加水面图层
        this.addWaterLayerJson('/static/data/water.geojson',-3.5);
        // this.createTileset(CUSTOM_URL.CUSTOM_MONOMER, 'monomer');
        // 初始化模型边界
        this.initBorderLine('/static/data/倾斜边界.geojson',200, '#1064cc', true);
        // 初始化点击事件
        this.leftClick();
        // 添加影像
        this.addImageryProvider('TDT_IMG');
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
        //提示框
        this.mapTooltip = new Tooltip(this.viewer);
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

    // 初始化街道边界
    initBorder(url, height, color) {
        Cesium.GeoJsonDataSource.load(url, {
            clampToGround: true,
        }).then((dataSource) => {
            dataSource.entities.values.forEach((entitie) => {
                const { ellipsoid } = this.viewer.scene.globe;
                const line = [];
                entitie.polygon.hierarchy._value.positions.forEach((position) => {
                    const cartographic = ellipsoid.cartesianToCartographic(position);
                    line.push(Cesium.Math.toDegrees(cartographic.longitude));
                    line.push(Cesium.Math.toDegrees(cartographic.latitude));
                    line.push(height);
                });
                // CORNFLOWERBLUE DEEPSKYBLUE DODGERBLUE
                this.createWall(Cesium, line, Cesium.Color.fromCssColorString(color), 3000);
            });
        });
    }
}
