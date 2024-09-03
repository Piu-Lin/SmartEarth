<template>
  <div class="search">
    <el-select
        v-model="value"
        filterable
        clearable
        placeholder="搜索"
        @change="searchChange"
    >
        <el-option
                v-for="(item, index) in options"
                :label="item.companyName"
                :key="index"
                :value="item.id"
        >
        </el-option>
    </el-select>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";

const gisViewer = inject("bigScreenMap");
const value = ref("");
const props = defineProps({
    options: {
        type: Array,
        default: () => [],
    },
});

const { proxy } = getCurrentInstance();

function searchChange(id) {
    let record = props.options.find(item => item.id == id);
    if (record && record.x && record.y) {
        gisViewer.value.flyTo({x:record.x,y:record.y,z:100,heading: Cesium.Math.toRadians(0),pitch: Cesium.Math.toRadians(-90),roll: Cesium.Math.toRadians(0)});
    } else {
        proxy.$modal.msgError('暂无位置信息');
    }
}
</script>

<style scoped>
.search {
    position: absolute;
    top: 28px;
    right: 75px;
    width: 250px;
    height: 40px;
}

</style>
