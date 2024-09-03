/**
 * 参考资料：
 * https://html.rhhz.net/BJHKHTDXXBZRB/20180718.htm
*/

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
        integral += beta[i] * (s[i+1] - s[i]);
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

// 示例调用
// let lambda = 0.19; // 信号波长（米）
// let d = 20200000; // 卫星与接收机之间的距离（米）
// let beta = [0.01, 0.02, 0.015]; // 衰减损耗系数数组
// let s = [0, 100000, 200000]; // 信号在电离层中的传播路径（米）
// let l_O_SR = 6371000; // 垂线长度（米）
// let h_F2 = 350000; // 电离层F2层峰值高度（米）
// let R_e = 6371000; // 地球半径（米）

// let L_d = freeSpaceLoss(lambda, d);
// let L_a = atmosphericLoss(beta, s, l_O_SR, h_F2, R_e);
// let L_e = earthBlockLoss(l_O_SR, R_e);

// console.log("自由空间传播损耗: ", L_d, "dB");
// console.log("大气层损耗: ", L_a, "dB");
// console.log("地球遮挡损耗: ", L_e, "dB");
