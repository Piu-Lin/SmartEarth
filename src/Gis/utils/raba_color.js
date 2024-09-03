

// rgba => cesium.color
export function handleColorType(color) {
    color = color.replace(/rgba\(/, "");
    color = color.replace(/\)/, "");
    let colorArr = color.split(",");
    let colorArr2 = new Array(colorArr.length).fill(0);
    for (let i = 0; i < colorArr.length - 1; i++) {
        colorArr2[i] = +colorArr[i] / 255;
    }
    colorArr2[colorArr.length - 1] = +colorArr[colorArr.length - 1];
    return new Cesium.Color(...colorArr2);
}

let idValue = {};

export function recursion(items, id) {
    items.forEach((item) => {
        if (item.id === id) {
            idValue = item;
            return idValue;
        }
        if (item.children.length > 0) {
            recursion(item.children, id);
        }
    });
    return idValue;
}


// 增加高度
export function increaseHeight(cartesian, value) {
    // 世界坐标转地理坐标（弧度）
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    // 弧度转换为度
    let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude);

    // 增加高度
    let height =
        cartographic.height > 0 ? cartographic.height + value : 0 + value;
    // 从以度为单位的经度和纬度值返回Cartesian3位置。
    let cartesian1 = new Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
    );
    return cartesian1;
}


