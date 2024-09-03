import pickGloble from "../pickGloble";
import CursorStyle from "@/Gis/enum/CursorStyle";

let handler = {};
let viewerPoint = {};
let targetPoint = {};
let pointPosition = [];
let line = null;
let pointLayer = null;
let lineLayer = null;
let dynamicLine = null;

// 通视分析入口函数
const lineSight = function (viewer) {
    viewer._element.style.cursor = CursorStyle.CROSSHAIR;
    let i = 0;
    pointLayer = new Cesium.CustomDataSource("LineSightPointLayer");
    lineLayer = new Cesium.CustomDataSource("LineSightLineLayer");
    dynamicLine = new Cesium.CustomDataSource("polygonLayer");
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        i++;
        if (i === 1) {
            let startPoint = pickGloble(viewer, movement.position);
            viewerPoint = increaseHeight(startPoint, 0.1); //调整高度离地20cm
            addPoint(viewer, viewerPoint, Cesium.Color.GREEN);
            viewer.dataSources.add(pointLayer);
            pointPosition.push(viewerPoint);
            handler.setInputAction(function (movement) {
                let tmpEndPoint = pickGloble(viewer, movement.endPosition);
                targetPoint = increaseHeight(tmpEndPoint, 0.1); //调整高度离地20cm
                if (tmpEndPoint) {
                    // 如果定义了对象，则返回true，否则返回false。
                    if (!Cesium.defined(line)) {
                        pointPosition.push(targetPoint);
                        // 这是drawLine函数positions属性的回调函数，含义就是当positions属性发生改变时，重新绘制线
                        let dynamicPositions = new Cesium.CallbackProperty(function () {
                            return pointPosition;
                        }, false);
                        // 把回调函数赋值给drawLine函数positions属性
                        line = drawLine(viewer, dynamicPositions, Cesium.Color.YELLOW, "dynamicLine");
                    } else {
                        pointPosition.pop();
                        pointPosition.push(targetPoint);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        }
        if (i === 2) {
            //鼠标点击第二次时获取结束坐标
            i = 0;
            let endPoint = pickGloble(viewer, movement.position);
            targetPoint = increaseHeight(endPoint, 0.1); //调整高度离地20cm
            addPoint(viewer, targetPoint, Cesium.Color.GREEN);
            viewer.dataSources.remove(dynamicLine);
            visibleAnalysis(viewer);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// 增加高度
function increaseHeight(cartesian, value) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude);
    let height =
        cartographic.height > 0 ? cartographic.height + value : 0 + value;
    let cartesian1 = new Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
    );
    return cartesian1;
}

// 添加点
function addPoint(viewer, pointPosition, pointColor) {
    let data = {
        position: pointPosition,
        point: {
            color: pointColor, //颜色
            pixelSize: 10, //点大小
        },
    };
    pointLayer.entities.add(data);
}

// 绘制线
function drawLine(viewer, pointPosition, pointColor, layerName) {
    let data = {
        polyline: {
            positions: pointPosition,
            width: 3,
            material: pointColor,
        },
    };
    if(layerName === "dynamicLine") {
        dynamicLine.entities.add(data);
        return viewer.dataSources.add(dynamicLine);
    }else if(layerName === "lineLayer") {
        lineLayer.entities.add(data);
    }
};

// 处理交互点
function showIntersection(viewer, result, targetPoint, viewerPoint) {
    // 如果是场景模型的交互点，排除交互点是地球表面
    if (result !== undefined && result !== null) {
        drawLine(viewer, [result.position, viewerPoint], Cesium.Color.GREEN, "lineLayer"); // 可视区域
        drawLine(viewer, [result.position, targetPoint], Cesium.Color.RED, "lineLayer"); // 不可视区域
    } else {
        drawLine(viewer, [viewerPoint, targetPoint], Cesium.Color.BLUE, "lineLayer");
    }
    viewer.dataSources.add(lineLayer);
    if (JSON.stringify(handler) !== "{}") {
        handler.destroy();
        handler = {};
    }
    viewer._element.style.cursor = CursorStyle.DEFAULT;
};

// 通视分析，计算射线的方向，目标点left 视域点right
function visibleAnalysis(viewer) {
    let direction = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(
            targetPoint,
            viewerPoint,
            new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
    );
    // 建立射线
    let ray = new Cesium.Ray(viewerPoint, direction);
    // let result = viewer.scene.globe.pick(ray, viewer.scene); // 计算交互点，返回第一个
    let result = viewer.scene.pickFromRay(ray, []);
    showIntersection(viewer, result, targetPoint, viewerPoint);
};

// 清除图层
const removeLayer = function (viewer) {
    viewer.dataSources.remove(pointLayer);
    viewer.dataSources.remove(lineLayer);
    pointLayer = null;
    lineLayer = null;
    line = null;
    handler = {};
    viewerPoint = {};
    targetPoint = {};
    pointPosition = [];
    dynamicLine = null;
}

export { lineSight, removeLayer};
