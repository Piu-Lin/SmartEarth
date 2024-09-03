/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.96.3
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
define(["./defaultValue-77c08f32","./Transforms-fae4cdf7","./Matrix2-c788e106","./RuntimeError-50f3c270","./ComponentDatatype-94a172c0","./GeometryAttribute-4daab906","./GeometryAttributes-a490dcf1","./VertexFormat-a34558d6","./_commonjsHelpers-d90b2ade","./combine-4bf14979","./WebGLConstants-cbf0dab7"],(function(t,e,n,r,a,o,i,m,u,c,p){"use strict";function s(e){e=t.defaultValue(e,t.defaultValue.EMPTY_OBJECT);const n=t.defaultValue(e.vertexFormat,m.VertexFormat.DEFAULT);this._vertexFormat=n,this._workerName="createPlaneGeometry"}s.packedLength=m.VertexFormat.packedLength,s.pack=function(e,n,r){return r=t.defaultValue(r,0),m.VertexFormat.pack(e._vertexFormat,n,r),n};const y=new m.VertexFormat,f={vertexFormat:y};s.unpack=function(e,n,r){n=t.defaultValue(n,0);const a=m.VertexFormat.unpack(e,n,y);return t.defined(r)?(r._vertexFormat=m.VertexFormat.clone(a,r._vertexFormat),r):new s(f)};const l=new n.Cartesian3(-.5,-.5,0),A=new n.Cartesian3(.5,.5,0);return s.createGeometry=function(t){const r=t._vertexFormat,m=new i.GeometryAttributes;let u,c;if(r.position){if(c=new Float64Array(12),c[0]=l.x,c[1]=l.y,c[2]=0,c[3]=A.x,c[4]=l.y,c[5]=0,c[6]=A.x,c[7]=A.y,c[8]=0,c[9]=l.x,c[10]=A.y,c[11]=0,m.position=new o.GeometryAttribute({componentDatatype:a.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c}),r.normal){const t=new Float32Array(12);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=1,t[9]=0,t[10]=0,t[11]=1,m.normal=new o.GeometryAttribute({componentDatatype:a.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}if(r.st){const t=new Float32Array(8);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=1,t[5]=1,t[6]=0,t[7]=1,m.st=new o.GeometryAttribute({componentDatatype:a.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:t})}if(r.tangent){const t=new Float32Array(12);t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t[6]=1,t[7]=0,t[8]=0,t[9]=1,t[10]=0,t[11]=0,m.tangent=new o.GeometryAttribute({componentDatatype:a.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}if(r.bitangent){const t=new Float32Array(12);t[0]=0,t[1]=1,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=1,t[8]=0,t[9]=0,t[10]=1,t[11]=0,m.bitangent=new o.GeometryAttribute({componentDatatype:a.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}u=new Uint16Array(6),u[0]=0,u[1]=1,u[2]=2,u[3]=0,u[4]=2,u[5]=3}return new o.Geometry({attributes:m,indices:u,primitiveType:o.PrimitiveType.TRIANGLES,boundingSphere:new e.BoundingSphere(n.Cartesian3.ZERO,Math.sqrt(2))})},function(e,n){return t.defined(n)&&(e=s.unpack(e,n)),s.createGeometry(e)}}));
