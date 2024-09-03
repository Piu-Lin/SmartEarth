<template>
    <panel-container
            ref="panelContainer"
            title="火焰效果"
            :visible="visible"
            @close="close"
            @miniaturized="miniaturized"
            class="xt-fire-panel"
    >
        <template v-slot:panel-content class="xt-paths-content">
            <div class="map-center-box">
                <el-main>
                    <el-form ref="form"
                             :model="viewModel"
                             label-width="100px">
                        <el-form-item label="数量">
                            <el-slider v-model="viewModel.emissionRate"
                                       :min="0.0"
                                       :max="500.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="粒子大小">
                            <el-slider v-model="viewModel.particleSize"
                                       :min="0.5"
                                       :max="3.0"
                                       :step="0.1"></el-slider>
                        </el-form-item>
                        <el-form-item label="最小生命周期">
                            <el-slider v-model="viewModel.minimumParticleLife"
                                       :min="0.1"
                                       :max="3.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="最大生命周期">
                            <el-slider v-model="viewModel.maximumParticleLife"
                                       :min="0.1"
                                       :max="5.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="最小速度">
                            <el-slider v-model="viewModel.minimumSpeed"
                                       :min="0.0"
                                       :max="5"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="最大速度">
                            <el-slider v-model="viewModel.maximumSpeed"
                                       :min="0.0"
                                       :max="10.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="初始比例">
                            <el-slider v-model="viewModel.startScale"
                                       :min="0.0"
                                       :max="3.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="终止比例">
                            <el-slider v-model="viewModel.endScale"
                                       :min="0.0"
                                       :max="2.0"
                                       :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="放射类型">
                            <el-select v-model="typevalue"
                                       placeholder="请选择">
                                <el-option v-for="item in options"
                                           :key="item.value"
                                           :label="item.label"
                                           :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-main>
            </div>
        </template>

    </panel-container>
</template>

<script setup>
    import PanelContainer from "../PanelContainer";
    import MeasureType from "@/Gis/enum/MeasureType";
    import TriangleLinePrimitive from "@/Gis/feature/TriangleLinePrimitive";
    import pickGloble from "@/Gis/tools/pickGloble";
    import CursorStyle from "@/Gis/enum/CursorStyle";
    import {inject, nextTick, onMounted, ref, watch} from "vue";
    import _ from "lodash"

    const EntityLayerName = "fireDataSource";
    const gisViewer = inject("bigScreenMap");

    // let particleSystemForFire = reactive({});
    // let entity = reactive({});
    // let handler = reactive({});

    let viewModel = reactive({
        emissionRate: 200,
        minimumParticleLife: 1.5,
        maximumParticleLife: 1.8,
        minimumSpeed: 3.0,
        maximumSpeed: 8.0,
        startScale: 2.0,
        endScale: 1.5,
        particleSize: 1,
    });


    const typevalue = ref("圆锥体放射");

    let options = reactive([
        {
            lable: '圆形放射',
            value: '圆形放射'
        },
        {
            lable: '球体放射',
            value: '球体放射'
        },
        {
            lable: '圆锥体放射',
            value: '圆锥体放射'
        },
        {
            lable: '盒状放射',
            value: '盒状放射'
        },
    ]);


    let visible = ref(false);

    function miniaturized() {
        visible.value = false;
    }

    function close() {
        visible.value = false;
        // console.log(gisViewer.value.viewer.scene.primitives);
        // console.log(gisViewer.value.viewer.scene.primitives.length);
        // console.log(gisViewer.value.viewer.scene.primitives.length+"fire");
        gisViewer.value.viewer.scene.primitives.remove(gisViewer.value.particleSystemForFire);
        gisViewer.value.mapTooltip.destroy();
        gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
    }

    function open() {
        visible.value = true;
    }


    watch(() => _.cloneDeep(viewModel), (newValue, oldValue) => {
        gisViewer.value.particleSystemForFire.startScale = newValue.startScale;
        gisViewer.value.particleSystemForFire.endScale = newValue.endScale;
        gisViewer.value.particleSystemForFire.minimumParticleLife = newValue.minimumParticleLife;
        gisViewer.value.particleSystemForFire.maximumParticleLife = newValue.maximumParticleLife;
        gisViewer.value.particleSystemForFire.minimumSpeed = newValue.minimumSpeed;
        gisViewer.value.particleSystemForFire.maximumSpeed = newValue.maximumSpeed;
        gisViewer.value.particleSystemForFire.minimumImageSize.x = newValue.particleSize;
        gisViewer.value.particleSystemForFire.minimumImageSize.y = newValue.particleSize;
        gisViewer.value.particleSystemForFire.maximumImageSize.x = newValue.particleSize;
        gisViewer.value.particleSystemForFire.maximumImageSize.y = newValue.particleSize;
        gisViewer.value.particleSystemForFire.emissionRate = newValue.emissionRate;
    }, {deep: true})


    watch(typevalue, (newValue, oldValue) => {
        if (newValue === '圆形放射') {
            gisViewer.value.particleSystemForFire.emitter = new Cesium.CircleEmitter(2.0)
        } else if (newValue === '球体放射') {
            gisViewer.value.particleSystemForFire.emitter = new Cesium.SphereEmitter(2.5)
        } else if (newValue === '圆锥体放射') {
            gisViewer.value.particleSystemForFire.emitter = new Cesium.ConeEmitter(Cesium.Math.toRadians(1.0))
        } else if (newValue === '盒状放射') {
            gisViewer.value.particleSystemForFire.emitter = new Cesium.BoxEmitter(new Cesium.Cartesian3(10.0, 10.0, 10.0))
        }
    }, {deep: true})


    function createFire() {
        const viewer = gisViewer.value.viewer;
        const scene = viewer.scene;
        gisViewer.value.mapTooltip.create("单击创建火焰!");
        gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;


        let handler = new Cesium.ScreenSpaceEventHandler(
            gisViewer.value.viewer.scene.canvas
        );
        // gisViewer.value.mapTooltip.create("单击开始添加火焰位置点!");
        handler.setInputAction(function (click) {
            gisViewer.value.mapTooltip.destroy();
            gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;

            if (
                gisViewer.value.viewer.dataSources.getByName(EntityLayerName).length === 0
            ) {
                const fireDataSource = new Cesium.CustomDataSource(EntityLayerName);
                gisViewer.value.viewer.dataSources.add(fireDataSource);
            } else if (gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0].entities.values.length !== 0) {
                console.log(gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0].entities.values.length + "now");
                gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0].entities.removeAll();
                scene.primitives.remove(gisViewer.value.particleSystemForFire);
                console.log(gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0].entities.values.length + "after");
            }

            let layer = gisViewer.value.viewer.dataSources.getByName(EntityLayerName)[0];
            let cartesian = pickGloble(
                gisViewer.value.viewer,
                click.position
            );
            // let entity = layer.entities.add({
            //     position: cartesian
            // });


            gisViewer.value.particleSystemForFire = scene.primitives.add(new Cesium.ParticleSystem({
                // 粒子的图片
                image: '/static/images/smoke.png',
                // 起始颜色
                startColor: new Cesium.Color(1, 1, 1, 1),
                // 结束颜色
                endColor: new Cesium.Color(1, 0, 0, 0),
                // 开始大小比例
                startScale: viewModel.startScale,
                // 结束大小比例
                endScale: viewModel.endScale,
                // 最小生命周期
                minimumParticleLife: viewModel.minimumParticleLife,
                // 最大生命周期
                maximumParticleLife: viewModel.maximumParticleLife,
                // 最小速度
                minimumSpeed: viewModel.minimumSpeed,
                // 最大速度
                maximumSpeed: viewModel.maximumSpeed,
                // 粒子大小
                imageSize: new Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize * 2),
                // 粒子数量
                emissionRate: viewModel.emissionRate,
                lifetime: 16,
                // 循环是否开启
                loop: true,
                // 粒子的释放方向
                emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)),
                // 是否以米为单位
                sizeInMeters: true,
                modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(cartesian, undefined, new Cesium.Matrix4()), // 4x4转换矩阵，可将粒子系统从模型转换为世界坐标
            }))

            // viewer.scene.preUpdate.addEventListener(function (scene, time) {
            //     gisViewer.value.particleSystemForFire.modelMatrix = computeModelMatrix(entity, time)
            //     gisViewer.value.particleSystemForFire.emitterModelMatrix = computeEmitterModelMatrix()
            // })


            // 打开控制面板
            open();

            handler.destroy();

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // handler.setInputAction(function(movement) {
        //     handler.destroy(); //关闭事件句柄
        //     gisViewer.value.mapTooltip.create();
        // }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


        function computeModelMatrix(entity, time) {
            return entity.computeModelMatrix(time, new Cesium.Matrix4())
        }

        let emitterModelMatrix = new Cesium.Matrix4()
        let translation = new Cesium.Cartesian3()
        let rotation = new Cesium.Quaternion()
        let hpr = new Cesium.HeadingPitchRoll()
        let trs = new Cesium.TranslationRotationScale()

        // 改变粒子系统的位置
        function computeEmitterModelMatrix() {
            hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr)
            trs.translation = Cesium.Cartesian3.fromElements(-2, 0, 2, translation)
            trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation)
            return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix)
        }

    }


    // 对外开放的方法和变量
    defineExpose({
        visible,
        viewModel,
        options,
        typevalue,
        gisViewer,
        // particleSystemForFire,
        open,
        close,
        miniaturized,
        createFire,
    });
</script>

<style lang='scss' scoped>
    .xt-fire-panel {
        width: 400px;
        height: 530px;
        margin-top: 15vh;
    }

    .xt-paths-content {
        overflow-y: auto;
        font-size: 14px;
        word-wrap: break-word;
    }

    ::v-deep .xt-panel-content {
        padding: 9px 9px 9px 3px;
    }

    ::v-deep .el-form-item__label {
        color: white;
    }

    ::v-deep .el-form-item--default .el-form-item__label {
        color: white;
    }


</style>
