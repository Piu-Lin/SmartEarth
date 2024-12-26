import * as Cesium from 'cesium'

export interface RadarPrimitiveParam {
  // 雷达所在的位置
  position: Cesium.Cartesian3
  // Rmax
  coefficient?: number
  // 插值次数
  slicePartition?: number
  // 是否存在干扰机，位置暂时写死
  hasJammer?: boolean
}

export class RadarPrimitive {
  _viewer: Cesium.Viewer

  _primitive: Cesium.Primitive
  _position: Cesium.Cartesian3
  _coefficient: number
  _slicePartition: number
  _hasJammer: boolean
  // 横向纬线
  _latWorldPts: Array<Array<Cesium.Cartesian3>> = []
  // 纵向经线
  _lonWorldPts: Array<Array<Cesium.Cartesian3>> = []
  // 顶点颜色
  _colorList: Array<Cesium.Color> = []

  constructor(options: RadarPrimitiveParam, viewer: Cesium.Viewer) {
    this._viewer = viewer
    this._position = options.position
    this._slicePartition = options.slicePartition ?? 72
    this._coefficient = options.coefficient ?? 50
    this._hasJammer = options.hasJammer ?? false
    this._computeLocalPts()
    this._primitive = this._createPrimitive()
    this._viewer.scene.primitives.add(this._primitive)
  }

  /**
   * 计算指定俯仰角下的雷达最大探测距离
   * @param {number} heading 方位角 in degrees
   * @param {number} pitch 俯仰角 in radians
   * @returns {number} 最大探测距离
   */
  _computeDistance(heading: number, pitch: number): number {
    let k = 1
    if (this._hasJammer) {
      const full = Math.pow(90, 1 / 4)
      if (heading === 0) k = 0
      else if (Math.abs(heading) < Cesium.Math.PI_OVER_TWO)
        k = Math.pow(Math.abs(Cesium.Math.toDegrees(heading)), 1 / 4) / full
      else k = 1
    }
    return k * Math.pow(Math.abs(Math.sin(pitch)), 1 / 4) * Math.pow(Math.cos(pitch), 2)
  }

  _computeLocalPts() {
    this._lonWorldPts = []
    this._latWorldPts = []
    this._colorList = []
    const headingCount = this._slicePartition
    const headingDelta = Cesium.Math.TWO_PI / headingCount
    const pitchList = [
      -5, -4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
      38, 40, 43, 46, 49, 52, 55, 58, 61, 65, 69, 73, 77, 81, 86, 90
    ]
    // up -> pitch: 0°; -up -> pitch: 180°;
    const localToWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this._position)
    for (let i = 0; i < headingCount; i++) {
      this._lonWorldPts[i] = []
      const heading = headingDelta * i - Cesium.Math.PI
      for (let j = 0; j < pitchList.length; j++) {
        const pitch = Cesium.Math.toRadians(pitchList[j])
        const distance = this._computeDistance(heading, pitch) * this._coefficient
        const x = distance * Math.sin(Cesium.Math.PI_OVER_TWO - pitch) * Math.sin(heading)
        const y = distance * Math.sin(Cesium.Math.PI_OVER_TWO - pitch) * Math.cos(heading)
        const z = distance * Math.cos(Cesium.Math.PI_OVER_TWO - pitch)
        const worldPt = Cesium.Matrix4.multiplyByPoint(
          localToWorldMatrix,
          new Cesium.Cartesian3(x, y, z),
          new Cesium.Cartesian3()
        )
        this._lonWorldPts[i].push(worldPt)
        this._colorList.push(this._computeColor(pitchList[j]))
      }
    }
    this._latWorldPts = this._lonWorldPts[0].map((_, i) => {
      return this._lonWorldPts.map(row => row[i])
    })
  }

  // pitch in degrees
  _computeColor(pitch: number): Cesium.Color {
    if (pitch < 5) return Cesium.Color.YELLOW
    if (pitch < 8) return Cesium.Color.fromCssColorString('rgb(250,180,50)')
    if (pitch < 15) return Cesium.Color.fromCssColorString('rgb(250,133,50)')
    else if (pitch < 32) return Cesium.Color.fromCssColorString('rgb(250, 50, 50)')
    else if (pitch < 38) return Cesium.Color.fromCssColorString('rgb(250,120,50)')
    else if (pitch < 44) return Cesium.Color.fromCssColorString('rgb(255,214,0)')
    else if (pitch < 50) return Cesium.Color.fromCssColorString('rgb(255,251,0)')
    else if (pitch < 60) return Cesium.Color.fromCssColorString('rgb(170,255,0)')
    else if (pitch < 70) return Cesium.Color.fromCssColorString('rgb(102,255,0)')
    else return Cesium.Color.fromCssColorString('rgb(20, 255, 20)')
  }

  _createPrimitive(): Cesium.Primitive {
    const lonInstances = this._lonWorldPts.map(
      pts =>
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: pts,
            colors: this._colorList,
            colorsPerVertex: true
          })
        })
    )
    const latInstances = this._latWorldPts.map(
      (pts, index) =>
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: pts.concat(pts[0]),
            colors: new Array(pts.length + 1).fill(this._colorList[index]),
            colorsPerVertex: true
          })
        })
    )
    return new Cesium.Primitive({
      geometryInstances: [...lonInstances, ...latInstances],
      appearance: new Cesium.PolylineColorAppearance(),
      allowPicking: false,
      asynchronous: false
    })
  }

  destroy() {
    this._primitive && this._viewer.scene.primitives.remove(this._primitive)
  }
}
