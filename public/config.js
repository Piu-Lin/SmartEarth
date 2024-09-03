// 天地图key
const TDT_TK = 'c0650b07fa664e0400284a70edc7d2d6';

// 暗系风格底图
const ARCGIS_URL = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';
const BASEMAPS_URL = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

// 天地图影像网址
const TIANDITU_IMG_MAP_URL = `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TK}`;

// 天地图影像注记网址
const TIANDITU_CIA_MAP_URL = `https://t{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TK}`;

// 天地图矢量网址
const TIANDITU_VEC_MAP_URL = `https://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TK}`;

// 天地图矢量注记网址
const TIANDITU_CVA_MAP_URL = `https://t{s}.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TK}`;

// arcgis影像
const ARCGIS_IMG = `https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`;

// 百度影像
const BAIDU_IMG = `http://shangetu1.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46`;
// 百度暗色底图
const BAIDU_DARK = `http://api0.map.bdimg.com/customimage/tile?=&x={x}&y={y}&z={z}&scale=1&customid=midnight`;

// 统一前缀
// const PREFIX_URL = 'https://cim.honlife.com.cn:81';
const PREFIX_URL = 'https://www.zjnxjkq.com:2443';
// 自定义URL地址
const CUSTOM_URL = {
  // 三维地貌DEM
  CUSTOM_DEM_URL: 'https://data.mars3d.cn/terrain', // 倾斜摄影模型地址
  // CUSTOM_TILESET_URL: `${PREFIX_URL}/model/nanxun-3dtiles0723/tileset.json`,
  // CUSTOM_TILESET_URL: `${PREFIX_URL}/model/nanxun-3dtiles0826/tileset.json`,
  // CUSTOM_TILESET_URL: `${PREFIX_URL}/model/nanxun-3dtiles0901/tileset.json`,
  CUSTOM_TILESET_URL: `${PREFIX_URL}/model/nanxun-3dtiles0824/tileset.json`,
  CUSTOM_TILESET_URL2: `${PREFIX_URL}/model/nanxun-3dtiles0722-2/tileset.json`,
  CUSTOM_TILESET_URL3: `${PREFIX_URL}/model/nanxun-3dtiles0824/tileset.json`, // 单体化模型
  CUSTOM_MONOMER: `${PREFIX_URL}/model/monomer/tileset.json`, // 倾斜摄影模型地址
  CUSTOM_TILESET_URL_EDIT: `${PREFIX_URL}/model/editmodel/tileset.json`, // FBX模型地址
  CUSTOM_TILESET_URL_FBX: `${PREFIX_URL}/model/FBX/tileset.json`, // FBX模型地址-室内
  CUSTOM_TILESET_URL_FBX_SN: `${PREFIX_URL}/model/FBX/SN/tileset.json`, // FBX模型地址-室外
  CUSTOM_TILESET_URL_FBX_SW: `${PREFIX_URL}/model/FBX/SW/tileset.json`, // FBX模型地址-地形
  CUSTOM_TILESET_URL_FBX_DX: `${PREFIX_URL}/model/FBX/DX/tileset.json`, // 镇边界
  CUSTOM_URL_BOUNDARY: `${PREFIX_URL}/model/dist/static/data/boundary.geojson`, // 村界
  CUSTOM_URL_BOUNDARYVILLAGE: `${PREFIX_URL}/model/dist/static/data/boundaryVillage.geojson`, // 网格文件
  CUSTOM_URL_GRID: `${PREFIX_URL}/model/dist/static/data/grid.geojson`, // 微网格文件
  CUSTOM_URL_MINIGRID: `${PREFIX_URL}/model/dist/static/data/minigrid.geojson`, // 水面
  CUSTOM_URL_WATER: `${PREFIX_URL}/model/dist/static/data/water.geojson`, // 园区
  CUSTOM_URL_PARKLINE: `${PREFIX_URL}/model/dist/static/data/parkLine.geojson`,
};

