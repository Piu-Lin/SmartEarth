/* eslint-disable linebreak-style */
/* eslint-disable prefer-template */
/* eslint-disable no-trailing-spaces */
import './Tooltip.css';

class TooltipDiv {
  constructor() {
    this.init = false;
  }
  
  initTool(frameDiv) {
    if (this.isInit) { return; }
    const div = document.createElement('DIV');
    div.className = 'toolTip-left';//
    // let arrow = document.createElement('DIV');
    // arrow.className = 'tooltipdiv-arrow';
    // div.appendChild(arrow);
    const title = document.createElement('DIV');
    title.className = 'tooltipdiv-inner';
    div.appendChild(title);
    this._div = div;
    this._title = title;
    frameDiv.appendChild(div);
    this.isInit = true;
  }
  
  setVisible(visible) {
    if (!this.isInit) { return; }
    this._div.style.display = visible ? 'block' : 'none';
  }
  
  /*
  position屏幕坐标
  显示在屏幕上
  */
  showAt(position, message) {
    if (!this.isInit) { return; }
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this._div.style.position = 'absolute';
      this._div.style.left = position.x + 60 + 'px';
      this._div.style.top = (position.y - this._div.clientHeight / 2) + 'px';
    }
  }
}
export default TooltipDiv;
