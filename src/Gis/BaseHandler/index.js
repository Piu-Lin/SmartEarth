import LayerType from "../enum/LayerType";
import pickGloble from "../tools/pickGloble";
import { throttle } from "../tools";

export default class BaseHandler {
  /**
   * 初始化地图左键点击事件
   */
  initLeftClick() {
    const { viewer } = this;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // 左键单击事件
    handler.setInputAction((e) => {
      if (!this.destroyAroundPoint) {
        this.aroundPoint();
      }
      if (viewer.scene.mode !== Cesium.SceneMode.MORPHING) {
        // 移除原先的高亮面实体
        this.removeHighlightPolygonLayer();
        const pickedObject = viewer.scene.pick(e.position);
        if (pickedObject) {
          this.pickedFBX(pickedObject);
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            // 如果定义了对象，则返回true，否则返回false。
            const entity = pickedObject.id;
            // 调用父页面方法
            window.parent.postMessage(
              { id: entity.id, name: entity.name, Type: entity.Type },
              "*"
            );
            // window.parent.mapLeftClick(e);
            // 高亮显示
            if (entity.polygon) {
              this.highlightPolygon(entity);
              // 管理端选取面
              this._coordinate = {
                positionId: entity.ID,
                position: {
                  x: entity.x,
                  y: entity.y,
                  z: this.getClickHei(e),
                },
              };
            }
            switch (entity.Type) {
              case "grid":
                this.emitter.emit("openGrid", entity);
                break;
              default:
                break;
            }
          }
        }
        this.consolePosition(e);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 左键按下事件
    handler.setInputAction(
      throttle((e) => {
        if (!this.destroyAroundPoint) {
          this.aroundPoint();
        }
      }, 100),
      Cesium.ScreenSpaceEventType.LEFT_DOWN
    );
    // 中键按下事件
    handler.setInputAction(
      throttle((e) => {
        if (!this.destroyAroundPoint) {
          this.aroundPoint();
        }
      }, 100),
      Cesium.ScreenSpaceEventType.MIDDLE_DOWN
    );
    // 左键双击事件
    handler.setInputAction((e) => {
      if (!this.destroyAroundPoint) {
        this.aroundPoint();
      }
      const pickedObject = viewer.scene.pick(e.position);
      if (pickedObject) {
        if (!pickedObject.id || !pickedObject.id.Type) return;
        if (
          pickedObject.id.Type !== "village" &&
          pickedObject.id.Type !== "grid"
        )
          return;
        // 移除原先的高亮面实体
        this.removeHighlightPolygonLayer();
        if (pickedObject.id.Type === "village") {
          this.flyToGrid(pickedObject.id, 5000);
          viewer.dataSources._dataSources.forEach((dataSource) => {
            if (dataSource.name === "village") {
              dataSource.show = false;
            }
            if (dataSource.name === "grid") {
              dataSource.entities.values.forEach((entity) => {
                if (entity.village === pickedObject.id.name) {
                  entity.show = true;
                }
              });
            }
          });
        } else if (pickedObject.id.Type === "grid") {
          if (pickedObject.id.x && pickedObject.id.y) {
            this.flyTo({
              x: parseFloat(pickedObject.id.x),
              y: parseFloat(pickedObject.id.y),
              z: 200,
            });
          } else {
            this.flyToGrid(pickedObject.id, 1000);
          }
          // 记录被点击的网格所属村 用于拉高地图重新显示
          this.village = pickedObject.id.village;
          viewer.dataSources._dataSources.forEach((dataSource) => {
            if (dataSource.name === "village") {
              dataSource.show = false;
            }
            if (dataSource.name === "grid") {
              dataSource.entities.values.forEach((entity) => {
                entity.show = false;
              });
            }
            if (dataSource.name === "minigrid") {
              dataSource.entities.values.forEach((entity) => {
                if (
                  entity.block === pickedObject.id.name &&
                  entity.village === pickedObject.id.village
                ) {
                  entity.show = true;
                }
              });
            }
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // 移动事件
    handler.setInputAction(
      throttle((e) => {
        if (this.pickedEntity) {
          this.pickedEntity.polygon.material =
            Cesium.Color.fromCssColorString("#1e2d43").withAlpha(0.8);
          this.pickedEntity.polyline.material =
            Cesium.Color.fromCssColorString("#ffffff");
          this.pickedEntity = null;
        }
        const pickedObject = viewer.scene.pick(e.endPosition);
        if (pickedObject) {
          if (
            Cesium.defined(pickedObject) &&
            pickedObject.id &&
            pickedObject.id.Type
          ) {
            if (
              pickedObject.id.Type === "grid" ||
              pickedObject.id.Type === "minigrid"
            ) {
              pickedObject.id.polygon.material =
                Cesium.Color.fromCssColorString("#213e57").withAlpha(0.8);
              pickedObject.id.polyline.material =
                Cesium.Color.fromCssColorString("#15fcff");
              this.pickedEntity = pickedObject.id;
            }
          }
        }
      }, 10),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
    // 滚轮
    handler.setInputAction((e) => {
      if (!this.destroyAroundPoint) {
        this.aroundPoint();
      }
      if (e > 0) return;
      let height = viewer.camera.positionCartographic.height;
      // 移除原先的高亮面实体
      this.removeHighlightPolygonLayer();
      if (height > 1300 && height <= 6000) {
        viewer.dataSources._dataSources.forEach((dataSource) => {
          if (dataSource.name === "minigrid") {
            dataSource.entities.values.forEach((entity) => {
              entity.show = false;
            });
          }
          if (dataSource.name === "grid") {
            dataSource.entities.values.forEach((entity) => {
              if (this.village === entity.village) {
                entity.show = true;
              }
            });
          }
        });
      } else if (height > 6000) {
        this.village = "";
        viewer.dataSources._dataSources.forEach((dataSource) => {
          if (dataSource.name === "village") {
            dataSource.show = true;
          }
          if (dataSource.name === "grid") {
            dataSource.entities.values.forEach((entity) => {
              entity.show = false;
            });
          }
        });
      }
    }, Cesium.ScreenSpaceEventType.WHEEL);
  }

  // 监听相机高度
  cameraHeight() {
    this.viewer.camera.changed.addEventListener(
      throttle(() => {
        let height = this.viewer.camera.positionCartographic.height;
        if (height > 8000) {
          this.viewer.imageryLayers._layers.forEach((layer) => {
            if (layer.imageryProvider.name === "TDT_IMG") {
              layer.saturation = 1.2;
              layer.brightness = 1.6;
            }
          });
        } else {
          this.viewer.imageryLayers._layers.forEach((layer) => {
            if (layer.imageryProvider.name === "TDT_IMG") {
              layer.saturation = 1;
              layer.brightness = 1;
            }
          });
        }
      }, 100)
    );
  }

  // 选中FBX模型
  pickedFBX(pickedObject) {
    if (pickedObject.primitive.name === "nanxun-fbx-sn") {
      this.setImageryProviderVisible("TDT_IMG");
      this.viewer.scene.primitives._primitives.forEach((primitive) => {
        if (
          primitive.name === "nanxun-fbx-sw" ||
          primitive.name === "nanxun-fbx-dx"
        ) {
          primitive.show = true;
        }
        if (primitive.name === "nanxun-fbx-sn") {
          primitive.show = false;
        }
      });
      this.flyTo({
        longitude: 120.41856008196518,
        latitude: 30.889232444554132,
        height: 260.19533290937,
        heading: 0.32622190742938173,
        pitch: -0.7556557085547535,
        roll: 0.0013043249898849751,
      });
    }
    if (pickedObject.primitive.name === "nanxun-fbx-sw") {
      this.setImageryProviderVisible("");
      this.viewer.scene.primitives._primitives.forEach((primitive) => {
        if (
          primitive.name === "nanxun-fbx-sw" ||
          primitive.name === "nanxun-fbx-dx"
        ) {
          primitive.show = false;
        }
        if (primitive.name === "nanxun-fbx-sn") {
          primitive.show = true;
        }
      });
      this.flyTo({
        longitude: 120.42141158618355,
        latitude: 30.892656169511078,
        height: 167.3690821982108,
        heading: 4.17070199340258,
        pitch: -0.8308718719867683,
        roll: 6.279436631864904,
      });
    }
  }

  // 高亮显示面
  highlightPolygon(entity) {
    const { viewer } = this;

    // 判断是否要创建新的高亮面图层
    let layer = this._highlightPolygonLayer;
    if (!layer) {
      layer = new Cesium.CustomDataSource("高亮面图层");
      viewer.dataSources.add(layer);
      this._highlightPolygonLayer = layer;
    }

    // 移除原先的高亮面实体
    // this.removeHighlightPolygonLayer();

    // 添加高亮面实体
    this._highlightPolygonEntity = layer.entities.add({
      polyline: {
        positions: entity.polygon.hierarchy.getValue().positions,
        width: 10,
        material: new Cesium.PolylineGlowMaterialProperty({
          // 一个数字属性，指定发光强度，占总线宽的百分比。
          glowPower: 0.5,
          color: Cesium.Color.ORANGERED,
        }),
        clampToGround: true,
      },
    });

    // 设置高亮面图层置顶
    viewer.dataSources.raiseToTop(layer);
  }

  removeHighlightPolygonLayer() {
    if (this._highlightPolygonEntity) {
      this._highlightPolygonLayer.entities.remove(this._highlightPolygonEntity);
    }
  }

  consolePosition(move) {
    const { viewer } = this;
    const { longitude, latitude, height } = viewer.camera.positionCartographic;
    const { heading, pitch, roll } = viewer.camera;
    console.log(`相机：{
        longitude: ${Cesium.Math.toDegrees(longitude)},
        latitude: ${Cesium.Math.toDegrees(latitude)},
        height: ${height},
        heading: ${heading},
        pitch: ${pitch},
        roll: ${roll},
     }`);
    const cartesian = pickGloble(viewer, move.position);
    if (!cartesian) return;
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const clickLon = Cesium.Math.toDegrees(cartographic.longitude);
    const clickLat = Cesium.Math.toDegrees(cartographic.latitude);
    const clickHei = cartographic.height > 0 ? cartographic.height : 0;
    console.log(`点位：x: ${clickLon}, y: ${clickLat}, z: ${clickHei}`);

    document.getElementById(
      "position"
    ).innerText = `x: ${clickLon}\ny: ${clickLat}\nz: ${clickHei}`;

    // 管理端选取点位
    if (this._positionType === 1) {
      viewer.entities.removeAll();
      let coordinate = {
        x: clickLon,
        y: clickLat,
        z: clickHei,
      };
      this._coordinate = {
        position: coordinate,
      };
      this.addMark(viewer, {
        coordinate,
        image: "/static/images/marker/normal.png",
      });
    }
  }

  getClickHei(move) {
    const cartesian = pickGloble(this.viewer, move.position);
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const clickHei = cartographic.height > 0 ? cartographic.height : 0;
    return clickHei;
  }
}
