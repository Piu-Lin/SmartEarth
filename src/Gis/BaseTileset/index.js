// import * as Cesium from 'cesium';
import {
    adjustHeight
} from '../tools/adjustHeight';

export default class BaseTileset {

    createTileset(url, name, show = true, skipLevelOfDetail = false) {
        const tileset = new Cesium.Cesium3DTileset({
            url,
            maximumScreenSpaceError: 18,
            dynamicScreenSpaceError: true,
            skipLevelOfDetail: skipLevelOfDetail,
            maximumMemoryUsage: 1024,
            baseScreenSpaceError: 1024,
            skipScreenSpaceErrorFactor: 20,
            skipLevels: 1,
            loadSiblings: true
        });

        tileset.readyPromise
            .then(() => {
                tileset.name = name;
                tileset.show = show;
                if (name === 'nanxun' || name === 'nanxun_industry') {
                    // 调整模型高度
                    // adjustHeight(tileset, 3.5);
                    adjustHeight(tileset, 0);

                    tileset.tileVisible.addEventListener((tile) => {
                        let content = tile.content;
                        let featuresLength = content.featuresLength;
                        for (let i = 0; i < featuresLength; i += 2) {
                            let feature = content.getFeature(i);
                            let model = feature.content._model
                            const scale=Cesium.Matrix4.fromScale(new Cesium.Cartesian3(2,3,6),new Cesium.Matrix4)
                            model.modelMatrix=Cesium.Matrix4.multiply(model.modelMatrix,scale,model.modelMatrix)
                        }
                    })
                }
                if (name === 'monomer') {
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: "rgba(255,255,255,0.3)"
                    });
                }
                if (name === 'nanxun-fbx' || name === 'nanxun-fbx-sw' || name === 'nanxun-fbx-dx') {
                    // 调整模型高度
                    // adjustHeight(tileset, 18);
                }
                if (name === 'nanxun-fbx-sn') {
                    // 调整模型高度
                    tileset.show = false;
                    // adjustHeight(tileset, 14.9);
                }

                if (name === 'building') {
                    // 调整模型高度
                    // adjustHeight(tileset, 15);

                    tileset.tileVisible.addEventListener(function (tile) {
                        let content = tile.content;
                        let featuresLength = content.featuresLength;
                        for (let i = 0; i < featuresLength; i += 2) {
                            let feature = content.getFeature(i)
                            let model = feature.content._model

                            if (model && model._sourcePrograms && model._rendererResources) {
                                Object.keys(model._sourcePrograms).forEach(key => {
                                    let program = model._sourcePrograms[key]
                                    let fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
                                    let v_position = "";
                                    if (fragmentShader.indexOf(" v_positionEC;") != -1) {
                                        v_position = "v_positionEC";
                                    } else if (fragmentShader.indexOf(" v_pos;") != -1) {
                                        v_position = "v_pos";
                                    }
                                    const color = `vec4(${feature.color.toString()})`;

                                    model._rendererResources.sourceShaders[program.fragmentShader] =
                                        "varying vec3 " + v_position + ";\n" +
                                        "void main(void){\n" +
                                        "    vec4 position = czm_inverseModelView * vec4(" + v_position + ",1);\n" +
                                        "    float glowRange = 360.0;\n" +
                                        "    gl_FragColor = " + color + ";\n" +
                                        "    gl_FragColor = vec4(0.2,  0.5, 1.0, 1.0);\n" +
                                        "    gl_FragColor *= vec4(vec3(position.y / 50.0), 1.0);\n" +
                                        "    float time = fract(czm_frameNumber / 360.0);\n" +
                                        "    time = abs(time - 0.5) * 2.0;\n" +
                                        "    float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));\n" +
                                        "    gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);\n" +
                                        "}\n"
                                })
                                model._shouldRegenerateShaders = true
                            }
                        }
                    });
                }
                // 添加模型
                this.viewer.scene.primitives.add(tileset);
                // 更改相机状态
                // this.viewer.camera.flyToBoundingSphere(tileset.boundingSphere);
            })

        return tileset;
    }

    createTileset2(url, name, show = true, skipLevelOfDetail = false) {
        let tiles3dLayer;
        if (name === 'building' || name === 'building2') {
            tiles3dLayer = new mars3d.layer.TilesetLayer({
                name,
                url,
                position: { alt: -1 },
                maximumScreenSpaceError: 18,
                dynamicScreenSpaceError: true,
                skipLevelOfDetail: skipLevelOfDetail,
                maximumMemoryUsage: 1024,
                baseScreenSpaceError: 1024,
                skipScreenSpaceErrorFactor: 20,
                skipLevels: 1,
            })
        } else {
            tiles3dLayer = new mars3d.layer.TilesetLayer({
                name,
                url,
                maximumScreenSpaceError: 18,
                dynamicScreenSpaceError: true,
                skipLevelOfDetail: skipLevelOfDetail,
                maximumMemoryUsage: 1024,
                baseScreenSpaceError: 1024,
                skipScreenSpaceErrorFactor: 20,
                skipLevels: 1,
            })
        }
        this.map.addLayer(tiles3dLayer);
    }

    // 创建3d tiles
    createTilesetMonomer(url, name, show = true) {
        const tileset = new Cesium.Cesium3DTileset({
            url,
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            maximumScreenSpaceError: 32,
            dynamicScreenSpaceError: true,
            skipLevelOfDetail: true,
            maximumMemoryUsage: 1024,
            baseScreenSpaceError: 1024,
            skipScreenSpaceErrorFactor: 20,
            skipLevels: 1,
            loadSiblings: true
        });

        tileset.readyPromise
            .then(() => {
                tileset.name = name;
                tileset.show = show;
                if (name === 'monomer') {
                    // 调整模型高度
                    // adjustHeight(tileset, 5);
                    adjustHeight(tileset, 3.5);
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: "rgba(255, 255, 255, 0.01)"
                    });
                }
                // 添加模型
                this.viewer.scene.primitives.add(tileset);
            })
    }

    hide3DTileset(name) {
        this.viewer.scene.primitives._primitives.forEach(primitive => {
            if (primitive.name === name) {
                primitive.show = false;
            }
        })
    }
}
