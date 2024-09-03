// const Cesium = require("cesium/Cesium");
const PolygonPrimitive = (function () {
  function _(viewer, positions, layer, name, color, id, perPositionHeight) {
    this.options = {
      // parent: layer,
      name: name || '',
      id: id,
      polygon: {
        hierarchy: [],
        perPositionHeight: perPositionHeight ? perPositionHeight : false,
        material: color ? color.withAlpha(0.5) : Cesium.Color.CHARTREUSE.withAlpha(0.5)
      }
    };
    this.viewer = viewer;
    //this.hierarchy = positions;
    this.hierarchy = new Cesium.PolygonHierarchy(positions);
    this.layer = layer;
    this._init();
  }
  _.prototype._init = function () {
    let _self = this;
    let _update = function () {
      return _self.hierarchy;
    };
    //实时更新polygon.hierarchy
    this.options.polygon.hierarchy = new Cesium.CallbackProperty(
      _update,
      false
    );
    this.layer.entities.add(this.options);
  };
  return _;
})();
export default PolygonPrimitive;