import MarkBillboards from '../enum/MarkBillboards';

export default class BaseMark {
  /**
   * 添加点位
   * @param dataSource 数据源
   * @param data {
   *   coordinate: 坐标
   *   image: 图片地址
   *   id: id
   *   Type: Type
   *   name: name
   *   isLabel: 是否创建label  默认不创建
   *   isPolyline: 是否创建指示线  默认不创建
   *   near: 最低可视高度
   *   far: 最高可视高度
   * }
   * @returns {Entity}
   */
  addMark(dataSource, data) {
    if (data.coordinate) {
      let position = new Cesium.Cartesian3.fromDegrees(
        data.coordinate.x,
        data.coordinate.y,
        data.coordinate.z
      );
      let entity = dataSource.entities.add({
        id: data?.id,
        ID: data?.id,
        name: data?.name,
        device: data?.device,
        isTips: data?.isTips,
        position: position,
        Type: data?.Type,
        billboard: {
          image: data.image || '/static/images/marker/normal.png',
          width: 32,
          height: 32,
          zIndex: 11,
          eyeOffset: new Cesium.Cartesian3(0, 0, -10), //z设为负值，离眼睛更近，防止被其它标注物遮挡
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            data.near || 0,
            data.far || 10000,
          ),
          disableDepthTestDistance: 1e9,
          scaleByDistance: new Cesium.NearFarScalar(data.far/2 || 0, 1, data.far || 10000, 0.5), // 根据高度显示对应的缩放比例大小
        }
      });
      if(data.isLabel) {
        this.addLabel(entity,data);
      }
      if(data.isPolyline) {
        this.addPolyline(entity);
      }
      return entity;
    }
  }

  /**
   * 添加跳动图标
   * @param dataSource 数据源
   * @param data {
   *   coordinate: 坐标
   *   image: 图片地址
   *   id: id
   *   Type: Type
   *   name: name
   *   isLabel: 是否创建label  默认不创建
   *   isPolyline: 是否创建指示线  默认不创建
   *   near: 最低可视高度
   *   far: 最高可视高度
   * }
   * @returns {Entity}
   */
  addJumpMark(dataSource, data) {
    if (data.coordinate) {
      let position = new Cesium.Cartesian3.fromDegrees(
        data.coordinate.x,
        data.coordinate.y,
        data.coordinate.z
      );
      let s1 = 10;
      let calculator = 1;
      function getAxisValue(s) {
        if (s >= 20) {
          calculator = -1;
        } else if (s <= 0) {
          calculator = 1;
        }
        s += calculator;
        return s;
      }
      let entity = dataSource.entities.add({
        id: data?.id,
        ID: data?.id,
        name: data?.name,
        device: data?.device,
        isTips: data?.isTips,
        position: position,
        Type: data?.Type,
        billboard: {
          image: data.image || '/static/images/marker/normal.png',
          width: 32,
          height: 32,
          zIndex: 11,
          eyeOffset: new Cesium.Cartesian3(0, 0, -10), //z设为负值，离眼睛更近，防止被其它标注物遮挡
          pixelOffset: new Cesium.CallbackProperty(function () {
            s1 = getAxisValue(s1);
            return new Cesium.Cartesian2(0, s1);
          }, false),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            data.near || 0,
            data.far || 10000,
          ),
          disableDepthTestDistance: 1e9,
          scaleByDistance: new Cesium.NearFarScalar(data.far/2 || 0, 1, data.far || 10000, 0.5), // 根据高度显示对应的缩放比例大小
        }
      });
      if(data.isLabel) {
        this.addLabel(entity,data);
      }
      if(data.isPolyline) {
        this.addPolyline(entity);
      }
      return entity;
    }
  }

  /**
   * 添加广告牌
   * @param dataSource 数据源
   * @param data {
   *   coordinate: 坐标
   *   image: 图片地址
   *   id: id
   *   Type: Type
   *   name: name
   *   near: 最低可视高度
   *   far: 最高可视高度
   * }
   */
  addMarkBillboard(dataSource, data) {
    if (!data.coordinate && !data.name) return;
    let position = new Cesium.Cartesian3.fromDegrees(
      data.coordinate.x,
      data.coordinate.y,
      data.coordinate.z
    );
    let img = new Image();
    img.src = data.image;
    let canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const style = MarkBillboards.find(item => data.image === item.image);
    const { font, fillStyle, x, y, pixelOffsetX, pixelOffsetY } = style;
    let ctx = canvas.getContext('2d');
    ctx.textAlign = 'center';
    img.onload = () => {
      ctx.drawImage(img,0,0);
      ctx.font = font;
      ctx.fillStyle = fillStyle;
      ctx.fillText(data.name, x, y);
      let canvasURL = canvas.toDataURL();
      let entity = dataSource.entities.add({
        id: data?.id,
        ID: data?.id,
        Type: data?.Type,
        name: data.name,
        device: data?.device,
        roomNumber: data?.roomNumber,
        roomArea: data?.roomArea,
        isTips: data?.isTips,
        position: position,
        billboard: {
          image: canvasURL,
          width: 96,
          height: 96,
          pixelOffset: new Cesium.Cartesian2(pixelOffsetX, pixelOffsetY), //偏移量
          eyeOffset: new Cesium.Cartesian3(0, 0, -10), //z设为负值，离眼睛更近，防止被其它标注物遮挡
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            data.near || 0,
            data.far || 20000,
          ),
        }
      });
      return entity;
    }
  }

  // 添加圆圈收缩
  addMarkShrink(dataSource,data, r = 25, maxR = 30, minR = 20, calculator2 = 1) {
    if (!data.coordinate.x) return;
    let position = new Cesium.Cartesian3.fromDegrees(data.coordinate.x, data.coordinate.y, data.coordinate.z);
    let s1 = r;
    let s2 = r;
    let calculator = calculator2;
    function getAxisValue(s) {
      if (s >= maxR) {
        calculator = -calculator2;
      } else if (s <= minR) {
        calculator = calculator2;
      }
      s += calculator;
      return s;
    }
    let entity = dataSource.entities.add({
      id: data?.id,
      name: data?.name,
      isTips: data?.isTips,
      position: position,
      ellipse: {
        semiMajorAxis: new Cesium.CallbackProperty(function () {
          s1 = getAxisValue(s1);
          return s1;
        }, false),
        semiMinorAxis: new Cesium.CallbackProperty(function () {
          s2 = getAxisValue(s2);
          return s2;
        }, false),
        material: new Cesium.ImageMaterialProperty({
          image: data.image,
        })
      }
    });
    if(data.isLabel) {
      this.addLabel(entity, {name: data.name, showBackground: true});
    }
    return entity;
  }

  // 添加环形扩散波纹
  addCircleRipple(entity, height = 30, image = '/static/images/texture/colors24-3.png', maxR = 500){
    let r1 = 0;
    let r2 = 0;
    function changeAxis(r) {
      r += 1.5;
      if(r >= maxR){
        r = 0;
      }
      return r;
    }
    entity.ellipse = {
      semiMinorAxis: new Cesium.CallbackProperty((() => {
        r1 = changeAxis(r1);
        return r1;
      }),false),
      semiMajorAxis: new Cesium.CallbackProperty((() => {
        r2 = changeAxis(r2);
        return r2;
      }),false),
      height: height/3,
      material: new Cesium.ImageMaterialProperty({
        image: image,
        color: new Cesium.CallbackProperty(() => {
          let alp= 1 - r1/maxR;
          return Cesium.Color.WHITE.withAlpha(alp);
        },false)
      })
    };
  }

  // 电弧球体效果
  addEllipsoid(data){
    if (!data.x) return;
    let position = new Cesium.Cartesian3.fromDegrees(data.x, data.y);
    this.viewer.entities.add({
        position,
        name: '电弧球体',
        ellipsoid: {
            radii: new Cesium.Cartesian3(200.0, 200.0, 180.0),
            material: new Cesium.EllipsoidElectricMaterialProperty({
                color: Cesium.Color.fromCssColorString("#52d5ff"),
                speed: 10.0
            })
        }
    })
  }

  /**
   * 添加label
   * @param entity
   */
  addLabel(entity, data) {
    entity.label = {
      ID: data?.id,
      text: data?.name,
      Type: data?.Type,
      isTips: data?.isTips,
      font: data.font || "16px Microsoft YaHei",
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: data.color || Cesium.Color.WHITE,
      showBackground: data?.showBackground,
      scaleByDistance: new Cesium.NearFarScalar(data.far/2 || 0, 1, data.far || 10000, 0.5), // 根据高度显示对应的缩放比例大小
      horizontalOrigin : Cesium.HorizontalOrigin.LEFT_CLICK,
      verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, data.pixelOffsetY || -16),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        data.near || 0,
        data.far || 10000,
      ),
      disableDepthTestDistance: 1e9
    };
  }

  /**
   * 添加图标下方的指示线
   * @param entity
   */
  addPolyline(entity) {
    const { viewer } = this;
    if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
      const { ellipsoid } = viewer.scene.globe;
      if (entity.position && entity.position._value) {
        const cartographic = ellipsoid.cartesianToCartographic(entity.position._value);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const positions = Cesium.Cartographic.fromDegrees(longitude, latitude);
        // eslint-disable-next-line new-cap
        Cesium.when(new Cesium.sampleTerrain(viewer.terrainProvider, 15, [positions]), (updatedPositions) => {
          entity.polyline = {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([longitude, latitude, updatedPositions[0].height + 1, longitude, latitude, updatedPositions[0].height + 9.9]),
            width: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              color: Cesium.Color.RED,
              glowPower: 0.2,
              taperPower: 0.4,
            }),
          };
        });
      }
    }
  }
}
