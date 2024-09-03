// const Cesium = require("cesium/Cesium");
const PolylinePrimitive = (function () {
    function _(viewer, positions, layer, name, material, id, polylineOpt) {
        console.log(id);
        let p_opt = polylineOpt || {};
        this.options = {
            id: id,
            name: name,
            polyline: {
                clampToGround: false,
                show: true,
                positions: [],
                width: material.width,
                material: material.type === 'line' ? material.color// 画实线
                    // 画虚线
                    : (material.type === 'dash' ? new Cesium.PolylineDashMaterialProperty({
                        color: material.color,
                        dashLength: 20 //短划线长度
                        // 画发光的线
                    }) : (material.type === 'glow' ? new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.5,
                        color: material.color,
                        // 画带箭头的线
                    }) : (material.type === 'arrow' ? new Cesium.PolylineArrowMaterialProperty(material.color)
                        // 画带边框的线
                        : (new Cesium.PolylineOutlineMaterialProperty({
                            color: material.color, // 指定颜色
                            outlineWidth: 2, // 边框的宽度
                            outlineColor: Cesium.Color.RED, // 指定边框颜色
                        }))))),
            }
        }
        ;
        this.viewer = viewer;
        this.positions = positions;
        this.layer = layer
        this._init();
    }

    _.prototype._init = function () {
        let _self = this;
        let _update = function () {
            return _self.positions;
        };
        //实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
        );
        this.layer.entities.add(this.options);
    };
    return _;
})();

export default PolylinePrimitive;
