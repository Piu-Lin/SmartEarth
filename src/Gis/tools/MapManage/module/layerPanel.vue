<template>
  <panel-container
      ref="panelContainer"
      title="添加图层"
      :visible="visible"
      @close="close"
      @miniaturized="miniaturized"
      class="xt-layer-panel"
  >
    <template v-slot:panel-content class="xt-paths-content">
      <div class="form-panel-body">
        <div>
          <div class="form-item">
            <span>图层名称</span>
            <div>
              <el-input type="text" v-model="labelName" class="name-input"></el-input>
            </div>
          </div>
          <div class="form-item">
            <span>图层类型</span>
            <div>
              <el-select v-model="layerType" class="m-2" placeholder="请选择" size="large" @change="currentLayerType">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>
        <div class="form-panel-footer">
          <div class="footer-group">
            <el-button @click="addLayerPanel">
              <span>确认</span>
            </el-button>
            <el-button @click="closePanel">
              <span>取消</span>
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </panel-container>
</template>

<script setup>
import PanelContainer from "../../PanelContainer";
import {ref} from "vue";
import localMapManageStorage from "../storage/localMapManageStorage";
import {guid} from "../../../utils/coding";
// 是否显示此组件
const visible = ref(false);

const labelName = ref('');

const layerType = ref('');

const currentType = ref('');

const emit = defineEmits([])


const options = [
  {
    value: 'XT_LABEL',
    label: '标注图层',
  },
  {
    value: 'XT_LINE',
    label: '线图层',
  },
  {
    value: 'XT_FACE',
    label: '面图层',
  },
  {
    value: 'XT_MODEL',
    label: '模型图层',
  }
]

function miniaturized() {
  visible.value = false;
}

function close() {
  visible.value = false;
}

function open() {
  visible.value = true;
}

const pId = ref('');

defineExpose({
  visible,
  pId,
  open,
  close,
  miniaturized,
});

function addLayerPanel() {
  if (currentType.value === ""){
    alert("请选择对应图层类型")
  }else {
    const id = guid();
    const item = {
      label: labelName.value,
      parId: pId.value,
      value: 4,
      id: id,
      type: currentType.value,
      children: []
    }
    localMapManageStorage.add(item);
    emit('changeData');
    visible.value = false;
  }
}

function currentLayerType(value) {
  currentType.value = value;
}

// 取消按钮执行的方法
function closePanel() {
  visible.value = false;
}


</script>

<style lang="scss" scoped>

.xt-layer-panel {
  width: 300px;
  height: 200px;
}

.form-panel-body {
  padding: 10px;
  //border-bottom: 1px solid hsla(0, 0%, 58.8%, .3);
}

.form-item {
  margin: 10px 0;
  display: flex;
}

.form-panel-footer {
  height: 38px;
  line-height: 38px;
  font-size: 14px;
  text-align: right;
}

.footer-group {
  margin-right: 10px;
}

.name-input {
  margin-left: 10px;
  width: 100%;
}

.form-item span {
  vertical-align: middle;
  width: 100px;
}

.m-2 {
  margin-left: 16px;
}
</style>
