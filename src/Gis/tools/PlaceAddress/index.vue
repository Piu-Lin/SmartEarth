<template>
    <panel-container
            ref="panelContainer"
            title="地名地址"
            :visible="visible"
            @close="close"
            @miniaturized="miniaturized"
            class="xt-manage-panel"
    >
        <template v-slot:panel-content class="xt-paths-content">
            <div>
                <el-radio v-model="radio" label="1">按关键字搜索</el-radio>
                <el-radio v-model="radio" label="2">按坐标搜索</el-radio>
                <div>
                    <el-select
                            v-model="value"
                            filterable
                            remote
                            :remote-method="remoteMethod"
                            @change="searchChange"
                            clearable
                            v-bind:placeholder="(radio ==='1'?'按关键字搜索':'按坐标搜索')"
                    >
                        <el-option
                                v-for="(item, index) in options"
                                :label="item.placeName"
                                :key="index"
                                :value="item.placeName"
                        >
                        </el-option>
                    </el-select>
                </div>
                <div v-show='radio === "2" && isShow' style="margin-top: 5px; color: red">请输入正确的经纬度格式(经度,纬度)</div>
            </div>
        </template>
    </panel-container>
</template>

<script setup name="placeAddress">
    import PanelContainer from "../PanelContainer";
    import {inject, nextTick, onMounted, reactive, ref, watch} from "vue";
    import {listPosition} from "@/api/engine/position";

    const gisViewer = inject("bigScreenMap");
    const visible = ref(false);
    const radio = ref('1');
    const options = ref([]);
    const value = ref("");
    // 经纬度格式提示是否显示
    const isShow = ref(true);


    const data = reactive({
        queryParams: {
            placeName: null,
            position: null,
        },
    });
    const {queryParams} = toRefs(data);

    watch((radio) ,()=>{
        value.value = null;
        options.value = [];
        isShow.value = true;
    },{immediate:true})


    function miniaturized() {
        visible.value = false;
    }

    function close() {
        visible.value = false;
    }

    function open() {
        visible.value = true;
        isShow.value = true;
    }


    function remoteMethod(value) {
        if (value != '' && radio.value ==='1') {
            queryParams.value.position = null;
            queryParams.value.placeName = null;
            queryParams.value.placeName = value;
            listPosition(queryParams.value).then(response => {
                options.value = response.rows;
            });
        } else {
            options.value = [];
        }
        if (value != '' && radio.value ==='2') {
            // let reg1 = /^[\-\+]?(0?\monomer{1,2}(\.\monomer{3,6})*|1[0-7]?\monomer{1}(\.\monomer{3,6})*|180(\.0{3,6})*)$/;
            // let reg2 = /^[\-\+]?([0-8]?\monomer{1}(\.\monomer{3,6})*|90(\.0{3,6})*)$/;

            let reg1 = /^[\-\+]?(0?\d{1,2}\.\d{3,6}|1[0-7]?\d{1}\.\d{3,6}|180\.0{3,6})$/;
            let reg2 = /^[\-\+]?([0-8]?\d{1}\.\d{3,6}|90\.0{3,6})$/;

            if (value.indexOf(',') !== -1 && reg1.test(value.split(',')[0]) && reg2.test(value.split(',')[1])){
                isShow.value = false;
                queryParams.value.position = null;
                queryParams.value.placeName = null;
                queryParams.value.position = value;
                listPosition(queryParams.value).then(response => {
                    options.value = response.rows;
                });
            }else {
                isShow.value = true;
            }
        } else {
            options.value = [];
        }
    }

    const positionArr = ref([]);

    function searchChange(placeName) {
        let record = options.value.find(item => item.placeName == placeName);
        if (record.position !== "" && record.position !== null) {
            positionArr.value = record.position.split(',');
            if (positionArr.value[0] && positionArr.value[1]) {
                gisViewer.value.flyTo({
                    x: positionArr.value[1],
                    y: positionArr.value[0],
                    z: 100,
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90),
                    roll: Cesium.Math.toRadians(0)
                });
            } else {
                alert('暂无位置信息');
            }
        } else {
            alert('暂无位置信息');
        }
    }

    defineExpose({
        visible,
        open,
        close,
        miniaturized,
    });
</script>


<style scoped>
    .xt-manage-panel {
        width: 320px;
        height: 145px;
        position: absolute;
        top: 8vh;
        /*right: 45vw;*/
        left: 65vw;
        bottom: 25vh;
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

    ::v-deep .el-radio__label {
        color: white;
    }

    ::v-deep .el-input {
        width: 200px
    }

    ::v-deep .el-radio__input.is-checked + .el-radio__label {
        color: #f8dc51;
    }

    ::v-deep .el-radio__input.is-checked .el-radio__inner {
        border-color: #f8dc51;
        background: #f8dc51;
    }

    ::v-deep .el-input__suffix {
        display: none;
    }

</style>
