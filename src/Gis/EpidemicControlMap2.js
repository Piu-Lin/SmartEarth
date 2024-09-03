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
import PolylineTrailLinkMaterialPropertyAlong from "./PolylineTrailLinkMaterial/PolylineTrailLinkMaterialPropertyAlong";

export default class EpidemicControlMap extends mix(
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
        this.initBorder('/static/data/boundary.geojson',300, '#1064cc');
        // 初始化园区
        this.initBorder('/static/data/parkLine.geojson',100, '#6cc9cc');
        // 加载 3DTiles
        this.createTileset('/static/data/2/tileset.json', 'building2');
        // 初始化村界
        this.initVillage('/static/data/boundaryVillage.geojson',6000,2000000);
        // 初始化网格
        this.initGrid('/static/data/grid.geojson',0,2000000);
        // 初始化点击事件
        this.initLeftClick();
        // 初始化地图气泡
        this.initMapToolTip();
        // 添加影像
        this.addImageryProvider('TDT_DARK');
        // 飞到指定位置
        this.flyTo(
            {
                longitude: 120.37716454395958,
                latitude: 30.861655677020586,
                height: 20636.606813381142,
                heading: 5.855385554815057,
                pitch: -1.5617771359479584,
                roll: 0,
            }
        );
        // 临时全局变量
        this.tempGlobal = {};
        // 提示框
        this.mapTooltip = new Tooltip(this.viewer);
        this.emitter = new BaseEvent();
    }

    addTempGlobal(name, object) {
        this.tempGlobal[name] = object;
    }
    removeTempGlobal(name) {
        delete this.tempGlobal[name];
    }

    // 初始化街道边界
    initBorder(url, height, color) {
        Cesium.GeoJsonDataSource.load(url, {
            clampToGround: true,
        }).then((dataSource) => {
            dataSource.name = "border";
            this.viewer.dataSources.add(dataSource);
            dataSource.entities.values.forEach((entitie) => {
                const { ellipsoid } = this.viewer.scene.globe;
                const line = [];
                entitie.polyline.positions._value.forEach((position) => {
                    const cartographic = ellipsoid.cartesianToCartographic(position);
                    line.push(Cesium.Math.toDegrees(cartographic.longitude));
                    line.push(Cesium.Math.toDegrees(cartographic.latitude));
                    line.push(height);
                });
                entitie.polyline.width = 20;
                entitie.polyline.material = new Cesium.PolylineGlowMaterialProperty({
                    glowPower : 0.2,
                    color : Cesium.Color.fromCssColorString("#15fcff").withAlpha(0.4),
                });
                PolylineTrailLinkMaterialPropertyAlong(Cesium);
                dataSource.entities.add({
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(line),
                        width: 20,
                        material: new Cesium.PolylineTrailLinkMaterialPropertyAlong(
                            Cesium.Color.fromCssColorString("#0402ff"),
                            20000,
                            '/static/images/texture/colors17.png'
                        ),
                    }
                })
                // CORNFLOWERBLUE DEEPSKYBLUE DODGERBLUE
                this.createWall(Cesium, line, Cesium.Color.fromCssColorString(color), 3000);
            });
        });
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
                entity.name = properties.name ? properties.name._value : "";
                entity.Type = 'village';
                // entity.polygon.material = Cesium.Color.fromCssColorString("#12327f").withAlpha(0.6);
                entity.polygon.material = new Cesium.ImageMaterialProperty({
                    image:'/static/images/texture/colors27.png',
                    // color: Cesium.Color.fromCssColorString("#0f0f2e").withAlpha(0.8),
                    transparent: true
                });;
                entity.polygon.height = 300;
                entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                entity.polygon.outline = false;
                entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.9);
                const { ellipsoid } = this.viewer.scene.globe;
                let line = [];
                entity.polygon.hierarchy._value.positions.forEach((position) => {
                    const cartographic = ellipsoid.cartesianToCartographic(position);
                    line.push(Cesium.Math.toDegrees(cartographic.longitude));
                    line.push(Cesium.Math.toDegrees(cartographic.latitude));
                    line.push(300);
                });
                entity.polyline = {
                    positions: entity.polygon.hierarchy._value.positions,
                    width: 20,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower : 0.2,
                            color : Cesium.Color.fromCssColorString("#8ed4ff").withAlpha(0.4),
                    }),
                    distanceDisplayCondition: entity.polygon.distanceDisplayCondition,
                    clampToGround: true,
                };
                dataSource.entities.add({
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(line),
                        width: 1,
                        // material: new Cesium.PolylineGlowMaterialProperty({
                        //     glowPower : 0.1,
                        //     color : Cesium.Color.fromCssColorString("#15fcff").withAlpha(0.4),
                        // }),
                        material: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.8),
                        // material: new Cesium.PolylineOutlineMaterialProperty({
                        //     color : Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.7),
                        //     outlineWidth : 7,
                        //     outlineColor : Cesium.Color.fromCssColorString("#000000").withAlpha(0.6)
                        // })
                    }
                })
                this.createWall(Cesium, line, Cesium.Color.fromCssColorString("#88ecff").withAlpha(0.9), 3000);
            }
            villages.forEach((item) => {
                this.addMarkBillboard(dataSource,{ ...item, near,far });
            })
        });
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
                let name = properties.name ? properties.name._value : "";
                entity.name = name;
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
                this.addLabel(entity,{ name, type: 'village', near, far })
            }
        });
    }

    // 图层：监听图层事件
    onAddLayer(data) {
        // 添加图标点
        const dataSource = new Cesium.CustomDataSource('main');
        this.viewer.dataSources.add(dataSource);
        data.list.forEach((item) => {
            if (item.positionType === 1 && item.point) {
                const img = Icons[data.type];
                let itemData = {
                    coordinate: {x: item.point.x, y: item.point.y, z: item.point.z},
                    image: img,
                    id: item.id,
                    name: item.name,
                    Type: data.type,
                    device: item.device,
                    far: 100000,
                    isLabel: true,
                };
                if (img.indexOf('mark_bg') !== -1) {
                    this.addMarkBillboard(dataSource, itemData);
                } else if (img.indexOf('circle') !== -1) {
                    this.addMarkBillboard(dataSource, itemData);
                } else {
                    this.addMark(dataSource, itemData);
                }
            }
        });
    }
}
