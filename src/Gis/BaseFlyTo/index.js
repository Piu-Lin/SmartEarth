// import * as Cesium from 'cesium';
import Cameras from '../enum/Cameras'

export default class BaseFlyTo {
    // 根据类型飞行
    flyTobyType(type) {
        if (Cameras[type]) {
            this.flyTo(Cameras[type]);
        }
    }

    // 飞到视角
    flyTo(view) {
        const {viewer} = this;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                view.longitude || view.x, view.latitude || view.y, view.height || (view.z + 400),
            ),
            orientation: {
                heading: view.heading || Cesium.Math.toRadians(0),
                pitch: view.pitch || Cesium.Math.toRadians(-90),
                roll: view.roll || Cesium.Math.toRadians(0),
            },
        });
    }

    // 缩放到视角
    zoomTo(view) {
        const {viewer} = this;
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                view.longitude || view.x, view.latitude || view.y, view.height || (view.z + 400),
            ),
            orientation: {
                heading: view.heading || Cesium.Math.toRadians(0),
                pitch: view.pitch || Cesium.Math.toRadians(-90),
                roll: view.roll || Cesium.Math.toRadians(0),
            },
        });
    }

    // 绕点旋转
    aroundPoint() {
        // 步长
        let step = 0.01;
        if (this.setTimeOutId) {
            clearTimeout(this.setTimeOutId);
            this.viewer.entities.remove(this.aroundPointEntity);
        }
        this.setTimeOutId = setTimeout(() => {
            if (this.setIntervalID) {
                clearInterval(this.setIntervalID);
            }
            // 添加实体
            this.aroundPointEntity = this.viewer.entities.add({
                point: {
                    color: Cesium.Color.BLUE,
                    pixelSize: 1
                }
            });
            let height = this.viewer.camera.positionCartographic.height*1.98;
            let pitch = this.viewer.camera.pitch;
            if (pitch>-0.2) return;
            let initialHeading = Cesium.Math.toDegrees(this.viewer.camera.heading);
            // console.log(height,initialHeading)
            this.setIntervalID = setInterval(() => {
                let cartesian = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(this.viewer.canvas.clientWidth / 2, this.viewer.canvas.clientHeight / 2));
                if (!cartesian) return;
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                this.aroundPointEntity.position = new Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), 0);
                if (initialHeading < 0) {
                    initialHeading = 360;
                }
                let offset = new Cesium.HeadingPitchRange(
                    Cesium.Math.toRadians(initialHeading),
                    pitch,
                    height
                );
                this.viewer.zoomTo(this.aroundPointEntity, offset);
                initialHeading -= step;
            }, 10);
        },5000);
    }

    // 相机旋转
    autoRotation(amount) {
        this.viewer.clock.shouldAnimate = true;
        this.viewer.clock.onTick.addEventListener(() => {
            let { heading, pitch, roll } = this.viewer.camera;
            heading += Cesium.Math.toRadians(amount);
            if (heading >= Math.PI * 2 || heading <= -Math.PI * 2) {
                heading = 0;
            }
            this.viewer.camera.setView({
                orientation: {
                    heading: heading,
                    pitch: pitch,
                    roll: roll
                }
            })
        });
    }

    // 飞到网格
    flyToGrid(entity, height, isHighlight) {
        if(!isHighlight){
            // 高亮显示
            this.highlightPolygon(entity);
        }
        const { viewer } = this;
        const polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
        let polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(polyCenter);
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees((cartographic.longitude * 180) / Math.PI, (cartographic.latitude * 180) / Math.PI, height)
        });
    }

    // 飞到实体
    flyToEntity(entity) {
        const {viewer} = this;
        const {camera, scene,} = viewer;

        const polyPositions = entity.polygon.hierarchy.getValue(
            Cesium.JulianDate.now(),
        ).positions;

        const cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic);
        const focusBoundingSphere = Cesium.BoundingSphere.fromPoints(polyPositions);
        const {center} = focusBoundingSphere;

        camera.flyToBoundingSphere(focusBoundingSphere, {
            offset: new Cesium.HeadingPitchRange(0,
                // do not use camera.pitch since the pitch at the center/target is required
                Cesium.Math.toRadians(-45),
                // distanceToBoundingSphere returns wrong values when in 2D or Columbus view so do not use
                // camera.distanceToBoundingSphere(focusBoundingSphere)
                // instead calculate distance manually
                Cesium.Cartesian3.distance(cameraPosition, center)),
            duration: 1.5,
        });
    }

    // 飞到实体线
    flyToLine(entity) {
        const {viewer} = this;
        const {camera, scene,} = viewer;

        const polyPositions = entity.polyline.positions.getValue();

        const cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic);
        const focusBoundingSphere = Cesium.BoundingSphere.fromPoints(polyPositions);
        const {center} = focusBoundingSphere;
        console.log(center);

        camera.flyToBoundingSphere(focusBoundingSphere, {
            offset: new Cesium.HeadingPitchRange(0,
                // do not use camera.pitch since the pitch at the center/target is required
                Cesium.Math.toRadians(-45),
                // distanceToBoundingSphere returns wrong values when in 2D or Columbus view so do not use
                // camera.distanceToBoundingSphere(focusBoundingSphere)
                // instead calculate distance manually
                Cesium.Cartesian3.distance(cameraPosition, center)),
            duration: 1.5,
        });
    }
}
