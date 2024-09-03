<template>
  <panel-container
      ref="panelContainer"
      title="修改样式"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-model-panel"
  >
    <template v-if="flag==='1'" v-slot:panel-content class="xt-paths-content">
      <div class="add-point-body">
        <label title="颜色" class="xt-form-item-label">颜色</label>
        <div class="xt-form-item">
          <el-color-picker v-model="radarColor" show-alpha @change="changeColor"/>
        </div>

        <label title="半径" class="xt-form-item-label">半径</label>
        <div class="xt-form-item">
          <el-button @click="radiusAdd">加</el-button>
          <el-button @click="radiusReduce">减</el-button>
        </div>

        <label title="频率" class="xt-form-item-label">频率</label>
        <div class="xt-form-item">
          <el-button @click="addRate">加</el-button>
          <el-button @click="recudeRate">减</el-button>
        </div>
      </div>
    </template>
    <template v-if="flag==='2'" v-slot:panel-content class="xt-paths-content">
      <div class="add-point-body">
        <label title="频率" class="xt-form-item-label">卫星发射频率</label>
        <div class="xt-form-item">
          <el-button @click="frequencyAdd">加</el-button>
          <el-button @click="frequencyRecude">减</el-button>
        </div>
      </div>
    </template>

  </panel-container>
</template>

<script setup>
import PanelContainer from "@/Gis/tools/PanelContainer.vue";
import {ref} from "vue";
import bus from '@/utils/bus'

const radarColor = ref('rgba(255, 0, 255,0.4)')


const visible = ref(false);

function close() {
  visible.value = false;
}

const flag = ref('')

function open(val) {
  flag.value = val
  visible.value = true;
}

function miniaturized() {
  visible.value = false;
}

// 雷达覆盖面加
function radiusAdd() {
  bus.emit('add')
}

//雷达覆盖面减
function radiusReduce() {
  bus.emit('reduce')
}

// 雷达速度加
function addRate() {
  bus.emit('addRate')
}

// 雷达速度减
function recudeRate() {
  bus.emit('recudeRate')
}

// 雷达修改颜色
function changeColor() {
  bus.emit('radarColor', radarColor)
}

// 卫星频率加
function frequencyAdd() {
  bus.emit('addFrequency')
}

// 卫星频率减
function frequencyRecude() {
  bus.emit('recudeFrequency')
}


defineExpose({
  visible,
  open,
  close,
  miniaturized,
});

</script>

<style scoped lang="scss">
.xt-model-panel {
  width: 340px;
  height: 600px;
}
</style>
