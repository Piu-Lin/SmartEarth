import { Cartesian3, Ion, Terrain, Viewer,Color ,ArcType,Entity} from "cesium";

import "./style.css";
import "cesium/Build/Cesium/Widgets/widgets.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NmM4ODRiMC05NzUwLTRkMGUtOTkxMS05ZGFhNTAyMWEzM2QiLCJpZCI6MjI4MzY4LCJpYXQiOjE3MjU0MzI5OTV9._rqnZtZbsaCVfb4XY_U2GpR-gmHy_iMZ2ebf-VigRiE";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

const numberToNo = {
  0:[1,1],
  1:[2,2],
  2:[4,2],
  3:[6,4],
  4:[9,8],
  5: [18,16],
  6: [46, 24],
  7: [69, 60],
  8: [178, 89],
  9: [356, 178],
  10: [712, 356]
}

let grading=0

let StartLongitudeGrid=-90; // 网格的起始经度
let EndtLongitudeGrid=180; // 网格的经度终点
let LongitudeIntervalGrid = 10 //网格的经度间隔

let StartLatitudeGrid = -90; // 网格的起始纬度
let EndLatitudeGrid = 90
let LatitudeIntervalGrid = 10 //网格的纬度度间隔


let endHeightGrid = 2000000;// 网格的最终高度
let HeightIntervalGrid=1000000; // 网格的高度间隔

let GridLines=[]

function CreateGrid(){
  // let StartLatitudeGrid=-85; // 网格的起始纬度
  // let StartLongitudeGrid=-180; // 网格的起始经度
  // let LongitudeIntervalGrid = 10 //网格的经度间隔
  // let LatitudeIntervalGrid = 10 //网格的纬度度间隔
  
  for (let vHeightGrid=0;vHeightGrid<=endHeightGrid;vHeightGrid+=HeightIntervalGrid){
    for (let vStartLatitudeGrid=StartLatitudeGrid;
      vStartLatitudeGrid<=EndLatitudeGrid-LatitudeIntervalGrid;
      vStartLatitudeGrid+=LatitudeIntervalGrid){
        for (let vStartLongitudeGrid=StartLongitudeGrid;
          vStartLongitudeGrid<=EndtLongitudeGrid-LongitudeIntervalGrid;
          vStartLongitudeGrid+=LongitudeIntervalGrid){
          //console.log(vStartLongitudeGrid,vStartLatitudeGrid,vStartLongitudeGrid+LongitudeIntervalGrid,vStartLatitudeGrid,vStartLongitudeGrid+LongitudeIntervalGrid,vStartLatitudeGrid+LatitudeIntervalGrid,vStartLongitudeGrid,vStartLatitudeGrid+LatitudeIntervalGrid,)
          let gildLine = new Entity({
            name: "三维立体网格",
            description:"经纬度："+(vStartLongitudeGrid+LongitudeIntervalGrid)+","+(vStartLatitudeGrid+LatitudeIntervalGrid),
            polygon: {
              hierarchy: Cartesian3.fromDegreesArray([
                vStartLongitudeGrid,
                vStartLatitudeGrid,

                vStartLongitudeGrid+LongitudeIntervalGrid,
                vStartLatitudeGrid,

                vStartLongitudeGrid+LongitudeIntervalGrid,
                vStartLatitudeGrid+LatitudeIntervalGrid,     
                              
                vStartLongitudeGrid,
                vStartLatitudeGrid+LatitudeIntervalGrid,
              ]),
              extrudedHeight: HeightIntervalGrid,
              perPositionHeight: false,
              height:vHeightGrid,
              material: Color.BLUE.withAlpha(0.1),
              outline: true,
              outlineColor: Color.MAGENTA,
              arcType: ArcType.RHUMB,
            },
          })
          GridLines.push(gildLine)
          viewer.entities.add(gildLine)
          // viewer.entities.remove(gildLine)
        }
    }
  }
}

function ClearGrid(){
  GridLines.map((item)=>{
    viewer.entities.remove(item)
  })
}

document.getElementById("updateWg").addEventListener("click", function(){
  ClearGrid()
  StartLongitudeGrid = Number(document.getElementById("StartLongitudeGrid").value)
  EndtLongitudeGrid = Number(document.getElementById("EndtLongitudeGrid").value)
  LongitudeIntervalGrid = Number(document.getElementById("LongitudeIntervalGrid").value)
  
  StartLatitudeGrid  = Number(document.getElementById("StartLatitudeGrid").value)
  EndLatitudeGrid = Number(document.getElementById("EndLatitudeGrid").value)
  LatitudeIntervalGrid = Number(document.getElementById("LatitudeIntervalGrid").value)

  HeightIntervalGrid = Number(document.getElementById("HeightIntervalGrid").value)
  endHeightGrid = Number(document.getElementById("endHeightGrid").value)
  CreateGrid();
});