const GlobelCesiumViewer = {
    viewer: null,
    getViewer() {
        return this.viewer;
    },
    setViewer(viewer) {
        this.viewer = viewer;
    },
    buildingTileset: null,
    getBuildingTileset() {
        return this.buildingTileset;
    },
    setBuidlingTileset(classification) {
        this.buildingTileset = classification;
    },
    resourceTileset: null,
    getResourceTileset() {
        return this.resourceTileset;
    },
    setResourceTileset(classification) {
        this.resourceTileset = classification;
    },
    tileVisible: [],
    getTileVisible() {
        return this.tileVisible;
    },
    setTileVisible(tile, i) {
        this.tileVisible[i] = tile;
    },
    /* 临时选中的Feature */
    pickedTempFeature: null,
    getPickedTempFeature() {
        return this.pickedTempFeature;
    },
    setPickedTempFeature(feature) {
        this.pickedTempFeature = feature;
    },
    /* 选中的feature */
    pickedFeatures: [],
    getPickedFeatures() {
        return this.pickedFeatures;
    },
    setPickedFeatures(features) {
        this.pickedFeatures = features;
    }
}
export default GlobelCesiumViewer;
