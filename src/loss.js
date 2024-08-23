import {
    Math as CesiumMath
} from "cesium";

/**
 * 计算自由空间传播损耗
 * @param {number} lambda - 信号的波长（米）
 * @param {number} d - 卫星与接收机之间的距离（米）
 * @returns {number} 自由空间传播损耗（dB）
 */
function freeSpaceLoss(lambda, d) {
  return 20 * Math.log10(lambda / (4 * Math.PI * d));
}

/**
 * 计算大气层损耗
 * @param {number[]} beta - 衰减损耗系数数组
 * @param {number[]} s - 信号在电离层中的传播路径（米）
 * @param {number} l_O_SR - 地心在高轨航天器与GNSS卫星连线方向上的垂线长度（米）
 * @param {number} h_F2 - 电离层F2层峰值高度（米）
 * @param {number} R_e - 地球半径（米）
 * @returns {number} 大气层损耗（dB）
 */
function atmosphericLoss(beta, s, l_O_SR, h_F2, R_e) {
  if (l_O_SR > h_F2 + R_e) {
    return 0;
  }
  let integral = 0;
  for (let i = 0; i < s.length - 1; i++) {
    integral += beta[i] * (s[i + 1] - s[i]);
  }
  return -8.68 * integral;
}

/**
 * 计算地球遮挡损耗
 * @param {number} l_O_SR - 地心在高轨航天器与GNSS卫星连线方向上的垂线长度（米）
 * @param {number} R_e - 地球半径（米）
 * @returns {number} 地球遮挡损耗（dB）
 */
function earthBlockLoss(l_O_SR, R_e) {
  return l_O_SR > R_e ? 0 : -Infinity;
}

/**
 * 计算总损耗
 * @param {number} longitude - 卫星的经度（度）
 * @param {number} latitude - 卫星的纬度（度）
 * @param {number} height - 卫星的高度（米）
 * @param {number} lambda - 信号的波长（米）
 * @param {number[]} beta - 衰减损耗系数数组
 * @param {number[]} s - 信号在电离层中的传播路径（米）
 * @param {number} l_O_SR - 地心在高轨航天器与GNSS卫星连线方向上的垂线长度（米）
 * @param {number} h_F2 - 电离层F2层峰值高度（米）
 * @param {number} R_e - 地球半径（米）
 * @returns {number} 总损耗（dB）
 */
function totalLoss(
  longitude,
  latitude,
  height,
  lambda,
  beta,
  s,
  l_O_SR,
  h_F2,
  R_e,
) {
  // 计算卫星与接收机之间的距离
  const d = Math.sqrt(
    Math.pow(R_e + height, 2) +
      Math.pow(R_e, 2) -
      2 * (R_e + height) * R_e * Math.cos(CesiumMath.toRadians(latitude)),
  );

  // 自由空间传播损耗
  const fsLoss = freeSpaceLoss(lambda, d);

  // 大气层损耗
  const atmLoss = atmosphericLoss(beta, s, l_O_SR, h_F2, R_e);

  // 地球遮挡损耗
  const earthLoss = earthBlockLoss(l_O_SR, R_e);

  // 总损耗
  const totalLoss = fsLoss + atmLoss + earthLoss;

  console.log(`${fsLoss}, ${atmLoss}, ${earthLoss}`);
  return totalLoss;
}

// 示例数据
const longitude = 120.0988; // 卫星经度
const latitude = 0; // 卫星纬度
const height = 20200 * 1000; // 卫星高度
const lambda = 0.03; // 信号波长（30cm，对应于1GHz）
const beta = [0.01, 0.02]; // 衰减损耗系数
const s = [5000, 10000]; // 信号在电离层中的传播路径
const l_O_SR = 1000 * 1000; // 地心到高轨航天器与GNSS卫星连线方向的垂线长度
const h_F2 = 300 * 1000; // 电离层F2层峰值高度
const R_e = 6371 * 1000; // 地球半径

// 计算总损耗
const loss = totalLoss(
  longitude,
  latitude,
  height,
  lambda,
  beta,
  s,
  l_O_SR,
  h_F2,
  R_e,
);
console.log("总损耗（dB）:", loss);
