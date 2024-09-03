const Tooltip = (function () {
    function _(viewer) {
        this.viewer = viewer;
        this._elementId = "mapTooltip";
        this.visible = false;
    }

    _.prototype.create = function (text) {
        this.visible = true;
        let oldDiv = document.getElementById(this._elementId);
        if (oldDiv) {
            oldDiv.parentNode.removeChild(oldDiv);
        }
        let div = document.createElement("div");
        div.id = this._elementId;
        div.innerHTML = text;
        div.style.position = "absolute";
        div.style.padding = "3px";
        div.style.backgroundColor = "#393E40";
        div.style.color = "white";
        div.style.border = "1px solid #3183B2";
        div.style.lineHeight = "20px";
        div.style.fontSize = "8px";
        div.style.pointerEvents = "none";
        this.viewer._element.appendChild(div);
    };
    _.prototype.destroy = function () {
        this.visible = false;
        let div = document.getElementById(this._elementId);
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    _.prototype.setPosition = function (x, y) {
        let div = document.getElementById(this._elementId);
        div.style.top = y - 10 + "px";
        div.style.left = x + 10 + 'px';
    }
    return _;
})();

export default Tooltip;
