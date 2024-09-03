// const Cesium = require("cesium/Cesium");
const PolylinePrimitive = (function () {
    function _(viewer, positions, layer, name, polylineOpt) {
      let p_opt = polylineOpt || {};
      this.options = {
        // parent: layer,
        name: name,
        polyline: {
          clampToGround: p_opt.clampToGround || false,
          show: true,
          positions: [],
          material: Cesium.Color.CHARTREUSE,
          width: 2
        }
      };
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
