<template>
	<panel-container ref="panelContainer" title="日照分析" :visible="visible" v-if="visible" @close="close"
		@miniaturized="miniaturized">
		<template v-slot:panel-content>
			<div class="container">
				<div class="control-panel">
					<div class="btns">
						<el-button type="primary" @click="setSunLight('play')" v-if="startShow">开始分析</el-button>
						<el-button type="success" v-if="inShow">进行中...</el-button>
						<el-button type="warning" @click="setSunLight('continue')" v-if="continueShow">继续分析</el-button>
						<el-button type="primary" @click="setSunLight('stop')">暂停分析</el-button>
						<el-button type="danger" @click="removeAnalyze">清除分析</el-button>
					</div>
					<div style="border: 1px solid #1d75b3; margin-top: 20px; padding: 10px">
						<label>分析日期：</label>
						<el-date-picker style="width: 12.1vw" v-model="analyzeDate" type="date" placeholder="请选择分析日期" />
						<br /><br />
						<label>开始时刻：</label>
						<el-time-select style="width: 12.1vw" v-model="analyzeStartTime" placeholder="请选择开始时刻" start="00:00"
							step="02:00" end="22:00" />
						<br /><br />
						<label>结束时刻：</label>
						<el-time-select style="width: 12.1vw" v-model="analyzeTmpEndTime" placeholder="请选择结束时刻" start="02:00"
							step="02:00" end="24:00" />
						<br v-if="showNowTime" /><br v-if="showNowTime" />
						<label v-if="showNowTime">当前时刻：</label>
						<span v-if="showNowTime">{{ getNowTime(gisViewer.viewer.clock.currentTime) }}</span>
					</div>
				</div>
			</div>
		</template>
	</panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import { ref, inject, toRaw, watch, computed } from "vue";
import { ElMessage } from "element-plus";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let analyzeDate = ref(""); // 分析日期
let analyzeStartTime = ref(""); // 分析开始时间
let analyzeTmpEndTime = ref(""); // 分析结束时间
let showNowTime = ref(false);
let analyzeEndTime = computed(() =>
	analyzeTmpEndTime.value == "00:00" ? "24:00" : analyzeTmpEndTime.value
);
let stopTime = ref(null); // 暂停分析的时间
let continueShow = ref(false); // 是否显示暂停按钮
let startShow = ref(true); // 是否显示开始按钮
let inShow = ref(false); // 是否显示进行中按钮
let raID = ref(0); // Cesium.requestAnimationFrame返回值

function open() {
	visible.value = !visible.value;
	if (!visible.value) {
		removeAnalyze();
	}
}

function close() {
	removeAnalyze();
	visible.value = false;
}

function miniaturized() {
	visible.value = false;
}

defineExpose({
	visible,
	open,
	close,
	miniaturized,
});

function getNowTime(time) {
	let a = time.toString().replace(/T/, ' ').replace(/Z/, '').replace(/\.\d+/g, '');
	let b = new Date(a);
	let c = new Date(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours() + 8, b.getMinutes(), b.getSeconds());
	return toTime(c);
}

function toTime(date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	minute = minute < 10 ? ('0' + minute) : minute;
	var des = date.getSeconds();
	des = des < 10 ? ('0' + des) : des;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + des;
}

// 开启日照分析
function startAnalyze() {
	removeAnalyze();
	startShow.value = false;
	inShow.value = true;
	let r = new Date(
		new Date(analyzeDate.value).setHours(
			Number(analyzeStartTime.value.slice(0, 2))
		)
	);
	let o = new Date(
		new Date(analyzeDate.value).setHours(
			Number(analyzeEndTime.value.slice(0, 2))
		)
	);
	gisViewer.value.viewer.scene.globe.enableLighting = true; // 开启日照
	gisViewer.value.viewer.shadows = true; // 开启阴影
	gisViewer.value.viewer.clock.shouldAnimate = true;
	// viewer.clock 获取时间轴
	gisViewer.value.viewer.clock.startTime = Cesium.JulianDate.fromDate(r); // 开始时间
	gisViewer.value.viewer.clock.currentTime = Cesium.JulianDate.fromDate(r); // 当前时间
	gisViewer.value.viewer.clock.stopTime = Cesium.JulianDate.fromDate(o); // 停止时间
	gisViewer.value.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 停止行为: 达到终止时间后停止
	gisViewer.value.viewer.clock.clockStep =
		Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
	gisViewer.value.viewer.clock.multiplier = 900; // 时钟时要经过的时间，可以为负值
	raID.value = Cesium.requestAnimationFrame(showCurrentTime);
}

// 暂停日照分析
function stopAnalyze() {
	stopTime.value = gisViewer.value.viewer.clock.currentTime;
	gisViewer.value.viewer.clock.shouldAnimate = false;
	inShow.value = false;
	continueShow.value = true;
	showNowTime.value = true;
}

// 继续播放
function continueAnalyze() {
	continueShow.value = false;
	inShow.value = true;
	gisViewer.value.viewer.clock.currenTime = stopTime.value;
	gisViewer.value.viewer.clock.shouldAnimate = true;
	showNowTime.value = false;
}

// 播放和暂停
function setSunLight(value) {
	if (
		analyzeDate.value == "" ||
		analyzeStartTime.value == "" ||
		analyzeEndTime.value == ""
	) {
		ElMessage({
			message: "请输入日照分析日期和起止时间",
			type: "warning",
		});
	} else {
		// nowTime.value = analyzeStartTime.value;
		switch (value) {
			case "play":
				startAnalyze();
				break;
			case "stop":
				stopAnalyze();
				break;
			case "continue":
				continueAnalyze();
				break;
		}
	}
}

// 清除日照分析效果
function removeAnalyze() {
	gisViewer.value.viewer.scene.globe.enableLighting = false; // 关闭光照
	gisViewer.value.viewer.shadows = false; // 关闭阴影
	gisViewer.value.viewer.clock.shouldAnimate = false; // 控制 clock 结束
	stopTime.value = null;
	continueShow.value = false;
	inShow.value = false;
	startShow.value = true;
	showNowTime.value = false;
}

// 判断动画是否结束
function showCurrentTime() {
	let tmpDateTime = new Date(analyzeDate.value).setHours(
		Number(analyzeEndTime.value.slice(0, 2))
	);
	if (
		new Date(gisViewer.value.viewer.clock.currentTime.toString()).getTime() ==
		new Date(tmpDateTime).getTime()
	) {
		ElMessage({
			message: "日照分析结束",
			type: "success",
		});
		Cesium.cancelAnimationFrame(raID.value);
		raID.value = 0;
		stopTime.value = null;
		continueShow.value = false;
		inShow.value = false;
		startShow.value = true;
	} else {
		raID.value = Cesium.requestAnimationFrame(showCurrentTime);
	}
}
</script>

<style scoped>
.container {
	margin-top: 1vh;
	margin-bottom: 1vh;
}
</style>
