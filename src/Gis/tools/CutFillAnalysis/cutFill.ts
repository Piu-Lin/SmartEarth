import * as turf from "@turf/turf";
import pickGloble from "../pickGloble";

let randomPointCount = 20;
let timeId: any;

export default async function computeCutAndFillVolumeVoronoi(
  pointArray: [],
  baseHeight: number,
  viewer: Cesium.viewer
): Promise<CutAndFillResult> {
  const result = new CutAndFillResult();
  //声明屏幕坐标数组
  const windowPositions: Cesium.Cartesian2[] = [];
  //先遍历一下多边形节点，获取最低高程点，作为基准高程
  //同时将Cartesian3转为屏幕坐标，存放在数组中
  pointArray.forEach((element) => {
    let wPoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      element.point
    );
    windowPositions.push(wPoint);
  });
  //构建泰森多边形的过程
  const bounds = getBounds(windowPositions);
  const points = turf.randomPoint(randomPointCount, {
    bbox: [bounds[0], bounds[1], bounds[2], bounds[3]], // 边界框
  });
  const mainPoly = Cartesian2turfPolygon(windowPositions);
  const voronoiPolygons = turf.voronoi(points, {
    bbox: [bounds[0], bounds[1], bounds[2], bounds[3]],
  });
  let i = 0;
  // let area = 0;
  //遍历泰森多边形
  for (let element of voronoiPolygons.features) {
    const intersectPoints = intersect(mainPoly, element.geometry);
    if (intersectPoints.length > 0) {
      // area += drawPolygon(viewer, intersectPoints);
      //计算每个多边形的面积和高度
      const cubeInfo = computeCubeInfo(intersectPoints, viewer);
      //低于基准面，填方
      if (baseHeight > cubeInfo.avgHeight) {
        result.fillVolume +=
          (baseHeight - cubeInfo.avgHeight) * cubeInfo.baseArea;
      } else {
        //高于基准面，挖方
        result.cutVolume +=
          (cubeInfo.avgHeight - baseHeight) * cubeInfo.baseArea;
      }
      result.maxHeight = Math.max(result.maxHeight, cubeInfo.maxHeight);
      result.minHeight = Math.min(result.minHeight, cubeInfo.minHeight);
      result.baseArea += cubeInfo.baseArea;
      result.avgHeight = cubeInfo.avgHeight;
    }
    i++;
    await computeProcess(i);
    clearTimeout(timeId);
  }
  // voronoiPolygons.features.forEach((element) => {
  //   const intersectPoints = intersect(mainPoly, element.geometry);
  //   if (intersectPoints.length > 0) {
  //     area += drawPolygon(viewer, intersectPoints);
  //     //计算每个多边形的面积和高度
  //     const cubeInfo = computeCubeInfo(intersectPoints, viewer);
  //     //低于基准面，填方
  //     if (baseHeight > cubeInfo.avgHeight) {
  //       result.fillVolume +=
  //         (baseHeight - cubeInfo.avgHeight) * cubeInfo.baseArea;
  //     } else {
  //       //高于基准面，挖方
  //       result.cutVolume +=
  //         (cubeInfo.avgHeight - baseHeight) * cubeInfo.baseArea;
  //     }
  //     result.maxHeight = Math.max(result.maxHeight, cubeInfo.maxHeight);
  //     result.minHeight = Math.min(result.minHeight, cubeInfo.minHeight);
  //     result.baseArea += cubeInfo.baseArea;
  //     result.avgHeight = cubeInfo.avgHeight;
  //   }
  //   i++;
  //   computeProcess(i).then((e) => {
  //     console.log(e);
  //   });
  // });
  return result;
}

// 计算进度
async function computeProcess(i: number) {
  return new Promise((res, rej) => {
    timeId = setTimeout(() => {
      let num = (i / randomPointCount) * 100;
      document.getElementById("myBar").innerHTML = num.toFixed(0).toString() + "%";
      document.getElementById("myBar").style.width = num.toFixed(0).toString() + "%";
      res("success");
    }, 1);
  });
}

function computeCubeInfo(
  positions: Cesium.Cartesian2[],
  viewer: Cesium.viewer
) {
  let worldPositions: Cesium.Cartographic[] = [];
  let tempPoints = [];
  let minHeight = Number.MAX_VALUE;
  let maxHeight = Number.MIN_VALUE;
  let sumHeight = 0.0;
  positions.forEach((element) => {
    const worldPosition = pickGloble(viewer, element);
    worldPositions.push(worldPosition); // 存放三维坐标
    const cartesian = Cesium.Cartographic.fromCartesian(worldPosition);
    let longitudeString = Cesium.Math.toDegrees(cartesian.longitude);
    let latitudeString = Cesium.Math.toDegrees(cartesian.latitude);
    let heightString = cartesian.height;
    tempPoints.push({
      lon: longitudeString,
      lat: latitudeString,
      hei: heightString,
    });
    minHeight = Math.min(minHeight, cartesian.height);
    maxHeight = Math.max(maxHeight, cartesian.height);
    sumHeight += cartesian.height;
  });
  const avgHeight = sumHeight / positions.length;
  const result = new CubeInfo();
  result.minHeight = minHeight;
  result.maxHeight = maxHeight;
  result.avgHeight = avgHeight;
  tempPoints.pop();
  worldPositions.pop();
  result.baseArea = calculateSpaceArea(tempPoints, worldPositions);
  return result;
}

//计算多边形面积
function calculateSpaceArea(points, positions) {
  let res = 0;
  //拆分三角曲面
  for (let i = 0; i < points.length - 2; i++) {
    let j = (i + 1) % points.length;
    let k = (i + 2) % points.length;
    let totalAngle = calculateAngle(points[0], points[j], points[k]);
    let dis_temp1 = calculateDistance(positions[j], positions[0]);
    let dis_temp2 = calculateDistance(positions[k], positions[0]);
    res += (dis_temp1 * dis_temp2 * Math.sin(totalAngle)) / 2;
  }
  return Math.abs(Number(res.toFixed(4)));
}

//两点之间距离
function calculateDistance(point1, point2) {
  let point1cartographic = Cesium.Cartographic.fromCartesian(point1);
  let point2cartographic = Cesium.Cartographic.fromCartesian(point2);
  /**根据经纬度计算出距离**/
  let geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1cartographic, point2cartographic);
  let s = geodesic.surfaceDistance;
  //返回两点之间的距离
  s = Math.sqrt(
    Math.pow(s, 2) +
      Math.pow(point2cartographic.height - point1cartographic.height, 2)
  );
  return s;
}

//计算角度
function calculateAngle(p1, p2, p3) {
  const RadiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  let bearing21 = calculateBearing(p2, p1);
  let bearing23 = calculateBearing(p2, p3);
  let angle = bearing21 - bearing23;
  if (angle < 0) {
    angle = Math.abs(angle);
  } else if (angle > 180) {
    angle = angle - 180;
  }
  return angle * RadiansPerDegree;
}

//方向
function calculateBearing(from, to) {
  const RadiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  const DegreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
  let lat1 = from.lat * RadiansPerDegree;
  let lon1 = from.lon * RadiansPerDegree;
  let lat2 = to.lat * RadiansPerDegree;
  let lon2 = to.lon * RadiansPerDegree;
  let angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  );
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  angle = angle * DegreesPerRadian; //角度
  return angle;
}

// 设置边界
function getBounds(points: Cesium.Cartesian2[]): number[] {
  let bounds: number[] = [];
  let left = Number.MAX_VALUE;
  let right = Number.MIN_VALUE;
  let top = Number.MAX_VALUE;
  let bottom = Number.MIN_VALUE;
  points.forEach((element) => {
    left = Math.min(left, element.x);
    right = Math.max(right, element.x);
    top = Math.min(top, element.y);
    bottom = Math.max(bottom, element.y);
  });
  bounds.push(left);
  bounds.push(top);
  bounds.push(right);
  bounds.push(bottom);
  return bounds;
}

function Cartesian2turfPolygon(
  positions: Cesium.Cartesian2[]
): turf.helpers.Polygon {
  var coordinates: number[][][] = [[]];
  positions.forEach((element) => {
    coordinates[0].push([element.x, element.y]);
  });
  coordinates[0].push([positions[0].x, positions[0].y]);
  const polygon = turf.polygon(coordinates);
  return polygon.geometry;
}

function intersect(
  poly1: turf.helpers.Polygon,
  poly2: turf.helpers.Polygon
): Cesium.Cartesian2[] {
  var intersection = turf.intersect(poly1, poly2);
  if (intersection?.geometry !== undefined) {
    return turfPloygon2CartesianArr(intersection?.geometry as turf.Polygon);
  } else {
    return [];
  }
}

function turfPloygon2CartesianArr(
  intersectPolygon: turf.helpers.Polygon
): Cesium.Cartesian2[] {
  var cartesianTwo: Cesium.Cartesian2[] = [];
  intersectPolygon.coordinates[0].forEach((element) => {
    cartesianTwo.push(new Cesium.Cartesian2(element[0], element[1]));
  });
  return cartesianTwo;
}

// 二纬坐标绘制面
function drawPolygon(viewer, cartesianArr) {
  let worlds = [];
  let tempPoints = [];
  cartesianArr.forEach((e) => {
    worlds.push(pickGloble(viewer, e));
    const cartesian = Cesium.Cartographic.fromCartesian(pickGloble(viewer, e));
    let longitudeString = Cesium.Math.toDegrees(cartesian.longitude);
    let latitudeString = Cesium.Math.toDegrees(cartesian.latitude);
    let heightString = cartesian.height;
    tempPoints.push({
      lon: longitudeString,
      lat: latitudeString,
      hei: heightString,
    });
    viewer.entities.add({
      position: pickGloble(viewer, e),
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE,
      },
    });
  });
  let area = calculateSpaceArea(tempPoints, worlds);
  viewer.entities.add({
    polygon: {
      hierarchy: worlds,
      perPositionHeight: false, //允许三角形使用点的高度
      material: Cesium.Color.fromRandom({
        alpha: 0.8,
      }),
      clampToGround: true,
    },
  });
  return area;
}

class CutAndFillResult {
  minHeight: number = Number.MAX_VALUE;
  maxHeight: number = Number.MIN_VALUE;
  cutVolume: number = 0.0;
  fillVolume: number = 0.0;
  avgHeight: number = 0.0;
  baseArea: number = 0.0;
}

class CubeInfo {
  minHeight: number = Number.MAX_VALUE;
  maxHeight: number = Number.MIN_VALUE;
  avgHeight: number = 0.0;
  baseArea: number = 0.0;
}
