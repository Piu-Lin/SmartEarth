<template>
	<panel-container
		ref="panelContainer"
		title="可视域分析"
		:visible="visible"
		v-if="visible"
		@close="close"
		@miniaturized="miniaturized"
	>
		<template v-slot:panel-content>
			<div class="container">
				<div class="control-panel">
					<div class="sliders">
						<div class="slider1">
							<span class="demonstration">视角水平张角</span>
							<el-slider
								v-model="horizontalViewAngle"
								class="el-slider1"
								:max="179"
								:min="1"
							></el-slider>
						</div>
						<div class="slider2">
							<span class="demonstration">视角垂直张角</span>
							<el-slider
								v-model="verticalViewAngle"
								class="el-slider1"
								:max="179"
								:min="1"
							></el-slider>
						</div>
					</div>
					<div class="btns">
						<el-button type="primary" @click="addVisible">添加可视域</el-button>
						<el-button type="primary" @click="addCamera">相机</el-button>
						<el-button type="danger" @click="removeAllVisible"
							>全部清除</el-button
						>
					</div>
				</div>
			</div>
		</template>
	</panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import ViewShed from "./js/ViewShed.js";
import pickGloble from "@/Gis/tools/pickGloble";
import CursorStyle from "@/Gis/enum/CursorStyle";
import { reactive, ref, inject } from "vue";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let handler = reactive({});
let viewShed = reactive({});
let startPosition = ref(null); //起始坐标
let endPosition = ref(null); //终点坐标
let viewShedArr = reactive([]); //存储可视域区域的数组
let viewCameraArr = reactive([]); //存储相机可视域区域的数组
let horizontalViewAngle = ref(90); //视角水平张角
let verticalViewAngle = ref(60); //视角垂直张角
const addVisibleShow = ref(false); //是否点击了添加可视域按钮

function open() {
	visible.value = !visible.value;
	if (!visible.value) {
		addVisibleShow.value = false;
		removeAllVisible();
	}
}
function close() {
	removeAllVisible();
	visible.value = false;
	addVisibleShow.value = false;
}
function miniaturized() {
	visible.value = false;
}

watch([horizontalViewAngle, verticalViewAngle], () => {
	if (viewShed) {
		viewShed.updateHandV(horizontalViewAngle.value, verticalViewAngle.value);
		viewShed.update();
	}
});

watch(addVisibleShow, (value) => {
	if (value) {
		gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
	} else {
		gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
	}
});

/**
 * @method 添加可视区域
 */
const addVisible = () => {
	removeAllVisible();
	addVisibleShow.value = true;
	let i = 0;
	handler = new Cesium.ScreenSpaceEventHandler(
		gisViewer.value.viewer.scene.canvas
	);
	handler.setInputAction((movement) => {
		i++;
		if (i === 1) {
			startPosition.value = pickGloble(
				gisViewer.value.viewer,
				movement.position
			);
			if (!startPosition.value) return;
			viewShed = new ViewShed(gisViewer.value.viewer, {
				type: "normal",
				viewPosition: startPosition.value,
				viewPositionEnd: startPosition.value,
				horizontalViewAngle: horizontalViewAngle.value,
				verticalViewAngle: verticalViewAngle.value,
			});
			handler.setInputAction(
				(
					movement //鼠标移动的事件
				) => {
					endPosition.value = pickGloble(
						gisViewer.value.viewer,
						movement.endPosition
					);
					if (!endPosition.value) return;
					viewShed.updatePosition(endPosition.value);
					if (!viewShed.sketch) {
						viewShed.drawSketch();
					}
				},
				Cesium.ScreenSpaceEventType.MOUSE_MOVE
			);
		}
		if (i === 2) {
			//鼠标点击两次获取结束坐标
			i = 0;
			endPosition.value = pickGloble(gisViewer.value.viewer, movement.position);
			viewShed.updatePosition(endPosition.value);
			viewShed.update();
			handler = handler && handler.destroy(); //销毁鼠标事件
			viewShedArr.push(viewShed);
			addVisibleShow.value = false;
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
/**
 * @method 去除所有可视区域
 */
const removeAllVisible = () => {
	if (viewShedArr === null && viewCameraArr === null) return;
	for (let i = 0; i < viewShedArr.length; i++) {
		viewShedArr[i].clear();
	}
	for (let i = 0; i < viewCameraArr.length; i++) {
		viewCameraArr[i].clear();
	}
	addVisibleShow.value = false;
};
/**
 * @method 相机
 */
const addCamera = () => {
	removeAllVisible();
	let ellipsoid = gisViewer.value.viewer.scene.globe.ellipsoid;
	viewShed = new ViewShed(gisViewer.value.viewer, {
		type: "camera",
		viewPosition: ellipsoid.cartographicToCartesian(
			gisViewer.value.viewer.camera.positionCartographic
		),
		horizontalViewAngle: horizontalViewAngle.value,
		verticalViewAngle: verticalViewAngle.value,
		viewDistance: 200,
		viewHeading: gisViewer.value.viewer.camera.heading,
		viewPitch: gisViewer.value.viewer.camera.pitch,
		viewRoll: gisViewer.value.viewer.camera.roll,
		viewDirection: gisViewer.value.viewer.camera.directionWC,
	});
	viewCameraArr.push(viewShed);
};
defineExpose({
	visible,
	open,
	close,
	miniaturized,
});
</script>

<style scoped>
.btns {
	margin-top: 1vh;
	margin-bottom: 1vh;
}
</style>
