export function gridDrawingFun(viewer) {
  let LineRGB = {'0': "", "1": "#33FFFF", "2": "#FF33FF"}
  let markk = 0
  const entities = viewer.entities;
  for (let pHeight = 0; pHeight < 1000000; pHeight += 500000) {
    markk += 1
    for (let lang = -180, level = 0; lang <= 180; lang += 10) {
      let text = "";
      if (lang === 0) {
        text = "p0";
      }
      text = "p" + level
      if (lang === -180) {
        text = "p0";
      }
      level += 1

      entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            lang,
            -90,
            pHeight,
            lang,
            0,
            pHeight,
            lang,
            90,
            pHeight,
          ]),
          width: 1.0,
          material: Cesium.Color.fromCssColorString(LineRGB[markk]),
        },
        label: {
          text: text,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          font: "12px sans-serif",
          fillColor: Cesium.Color.WHITE,
        },

      });
      for (let labellevel = -90; labellevel <= 90; labellevel += 10) {
        entities.add({
          position: Cesium.Cartesian3.fromDegrees(lang + 5, labellevel),
          label: {
            text: "p" + (labellevel + level + 90),
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            font: "12px sans-serif",
            fillColor: Cesium.Color.WHITE,
          },

        });
      }

    }
    let langS = [];
    for (let lang = -180; lang <= 180; lang += 5) {
      langS.push(lang);
    }
    //每隔10读绘制一条纬度线和纬度标注,自己控制间隔
    for (let lat = -80; lat <= 80; lat += 10) {
      let text = "";
      //text += "" + lat + "°";
      if (lat === 0) {
        text = "";
      }
      entities.add({
        // position: Cesium.Cartesian3.fromDegrees(0, lat),
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(
            langS
              .map((long) => {
                return [long, lat, pHeight].join(",");
              })
              .join(",")
              .split(",")
              .map((item) => Number(item))
          ),
          width: 1.0,
          // material: Cesium.Color.WHITE,
          material: Cesium.Color.fromCssColorString(LineRGB[markk]),

        },
      });
    }
  }
}
