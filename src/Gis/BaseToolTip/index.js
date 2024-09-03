// import * as Cesium from 'cesium';
import ToolTipDiv from './Tooltip';
import {throttle} from '../tools';
import LayerType from '../enum/LayerType';

class BaseToolTip {
  // 初始化地图气泡
  initMapToolTip() {
    const {viewer} = this;

    // 如果应对广告牌，折线，标签等图元进行深度测试，则为真抵靠地形表面；
    // 如果应始终将此类图元绘制在顶部，则为false除非它们位于地球的另一侧。默认值为false
    // viewer.scene.globe.depthTestAgainstTerrain = false;
    // Scene Cesium虚拟场景中所有3D图形对象和状态的容器。
    const {scene} = viewer;
    // 创建一个提示信息对象
    this.toolTip = new ToolTipDiv();
    // viewer.cesiumWidget包含Cesium场景的小部件。 container 获取父容器。
    this.toolTip.initTool(viewer.cesiumWidget.container);
    // 处理用户输入事件。可以添加自定义功能以在用户输入时执行。
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);// scene.canvas 要为其创建场景的 HTML 画布元素。
    // setInputAction （动作、类型、修饰符） 设置要在输入事件上执行的函数
    handler.setInputAction(
      throttle((movement) => {
        // SceneMode 指示是在 3D、2D 还是 2.5D 哥伦布视图中查看场景。
        //  MORPHING 模式之间的变形，例如，3D 到 2D。
        if (scene.mode !== Cesium.SceneMode.MORPHING) {

          if (this.mapTooltip.visible) {
            this.mapTooltip.setPosition(movement.endPosition.x, movement.endPosition.y);
          }
          // 返回具有“primitive”属性的对象，该对象包含场景中特定窗口坐标处的第一个（顶部）
          // 图元，如果该位置没有任何内容，则返回未定义。其他属性可能会根据图元的类型进行设置，并可用于进一步识别拾取的对象。
          const pickedObject = scene.pick(movement.endPosition);// movement.endPosition窗口的位置
          let tip = null;
          if (pickedObject) {
            // 获得提示信息
            tip = this.getTips(pickedObject);
            this.toolTip.showAt(movement.endPosition, tip);
          }
          if (!tip) {
            this.toolTip.setVisible(false);
          }
        }
        // 表示鼠标移动事件。
      }, 1),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
  }

  // 提示信息
  getTips(pickedObject) {
    let result = null;
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.isTips) { // 如果定义了对象，则返回true，否则返回false。
      let info = null;
      if (pickedObject.id.isTips) {
        info = this.getInfoContent([
          {
            name: '名称',
            value: pickedObject.id.name,
            unit: '',
          }
        ]);
      }
      if (info) {
        result = `<div class='con'>${info}</div>`;
      }
    }
    return result;
  }

  // 获取弹出信息内容
  getInfoContent(attributes) {
    const rows = attributes.map((item) => `
      <div class='row'>
        <div class='name'>${item.name}：</div>
        <div class='value'>
          ${item.value}
          <span class='unit'>${item.unit}</span>
        </div>
      </div>
    `);

    return `
      <div class='table'>
        ${rows.join('')}
      </div>
    `;
  }
}

export default BaseToolTip;
