/**
 * 1.设置仿真时间范围：
    start 和 stop 用于定义仿真的开始和结束时间。
    start 初始化为当前时间，然后加上8小时以转换为东八区时间。
    stop 设置为 start 之后的360秒（即6分钟）。

 * 2. 初始化时钟：
    viewer.clock 设置为从 start 到 stop 的时间范围，并配置为循环停止模式。
    设置时间倍率 multiplier 为5，控制时间流逝速度。
    调整 viewer 的视图边界以适应时间范围。

 * 3. 生成卫星路径和轨迹：
    getRandState 函数生成一个随机的卫星路径，基于输入的经度或纬度。
    computePosition 函数根据路径计算每个时间点的位置。

 * 4. 创建四棱锥：
    createPyramidGeometry 函数生成一个四棱锥的几何体，底面是正方形，顶点在中心上方。

 * 5. 启动仿真：
    startSimulation 函数获取路径，创建四棱锥实体，并在每次 preRender 事件中更新四棱锥的位置。
    生成卫星实体，设置其路径和方向，加载卫星模型，并显示卫星轨迹。
 */

let start = null
let stop = null

// 四棱锥高度
const PYRAMID_HEIGHT = 990000.0
// 四棱柱底面大小
const PYRAMID_BASE_SIZE = 50000.0

export function satellite(viewer) {
  start = new Cesium.JulianDate.fromDate(new Date()) //把js中的时间转换为儒略时间
  start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()) //东八区时间
  // 结束时间
  stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate())

  //确保查看器处于预期的时间
  viewer.clock.startTime = start.clone()
  viewer.clock.stopTime = stop.clone()
  viewer.clock.currentTime = start.clone()
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP //循环结束时
  //时间变化来控制速度 // 时间速率，数字越大时间过的越快
  viewer.clock.multiplier = 5
  //给时间线设置边界
  viewer.zoomTo(start, stop)
  startSimulation('lon', 120, viewer)
}

function mySatePosition() {
  this.lon = 0
  this.lat = 0
  /**
   * https://html.rhhz.net/BJHKHTDXXBZRB/20180718.htm
   * GNSS卫星高度为20200KM
   */
  this.satelliteHeight = 20200000 //卫星高度
  this.orbitHeight = 700000 / 2 //轨道高度
  this.time = 0
}

function getRandState(ifLat, degree) {
  var arr = []
  var lat = Math.floor(Math.random() * 360)
  for (var i = lat; i <= 360 + lat; i += 30) {
    var aaa = new mySatePosition()
    if (ifLat == 'lon') {
      aaa.lon = degree
      aaa.lat = i
    } else {
      aaa.lon = i
      aaa.lat = degree
    }
    aaa.time = i - lat
    arr.push(aaa)
  }
  return arr
}

function computePosition(source, panduan) {
  var property = new Cesium.SampledPositionProperty()
  for (var i = 0; i < source.length; i++) {
    var time = Cesium.JulianDate.addSeconds(
      start,
      source[i].time,
      new Cesium.JulianDate()
    )
    var position = Cesium.Cartesian3.fromDegrees(
      source[i].lon,
      source[i].lat,
      panduan === 1 ? source[i].satelliteHeight : source[i].orbitHeight
    )
    property.addSample(time, position)
  }
  return property
}

// 创建四棱锥体
/**
 * 1. 常量定义：
    baseSize 和 height 定义了四棱锥底面的大小和高度。

  * 2. 顶点位置 (positions)：
    positions 数组包含了四棱锥的五个顶点位置（四个底面顶点和一个顶点）。

  * 3. 索引 (indices)：
    indices 数组定义了如何连接顶点以形成三角形。底面由两个三角形组成，每个侧面由一个三角形组成，总共形成四个侧面。

  * 4. 创建几何体：
    使用 Cesium.Geometry 创建几何体对象，包含位置属性和索引。
    attributes 定义了顶点的位置数据。
    indices 定义了顶点的连接顺序。
    primitiveType 指定了图元类型为三角形。
    boundingSphere 根据顶点位置计算了几何体的边界球体。

 * @param {*} satellitePosition 
 * @returns 四棱锥
 */

function createPyramidGeometry(satellitePosition) {
  const baseSize = PYRAMID_BASE_SIZE
  const height = PYRAMID_HEIGHT

  const positions = new Float64Array([
    // 底面四个顶点
    // 底面左下角
    -baseSize,
    -baseSize,
    0.0,
    // 底面右下角
    baseSize,
    -baseSize,
    0.0,
    // 底面右上角
    baseSize,
    baseSize,
    0.0,
    // 底面左上角
    -baseSize,
    baseSize,
    0.0,
    // 顶点
    satellitePosition.x,
    satellitePosition.y,
    satellitePosition.z + height
  ])

  const indices = new Uint16Array([
    // 底面（三角形）
    // 第一个三角形：左下角 -> 右下角 -> 右上角
    0, 1, 2,
    // 第二个三角形：左下角 -> 右上角 -> 左上角
    0, 2, 3,
    // 四个侧面（三角形）
    // 第一个侧面：左下角 -> 右下角 -> 顶点
    0, 1, 4,
    // 第二个侧面：右下角 -> 右上角 -> 顶点
    1, 2, 4,
    // 第三个侧面：右上角 -> 左上角 -> 顶点
    2, 3, 4,
    // 第四个侧面：左上角 -> 左下角 -> 顶点
    3, 0, 4
  ])

  const geometry = new Cesium.Geometry({
    attributes: {
      position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: positions
      })
    },
    indices: indices,
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
  })

  return geometry
}

// 创建四棱锥边框
function createPyramidEdgeGeometry(satellitePosition) {
  const baseSize = PYRAMID_BASE_SIZE
  const height = PYRAMID_HEIGHT

  const positions = [
    // 底面四个顶点和顶点
    new Cesium.Cartesian3(-baseSize, -baseSize, 0.0),
    new Cesium.Cartesian3(baseSize, -baseSize, 0.0),
    new Cesium.Cartesian3(baseSize, baseSize, 0.0),
    new Cesium.Cartesian3(-baseSize, baseSize, 0.0),
    new Cesium.Cartesian3(
      satellitePosition.x,
      satellitePosition.y,
      satellitePosition.z + height
    )
  ]

  // 边框线条的顶点
  const edgePositions = [].concat(
    positions[0],
    positions[1],
    positions[1],
    positions[2],
    positions[2],
    positions[3],
    positions[3],
    positions[0],
    positions[0],
    positions[4],
    positions[1],
    positions[4],
    positions[2],
    positions[4],
    positions[3],
    positions[4]
  )

  return new Cesium.PolylineGeometry({
    positions: edgePositions,
    width: 1.0,
    vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
    arcType: Cesium.ArcType.NONE // 使用直线插值
  })
}

// 自定义着色器代码
const dynamicCircleMaterial = new Cesium.Material({
  fabric: {
    type: 'Ripple',
    uniforms: {
      color: new Cesium.Color(0.0, 0.0, 1.0, 1.0), // 波纹的颜色，蓝色
      frequency: 5.0, // 波纹频率
      amplitude: 0.1 // 波纹振幅
    },
    source: `
      czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        
        // 获取纹理坐标
        vec2 st = materialInput.st;

        // 计算波纹效果
        float wave = sin(st.x * frequency + czm_frameNumber * 0.1) * amplitude;
        
        // 在纹理上应用波纹效果
        vec2 rippleSt = st + vec2(0.0, wave);

        // 从纹理中采样颜色
        vec4 color = texture2D(czm_materialInput.diffuse, rippleSt);
        
        // 混合波纹颜色和原始颜色
        material.diffuse = mix(material.diffuse, color.rgb, color.a);
        material.alpha = color.a;

        return material;
      }
    `
  }
})

function startSimulation(ifLat, degree, viewer) {
  //获取路径
  let path = getRandState(ifLat, degree)

  //卫星环绕
  var satellitePath = computePosition(path, 1)
  var satelliteEntity = viewer.entities.add({
    // 将实体availability设置为与模拟时间相同的时间间隔。
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop
      })
    ]),
    //计算实体位置属性
    position: satellitePath,
    //基于位置移动自动计算方向.
    orientation: new Cesium.VelocityOrientationProperty(satellitePath),
    //加载飞机模型
    model: {
      uri: '/static/model/weixing.glb',
      minimumPixelSize: 32,
      scale: 2000.0
    },
    //白色路径
    path: {
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.PINK
      }),
      width: 5
    }
  })

  //扫描四棱锥
  const pyramidGeometry = createPyramidGeometry(Cesium.Cartesian3.ZERO)
  const pyramidEdgeGeometry = createPyramidEdgeGeometry(Cesium.Cartesian3.ZERO)

  let pyramidPrimitive = viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: pyramidGeometry,
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.ZERO
        )
      }),
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: new Cesium.Color(1.0, 1.0, 1.0, 0.4) // 白色，透明度 0.7
        })
        // material: dynamicCircleMaterial
      })
    })
  )
  let pyramidEdgePrimitive = viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: pyramidEdgeGeometry,
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.ZERO
        )
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: new Cesium.Color(1.0, 1.0, 1.0, 1) // 白色，透明度 1
        })
      })
    })
  )

  // 在每次渲染前更新四棱锥的位置
  viewer.scene.preRender.addEventListener(() => {
    const currentTime = viewer.clock.currentTime
    const position = satellitePath.getValue(currentTime)
    if (position) {
      // 获取当前模型矩阵
      let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)

      // 将四棱锥高度降低 PYRAMID_HEIGHT 米
      const heightOffset = -PYRAMID_HEIGHT // 降低 PYRAMID_HEIGHT 米
      const translation = Cesium.Cartesian3.fromElements(0, 0, heightOffset)
      const translationMatrix = Cesium.Matrix4.fromTranslation(translation)

      // 将平移矩阵与初始变换矩阵相乘
      modelMatrix = Cesium.Matrix4.multiply(
        modelMatrix,
        translationMatrix,
        new Cesium.Matrix4()
      )

      // 更新四棱锥的模型矩阵
      pyramidPrimitive.modelMatrix = modelMatrix
      pyramidEdgePrimitive.modelMatrix = modelMatrix
    }
  })

  //插值器
  satelliteEntity.position.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
  })
  // 更新相机位置（上帝视角）
  viewer.trackedEntity = satelliteEntity
}
