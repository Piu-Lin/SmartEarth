export function drawCircleAroundSatellite(viewer, pointOnCircle) {
  // 地球中心作为圆心
  const earthCenter = new Cesium.Cartesian3(0, 0, 0);

  // 计算圆的半径（地心到该点的距离）
  const radius = Cesium.Cartesian3.distance(earthCenter, pointOnCircle);

  // 获取该点相对于地球中心的单位向量
  const unitVector = Cesium.Cartesian3.normalize(pointOnCircle, new Cesium.Cartesian3());

  // 用于存储轨迹点
  const positions = [];

  // 生成圆形轨迹点，绕Z轴旋转一圈
  for (let i = 0; i <= 360; i += 1) {
    // 计算当前角度的旋转矩阵
    const angle = Cesium.Math.toRadians(i);
    const rotationMatrix = Cesium.Matrix3.fromRotationZ(angle);

    // 旋转单位向量
    const rotatedVector = Cesium.Matrix3.multiplyByVector(
      rotationMatrix,
      unitVector,
      new Cesium.Cartesian3(),
    );

    // 计算旋转后的点的位置
    const position = Cesium.Cartesian3.multiplyByScalar(
      rotatedVector,
      radius,
      new Cesium.Cartesian3(),
    );
    positions.push(position);
  }

  // 绘制圆形轨迹
  viewer.entities.add({
    polyline: {
      positions: positions,
      width: 2,
      material: Cesium.Color.RED,
    },
  });
}

export function drawLine(viewer) {
  // 定义卫星和地球表面点的坐标
  const satellitePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0);

  // 线段的分割数量
  const segments = 50;

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2
    return new Cesium.Color(1.0, 0.0, 0.0, alpha); // 红色(RGB: 1, 0, 0)基础上调整alpha
  }

  // 创建线段
  for (let i = 0; i < segments; i++) {
    const startRatio = i / segments;
    const endRatio = (i + 1) / segments;

    const startPosition = Cesium.Cartesian3.lerp(
      satellitePosition,
      earthSurfacePosition,
      startRatio,
      new Cesium.Cartesian3(),
    );
    const endPosition = Cesium.Cartesian3.lerp(
      satellitePosition,
      earthSurfacePosition,
      endRatio,
      new Cesium.Cartesian3(),
    );

    const color = getColorForSegment(i, segments);

    const signalLineSegment = new Cesium.Entity({
      polyline: {
        positions: [startPosition, endPosition],
        width: 5,
        material: color,
      },
    });

    viewer.entities.add(signalLineSegment);
  }
}

export function drawCone(viewer) {
  const satellitePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0);

  const segments = 100;
  const apexAngle = Cesium.Math.toRadians(42.6); // 转换为弧度
  const coneHeight = Cesium.Cartesian3.distance(
    satellitePosition,
    earthSurfacePosition,
  );
  const baseRadius = Math.tan(apexAngle / 2) * coneHeight;

  // 计算单位向量从地球表面指向卫星
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      earthSurfacePosition,
      satellitePosition,
      new Cesium.Cartesian3(),
    ),
    new Cesium.Cartesian3(),
  );

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2
    return new Cesium.Color(1.0, 0.0, 0.0, alpha); // 红色(RGB: 1, 0, 0)基础上调整alpha
  }

  // 生成圆锥的表面线段
  for (let i = 0; i < segments; i++) {
    const startRatio = i / segments;
    const endRatio = (i + 1) / segments;

    // 计算每段的起始和结束位置
    const startRadius = startRatio * baseRadius;
    const endRadius = endRatio * baseRadius;

    const startHeight = startRatio * coneHeight;
    const endHeight = endRatio * coneHeight;

    const startOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      startHeight,
      new Cesium.Cartesian3(),
    );
    const endOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      endHeight,
      new Cesium.Cartesian3(),
    );

    const startPosition = Cesium.Cartesian3.add(
      satellitePosition,
      startOffset,
      new Cesium.Cartesian3(),
    );
    const endPosition = Cesium.Cartesian3.add(
      satellitePosition,
      endOffset,
      new Cesium.Cartesian3(),
    );

    // 生成圆锥表面的圆周上的点
    for (let j = 0; j < 360; j += 1) {
      // 每1度一个点，覆盖圆周
      const angle = Cesium.Math.toRadians(j);

      const startSurfacePosition = Cesium.Cartesian3.add(
        startPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          startRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      const endSurfacePosition = Cesium.Cartesian3.add(
        endPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          endRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      const color = getColorForSegment(i, segments);

      const signalLineSegment = new Cesium.Entity({
        polyline: {
          positions: [startSurfacePosition, endSurfacePosition],
          width: 5,
          material: color,
        },
      });

      viewer.entities.add(signalLineSegment);
    }
  }
}

export function drawCone3(viewer) {
  const satellitePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0);

  const segments = 100;
  const apexAngle = Cesium.Math.toRadians(42.6); // 转换为弧度
  const coneHeight = Cesium.Cartesian3.distance(
    satellitePosition,
    earthSurfacePosition,
  );
  const baseRadius = Math.tan(apexAngle / 2) * coneHeight;

  // 计算单位向量从地球表面指向卫星
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      earthSurfacePosition,
      satellitePosition,
      new Cesium.Cartesian3(),
    ),
    new Cesium.Cartesian3(),
  );

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2
    return new Cesium.Color(1.0, 0.0, 0.0, alpha); // 红色(RGB: 1, 0, 0)基础上调整alpha
  }

  // 生成旋转矩阵，绕赤道方向旋转42.6/2度
  const rotationAngle = Cesium.Math.toRadians(42.6 / 2);
  const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle);

  // 生成圆锥的表面线段
  for (let i = 0; i < segments; i++) {
    const startRatio = i / segments;
    const endRatio = (i + 1) / segments;

    // 计算每段的起始和结束位置
    const startRadius = startRatio * baseRadius;
    const endRadius = endRatio * baseRadius;

    const startHeight = startRatio * coneHeight;
    const endHeight = endRatio * coneHeight;

    const startOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      startHeight,
      new Cesium.Cartesian3(),
    );
    const endOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      endHeight,
      new Cesium.Cartesian3(),
    );

    const startPosition = Cesium.Cartesian3.add(
      satellitePosition,
      startOffset,
      new Cesium.Cartesian3(),
    );
    const endPosition = Cesium.Cartesian3.add(
      satellitePosition,
      endOffset,
      new Cesium.Cartesian3(),
    );

    // 生成圆锥表面的圆周上的点
    for (let j = 0; j < 360; j += 1) {
      // 每1度一个点，覆盖圆周
      const angle = Cesium.Math.toRadians(j);

      const startSurfacePosition = Cesium.Cartesian3.add(
        startPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          startRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      const endSurfacePosition = Cesium.Cartesian3.add(
        endPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          endRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      // 将位置相对于卫星顶点的向量旋转
      const startVectorFromApex = Cesium.Cartesian3.subtract(
        startSurfacePosition,
        satellitePosition,
        new Cesium.Cartesian3(),
      );
      const endVectorFromApex = Cesium.Cartesian3.subtract(
        endSurfacePosition,
        satellitePosition,
        new Cesium.Cartesian3(),
      );

      const rotatedStartVector = Cesium.Matrix3.multiplyByVector(
        rotationMatrix,
        startVectorFromApex,
        new Cesium.Cartesian3(),
      );
      const rotatedEndVector = Cesium.Matrix3.multiplyByVector(
        rotationMatrix,
        endVectorFromApex,
        new Cesium.Cartesian3(),
      );

      // 计算旋转后的最终位置
      const rotatedStartSurfacePosition = Cesium.Cartesian3.add(
        satellitePosition,
        rotatedStartVector,
        new Cesium.Cartesian3(),
      );
      const rotatedEndSurfacePosition = Cesium.Cartesian3.add(
        satellitePosition,
        rotatedEndVector,
        new Cesium.Cartesian3(),
      );

      const color = getColorForSegment(i, segments);

      const signalLineSegment = new Cesium.Entity({
        polyline: {
          positions: [rotatedStartSurfacePosition, rotatedEndSurfacePosition],
          width: 5,
          material: color,
        },
      });

      viewer.entities.add(signalLineSegment);
    }
  }
}

export function drawCone4(viewer, segments = 30, step_i = 8) {
  const satellitePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0);

  const apexAngle = Cesium.Math.toRadians(42.6); // 转换为弧度
  const coneHeight = Cesium.Cartesian3.distance(
    satellitePosition,
    earthSurfacePosition,
  );
  const baseRadius = Math.tan(apexAngle / 2) * coneHeight;

  // 计算单位向量从地球表面指向卫星
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      earthSurfacePosition,
      satellitePosition,
      new Cesium.Cartesian3(),
    ),
    new Cesium.Cartesian3(),
  );

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2

    // 计算从绿色到黄色的渐变
    const red = 0.5 * normalizedIndex;
    const green = 0.7 * (1 - normalizedIndex);
    const blue = 0.1;

    return new Cesium.Color(red, green, blue, alpha);
  }

  // 生成旋转矩阵，分别绕赤道方向旋转42.6/2度（正向和反向）
  const rotationAngle = Cesium.Math.toRadians(42.6 / 2);
  const rotationMatrixPositive = Cesium.Matrix3.fromRotationZ(rotationAngle);
  const rotationMatrixNegative = Cesium.Matrix3.fromRotationZ(-rotationAngle);

  // 生成圆锥的表面线段并克隆
  function createConeSurface(rotationMatrix) {
    for (let i = 0; i < segments; i++) {
      const startRatio = i / segments;
      const endRatio = (i + 1) / segments;

      // 计算每段的起始和结束位置
      const startRadius = startRatio * baseRadius;
      const endRadius = endRatio * baseRadius;

      const startHeight = startRatio * coneHeight;
      const endHeight = endRatio * coneHeight;

      const startOffset = Cesium.Cartesian3.multiplyByScalar(
        direction,
        startHeight,
        new Cesium.Cartesian3(),
      );
      const endOffset = Cesium.Cartesian3.multiplyByScalar(
        direction,
        endHeight,
        new Cesium.Cartesian3(),
      );

      const startPosition = Cesium.Cartesian3.add(
        satellitePosition,
        startOffset,
        new Cesium.Cartesian3(),
      );
      const endPosition = Cesium.Cartesian3.add(
        satellitePosition,
        endOffset,
        new Cesium.Cartesian3(),
      );

      // 生成圆锥表面的圆周上的点
      for (let j = 0; j < 360; j += step_i) {
        // 每1度一个点，覆盖圆周
        const angle = Cesium.Math.toRadians(j);

        const startSurfacePosition = Cesium.Cartesian3.add(
          startPosition,
          Cesium.Cartesian3.multiplyByScalar(
            Cesium.Cartesian3.cross(
              direction,
              new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
              new Cesium.Cartesian3(),
            ),
            startRadius,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        );

        const endSurfacePosition = Cesium.Cartesian3.add(
          endPosition,
          Cesium.Cartesian3.multiplyByScalar(
            Cesium.Cartesian3.cross(
              direction,
              new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
              new Cesium.Cartesian3(),
            ),
            endRadius,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        );

        // 将位置相对于卫星顶点的向量旋转
        const startVectorFromApex = Cesium.Cartesian3.subtract(
          startSurfacePosition,
          satellitePosition,
          new Cesium.Cartesian3(),
        );
        const endVectorFromApex = Cesium.Cartesian3.subtract(
          endSurfacePosition,
          satellitePosition,
          new Cesium.Cartesian3(),
        );

        const rotatedStartVector = Cesium.Matrix3.multiplyByVector(
          rotationMatrix,
          startVectorFromApex,
          new Cesium.Cartesian3(),
        );
        const rotatedEndVector = Cesium.Matrix3.multiplyByVector(
          rotationMatrix,
          endVectorFromApex,
          new Cesium.Cartesian3(),
        );

        // 计算旋转后的最终位置
        const rotatedStartSurfacePosition = Cesium.Cartesian3.add(
          satellitePosition,
          rotatedStartVector,
          new Cesium.Cartesian3(),
        );
        const rotatedEndSurfacePosition = Cesium.Cartesian3.add(
          satellitePosition,
          rotatedEndVector,
          new Cesium.Cartesian3(),
        );

        const color = getColorForSegment(i, segments);

        const signalLineSegment = new Cesium.Entity({
          polyline: {
            positions: [rotatedStartSurfacePosition, rotatedEndSurfacePosition],
            width: 5,
            material: color,
          },
        });

        viewer.entities.add(signalLineSegment);
      }
    }
  }

  // 创建原始的圆锥表面
  // createConeSurface(Cesium.Matrix3.IDCesium.Entity);
  // // 克隆并沿正方向旋转42.6/2度
  // createConeSurface(rotationMatrixPositive);
  // // 克隆并沿负方向旋转42.6/2度
  // createConeSurface(rotationMatrixNegative);
  for (let angle = -rotationAngle; angle < rotationAngle; angle += 0.02) {
    createConeSurface(Cesium.Matrix3.fromRotationZ(angle));
  }
}

export function drawCone2(viewer) {
  // 创建一个父实体
  const parentEntity = viewer.entities.add({
    name: "Combined Polylines",
  });
  const satellitePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cesium.Cartesian3.fromDegrees(120.0988, 0);

  const segments = 50;
  const apexAngle = Cesium.Math.toRadians(42.6); // 转换为弧度
  const coneHeight = Cesium.Cartesian3.distance(
    satellitePosition,
    earthSurfacePosition,
  );
  const baseRadius = Math.tan(apexAngle / 2) * coneHeight;

  // 计算单位向量从地球表面指向卫星
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      earthSurfacePosition,
      satellitePosition,
      new Cesium.Cartesian3(),
    ),
    new Cesium.Cartesian3(),
  );

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2
    return new Cesium.Color(1.0, 0.0, 0.0, alpha); // 红色(RGB: 1, 0, 0)基础上调整alpha
  }

  // 生成圆锥的表面线段
  const entities = [];
  for (let i = 0; i < segments; i++) {
    const startRatio = i / segments;
    const endRatio = (i + 1) / segments;

    // 计算每段的起始和结束位置
    const startRadius = startRatio * baseRadius;
    const endRadius = endRatio * baseRadius;

    const startHeight = startRatio * coneHeight;
    const endHeight = endRatio * coneHeight;

    const startOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      startHeight,
      new Cesium.Cartesian3(),
    );
    const endOffset = Cesium.Cartesian3.multiplyByScalar(
      direction,
      endHeight,
      new Cesium.Cartesian3(),
    );

    const startPosition = Cesium.Cartesian3.add(
      satellitePosition,
      startOffset,
      new Cesium.Cartesian3(),
    );
    const endPosition = Cesium.Cartesian3.add(
      satellitePosition,
      endOffset,
      new Cesium.Cartesian3(),
    );

    // 生成圆锥表面的圆周上的点
    for (let j = 0; j < 360; j += 10) {
      // 每1度一个点，覆盖圆周
      const angle = Cesium.Math.toRadians(j);

      const startSurfacePosition = Cesium.Cartesian3.add(
        startPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          startRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      const endSurfacePosition = Cesium.Cartesian3.add(
        endPosition,
        Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.cross(
            direction,
            new Cesium.Cartesian3(Math.cos(angle), Math.sin(angle), 0),
            new Cesium.Cartesian3(),
          ),
          endRadius,
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      );

      const color = getColorForSegment(i, segments);

      const signalLineSegment = viewer.entities.add({
        parent: parentCesium.Entity, // 这里设置父实体
        polyline: {
          positions: [startSurfacePosition, endSurfacePosition],
          width: 5,
          material: color,
        },
      });

      // 存储生成的实体
      entities.push(signalLineSegment);
    }
  }

  // 定义旋转轴和角度
  const rotationAxis = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(
      satellitePosition,
      earthSurfacePosition,
      new Cesium.Cartesian3(),
    ),
    new Cesium.Cartesian3(),
  );
  for (let i = 0; i < 360; i += 5) {
    const rotationAngle = Cesium.Math.toRadians(i);

    // 创建四元数表示旋转
    const quaternion = Cesium.Quaternion.fromAxisAngle(rotationAxis, rotationAngle);

    // 创建旋转矩阵
    const rotationMatrix = Cesium.Matrix3.fromCesium.Quaternion(quaternion);

    // 旋转并克隆每个实体的 position
    entities.forEach((entity) => {
      const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
      const rotatedPositions = positions.map((position) => {
        // 将点相对于 satellitePosition 的偏移量计算出来
        const offset = Cesium.Cartesian3.subtract(
          position,
          satellitePosition,
          new Cesium.Cartesian3(),
        );

        // 旋转偏移量
        const rotatedOffset = Cesium.Matrix3.multiplyByVector(
          rotationMatrix,
          offset,
          new Cesium.Cartesian3(),
        );

        // 得到旋转后的新位置
        return Cesium.Cartesian3.add(
          satellitePosition,
          rotatedOffset,
          new Cesium.Cartesian3(),
        );
      });

      // 克隆实体并更新旋转后的位置信息
      viewer.entities.add({
        polyline: {
          positions: rotatedPositions,
          width: Cesium.Entity.polyline.width,
          material: Cesium.Entity.polyline.material,
        },
      });
    });
  }
}
