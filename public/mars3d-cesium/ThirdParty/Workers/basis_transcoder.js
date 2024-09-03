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

var BASIS=function(){var ae=typeof document<"u"&&document.currentScript?document.currentScript.src:void 0;return typeof __filename<"u"&&(ae=ae||__filename),function(x){x=x||{};var u=typeof x<"u"?x:{},xe,Ge;u.ready=new Promise(function(e,r){xe=e,readyPromiseRejectza=r});var G={},D;for(D in u)u.hasOwnProperty(D)&&(G[D]=u[D]);var z=[],ze="./this.program",Ae=function(e,r){throw r},se=!1,I=!1,$e=!1,Xe=!1;se=typeof window=="object",I=typeof importScripts=="function",$e=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string",Xe=!se&&!$e&&!I;var w="";function Er(e){return u.locateFile?u.locateFile(e,w):w+e}var ue,Fe,X,Rr,Ee,Re;$e?(I?w=require("path").dirname(w)+"/":w=__dirname+"/",ue=function(r,t){return Ee||(Ee=require("fs")),Re||(Re=require("path")),r=Re.normalize(r),Ee.readFileSync(r,t?null:"utf8")},X=function(r){var t=ue(r,!0);return t.buffer||(t=new Uint8Array(t)),Se(t.buffer),t},process.argv.length>1&&(ze=process.argv[1].replace(/\\/g,"/")),z=process.argv.slice(2),process.on("uncaughtException",function(e){if(!(e instanceof On))throw e}),process.on("unhandledRejection",L),Ae=function(e){process.exit(e)},u.inspect=function(){return"[Emscripten Module object]"}):Xe?(typeof read<"u"&&(ue=function(r){return read(r)}),X=function(r){var t;return typeof readbuffer=="function"?new Uint8Array(readbuffer(r)):(t=read(r,"binary"),Se(typeof t=="object"),t)},typeof scriptArgs<"u"?z=scriptArgs:typeof arguments<"u"&&(z=arguments),typeof quit=="function"&&(Ae=function(e){quit(e)}),typeof print<"u"&&(typeof console>"u"&&(console={}),console.log=print,console.warn=console.error=typeof printErr<"u"?printErr:print)):(se||I)&&(I?w=self.location.href:typeof document<"u"&&document.currentScript&&(w=document.currentScript.src),ae&&(w=ae),w.indexOf("blob:")!==0?w=w.substr(0,w.lastIndexOf("/")+1):w="",ue=function(e){var r=new XMLHttpRequest;return r.open("GET",e,!1),r.send(null),r.responseText},I&&(X=function(e){var r=new XMLHttpRequest;return r.open("GET",e,!1),r.responseType="arraybuffer",r.send(null),new Uint8Array(r.response)}),Fe=function(e,r,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="arraybuffer",n.onload=function(){if(n.status==200||n.status==0&&n.response){r(n.response);return}t()},n.onerror=t,n.send(null)},Rr=function(e){document.title=e});var Sr=u.print||console.log.bind(console),V=u.printErr||console.warn.bind(console);for(D in G)G.hasOwnProperty(D)&&(u[D]=G[D]);G=null,u.arguments&&(z=u.arguments),u.thisProgram&&(ze=u.thisProgram),u.quit&&(Ae=u.quit);var Or=0,Wr=function(e){Or=e},Y;u.wasmBinary&&(Y=u.wasmBinary);var Dn=u.noExitRuntime||!0;typeof WebAssembly!="object"&&L("no native wasm support detected");var fe,Ye=!1,Dr;function Se(e,r){e||L("Assertion failed: "+r)}var Je=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0;function Ke(e,r,t){for(var n=r+t,i=r;e[i]&&!(i>=n);)++i;if(i-r>16&&e.subarray&&Je)return Je.decode(e.subarray(r,i));for(var s="";r<i;){var f=e[r++];if(!(f&128)){s+=String.fromCharCode(f);continue}var o=e[r++]&63;if((f&224)==192){s+=String.fromCharCode((f&31)<<6|o);continue}var a=e[r++]&63;if((f&240)==224?f=(f&15)<<12|o<<6|a:f=(f&7)<<18|o<<12|a<<6|e[r++]&63,f<65536)s+=String.fromCharCode(f);else{var c=f-65536;s+=String.fromCharCode(55296|c>>10,56320|c&1023)}}return s}function Qe(e,r){return e?Ke(_,e,r):""}function Ur(e,r,t,n){if(!(n>0))return 0;for(var i=t,s=t+n-1,f=0;f<e.length;++f){var o=e.charCodeAt(f);if(o>=55296&&o<=57343){var a=e.charCodeAt(++f);o=65536+((o&1023)<<10)|a&1023}if(o<=127){if(t>=s)break;r[t++]=o}else if(o<=2047){if(t+1>=s)break;r[t++]=192|o>>6,r[t++]=128|o&63}else if(o<=65535){if(t+2>=s)break;r[t++]=224|o>>12,r[t++]=128|o>>6&63,r[t++]=128|o&63}else{if(t+3>=s)break;r[t++]=240|o>>18,r[t++]=128|o>>12&63,r[t++]=128|o>>6&63,r[t++]=128|o&63}}return r[t]=0,t-i}function jr(e,r,t){return Ur(e,_,r,t)}function Ir(e){for(var r=0,t=0;t<e.length;++t){var n=e.charCodeAt(t);n>=55296&&n<=57343&&(n=65536+((n&1023)<<10)|e.charCodeAt(++t)&1023),n<=127?++r:n<=2047?r+=2:n<=65535?r+=3:r+=4}return r}var Ze=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0;function kr(e,r){for(var t=e,n=t>>1,i=n+r/2;!(n>=i)&&J[n];)++n;if(t=n<<1,t-e>32&&Ze)return Ze.decode(_.subarray(e,t));for(var s="",f=0;!(f>=r/2);++f){var o=k[e+f*2>>1];if(o==0)break;s+=String.fromCharCode(o)}return s}function Hr(e,r,t){if(t===void 0&&(t=2147483647),t<2)return 0;t-=2;for(var n=r,i=t<e.length*2?t/2:e.length,s=0;s<i;++s){var f=e.charCodeAt(s);k[r>>1]=f,r+=2}return k[r>>1]=0,r-n}function Mr(e){return e.length*2}function Vr(e,r){for(var t=0,n="";!(t>=r/4);){var i=b[e+t*4>>2];if(i==0)break;if(++t,i>=65536){var s=i-65536;n+=String.fromCharCode(55296|s>>10,56320|s&1023)}else n+=String.fromCharCode(i)}return n}function Lr(e,r,t){if(t===void 0&&(t=2147483647),t<4)return 0;for(var n=r,i=n+t-4,s=0;s<e.length;++s){var f=e.charCodeAt(s);if(f>=55296&&f<=57343){var o=e.charCodeAt(++s);f=65536+((f&1023)<<10)|o&1023}if(b[r>>2]=f,r+=4,r+4>i)break}return b[r>>2]=0,r-n}function Br(e){for(var r=0,t=0;t<e.length;++t){var n=e.charCodeAt(t);n>=55296&&n<=57343&&++t,r+=4}return r}function qr(e,r){return e%r>0&&(e+=r-e%r),e}var Oe,ce,_,k,J,b,$,er,rr;function tr(e){Oe=e,u.HEAP8=ce=new Int8Array(e),u.HEAP16=k=new Int16Array(e),u.HEAP32=b=new Int32Array(e),u.HEAPU8=_=new Uint8Array(e),u.HEAPU16=J=new Uint16Array(e),u.HEAPU32=$=new Uint32Array(e),u.HEAPF32=er=new Float32Array(e),u.HEAPF64=rr=new Float64Array(e)}var Un=u.INITIAL_MEMORY||16777216,K,nr=[],ir=[],Nr=[],or=[],xr=!1;function Gr(){if(u.preRun)for(typeof u.preRun=="function"&&(u.preRun=[u.preRun]);u.preRun.length;)Jr(u.preRun.shift());le(nr)}function zr(){xr=!0,le(ir)}function Xr(){le(Nr)}function Yr(){if(u.postRun)for(typeof u.postRun=="function"&&(u.postRun=[u.postRun]);u.postRun.length;)Qr(u.postRun.shift());le(or)}function Jr(e){nr.unshift(e)}function Kr(e){ir.unshift(e)}function Qr(e){or.unshift(e)}var H=0,We=null,Q=null;function Zr(e){H++,u.monitorRunDependencies&&u.monitorRunDependencies(H)}function et(e){if(H--,u.monitorRunDependencies&&u.monitorRunDependencies(H),H==0&&(We!==null&&(clearInterval(We),We=null),Q)){var r=Q;Q=null,r()}}u.preloadedImages={},u.preloadedAudios={};function L(e){u.onAbort&&u.onAbort(e),e+="",V(e),Ye=!0,Dr=1,e="abort("+e+"). Build with -s ASSERTIONS=1 for more info.";var r=new WebAssembly.RuntimeError(e);throw Ge(r),r}function ar(e,r){return String.prototype.startsWith?e.startsWith(r):e.indexOf(r)===0}var rt="data:application/octet-stream;base64,";function sr(e){return ar(e,rt)}var tt="file://";function ur(e){return ar(e,tt)}var T="basis_transcoder.wasm";sr(T)||(T=Er(T));function fr(e){try{if(e==T&&Y)return new Uint8Array(Y);if(X)return X(e);throw"both async and sync fetching of the wasm failed"}catch(r){L(r)}}function nt(){if(!Y&&(se||I)){if(typeof fetch=="function"&&!ur(T))return fetch(T,{credentials:"same-origin"}).then(function(e){if(!e.ok)throw"failed to load wasm binary file at '"+T+"'";return e.arrayBuffer()}).catch(function(){return fr(T)});if(Fe)return new Promise(function(e,r){Fe(T,function(t){e(new Uint8Array(t))},r)})}return Promise.resolve().then(function(){return fr(T)})}function it(){var e={a:Fn};function r(f,o){var a=f.exports;u.asm=a,fe=u.asm.K,tr(fe.buffer),K=u.asm.O,Kr(u.asm.L),et("wasm-instantiate")}Zr("wasm-instantiate");function t(f){r(f.instance)}function n(f){return nt().then(function(o){var a=WebAssembly.instantiate(o,e);return a}).then(f,function(o){V("failed to asynchronously prepare wasm: "+o),L(o)})}function i(){return!Y&&typeof WebAssembly.instantiateStreaming=="function"&&!sr(T)&&!ur(T)&&typeof fetch=="function"?fetch(T,{credentials:"same-origin"}).then(function(f){var o=WebAssembly.instantiateStreaming(f,e);return o.then(t,function(a){return V("wasm streaming compile failed: "+a),V("falling back to ArrayBuffer instantiation"),n(t)})}):n(t)}if(u.instantiateWasm)try{var s=u.instantiateWasm(e,r);return s}catch(f){return V("Module.instantiateWasm callback failed with error: "+f),!1}return i().catch(Ge),{}}function le(e){for(;e.length>0;){var r=e.shift();if(typeof r=="function"){r(u);continue}var t=r.func;typeof t=="number"?r.arg===void 0?K.get(t)():K.get(t)(r.arg):t(r.arg===void 0?null:r.arg)}}var de={};function pe(e){for(;e.length;){var r=e.pop(),t=e.pop();t(r)}}function Z(e){return this.fromWireType($[e>>2])}var B={},M={},ve={},ot=48,at=57;function ye(e){if(e===void 0)return"_unknown";e=e.replace(/[^a-zA-Z0-9_]/g,"$");var r=e.charCodeAt(0);return r>=ot&&r<=at?"_"+e:e}function he(e,r){return e=ye(e),new Function("body","return function "+e+`() {
    "use strict";    return body.apply(this, arguments);
};
`)(r)}function De(e,r){var t=he(r,function(n){this.name=r,this.message=n;var i=new Error(n).stack;i!==void 0&&(this.stack=this.toString()+`
`+i.replace(/^Error(:[^\n]*)?\n/,""))});return t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.prototype.toString=function(){return this.message===void 0?this.name:this.name+": "+this.message},t}var cr=void 0;function ge(e){throw new cr(e)}function U(e,r,t){e.forEach(function(o){ve[o]=r});function n(o){var a=t(o);a.length!==e.length&&ge("Mismatched type converter count");for(var c=0;c<e.length;++c)F(e[c],a[c])}var i=new Array(r.length),s=[],f=0;r.forEach(function(o,a){M.hasOwnProperty(o)?i[a]=M[o]:(s.push(o),B.hasOwnProperty(o)||(B[o]=[]),B[o].push(function(){i[a]=M[o],++f,f===s.length&&n(i)}))}),s.length===0&&n(i)}function st(e){var r=de[e];delete de[e];var t=r.rawConstructor,n=r.rawDestructor,i=r.fields,s=i.map(function(f){return f.getterReturnType}).concat(i.map(function(f){return f.setterArgumentType}));U([e],s,function(f){var o={};return i.forEach(function(a,c){var l=a.fieldName,d=f[c],v=a.getter,y=a.getterContext,g=f[c+i.length],m=a.setter,C=a.setterContext;o[l]={read:function(E){return d.fromWireType(v(y,E))},write:function(E,oe){var W=[];m(C,E,g.toWireType(W,oe)),pe(W)}}}),[{name:r.name,fromWireType:function(a){var c={};for(var l in o)c[l]=o[l].read(a);return n(a),c},toWireType:function(a,c){for(var l in o)if(!(l in c))throw new TypeError('Missing field:  "'+l+'"');var d=t();for(l in o)o[l].write(d,c[l]);return a!==null&&a.push(n,d),d},argPackAdvance:8,readValueFromPointer:Z,destructorFunction:n}]})}function _e(e){switch(e){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+e)}}function ut(){for(var e=new Array(256),r=0;r<256;++r)e[r]=String.fromCharCode(r);lr=e}var lr=void 0;function h(e){for(var r="",t=e;_[t];)r+=lr[_[t++]];return r}var q=void 0;function p(e){throw new q(e)}function F(e,r,t){if(t=t||{},!("argPackAdvance"in r))throw new TypeError("registerType registeredInstance requires argPackAdvance");var n=r.name;if(e||p('type "'+n+'" must have a positive integer typeid pointer'),M.hasOwnProperty(e)){if(t.ignoreDuplicateRegistrations)return;p("Cannot register type '"+n+"' twice")}if(M[e]=r,delete ve[e],B.hasOwnProperty(e)){var i=B[e];delete B[e],i.forEach(function(s){s()})}}function ft(e,r,t,n,i){var s=_e(t);r=h(r),F(e,{name:r,fromWireType:function(f){return!!f},toWireType:function(f,o){return o?n:i},argPackAdvance:8,readValueFromPointer:function(f){var o;if(t===1)o=ce;else if(t===2)o=k;else if(t===4)o=b;else throw new TypeError("Unknown boolean type size: "+r);return this.fromWireType(o[f>>s])},destructorFunction:null})}function ct(e){if(!(this instanceof j)||!(e instanceof j))return!1;for(var r=this.$$.ptrType.registeredClass,t=this.$$.ptr,n=e.$$.ptrType.registeredClass,i=e.$$.ptr;r.baseClass;)t=r.upcast(t),r=r.baseClass;for(;n.baseClass;)i=n.upcast(i),n=n.baseClass;return r===n&&t===i}function lt(e){return{count:e.count,deleteScheduled:e.deleteScheduled,preservePointerOnDelete:e.preservePointerOnDelete,ptr:e.ptr,ptrType:e.ptrType,smartPtr:e.smartPtr,smartPtrType:e.smartPtrType}}function Ue(e){function r(t){return t.$$.ptrType.registeredClass.name}p(r(e)+" instance already deleted")}var je=!1;function dr(e){}function dt(e){e.smartPtr?e.smartPtrType.rawDestructor(e.smartPtr):e.ptrType.registeredClass.rawDestructor(e.ptr)}function pr(e){e.count.value-=1;var r=e.count.value===0;r&&dt(e)}function ee(e){return typeof FinalizationGroup>"u"?(ee=function(r){return r},e):(je=new FinalizationGroup(function(r){for(var t=r.next();!t.done;t=r.next()){var n=t.value;n.ptr?pr(n):console.warn("object already deleted: "+n.ptr)}}),ee=function(r){return je.register(r,r.$$,r.$$),r},dr=function(r){je.unregister(r.$$)},ee(e))}function pt(){if(this.$$.ptr||Ue(this),this.$$.preservePointerOnDelete)return this.$$.count.value+=1,this;var e=ee(Object.create(Object.getPrototypeOf(this),{$$:{value:lt(this.$$)}}));return e.$$.count.value+=1,e.$$.deleteScheduled=!1,e}function vt(){this.$$.ptr||Ue(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&p("Object already scheduled for deletion"),dr(this),pr(this.$$),this.$$.preservePointerOnDelete||(this.$$.smartPtr=void 0,this.$$.ptr=void 0)}function yt(){return!this.$$.ptr}var re=void 0,te=[];function Ie(){for(;te.length;){var e=te.pop();e.$$.deleteScheduled=!1,e.delete()}}function ht(){return this.$$.ptr||Ue(this),this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete&&p("Object already scheduled for deletion"),te.push(this),te.length===1&&re&&re(Ie),this.$$.deleteScheduled=!0,this}function gt(){j.prototype.isAliasOf=ct,j.prototype.clone=pt,j.prototype.delete=vt,j.prototype.isDeleted=yt,j.prototype.deleteLater=ht}function j(){}var vr={};function yr(e,r,t){if(e[r].overloadTable===void 0){var n=e[r];e[r]=function(){return e[r].overloadTable.hasOwnProperty(arguments.length)||p("Function '"+t+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+e[r].overloadTable+")!"),e[r].overloadTable[arguments.length].apply(this,arguments)},e[r].overloadTable=[],e[r].overloadTable[n.argCount]=n}}function ke(e,r,t){u.hasOwnProperty(e)?((t===void 0||u[e].overloadTable!==void 0&&u[e].overloadTable[t]!==void 0)&&p("Cannot register public name '"+e+"' twice"),yr(u,e,e),u.hasOwnProperty(t)&&p("Cannot register multiple overloads of a function with the same number of arguments ("+t+")!"),u[e].overloadTable[t]=r):(u[e]=r,t!==void 0&&(u[e].numArguments=t))}function _t(e,r,t,n,i,s,f,o){this.name=e,this.constructor=r,this.instancePrototype=t,this.rawDestructor=n,this.baseClass=i,this.getActualType=s,this.upcast=f,this.downcast=o,this.pureVirtualFunctions=[]}function He(e,r,t){for(;r!==t;)r.upcast||p("Expected null or instance of "+t.name+", got an instance of "+r.name),e=r.upcast(e),r=r.baseClass;return e}function mt(e,r){if(r===null)return this.isReference&&p("null is not a valid "+this.name),0;r.$$||p('Cannot pass "'+N(r)+'" as a '+this.name),r.$$.ptr||p("Cannot pass deleted object as a pointer of type "+this.name);var t=r.$$.ptrType.registeredClass,n=He(r.$$.ptr,t,this.registeredClass);return n}function bt(e,r){var t;if(r===null)return this.isReference&&p("null is not a valid "+this.name),this.isSmartPointer?(t=this.rawConstructor(),e!==null&&e.push(this.rawDestructor,t),t):0;r.$$||p('Cannot pass "'+N(r)+'" as a '+this.name),r.$$.ptr||p("Cannot pass deleted object as a pointer of type "+this.name),!this.isConst&&r.$$.ptrType.isConst&&p("Cannot convert argument of type "+(r.$$.smartPtrType?r.$$.smartPtrType.name:r.$$.ptrType.name)+" to parameter type "+this.name);var n=r.$$.ptrType.registeredClass;if(t=He(r.$$.ptr,n,this.registeredClass),this.isSmartPointer)switch(r.$$.smartPtr===void 0&&p("Passing raw pointer to smart pointer is illegal"),this.sharingPolicy){case 0:r.$$.smartPtrType===this?t=r.$$.smartPtr:p("Cannot convert argument of type "+(r.$$.smartPtrType?r.$$.smartPtrType.name:r.$$.ptrType.name)+" to parameter type "+this.name);break;case 1:t=r.$$.smartPtr;break;case 2:if(r.$$.smartPtrType===this)t=r.$$.smartPtr;else{var i=r.clone();t=this.rawShare(t,S(function(){i.delete()})),e!==null&&e.push(this.rawDestructor,t)}break;default:p("Unsupporting sharing policy")}return t}function wt(e,r){if(r===null)return this.isReference&&p("null is not a valid "+this.name),0;r.$$||p('Cannot pass "'+N(r)+'" as a '+this.name),r.$$.ptr||p("Cannot pass deleted object as a pointer of type "+this.name),r.$$.ptrType.isConst&&p("Cannot convert argument of type "+r.$$.ptrType.name+" to parameter type "+this.name);var t=r.$$.ptrType.registeredClass,n=He(r.$$.ptr,t,this.registeredClass);return n}function Tt(e){return this.rawGetPointee&&(e=this.rawGetPointee(e)),e}function Pt(e){this.rawDestructor&&this.rawDestructor(e)}function Ct(e){e!==null&&e.delete()}function hr(e,r,t){if(r===t)return e;if(t.baseClass===void 0)return null;var n=hr(e,r,t.baseClass);return n===null?null:t.downcast(n)}function At(){return Object.keys(ne).length}function $t(){var e=[];for(var r in ne)ne.hasOwnProperty(r)&&e.push(ne[r]);return e}function Ft(e){re=e,te.length&&re&&re(Ie)}function Et(){u.getInheritedInstanceCount=At,u.getLiveInheritedInstances=$t,u.flushPendingDeletes=Ie,u.setDelayFunction=Ft}var ne={};function Rt(e,r){for(r===void 0&&p("ptr should not be undefined");e.baseClass;)r=e.upcast(r),e=e.baseClass;return r}function St(e,r){return r=Rt(e,r),ne[r]}function me(e,r){(!r.ptrType||!r.ptr)&&ge("makeClassHandle requires ptr and ptrType");var t=!!r.smartPtrType,n=!!r.smartPtr;return t!==n&&ge("Both smartPtrType and smartPtr must be specified"),r.count={value:1},ee(Object.create(e,{$$:{value:r}}))}function Ot(e){var r=this.getPointee(e);if(!r)return this.destructor(e),null;var t=St(this.registeredClass,r);if(t!==void 0){if(t.$$.count.value===0)return t.$$.ptr=r,t.$$.smartPtr=e,t.clone();var n=t.clone();return this.destructor(e),n}function i(){return this.isSmartPointer?me(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:r,smartPtrType:this,smartPtr:e}):me(this.registeredClass.instancePrototype,{ptrType:this,ptr:e})}var s=this.registeredClass.getActualType(r),f=vr[s];if(!f)return i.call(this);var o;this.isConst?o=f.constPointerType:o=f.pointerType;var a=hr(r,this.registeredClass,o.registeredClass);return a===null?i.call(this):this.isSmartPointer?me(o.registeredClass.instancePrototype,{ptrType:o,ptr:a,smartPtrType:this,smartPtr:e}):me(o.registeredClass.instancePrototype,{ptrType:o,ptr:a})}function Wt(){R.prototype.getPointee=Tt,R.prototype.destructor=Pt,R.prototype.argPackAdvance=8,R.prototype.readValueFromPointer=Z,R.prototype.deleteObject=Ct,R.prototype.fromWireType=Ot}function R(e,r,t,n,i,s,f,o,a,c,l){this.name=e,this.registeredClass=r,this.isReference=t,this.isConst=n,this.isSmartPointer=i,this.pointeeType=s,this.sharingPolicy=f,this.rawGetPointee=o,this.rawConstructor=a,this.rawShare=c,this.rawDestructor=l,!i&&r.baseClass===void 0?n?(this.toWireType=mt,this.destructorFunction=null):(this.toWireType=wt,this.destructorFunction=null):this.toWireType=bt}function gr(e,r,t){u.hasOwnProperty(e)||ge("Replacing nonexistant public symbol"),u[e].overloadTable!==void 0&&t!==void 0?u[e].overloadTable[t]=r:(u[e]=r,u[e].argCount=t)}function Dt(e,r,t){var n=u["dynCall_"+e];return t&&t.length?n.apply(null,[r].concat(t)):n.call(null,r)}function Ut(e,r,t){return e.indexOf("j")!=-1?Dt(e,r,t):K.get(r).apply(null,t)}function jt(e,r){var t=[];return function(){t.length=arguments.length;for(var n=0;n<arguments.length;n++)t[n]=arguments[n];return Ut(e,r,t)}}function A(e,r){e=h(e);function t(){return e.indexOf("j")!=-1?jt(e,r):K.get(r)}var n=t();return typeof n!="function"&&p("unknown function pointer with signature "+e+": "+r),n}var _r=void 0;function mr(e){var r=Cr(e),t=h(r);return O(r),t}function be(e,r){var t=[],n={};function i(s){if(!n[s]&&!M[s]){if(ve[s]){ve[s].forEach(i);return}t.push(s),n[s]=!0}}throw r.forEach(i),new _r(e+": "+t.map(mr).join([", "]))}function It(e,r,t,n,i,s,f,o,a,c,l,d,v){l=h(l),s=A(i,s),o&&(o=A(f,o)),c&&(c=A(a,c)),v=A(d,v);var y=ye(l);ke(y,function(){be("Cannot construct "+l+" due to unbound types",[n])}),U([e,r,t],n?[n]:[],function(g){g=g[0];var m,C;n?(m=g.registeredClass,C=m.instancePrototype):C=j.prototype;var E=he(y,function(){if(Object.getPrototypeOf(this)!==oe)throw new q("Use 'new' to construct "+l);if(W.constructor_body===void 0)throw new q(l+" has no accessible constructor");var Fr=W.constructor_body[arguments.length];if(Fr===void 0)throw new q("Tried to invoke ctor of "+l+" with invalid number of parameters ("+arguments.length+") - expected ("+Object.keys(W.constructor_body).toString()+") parameters instead!");return Fr.apply(this,arguments)}),oe=Object.create(C,{constructor:{value:E}});E.prototype=oe;var W=new _t(l,E,oe,v,m,s,o,c),Wn=new R(l,W,!0,!1,!1),Ar=new R(l+"*",W,!1,!1,!1),$r=new R(l+" const*",W,!1,!0,!1);return vr[e]={pointerType:Ar,constPointerType:$r},gr(y,E),[Wn,Ar,$r]})}function Me(e,r){for(var t=[],n=0;n<e;n++)t.push(b[(r>>2)+n]);return t}function kt(e,r,t,n,i,s){Se(r>0);var f=Me(r,t);i=A(n,i);var o=[s],a=[];U([],[e],function(c){c=c[0];var l="constructor "+c.name;if(c.registeredClass.constructor_body===void 0&&(c.registeredClass.constructor_body=[]),c.registeredClass.constructor_body[r-1]!==void 0)throw new q("Cannot register multiple constructors with identical number of parameters ("+(r-1)+") for class '"+c.name+"'! Overload resolution is currently only performed using the parameter count, not actual type info!");return c.registeredClass.constructor_body[r-1]=function(){be("Cannot construct "+c.name+" due to unbound types",f)},U([],f,function(d){return c.registeredClass.constructor_body[r-1]=function(){arguments.length!==r-1&&p(l+" called with "+arguments.length+" arguments, expected "+(r-1)),a.length=0,o.length=r;for(var y=1;y<r;++y)o[y]=d[y].toWireType(a,arguments[y-1]);var g=i.apply(null,o);return pe(a),d[0].fromWireType(g)},[]}),[]})}function br(e,r){if(!(e instanceof Function))throw new TypeError("new_ called with constructor type "+typeof e+" which is not a function");var t=he(e.name||"unknownFunctionName",function(){});t.prototype=e.prototype;var n=new t,i=e.apply(n,r);return i instanceof Object?i:n}function wr(e,r,t,n,i){var s=r.length;s<2&&p("argTypes array size mismatch! Must at least get return value and 'this' types!");for(var f=r[1]!==null&&t!==null,o=!1,a=1;a<r.length;++a)if(r[a]!==null&&r[a].destructorFunction===void 0){o=!0;break}for(var c=r[0].name!=="void",l="",d="",a=0;a<s-2;++a)l+=(a!==0?", ":"")+"arg"+a,d+=(a!==0?", ":"")+"arg"+a+"Wired";var v="return function "+ye(e)+"("+l+`) {
if (arguments.length !== `+(s-2)+`) {
throwBindingError('function `+e+" called with ' + arguments.length + ' arguments, expected "+(s-2)+` args!');
}
`;o&&(v+=`var destructors = [];
`);var y=o?"destructors":"null",g=["throwBindingError","invoker","fn","runDestructors","retType","classParam"],m=[p,n,i,pe,r[0],r[1]];f&&(v+="var thisWired = classParam.toWireType("+y+`, this);
`);for(var a=0;a<s-2;++a)v+="var arg"+a+"Wired = argType"+a+".toWireType("+y+", arg"+a+"); // "+r[a+2].name+`
`,g.push("argType"+a),m.push(r[a+2]);if(f&&(d="thisWired"+(d.length>0?", ":"")+d),v+=(c?"var rv = ":"")+"invoker(fn"+(d.length>0?", ":"")+d+`);
`,o)v+=`runDestructors(destructors);
`;else for(var a=f?1:2;a<r.length;++a){var C=a===1?"thisWired":"arg"+(a-2)+"Wired";r[a].destructorFunction!==null&&(v+=C+"_dtor("+C+"); // "+r[a].name+`
`,g.push(C+"_dtor"),m.push(r[a].destructorFunction))}c&&(v+=`var ret = retType.fromWireType(rv);
return ret;
`),v+=`}
`,g.push(v);var E=br(Function,g).apply(null,m);return E}function Ht(e,r,t,n,i,s,f,o){var a=Me(t,n);r=h(r),s=A(i,s),U([],[e],function(c){c=c[0];var l=c.name+"."+r;o&&c.registeredClass.pureVirtualFunctions.push(r);function d(){be("Cannot call "+l+" due to unbound types",a)}var v=c.registeredClass.instancePrototype,y=v[r];return y===void 0||y.overloadTable===void 0&&y.className!==c.name&&y.argCount===t-2?(d.argCount=t-2,d.className=c.name,v[r]=d):(yr(v,r,l),v[r].overloadTable[t-2]=d),U([],a,function(g){var m=wr(l,g,c,s,f);return v[r].overloadTable===void 0?(m.argCount=t-2,v[r]=m):v[r].overloadTable[t-2]=m,[]}),[]})}function Mt(e,r,t){e=h(e),U([],[r],function(n){return n=n[0],u[e]=n.fromWireType(t),[]})}var Ve=[],P=[{},{value:void 0},{value:null},{value:!0},{value:!1}];function Le(e){e>4&&--P[e].refcount===0&&(P[e]=void 0,Ve.push(e))}function Vt(){for(var e=0,r=5;r<P.length;++r)P[r]!==void 0&&++e;return e}function Lt(){for(var e=5;e<P.length;++e)if(P[e]!==void 0)return P[e];return null}function Bt(){u.count_emval_handles=Vt,u.get_first_emval=Lt}function S(e){switch(e){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:{var r=Ve.length?Ve.pop():P.length;return P[r]={refcount:1,value:e},r}}}function qt(e,r){r=h(r),F(e,{name:r,fromWireType:function(t){var n=P[t].value;return Le(t),n},toWireType:function(t,n){return S(n)},argPackAdvance:8,readValueFromPointer:Z,destructorFunction:null})}function Nt(e,r,t){switch(r){case 0:return function(n){var i=t?ce:_;return this.fromWireType(i[n])};case 1:return function(n){var i=t?k:J;return this.fromWireType(i[n>>1])};case 2:return function(n){var i=t?b:$;return this.fromWireType(i[n>>2])};default:throw new TypeError("Unknown integer type: "+e)}}function xt(e,r,t,n){var i=_e(t);r=h(r);function s(){}s.values={},F(e,{name:r,constructor:s,fromWireType:function(f){return this.constructor.values[f]},toWireType:function(f,o){return o.value},argPackAdvance:8,readValueFromPointer:Nt(r,i,n),destructorFunction:null}),ke(r,s)}function we(e,r){var t=M[e];return t===void 0&&p(r+" has unknown type "+mr(e)),t}function Gt(e,r,t){var n=we(e,"enum");r=h(r);var i=n.constructor,s=Object.create(n.constructor.prototype,{value:{value:t},constructor:{value:he(n.name+"_"+r,function(){})}});i.values[t]=s,i[r]=s}function N(e){if(e===null)return"null";var r=typeof e;return r==="object"||r==="array"||r==="function"?e.toString():""+e}function zt(e,r){switch(r){case 2:return function(t){return this.fromWireType(er[t>>2])};case 3:return function(t){return this.fromWireType(rr[t>>3])};default:throw new TypeError("Unknown float type: "+e)}}function Xt(e,r,t){var n=_e(t);r=h(r),F(e,{name:r,fromWireType:function(i){return i},toWireType:function(i,s){if(typeof s!="number"&&typeof s!="boolean")throw new TypeError('Cannot convert "'+N(s)+'" to '+this.name);return s},argPackAdvance:8,readValueFromPointer:zt(r,n),destructorFunction:null})}function Yt(e,r,t,n,i,s){var f=Me(r,t);e=h(e),i=A(n,i),ke(e,function(){be("Cannot call "+e+" due to unbound types",f)},r-1),U([],f,function(o){var a=[o[0],null].concat(o.slice(1));return gr(e,wr(e,a,null,i,s),r-1),[]})}function Jt(e,r,t){switch(r){case 0:return t?function(i){return ce[i]}:function(i){return _[i]};case 1:return t?function(i){return k[i>>1]}:function(i){return J[i>>1]};case 2:return t?function(i){return b[i>>2]}:function(i){return $[i>>2]};default:throw new TypeError("Unknown integer type: "+e)}}function Kt(e,r,t,n,i){r=h(r),i===-1&&(i=4294967295);var s=_e(t),f=function(c){return c};if(n===0){var o=32-8*t;f=function(c){return c<<o>>>o}}var a=r.indexOf("unsigned")!=-1;F(e,{name:r,fromWireType:f,toWireType:function(c,l){if(typeof l!="number"&&typeof l!="boolean")throw new TypeError('Cannot convert "'+N(l)+'" to '+this.name);if(l<n||l>i)throw new TypeError('Passing a number "'+N(l)+'" from JS side to C/C++ side to an argument of type "'+r+'", which is outside the valid range ['+n+", "+i+"]!");return a?l>>>0:l|0},argPackAdvance:8,readValueFromPointer:Jt(r,s,n!==0),destructorFunction:null})}function Qt(e,r,t){var n=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],i=n[r];function s(f){f=f>>2;var o=$,a=o[f],c=o[f+1];return new i(Oe,c,a)}t=h(t),F(e,{name:t,fromWireType:s,argPackAdvance:8,readValueFromPointer:s},{ignoreDuplicateRegistrations:!0})}function Zt(e,r){r=h(r);var t=r==="std::string";F(e,{name:r,fromWireType:function(n){var i=$[n>>2],s;if(t)for(var f=n+4,o=0;o<=i;++o){var a=n+4+o;if(o==i||_[a]==0){var c=a-f,l=Qe(f,c);s===void 0?s=l:(s+=String.fromCharCode(0),s+=l),f=a+1}}else{for(var d=new Array(i),o=0;o<i;++o)d[o]=String.fromCharCode(_[n+4+o]);s=d.join("")}return O(n),s},toWireType:function(n,i){i instanceof ArrayBuffer&&(i=new Uint8Array(i));var s,f=typeof i=="string";f||i instanceof Uint8Array||i instanceof Uint8ClampedArray||i instanceof Int8Array||p("Cannot pass non-string to std::string"),t&&f?s=function(){return Ir(i)}:s=function(){return i.length};var o=s(),a=qe(4+o+1);if($[a>>2]=o,t&&f)jr(i,a+4,o+1);else if(f)for(var c=0;c<o;++c){var l=i.charCodeAt(c);l>255&&(O(a),p("String has UTF-16 code units that do not fit in 8 bits")),_[a+4+c]=l}else for(var c=0;c<o;++c)_[a+4+c]=i[c];return n!==null&&n.push(O,a),a},argPackAdvance:8,readValueFromPointer:Z,destructorFunction:function(n){O(n)}})}function en(e,r,t){t=h(t);var n,i,s,f,o;r===2?(n=kr,i=Hr,f=Mr,s=function(){return J},o=1):r===4&&(n=Vr,i=Lr,f=Br,s=function(){return $},o=2),F(e,{name:t,fromWireType:function(a){for(var c=$[a>>2],l=s(),d,v=a+4,y=0;y<=c;++y){var g=a+4+y*r;if(y==c||l[g>>o]==0){var m=g-v,C=n(v,m);d===void 0?d=C:(d+=String.fromCharCode(0),d+=C),v=g+r}}return O(a),d},toWireType:function(a,c){typeof c!="string"&&p("Cannot pass non-string to C++ string type "+t);var l=f(c),d=qe(4+l+r);return $[d>>2]=l>>o,i(c,d+4,l+r),a!==null&&a.push(O,d),d},argPackAdvance:8,readValueFromPointer:Z,destructorFunction:function(a){O(a)}})}function rn(e,r,t,n,i,s){de[e]={name:h(r),rawConstructor:A(t,n),rawDestructor:A(i,s),fields:[]}}function tn(e,r,t,n,i,s,f,o,a,c){de[e].fields.push({fieldName:h(r),getterReturnType:t,getter:A(n,i),getterContext:s,setterArgumentType:f,setter:A(o,a),setterContext:c})}function nn(e,r){r=h(r),F(e,{isVoid:!0,name:r,argPackAdvance:0,fromWireType:function(){},toWireType:function(t,n){}})}function ie(e){return e||p("Cannot use deleted val. handle = "+e),P[e].value}function on(e,r,t){e=ie(e),r=we(r,"emval::as");var n=[],i=S(n);return b[t>>2]=i,r.toWireType(n,e)}var an={};function Te(e){var r=an[e];return r===void 0?h(e):r}var Be=[];function sn(e,r,t,n){e=Be[e],r=ie(r),t=Te(t),e(r,t,null,n)}function Tr(){return typeof globalThis=="object"?globalThis:function(){return Function}()("return this")()}function un(e){return e===0?S(Tr()):(e=Te(e),S(Tr()[e]))}function fn(e){var r=Be.length;return Be.push(e),r}function cn(e,r){for(var t=new Array(e),n=0;n<e;++n)t[n]=we(b[(r>>2)+n],"parameter "+n);return t}function ln(e,r){for(var t=cn(e,r),n=t[0],i=n.name+"_$"+t.slice(1).map(function(y){return y.name}).join("_")+"$",s=["retType"],f=[n],o="",a=0;a<e-1;++a)o+=(a!==0?", ":"")+"arg"+a,s.push("argType"+a),f.push(t[1+a]);for(var c=ye("methodCaller_"+i),l="return function "+c+`(handle, name, destructors, args) {
`,d=0,a=0;a<e-1;++a)l+="    var arg"+a+" = argType"+a+".readValueFromPointer(args"+(d?"+"+d:"")+`);
`,d+=t[a+1].argPackAdvance;l+="    var rv = handle[name]("+o+`);
`;for(var a=0;a<e-1;++a)t[a+1].deleteObject&&(l+="    argType"+a+".deleteObject(arg"+a+`);
`);n.isVoid||(l+=`    return retType.toWireType(destructors, rv);
`),l+=`};
`,s.push(l);var v=br(Function,s).apply(null,f);return fn(v)}function dn(e){return e=Te(e),S(u[e])}function pn(e,r){return e=ie(e),r=ie(r),S(e[r])}function vn(e){e>4&&(P[e].refcount+=1)}function yn(e){for(var r="",t=0;t<e;++t)r+=(t!==0?", ":"")+"arg"+t;for(var n="return function emval_allocator_"+e+`(constructor, argTypes, args) {
`,t=0;t<e;++t)n+="var argType"+t+" = requireRegisteredType(Module['HEAP32'][(argTypes >>> 2) + "+t+'], "parameter '+t+`");
var arg`+t+" = argType"+t+`.readValueFromPointer(args);
args += argType`+t+`['argPackAdvance'];
`;return n+="var obj = new constructor("+r+`);
return __emval_register(obj);
}
`,new Function("requireRegisteredType","Module","__emval_register",n)(we,u,S)}var Pr={};function hn(e,r,t,n){e=ie(e);var i=Pr[r];return i||(i=yn(r),Pr[r]=i),i(e,t,n)}function gn(e){return S(Te(e))}function _n(e){var r=P[e].value;pe(r),Le(e)}function mn(){L()}function bn(e,r,t){_.copyWithin(e,r,r+t)}function wn(e){try{return fe.grow(e-Oe.byteLength+65535>>>16),tr(fe.buffer),1}catch{}}function Tn(e){var r=_.length;e=e>>>0;var t=2147483648;if(e>t)return!1;for(var n=1;n<=4;n*=2){var i=r*(1+.2/n);i=Math.min(i,e+100663296);var s=Math.min(t,qr(Math.max(e,i),65536)),f=wn(s);if(f)return!0}return!1}var Pe={mappings:{},buffers:[null,[],[]],printChar:function(e,r){var t=Pe.buffers[e];r===0||r===10?((e===1?Sr:V)(Ke(t,0)),t.length=0):t.push(r)},varargs:void 0,get:function(){Pe.varargs+=4;var e=b[Pe.varargs-4>>2];return e},getStr:function(e){var r=Qe(e);return r},get64:function(e,r){return e}};function Pn(e){return 0}function Cn(e,r,t,n,i){}function An(e,r,t,n){for(var i=0,s=0;s<t;s++){for(var f=b[r+s*8>>2],o=b[r+(s*8+4)>>2],a=0;a<o;a++)Pe.printChar(e,_[f+a]);i+=o}return b[n>>2]=i,0}function $n(e){Wr(e|0)}cr=u.InternalError=De(Error,"InternalError"),ut(),q=u.BindingError=De(Error,"BindingError"),gt(),Wt(),Et(),_r=u.UnboundTypeError=De(Error,"UnboundTypeError"),Bt();var Fn={t:st,I:ft,x:It,w:kt,d:Ht,k:Mt,H:qt,n:xt,a:Gt,A:Xt,i:Yt,j:Kt,h:Qt,B:Zt,v:en,u:rn,c:tn,J:nn,m:on,s:sn,b:Le,y:un,p:ln,r:dn,e:pn,g:vn,q:hn,f:gn,l:_n,o:mn,E:bn,F:Tn,G:Pn,C:Cn,z:An,D:$n},jn=it(),En=u.___wasm_call_ctors=function(){return(En=u.___wasm_call_ctors=u.asm.L).apply(null,arguments)},qe=u._malloc=function(){return(qe=u._malloc=u.asm.M).apply(null,arguments)},O=u._free=function(){return(O=u._free=u.asm.N).apply(null,arguments)},Cr=u.___getTypeName=function(){return(Cr=u.___getTypeName=u.asm.P).apply(null,arguments)},Rn=u.___embind_register_native_and_builtin_types=function(){return(Rn=u.___embind_register_native_and_builtin_types=u.asm.Q).apply(null,arguments)},Sn=u.dynCall_jiji=function(){return(Sn=u.dynCall_jiji=u.asm.R).apply(null,arguments)},Ce;function On(e){this.name="ExitStatus",this.message="Program terminated with exit("+e+")",this.status=e}Q=function e(){Ce||Ne(),Ce||(Q=e)};function Ne(e){if(e=e||z,H>0||(Gr(),H>0))return;function r(){Ce||(Ce=!0,u.calledRun=!0,!Ye&&(zr(),Xr(),xe(u),u.onRuntimeInitialized&&u.onRuntimeInitialized(),Yr()))}u.setStatus?(u.setStatus("Running..."),setTimeout(function(){setTimeout(function(){u.setStatus("")},1),r()},1)):r()}if(u.run=Ne,u.preInit)for(typeof u.preInit=="function"&&(u.preInit=[u.preInit]);u.preInit.length>0;)u.preInit.pop()();return Ne(),x.ready}}();typeof exports=="object"&&typeof module=="object"?module.exports=BASIS:typeof define=="function"&&define.amd?define([],function(){return BASIS}):typeof exports=="object"&&(exports.BASIS=BASIS);
