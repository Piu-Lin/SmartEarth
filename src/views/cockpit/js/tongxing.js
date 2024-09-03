import {
  twoline2satrec, gstime, eciToGeodetic,
  propagate,
  degreesLong
} from 'satellite.js';
import {reactive} from "vue";
import {ElMessage} from "element-plus";

// import LCesiumApi from "@lib/main";

export function leidaAndweixingTongxin(viewer, bigScreenMap) {
  let start = new Cesium.JulianDate;
  let stop = new Cesium.JulianDate;
  const communicationRange = 9580000;
  const time = new Date()
  let max = time.getTime()
  let year = 31622400000;
  let min = max - year;
  const satellites = new Cesium.CustomDataSource("satellite");
  const polylines = new Cesium.CustomDataSource("statelliteLine");
  const radars = new Cesium.CustomDataSource("radar");
  const Connection = new Cesium.CustomDataSource("connection");
  let Obj = {};
  const showFlyObject = {};
  let obj = {}
  const radarpoints = [
    {id: 'radar1', lon: 104, lat: 34, radius: 300000},
    {id: 'radar2', lon: -100, lat: 55, radius: 300000},
    {id: 'radar3', lon: 109.70841, lat: 19.365791, radius: 300000},
  ];
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  //设置时间轴
  setTimeline(viewer, start, stop, min, max);
  //读取卫星分布两行数据
  const nowTime = time.getTime()
  fetch("/static/json/weixingGuiji.json").then(res => res.json()).then(data => {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        const satrec = twoline2satrec(element.data[0], element.data[1]);
        const positionAndVelocity = propagate(satrec, time);
        const positionEci = positionAndVelocity.position;
        obj[key] = {
          country: element.country,
          times: [],
          positions: []
        };
        let lon, lat, alt;
        //一年365天 一天为间隔
        for (let index = min; index <= nowTime; index = index + 86400000) {
          const gmst = gstime(new Date(index));
          const positionGd = eciToGeodetic(positionEci, gmst);
          lon = positionGd.longitude;
          lat = positionGd.latitude;
          alt = positionGd.height;
          obj[key].times.push(index);
          obj[key].positions.push([degreesLong(lon), degreesLong(lat), alt]);
        }
      }
    }
    computeCirclularFlight(obj, true, satellites, polylines, viewer, Connection);
  })
  //添加点击事件
  addPick(handler, viewer);
  //添加雷达
  radarpoints.forEach(i => {
    createRadar(i.id, i.lon, i.lat, i.radius, radars, viewer);
  })
  //添加过境扫描;(viewerasany).
  viewer.scene.postRender.addEventListener(function (delta) {
    computeRange(showFlyObject, Connection, communicationRange, satellites, radars, viewer);
  });
}

function setTimeline(viewer, start, stop, min, max) {
  start = Cesium.JulianDate.fromDate(new Date(min));  // 获取当前时间 这不是国内的时间
  start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate());  // 添加八小时，得到我们东八区的北京时间
  stop = Cesium.JulianDate.fromDate(new Date(max));  // 设置一个结束时间，意思是360秒之后时间结束
  viewer.clock.startTime = start.clone();   // 给cesium时间轴设置开始的时间，也就是上边的东八区时间
  viewer.clock.stopTime = stop.clone();     // 设置cesium时间轴设置结束的时间
  viewer.clock.currentTime = start.clone(); // 设置cesium时间轴设置当前的时间
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;  // 时间结束了，再继续重复来一遍
  //时间变化来控制速度 // 时间速率，数字越大时间过的越快
  viewer.clock.multiplier = 1;
  //给时间线设置边界
  viewer.zoomTo(start, stop);
}

/**
 * 计算圆周飞行
 * @param source
 * @param panduan
 * @returns {*}
 */
function computeCirclularFlight(arr, hasLine, satellites, polylines, viewer, Connection) {
  for (const key in arr) {
    if (Object.prototype.hasOwnProperty.call(arr, key)) {
      const element = arr[key];
      const property = new Cesium.SampledPositionProperty();
      const length = element.positions.length;
      const positions = [];
      let p, t
      for (let index = 0; index < length; index++) {
        p = element.positions[index];
        t = element.times[index];
        property.addSample(Cesium.JulianDate.addHours(Cesium.JulianDate.fromDate(new Date(t)), 8, new Cesium.JulianDate()), Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]));
        positions.push(...element.positions[index])
      }
      satellites.entities.add({
        id: key,
        model: {
          uri: element.country === 'US' ? '/static/model/weixing.glb'
            : element.country === 'PRC' ? '/static/model/weixing.glb' : '/static/model/weixing.glb',
          minimumPixelSize: 32
        },
        position: property,
      });
      if (hasLine) {
        polylines.entities.add({
          id: key,
          polyline: {
            width: 1,
            material: Cesium.Color.BLUE.withAlpha(.5),
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions)
          }
        })
      }
    }
  }
  viewer.dataSources.add(satellites);
  viewer.dataSources.add(polylines);
  viewer.dataSources.add(Connection);
  viewer.flyTo(satellites);
}

/**
 * 点击事件
 * @param handler
 */
function addPick(handler, viewer) {
  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject)) {
      console.log(pickedObject.id.id, "pickedObject.id.id");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function createRadar(id, lon, lat, radius, radars, viewer) {
  radars.entities.add({
    id: id,
    model: {
      uri: '/static/model/leida.glb',
      minimumPixelSize: 32,
    },
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
  })
  viewer.dataSources.add(radars)
  viewer.flyTo(radars);
  // new LCesiumApi.RadarPrimitive({
  //     radius: radius,
  //     stackPartitions: 10,
  //     slicePartitions: 10,
  //     stackDegrees: {
  //         x: 0,
  //         y: 90,
  //     },
  //     sliceDegrees: {
  //         x: 0,
  //         y: 360,
  //     },
  //     color: Cesium.Color.GREEN.withAlpha(0.2),
  //     lineColor: Cesium.Color.RED,
  //     scanColor: Cesium.Color.YELLOW.withAlpha(0.2),
  //     scanLineColor: Cesium.Color.RED,
  //     scene: viewer.scene,
  //     center: Cesium.Cartesian3.fromDegrees(lon, lat),
  //     scanSpeed: 5000,
  //     show: true,
  //     scan: true,
  // });
}

/**
 * 计算范围
 */
function computeRange(showFlyObject, Connection, communicationRange, satellites, radars, viewer) {

  satellites.entities.values.forEach(i => {
    radars.entities.values.forEach(j => {
      const po1 = i.position?.getValue(viewer.clock.currentTime)
      // 用cesium原生方法po1转为笛卡尔坐标
      const po2 = j.position?.getValue(viewer.clock.currentTime)
      if (po1 && po2) {
        const len = getDistanceFromCartesian3(po1, po2)
        // console.log(len , communicationRange,'len')
        if (len <= communicationRange) {
          if (showFlyObject[`${i.id}-${j.id}`]) {
            showFlyObject[`${i.id}-${j.id}`].show = true
            showFlyObject[`${i.id}-${j.id}`].po1 = degreesFromCartesian(po1)
            showFlyObject[`${i.id}-${j.id}`].po2 = degreesFromCartesian(po2)
          } else {
            showFlyObject[`${i.id}-${j.id}`] = {
              entity: null,
              show: true,
              po1: degreesFromCartesian(po1),
              po2: degreesFromCartesian(po2)
            }
          }
        } else {
          if (showFlyObject[`${i.id}-${j.id}`]) showFlyObject[`${i.id}-${j.id}`].show = false
        }
      }
    })
  })

  setLine(Connection, showFlyObject)
}


/**
 * 设置线
 */
function setLine(Connection, showFlyObject) {
  for (const key in showFlyObject) {
    if (Object.prototype.hasOwnProperty.call(showFlyObject, key)) {
      const element = showFlyObject[key];
      if (element.entity === null) element.entity = createFlyLine(key, Connection, showFlyObject);
      element.entity.show = element.show
    }
  }
}

const state = reactive({
  speed: 2000
})
export default state
/**
 * 创建飞线
 * @param id
 * @returns {Entity}
 */
let line

function createFlyLine(id, Connection, showFlyObject) {
  if (line !== null) {
    Connection.entities.remove(line)
  }
  var material = new Cesium.PolylineTrailLinkMaterialPropertyAlong(Cesium.Color.YELLOW, state.speed, '/static/images/texture/colors16.png');
  line = Connection.entities.add({
    id: id,
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        return Cesium.Cartesian3.fromDegreesArrayHeights([
          showFlyObject[id].po1.longitude,
          showFlyObject[id].po1.latitude,
          showFlyObject[id].po1.height,
          showFlyObject[id].po2.longitude,
          showFlyObject[id].po2.latitude,
          showFlyObject[id].po2.height,
        ])
      }, false),
      width: 8,
      material
    }
  })
  return line;
}


// 定义 getDistanceFromCartesian3 方法
function getDistanceFromCartesian3(po1, po2) {
  // 检查输入参数是否为 Cesium.Cartesian3 实例
  if (!(po1 instanceof Cesium.Cartesian3) || !(po2 instanceof Cesium.Cartesian3)) {
    throw new Error("Both parameters must be instances of Cesium.Cartesian3");
  }

  // 计算并返回距离
  const distance = Cesium.Cartesian3.distance(po1, po2);
  return distance;
}

// 定义 degreesFromCartesian 方法
function degreesFromCartesian(po1) {
  // 检查输入参数是否为 Cesium.Cartesian3 实例
  if (!(po1 instanceof Cesium.Cartesian3)) {
    throw new Error("Parameter must be an instance of Cesium.Cartesian3");
  }

  // 将 Cartesian3 转换为 Cartographic
  const cartographic = Cesium.Cartographic.fromCartesian(po1);

  // 将弧度转换为度
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  // 返回包含经度、纬度、高度的对象
  return {
    longitude: longitude,
    latitude: latitude,
    height: height
  };
}

//增加发射速度
export function signalAdd() {
  state.speed -= 500
  if (state.speed === 500) {
    state.speed = 500
    ElMessage.error('速度已达最快')
  }
}

//减发射速度
export function signalReduce() {
  state.speed += 500
  if (state.speed === 5000) {
    state.speed = 5000
    ElMessage.error('速度已达最慢')
  }
}
