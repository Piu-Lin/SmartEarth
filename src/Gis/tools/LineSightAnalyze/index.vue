<template>
  <panel-container
      ref="panelContainer"
      title="通视分析"
      :visible="visible"
      v-if="visible"
      @close="close"
      @miniaturized="miniaturized"
  >
    <template v-slot:panel-content>
      <div class="container">
        <div class="control-panel">
          <div class="btns">
            <el-button type="primary" @click="addWatchPoint">添加观察点</el-button>
            <el-button type="danger" @click="removeAllVisible"
            >全部清除
            </el-button
            >
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import {lineSight, removeLayer} from "@/Gis/tools/LineSightAnalyze/LineSight";
import {ref, inject} from "vue";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");

function open() {
  visible.value = !visible.value;
  if (!visible.value) {
    removeAllVisible();
  }
}

function close() {
  removeAllVisible();
  visible.value = false;
}

function miniaturized() {
  visible.value = false;
}

const addWatchPoint = () => {
  lineSight(gisViewer.value.viewer);
}

const removeAllVisible = () => {
  removeLayer(gisViewer.value.viewer);
}

defineExpose({
  visible,
  open,
  close,
  miniaturized,
});
</script>

<style scoped>
.container {
  margin-top: 1vh;
  margin-bottom: 1vh;
}
</style>
