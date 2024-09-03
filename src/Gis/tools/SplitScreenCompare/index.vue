<template>
    <panel-container
            ref="panelContainer"
            title="分屏对比"
            :visible="visible"
            @close="close"
            @miniaturized="miniaturized"
            class="xt-manage-panel"
    >
        <template v-slot:panel-content class="xt-paths-content">
            <div class="map-center-box">
                <div class="treeHeight">
                    <el-tree
                            :data="formData"
                            show-checkbox
                            node-key="id"
                            :default-expand-all="true"
                            :props="defaultProps"
                            @check-change="handleCheckChange"
                            class="tree"
                            :filter-node-method="filterNode"
                            @node-contextmenu="rightContextMenu"
                            auto-expand-parent
                            ref="treeRef"
                    >
                        <template #default="{ node, data }">
                            <el-input
                                    v-model="labelName"
                                    v-show="node.isEdit"
                            ></el-input>
                            <span v-show="!node.isEdit">{{ data.name }}</span>
                        </template>
                    </el-tree>
                    <div class="btns">
                        <el-button type="primary" @click="addSplitScreenCompare()">开始对比</el-button>
                    </div>
                </div>
            </div>
        </template>
    </panel-container>
    <div id="cesiumContainer2" class="mapview1" v-show="divShow">
        <span style="position: absolute;top: 20px;left: 30px;z-index: 99999">{{nameDiv1}}</span>
    </div>
    <div id="cesiumContainer3" class="mapview2" v-show="divShow">
        <span style="position: absolute;top: 20px;left: 30px;z-index: 99999">{{nameDiv2}}</span>
    </div>
</template>

<script setup>
    import PanelContainer from "../PanelContainer";
    import {onMounted, reactive, ref, watch} from "vue";
    import SplitScreenCompareMap from "../../SplitScreenCompareMap";
    import {listResource_manage_open} from "../../../api/basics/resource_manage";



    const visible = ref(false);
    const flag =ref(false);

    const nodeArr = reactive([]);
    const nameDivArr = reactive([]);
    const treeRef = ref(null);

    function miniaturized() {
        visible.value = false;
    }

    function close() {
        visible.value = false;
        divShow.value = false;
        SplitScreenCompareMap1.viewer.scene.primitives._primitives.forEach(primitive => {
            if (primitive.name === 'nanxun') {
                SplitScreenCompareMap1.viewer.scene.primitives.remove(primitive);
            }
        });
        SplitScreenCompareMap2.viewer.scene.primitives._primitives.forEach(primitive => {
            if (primitive.name === 'nanxun') {
                SplitScreenCompareMap2.viewer.scene.primitives.remove(primitive);
            }
        });
        nodeArr.length = 0;
        nameDivArr.length = 0;
        treeRef.value.setCheckedNodes([]);
    }

    function open() {
        visible.value = true;
    }

    defineExpose({
        visible,
        open,
        close,
        miniaturized,
    });

    const formData = ref([
        {
            name: '倾斜摄影模型',
            url: '倾斜摄影模型',
            children: [],
        }
    ]);

    const defaultProps = {
        children: "children",
        label: "name",
    };


    function handleCheckChange(data, node) {
        if (data.url != '倾斜摄影模型') {
            if (node) {
                nodeArr.push(data.url);
                nameDivArr.push(data.name);
            } else {
                nodeArr.splice(nodeArr.findIndex(item => item === data.url), 1);
                nameDivArr.splice(nameDivArr.findIndex(item => item === data.name), 1);
            }
        }
    }

    const filterText = ref("");

    watch(filterText, (newData, oldData) => {
        tree.value.filter(newData);
    });

    function filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
    }

    let SplitScreenCompareMap1 = null;
    let SplitScreenCompareMap2 = null;

    const divShow = ref(false);
    const nameDiv1 = ref(null);
    const nameDiv2 = ref(null);

    function createViewer() {
        SplitScreenCompareMap1 = new SplitScreenCompareMap("cesiumContainer2");
        SplitScreenCompareMap2 = new SplitScreenCompareMap("cesiumContainer3");
    }

    // 启动分屏对比
    function addSplitScreenCompare() {
        if (flag.value === true){
            SplitScreenCompareMap1.viewer.scene.primitives._primitives.forEach(primitive => {
                if (primitive.name === 'nanxun') {
                    SplitScreenCompareMap1.viewer.scene.primitives.remove(primitive);
                }
            });
            SplitScreenCompareMap2.viewer.scene.primitives._primitives.forEach(primitive => {
                if (primitive.name === 'nanxun') {
                    SplitScreenCompareMap2.viewer.scene.primitives.remove(primitive);
                }
            });
        }
        if (nodeArr.length === 2) {
            divShow.value = true;
            flag.value = true;
            // nodeArr.splice(nodeArr.findIndex(item => item === '倾斜摄影模型'), 1);
            // SplitScreenCompareMap1.value = new SplitScreenCompareMap("cesiumContainer2");
            // SplitScreenCompareMap2.value = new SplitScreenCompareMap("cesiumContainer3");
            nameDiv1.value = nameDivArr[0];
            nameDiv2.value = nameDivArr[1];

            SplitScreenCompareMap1.createTileset(nodeArr[0], 'nanxun');
            SplitScreenCompareMap2.createTileset(nodeArr[1], 'nanxun');
            initHandler(SplitScreenCompareMap1.viewer, SplitScreenCompareMap2.viewer);
        } else {
            alert("请选择两组数据进行分屏对比");
        }
    }

    function initHandler(viewer0, viewer1) {
        const handler = new Cesium.ScreenSpaceEventHandler(viewer0.scene.canvas);
        const handler1 = new Cesium.ScreenSpaceEventHandler(viewer1.scene.canvas);
        handler.setInputAction(function (movement) {
            const _camerca = viewer0.camera;
            viewer1.camera.setView({
                destination: _camerca.position,
                orientation: {
                    direction: _camerca._direction,
                    up: _camerca.up,
                    heading: _camerca.heading,
                    pitch: _camerca.pitch,
                    roll: _camerca.roll
                }
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(function (movement) {
            const _camerca = viewer0.camera;
            viewer1.camera.setView({
                destination: _camerca.position,
                orientation: {
                    direction: _camerca._direction,
                    up: _camerca.up,
                    heading: _camerca.heading,
                    pitch: _camerca.pitch,
                    roll: _camerca.roll
                }
            });
        }, Cesium.ScreenSpaceEventType.WHEEL);


        handler1.setInputAction(function (movement) {
            const _camerca = viewer1.camera;
            viewer0.camera.setView({
                destination: _camerca.position,
                orientation: {
                    direction: _camerca._direction,
                    up: _camerca.up,
                    heading: _camerca.heading,
                    pitch: _camerca.pitch,
                    roll: _camerca.roll
                }
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler1.setInputAction(function (movement) {
            const _camerca = viewer1.camera;
            viewer0.camera.setView({
                destination: _camerca.position,
                orientation: {
                    direction: _camerca._direction,
                    up: _camerca.up,
                    heading: _camerca.heading,
                    pitch: _camerca.pitch,
                    roll: _camerca.roll
                }
            });
        }, Cesium.ScreenSpaceEventType.WHEEL);
    }

    function onListResource_manage() {
        listResource_manage_open().then(response => {
            formData.value[0].children = response.rows;
        })
    }

    onMounted(() => {
        createViewer();
    });
    onListResource_manage();
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

    :deep .el-tree-node:focus > .el-tree-node__content {
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

    .menu-box > ul {
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


    .map-center-box i {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-size: 16px;
        background-repeat: no-repeat;
    }

    .treeHeight {
        height: 200px;
        overflow-y: auto;
    }

    .btns {
        float: right;
        margin-top: 1vh;
        margin-bottom: 1vh;
    }

    .mapview1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 50vw;
        height: 100vh;
        margin: 0;
    }

    .mapview2 {
        position: absolute;
        top: 0;
        right: 0;
        width: 50vw;
        height: 100vh;
        margin: 0;
    }


</style>
