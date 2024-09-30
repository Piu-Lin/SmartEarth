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
let LongitudeIntervalGrid = 1 //网格的经度间隔

let StartLatitudeGrid = -90; // 网格的起始纬度
let EndLatitudeGrid = 90
let LatitudeIntervalGrid = 1 //网格的纬度度间隔


let endHeightGrid = 200000;// 网格的最终高度
let HeightIntervalGrid=180000; // 网格的高度间隔

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
              extrudedHeight: vHeightGrid+HeightIntervalGrid,
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

let eleromaLon=-105.0 // 电磁锥体网格经度
let eleromaLat=40.0 // 电磁锥体网格纬度
let eleromaCenter= new Cartesian3.fromDegrees(eleromaLon,eleromaLat) //网格的中心点
let eleromaBotRadius=900000.0 //电磁锥体网格半径

let eleromaHeight=900000 // 电磁锥体高度



// viewer.entities.add({
//   name: "Red cone",
//   position: Cartesian3.fromDegrees(eleromaLon, eleromaLat, eleromaHeight),
//   cylinder: {
//     length: eleromaHeight*2,
//     topRadius: 0,
//     bottomRadius: eleromaBotRadius,
//     material: Color.RED.withAlpha(0.3),
//     // outline: true,
//     // outlineColor: Color.MAGENTA,
//   },
// });
for(let veleromaHeight=0;veleromaHeight<=eleromaHeight*2;veleromaHeight+=HeightIntervalGrid){
  let veleromaBotRadius=eleromaBotRadius*(1-(veleromaHeight/(eleromaHeight*2)))
  
  let BoxColor = 1-(veleromaHeight/(eleromaHeight*2))>0.4?Color.WHITE.withAlpha(0.9):Color.GREEN.withAlpha(0.7)
  // let BoxColor=Color.WHITE.withAlpha(0.1)
  // console.log(BoxColor)
  for(let veleromaLat=eleromaLat-veleromaBotRadius*0.00000899;
    veleromaLat<eleromaLat+veleromaBotRadius*0.00000899;
    veleromaLat+=LatitudeIntervalGrid
  ){
    for (
      let veleromaLon=eleromaLon-veleromaBotRadius*0.00001141;
      veleromaLon<eleromaLon+veleromaBotRadius*0.00001141;
      veleromaLon+=LongitudeIntervalGrid
    ){
      if(
        Cartesian3.distance(eleromaCenter,Cartesian3.fromDegrees(veleromaLon,veleromaLat))>veleromaBotRadius || 
        Cartesian3.distance(eleromaCenter,Cartesian3.fromDegrees(veleromaLon+LongitudeIntervalGrid,veleromaLat))>veleromaBotRadius || 
        Cartesian3.distance(eleromaCenter,Cartesian3.fromDegrees(veleromaLon+LongitudeIntervalGrid,veleromaLat+LatitudeIntervalGrid))>veleromaBotRadius || 
        Cartesian3.distance(eleromaCenter,Cartesian3.fromDegrees(veleromaLon,veleromaLat+LatitudeIntervalGrid))>veleromaBotRadius 
      ){
        continue;
      }
      viewer.entities.add({
        name: "电磁网格",
        // description:"经纬度："+(vStartLongitudeGrid+LongitudeIntervalGrid)+","+(vStartLatitudeGrid+LatitudeIntervalGrid),
        polygon: {
          hierarchy: Cartesian3.fromDegreesArray([
            veleromaLon,
            veleromaLat,
            
            veleromaLon+LongitudeIntervalGrid,
            veleromaLat,
      
            veleromaLon+LongitudeIntervalGrid,
            veleromaLat+LatitudeIntervalGrid,     
                          
            veleromaLon,
            veleromaLat+LatitudeIntervalGrid,
          ]),

          extrudedHeight: (veleromaHeight/2)+HeightIntervalGrid,
          height:veleromaHeight/2,
          material: BoxColor,
          outline: true,
          outlineColor: Color.BLACK.withAlpha(0.2),
          arcType: ArcType.RHUMB,
        },
      })
    }
  }
}



