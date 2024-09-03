/**
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
 * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
 * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
 * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
 * @param {Boolean} options.enabled 阴影贴图是否可用。
 * @param {Boolean} options.softShadows 是否启用柔和阴影。
 * @param {Boolean} options.size 每个阴影贴图的大小。
 */
class videoFusion {

    constructor(viewer, options) {
        this.viewer = viewer;
        this.viewPosition = options.viewPosition; //开始坐标
        this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this
            .viewPositionEnd) : (options.viewDistance || 100.0); //观测距离
        this.horizontalViewAngle = options.horizontalViewAngle || 90.0; //可视域的水平夹角
        this.verticalViewAngle = options.verticalViewAngle || 60.0; //可视域的垂直夹角
        this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN; // 可视域颜色
        this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED; // 不可视域颜色
        this.enabled = (typeof options.enabled === "boolean") ? options.enabled : true; // 是否启用了阴影贴图，默认启用了
        this.softShadows = (typeof options.softShadows === "boolean") ? options.softShadows : true; // 是否启用百分比更接近过滤以产生更柔和的阴影，默认启用了
        this.size = options.size || 2048; // 每个阴影贴图的宽度和高度（以像素为单位）, 默认 2048
        this.viewPositionEnd = options.viewPositionEnd; //结束坐标
        this.viewHeading = this.viewPositionEnd ? this.getHeading(this.viewPosition, this.viewPositionEnd) : (
            options.viewHeading || 0.0);
        this.viewPitch = this.viewPositionEnd ? this.getPitch(this.viewPosition, this.viewPositionEnd) : (options
            .viewPitch || 0.0);
        // this.primitivesLayer = new Cesium.PrimitiveCollection();
        // this.primitivesLayer.destroyPrimitives = false;
    }

    add() {
        this.createLightCamera();
        this.videoFrustumOutline();
    }

    update() {
        this.clear();
        this.add();
    }
    /**
     * @method 更新可视域水平夹角、可视域垂直夹角
     *
     */
    updateHandV(newHorizontalViewAngle, newVerticalViewAngle) {
        this.horizontalViewAngle = newHorizontalViewAngle;
        this.verticalViewAngle = newVerticalViewAngle;
    }
    /**
     * @method 更新终点坐标，从而实时更新绘制的实体的方向和半径（计算新的起始点距离，偏航角和俯仰角）
     *  
     */
    updatePosition(viewPositionEnd) {
        this.viewPositionEnd = viewPositionEnd
        this.viewDistance = Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) //观测距离
        this.viewHeading = this.getHeading(this.viewPosition, this.viewPositionEnd)
        this.viewPitch = this.getPitch(this.viewPosition, this.viewPositionEnd)
    }

    /**
     * @method 创建视网
     * 在实时绘制椭球实体时，其实不是一直创建entity，而是改变实体的方向(orientation)和改变椭球的半径(radii)
     */
    drawSketch() {
        this.sketch = this.viewer.entities.add({
            name: 'sketch',
            position: this.viewPosition,
            orientation: new Cesium.CallbackProperty(() => Cesium.Transforms
                .headingPitchRollQuaternion( //实体的方向
                    this.viewPosition,
                    Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - 90.0, this.viewPitch, 0.0))),
            ellipsoid: { //椭球的半径
                radii: new Cesium.CallbackProperty(() => new Cesium.Cartesian3(
                    this.viewDistance,
                    this.viewDistance,
                    this.viewDistance)),
                innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0), //椭球内部的半径
                minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2), //椭圆形的最小时钟角度
                maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2), //椭球的最大时钟角度
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75), //椭圆形的最小圆锥角
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75), //椭球的最大圆锥角
                fill: false, //椭圆是否填充所提供的的材料
                outline: true, //是否勾勒出椭圆形
                subdivisions: 100, //每个轮廓环的样本数,确定曲率的粒度
                stackPartitions: 5, //堆栈数的属性
                slicePartitions: 5, //径向切片数量的属性
                outlineColor: Cesium.Color.YELLOWGREEN, //轮廓的颜色
            }
        });
    }

    clear() {
        if (this.sketch) {
            this.viewer.entities.remove(this.sketch);
            this.sketch = null;
        }
        if (this.videoPolygon) {
            this.viewer.entities.remove(this.videoPolygon);
            this.videoPolygon = null;
        }
        if (this.primitivesLayer) {
            this.viewer.scene.primitives.remove(this.primitivesLayer);
            this.primitivesLayer = null;
        }
    }

    /**
     * @method 创建相机
     */
    createLightCamera() {
        this.lightCamera = new Cesium.Camera(this.viewer.scene);
        this.lightCamera.position = this.viewPosition;
        // frustum: 视野中的区域
        this.lightCamera.frustum.near = this.viewDistance * 0.001;
        this.lightCamera.frustum.far = this.viewDistance;
        // 度数到弧度数的转换
        const hr = Cesium.Math.toRadians(this.horizontalViewAngle); // 水平方向 π/2
        const vr = Cesium.Math.toRadians(this.verticalViewAngle); // 垂直方向 π/3
        // aspectRatio 垂直边和水平边的比值
        const aspectRatio =
            (this.viewDistance * Math.tan(hr / 2) * 2) / (this.viewDistance * Math.tan(vr / 2) * 2);
        this.lightCamera.frustum.aspectRatio = aspectRatio;
        // fov 取水平夹角和垂直夹角中最大的一个
        if (hr > vr) {
            this.lightCamera.frustum.fov = hr;
        } else {
            this.lightCamera.frustum.fov = vr;
        }
        // 设置相机的位置，方向和变换
        this.lightCamera.setView({
            destination: this.viewPosition, // 位置
            orientation: { // 方向
                heading: Cesium.Math.toRadians(this.viewHeading || 0),
                pitch: Cesium.Math.toRadians(this.viewPitch || 0),
                roll: 0
            }
        });
    }

    /**
     * @method 获取偏航角
     */
    getHeading(fromPosition, toPosition) {
        let finalPosition = new Cesium.Cartesian3();
        let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
        Cesium.Matrix4.inverse(matrix4, matrix4);
        Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
        Cesium.Cartesian3.normalize(finalPosition, finalPosition);
        return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
    }

    /**
     * @method 获取俯仰角
     */
    getPitch(fromPosition, toPosition) {
        let finalPosition = new Cesium.Cartesian3();
        let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
        Cesium.Matrix4.inverse(matrix4, matrix4);
        Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
        Cesium.Cartesian3.normalize(finalPosition, finalPosition);
        return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
    }

    /**
     * @method 创建视频视锥线
     */
    videoFrustumOutline() {
        const scratchRight = new Cesium.Cartesian3();
        const scratchRotation = new Cesium.Matrix3();
        const scratchOrientation = new Cesium.Quaternion();
        const direction = this.lightCamera.directionWC;
        const up = this.lightCamera.upWC;
        let right = this.lightCamera.rightWC;
        right = Cesium.Cartesian3.negate(right, scratchRight);
        let rotation = scratchRotation;
        Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
        Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
        Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
        let orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);
        let geo = new Cesium.FrustumOutlineGeometry({
            frustum: this.lightCamera.frustum,
            origin: this.viewPosition,
            orientation: orientation
        });
        // 计算8个顶点的坐标
        let geoPositionArray = Cesium.FrustumOutlineGeometry.createGeometry(geo).attributes.position.values;
        let arr = [];
        arr.push(new Cesium.Cartesian3(geoPositionArray[12], geoPositionArray[13], geoPositionArray[14], ));
        arr.push(new Cesium.Cartesian3(geoPositionArray[15], geoPositionArray[16], geoPositionArray[17], ));
        arr.push(new Cesium.Cartesian3(geoPositionArray[18], geoPositionArray[19], geoPositionArray[20], ));
        arr.push(new Cesium.Cartesian3(geoPositionArray[21], geoPositionArray[22], geoPositionArray[23], ));
        let videoElement = document.getElementById("daolu");
        new Cesium.VideoSynchronizer({
            clock: this.viewer.clock,
            element: videoElement
        });
        this.viewer.clock.shouldAnimate = true;
        this.videoPolygon = this.viewer.entities.add({
            polygon: {
                hierarchy: arr,
                material: videoElement,
                clampToGround: true,
                fill: true,
            },
        })
        let instance = new Cesium.GeometryInstance({
            geometry: geo,
            id: Math.random().toString(36).substr(2),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.RED
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true)
            }
        });
        this.primitivesLayer = this.viewer.scene.primitives.add(
            new Cesium.Primitive({
                geometryInstances: [instance],
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: false
                })
            })
        );
    }
}

export default videoFusion;