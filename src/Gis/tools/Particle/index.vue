<template>
    <panel-container
            ref="panelContainer"
            title="粒子特效"
            :visible="visible"
            @close="close"
            @miniaturized="miniaturized"
            class="xt-particle-panel"
    >
        <template v-slot:panel-content class="xt-paths-content">
            <div class="map-center-box">
                <span><el-button @click="clickForRain">雨</el-button></span>
                <span><el-button @click="clickForSnow">雪</el-button></span>
                <span><el-button @click="clickForFog">雾</el-button></span>
                <span><el-button @click="clickForFire">火焰</el-button></span>
                <span><el-button @click="clickForFountain">喷泉</el-button></span>
            </div>
        </template>


    </panel-container>
    <FireParticle ref="fireParticle"></FireParticle>
    <FountainParticle ref="fountainParticle"></FountainParticle>
</template>

<script setup>
    import Particle from "@/Gis/tools/Particle";
    import FireParticle from "@/Gis/tools/FireParticle";
    import FountainParticle from "@/Gis/tools/FountainParticle";
    import PanelContainer from "../PanelContainer";
    import {inject, nextTick, onMounted, ref, watch} from "vue";

    const gisViewer = inject("bigScreenMap");
     // console.log(gisViewer.value.viewer);


    let visible = ref(false);

    function miniaturized() {
        visible.value = false;
    }

    function close() {
        visible.value = false;
    }

    function open() {
        visible.value = true;
    }

    let flagForRain = true;
    let flagForSnow = true;
    let flagForFog = true;

    function clickForRain() {
        gisViewer.value.rainEffect.createParticleForRain("Rain", flagForRain);
        flagForRain = !flagForRain;
    }

    function clickForSnow() {
        gisViewer.value.snowEffect.createParticleFroSnow("Snow", flagForSnow);
        flagForSnow = !flagForSnow;
    }

    function clickForFog() {
        gisViewer.value.fogEffect.createParticleForFog("Fog", flagForFog);
        flagForFog = !flagForFog;
    }

    const fireParticle = ref(null);
    const fountainParticle = ref(null);

    function clickForFire() {

        fireParticle.value.createFire();
        if (fountainParticle.value.visible === true) {
            fountainParticle.value.close();
        }

    }

    function clickForFountain() {
        fountainParticle.value.createFountain();
        if (fireParticle.value.visible === true) {
            fireParticle.value.close();
        }
    }


    defineExpose({
        visible,
        open,
        close,
        miniaturized,
    });
</script>

<style lang="scss" scoped>
    .xt-particle-panel {
        width: 300px;
        height: 100px;
    }

    .xt-paths-content {
        overflow-y: auto;
        padding: 5px 24px;
        font-size: 14px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
    }

    .map-center-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }


</style>
