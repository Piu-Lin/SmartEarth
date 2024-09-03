// const Cesium = require("cesium/Cesium");
const TriangleLinePrimitive = (function () {
    function _(viewer, positions, layer, name, func, param) {
        this.options = {
            // parent: layer,
            name: name,
            polyline: {
                show: true,
                positions: [],
                material: Cesium.Color.GOLD,
                width: 2
            },
            label: {
                font: "18px sans-serif",
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20, -40)
            }
        };
        this.viewer = viewer;
        this.positions = positions;
        this.func = func;
        this.param = param;
        this.layer = layer
        this._init();
    }

    _.prototype._init = function () {
        let _self = this;
        let _update = function () {
            return _self.positions;
        };
        let _update_label = function () {
            return _self.positions[1].clone();
        };
        let _text = function () {
            let text_temp = _self.func(_self.positions);
            text_temp = text_temp + _self.param.unit;
            return text_temp;
        };
        //实时更新polygon.hierarchy
        this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
        );
        this.options.position = new Cesium.CallbackProperty(_update_label, false);
        this.options.label.text = new Cesium.CallbackProperty(_text, false);

        this.layer.entities.add(this.options);
    };
    return _;
})();

export default TriangleLinePrimitive;
