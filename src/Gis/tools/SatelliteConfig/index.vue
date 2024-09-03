<template>
    <panel-container ref="panelContainer" title="卫星配置" :visible="visible" @close="close" @miniaturized="miniaturized"
        class="xt-manage-panel">
        <template v-slot:panel-content class="xt-paths-content">
            <div class="map-center-box">
                <div class="ref-search" style="
                          width: 100%;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          gap: 10px
                      ">
                    <!-- 发射功率 -->
                    <div style="display: flex; align-items: center;">
                        <label for="transmitPower">发射功率:</label>
                        <input type="text" id="transmitPower" v-model="transmitPower" clearable style="width: 150px;" />
                    </div>
                    <!-- 天线增益 -->
                    <div style="display: flex; align-items: center;">
                        <label for="antennaGain">天线增益:</label>
                        <input type="text" id="antennaGain" v-model="antennaGain" clearable style="width: 150px;" />
                    </div>
                    <!-- 发射波长 -->
                    <div style="display: flex; align-items: center;">
                        <label for="emissionWavelength">发射波长:</label>
                        <input type="text" id="emissionWavelength" v-model="emissionWavelength" clearable
                            style="width: 150px;" />
                    </div>
                </div>
                <button style="margin-top: 15px;" @click="saveSatelliteConfig">确认</button>
            </div>
        </template>
    </panel-container>
</template>

<script setup>
import { ref } from "vue";
import PanelContainer from "../PanelContainer";

const visible = ref(false);

const transmitPower = ref('');
const antennaGain = ref('');
const emissionWavelength = ref();

function miniaturized() {
    visible.value = false;
}

function close() {
    visible.value = false;
}

function open() {
    visible.value = true;
}

function saveSatelliteConfig() {
    localStorage.setItem('satelliteConfig', JSON.stringify({
        transmitPower: transmitPower.value,
        antennaGain: antennaGain.value,
        emissionWavelength: emissionWavelength.value,
    }))
    visible.value = false
}

defineExpose({
    visible,
    open,
    close,
    miniaturized,
});

</script>

<style lang="scss" scoped>
.xt-manage-panel {
    width: 300px;
    height: 200px;
}

.xt-paths-content {
    overflow-y: auto;
    padding: 5px 24px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
}

.map-center-box {
    height: calc(100% - 44px);
    overflow-x: auto;
    overflow-y: auto;
    width: 100%;
}

span {
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
        Microsoft YaHei, \\5FAE\8F6F\96C5\9ED1, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #515a6e;
    color: rgb(255, 255, 255);
}

.tree {
    color: #ffffff;
    background: rgba(0, 0, 0, 0);
    overflow: hidden;
}

.tree :active {
    background-color: #5b95cc;
}

:deep .el-tree-node:focus>.el-tree-node__content {
    background-color: #5b95cc;
}

:deep(.el-tree-node__content:hover) {
    background-color: #5b95cc;
}

.menu-box {
    border-top: 4px solid #5b95cc;
    width: 150px;
    position: absolute;
    z-index: 10000;
    background: #696969;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
}

.menu-box>ul {
    margin: auto;
}

ul,
li {
    margin: 0px;
    padding: 0px;
}

.menu-box ul li {
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    box-sizing: border-box;
    list-style: none;
}

.divideron {
    height: 2px !important;
    width: 100% !important;
    line-height: 2px !important;
    background: #5b95cc !important;
}

.menu-box ul li:hover {
    background: #5b95cc;
}

input {
    width: calc(100% - 49px);
    height: 28px;
    background: #407cb455;
    border-radius: 3px;
    border: none;
    color: #ddd;
    padding: 0 10px;
    margin-left: 4px;
}

input:focus {
    outline: 1px solid #5b95cc;
}

:deep(.el-input__inner) {
    height: 23px;
    width: calc(100% - 1px);
    font-size: 15px;
    border-radius: 3px;
    padding: 0 10px;
    border: none;
    background: #407cb455;
    color: #ddd;
}

:deep(.el-input__inner:focus) {
    outline: 1px solid #5b95cc;
}

/* 设置引用组件的位置 */
.modoule-layer-panel {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.place_line {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.place_point {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.xt-tree-layer {
    background-image: url("@/assets/images/icons/folder.svg");
}

.xt-tree-marker-layer {
    background-image: url("@/assets/images/icons/marklayer.svg");
}

.xt-tree-polyline-layer {
    background-image: url("@/assets/images/icons/polylinelayer.svg");
}

.xt-tree-polygon-layer {
    background-image: url("@/assets/images/icons/polygonlayer.svg");
}

.xt-tree-marker {
    background-image: url("@/assets/images/icons/mark.svg");
}

.xt-tree-polyline {
    background-image: url("@/assets/images/icons/polyline.svg");
}

.xt-tree-polygon {
    background-image: url("@/assets/images/icons/polygon.svg");
}

.xt-tree-model-layer {
    background-image: url("@/assets/images/icons/modellayer.svg");
}

.xt-tree-model {
    background-image: url("@/assets/images/icons/model.svg");
}

.map-center-box i {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-size: 16px;
    background-repeat: no-repeat;
}

/* 给添加面的弹窗设置位置 */
.place_face {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.edit_line {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.edit_face {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.place_model {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.edit_model {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.edit_point_ref {
    position: absolute;
    top: 6vh;
    left: 20vw;
}

.treeHeight {
    height: 200px;
    overflow-y: auto;
}

::-webkit-scrollbar {
    width: 8px;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.1);
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    background-color: rgba(0, 0, 0, 0);
}
</style>