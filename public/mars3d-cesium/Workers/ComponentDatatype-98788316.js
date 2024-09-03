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

define(["exports","./RuntimeError-a977b8e0","./defaultValue-028a8a27","./WebGLConstants-0ff1ce58"],function(w,o,s,c){"use strict";var E=function(r){r==null&&(r=new Date().getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,r.constructor==Array?this.init_by_array(r,r.length):this.init_seed(r)};E.prototype.init_seed=function(r){for(this.mt[0]=r>>>0,this.mti=1;this.mti<this.N;this.mti++){var r=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(((r&4294901760)>>>16)*1812433253<<16)+(r&65535)*1812433253+this.mti,this.mt[this.mti]>>>=0}},E.prototype.init_by_array=function(r,e){var i,h,f;for(this.init_seed(19650218),i=1,h=0,f=this.N>e?this.N:e;f;f--){var N=this.mt[i-1]^this.mt[i-1]>>>30;this.mt[i]=(this.mt[i]^(((N&4294901760)>>>16)*1664525<<16)+(N&65535)*1664525)+r[h]+h,this.mt[i]>>>=0,i++,h++,i>=this.N&&(this.mt[0]=this.mt[this.N-1],i=1),h>=e&&(h=0)}for(f=this.N-1;f;f--){var N=this.mt[i-1]^this.mt[i-1]>>>30;this.mt[i]=(this.mt[i]^(((N&4294901760)>>>16)*1566083941<<16)+(N&65535)*1566083941)-i,this.mt[i]>>>=0,i++,i>=this.N&&(this.mt[0]=this.mt[this.N-1],i=1)}this.mt[0]=2147483648},E.prototype.random_int=function(){var r,e=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var i;for(this.mti==this.N+1&&this.init_seed(5489),i=0;i<this.N-this.M;i++)r=this.mt[i]&this.UPPER_MASK|this.mt[i+1]&this.LOWER_MASK,this.mt[i]=this.mt[i+this.M]^r>>>1^e[r&1];for(;i<this.N-1;i++)r=this.mt[i]&this.UPPER_MASK|this.mt[i+1]&this.LOWER_MASK,this.mt[i]=this.mt[i+(this.M-this.N)]^r>>>1^e[r&1];r=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^r>>>1^e[r&1],this.mti=0}return r=this.mt[this.mti++],r^=r>>>11,r^=r<<7&2636928640,r^=r<<15&4022730752,r^=r>>>18,r>>>0},E.prototype.random_int31=function(){return this.random_int()>>>1},E.prototype.random_incl=function(){return this.random_int()*(1/4294967295)},E.prototype.random=function(){return this.random_int()*(1/4294967296)},E.prototype.random_excl=function(){return(this.random_int()+.5)*(1/4294967296)},E.prototype.random_long=function(){var r=this.random_int()>>>5,e=this.random_int()>>>6;return(r*67108864+e)*(1/9007199254740992)};var d=E;const t={};t.EPSILON1=.1,t.EPSILON2=.01,t.EPSILON3=.001,t.EPSILON4=1e-4,t.EPSILON5=1e-5,t.EPSILON6=1e-6,t.EPSILON7=1e-7,t.EPSILON8=1e-8,t.EPSILON9=1e-9,t.EPSILON10=1e-10,t.EPSILON11=1e-11,t.EPSILON12=1e-12,t.EPSILON13=1e-13,t.EPSILON14=1e-14,t.EPSILON15=1e-15,t.EPSILON16=1e-16,t.EPSILON17=1e-17,t.EPSILON18=1e-18,t.EPSILON19=1e-19,t.EPSILON20=1e-20,t.EPSILON21=1e-21,t.GRAVITATIONALPARAMETER=3986004418e5,t.SOLAR_RADIUS=6955e5,t.LUNAR_RADIUS=1737400,t.SIXTY_FOUR_KILOBYTES=64*1024,t.FOUR_GIGABYTES=4*1024*1024*1024,t.sign=s.defaultValue(Math.sign,function(e){return e=+e,e===0||e!==e?e:e>0?1:-1}),t.signNotZero=function(r){return r<0?-1:1},t.toSNorm=function(r,e){return e=s.defaultValue(e,255),Math.round((t.clamp(r,-1,1)*.5+.5)*e)},t.fromSNorm=function(r,e){return e=s.defaultValue(e,255),t.clamp(r,0,e)/e*2-1},t.normalize=function(r,e,i){return i=Math.max(i-e,0),i===0?0:t.clamp((r-e)/i,0,1)},t.sinh=s.defaultValue(Math.sinh,function(e){return(Math.exp(e)-Math.exp(-e))/2}),t.cosh=s.defaultValue(Math.cosh,function(e){return(Math.exp(e)+Math.exp(-e))/2}),t.lerp=function(r,e,i){return(1-i)*r+i*e},t.PI=Math.PI,t.ONE_OVER_PI=1/Math.PI,t.PI_OVER_TWO=Math.PI/2,t.PI_OVER_THREE=Math.PI/3,t.PI_OVER_FOUR=Math.PI/4,t.PI_OVER_SIX=Math.PI/6,t.THREE_PI_OVER_TWO=3*Math.PI/2,t.TWO_PI=2*Math.PI,t.ONE_OVER_TWO_PI=1/(2*Math.PI),t.RADIANS_PER_DEGREE=Math.PI/180,t.DEGREES_PER_RADIAN=180/Math.PI,t.RADIANS_PER_ARCSECOND=t.RADIANS_PER_DEGREE/3600,t.toRadians=function(r){if(!s.defined(r))throw new o.DeveloperError("degrees is required.");return r*t.RADIANS_PER_DEGREE},t.toDegrees=function(r){if(!s.defined(r))throw new o.DeveloperError("radians is required.");return r*t.DEGREES_PER_RADIAN},t.convertLongitudeRange=function(r){if(!s.defined(r))throw new o.DeveloperError("angle is required.");const e=t.TWO_PI,i=r-Math.floor(r/e)*e;return i<-Math.PI?i+e:i>=Math.PI?i-e:i},t.clampToLatitudeRange=function(r){if(!s.defined(r))throw new o.DeveloperError("angle is required.");return t.clamp(r,-1*t.PI_OVER_TWO,t.PI_OVER_TWO)},t.negativePiToPi=function(r){if(!s.defined(r))throw new o.DeveloperError("angle is required.");return r>=-t.PI&&r<=t.PI?r:t.zeroToTwoPi(r+t.PI)-t.PI},t.zeroToTwoPi=function(r){if(!s.defined(r))throw new o.DeveloperError("angle is required.");if(r>=0&&r<=t.TWO_PI)return r;const e=t.mod(r,t.TWO_PI);return Math.abs(e)<t.EPSILON14&&Math.abs(r)>t.EPSILON14?t.TWO_PI:e},t.mod=function(r,e){if(!s.defined(r))throw new o.DeveloperError("m is required.");if(!s.defined(e))throw new o.DeveloperError("n is required.");if(e===0)throw new o.DeveloperError("divisor cannot be 0.");return t.sign(r)===t.sign(e)&&Math.abs(r)<Math.abs(e)?r:(r%e+e)%e},t.equalsEpsilon=function(r,e,i,h){if(!s.defined(r))throw new o.DeveloperError("left is required.");if(!s.defined(e))throw new o.DeveloperError("right is required.");i=s.defaultValue(i,0),h=s.defaultValue(h,i);const f=Math.abs(r-e);return f<=h||f<=i*Math.max(Math.abs(r),Math.abs(e))},t.lessThan=function(r,e,i){if(!s.defined(r))throw new o.DeveloperError("first is required.");if(!s.defined(e))throw new o.DeveloperError("second is required.");if(!s.defined(i))throw new o.DeveloperError("absoluteEpsilon is required.");return r-e<-i},t.lessThanOrEquals=function(r,e,i){if(!s.defined(r))throw new o.DeveloperError("first is required.");if(!s.defined(e))throw new o.DeveloperError("second is required.");if(!s.defined(i))throw new o.DeveloperError("absoluteEpsilon is required.");return r-e<i},t.greaterThan=function(r,e,i){if(!s.defined(r))throw new o.DeveloperError("first is required.");if(!s.defined(e))throw new o.DeveloperError("second is required.");if(!s.defined(i))throw new o.DeveloperError("absoluteEpsilon is required.");return r-e>i},t.greaterThanOrEquals=function(r,e,i){if(!s.defined(r))throw new o.DeveloperError("first is required.");if(!s.defined(e))throw new o.DeveloperError("second is required.");if(!s.defined(i))throw new o.DeveloperError("absoluteEpsilon is required.");return r-e>-i};const a=[1];t.factorial=function(r){if(typeof r!="number"||r<0)throw new o.DeveloperError("A number greater than or equal to 0 is required.");const e=a.length;if(r>=e){let i=a[e-1];for(let h=e;h<=r;h++){const f=i*h;a.push(f),i=f}}return a[r]},t.incrementWrap=function(r,e,i){if(i=s.defaultValue(i,0),!s.defined(r))throw new o.DeveloperError("n is required.");if(e<=i)throw new o.DeveloperError("maximumValue must be greater than minimumValue.");return++r,r>e&&(r=i),r},t.isPowerOfTwo=function(r){if(typeof r!="number"||r<0||r>4294967295)throw new o.DeveloperError("A number between 0 and (2^32)-1 is required.");return r!==0&&(r&r-1)===0},t.nextPowerOfTwo=function(r){if(typeof r!="number"||r<0||r>2147483648)throw new o.DeveloperError("A number between 0 and 2^31 is required.");return--r,r|=r>>1,r|=r>>2,r|=r>>4,r|=r>>8,r|=r>>16,++r,r},t.previousPowerOfTwo=function(r){if(typeof r!="number"||r<0||r>4294967295)throw new o.DeveloperError("A number between 0 and (2^32)-1 is required.");return r|=r>>1,r|=r>>2,r|=r>>4,r|=r>>8,r|=r>>16,r|=r>>32,r=(r>>>0)-(r>>>1),r},t.clamp=function(r,e,i){return o.Check.typeOf.number("value",r),o.Check.typeOf.number("min",e),o.Check.typeOf.number("max",i),r<e?e:r>i?i:r};let I=new d;t.setRandomNumberSeed=function(r){if(!s.defined(r))throw new o.DeveloperError("seed is required.");I=new d(r)},t.nextRandomNumber=function(){return I.random()},t.randomBetween=function(r,e){return t.nextRandomNumber()*(e-r)+r},t.acosClamped=function(r){if(!s.defined(r))throw new o.DeveloperError("value is required.");return Math.acos(t.clamp(r,-1,1))},t.asinClamped=function(r){if(!s.defined(r))throw new o.DeveloperError("value is required.");return Math.asin(t.clamp(r,-1,1))},t.chordLength=function(r,e){if(!s.defined(r))throw new o.DeveloperError("angle is required.");if(!s.defined(e))throw new o.DeveloperError("radius is required.");return 2*e*Math.sin(r*.5)},t.logBase=function(r,e){if(!s.defined(r))throw new o.DeveloperError("number is required.");if(!s.defined(e))throw new o.DeveloperError("base is required.");return Math.log(r)/Math.log(e)},t.cbrt=s.defaultValue(Math.cbrt,function(e){const i=Math.pow(Math.abs(e),.3333333333333333);return e<0?-i:i}),t.log2=s.defaultValue(Math.log2,function(e){return Math.log(e)*Math.LOG2E}),t.fog=function(r,e){const i=r*e;return 1-Math.exp(-(i*i))},t.fastApproximateAtan=function(r){return o.Check.typeOf.number("x",r),r*(-.1784*Math.abs(r)-.0663*r*r+1.0301)},t.fastApproximateAtan2=function(r,e){o.Check.typeOf.number("x",r),o.Check.typeOf.number("y",e);let i,h=Math.abs(r);i=Math.abs(e);const f=Math.max(h,i);i=Math.min(h,i);const N=i/f;if(isNaN(N))throw new o.DeveloperError("either x or y must be nonzero");return h=t.fastApproximateAtan(N),h=Math.abs(e)>Math.abs(r)?t.PI_OVER_TWO-h:h,h=r<0?t.PI-h:h,h=e<0?-h:h,h};const n={BYTE:c.WebGLConstants.BYTE,UNSIGNED_BYTE:c.WebGLConstants.UNSIGNED_BYTE,SHORT:c.WebGLConstants.SHORT,UNSIGNED_SHORT:c.WebGLConstants.UNSIGNED_SHORT,INT:c.WebGLConstants.INT,UNSIGNED_INT:c.WebGLConstants.UNSIGNED_INT,FLOAT:c.WebGLConstants.FLOAT,DOUBLE:c.WebGLConstants.DOUBLE};n.getSizeInBytes=function(r){if(!s.defined(r))throw new o.DeveloperError("value is required.");switch(r){case n.BYTE:return Int8Array.BYTES_PER_ELEMENT;case n.UNSIGNED_BYTE:return Uint8Array.BYTES_PER_ELEMENT;case n.SHORT:return Int16Array.BYTES_PER_ELEMENT;case n.UNSIGNED_SHORT:return Uint16Array.BYTES_PER_ELEMENT;case n.INT:return Int32Array.BYTES_PER_ELEMENT;case n.UNSIGNED_INT:return Uint32Array.BYTES_PER_ELEMENT;case n.FLOAT:return Float32Array.BYTES_PER_ELEMENT;case n.DOUBLE:return Float64Array.BYTES_PER_ELEMENT;default:throw new o.DeveloperError("componentDatatype is not a valid value.")}},n.fromTypedArray=function(r){if(r instanceof Int8Array)return n.BYTE;if(r instanceof Uint8Array)return n.UNSIGNED_BYTE;if(r instanceof Int16Array)return n.SHORT;if(r instanceof Uint16Array)return n.UNSIGNED_SHORT;if(r instanceof Int32Array)return n.INT;if(r instanceof Uint32Array)return n.UNSIGNED_INT;if(r instanceof Float32Array)return n.FLOAT;if(r instanceof Float64Array)return n.DOUBLE},n.validate=function(r){return s.defined(r)&&(r===n.BYTE||r===n.UNSIGNED_BYTE||r===n.SHORT||r===n.UNSIGNED_SHORT||r===n.INT||r===n.UNSIGNED_INT||r===n.FLOAT||r===n.DOUBLE)},n.createTypedArray=function(r,e){if(!s.defined(r))throw new o.DeveloperError("componentDatatype is required.");if(!s.defined(e))throw new o.DeveloperError("valuesOrLength is required.");switch(r){case n.BYTE:return new Int8Array(e);case n.UNSIGNED_BYTE:return new Uint8Array(e);case n.SHORT:return new Int16Array(e);case n.UNSIGNED_SHORT:return new Uint16Array(e);case n.INT:return new Int32Array(e);case n.UNSIGNED_INT:return new Uint32Array(e);case n.FLOAT:return new Float32Array(e);case n.DOUBLE:return new Float64Array(e);default:throw new o.DeveloperError("componentDatatype is not a valid value.")}},n.createArrayBufferView=function(r,e,i,h){if(!s.defined(r))throw new o.DeveloperError("componentDatatype is required.");if(!s.defined(e))throw new o.DeveloperError("buffer is required.");switch(i=s.defaultValue(i,0),h=s.defaultValue(h,(e.byteLength-i)/n.getSizeInBytes(r)),r){case n.BYTE:return new Int8Array(e,i,h);case n.UNSIGNED_BYTE:return new Uint8Array(e,i,h);case n.SHORT:return new Int16Array(e,i,h);case n.UNSIGNED_SHORT:return new Uint16Array(e,i,h);case n.INT:return new Int32Array(e,i,h);case n.UNSIGNED_INT:return new Uint32Array(e,i,h);case n.FLOAT:return new Float32Array(e,i,h);case n.DOUBLE:return new Float64Array(e,i,h);default:throw new o.DeveloperError("componentDatatype is not a valid value.")}},n.fromName=function(r){switch(r){case"BYTE":return n.BYTE;case"UNSIGNED_BYTE":return n.UNSIGNED_BYTE;case"SHORT":return n.SHORT;case"UNSIGNED_SHORT":return n.UNSIGNED_SHORT;case"INT":return n.INT;case"UNSIGNED_INT":return n.UNSIGNED_INT;case"FLOAT":return n.FLOAT;case"DOUBLE":return n.DOUBLE;default:throw new o.DeveloperError("name is not a valid value.")}};var T=Object.freeze(n);w.CesiumMath=t,w.ComponentDatatype=T});
