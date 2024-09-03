<template>
  <div>
    <div class="full-container" id="cesiumContainer"/>
  </div>
</template>
<script setup>
import {ref, reactive, onMounted} from "vue";
// import * as Cesium from "cesium";
import * as turf from "@turf/turf";

var viewer = null
var saveLevel = 1;  //当前视角层数
var dealArr = []    //需要处理的数组
var gridArr = [];   //网格数组
const cesiumGather = reactive({
  cesiumViewer: null, //初始化地图
  //   cesiumPointList: [], //点位集合
  //   cesiumPointAddList: [], //点位集合
  //   pointVisible: false, //控制【添|编标注】弹窗
  //   pointOptions: [

  //   ],
  //   pointForm: {
  //     title: "标注名称",
  //     point: null,
  //     image: siteIcon4,
  //   },
  //   popVisible: false,
  //   pointTitle: "",
  //   drawHandler: null, //事件
});
onMounted(() => {
  const tianDiTuToken = "5571cb32eeb8596f97fa9790172addab";
  Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTQxMGIzNC04N2M0LTQ0MDUtOTdlYi02ZGE0NTgyZGVjMzAiLCJpZCI6MzA5ODUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTQ2OTQ5NzN9.JbUqIgKO92noy6B8zcYMdq8QygnMKM70RIdJZqAwwdk";
  // 服务负载子域
  const subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
  // 创建图层
  viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false, //是否创建动画小器件，左下角仪表
    timeline: true, //是否显示时间轴
    geocoder: false, //是否显示geocoder小器件，右上角查询按钮
    baseLayerPicker: false, //是否显示图层选择器
    fullscreenButton: false, //是否显示全屏按钮
    homeButton: true, //是否显示Home按钮
    infoBox: false, //是否显示信息框
    sceneModePicker: false, //是否显示3D/2D选择器
    scene3DOnly: false, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
    selectionIndicator: false, //是否显示选取指示器组件
    navigationHelpButton: false, //是否显示右上角的帮助按钮
    baselLayerPicker: false, // 将图层选择的控件关掉，才能添加其他影像数据
    shadows: true, //是否显示背影
    /*新增的*/
    shouldAnimate: true, // Enable animations
  });
  //   将图层挂载到window上
  window.cesiumViewer = viewer;
  // viewer.imageryLayers.addImageryProvider(
  //     new Cesium.WebMapTileServiceImageryProvider({
  //         //影像注记
  //         url: `http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=${tianDiTuToken}`,
  //         subdomains: subdomains,
  //         layer: "tdtCiaLayer",
  //         style: "default",
  //         format: "image/jpeg",
  //         tileMatrixSetID: "GoogleMapsCompatible",
  //         maximumLevel: 18,
  //     })
  // );
  //优化项--关闭相关特效
  viewer.scene.debugShowFramesPerSecond = false; //显示fps
  viewer.scene.moon.show = false; //月亮
  viewer.scene.fog.enabled = false; //雾
  viewer.scene.sun.show = false; //太阳
  viewer.scene.skyBox.show = false; //天空盒
  viewer.resolutionScale = 1.0; //画面细度，默认值为1.0
  //去除版权信息
  viewer._cesiumWidget._creditContainer.style.display = "none";
  //隐藏时间轴
  viewer.timeline.container.style.display = "none";
  // 设置缩放最小比例
  // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 250;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 122500000;

  // 禁止双击
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  // 将三维球定位到中国
  // viewer.camera.flyTo({
  //     destination: Cesium.Cartesian3.fromDegrees(108.09876, 37.200787, 1400000),
  //     duration: 1,
  // });
  // 将三维球定位到中国
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 17850000),
    orientation: {
      heading: Cesium.Math.toRadians(348.4202942851978),
      pitch: Cesium.Math.toRadians(-89.74026687972041),
      roll: Cesium.Math.toRadians(0),
    },
    complete: function callback() {
      // 定位完成之后的回调函数
    },
  });
  //
  const entities = viewer.entities;
  var wyoming = viewer.entities.add({
    name: 'Wyoming',
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        70, 60,
        80, 60,
        90, 60,
        100, 60,
        110, 60,
        120, 60,
        130, 60,
        140, 60,
        140, 0,
        130, 0,
        120, 0,
        110, 0,
        100, 0,
        90, 0,
        80, 0,
        70, 0,
      ]),
      height: 0,
      material: Cesium.Color.GREEN.withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.BLACK
    }
  });

  // viewer.zoomTo(wyoming);
  // wyoming.polygon.material = new Cesium.GridMaterialProperty({
  //     color: Cesium.Color.YELLOW,
  //     cellAlpha: 0.2,
  //     lineCount: new Cesium.Cartesian2(8, 8),
  //     lineThickness: new Cesium.Cartesian2(2.0, 2.0)
  // });

  // onPlotLatitudeLongitude(10, 10)
  // 抗锯齿
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    //判断是否支持图像渲染像素化处理
    viewer.resolutionScale = window.devicePixelRatio;
  }
  //开启抗锯齿
  viewer.scene.fxaa = true;
  viewer.scene.postProcessStages.fxaa.enabled = true;

  // 获取地图当前层级
  const handle3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  //监听鼠标滚轮事件
  handle3D.setInputAction(() => {
    var level = Math.ceil(viewer.camera.positionCartographic.height);
    let results = getHeightByLevel(level);
    // getViewExtend();
    getCenterPosition()
    let temp = 1;
    console.log(results, '---results');
    if (results < 3) {
      temp = 1
      if (saveLevel != temp) {
        saveLevel = temp;
        // viewer.entities.removeAll()
        // onPlotLatitudeLongitude(10, 10)
      }

    } else if (results >= 4 && results < 7) {
      temp = 2
      if (saveLevel != temp) {
        saveLevel = temp;
        // viewer.entities.removeAll()
        // onPlotLatitudeLongitude(5, 5)
        cuttingLatitudeLongitude()
      }
    } else if (results >= 7 && results < 10) {
      temp = 3
      if (saveLevel != temp) {
        saveLevel = temp;
        // viewer.entities.removeAll()
        // onPlotLatitudeLongitude(1, 1)
      }
    } else if (results >= 10 && results <= 16) {
      temp = 4
      if (saveLevel != temp) {
        saveLevel = temp;
        // viewer.entities.removeAll()
        // onPlotLatitudeLongitude(0.05, 0.05)
      }
    }
  }, Cesium.ScreenSpaceEventType.WHEEL);

  // new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  //     .setInputAction((movement) => {
  //         console.log(movement)
  //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (event) {
    let cartesian = viewer.scene.pickPosition(event.position);
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
    let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
    let alt = cartographic.height; // 高度
    let coordinate = {
      longitude: Number(lng.toFixed(6)),
      latitude: Number(lat.toFixed(6)),
      altitude: Number(alt.toFixed(2))
    };
    console.log(coordinate);
    // console.log(gridArr, '---gridArr');
    // gridArr.map(v => {
    //     console.log(v,'---v');
    // })

    var pt = turf.point([coordinate.longitude, coordinate.latitude]);
    for (let i = 0; i < dealArr.length; i++) {
      var poly = turf.polygon([dealArr[i]]);
      if (turf.booleanPointInPolygon(pt, poly) == true) {
        const entities = viewer.entities;
        entities.add({
          name: '',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              dealArr[i][0][0],
              dealArr[i][0][1],
              dealArr[i][1][0],
              dealArr[i][1][1],
              dealArr[i][2][0],
              dealArr[i][2][1],
              dealArr[i][3][0],
              dealArr[i][3][1],
            ]),
            height: 0,
            material: Cesium.Color.YELLOW.withAlpha(0.5),
            outline: true,
            outlineColor: Cesium.Color.BLACK
          }
        });
      }
    }

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  let largePosition = [{
    label: '左上',
    longitude: 70,
    latitude: 60,
  }, {
    label: '右上',
    longitude: 140,
    latitude: 60,
  }, {
    label: '右下',
    longitude: 140,
    latitude: 0,
  }, {
    label: '左下',
    longitude: 60,
    latitude: 0,
  }];

  for (let n = largePosition[0].latitude; n > largePosition[2].latitude; n = n - 10) {
    let temp = [];
    for (let m = largePosition[0].longitude; m < largePosition[1].longitude; m = m + 10) {
      let cellArr = [];
      cellArr.push({
        longitude: m,
        latitude: n,
      })
      cellArr.push({
        longitude: m + 10,
        latitude: n,
      })
      cellArr.push({
        longitude: m + 10,
        latitude: n - 10,
      })
      cellArr.push({
        longitude: m,
        latitude: n - 10,
      })

      temp.push(cellArr)
    }
    gridArr.push(temp)
  }
  // console.log(gridArr, '---temp');

})

// 获取level层
const getHeightByLevel = (level) => {
  var A = 40487.57;
  var B = 0.00007096758;
  var C = 91610.74;
  var D = -40467.74;
  return Math.round(D + (A - D) / (1 + Math.pow(level / C, B)));
};

// 绘制经纬度
const onPlotLatitudeLongitude = (e1, e2) => {
  const entities = viewer.entities;
  for (let longitude = -180; longitude <= 180; longitude += e1) {
    let text = "";
    if (longitude === 0) {
      text = "0";
    }
    text += longitude === 0 ? "" : "" + longitude + "°";
    if (longitude === -180) {
      text = "";
    }
    entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, 0),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          longitude,
          -90,
          longitude,
          0,
          longitude,
          90,
        ]),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
  let langS = [];
  for (let longitude = -180; longitude <= 180; longitude += 5) {
    langS.push(longitude);
  }
  let arr = [];
  //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
  for (let lat = -80; lat <= 80; lat += e2) {
    let text = "";
    text += "" + lat + "°";
    if (lat === 0) {
      text = "";
    }
    arr.push(lat)
    entities.add({
      position: Cesium.Cartesian3.fromDegrees(0, lat),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(
            langS.map((long) => {
              return [long, lat].join(",");
            }).join(",").split(",").map((item) => Number(item))
        ),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
  // 二维数组
  let collectionArr = []
  for (let i = 0; i < langS.length; i++) {
    for (let n = 0; n < arr.length; n++) {
      // collectionArr.push([langS[i], arr[n]]);
    }
  }
  // console.log(collectionArr, '---collection');

}

const cuttingLatitudeLongitude = () => {
  const entities = viewer.entities;
  for (let longitude = 140; longitude >= 70; longitude -= 10) {
    let text = "";
    // if (longitude === 0) {
    //     text = "0";
    // }
    // text += longitude === 0 ? "" : "" + longitude + "°";
    // if (longitude === -180) {
    //     text = "";
    // }
    // console.log(longitude,'---longitude');
    entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, 0),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          longitude,
          60,
          longitude,
          0,
        ]),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
  let langS = [];
  for (let longitude = 140; longitude >= 70; longitude -= 10) {
    langS.push(longitude);
  }
  // console.log(langS,'---langS');
  let arr = [];
  //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
  for (let lat = 60; lat >= 0; lat = lat -= 10) {
    let text = "1";
    // text += "" + lat + "°";
    // if (lat === 0) {
    //     text = "";
    // }
    arr.push(lat)
    // console.log(arr, '---arr');
    // console.log(text, '---text');

    entities.add({
      position: Cesium.Cartesian3.fromDegrees(0, lat),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(
            langS.map((long) => {
              return [long, lat].join(",");
            }).join(",").split(",").map((item) => Number(item))
        ),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }

  let almost = gridArr.length * gridArr[0].length

  let tempArr = []
  gridArr.forEach(v1 => {
    // console.log(v,'---v');
    v1.forEach(v2 => {
      let t = [];
      t = v2.map(v3 => {
        return [v3.longitude, v3.latitude]
      })
      t.push(t[0])
      // console.log(t, '---t');
      tempArr.push(t)
      // console.log(dealArr, '---dealArr');
    })
  })
  if (tempArr.length == almost) {
    dealArr = tempArr;
  }
}

// 获取当前屏幕的可视区域的经纬度【2D和3D】
// const getViewExtend = () => {
//   let params = {};
// //    viewer = cesiumGather.cesiumViewer;
//   let extend = viewer.camera.computeViewRectangle();
//   if (typeof extend === "undefined") {
//     //2D下会可能拾取不到坐标，extend返回undefined,所以做以下转换
//     let canvas = window.cesiumViewer.scene.canvas;
//     let upperLeft = new Cesium.Cartesian2(0, 0); //canvas左上角坐标转2d坐标
//     let lowerRight = new Cesium.Cartesian2(
//       canvas.clientWidth,
//       canvas.clientHeight
//     ); //canvas右下角坐标转2d坐标
//     let ellipsoid = window.cesiumViewer.scene.globe.ellipsoid;
//     let upperLeft3 = window.cesiumViewer.camera.pickEllipsoid(
//       upperLeft,
//       ellipsoid
//     ); //2D转3D世界坐标

//     let lowerRight3 = window.cesiumViewer.camera.pickEllipsoid(
//       lowerRight,
//       ellipsoid
//     ); //2D转3D世界坐标

//     let upperLeftCartographic =
//       window.cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
//         upperLeft3
//       ); //3D世界坐标转弧度
//     let lowerRightCartographic =
//       window.cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
//         lowerRight3
//       ); //3D世界坐标转弧度

//     let minx = Cesium.Math.toDegrees(upperLeftCartographic.longitude); //弧度转经纬度
//     let maxx = Cesium.Math.toDegrees(lowerRightCartographic.longitude); //弧度转经纬度

//     let miny = Cesium.Math.toDegrees(lowerRightCartographic.latitude); //弧度转经纬度
//     let maxy = Cesium.Math.toDegrees(upperLeftCartographic.latitude); //弧度转经纬度
//     params.minx = minx;
//     params.maxx = maxx;
//     params.miny = miny;
//     params.maxy = maxy;
//   } else {
//     //3D获取方式
//     params.maxx = Cesium.Math.toDegrees(extend.east);
//     params.maxy = Cesium.Math.toDegrees(extend.north);
//     params.minx = Cesium.Math.toDegrees(extend.west);
//     params.miny = Cesium.Math.toDegrees(extend.south);
//   }
//   console.log(params, "---------------ssss-----");
//   return params; //返回屏幕所在经纬度范围
// };

// 获取当前地图中心的经纬度
const getCenterPosition = () => {
  let centerResult = viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(
          viewer.canvas.clientWidth / 2,
          viewer.canvas.clientHeight / 2,
      ),
  )
  let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerResult);
  let curLongitude = (curPosition.longitude * 180) / Math.PI;
  let curLatitude = (curPosition.latitude * 180) / Math.PI;
  // console.log(curLongitude, curLatitude, '---');
  // console.log(dealArr,'---dealArr');
  var pt = turf.point([curLongitude, curLatitude]);
  for (let i = 0; i < dealArr.length; i++) {
    var poly = turf.polygon([dealArr[i]]);
    if (turf.booleanPointInPolygon(pt, poly) == true) {
      if (saveLevel == 2) {
        console.log(dealArr[i], '---dealArr[i]');
        let startArr = [];
        startArr = JSON.parse(JSON.stringify(dealArr[i]));
        startArr.forEach(v => {
          v[0] = v[0] - 20;
          v[1] = v[1] + 20;
        })

        console.log(startArr, '---startArr');
        let surroundingsArr = []
        // surroundingsArr[0] = dealArr[i]
        // surroundingsArr[0][0] = dealArr[i][0]
        console.log(surroundingsArr, '---surroundingsArr');
        splitAgain(dealArr[i])
        // for (let k = 0; k < 9; k++) {
        //     const element = array[k];
        // }
      }
    }
  }
  return {
    lon: curLongitude,
    lat: curLatitude,
  }
}

// 当前九宫格再分割
const splitAgain = (dealArr) => {
  const entities = viewer.entities;
  for (let longitude = dealArr[0][0]; longitude <= dealArr[1][0]; longitude += 1) {
    let text = "";
    entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, 0),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          longitude,
          dealArr[0][1],
          longitude,
          dealArr[2][1],
        ]),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
  let langS = [];
  for (let longitude = dealArr[0][0]; longitude <= dealArr[1][0]; longitude += 1) {
    langS.push(longitude);
  }
  // console.log(langS, '---langS');
  let arr = [];
  //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
  for (let lat = dealArr[0][1]; lat >= dealArr[2][1]; lat = lat -= 1) {
    let text = "";
    arr.push(lat)
    entities.add({
      position: Cesium.Cartesian3.fromDegrees(0, lat),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(
            langS.map((long) => {
              return [long, lat].join(",");
            }).join(",").split(",").map((item) => Number(item))
        ),
        width: 1.0,
        material: Cesium.Color.WHITE,
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
      },
    });
  }
}


</script>

<style lang="less" scoped></style>