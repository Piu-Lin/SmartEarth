import * as Cesium from 'cesium'

export interface VisualRadarPrimitiveParam {
  center: Cesium.Cartesian3
  radius?: number
  slicePartition?: number
  localToWorldMatrix?: Cesium.Matrix4
}

export class VisualRadarPrimitive {
  _viewer: Cesium.Viewer

  _visualPrimitive: Cesium.GroundPolylinePrimitive | undefined
  _hiddenPrimitive: Cesium.GroundPolylinePrimitive | undefined
  _circlePrimitive: Cesium.GroundPolylinePrimitive | undefined

  _center: Cesium.Cartesian3
  _radius: number
  _slicePartition: number
  _localToWorldMatrix: Cesium.Matrix4
  _visualLines: Array<[Cesium.Cartesian3, Cesium.Cartesian3]> = []
  _hiddenLines: Array<[Cesium.Cartesian3, Cesium.Cartesian3]> = []
  _circleLines: Array<Cesium.Cartesian3> = []

  constructor(options: VisualRadarPrimitiveParam, viewer: Cesium.Viewer) {
    this._viewer = viewer
    this._center = options.center
    this._radius = options.radius ?? 200
    this._slicePartition = options.slicePartition ?? 72
    this._localToWorldMatrix = options.localToWorldMatrix ?? Cesium.Transforms.eastNorthUpToFixedFrame(this._center)
    this._computeLocalPts()

    // 初始化地形高度后再添加原语
    Cesium.GroundPolylinePrimitive.initializeTerrainHeights(this._viewer.scene).then(() => {
      this._addPrimitive()
    }).catch((error) => {
      console.error('初始化地形高度失败:', error)
    })
  }

  _computeLocalPts() {
    this._visualLines = []
    this._hiddenLines = []
    this._circleLines = []
    const headingCount = this._slicePartition
    const headingDelta = Cesium.Math.TWO_PI / headingCount
    for (let i = 0; i < headingCount; i++) {
      const heading = headingDelta * i
      for (let j = 0; j <= 180; j += 1) {
        let localPt: Cesium.Cartesian3
        if (j === 0) {
          localPt = new Cesium.Cartesian3(0, 0, this._radius)
        } else if (j === 180) {
          localPt = new Cesium.Cartesian3(0, 0, -this._radius)
        } else {
          const x = this._radius * Math.sin(heading)
          const y = this._radius * Math.cos(heading)
          const z = this._radius * Math.tan(Math.PI / 2 - Cesium.Math.toRadians(j))
          localPt = new Cesium.Cartesian3(x, y, z)
        }
        
        // 确保世界坐标计算时不丢失高度信息
        const worldPt = Cesium.Matrix4.multiplyByPoint(this._localToWorldMatrix, localPt, new Cesium.Cartesian3())

        // 确保使用的 `z` 坐标（高度）没有丢失
        const direction = Cesium.Cartesian3.normalize(
          Cesium.Cartesian3.subtract(worldPt, this._center, new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        )
        const ray = new Cesium.Ray(this._center, direction)

        // 使用 `pickFromRay` 来获取地面交点
        const barrier = (this._viewer.scene as any).pickFromRay(ray)?.position
        if (
          barrier &&
          Cesium.Cartesian3.distance(this._center, barrier) < Cesium.Cartesian3.distance(this._center, worldPt)
        ) {
          this._visualLines.push([this._center, barrier])
          this._hiddenLines.push([barrier, worldPt])
          this._circleLines.push(worldPt)
          break
        } else if (j === 170) {
          this._visualLines.push([this._center, worldPt])
          this._circleLines.push(worldPt)
        }
      }
    }
  }

  _addPrimitive() {
    this._visualPrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: this._visualLines.map(
        pts =>
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: pts,
              width: 2.0
            })
          })
      ),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
          color: Cesium.Color.fromCssColorString('rgb(0, 255, 0)'),
          dashLength: 0
        })
      }),
      allowPicking: false,
      asynchronous: false
    })
    this._hiddenPrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: this._hiddenLines.map(
        pts =>
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: pts,
              width: 2.0
            })
          })
      ),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
          color: Cesium.Color.fromCssColorString('rgb(255, 0, 0)'),
          dashLength: 0
        })
      }),
      allowPicking: false,
      asynchronous: false
    })
    this._circlePrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: this._circleLines.concat(this._circleLines[0]),
          width: 2.0
        })
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.PolylineDashType, {
          color: Cesium.Color.fromCssColorString('rgb(255, 200, 0)'),
          dashLength: 0
        })
      }),
      allowPicking: false,
      asynchronous: false
    })
    this._viewer.scene.groundPrimitives.add(this._visualPrimitive)
    this._viewer.scene.groundPrimitives.add(this._hiddenPrimitive)
    this._viewer.scene.groundPrimitives.add(this._circlePrimitive)
  }

  destroy() {
    this._visualPrimitive && this._viewer.scene.groundPrimitives.remove(this._visualPrimitive)
    this._hiddenPrimitive && this._viewer.scene.groundPrimitives.remove(this._hiddenPrimitive)
    this._circlePrimitive && this._viewer.scene.groundPrimitives.remove(this._circlePrimitive)
  }
}
