<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import {onMounted, ref} from 'vue';

export default {
  name: 'CesiumGrid',
  setup() {
    const cesiumContainer = ref(null);
    let viewer = ref(null);

    // B-Spline interpolation functions
    function BSplineInterpolate(t, degree, points, knots, weights, result) {
      var i, j, s, l;
      var n = points.length;
      var d = points[0].length;

      if (degree < 1) throw new Error('Degree must be at least 1');
      if (degree > (n - 1)) throw new Error('Degree must be less than or equal to point count - 1');

      if (!weights) {
        weights = [];
        for (i = 0; i < n; i++) {
          weights[i] = 1;
        }
      }

      if (!knots) {
        knots = [];
        for (i = 0; i < n + degree + 1; i++) {
          knots[i] = i;
        }
      } else {
        if (knots.length !== n + degree + 1) throw new Error('Invalid knot vector length');
      }

      var domain = [degree, knots.length - 1 - degree];
      var low = knots[domain[0]];
      var high = knots[domain[1]];
      t = t * (high - low) + low;

      if (t < low || t > high) throw new Error('Out of bounds');

      for (s = domain[0]; s < domain[1]; s++) {
        if (t >= knots[s] && t <= knots[s + 1]) {
          break;
        }
      }

      var v = [];
      for (i = 0; i < n; i++) {
        v[i] = [];
        for (j = 0; j < d; j++) {
          v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
      }

      var alpha;
      for (l = 1; l <= degree + 1; l++) {
        for (i = s; i > s - degree - 1 + l; i--) {
          alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);
          for (j = 0; j < d + 1; j++) {
            v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
          }
        }
      }
      result = result || [];
      for (i = 0; i < d; i++) {
        result[i] = v[s][i] / v[s][d];
      }

      return result;
    }

    function BInterpolateCurve(points, interPointCount, degree = 3) {
      let newPoints = [];
      let firstPoint = points[0];
      let lastPoint = points[points.length - 1];
      for (let i = 0; i < degree - 1; ++i) {
        newPoints.push(firstPoint);
      }
      newPoints.push(...points);
      for (let i = 0; i < degree - 1; ++i) {
        newPoints.push(lastPoint);
      }
      let interPoints = [];
      for (let i = 0; i < interPointCount; ++i) {
        let t = i / (interPointCount - 1);
        let r = BSplineInterpolate(t, degree, newPoints);
        interPoints.push(r);
      }
      let results = [];
      let basex = firstPoint[0];
      let stepx = (lastPoint[0] - firstPoint[0]) / (interPointCount - 1);
      for (let i = 0; i < interPointCount; ++i) {
        let x = i * stepx + basex;
        for (let j = 0; j < interPoints.length - 1; ++j) {
          let x0 = interPoints[j][0];
          let x1 = interPoints[j + 1][0];
          let y0 = interPoints[j][1];
          let y1 = interPoints[j + 1][1];
          if (x0 <= x && x1 >= x) {
            results.push([x, (x - x0) / (x1 - x0) * (y1 - y0) + y0]);
            break;
          }
        }
      }
      while (results.length < interPointCount) {
        results.push(lastPoint);
      }
      return results;
    }

    function showGeometry() {
      let posArr = [];
      let dataPos = [];
      let rows = 10;  // Replace with your row data
      let cols = 10;  // Replace with your column data

      // Simulate rawDbPoints structure
      let rawDbPoints = {
        cols: cols,
        rows: rows,
        point: [],
        x0: dataPos[0]?.x,
        x1: dataPos[cols - 1]?.x,
        y0: dataPos[0]?.y,
        y1: dataPos[(rows - 1) * cols]?.y,
      };

      const multiplePoints = 5;
      let outCols = parseInt(cols * multiplePoints);
      let outRows = parseInt(rows * multiplePoints);
      const SmoothSplineDegree = 3;
      let smoothPoints = BInterpolateCurve(posArr, outRows, SmoothSplineDegree);
      rows *= multiplePoints;
      cols *= multiplePoints;
      setIndices(rows, cols);

      draw(smoothPoints, indices, lineIndices);
    }

    function setIndices(rows, cols) {
      let indices = [];
      let lineIndices = [];
      for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols - 1; j++) {
          let index = i * cols + j;
          indices.push(index);
          indices.push(index + 1);
          indices.push(index + cols);
          indices.push(index + 1);
          indices.push(index + 1 + cols);
          indices.push(index + cols);
          lineIndices.push(index);
          lineIndices.push(index + 1);
          lineIndices.push(index);
          lineIndices.push(index + cols);
        }
      }
      this.indices = new Uint32Array(indices);
      this.lineIndices = new Uint32Array(lineIndices);
    }

    function draw(points, indices, lineIndices) {
      let pos = [];
      let colorArr = [];
      points.forEach((item) => {
        item.forEach((p) => {
          let cartesian = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]);
          pos.push(cartesian.x, cartesian.y, cartesian.z);
          let color = getRangeColor(p[2]);
          colorArr.push(color.red, color.green, color.blue, color.alpha);
        });
      });

      let positions = new Float64Array(pos);
      let colors = new Float64Array(colorArr);
      let instances2DMesh = [];
      let geometry = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: positions
          }),
          color: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 4,
            values: colors
          }),
        },
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
      });

      var instanceMesh = new Cesium.GeometryInstance({
        geometry: geometry,
      });

      instances2DMesh.push(instanceMesh);
      let meshPrimitive = new Cesium.Primitive({
        geometryInstances: instances2DMesh,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        }),
        asynchronous: false
      });
      viewer.scene.primitives.add(meshPrimitive);
    }

    function getRangeColor(value) {
      // Implement your logic to determine color based on value
      // Here is an example of a basic color assignment
      return {
        red: value / 100,
        green: 1 - value / 100,
        blue: 0.5,
        alpha: 1.0
      };
    }

    onMounted(() => {
      Cesium.Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMTQxMGIzNC04N2M0LTQ0MDUtOTdlYi02ZGE0NTgyZGVjMzAiLCJpZCI6MzA5ODUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTQ2OTQ5NzN9.JbUqIgKO92noy6B8zcYMdq8QygnMKM70RIdJZqAwwdk";

      viewer = new Cesium.Viewer(cesiumContainer.value, {
        imageryProvider: false,
        baseLayerPicker: false
      });

      showGeometry();
    });

    return {
      cesiumContainer,
    };
  },
};
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100vh;
}
</style>
