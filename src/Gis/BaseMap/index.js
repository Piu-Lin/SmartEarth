// import * as Cesium from 'cesium';
import LayerType from '../enum/LayerType';

export default class BaseMap {
  // 初始化地图
  initMap(mapId, isMars3d) {
    let tp = null;
    // 判断config.js文件中的CUSTOM_URL是否存在三维地貌DEM  CUSTOM_DEM_URL
    if (CUSTOM_URL.CUSTOM_DEM_URL) {
      // Cesium地形提供，通过传入的URL
      tp = new Cesium.CesiumTerrainProvider({
        url: CUSTOM_URL.CUSTOM_DEM_URL,
      });
    }
    // 创建地图
    const viewer = new Cesium.Viewer(mapId, {
      terrainProvider: tp,
      fullscreenButton: false, // 是否显示全屏控件
      geocoder: false, // 是否显示地名查找控件
      homeButton: false, // 是否显示Home控件
      navigationHelpButton: false, // 是否显示帮助信息控件
      sceneModePicker: false, // 是否显示投影方式控件
      baseLayerPicker: false, // 是否显示图层选择控件
      timeline: true, // 是否显示时间线控件
      animation: true, // 是否显示左下角的动画控件
      infoBox: false,
      selectionIndicator: false,
      imageryProvider: false,
      sceneMode: Cesium.SceneMode.SCENE3D, // 初始场景模式为三维
    });
    viewer.clock.shouldAnimate = true;
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.enableLighting = true; // 是否显示太阳状态
    this.viewer = viewer;
    // 隐藏logo
    viewer.cesiumWidget.creditContainer.style.display = 'none';
    // 去掉双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );
    // 去掉单击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    if (isMars3d) {
      this.map = new mars3d.Map(viewer, {
        control: {
          contextmenu: {hasDefault: false} // 右键菜单
        }
      });
    }
  }

  // 二三维切换
  setSceneMode(boo) {
    if (boo) {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    } else {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    }
  }

  // 设置图层透明度
  setImageryLayersAlpha(alpha) {
    this.viewer.imageryLayers._layers.forEach((layer) => {
      layer.alpha = alpha;
    })
  }

  // 添加底图
  addImageryProvider(type) {
    this.addTemplateImageLayer(LayerType.DARK, BASEMAPS_URL, false);
    this.addTemplateImageLayer(LayerType.ARCGIS_IMG, ARCGIS_IMG, false, 17);
    this.addTemplateImageLayer(LayerType.BAIDU_IMG, BAIDU_IMG, false, 17);
    this.addTemplateImageLayer(LayerType.BAIDU_DARK, BAIDU_DARK, false, 17);
    this.addTdtLayer(LayerType.TDT_VEC, false);
    this.addTdtLayer(LayerType.TDT_CVA, false);
    this.addTdtLayer(LayerType.TDT_IMG, false);
    this.addTdtLayer(LayerType.TDT_CIA, false);
    this.addTdtLayerDARK(LayerType.TDT_DARK, false);
    this.setImageryProviderVisible(type);
  }

  // 设置底图显隐
  setImageryProviderVisible(type) {
    this.viewer.imageryLayers._layers.forEach((layer) => {
      if (layer.imageryProvider.name === type) {
        layer.show = true;
      } else if (layer.imageryProvider.name === LayerType.TDT_IMG
        | layer.imageryProvider.name === LayerType.TDT_CIA
        | layer.imageryProvider.name === LayerType.TDT_VEC
        | layer.imageryProvider.name === LayerType.TDT_CVA
        | layer.imageryProvider.name === LayerType.DARK
        | layer.imageryProvider.name === LayerType.TDT_DARK
        | layer.imageryProvider.name === LayerType.ARCGIS_IMG
        | layer.imageryProvider.name === LayerType.BAIDU_IMG
        | layer.imageryProvider.name === LayerType.BAIDU_DARK) {
        layer.show = false;
      }
    })
  }

  // 设置底图显隐
  setImageryProvider(type) {
    this.viewer.imageryLayers._layers.forEach((layer) => {
      if (layer.imageryProvider.name === type) {
        layer.show = false;
      }
    })
  }

  // 设置底图显隐
  setImageryProviderTrue(type) {
    this.viewer.imageryLayers._layers.forEach((layer) => {
      if (layer.imageryProvider.name === type) {
        layer.show = true;
      }
    })
  }

  // 添加天地图图层
  addTdtLayer(name, visible = false) {
    let url = null;
    switch (name.toUpperCase()) {
      case LayerType.TDT_IMG:
        url = TIANDITU_IMG_MAP_URL;
        break;
      case LayerType.TDT_CIA:
        url = TIANDITU_CIA_MAP_URL;
        break;
      case LayerType.TDT_VEC:
        url = TIANDITU_VEC_MAP_URL;
        break;
      case LayerType.TDT_CVA:
        url = TIANDITU_CVA_MAP_URL;
        break;
      default:
        break;
    }
    const imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
      url,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      layer: name,
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible', // 使用谷歌的瓦片切片方式
      maximumLevel: 18,
      minimumLevel: 1,
    });
    imageryProvider.name = name;
    imageryProvider.show = visible;
    this.viewer.imageryLayers.addImageryProvider(imageryProvider);
  }

  // 添加天地图图层 设置为黑色
  addTdtLayerDARK(name, visible = false) {
    const imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: TIANDITU_VEC_MAP_URL,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      layer: name,
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
      maximumLevel: 18,
      minimumLevel: 1,
    });
    imageryProvider.name = name;
    imageryProvider.show = visible;
    let imagery = this.viewer.imageryLayers.addImageryProvider(imageryProvider);
    imagery.hue = 3;
    imagery.show = visible;
    imagery.contrast = -1.2;
  }

  // 添加UrlTemplateImageryProvider影像图层
  addTemplateImageLayer(name, url, visible = false, maximumLevel = 18) {
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url,
      minimumLevel: 1,
      maximumLevel: maximumLevel,
    });
    imageryProvider.name = name;
    imageryProvider.show = visible;
    this.viewer.imageryLayers.addImageryProvider(imageryProvider);
  }
}
