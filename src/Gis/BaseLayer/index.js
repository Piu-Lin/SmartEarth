export default class BaseLayer {
  // 添加单体化图层
  createGeoJson(url, visibility) {
    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true,
    }).then((dataSource) => {
      dataSource.name = 'monomer';
      dataSource.show = this._positionType === 1 ? false : true;
      this.viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const { properties } = entity;
        const id = properties.id ? properties.id._value : '';
        const x = properties.x ? properties.x._value : '';
        const y = properties.y ? properties.y._value : '';
        entity.ID = id;
        entity.x = x;
        entity.y = y;
        entity.show = visibility;
      }
      if (this._positionId) {
        this.highlightEntity(this._positionId);
      }
    });
  }

  /**
   * 添加水面图层
   */
  addWaterLayerKml(url,height=2.1) {
    Cesium.KmlDataSource.load(url).then((dataSource) => {
      const { ellipsoid } =this.viewer.scene.globe;
      dataSource.entities.values.forEach((entitie) => {
        let instances = [];
        let instances2 = [];
        entitie.polygon.hierarchy.getValue().positions.forEach((position) => {
          const cartographic = ellipsoid.cartesianToCartographic(position);
          instances.push(Cesium.Math.toDegrees(cartographic.longitude));
          instances.push(Cesium.Math.toDegrees(cartographic.latitude));
          instances.push(height);
          instances2.push(Cesium.Math.toDegrees(cartographic.longitude));
          instances2.push(Cesium.Math.toDegrees(cartographic.latitude));
          instances2.push(height-0.1);
        });
        let underWater = new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
            geometry : new Cesium.PolygonGeometry({
              polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(instances)),
              perPositionHeight : true//注释掉此属性水面就贴地了
            })
          }),
        });
        this.viewer.scene.primitives.add(underWater);
        let waterPrimitive = new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
            geometry : new Cesium.PolygonGeometry({
              polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(instances)),
              perPositionHeight : true//注释掉此属性水面就贴地了
            })
          }),
          // 可以设置内置的水面shader
          appearance : new Cesium.EllipsoidSurfaceAppearance({
            material : new Cesium.Material({
              fabric : {
                type : 'Water',
                uniforms : {
                  // specularMap: "/static/images/texture/earthspeclk.png",
                  // baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.2),
                  baseWaterColor: Cesium.Color.fromCssColorString("#dfffff").withAlpha(0.2),
                  normalMap: "/static/images/water.jpg",
                  frequency: 1000.0, // 控制波数的数字。
                  animationSpeed: 0.01, // 控制水的动画速度的数字。
                  amplitude: 10, // 控制水波振幅的数字。
                  specularIntensity: 0.9, // 控制镜面反射强度的数字。
                }
              }
            }),
          })
        });
        this.viewer.scene.primitives.add(waterPrimitive);
      })
    })
  }

  /**
   * 添加水面图层
   */
  addWaterLayerJson(url,height) {
    Cesium.GeoJsonDataSource.load(url).then((dataSource) => {
      this.viewer.scene.globe.depthTestAgainstTerrain = false;
      const { ellipsoid } =this.viewer.scene.globe;
      let underInstances = [];
      let waterInstances = [];
      dataSource.entities.values.forEach((entitie) => {
        let instances = [];
        let instances2 = [];
        entitie.polygon.hierarchy.getValue().positions.forEach((position) => {
          const cartographic = ellipsoid.cartesianToCartographic(position);
          instances.push(Cesium.Math.toDegrees(cartographic.longitude));
          instances.push(Cesium.Math.toDegrees(cartographic.latitude));
          instances.push(parseFloat(entitie.properties.height.getValue())+height);
          instances2.push(Cesium.Math.toDegrees(cartographic.longitude));
          instances2.push(Cesium.Math.toDegrees(cartographic.latitude));
          instances2.push(entitie.properties.height.getValue()-0.1+height);
        });
        underInstances.push(new Cesium.GeometryInstance({
          geometry : new Cesium.PolygonGeometry({
            polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(instances2)),
            perPositionHeight : true//注释掉此属性水面就贴地了
        })}));
        waterInstances.push(new Cesium.GeometryInstance({
          geometry : new Cesium.PolygonGeometry({
            polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(instances)),
            perPositionHeight : true//注释掉此属性水面就贴地了
        })}));
      })
      let underWater = new Cesium.Primitive({
        geometryInstances: underInstances,
        appearance: new Cesium.MaterialAppearance({
          closed: false,
          material:  new Cesium.Material({
            fabric: {
              type: "DiffuseMap",
              uniforms: {
                image: "/static/images/texture/colors27.png",
              },
            }
          })
        })
      });
      this.viewer.scene.primitives.add(underWater);
      let waterPrimitive = new Cesium.Primitive({
        geometryInstances : waterInstances,
        // 可以设置内置的水面shader
        appearance : new Cesium.EllipsoidSurfaceAppearance({
          material : new Cesium.Material({
            fabric : {
              type : 'Water',
              uniforms : {
                // specularMap: "/static/images/texture/earthspeclk.png",
                baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.2),
                normalMap: "/static/images/water.jpg",
                // normalMap: "/static/images/texture/colors27.png",
                frequency: 1000.0, // 控制波数的数字。
                animationSpeed: 0.01, // 控制水的动画速度的数字。
                amplitude: 10, // 控制水波振幅的数字。
                specularIntensity: 0.9, // 控制镜面反射强度的数字。
              }
            }
          }),
        })
      });
      this.viewer.scene.primitives.add(waterPrimitive);
    })
  }

  // 初始化面边界
  initBorder(url, height, color, isAdd) {
    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true,
    }).then((dataSource) => {
      dataSource.name = "border"
      dataSource.entities.values.forEach((entitie) => {
        const { ellipsoid } = this.viewer.scene.globe;
        const line = [];
        entitie.polygon.hierarchy._value.positions.forEach((position) => {
          const cartographic = ellipsoid.cartesianToCartographic(position);
          line.push(Cesium.Math.toDegrees(cartographic.longitude));
          line.push(Cesium.Math.toDegrees(cartographic.latitude));
          line.push(height);
        });
        // CORNFLOWERBLUE DEEPSKYBLUE DODGERBLUE
        this.createWall(Cesium, line, Cesium.Color.fromCssColorString(color), 3000);
      });
      if(isAdd){
        this.viewer.dataSources.add(dataSource);
        dataSource.entities.values.forEach((entitie) => {
          entitie.polygon.material = Cesium.Color.fromCssColorString("#15fcff").withAlpha(0.01);
          entitie.polyline = {
            positions: entitie.polygon.hierarchy._value.positions,
            width: 20,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower : 0.1,
              color : Cesium.Color.fromCssColorString("#8ed4ff").withAlpha(0.4),
            }),
            distanceDisplayCondition: entitie.polygon.distanceDisplayCondition,
            clampToGround: true,
          };
        });
      }
    });
  }

  // 初始化街道边界
  initBorderLine(url, height, color, isAdd, isMask) {
    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true
    }).then((dataSource) => {
      dataSource.name = "borderLine";
      dataSource.entities.values.forEach((entitie) => {
        const { ellipsoid } = this.viewer.scene.globe;
        const line = [];
        entitie.polyline.positions._value.forEach((position) => {
          const cartographic = ellipsoid.cartesianToCartographic(position);
          line.push(Cesium.Math.toDegrees(cartographic.longitude));
          line.push(Cesium.Math.toDegrees(cartographic.latitude));
          line.push(height);
        });
        // CORNFLOWERBLUE DEEPSKYBLUE DODGERBLUE
        this.createWall(Cesium, line, Cesium.Color.fromCssColorString(color), 3000);
        if(isMask){
          let polygonEntity = new Cesium.Entity({
            polygon: {
              hierarchy: {
                // 添加外部区域为1/4半圆，设置为180会报错
                // positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 90, 179, 90, 179, 0]),
                positions: Cesium.Cartesian3.fromDegreesArray([70, 40, 150, 50, 131, 10, 80, 10]),
                // 中心挖空的“洞”
                holes: [{
                  positions: Cesium.Cartesian3.fromDegreesArrayHeights(line)
                }]
              },
              material: Cesium.Color.fromCssColorString('#000000').withAlpha(0.3),
            }
          })
          this.viewer.entities.add(polygonEntity);
        }
      });
      if(isAdd){
        this.viewer.dataSources.add(dataSource);
        dataSource.entities.values.forEach((entitie) => {
          entitie.polyline.width = 20;
          entitie.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower : 0.2,
            color : Cesium.Color.fromCssColorString("#15fcff").withAlpha(0.4),
          });
        });
      }
    });
  }

  // 设置图层可见性
  setLayerState(data) {
    this.viewer.dataSources._dataSources.forEach((item) => {
      if (item.name === data.name) {
        item.show = data.visible;
      }
    });
  }
  // 设置entity可见性
  setEntityState(data) {
    this.viewer.dataSources._dataSources.forEach((dataSource) => {
      if (dataSource.name === 'monomer') {
        dataSource.entities.values.forEach((entity) => {
          if (entity.Type === data.name) {
            entity.show = data.visible;
          }
        });
      }
    });
  }
  // 移除单个图层
  removeLayer(name) {
    this.viewer.dataSources._dataSources.forEach((item) => {
      if (item.name === name) {
        this.viewer.dataSources.remove(item);
      }
    });
  }
  // 移除所有数据
  removeAllDataSources() {
    this.removeHighlightPolygonLayer();
    this._highlightPolygonLayer = null;
    this._highlightPolygonEntity = null;
    // this.viewer.dataSources.removeAll(true);
    this.viewer.dataSources._dataSources.forEach((dataSource) => {
      dataSource.entities.values.forEach((entity) => {
        entity.show = false;
      });
    });
  }

  /**
   * @description: 将图片和文字合成新图标使用（参考Cesium源码）
   * @param {*} url：图片地址
   * @param {*} label：文字
   * @param {*} size：画布大小
   * @return {*} 返回canvas
   */
  combineIconAndLabel(url, label, size) {
    // 创建画布对象
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d");

    let promise = new Cesium.Resource.fetchImage(url).then(image => {
      // 异常判断
      try {
        ctx.drawImage(image, 0, 0);
      } catch (e) {
        console.log(e);
      }

      // 渲染字体
      // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
      ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
      ctx.font = 'bold 48px Microsoft YaHei';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, size / 2, size / 2);

      return canvas;
    });
    return promise;
  }
}
