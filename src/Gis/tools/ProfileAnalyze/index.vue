<template>
	<panel-container ref="panelContainer" title="剖面线分析" :visible="visible" v-show="visible" @close="close"
		@miniaturized="miniaturized">
		<template v-slot:panel-content>
			<div class="container">
				<div class="control-panel">
					<div class="btns">
						<el-input class="sIntervalClass" v-model="samplingInterval" @change="inputChange">
							<template #prepend>采样间距</template>
						</el-input>
						<el-button type="primary" @click="toDrawLine">绘制线段</el-button>
						<el-button type="danger" @click="removeAnalyze">清除分析</el-button>
					</div>
					<div v-if='loadingShow' id="myProgress">
						<div id="myBar">{{ progressNum }}</div>
					</div>
					<div v-show="chartShow" id="mainChart" style="width: 560px; height: 360px"></div>
				</div>
			</div>
		</template>
	</panel-container>
</template>

<script setup>
import PanelContainer from "../PanelContainer";
import CursorStyle from "@/Gis/enum/CursorStyle";
import pickGloble from "../pickGloble";
import { ref, inject, reactive, onMounted } from "vue";
import * as echarts from "echarts";

const visible = ref(false);
const gisViewer = inject("bigScreenMap");
let chartShow = ref(false); // 控制 echarts 显示
let loadingShow = ref(false); // 控制 加载中 显示
let progressNum = ref('0');	// 当前进度
let timeId = null;	// settimeout id
let samplingInterval = ref(10); // 采样间距
let handler = {}; // 事件句柄
let pointArr = []; // 存放点数组
let startPoint = null; // 初始点
let endPoint = null; // 结束点
let pointLayer = null; // 点图层
let lineLayer = null; // 线图层
let line = null;
let hasLine = false;
let myChart = null; // echarts
let profile = {
	arrHB: [],
	arrPoint: [],
	points: [],
};

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

// 修改采样间距(按下回车键触发)
function inputChange(value) {
	profile = {
		arrHB: [],
		arrPoint: [],
		points: [],
	};
	forpointArr("changeCount");
}

// 绘制线段
function toDrawLine() {
	removeAnalyze();
	gisViewer.value.mapTooltip.create("单击开始绘制!");
	gisViewer.value.viewer._element.style.cursor = CursorStyle.CROSSHAIR;
	pointLayer = new Cesium.CustomDataSource("profilePointLayer");
	lineLayer = new Cesium.CustomDataSource("profileLineLayer");
	handler = new Cesium.ScreenSpaceEventHandler(
		gisViewer.value.viewer.scene.canvas
	);
	let tmpPointArr = [];
	let i = 0;
	handler.setInputAction(function (movement) {
		i++;
		if (i>1) {
			gisViewer.value.mapTooltip.create("右键结束绘制!");
		}
		let handPoint = pickGloble(gisViewer.value.viewer, movement.position);
		if (tmpPointArr.length === 0) {
			tmpPointArr.push(handPoint.clone());
		}
		pointArr.push(handPoint);
		tmpPointArr.push(handPoint);
		addPoint(gisViewer.value.viewer, handPoint, Cesium.Color.GREEN);
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	handler.setInputAction(function (movement) {
		gisViewer.value.mapTooltip.destroy();
		gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
		handler.destroy(); //关闭事件句柄
		if (i >= 1) {
			tmpPointArr.pop(); //最后一个点无效
		}
		forpointArr("begin");
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	gisViewer.value.viewer.dataSources.add(pointLayer);
}

// 遍历地图上的点
async function forpointArr(type) {
	loadingShow.value = true;
	if (pointArr.length >= 2) {
		for (let i = 0, j = 1; i < pointArr.length - 1; i++, j++) {
			startPoint = pointArr[i];
			endPoint = pointArr[i + 1];
			await cesiumsimpleheight(startPoint, endPoint, type);
			await computeProcess(j, pointArr.length - 1);
		}
		clearTimeout(timeId);
		profile.arrHB.push(getPointHeight(endPoint));
		profile.arrPoint.push(getDegrees(endPoint));
		getEcharts(profile);
	}
}

// 计算进度
async function computeProcess(i, randomPointCount) {
	return new Promise((res, rej) => {
		timeId = setTimeout(() => {
			let num = (i / randomPointCount) * 100;
			progressNum.value = num.toFixed(2).toString() + "%";
			document.getElementById("myBar").style.width = num.toFixed(2).toString() + "%";
			res("success");
		}, 10);
	});
}

// 添加点
function addPoint(viewer, pointPosition, pointColor) {
	let data = {
		position: pointPosition,
		point: {
			color: pointColor, //颜色
			pixelSize: 10, //点大小
		},
	};
	pointLayer.entities.add(data);
}

function drawLine(viewer, pointPosition) {
	let primitive = new Cesium.Primitive({
		geometryInstances: new Cesium.GeometryInstance({
			geometry: new Cesium.PolylineGeometry({
				positions: pointPosition,
				width: 3.0, //线宽
				vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
			}),
			attributes: {
				color: Cesium.ColorGeometryInstanceAttribute.fromColor(
					Cesium.Color.CORNFLOWERBLUE
				), //color  必须设置 不然没有效果
			},
		}),
		appearance: new Cesium.PolylineColorAppearance({
			translucent: false,
		}),
	});
	viewer.scene.primitives.add(primitive);
}

// 清除分析
function removeAnalyze() {
	profile = {
		arrHB: [],
		arrPoint: [],
		points: [],
	};
	gisViewer.value.viewer.dataSources.remove(pointLayer);
	gisViewer.value.viewer.dataSources.remove(lineLayer);
	pointLayer = null;
	lineLayer = null;
	line = null;
	if (JSON.stringify(handler) != "{}") {
		handler.destroy(); //关闭事件句柄
	}
	handler = {};
	pointArr = [];
	startPoint = null;
	endPoint = null;
	chartShow.value = false;
	hasLine = false;
	progressNum.value = '0';
	loadingShow.value = false;
	gisViewer.value.viewer._element.style.cursor = CursorStyle.DEFAULT;
}

function cesiumsimpleheight(cartesian1, cartesian2, type) {
	const cartesians = new Array(samplingInterval.value);
	for (let i = 0; i < samplingInterval.value; ++i) {
		const offset = i / (samplingInterval.value - 1);
		cartesians[i] = Cesium.Cartesian3.lerp(
			cartesian1,
			cartesian2,
			offset,
			new Cesium.Cartesian3()
		);
		profile.arrPoint.push(
			getDegrees(
				gisViewer.value.viewer.scene.clampToHeight(cartesians[i])
			)
		);
		profile.arrHB.push(getPointHeight(cartesians[i]));
	}
	return gisViewer.value.viewer.scene
		.clampToHeightMostDetailed(cartesians)
		.then(function (clampedCartesians) {
			if (type != "changeCount") {
				lineLayer.entities.add({
					polyline: {
						positions: clampedCartesians,
						arcType: Cesium.ArcType.NONE,
						width: 2,
						material: new Cesium.PolylineOutlineMaterialProperty({
							color: Cesium.Color.YELLOW,
						}),
						depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
							color: Cesium.Color.YELLOW,
						}),
					},
				});
				if (!hasLine) {
					gisViewer.value.viewer.dataSources.add(lineLayer);
					hasLine = true;
				}
			}
		});
}

// 获取当前点的高度(模型高度——地形高度)
function getPointHeight(cart) {
	let modelPointHeight = gisViewer.value.viewer.scene.sampleHeight(
		Cesium.Cartographic.fromCartesian(cart)
	);
	let terrainPointHeight = gisViewer.value.viewer.scene.globe.getHeight(
		Cesium.Cartographic.fromCartesian(cart)
	);
	return modelPointHeight - terrainPointHeight;
}

// 世界坐标转为经纬度
function getDegrees(cart) {
	let ellipsoid = gisViewer.value.viewer.scene.globe.ellipsoid;
	let cartograhphic = ellipsoid.cartesianToCartographic(cart);
	let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
	let lng = Cesium.Math.toDegrees(cartograhphic.longitude);
	let alt = cartograhphic.height;
	return { x: lng, y: lat, z: alt };
}

// 经纬度保留两位小数
function strFormat(str) {
	let strString = str.toString();
	let strs = strString.slice(0, strString.indexOf(".") + 6);
	return strs;
}

// 生成 Echarts 图表
function getEcharts(profile) {
	loadingShow.value = false;
	progressNum.value = '0';
	chartShow.value = true;
	if (!myChart) {
		chartShow.value = true;
		myChart = echarts.init(document.getElementById("mainChart"));
	}
	let t = profile.arrPoint;
	let h = profile.arrHB;
	// 指定图表的配置项和数据
	let option = {
		tooltip: {
			trigger: "axis",
			formatter: function (profile) {
				let htmldiv = "";
				let r = t[profile[0].dataIndex];
				return (htmldiv +=
					"经度(°)：" +
					strFormat(r.x) +
					"<br/>" +
					"纬度(°)：" +
					strFormat(r.y) +
					"<br/>" +
					"高度(m)：" +
					strFormat(h[profile[0].dataIndex]));
			},
		},
		xAxis: {
			type: "category",
			boundaryGap: false,
			axisLabel: {
				show: false,
			},
		},
		yAxis: {
			type: "value",
			axisLabel: {
				rotate: 0,
				formatter: "{value} 米",
			},
		},
		series: [
			{
				name: "高程值",
				type: "line",
				areaStyle: {},
				data: profile.arrHB,
			},
		],
	};
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}
</script>

<style scoped>
.container {
	margin-top: 1vh;
	margin-bottom: 1vh;
}

.sIntervalClass {
	width: 10vw;
	margin-right: 0.6vw;
}

#myProgress {
	width: 23vw;
	border-radius: 20px;
	background-color: #ddd;
	margin-top: 1vh;
}

#myBar {
	width: 0;
	height: 30px;
	border-radius: 20px;
	background-color: #4CAF50;
	text-align: center;
	line-height: 30px;
	color: white;
}
</style>
