import {mix} from './tools';
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
import BaseEvent from './BaseEvent';
import { randomColor } from "./utils/index";
import villages from "@/testData/villages";
import LayerType from "./enum/LayerType";

export default class IndustryMap extends mix(
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
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL, 'nanxun_industry');
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SN, 'nanxun-fbx-sn');
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_SW, 'nanxun-fbx-sw');
        this.createTileset(CUSTOM_URL.CUSTOM_TILESET_URL_FBX_DX, 'nanxun-fbx-dx');
        // 初始化街道边界
        this.initBorderLine('/static/data/boundary.geojson',200, '#1064cc', true, true);
        // 初始化村界
        this.initVillage('/static/data/boundaryVillage.geojson',6000,59000);
        // 初始化网格
        this.initGrid('/static/data/grid.geojson',0,2000000, 'grid');
        // 初始化微网格
        this.initGrid('/static/data/minigrid.geojson',0,2000000, 'minigrid');
        // 初始化点击事件
        this.initLeftClick();
        // 初始化地图气泡
        this.initMapToolTip();
        // 添加影像
        this.addImageryProvider('TDT_IMG');
        // 添加水面图层
        this.addWaterLayerJson('/static/data/water.geojson',-3.5);
        this.createRoute('/static/data/route.geojson',{ name: 'route', width: 1, image: '/static/images/texture/colors16.png', color: Cesium.Color.fromCssColorString("#61f8ff").withAlpha(0.8), time: 4000 });
        // 飞到指定位置
        this.flyTo(
            {
                longitude: 120.37758643963633,
                latitude: 30.862595629117745,
                height: 31606.40959384521,
                heading: 6.128796967037029,
                pitch: -1.5706822706292014,
                roll: 0,
            }
        );
        // 临时全局变量
        this.tempGlobal = {};
        // 提示框
        this.mapTooltip = new Tooltip(this.viewer);
        this.emitter = new BaseEvent();
        this.viewer.imageryLayers._layers.forEach((layer) => {
            if(layer.imageryProvider.name === "TDT_IMG") {
                layer.saturation = 1.2;
                layer.brightness = 1.6;
            }
        })

        // let stages = this.viewer.scene.postProcessStages;
        // this.viewer.scene.brightness = this.viewer.scene.brightness || stages.add(Cesium.PostProcessStageLibrary.createBrightnessStage());
        // this.viewer.scene.brightness.enabled = true;
        // this.viewer.scene.brightness.uniforms.brightness = Number(1.2);

        // 监听相机高度
        this.cameraHeight();
        // 摧毁自动旋转
        this.destroyAroundPoint = true;
    }

    addTempGlobal(name, object) {
        this.tempGlobal[name] = object;
    }
    removeTempGlobal(name) {
        delete this.tempGlobal[name];
    }

    // 初始化村界
    initVillage(url, near, far) {
        Cesium.GeoJsonDataSource.load(url, {
            clampToGround: true
        }).then(dataSource => {
            dataSource.name = "village";
            dataSource.show = true;
            this.viewer.dataSources.add(dataSource);
            const entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                const properties = entity.properties;
                let name = properties.name ? properties.name._value : "";
                entity.name = name;
                entity.Type = 'village';
                entity.deptId = properties.deptId ? properties.deptId._value : "";
                entity.polygon.material = Cesium.Color.fromCssColorString("#1e2d43").withAlpha(0.01);
                entity.polyline = {
                    positions: entity.polygon.hierarchy._value.positions,
                    width: 1,
                    material: Cesium.Color.fromCssColorString("#ffffff"),
                    distanceDisplayCondition: entity.polygon.distanceDisplayCondition,
                    clampToGround: true,
                };
                let item = villages.find(item => item.name === name);
                entity.position = new Cesium.Cartesian3.fromDegrees(
                    item.coordinate.x,
                    item.coordinate.y,
                    item.coordinate.z
                );
                this.addLabel(entity,{ name: name, type: 'village', near, far, pixelOffsetY: 5, showBackground: false, outlineColor: Cesium.Color.BLACK, outlineWidth: 2.0 })
            }
        });
    }

    // 初始化网格
    initGrid(url, near, far, Type) {
        Cesium.GeoJsonDataSource.load(url, {
            clampToGround: true
        }).then(dataSource => {
            dataSource.name = Type;
            dataSource.show = true;
            this.viewer.dataSources.add(dataSource);
            const entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                const properties = entity.properties;
                entity.village = properties.village ? properties.village._value : "";
                let name = properties.name ? properties.name._value : "";
                entity.name = name;
                entity.Type = Type;
                entity.info = properties.info ? properties.info._value : "";
                entity.block = properties.block ? properties.block._value : "";
                entity.deptId = properties.deptId ? properties.deptId._value : "";
                entity.show = false;
                entity.polygon.material = Cesium.Color.fromCssColorString("#1e2d43").withAlpha(0.8);
                entity.polyline = {
                    positions: entity.polygon.hierarchy._value.positions,
                    width: entity.polygon.outlineWidth,
                    material: Cesium.Color.fromCssColorString("#ffffff"),
                    distanceDisplayCondition: entity.polygon.distanceDisplayCondition,
                    clampToGround: true,
                };
                const polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                let polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
                polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
                const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(polyCenter);
                let x = properties.x ? properties.x._value : "";
                let y = properties.y ? properties.y._value : "";
                entity.x = x;
                entity.y = y;
                if(x && y) {
                    entity.position = Cesium.Cartesian3.fromDegrees(parseFloat(x), parseFloat(y), 30);
                } else {
                    entity.position = Cesium.Cartesian3.fromDegrees((cartographic.longitude * 180) / Math.PI, (cartographic.latitude * 180) / Math.PI, 30);
                }
                this.addLabel(entity,{ name, type: Type, near, far, pixelOffsetY: 10 })
            }
        });
    }
}
