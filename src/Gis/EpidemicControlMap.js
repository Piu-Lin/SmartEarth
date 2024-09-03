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
        this.initBorder('/static/data/boundary.geojson',200, '#1064cc');
        // 初始化园区
        this.initBorder('/static/data/parkLine.geojson',100, '#6cc9cc');
        // 加载 3DTiles
        this.createTileset('/static/data/2/tileset.json', 'building2');
        // 初始化村界
        this.initVillage('/static/data/boundaryVillageLine.geojson',6000,2000000);
        // 初始化网格
        this.initGrid('/static/data/grid.geojson',0,6000);
        // 初始化点击事件
        this.initLeftClick();
        // 初始化地图气泡
        this.initMapToolTip();
        // 添加影像
        this.addImageryProvider('DARK');
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
        // this.addPrimitive();
    }

    addPrimitive(){
        let waterPrimitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray([70, 40, 150, 50, 131, 10, 80, 10])
                    ),
                    // perPositionHeight: true//注释掉此属性水面就贴地了
                    height: 100
                })
            }),
            // 可以设置内置的水面shader
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                vertexShaderSource: 'attribute vec3 position3DHigh;' +
                    'attribute vec3 position3DLow;' +
                    'attribute vec2 st;' +
                    'attribute float batchId;' +
                    'varying vec3 v_positionMC;' +
                    'varying vec3 v_positionEC;' +
                    'varying vec3 v_positionWC;' +
                    'varying vec2 v_st;' +
                    'void main()' +
                    '{' +
                    'vec4 p = czm_computePosition();' +
                    'v_positionMC = position3DHigh + position3DLow;' +
                    'v_positionWC = czm_model * v_positionMC;' +
                    'v_positionPC = czm_modelView * v_positionMC;\
                    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;\
                    v_st = st;\
                    gl_Position = czm_modelViewProjectionRelativeToEye * p;}',
                fragmentShaderSource: 'precision highp float;\
                    varying vec3 v_positionMC;\
                    varying vec3 v_positionEC;\
                    varying vec3 v_positionWC;\
                    varying vec2 v_st;\
                    void main(void) {\
                    czm_materialInput materialInput;\
                    vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\
                    materialInput.s = v_st.s;\
                    materialInput.st = v_st;\
                    materialInput.str = vec3(v_st, 0.0);\
                    materialInput.normalEC = normalEC;\
                    materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\
                    vec3 positionToEyeEC = -v_positionEC;\
                    materialInput.positionToEyeEC = positionToEyeEC;\
                    czm_material material = czm_getMaterial(materialInput);\
                    gl_FragColor = czm_phong(normalize(positionToEyeEC), material);\
                    }'
            })
        });
        this.viewer.scene.primitives.add(waterPrimitive);
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
                const name = properties.name ? properties.name._value : "";
                entity.polyline.material = Cesium.Color.fromCssColorString("#15fcff").withAlpha(0.6);
                entity.name = name;
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
                const name = properties.name ? properties.name._value : "";
                const info = properties.info ? properties.info._value : "";
                entity.polygon.material = Cesium.Color.fromCssColorString(
                    randomColor()
                ).withAlpha(0.5);
                entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
                    near || 0,
                    far || 160000
                );
                entity.name = name;
                entity.Type = "网格";
                entity.info = info;
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
