/**
 *  流动纹理线
 *  color 颜色
 *  duration 持续时间 毫秒
 *  image 图片
**/
function polylineTrailLinkMaterial(Cesium) {
  let PolylineTrailLinkImage = '/static/images/texture/colors10.png';
  function PolylineTrailLinkMaterialProperty(color, duration, image) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = color;
    this.duration = duration;
    this._time = (new Date()).getTime();
    if(image) {
      PolylineTrailLinkImage = image;
    }
  }
  Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false;
      }
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      }
    },
    color: Cesium.createPropertyDescriptor('color')
  });
  PolylineTrailLinkMaterialProperty.prototype.getType = () => {
    return 'PolylineTrailLinkMaterialPropertyTop';
  }
  PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    result.image = PolylineTrailLinkImage;
    return result;
  }
  PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
    return this === other ||
      (other instanceof PolylineTrailLinkMaterialProperty &&
        Property.equals(this._color, other._color))
  }
  Cesium.PolylineTrailLinkMaterialPropertyTop = PolylineTrailLinkMaterialProperty;
  Cesium.Material._materialCache.addMaterial('PolylineTrailLinkMaterialPropertyTop', {
    fabric: {
      type: 'PolylineTrailLinkMaterialPropertyTop',
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        image: PolylineTrailLinkImage,
        time: 2000
      },
      source: 'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                {\n\
                                     czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                     vec2 st = materialInput.st;\n\
                                     vec4 colorImage = texture2D(image, vec2(fract(st.t - time), st.t));\n\
                                     material.alpha = colorImage.a * color.a;\n\
                                     material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                     return material;\n\
                                 }'
    },
    translucent: () => {
      return true;
    }
  });
}
export default polylineTrailLinkMaterial
