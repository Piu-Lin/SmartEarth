import {
  Cartesian3,
  Math as CesiumMath,
  Color,
  Entity,
  Matrix3,
  VerticalOrigin,
} from "cesium";
import { atmosphericLoss, earthBlockLoss, freeSpaceLoss } from "./loss";
import { geoSoT_encode_3D_32bits } from "./sot";

export function drawCircleAroundSatellite(viewer, pointOnCircle) {
  // 地球中心作为圆心
  const earthCenter = new Cartesian3(0, 0, 0);

  // 计算圆的半径（地心到该点的距离）
  const radius = Cartesian3.distance(earthCenter, pointOnCircle);

  // 获取该点相对于地球中心的单位向量
  const unitVector = Cartesian3.normalize(pointOnCircle, new Cartesian3());

  // 用于存储轨迹点
  const positions = [];

  // 生成圆形轨迹点，绕Z轴旋转一圈
  for (let i = 0; i <= 360; i += 1) {
    // 计算当前角度的旋转矩阵
    const angle = CesiumMath.toRadians(i);
    const rotationMatrix = Matrix3.fromRotationZ(angle);

    // 旋转单位向量
    const rotatedVector = Matrix3.multiplyByVector(
      rotationMatrix,
      unitVector,
      new Cartesian3(),
    );

    // 计算旋转后的点的位置
    const position = Cartesian3.multiplyByScalar(
      rotatedVector,
      radius,
      new Cartesian3(),
    );
    positions.push(position);
  }

  // 绘制圆形轨迹
  viewer.entities.add({
    polyline: {
      positions: positions,
      width: 2,
      material: Color.RED,
    },
  });
}

export function drawLine(viewer) {
  // 定义卫星和地球表面点的坐标
  const satellitePosition = Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cartesian3.fromDegrees(120.0988, 0);

  // 线段的分割数量
  const segments = 50;

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2
    return new Color(1.0, 0.0, 0.0, alpha); // 红色(RGB: 1, 0, 0)基础上调整alpha
  }

  // 创建线段
  for (let i = 0; i < segments; i++) {
    const startRatio = i / segments;
    const endRatio = (i + 1) / segments;

    const startPosition = Cartesian3.lerp(
      satellitePosition,
      earthSurfacePosition,
      startRatio,
      new Cartesian3(),
    );
    const endPosition = Cartesian3.lerp(
      satellitePosition,
      earthSurfacePosition,
      endRatio,
      new Cartesian3(),
    );

    const color = getColorForSegment(i, segments);

    const signalLineSegment = new Entity({
      polyline: {
        positions: [startPosition, endPosition],
        width: 5,
        material: color,
      },
    });

    viewer.entities.add(signalLineSegment);
  }
}

export function drawCone4(viewer) {
  const satellitePosition = Cartesian3.fromDegrees(120.0988, 0, 20200 * 1000);
  const earthSurfacePosition = Cartesian3.fromDegrees(120.0988, 0);

  const segments = 50;
  const apexAngle = CesiumMath.toRadians(42.6); // 转换为弧度
  const coneHeight = Cartesian3.distance(
    satellitePosition,
    earthSurfacePosition,
  );
  const baseRadius = Math.tan(apexAngle / 2) * coneHeight;

  // 计算单位向量从地球表面指向卫星
  const direction = Cartesian3.normalize(
    Cartesian3.subtract(
      earthSurfacePosition,
      satellitePosition,
      new Cartesian3(),
    ),
    new Cartesian3(),
  );

  // 使用指数函数计算非线性alpha值
  function getColorForSegment(segmentIndex, totalSegments) {
    const normalizedIndex = segmentIndex / totalSegments;
    const alpha = Math.pow(1.0 - normalizedIndex, 2); // 非线性变化，指数为2

    // 计算从绿色到黄色的渐变
    const red = 0.5 * normalizedIndex;
    const green = 0.7 * (1 - normalizedIndex);
    const blue = 0.1;

    return new Color(red, green, blue, alpha);
  }

  // 生成旋转矩阵，分别绕赤道方向旋转42.6/2度（正向和反向）
  const rotationAngle = CesiumMath.toRadians(42.6 / 2);
  const rotationMatrixPositive = Matrix3.fromRotationZ(rotationAngle);
  const rotationMatrixNegative = Matrix3.fromRotationZ(-rotationAngle);

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

      const startOffset = Cartesian3.multiplyByScalar(
        direction,
        startHeight,
        new Cartesian3(),
      );
      const endOffset = Cartesian3.multiplyByScalar(
        direction,
        endHeight,
        new Cartesian3(),
      );

      const startPosition = Cartesian3.add(
        satellitePosition,
        startOffset,
        new Cartesian3(),
      );
      const endPosition = Cartesian3.add(
        satellitePosition,
        endOffset,
        new Cartesian3(),
      );

      // 生成圆锥表面的圆周上的点
      for (let j = 0; j < 360; j += 5) {
        // 每1度一个点，覆盖圆周
        const angle = CesiumMath.toRadians(j);

        const startSurfacePosition = Cartesian3.add(
          startPosition,
          Cartesian3.multiplyByScalar(
            Cartesian3.cross(
              direction,
              new Cartesian3(Math.cos(angle), Math.sin(angle), 0),
              new Cartesian3(),
            ),
            startRadius,
            new Cartesian3(),
          ),
          new Cartesian3(),
        );

        const endSurfacePosition = Cartesian3.add(
          endPosition,
          Cartesian3.multiplyByScalar(
            Cartesian3.cross(
              direction,
              new Cartesian3(Math.cos(angle), Math.sin(angle), 0),
              new Cartesian3(),
            ),
            endRadius,
            new Cartesian3(),
          ),
          new Cartesian3(),
        );

        // 将位置相对于卫星顶点的向量旋转
        const startVectorFromApex = Cartesian3.subtract(
          startSurfacePosition,
          satellitePosition,
          new Cartesian3(),
        );
        const endVectorFromApex = Cartesian3.subtract(
          endSurfacePosition,
          satellitePosition,
          new Cartesian3(),
        );

        const rotatedStartVector = Matrix3.multiplyByVector(
          rotationMatrix,
          startVectorFromApex,
          new Cartesian3(),
        );
        const rotatedEndVector = Matrix3.multiplyByVector(
          rotationMatrix,
          endVectorFromApex,
          new Cartesian3(),
        );

        // 计算旋转后的最终位置
        const rotatedStartSurfacePosition = Cartesian3.add(
          satellitePosition,
          rotatedStartVector,
          new Cartesian3(),
        );
        const rotatedEndSurfacePosition = Cartesian3.add(
          satellitePosition,
          rotatedEndVector,
          new Cartesian3(),
        );

        const color = getColorForSegment(i, segments);

        // 假设这些是你的自定义数据
        const lambda = 0.03; // 波长，单位：米
        const d = Cartesian3.distance(
          rotatedStartSurfacePosition,
          rotatedEndSurfacePosition,
        ); // 计算距离
        const surfaceDistance = Cartesian3.distance(
          rotatedStartSurfacePosition,
          earthSurfacePosition,
        ); // 从起始点到地球表面的距离
        const centerDistance = Cartesian3.distance(
          rotatedEndSurfacePosition,
          Cartesian3.ZERO,
        ); // 从终点到地球球心的距离
        const beta = [0.001, 0.002, 0.003]; // 大气层衰减系数数组
        const s = [10000, 20000, 30000]; // 信号在电离层中的传播路径
        const l_O_SR = 6371000 + 20200000; // 地心在高轨航天器与GNSS卫星连线方向上的垂线长度
        const h_F2 = 300000; // 电离层F2层峰值高度
        const R_e = 6371000; // 地球半径

        // 计算各项损耗
        const freeSpaceLossValue = freeSpaceLoss(lambda, d);
        const atmosphericLossValue = atmosphericLoss(
          beta,
          s,
          surfaceDistance,
          h_F2,
          R_e,
        );
        const earthBlockLossValue = earthBlockLoss(centerDistance, R_e);

        // 创建description内容
        const descriptionContent = `
  <p><strong>自由空间传播损耗：</strong> ${freeSpaceLossValue.toFixed(2)} dB</p>
  <p><strong>大气层损耗：</strong> ${atmosphericLossValue.toFixed(2)} dB</p>
  <p><strong>地球遮挡损耗：</strong> ${earthBlockLossValue === -Infinity ? "完全遮挡" : `${earthBlockLossValue.toFixed(2)} dB`}</p>
  <p><strong>网格编码：</strong> ${geoSoT_encode_3D_32bits(rotatedStartSurfacePosition.x, rotatedStartSurfacePosition.y, rotatedStartSurfacePosition.z, 31)}</p>
`;

        // 创建信号线段实体，并加入description
        const signalLineSegment = new Entity({
          polyline: {
            positions: [rotatedStartSurfacePosition, rotatedEndSurfacePosition],
            width: 5,
            material: color,
          },
          description: descriptionContent,
        });

        // const signalLineSegment = new Entity({
        //   polyline: {
        //     positions: [rotatedStartSurfacePosition, rotatedEndSurfacePosition],
        //     width: 5,
        //     material: color,
        //   },
        // });

        viewer.entities.add(signalLineSegment);
      }
    }
  }

  // 创建原始的圆锥表面
  // createConeSurface(Matrix3.IDENTITY);
  // // 克隆并沿正方向旋转42.6/2度
  // createConeSurface(rotationMatrixPositive);
  // // 克隆并沿负方向旋转42.6/2度
  // createConeSurface(rotationMatrixNegative);
  for (let angle = -rotationAngle; angle < rotationAngle; angle += 0.02) {
    createConeSurface(Matrix3.fromRotationZ(angle));
  }
}

export function createGridDrawer(viewer) {
  const LineRGB = { 0: "", 1: "#33FFFF", 2: "#FF33FF" };
  const createdEntities = [];

  function drawGrid(hidden = false) {
    if (hidden) {
      // Hide all previously created entities
      createdEntities.forEach((entity) => {
        entity.show = false;
      });
      return;
    }

    let markk = 0;
    const entities = viewer.entities;

    for (let pHeight = 100000; pHeight < 1000000; pHeight += 500000) {
      markk += 1;
      for (let lang = -180, level = 0; lang <= 180; lang += 10) {
        let text = `p${level}`;
        if (lang === 0) {
          text = "p0";
        } else if (lang === -180) {
          text = "p0";
        }
        level += 1;

        const entity = entities.add({
          polyline: {
            positions: Cartesian3.fromDegreesArrayHeights([
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
            material: Color.fromCssColorString(LineRGB[markk]),
          },
          label: {
            text: text,
            verticalOrigin: VerticalOrigin.TOP,
            font: "12px sans-serif",
            fillColor: Color.WHITE,
          },
        });

        createdEntities.push(entity);

        for (let labellevel = -90; labellevel <= 90; labellevel += 10) {
          const labelEntity = entities.add({
            position: Cartesian3.fromDegrees(lang + 5, labellevel),
            label: {
              text: `p${labellevel + level + 90}`,
              verticalOrigin: VerticalOrigin.TOP,
              font: "12px sans-serif",
              fillColor: Color.WHITE,
            },
          });

          createdEntities.push(labelEntity);
        }
      }

      const langS = [];
      for (let lang = -180; lang <= 180; lang += 5) {
        langS.push(lang);
      }

      for (let lat = -80; lat <= 80; lat += 10) {
        const polylineEntity = entities.add({
          polyline: {
            positions: Cartesian3.fromDegreesArrayHeights(
              langS
                .map((long) => {
                  return [long, lat, pHeight].join(",");
                })
                .join(",")
                .split(",")
                .map((item) => Number(item)),
            ),
            width: 1.0,
            material: Color.fromCssColorString(LineRGB[markk]),
          },
        });

        createdEntities.push(polylineEntity);
      }
    }
  }

  return drawGrid;
}
