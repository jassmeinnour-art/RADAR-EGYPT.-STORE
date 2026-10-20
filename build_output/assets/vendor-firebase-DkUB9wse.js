import{o as qi,R as ka,d as si}from"./vendor-CG7I_5cX.js";/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bm=()=>{};var Qu={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dh=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Cm=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],l=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Oh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,l=s+2<n.length,h=l?n[s+2]:0,p=i>>2,m=(i&3)<<4|c>>4;let T=(c&15)<<2|h>>6,b=h&63;l||(b=64,a||(T=64)),r.push(t[p],t[m],t[T],t[b])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Dh(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Cm(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new Vm;const T=i<<2|c>>4;if(r.push(T),h!==64){const b=c<<4&240|h>>2;if(r.push(b),m!==64){const N=h<<6&192|m;r.push(N)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Vm extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Nm=function(n){const e=Dh(n);return Oh.encodeByteArray(e,!0)},_i=function(n){return Nm(n).replace(/\./g,"")},xh=function(n){try{return Oh.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function km(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dm=()=>km().__FIREBASE_DEFAULTS__,Om=()=>{if(typeof process>"u"||typeof Qu>"u")return;const n=Qu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},xm=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&xh(n[1]);return e&&JSON.parse(e)},$i=()=>{try{return bm()||Dm()||Om()||xm()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Lh=n=>{var e,t;return(t=(e=$i())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},Lm=n=>{const e=Lh(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Mh=()=>{var n;return(n=$i())==null?void 0:n.config},Uh=n=>{var e;return(e=$i())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fh{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mm(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[_i(JSON.stringify(t)),_i(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function be(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Um(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(be())}function Fm(){var e;const n=(e=$i())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Bm(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function qm(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function $m(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function jm(){const n=be();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Hm(){return!Fm()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Bh(){try{return typeof indexedDB=="object"}catch{return!1}}function qh(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}function Wm(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zm="FirebaseError";class Tt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=zm,Object.setPrototypeOf(this,Tt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Fn.prototype.create)}}class Fn{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Gm(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new Tt(s,c,r)}}function Gm(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const a=n.substring(s+2,i),c=e[a];r+=n.substring(t,s)+(c!=null?String(c):`<${a}?>`),t=i+1}return r}catch{return n}}function Km(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function kn(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Yu(i)&&Yu(a)){if(!kn(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Yu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Br(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function qr(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Qm(n,e){const t=new Ym(n,e);return t.subscribe.bind(t)}class Ym{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Jm(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Go),s.error===void 0&&(s.error=Go),s.complete===void 0&&(s.complete=Go);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Jm(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Go(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oe(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Is(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function $h(n){return(await fetch(n,{credentials:"include"})).ok}class st{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const In="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xm{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Fh;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(eg(e))try{this.getOrInitializeService({instanceIdentifier:In})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=In){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=In){return this.instances.has(e)}getOptions(e=In){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Zm(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=In){return this.component?this.component.multipleInstances?e:In:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Zm(n){return n===In?void 0:n}function eg(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Xm(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Q;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Q||(Q={}));const ng={debug:Q.DEBUG,verbose:Q.VERBOSE,info:Q.INFO,warn:Q.WARN,error:Q.ERROR,silent:Q.SILENT},rg=Q.INFO,sg={[Q.DEBUG]:"log",[Q.VERBOSE]:"log",[Q.INFO]:"info",[Q.WARN]:"warn",[Q.ERROR]:"error"},ig=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=sg[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Da{constructor(e){this.name=e,this._logLevel=rg,this._logHandler=ig,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Q))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ng[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Q.DEBUG,...e),this._logHandler(this,Q.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Q.VERBOSE,...e),this._logHandler(this,Q.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Q.INFO,...e),this._logHandler(this,Q.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Q.WARN,...e),this._logHandler(this,Q.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Q.ERROR,...e),this._logHandler(this,Q.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(ag(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function ag(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ca="@firebase/app",Ju="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt=new Da("@firebase/app"),cg="@firebase/app-compat",ug="@firebase/analytics-compat",lg="@firebase/analytics",hg="@firebase/app-check-compat",dg="@firebase/app-check",fg="@firebase/auth",pg="@firebase/auth-compat",mg="@firebase/database",gg="@firebase/data-connect",_g="@firebase/database-compat",yg="@firebase/functions",wg="@firebase/functions-compat",Tg="@firebase/installations",Eg="@firebase/installations-compat",Ig="@firebase/messaging",vg="@firebase/messaging-compat",Ag="@firebase/performance",Rg="@firebase/performance-compat",Pg="@firebase/remote-config",Sg="@firebase/remote-config-compat",bg="@firebase/storage",Cg="@firebase/storage-compat",Vg="@firebase/firestore",Ng="@firebase/ai",kg="@firebase/firestore-compat",Dg="firebase",Og="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ua="[DEFAULT]",xg={[ca]:"fire-core",[cg]:"fire-core-compat",[lg]:"fire-analytics",[ug]:"fire-analytics-compat",[dg]:"fire-app-check",[hg]:"fire-app-check-compat",[fg]:"fire-auth",[pg]:"fire-auth-compat",[mg]:"fire-rtdb",[gg]:"fire-data-connect",[_g]:"fire-rtdb-compat",[yg]:"fire-fn",[wg]:"fire-fn-compat",[Tg]:"fire-iid",[Eg]:"fire-iid-compat",[Ig]:"fire-fcm",[vg]:"fire-fcm-compat",[Ag]:"fire-perf",[Rg]:"fire-perf-compat",[Pg]:"fire-rc",[Sg]:"fire-rc-compat",[bg]:"fire-gcs",[Cg]:"fire-gcs-compat",[Vg]:"fire-fst",[kg]:"fire-fst-compat",[Ng]:"fire-vertex","fire-js":"fire-js",[Dg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ns=new Map,Lg=new Map,la=new Map;function Xu(n,e){try{n.container.addComponent(e)}catch(t){Nt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function _t(n){const e=n.name;if(la.has(e))return Nt.debug(`There were multiple attempts to register component ${e}.`),!1;la.set(e,n);for(const t of ns.values())Xu(t,n);for(const t of Lg.values())Xu(t,n);return!0}function ur(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Le(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},vt=new Fn("app","Firebase",Mg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ug{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new st("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw vt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr=Og;function Fg(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:ua,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw vt.create("bad-app-name",{appName:String(s)});if(t||(t=Mh()),!t)throw vt.create("no-options");const i=ns.get(s);if(i)if(kn(t,i.options)){if(kn(r,i.config))return i;throw vt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw vt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const a=new tg(s);for(const l of la.values())a.addComponent(l);const c=new Ug(t,r,a);return ns.set(s,c),c}function Oa(n=ua){const e=ns.get(n);if(!e&&n===ua&&Mh())return Fg();if(!e)throw vt.create("no-app",{appName:n});return e}function $R(){return Array.from(ns.values())}function Je(n,e,t){let r=xg[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const a=[`Unable to register library "${r}" with version "${e}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&a.push("and"),i&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Nt.warn(a.join(" "));return}_t(new st(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bg="firebase-heartbeat-database",qg=1,rs="firebase-heartbeat-store";let Ko=null;function jh(){return Ko||(Ko=qi(Bg,qg,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(rs)}catch(t){console.warn(t)}}}}).catch(n=>{throw vt.create("idb-open",{originalErrorMessage:n.message})})),Ko}async function $g(n){try{const t=(await jh()).transaction(rs),r=await t.objectStore(rs).get(Hh(n));return await t.done,r}catch(e){if(e instanceof Tt)Nt.warn(e.message);else{const t=vt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Nt.warn(t.message)}}}async function Zu(n,e){try{const r=(await jh()).transaction(rs,"readwrite");await r.objectStore(rs).put(e,Hh(n)),await r.done}catch(t){if(t instanceof Tt)Nt.warn(t.message);else{const r=vt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Nt.warn(r.message)}}}function Hh(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jg=1024,Hg=30;class Wg{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Gg(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=el();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>Hg){const a=Kg(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Nt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=el(),{heartbeatsToSend:r,unsentEntries:s}=zg(this._heartbeatsCache.heartbeats),i=_i(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Nt.warn(t),""}}}function el(){return new Date().toISOString().substring(0,10)}function zg(n,e=jg){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),tl(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),tl(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Gg{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Bh()?qh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await $g(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Zu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Zu(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function tl(n){return _i(JSON.stringify({version:2,heartbeats:n})).length}function Kg(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(n){_t(new st("platform-logger",e=>new og(e),"PRIVATE")),_t(new st("heartbeat",e=>new Wg(e),"PRIVATE")),Je(ca,Ju,n),Je(ca,Ju,"esm2020"),Je("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Qg("");var nl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Jt,Wh;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,g){function y(){}y.prototype=g.prototype,I.F=g.prototype,I.prototype=new y,I.prototype.constructor=I,I.D=function(v,E,R){for(var _=Array(arguments.length-2),Oe=2;Oe<arguments.length;Oe++)_[Oe-2]=arguments[Oe];return g.prototype[E].apply(v,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,g,y){y||(y=0);const v=Array(16);if(typeof g=="string")for(var E=0;E<16;++E)v[E]=g.charCodeAt(y++)|g.charCodeAt(y++)<<8|g.charCodeAt(y++)<<16|g.charCodeAt(y++)<<24;else for(E=0;E<16;++E)v[E]=g[y++]|g[y++]<<8|g[y++]<<16|g[y++]<<24;g=I.g[0],y=I.g[1],E=I.g[2];let R=I.g[3],_;_=g+(R^y&(E^R))+v[0]+3614090360&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(E^g&(y^E))+v[1]+3905402710&4294967295,R=g+(_<<12&4294967295|_>>>20),_=E+(y^R&(g^y))+v[2]+606105819&4294967295,E=R+(_<<17&4294967295|_>>>15),_=y+(g^E&(R^g))+v[3]+3250441966&4294967295,y=E+(_<<22&4294967295|_>>>10),_=g+(R^y&(E^R))+v[4]+4118548399&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(E^g&(y^E))+v[5]+1200080426&4294967295,R=g+(_<<12&4294967295|_>>>20),_=E+(y^R&(g^y))+v[6]+2821735955&4294967295,E=R+(_<<17&4294967295|_>>>15),_=y+(g^E&(R^g))+v[7]+4249261313&4294967295,y=E+(_<<22&4294967295|_>>>10),_=g+(R^y&(E^R))+v[8]+1770035416&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(E^g&(y^E))+v[9]+2336552879&4294967295,R=g+(_<<12&4294967295|_>>>20),_=E+(y^R&(g^y))+v[10]+4294925233&4294967295,E=R+(_<<17&4294967295|_>>>15),_=y+(g^E&(R^g))+v[11]+2304563134&4294967295,y=E+(_<<22&4294967295|_>>>10),_=g+(R^y&(E^R))+v[12]+1804603682&4294967295,g=y+(_<<7&4294967295|_>>>25),_=R+(E^g&(y^E))+v[13]+4254626195&4294967295,R=g+(_<<12&4294967295|_>>>20),_=E+(y^R&(g^y))+v[14]+2792965006&4294967295,E=R+(_<<17&4294967295|_>>>15),_=y+(g^E&(R^g))+v[15]+1236535329&4294967295,y=E+(_<<22&4294967295|_>>>10),_=g+(E^R&(y^E))+v[1]+4129170786&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^E&(g^y))+v[6]+3225465664&4294967295,R=g+(_<<9&4294967295|_>>>23),_=E+(g^y&(R^g))+v[11]+643717713&4294967295,E=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(E^R))+v[0]+3921069994&4294967295,y=E+(_<<20&4294967295|_>>>12),_=g+(E^R&(y^E))+v[5]+3593408605&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^E&(g^y))+v[10]+38016083&4294967295,R=g+(_<<9&4294967295|_>>>23),_=E+(g^y&(R^g))+v[15]+3634488961&4294967295,E=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(E^R))+v[4]+3889429448&4294967295,y=E+(_<<20&4294967295|_>>>12),_=g+(E^R&(y^E))+v[9]+568446438&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^E&(g^y))+v[14]+3275163606&4294967295,R=g+(_<<9&4294967295|_>>>23),_=E+(g^y&(R^g))+v[3]+4107603335&4294967295,E=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(E^R))+v[8]+1163531501&4294967295,y=E+(_<<20&4294967295|_>>>12),_=g+(E^R&(y^E))+v[13]+2850285829&4294967295,g=y+(_<<5&4294967295|_>>>27),_=R+(y^E&(g^y))+v[2]+4243563512&4294967295,R=g+(_<<9&4294967295|_>>>23),_=E+(g^y&(R^g))+v[7]+1735328473&4294967295,E=R+(_<<14&4294967295|_>>>18),_=y+(R^g&(E^R))+v[12]+2368359562&4294967295,y=E+(_<<20&4294967295|_>>>12),_=g+(y^E^R)+v[5]+4294588738&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^E)+v[8]+2272392833&4294967295,R=g+(_<<11&4294967295|_>>>21),_=E+(R^g^y)+v[11]+1839030562&4294967295,E=R+(_<<16&4294967295|_>>>16),_=y+(E^R^g)+v[14]+4259657740&4294967295,y=E+(_<<23&4294967295|_>>>9),_=g+(y^E^R)+v[1]+2763975236&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^E)+v[4]+1272893353&4294967295,R=g+(_<<11&4294967295|_>>>21),_=E+(R^g^y)+v[7]+4139469664&4294967295,E=R+(_<<16&4294967295|_>>>16),_=y+(E^R^g)+v[10]+3200236656&4294967295,y=E+(_<<23&4294967295|_>>>9),_=g+(y^E^R)+v[13]+681279174&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^E)+v[0]+3936430074&4294967295,R=g+(_<<11&4294967295|_>>>21),_=E+(R^g^y)+v[3]+3572445317&4294967295,E=R+(_<<16&4294967295|_>>>16),_=y+(E^R^g)+v[6]+76029189&4294967295,y=E+(_<<23&4294967295|_>>>9),_=g+(y^E^R)+v[9]+3654602809&4294967295,g=y+(_<<4&4294967295|_>>>28),_=R+(g^y^E)+v[12]+3873151461&4294967295,R=g+(_<<11&4294967295|_>>>21),_=E+(R^g^y)+v[15]+530742520&4294967295,E=R+(_<<16&4294967295|_>>>16),_=y+(E^R^g)+v[2]+3299628645&4294967295,y=E+(_<<23&4294967295|_>>>9),_=g+(E^(y|~R))+v[0]+4096336452&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~E))+v[7]+1126891415&4294967295,R=g+(_<<10&4294967295|_>>>22),_=E+(g^(R|~y))+v[14]+2878612391&4294967295,E=R+(_<<15&4294967295|_>>>17),_=y+(R^(E|~g))+v[5]+4237533241&4294967295,y=E+(_<<21&4294967295|_>>>11),_=g+(E^(y|~R))+v[12]+1700485571&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~E))+v[3]+2399980690&4294967295,R=g+(_<<10&4294967295|_>>>22),_=E+(g^(R|~y))+v[10]+4293915773&4294967295,E=R+(_<<15&4294967295|_>>>17),_=y+(R^(E|~g))+v[1]+2240044497&4294967295,y=E+(_<<21&4294967295|_>>>11),_=g+(E^(y|~R))+v[8]+1873313359&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~E))+v[15]+4264355552&4294967295,R=g+(_<<10&4294967295|_>>>22),_=E+(g^(R|~y))+v[6]+2734768916&4294967295,E=R+(_<<15&4294967295|_>>>17),_=y+(R^(E|~g))+v[13]+1309151649&4294967295,y=E+(_<<21&4294967295|_>>>11),_=g+(E^(y|~R))+v[4]+4149444226&4294967295,g=y+(_<<6&4294967295|_>>>26),_=R+(y^(g|~E))+v[11]+3174756917&4294967295,R=g+(_<<10&4294967295|_>>>22),_=E+(g^(R|~y))+v[2]+718787259&4294967295,E=R+(_<<15&4294967295|_>>>17),_=y+(R^(E|~g))+v[9]+3951481745&4294967295,I.g[0]=I.g[0]+g&4294967295,I.g[1]=I.g[1]+(E+(_<<21&4294967295|_>>>11))&4294967295,I.g[2]=I.g[2]+E&4294967295,I.g[3]=I.g[3]+R&4294967295}r.prototype.v=function(I,g){g===void 0&&(g=I.length);const y=g-this.blockSize,v=this.C;let E=this.h,R=0;for(;R<g;){if(E==0)for(;R<=y;)s(this,I,R),R+=this.blockSize;if(typeof I=="string"){for(;R<g;)if(v[E++]=I.charCodeAt(R++),E==this.blockSize){s(this,v),E=0;break}}else for(;R<g;)if(v[E++]=I[R++],E==this.blockSize){s(this,v),E=0;break}}this.h=E,this.o+=g},r.prototype.A=function(){var I=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);I[0]=128;for(var g=1;g<I.length-8;++g)I[g]=0;g=this.o*8;for(var y=I.length-8;y<I.length;++y)I[y]=g&255,g/=256;for(this.v(I),I=Array(16),g=0,y=0;y<4;++y)for(let v=0;v<32;v+=8)I[g++]=this.g[y]>>>v&255;return I};function i(I,g){var y=c;return Object.prototype.hasOwnProperty.call(y,I)?y[I]:y[I]=g(I)}function a(I,g){this.h=g;const y=[];let v=!0;for(let E=I.length-1;E>=0;E--){const R=I[E]|0;v&&R==g||(y[E]=R,v=!1)}this.g=y}var c={};function l(I){return-128<=I&&I<128?i(I,function(g){return new a([g|0],g<0?-1:0)}):new a([I|0],I<0?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return m;if(I<0)return L(h(-I));const g=[];let y=1;for(let v=0;I>=y;v++)g[v]=I/y|0,y*=4294967296;return new a(g,0)}function p(I,g){if(I.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(I.charAt(0)=="-")return L(p(I.substring(1),g));if(I.indexOf("-")>=0)throw Error('number format error: interior "-" character');const y=h(Math.pow(g,8));let v=m;for(let R=0;R<I.length;R+=8){var E=Math.min(8,I.length-R);const _=parseInt(I.substring(R,R+E),g);E<8?(E=h(Math.pow(g,E)),v=v.j(E).add(h(_))):(v=v.j(y),v=v.add(h(_)))}return v}var m=l(0),T=l(1),b=l(16777216);n=a.prototype,n.m=function(){if(M(this))return-L(this).m();let I=0,g=1;for(let y=0;y<this.g.length;y++){const v=this.i(y);I+=(v>=0?v:4294967296+v)*g,g*=4294967296}return I},n.toString=function(I){if(I=I||10,I<2||36<I)throw Error("radix out of range: "+I);if(N(this))return"0";if(M(this))return"-"+L(this).toString(I);const g=h(Math.pow(I,6));var y=this;let v="";for(;;){const E=Qe(y,g).g;y=z(y,E.j(g));let R=((y.g.length>0?y.g[0]:y.h)>>>0).toString(I);if(y=E,N(y))return R+v;for(;R.length<6;)R="0"+R;v=R+v}},n.i=function(I){return I<0?0:I<this.g.length?this.g[I]:this.h};function N(I){if(I.h!=0)return!1;for(let g=0;g<I.g.length;g++)if(I.g[g]!=0)return!1;return!0}function M(I){return I.h==-1}n.l=function(I){return I=z(this,I),M(I)?-1:N(I)?0:1};function L(I){const g=I.g.length,y=[];for(let v=0;v<g;v++)y[v]=~I.g[v];return new a(y,~I.h).add(T)}n.abs=function(){return M(this)?L(this):this},n.add=function(I){const g=Math.max(this.g.length,I.g.length),y=[];let v=0;for(let E=0;E<=g;E++){let R=v+(this.i(E)&65535)+(I.i(E)&65535),_=(R>>>16)+(this.i(E)>>>16)+(I.i(E)>>>16);v=_>>>16,R&=65535,_&=65535,y[E]=_<<16|R}return new a(y,y[y.length-1]&-2147483648?-1:0)};function z(I,g){return I.add(L(g))}n.j=function(I){if(N(this)||N(I))return m;if(M(this))return M(I)?L(this).j(L(I)):L(L(this).j(I));if(M(I))return L(this.j(L(I)));if(this.l(b)<0&&I.l(b)<0)return h(this.m()*I.m());const g=this.g.length+I.g.length,y=[];for(var v=0;v<2*g;v++)y[v]=0;for(v=0;v<this.g.length;v++)for(let E=0;E<I.g.length;E++){const R=this.i(v)>>>16,_=this.i(v)&65535,Oe=I.i(E)>>>16,gn=I.i(E)&65535;y[2*v+2*E]+=_*gn,J(y,2*v+2*E),y[2*v+2*E+1]+=R*gn,J(y,2*v+2*E+1),y[2*v+2*E+1]+=_*Oe,J(y,2*v+2*E+1),y[2*v+2*E+2]+=R*Oe,J(y,2*v+2*E+2)}for(I=0;I<g;I++)y[I]=y[2*I+1]<<16|y[2*I];for(I=g;I<2*g;I++)y[I]=0;return new a(y,0)};function J(I,g){for(;(I[g]&65535)!=I[g];)I[g+1]+=I[g]>>>16,I[g]&=65535,g++}function ae(I,g){this.g=I,this.h=g}function Qe(I,g){if(N(g))throw Error("division by zero");if(N(I))return new ae(m,m);if(M(I))return g=Qe(L(I),g),new ae(L(g.g),L(g.h));if(M(g))return g=Qe(I,L(g)),new ae(L(g.g),g.h);if(I.g.length>30){if(M(I)||M(g))throw Error("slowDivide_ only works with positive integers.");for(var y=T,v=g;v.l(I)<=0;)y=Ie(y),v=Ie(v);var E=ve(y,1),R=ve(v,1);for(v=ve(v,2),y=ve(y,2);!N(v);){var _=R.add(v);_.l(I)<=0&&(E=E.add(y),R=_),v=ve(v,1),y=ve(y,1)}return g=z(I,E.j(g)),new ae(E,g)}for(E=m;I.l(g)>=0;){for(y=Math.max(1,Math.floor(I.m()/g.m())),v=Math.ceil(Math.log(y)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),R=h(y),_=R.j(g);M(_)||_.l(I)>0;)y-=v,R=h(y),_=R.j(g);N(R)&&(R=T),E=E.add(R),I=z(I,_)}return new ae(E,I)}n.B=function(I){return Qe(this,I).h},n.and=function(I){const g=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)&I.i(v);return new a(y,this.h&I.h)},n.or=function(I){const g=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)|I.i(v);return new a(y,this.h|I.h)},n.xor=function(I){const g=Math.max(this.g.length,I.g.length),y=[];for(let v=0;v<g;v++)y[v]=this.i(v)^I.i(v);return new a(y,this.h^I.h)};function Ie(I){const g=I.g.length+1,y=[];for(let v=0;v<g;v++)y[v]=I.i(v)<<1|I.i(v-1)>>>31;return new a(y,I.h)}function ve(I,g){const y=g>>5;g%=32;const v=I.g.length-y,E=[];for(let R=0;R<v;R++)E[R]=g>0?I.i(R+y)>>>g|I.i(R+y+1)<<32-g:I.i(R+y);return new a(E,I.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Wh=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.B,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=p,Jt=a}).apply(typeof nl<"u"?nl:typeof self<"u"?self:typeof window<"u"?window:{});var Js=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var zh,$r,Gh,ii,ha,Kh,Qh,Yh;(function(){var n,e=Object.defineProperty;function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Js=="object"&&Js];for(var u=0;u<o.length;++u){var d=o[u];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var d=r;o=o.split(".");for(var f=0;f<o.length-1;f++){var A=o[f];if(!(A in d))break e;d=d[A]}o=o[o.length-1],f=d[o],u=u(f),u!=f&&u!=null&&e(d,o,{configurable:!0,writable:!0,value:u})}}s("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(o){return o||function(u){var d=[],f;for(f in u)Object.prototype.hasOwnProperty.call(u,f)&&d.push([f,u[f]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},a=this||self;function c(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function l(o,u,d){return o.call.apply(o.bind,arguments)}function h(o,u,d){return h=l,h.apply(null,arguments)}function p(o,u){var d=Array.prototype.slice.call(arguments,1);return function(){var f=d.slice();return f.push.apply(f,arguments),o.apply(this,f)}}function m(o,u){function d(){}d.prototype=u.prototype,o.Z=u.prototype,o.prototype=new d,o.prototype.constructor=o,o.Ob=function(f,A,P){for(var O=Array(arguments.length-2),W=2;W<arguments.length;W++)O[W-2]=arguments[W];return u.prototype[A].apply(f,O)}}var T=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function b(o){const u=o.length;if(u>0){const d=Array(u);for(let f=0;f<u;f++)d[f]=o[f];return d}return[]}function N(o,u){for(let f=1;f<arguments.length;f++){const A=arguments[f];var d=typeof A;if(d=d!="object"?d:A?Array.isArray(A)?"array":d:"null",d=="array"||d=="object"&&typeof A.length=="number"){d=o.length||0;const P=A.length||0;o.length=d+P;for(let O=0;O<P;O++)o[d+O]=A[O]}else o.push(A)}}class M{constructor(u,d){this.i=u,this.j=d,this.h=0,this.g=null}get(){let u;return this.h>0?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function L(o){a.setTimeout(()=>{throw o},0)}function z(){var o=I;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class J{constructor(){this.h=this.g=null}add(u,d){const f=ae.get();f.set(u,d),this.h?this.h.next=f:this.g=f,this.h=f}}var ae=new M(()=>new Qe,o=>o.reset());class Qe{constructor(){this.next=this.g=this.h=null}set(u,d){this.h=u,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let Ie,ve=!1,I=new J,g=()=>{const o=Promise.resolve(void 0);Ie=()=>{o.then(y)}};function y(){for(var o;o=z();){try{o.h.call(o.g)}catch(d){L(d)}var u=ae;u.j(o),u.h<100&&(u.h++,o.next=u.g,u.g=o)}ve=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function E(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}E.prototype.h=function(){this.defaultPrevented=!0};var R=(function(){if(!a.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};a.addEventListener("test",d,u),a.removeEventListener("test",d,u)}catch{}return o})();function _(o){return/^[\s\xa0]*$/.test(o)}function Oe(o,u){E.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,u)}m(Oe,E),Oe.prototype.init=function(o,u){const d=this.type=o.type,f=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget,u||(d=="mouseover"?u=o.fromElement:d=="mouseout"&&(u=o.toElement)),this.relatedTarget=u,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&Oe.Z.h.call(this)},Oe.prototype.h=function(){Oe.Z.h.call(this);const o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var gn="closure_listenable_"+(Math.random()*1e6|0),Yp=0;function Jp(o,u,d,f,A){this.listener=o,this.proxy=null,this.src=u,this.type=d,this.capture=!!f,this.ha=A,this.key=++Yp,this.da=this.fa=!1}function Ls(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Ms(o,u,d){for(const f in o)u.call(d,o[f],f,o)}function Xp(o,u){for(const d in o)u.call(void 0,o[d],d,o)}function Kc(o){const u={};for(const d in o)u[d]=o[d];return u}const Qc="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Yc(o,u){let d,f;for(let A=1;A<arguments.length;A++){f=arguments[A];for(d in f)o[d]=f[d];for(let P=0;P<Qc.length;P++)d=Qc[P],Object.prototype.hasOwnProperty.call(f,d)&&(o[d]=f[d])}}function Us(o){this.src=o,this.g={},this.h=0}Us.prototype.add=function(o,u,d,f,A){const P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);const O=Ao(o,u,f,A);return O>-1?(u=o[O],d||(u.fa=!1)):(u=new Jp(u,this.src,P,!!f,A),u.fa=d,o.push(u)),u};function vo(o,u){const d=u.type;if(d in o.g){var f=o.g[d],A=Array.prototype.indexOf.call(f,u,void 0),P;(P=A>=0)&&Array.prototype.splice.call(f,A,1),P&&(Ls(u),o.g[d].length==0&&(delete o.g[d],o.h--))}}function Ao(o,u,d,f){for(let A=0;A<o.length;++A){const P=o[A];if(!P.da&&P.listener==u&&P.capture==!!d&&P.ha==f)return A}return-1}var Ro="closure_lm_"+(Math.random()*1e6|0),Po={};function Jc(o,u,d,f,A){if(Array.isArray(u)){for(let P=0;P<u.length;P++)Jc(o,u[P],d,f,A);return null}return d=eu(d),o&&o[gn]?o.J(u,d,c(f)?!!f.capture:!1,A):Zp(o,u,d,!1,f,A)}function Zp(o,u,d,f,A,P){if(!u)throw Error("Invalid event type");const O=c(A)?!!A.capture:!!A;let W=bo(o);if(W||(o[Ro]=W=new Us(o)),d=W.add(u,d,f,O,P),d.proxy)return d;if(f=em(),d.proxy=f,f.src=o,f.listener=d,o.addEventListener)R||(A=O),A===void 0&&(A=!1),o.addEventListener(u.toString(),f,A);else if(o.attachEvent)o.attachEvent(Zc(u.toString()),f);else if(o.addListener&&o.removeListener)o.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return d}function em(){function o(d){return u.call(o.src,o.listener,d)}const u=tm;return o}function Xc(o,u,d,f,A){if(Array.isArray(u))for(var P=0;P<u.length;P++)Xc(o,u[P],d,f,A);else f=c(f)?!!f.capture:!!f,d=eu(d),o&&o[gn]?(o=o.i,P=String(u).toString(),P in o.g&&(u=o.g[P],d=Ao(u,d,f,A),d>-1&&(Ls(u[d]),Array.prototype.splice.call(u,d,1),u.length==0&&(delete o.g[P],o.h--)))):o&&(o=bo(o))&&(u=o.g[u.toString()],o=-1,u&&(o=Ao(u,d,f,A)),(d=o>-1?u[o]:null)&&So(d))}function So(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[gn])vo(u.i,o);else{var d=o.type,f=o.proxy;u.removeEventListener?u.removeEventListener(d,f,o.capture):u.detachEvent?u.detachEvent(Zc(d),f):u.addListener&&u.removeListener&&u.removeListener(f),(d=bo(u))?(vo(d,o),d.h==0&&(d.src=null,u[Ro]=null)):Ls(o)}}}function Zc(o){return o in Po?Po[o]:Po[o]="on"+o}function tm(o,u){if(o.da)o=!0;else{u=new Oe(u,this);const d=o.listener,f=o.ha||o.src;o.fa&&So(o),o=d.call(f,u)}return o}function bo(o){return o=o[Ro],o instanceof Us?o:null}var Co="__closure_events_fn_"+(Math.random()*1e9>>>0);function eu(o){return typeof o=="function"?o:(o[Co]||(o[Co]=function(u){return o.handleEvent(u)}),o[Co])}function Ae(){v.call(this),this.i=new Us(this),this.M=this,this.G=null}m(Ae,v),Ae.prototype[gn]=!0,Ae.prototype.removeEventListener=function(o,u,d,f){Xc(this,o,u,d,f)};function Ve(o,u){var d,f=o.G;if(f)for(d=[];f;f=f.G)d.push(f);if(o=o.M,f=u.type||u,typeof u=="string")u=new E(u,o);else if(u instanceof E)u.target=u.target||o;else{var A=u;u=new E(f,o),Yc(u,A)}A=!0;let P,O;if(d)for(O=d.length-1;O>=0;O--)P=u.g=d[O],A=Fs(P,f,!0,u)&&A;if(P=u.g=o,A=Fs(P,f,!0,u)&&A,A=Fs(P,f,!1,u)&&A,d)for(O=0;O<d.length;O++)P=u.g=d[O],A=Fs(P,f,!1,u)&&A}Ae.prototype.N=function(){if(Ae.Z.N.call(this),this.i){var o=this.i;for(const u in o.g){const d=o.g[u];for(let f=0;f<d.length;f++)Ls(d[f]);delete o.g[u],o.h--}}this.G=null},Ae.prototype.J=function(o,u,d,f){return this.i.add(String(o),u,!1,d,f)},Ae.prototype.K=function(o,u,d,f){return this.i.add(String(o),u,!0,d,f)};function Fs(o,u,d,f){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();let A=!0;for(let P=0;P<u.length;++P){const O=u[P];if(O&&!O.da&&O.capture==d){const W=O.listener,me=O.ha||O.src;O.fa&&vo(o.i,O),A=W.call(me,f)!==!1&&A}}return A&&!f.defaultPrevented}function nm(o,u){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=h(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(u)>2147483647?-1:a.setTimeout(o,u||0)}function tu(o){o.g=nm(()=>{o.g=null,o.i&&(o.i=!1,tu(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class rm extends v{constructor(u,d){super(),this.m=u,this.l=d,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:tu(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ir(o){v.call(this),this.h=o,this.g={}}m(Ir,v);var nu=[];function ru(o){Ms(o.g,function(u,d){this.g.hasOwnProperty(d)&&So(u)},o),o.g={}}Ir.prototype.N=function(){Ir.Z.N.call(this),ru(this)},Ir.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Vo=a.JSON.stringify,sm=a.JSON.parse,im=class{stringify(o){return a.JSON.stringify(o,void 0)}parse(o){return a.JSON.parse(o,void 0)}};function su(){}function iu(){}var vr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function No(){E.call(this,"d")}m(No,E);function ko(){E.call(this,"c")}m(ko,E);var _n={},ou=null;function Bs(){return ou=ou||new Ae}_n.Ia="serverreachability";function au(o){E.call(this,_n.Ia,o)}m(au,E);function Ar(o){const u=Bs();Ve(u,new au(u))}_n.STAT_EVENT="statevent";function cu(o,u){E.call(this,_n.STAT_EVENT,o),this.stat=u}m(cu,E);function Ne(o){const u=Bs();Ve(u,new cu(u,o))}_n.Ja="timingevent";function uu(o,u){E.call(this,_n.Ja,o),this.size=u}m(uu,E);function Rr(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){o()},u)}function Pr(){this.g=!0}Pr.prototype.ua=function(){this.g=!1};function om(o,u,d,f,A,P){o.info(function(){if(o.g)if(P){var O="",W=P.split("&");for(let te=0;te<W.length;te++){var me=W[te].split("=");if(me.length>1){const _e=me[0];me=me[1];const ct=_e.split("_");O=ct.length>=2&&ct[1]=="type"?O+(_e+"="+me+"&"):O+(_e+"=redacted&")}}}else O=null;else O=P;return"XMLHTTP REQ ("+f+") [attempt "+A+"]: "+u+`
`+d+`
`+O})}function am(o,u,d,f,A,P,O){o.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+A+"]: "+u+`
`+d+`
`+P+" "+O})}function jn(o,u,d,f){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+um(o,d)+(f?" "+f:"")})}function cm(o,u){o.info(function(){return"TIMEOUT: "+u})}Pr.prototype.info=function(){};function um(o,u){if(!o.g)return u;if(!u)return null;try{const P=JSON.parse(u);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var d=P[o];if(!(d.length<2)){var f=d[1];if(Array.isArray(f)&&!(f.length<1)){var A=f[0];if(A!="noop"&&A!="stop"&&A!="close")for(let O=1;O<f.length;O++)f[O]=""}}}}return Vo(P)}catch{return u}}var qs={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},lu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},hu;function Do(){}m(Do,su),Do.prototype.g=function(){return new XMLHttpRequest},hu=new Do;function Sr(o){return encodeURIComponent(String(o))}function lm(o){var u=1;o=o.split(":");const d=[];for(;u>0&&o.length;)d.push(o.shift()),u--;return o.length&&d.push(o.join(":")),d}function Ut(o,u,d,f){this.j=o,this.i=u,this.l=d,this.S=f||1,this.V=new Ir(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new du}function du(){this.i=null,this.g="",this.h=!1}var fu={},Oo={};function xo(o,u,d){o.M=1,o.A=js(at(u)),o.u=d,o.R=!0,pu(o,null)}function pu(o,u){o.F=Date.now(),$s(o),o.B=at(o.A);var d=o.B,f=o.S;Array.isArray(f)||(f=[String(f)]),Su(d.i,"t",f),o.C=0,d=o.j.L,o.h=new du,o.g=Wu(o.j,d?u:null,!o.u),o.P>0&&(o.O=new rm(h(o.Y,o,o.g),o.P)),u=o.V,d=o.g,f=o.ba;var A="readystatechange";Array.isArray(A)||(A&&(nu[0]=A.toString()),A=nu);for(let P=0;P<A.length;P++){const O=Jc(d,A[P],f||u.handleEvent,!1,u.h||u);if(!O)break;u.g[O.key]=O}u=o.J?Kc(o.J):{},o.u?(o.v||(o.v="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,u)):(o.v="GET",o.g.ea(o.B,o.v,null,u)),Ar(),om(o.i,o.v,o.B,o.l,o.S,o.u)}Ut.prototype.ba=function(o){o=o.target;const u=this.O;u&&qt(o)==3?u.j():this.Y(o)},Ut.prototype.Y=function(o){try{if(o==this.g)e:{const W=qt(this.g),me=this.g.ya(),te=this.g.ca();if(!(W<3)&&(W!=3||this.g&&(this.h.h||this.g.la()||Ou(this.g)))){this.K||W!=4||me==7||(me==8||te<=0?Ar(3):Ar(2)),Lo(this);var u=this.g.ca();this.X=u;var d=hm(this);if(this.o=u==200,am(this.i,this.v,this.B,this.l,this.S,W,u),this.o){if(this.U&&!this.L){t:{if(this.g){var f,A=this.g;if((f=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(f)){var P=f;break t}}P=null}if(o=P)jn(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Mo(this,o);else{this.o=!1,this.m=3,Ne(12),yn(this),br(this);break e}}if(this.R){o=!0;let _e;for(;!this.K&&this.C<d.length;)if(_e=dm(this,d),_e==Oo){W==4&&(this.m=4,Ne(14),o=!1),jn(this.i,this.l,null,"[Incomplete Response]");break}else if(_e==fu){this.m=4,Ne(15),jn(this.i,this.l,d,"[Invalid Chunk]"),o=!1;break}else jn(this.i,this.l,_e,null),Mo(this,_e);if(mu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),W!=4||d.length!=0||this.h.h||(this.m=1,Ne(16),o=!1),this.o=this.o&&o,!o)jn(this.i,this.l,d,"[Invalid Chunked Response]"),yn(this),br(this);else if(d.length>0&&!this.W){this.W=!0;var O=this.j;O.g==this&&O.aa&&!O.P&&(O.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),Wo(O),O.P=!0,Ne(11))}}else jn(this.i,this.l,d,null),Mo(this,d);W==4&&yn(this),this.o&&!this.K&&(W==4?qu(this.j,this):(this.o=!1,$s(this)))}else Pm(this.g),u==400&&d.indexOf("Unknown SID")>0?(this.m=3,Ne(12)):(this.m=0,Ne(13)),yn(this),br(this)}}}catch{}finally{}};function hm(o){if(!mu(o))return o.g.la();const u=Ou(o.g);if(u==="")return"";let d="";const f=u.length,A=qt(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return yn(o),br(o),"";o.h.i=new a.TextDecoder}for(let P=0;P<f;P++)o.h.h=!0,d+=o.h.i.decode(u[P],{stream:!(A&&P==f-1)});return u.length=0,o.h.g+=d,o.C=0,o.h.g}function mu(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function dm(o,u){var d=o.C,f=u.indexOf(`
`,d);return f==-1?Oo:(d=Number(u.substring(d,f)),isNaN(d)?fu:(f+=1,f+d>u.length?Oo:(u=u.slice(f,f+d),o.C=f+d,u)))}Ut.prototype.cancel=function(){this.K=!0,yn(this)};function $s(o){o.T=Date.now()+o.H,gu(o,o.H)}function gu(o,u){if(o.D!=null)throw Error("WatchDog timer not null");o.D=Rr(h(o.aa,o),u)}function Lo(o){o.D&&(a.clearTimeout(o.D),o.D=null)}Ut.prototype.aa=function(){this.D=null;const o=Date.now();o-this.T>=0?(cm(this.i,this.B),this.M!=2&&(Ar(),Ne(17)),yn(this),this.m=2,br(this)):gu(this,this.T-o)};function br(o){o.j.I==0||o.K||qu(o.j,o)}function yn(o){Lo(o);var u=o.O;u&&typeof u.dispose=="function"&&u.dispose(),o.O=null,ru(o.V),o.g&&(u=o.g,o.g=null,u.abort(),u.dispose())}function Mo(o,u){try{var d=o.j;if(d.I!=0&&(d.g==o||Uo(d.h,o))){if(!o.L&&Uo(d.h,o)&&d.I==3){try{var f=d.Ba.g.parse(u)}catch{f=null}if(Array.isArray(f)&&f.length==3){var A=f;if(A[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<o.F)Ks(d),zs(d);else break e;Ho(d),Ne(18)}}else d.xa=A[1],0<d.xa-d.K&&A[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=Rr(h(d.Va,d),6e3));wu(d.h)<=1&&d.ta&&(d.ta=void 0)}else Tn(d,11)}else if((o.L||d.g==o)&&Ks(d),!_(u))for(A=d.Ba.g.parse(u),u=0;u<A.length;u++){let te=A[u];const _e=te[0];if(!(_e<=d.K))if(d.K=_e,te=te[1],d.I==2)if(te[0]=="c"){d.M=te[1],d.ba=te[2];const ct=te[3];ct!=null&&(d.ka=ct,d.j.info("VER="+d.ka));const En=te[4];En!=null&&(d.za=En,d.j.info("SVER="+d.za));const $t=te[5];$t!=null&&typeof $t=="number"&&$t>0&&(f=1.5*$t,d.O=f,d.j.info("backChannelRequestTimeoutMs_="+f)),f=d;const jt=o.g;if(jt){const Ys=jt.g?jt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ys){var P=f.h;P.g||Ys.indexOf("spdy")==-1&&Ys.indexOf("quic")==-1&&Ys.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Fo(P,P.h),P.h=null))}if(f.G){const zo=jt.g?jt.g.getResponseHeader("X-HTTP-Session-Id"):null;zo&&(f.wa=zo,ne(f.J,f.G,zo))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-o.F,d.j.info("Handshake RTT: "+d.T+"ms")),f=d;var O=o;if(f.na=Hu(f,f.L?f.ba:null,f.W),O.L){Tu(f.h,O);var W=O,me=f.O;me&&(W.H=me),W.D&&(Lo(W),$s(W)),f.g=O}else Fu(f);d.i.length>0&&Gs(d)}else te[0]!="stop"&&te[0]!="close"||Tn(d,7);else d.I==3&&(te[0]=="stop"||te[0]=="close"?te[0]=="stop"?Tn(d,7):jo(d):te[0]!="noop"&&d.l&&d.l.qa(te),d.A=0)}}Ar(4)}catch{}}var fm=class{constructor(o,u){this.g=o,this.map=u}};function _u(o){this.l=o||10,a.PerformanceNavigationTiming?(o=a.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function yu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function wu(o){return o.h?1:o.g?o.g.size:0}function Uo(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function Fo(o,u){o.g?o.g.add(u):o.h=u}function Tu(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}_u.prototype.cancel=function(){if(this.i=Eu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Eu(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const d of o.g.values())u=u.concat(d.G);return u}return b(o.i)}var Iu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function pm(o,u){if(o){o=o.split("&");for(let d=0;d<o.length;d++){const f=o[d].indexOf("=");let A,P=null;f>=0?(A=o[d].substring(0,f),P=o[d].substring(f+1)):A=o[d],u(A,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Ft(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let u;o instanceof Ft?(this.l=o.l,Cr(this,o.j),this.o=o.o,this.g=o.g,Vr(this,o.u),this.h=o.h,Bo(this,bu(o.i)),this.m=o.m):o&&(u=String(o).match(Iu))?(this.l=!1,Cr(this,u[1]||"",!0),this.o=Nr(u[2]||""),this.g=Nr(u[3]||"",!0),Vr(this,u[4]),this.h=Nr(u[5]||"",!0),Bo(this,u[6]||"",!0),this.m=Nr(u[7]||"")):(this.l=!1,this.i=new Dr(null,this.l))}Ft.prototype.toString=function(){const o=[];var u=this.j;u&&o.push(kr(u,vu,!0),":");var d=this.g;return(d||u=="file")&&(o.push("//"),(u=this.o)&&o.push(kr(u,vu,!0),"@"),o.push(Sr(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&o.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(kr(d,d.charAt(0)=="/"?_m:gm,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",kr(d,wm)),o.join("")},Ft.prototype.resolve=function(o){const u=at(this);let d=!!o.j;d?Cr(u,o.j):d=!!o.o,d?u.o=o.o:d=!!o.g,d?u.g=o.g:d=o.u!=null;var f=o.h;if(d)Vr(u,o.u);else if(d=!!o.h){if(f.charAt(0)!="/")if(this.g&&!this.h)f="/"+f;else{var A=u.h.lastIndexOf("/");A!=-1&&(f=u.h.slice(0,A+1)+f)}if(A=f,A==".."||A==".")f="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){f=A.lastIndexOf("/",0)==0,A=A.split("/");const P=[];for(let O=0;O<A.length;){const W=A[O++];W=="."?f&&O==A.length&&P.push(""):W==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),f&&O==A.length&&P.push("")):(P.push(W),f=!0)}f=P.join("/")}else f=A}return d?u.h=f:d=o.i.toString()!=="",d?Bo(u,bu(o.i)):d=!!o.m,d&&(u.m=o.m),u};function at(o){return new Ft(o)}function Cr(o,u,d){o.j=d?Nr(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function Vr(o,u){if(u){if(u=Number(u),isNaN(u)||u<0)throw Error("Bad port number "+u);o.u=u}else o.u=null}function Bo(o,u,d){u instanceof Dr?(o.i=u,Tm(o.i,o.l)):(d||(u=kr(u,ym)),o.i=new Dr(u,o.l))}function ne(o,u,d){o.i.set(u,d)}function js(o){return ne(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function Nr(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function kr(o,u,d){return typeof o=="string"?(o=encodeURI(o).replace(u,mm),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function mm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var vu=/[#\/\?@]/g,gm=/[#\?:]/g,_m=/[#\?]/g,ym=/[#\?@]/g,wm=/#/g;function Dr(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function wn(o){o.g||(o.g=new Map,o.h=0,o.i&&pm(o.i,function(u,d){o.add(decodeURIComponent(u.replace(/\+/g," ")),d)}))}n=Dr.prototype,n.add=function(o,u){wn(this),this.i=null,o=Hn(this,o);let d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(u),this.h+=1,this};function Au(o,u){wn(o),u=Hn(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Ru(o,u){return wn(o),u=Hn(o,u),o.g.has(u)}n.forEach=function(o,u){wn(this),this.g.forEach(function(d,f){d.forEach(function(A){o.call(u,A,f,this)},this)},this)};function Pu(o,u){wn(o);let d=[];if(typeof u=="string")Ru(o,u)&&(d=d.concat(o.g.get(Hn(o,u))));else for(o=Array.from(o.g.values()),u=0;u<o.length;u++)d=d.concat(o[u]);return d}n.set=function(o,u){return wn(this),this.i=null,o=Hn(this,o),Ru(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=Pu(this,o),o.length>0?String(o[0]):u):u};function Su(o,u,d){Au(o,u),d.length>0&&(o.i=null,o.g.set(Hn(o,u),b(d)),o.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(let f=0;f<u.length;f++){var d=u[f];const A=Sr(d);d=Pu(this,d);for(let P=0;P<d.length;P++){let O=A;d[P]!==""&&(O+="="+Sr(d[P])),o.push(O)}}return this.i=o.join("&")};function bu(o){const u=new Dr;return u.i=o.i,o.g&&(u.g=new Map(o.g),u.h=o.h),u}function Hn(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Tm(o,u){u&&!o.j&&(wn(o),o.i=null,o.g.forEach(function(d,f){const A=f.toLowerCase();f!=A&&(Au(this,f),Su(this,A,d))},o)),o.j=u}function Em(o,u){const d=new Pr;if(a.Image){const f=new Image;f.onload=p(Bt,d,"TestLoadImage: loaded",!0,u,f),f.onerror=p(Bt,d,"TestLoadImage: error",!1,u,f),f.onabort=p(Bt,d,"TestLoadImage: abort",!1,u,f),f.ontimeout=p(Bt,d,"TestLoadImage: timeout",!1,u,f),a.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=o}else u(!1)}function Im(o,u){const d=new Pr,f=new AbortController,A=setTimeout(()=>{f.abort(),Bt(d,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:f.signal}).then(P=>{clearTimeout(A),P.ok?Bt(d,"TestPingServer: ok",!0,u):Bt(d,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(A),Bt(d,"TestPingServer: error",!1,u)})}function Bt(o,u,d,f,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),f(d)}catch{}}function vm(){this.g=new im}function qo(o){this.i=o.Sb||null,this.h=o.ab||!1}m(qo,su),qo.prototype.g=function(){return new Hs(this.i,this.h)};function Hs(o,u){Ae.call(this),this.H=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(Hs,Ae),n=Hs.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=u,this.readyState=1,xr(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const u={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(u.body=o),(this.H||a).fetch(new Request(this.D,u)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Or(this)),this.readyState=0},n.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,xr(this)),this.g&&(this.readyState=3,xr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Cu(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Cu(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}n.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.B.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?Or(this):xr(this),this.readyState==3&&Cu(this)}},n.Oa=function(o){this.g&&(this.response=this.responseText=o,Or(this))},n.Na=function(o){this.g&&(this.response=o,Or(this))},n.ga=function(){this.g&&Or(this)};function Or(o){o.readyState=4,o.l=null,o.j=null,o.B=null,xr(o)}n.setRequestHeader=function(o,u){this.A.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var d=u.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=u.next();return o.join(`\r
`)};function xr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Hs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Vu(o){let u="";return Ms(o,function(d,f){u+=f,u+=":",u+=d,u+=`\r
`}),u}function $o(o,u,d){e:{for(f in d){var f=!1;break e}f=!0}f||(d=Vu(d),typeof o=="string"?d!=null&&Sr(d):ne(o,u,d))}function ce(o){Ae.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(ce,Ae);var Am=/^https?$/i,Rm=["POST","PUT"];n=ce.prototype,n.Fa=function(o){this.H=o},n.ea=function(o,u,d,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():hu.g(),this.g.onreadystatechange=T(h(this.Ca,this));try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(P){Nu(this,P);return}if(o=d||"",d=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var A in f)d.set(A,f[A]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const P of f.keys())d.set(P,f.get(P));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(d.keys()).find(P=>P.toLowerCase()=="content-type"),A=a.FormData&&o instanceof a.FormData,!(Array.prototype.indexOf.call(Rm,u,void 0)>=0)||f||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,O]of d)this.g.setRequestHeader(P,O);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){Nu(this,P)}};function Nu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.o=5,ku(o),Ws(o)}function ku(o){o.A||(o.A=!0,Ve(o,"complete"),Ve(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Ve(this,"complete"),Ve(this,"abort"),Ws(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ws(this,!0)),ce.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Du(this):this.Xa())},n.Xa=function(){Du(this)};function Du(o){if(o.h&&typeof i<"u"){if(o.v&&qt(o)==4)setTimeout(o.Ca.bind(o),0);else if(Ve(o,"readystatechange"),qt(o)==4){o.h=!1;try{const P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var d;if(!(d=u)){var f;if(f=P===0){let O=String(o.D).match(Iu)[1]||null;!O&&a.self&&a.self.location&&(O=a.self.location.protocol.slice(0,-1)),f=!Am.test(O?O.toLowerCase():"")}d=f}if(d)Ve(o,"complete"),Ve(o,"success");else{o.o=6;try{var A=qt(o)>2?o.g.statusText:""}catch{A=""}o.l=A+" ["+o.ca()+"]",ku(o)}}finally{Ws(o)}}}}function Ws(o,u){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);const d=o.g;o.g=null,u||Ve(o,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function qt(o){return o.g?o.g.readyState:0}n.ca=function(){try{return qt(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),sm(u)}};function Ou(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Pm(o){const u={};o=(o.g&&qt(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<o.length;f++){if(_(o[f]))continue;var d=lm(o[f]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const P=u[A]||[];u[A]=P,P.push(d)}Xp(u,function(f){return f.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Lr(o,u,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||u}function xu(o){this.za=0,this.i=[],this.j=new Pr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Lr("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Lr("baseRetryDelayMs",5e3,o),this.Za=Lr("retryDelaySeedMs",1e4,o),this.Ta=Lr("forwardChannelMaxRetries",2,o),this.va=Lr("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new _u(o&&o.concurrentRequestLimit),this.Ba=new vm,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=xu.prototype,n.ka=8,n.I=1,n.connect=function(o,u,d,f){Ne(0),this.W=o,this.H=u||{},d&&f!==void 0&&(this.H.OSID=d,this.H.OAID=f),this.F=this.X,this.J=Hu(this,null,this.W),Gs(this)};function jo(o){if(Lu(o),o.I==3){var u=o.V++,d=at(o.J);if(ne(d,"SID",o.M),ne(d,"RID",u),ne(d,"TYPE","terminate"),Mr(o,d),u=new Ut(o,o.j,u),u.M=2,u.A=js(at(d)),d=!1,a.navigator&&a.navigator.sendBeacon)try{d=a.navigator.sendBeacon(u.A.toString(),"")}catch{}!d&&a.Image&&(new Image().src=u.A,d=!0),d||(u.g=Wu(u.j,null),u.g.ea(u.A)),u.F=Date.now(),$s(u)}ju(o)}function zs(o){o.g&&(Wo(o),o.g.cancel(),o.g=null)}function Lu(o){zs(o),o.v&&(a.clearTimeout(o.v),o.v=null),Ks(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&a.clearTimeout(o.m),o.m=null)}function Gs(o){if(!yu(o.h)&&!o.m){o.m=!0;var u=o.Ea;Ie||g(),ve||(Ie(),ve=!0),I.add(u,o),o.D=0}}function Sm(o,u){return wu(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=u.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=Rr(h(o.Ea,o,u),$u(o,o.D)),o.D++,!0)}n.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;const A=new Ut(this,this.j,o);let P=this.o;if(this.U&&(P?(P=Kc(P),Yc(P,this.U)):P=this.U),this.u!==null||this.R||(A.J=P,P=null),this.S)e:{for(var u=0,d=0;d<this.i.length;d++){t:{var f=this.i[d];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(u+=f,u>4096){u=d;break e}if(u===4096||d===this.i.length-1){u=d+1;break e}}u=1e3}else u=1e3;u=Uu(this,A,u),d=at(this.J),ne(d,"RID",o),ne(d,"CVER",22),this.G&&ne(d,"X-HTTP-Session-Id",this.G),Mr(this,d),P&&(this.R?u="headers="+Sr(Vu(P))+"&"+u:this.u&&$o(d,this.u,P)),Fo(this.h,A),this.Ra&&ne(d,"TYPE","init"),this.S?(ne(d,"$req",u),ne(d,"SID","null"),A.U=!0,xo(A,d,null)):xo(A,d,u),this.I=2}}else this.I==3&&(o?Mu(this,o):this.i.length==0||yu(this.h)||Mu(this))};function Mu(o,u){var d;u?d=u.l:d=o.V++;const f=at(o.J);ne(f,"SID",o.M),ne(f,"RID",d),ne(f,"AID",o.K),Mr(o,f),o.u&&o.o&&$o(f,o.u,o.o),d=new Ut(o,o.j,d,o.D+1),o.u===null&&(d.J=o.o),u&&(o.i=u.G.concat(o.i)),u=Uu(o,d,1e3),d.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Fo(o.h,d),xo(d,f,u)}function Mr(o,u){o.H&&Ms(o.H,function(d,f){ne(u,f,d)}),o.l&&Ms({},function(d,f){ne(u,f,d)})}function Uu(o,u,d){d=Math.min(o.i.length,d);const f=o.l?h(o.l.Ka,o.l,o):null;e:{var A=o.i;let W=-1;for(;;){const me=["count="+d];W==-1?d>0?(W=A[0].g,me.push("ofs="+W)):W=0:me.push("ofs="+W);let te=!0;for(let _e=0;_e<d;_e++){var P=A[_e].g;const ct=A[_e].map;if(P-=W,P<0)W=Math.max(0,A[_e].g-100),te=!1;else try{P="req"+P+"_"||"";try{var O=ct instanceof Map?ct:Object.entries(ct);for(const[En,$t]of O){let jt=$t;c($t)&&(jt=Vo($t)),me.push(P+En+"="+encodeURIComponent(jt))}}catch(En){throw me.push(P+"type="+encodeURIComponent("_badmap")),En}}catch{f&&f(ct)}}if(te){O=me.join("&");break e}}O=void 0}return o=o.i.splice(0,d),u.G=o,O}function Fu(o){if(!o.g&&!o.v){o.Y=1;var u=o.Da;Ie||g(),ve||(Ie(),ve=!0),I.add(u,o),o.A=0}}function Ho(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=Rr(h(o.Da,o),$u(o,o.A)),o.A++,!0)}n.Da=function(){if(this.v=null,Bu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=Rr(h(this.Wa,this),o)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Ne(10),zs(this),Bu(this))};function Wo(o){o.B!=null&&(a.clearTimeout(o.B),o.B=null)}function Bu(o){o.g=new Ut(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var u=at(o.na);ne(u,"RID","rpc"),ne(u,"SID",o.M),ne(u,"AID",o.K),ne(u,"CI",o.F?"0":"1"),!o.F&&o.ia&&ne(u,"TO",o.ia),ne(u,"TYPE","xmlhttp"),Mr(o,u),o.u&&o.o&&$o(u,o.u,o.o),o.O&&(o.g.H=o.O);var d=o.g;o=o.ba,d.M=1,d.A=js(at(u)),d.u=null,d.R=!0,pu(d,o)}n.Va=function(){this.C!=null&&(this.C=null,zs(this),Ho(this),Ne(19))};function Ks(o){o.C!=null&&(a.clearTimeout(o.C),o.C=null)}function qu(o,u){var d=null;if(o.g==u){Ks(o),Wo(o),o.g=null;var f=2}else if(Uo(o.h,u))d=u.G,Tu(o.h,u),f=1;else return;if(o.I!=0){if(u.o)if(f==1){d=u.u?u.u.length:0,u=Date.now()-u.F;var A=o.D;f=Bs(),Ve(f,new uu(f,d)),Gs(o)}else Fu(o);else if(A=u.m,A==3||A==0&&u.X>0||!(f==1&&Sm(o,u)||f==2&&Ho(o)))switch(d&&d.length>0&&(u=o.h,u.i=u.i.concat(d)),A){case 1:Tn(o,5);break;case 4:Tn(o,10);break;case 3:Tn(o,6);break;default:Tn(o,2)}}}function $u(o,u){let d=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(d*=2),d*u}function Tn(o,u){if(o.j.info("Error code "+u),u==2){var d=h(o.bb,o),f=o.Ua;const A=!f;f=new Ft(f||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||Cr(f,"https"),js(f),A?Em(f.toString(),d):Im(f.toString(),d)}else Ne(2);o.I=0,o.l&&o.l.pa(u),ju(o),Lu(o)}n.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Ne(2)):(this.j.info("Failed to ping google.com"),Ne(1))};function ju(o){if(o.I=0,o.ja=[],o.l){const u=Eu(o.h);(u.length!=0||o.i.length!=0)&&(N(o.ja,u),N(o.ja,o.i),o.h.i.length=0,b(o.i),o.i.length=0),o.l.oa()}}function Hu(o,u,d){var f=d instanceof Ft?at(d):new Ft(d);if(f.g!="")u&&(f.g=u+"."+f.g),Vr(f,f.u);else{var A=a.location;f=A.protocol,u=u?u+"."+A.hostname:A.hostname,A=+A.port;const P=new Ft(null);f&&Cr(P,f),u&&(P.g=u),A&&Vr(P,A),d&&(P.h=d),f=P}return d=o.G,u=o.wa,d&&u&&ne(f,d,u),ne(f,"VER",o.ka),Mr(o,f),f}function Wu(o,u,d){if(u&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Aa&&!o.ma?new ce(new qo({ab:d})):new ce(o.ma),u.Fa(o.L),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function zu(){}n=zu.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Qs(){}Qs.prototype.g=function(o,u){return new $e(o,u)};function $e(o,u){Ae.call(this),this.g=new xu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.sa&&(o?o["X-WebChannel-Client-Profile"]=u.sa:o={"X-WebChannel-Client-Profile":u.sa}),this.g.U=o,(o=u&&u.Qb)&&!_(o)&&(this.g.u=o),this.A=u&&u.supportsCrossDomainXhr||!1,this.v=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!_(u)&&(this.g.G=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Wn(this)}m($e,Ae),$e.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},$e.prototype.close=function(){jo(this.g)},$e.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.v&&(d={},d.__data__=Vo(o),o=d);u.i.push(new fm(u.Ya++,o)),u.I==3&&Gs(u)},$e.prototype.N=function(){this.g.l=null,delete this.j,jo(this.g),delete this.g,$e.Z.N.call(this)};function Gu(o){No.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const d in u){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}m(Gu,No);function Ku(){ko.call(this),this.status=1}m(Ku,ko);function Wn(o){this.g=o}m(Wn,zu),Wn.prototype.ra=function(){Ve(this.g,"a")},Wn.prototype.qa=function(o){Ve(this.g,new Gu(o))},Wn.prototype.pa=function(o){Ve(this.g,new Ku)},Wn.prototype.oa=function(){Ve(this.g,"b")},Qs.prototype.createWebChannel=Qs.prototype.g,$e.prototype.send=$e.prototype.o,$e.prototype.open=$e.prototype.m,$e.prototype.close=$e.prototype.close,Yh=function(){return new Qs},Qh=function(){return Bs()},Kh=_n,ha={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},qs.NO_ERROR=0,qs.TIMEOUT=8,qs.HTTP_ERROR=6,ii=qs,lu.COMPLETE="complete",Gh=lu,iu.EventType=vr,vr.OPEN="a",vr.CLOSE="b",vr.ERROR="c",vr.MESSAGE="d",Ae.prototype.listen=Ae.prototype.J,$r=iu,ce.prototype.listenOnce=ce.prototype.K,ce.prototype.getLastError=ce.prototype.Ha,ce.prototype.getLastErrorCode=ce.prototype.ya,ce.prototype.getStatus=ce.prototype.ca,ce.prototype.getResponseJson=ce.prototype.La,ce.prototype.getResponseText=ce.prototype.la,ce.prototype.send=ce.prototype.ea,ce.prototype.setWithCredentials=ce.prototype.Fa,zh=ce}).apply(typeof Js<"u"?Js:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let hr="12.19.0";function Yg(n){hr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tn=new Da("@firebase/firestore");function zn(){return tn.logLevel}function jR(n){tn.setLogLevel(n)}function x(n,...e){if(tn.logLevel<=Q.DEBUG){const t=e.map(xa);tn.debug(`Firestore (${hr}): ${n}`,...t)}}function kt(n,...e){if(tn.logLevel<=Q.ERROR){const t=e.map(xa);tn.error(`Firestore (${hr}): ${n}`,...t)}}function it(n,...e){if(tn.logLevel<=Q.WARN){const t=e.map(xa);tn.warn(`Firestore (${hr}): ${n}`,...t)}}function xa(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Jh(n,r,t)}function Jh(n,e,t){let r=`FIRESTORE (${hr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw kt(r),new Error(r)}function U(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Jh(e,s,r)}function H(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jg(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class La{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Jg(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function K(n,e){return n<e?-1:n>e?1:0}function da(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Qo(s)===Qo(i)?K(s,i):Qo(s)?1:-1}return K(n.length,e.length)}const Xg=55296,Zg=57343;function Qo(n){const e=n.charCodeAt(0);return e>=Xg&&e<=Zg}function er(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(e,t){this.comparator=e,this.root=t||Te.EMPTY}insert(e,t){return new re(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Te.BLACK,null,null))}remove(e){return new re(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Te.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Xs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Xs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Xs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Xs(this.root,e,this.comparator,!0)}}class Xs{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Te{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Te.RED,this.left=s??Te.EMPTY,this.right=i??Te.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Te(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Te.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Te.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Te.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Te.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}Te.EMPTY=null,Te.RED=!0,Te.BLACK=!1;Te.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Te(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.comparator=e,this.data=new re(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new rl(this.data.getIterator())}getIteratorFrom(e){return new rl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class rl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends Tt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt="__name__";class ut{constructor(e,t,r){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&B(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ut.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ut?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=ut.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return K(e.length,t.length)}static compareSegments(e,t){const r=ut.isNumericId(e),s=ut.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?ut.extractNumericId(e).compare(ut.extractNumericId(t)):da(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Jt.fromString(e.substring(4,e.length-2))}}class X extends ut{construct(e,t,r){return new X(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new D(C.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new X(t)}static emptyPath(){return new X([])}}const e_=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let ze=class Gn extends ut{construct(e,t,r){return new Gn(e,t,r)}static isValidIdentifier(e){return e_.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Gn.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===lt}static keyField(){return new Gn([lt])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new D(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new D(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new D(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new D(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Gn(t)}static emptyPath(){return new Gn([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e){this.fields=e,e.sort(ze.comparator)}static empty(){return new He([])}unionWith(e){let t=new de(ze.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new He(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return er(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yi(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function pn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function t_(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Xh(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(X.fromString(e))}static fromName(e){return new F(X.fromString(e).popFirst(5))}static empty(){return new F(X.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&X.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return X.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new X(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zh(n,e,t){if(!t)throw new D(C.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function n_(n,e,t,r){if(e===!0&&r===!0)throw new D(C.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function sl(n){if(!F.isDocumentKey(n))throw new D(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function il(n){if(F.isDocumentKey(n))throw new D(C.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function vs(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function ji(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":B(12329,{type:typeof n})}function Ge(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new D(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ji(n);throw new D(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function r_(n,e){if(e<=0)throw new D(C.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function he(n,e){const t={typeString:n};return e&&(t.value=e),t}function As(n,e){if(!vs(n))throw new D(C.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new D(C.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ol=-62135596800,al=1e6;class Z{static now(){return Z.fromMillis(Date.now())}static fromDate(e){return Z.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*al);return new Z(t,r)}static fromInstant(e){if(!e||typeof e.t!="bigint")throw new D(C.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return Z._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,r;if(e>=0n)t=Number(e/1000000000n),r=Number(e%1000000000n);else{const s=e%1000000000n;s===0n?(t=Number(e/1000000000n),r=0):(t=Number(e/1000000000n-1n),r=Number(s+1000000000n))}return new Z(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new D(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new D(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<ol)throw new D(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new D(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/al}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new D(C.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?K(this.nanoseconds,e.nanoseconds):K(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Z._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(As(e,Z._jsonSchema))return new Z(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-ol;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Z._jsonSchemaVersion="firestore/timestamp/1.0",Z._jsonSchema={type:he("string",Z._jsonSchemaVersion),seconds:he("number"),nanoseconds:he("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new ed("Invalid base64 string: "+i):i}})(e);return new fe(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return K(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const s_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function nn(n){if(U(!!n,39018),typeof n=="string"){let e=0;const t=s_.exec(n);if(U(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:se(n.seconds),nanos:se(n.nanos)}}function se(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function rn(n){return typeof n=="string"?fe.fromBase64String(n):fe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const td="server_timestamp",nd="__type__",rd="__previous_value__",sd="__local_write_time__";function Hi(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[nd])==null?void 0:r.stringValue)===td}function Rs(n){const e=n.mapValue.fields[rd];return Hi(e)?Rs(e):e}function tr(n){const e=nn(n.mapValue.fields[sd].timestampValue);return new Z(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i_{constructor(e,t,r,s,i,a,c,l,h,p,m,T,b){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=h,this.isUsingEmulator=p,this.apiKey=m,this._customHeaders=T,this.grpcFlowControlWindow=b}}const wi="(default)";class ss{constructor(e,t){this.projectId=e,this.database=t||wi}static empty(){return new ss("","")}get isDefaultDatabase(){return this.database===wi}isEqual(e){return e instanceof ss&&e.projectId===this.projectId&&e.database===this.database}}function o_(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new D(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ss(n.options.projectId,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ma=-1;function Wi(n){return n==null}function is(n){return n===0&&1/n==-1/0}function a_(n){return typeof n=="number"&&Number.isInteger(n)&&!is(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function c_(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const id="__type__",u_="__max__",Zs={mapValue:{}},od="__vector__",os="value",nr={nullValue:"NULL_VALUE"},Fe={booleanValue:!0},we={booleanValue:!1};function pe(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Hi(n)?4:l_(n)?9007199254740991:Ti(n)?10:11:B(28295,{value:n})}function Xe(n,e,t){if(n===e)return!0;const r=pe(n);if(r!==pe(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return tr(n).isEqual(tr(e));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const c=nn(i.timestampValue),l=nn(a.timestampValue);return c.seconds===l.seconds&&c.nanos===l.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,a){return rn(i.bytesValue).isEqual(rn(a.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,a){return se(i.geoPointValue.latitude)===se(a.geoPointValue.latitude)&&se(i.geoPointValue.longitude)===se(a.geoPointValue.longitude)})(n,e);case 2:return(function(i,a,c){if("integerValue"in i&&"integerValue"in a)return se(i.integerValue)===se(a.integerValue);let l,h;if("doubleValue"in i&&"doubleValue"in a)l=se(i.doubleValue),h=se(a.doubleValue);else{if(!(c!=null&&c.i))return!1;l=se(i.integerValue??i.doubleValue),h=se(a.integerValue??a.doubleValue)}return l===h?!!(c!=null&&c.o)||is(l)===is(h):!!(c===void 0||c.u)&&isNaN(l)&&isNaN(h)})(n,e,t);case 9:return er(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>Xe(s,i,t)));case 10:case 11:return(function(i,a,c){const l=i.mapValue.fields||{},h=a.mapValue.fields||{};if(yi(l)!==yi(h))return!1;for(const p in l)if(l.hasOwnProperty(p)&&(h[p]===void 0||!Xe(l[p],h[p],c)))return!1;return!0})(n,e,t);default:return B(52216,{left:n})}}function as(n,e){return(n.values||[]).find((t=>Xe(t,e)))!==void 0}function Be(n,e){if(n===e)return 0;const t=pe(n),r=pe(e);if(t!==r)return K(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return K(n.booleanValue,e.booleanValue);case 2:return(function(i,a){const c=se(i.integerValue||i.doubleValue),l=se(a.integerValue||a.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1})(n,e);case 3:return cl(n.timestampValue,e.timestampValue);case 4:return cl(tr(n),tr(e));case 5:return da(n.stringValue,e.stringValue);case 6:return(function(i,a){const c=rn(i),l=rn(a);return c.compareTo(l)})(n.bytesValue,e.bytesValue);case 7:return(function(i,a){const c=i.split("/"),l=a.split("/");for(let h=0;h<c.length&&h<l.length;h++){const p=K(c[h],l[h]);if(p!==0)return p}return K(c.length,l.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,a){const c=K(se(i.latitude),se(a.latitude));return c!==0?c:K(se(i.longitude),se(a.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return ul(n.arrayValue,e.arrayValue);case 10:return(function(i,a){var T,b,N,M;const c=i.fields||{},l=a.fields||{},h=(T=c[os])==null?void 0:T.arrayValue,p=(b=l[os])==null?void 0:b.arrayValue,m=K(((N=h==null?void 0:h.values)==null?void 0:N.length)||0,((M=p==null?void 0:p.values)==null?void 0:M.length)||0);return m!==0?m:ul(h,p)})(n.mapValue,e.mapValue);case 11:return(function(i,a){if(i===Zs.mapValue&&a===Zs.mapValue)return 0;if(i===Zs.mapValue)return 1;if(a===Zs.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),h=a.fields||{},p=Object.keys(h);l.sort(),p.sort();for(let m=0;m<l.length&&m<p.length;++m){const T=da(l[m],p[m]);if(T!==0)return T;const b=Be(c[l[m]],h[p[m]]);if(b!==0)return b}return K(l.length,p.length)})(n.mapValue,e.mapValue);default:throw B(23264,{l:t})}}function cl(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return K(n,e);const t=nn(n),r=nn(e),s=K(t.seconds,r.seconds);return s!==0?s:K(t.nanos,r.nanos)}function ul(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Be(t[s],r[s]);if(i!==void 0&&i!==0)return i}return K(t.length,r.length)}function rr(n){return fa(n)}function fa(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=nn(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return rn(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=fa(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${fa(t.fields[a])}`;return s+"}"})(n.mapValue):B(61005,{value:n})}function oi(n){switch(pe(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Rs(n);return e?16+oi(e):16;case 5:return 2*n.stringValue.length;case 6:return rn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+oi(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return pn(r.fields,((i,a)=>{s+=i.length+oi(a)})),s})(n.mapValue);default:throw B(13486,{value:n})}}function ll(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function ht(n){return!!n&&"integerValue"in n}function An(n){return!!n&&"doubleValue"in n}function sn(n){return ht(n)||An(n)}function sr(n){return!!n&&"arrayValue"in n}function We(n){return!!n&&"nullValue"in n}function qe(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Sn(n){return!!n&&"mapValue"in n}function Ti(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[id])==null?void 0:r.stringValue)===od}function pa(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[os])==null?void 0:t.arrayValue}function zr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return pn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=zr(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=zr(n.arrayValue.values[t]);return e}return{...n}}function l_(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===u_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class De{constructor(e){this.value=e}static empty(){return new De({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Sn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=zr(t)}setAll(e){let t=ze.emptyPath(),r={},s=[];e.forEach(((a,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=zr(a):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Sn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Xe(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Sn(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){pn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new De(zr(this.value))}}function ad(n){const e=[];return pn(n.fields,((t,r)=>{const s=new ze([t]);if(Sn(r)){const i=ad(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new He(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zi(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:is(e)?"-0":e}}function Ua(n){return{integerValue:""+n}}function Fa(n,e,t){return a_(e)?Ua(e):zi(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(){this._=void 0}}function h_(n,e,t){return n instanceof cs?(function(s,i){const a={fields:{[nd]:{stringValue:td},[sd]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Hi(i)&&(i=Rs(i)),i&&(a.fields[rd]=i),{mapValue:a}})(t,e):n instanceof us?ud(n,e):n instanceof ls?ld(n,e):n instanceof hs?(function(s,i){const a=cd(s,i),c=vi(a)+vi(s.h);return ht(a)&&ht(s.h)?Ua(c):zi(s.serializer,c)})(n,e):n instanceof Ei?(function(s,i){return hl(s,i,Math.min)})(n,e):n instanceof Ii?(function(s,i){return hl(s,i,Math.max)})(n,e):void 0}function d_(n,e,t){return n instanceof us?ud(n,e):n instanceof ls?ld(n,e):t}function cd(n,e){return n instanceof hs?sn(e)?e:{integerValue:0}:null}class cs extends Gi{}class us extends Gi{constructor(e){super(),this.elements=e}}function ud(n,e){const t=hd(e);for(const r of n.elements)t.some((s=>Xe(s,r)))||t.push(r);return{arrayValue:{values:t}}}class ls extends Gi{constructor(e){super(),this.elements=e}}function ld(n,e){let t=hd(e);for(const r of n.elements)t=t.filter((s=>!Xe(s,r)));return{arrayValue:{values:t}}}class Ba extends Gi{constructor(e,t){super(),this.serializer=e,this.h=t}}class hs extends Ba{}class Ei extends Ba{}class Ii extends Ba{}function hl(n,e,t){if(!sn(e))return n.h;const r=t(vi(e),vi(n.h));return ht(e)&&ht(n.h)?Ua(r):zi(n.serializer,r)}function vi(n){return se(n.integerValue||n.doubleValue)}function hd(n){return sr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f_{constructor(e,t){this.field=e,this.transform=t}}function p_(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof us&&s instanceof us||r instanceof ls&&s instanceof ls?er(r.elements,s.elements,Xe):r instanceof hs&&s instanceof hs||r instanceof Ei&&s instanceof Ei||r instanceof Ii&&s instanceof Ii?Xe(r.h,s.h):r instanceof cs&&s instanceof cs})(n.transform,e.transform)}class m_{constructor(e,t){this.version=e,this.transformResults=t}}class nt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new nt}static exists(e){return new nt(void 0,e)}static updateTime(e){return new nt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ai(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Ki{}function dd(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new qa(n.key,nt.none()):new Ps(n.key,n.data,nt.none());{const t=n.data,r=De.empty();let s=new de(ze.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new mn(n.key,r,new He(s.toArray()),nt.none())}}function g_(n,e,t){n instanceof Ps?(function(s,i,a){const c=s.value.clone(),l=fl(s.fieldTransforms,i,a.transformResults);c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()})(n,e,t):n instanceof mn?(function(s,i,a){if(!ai(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=fl(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(fd(s)),l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()})(n,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function Gr(n,e,t,r){return n instanceof Ps?(function(i,a,c,l){if(!ai(i.precondition,a))return c;const h=i.value.clone(),p=pl(i.fieldTransforms,l,a);return h.setAll(p),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null})(n,e,t,r):n instanceof mn?(function(i,a,c,l){if(!ai(i.precondition,a))return c;const h=pl(i.fieldTransforms,l,a),p=a.data;return p.setAll(fd(i)),p.setAll(h),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((m=>m.field)))})(n,e,t,r):(function(i,a,c){return ai(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c})(n,e,t)}function __(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=cd(r.transform,s||null);i!=null&&(t===null&&(t=De.empty()),t.set(r.field,i))}return t||null}function dl(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&er(r,s,((i,a)=>p_(i,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ps extends Ki{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class mn extends Ki{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function fd(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function fl(n,e,t){const r=new Map;U(n.length===t.length,32656,{T:t.length,P:n.length});for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,d_(a,c,t[s]))}return r}function pl(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,h_(i,a,e))}return r}class qa extends Ki{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class y_ extends Ki{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai{constructor(e,t){this.position=e,this.inclusive=t}}function ml(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=F.comparator(F.fromName(a.referenceValue),t.key):r=Be(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function gl(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Xe(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pd{}class le extends pd{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new T_(e,t,r):t==="array-contains"?new v_(e,r):t==="in"?new A_(e,r):t==="not-in"?new R_(e,r):t==="array-contains-any"?new P_(e,r):new le(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new E_(e,r):new I_(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Be(t,this.value)):t!==null&&pe(this.value)===pe(t)&&this.matchesComparison(Be(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ot extends pd{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new ot(e,t)}matches(e){return md(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.I!==null||(this.I=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function md(n){return n.op==="and"}function gd(n){return w_(n)&&md(n)}function w_(n){for(const e of n.filters)if(e instanceof ot)return!1;return!0}function ma(n){if(n instanceof le)return n.field.canonicalString()+n.op.toString()+rr(n.value);if(gd(n))return n.filters.map((e=>ma(e))).join(",");{const e=n.filters.map((t=>ma(t))).join(",");return`${n.op}(${e})`}}function _d(n,e){return n instanceof le?(function(r,s){return s instanceof le&&r.op===s.op&&r.field.isEqual(s.field)&&Xe(r.value,s.value)})(n,e):n instanceof ot?(function(r,s){return s instanceof ot&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,a,c)=>i&&_d(a,s.filters[c])),!0):!1})(n,e):void B(19439)}function yd(n){return n instanceof le?(function(t){return`${t.field.canonicalString()} ${t.op} ${rr(t.value)}`})(n):n instanceof ot?(function(t){return t.op.toString()+" {"+t.getFilters().map(yd).join(" ,")+"}"})(n):"Filter"}class T_ extends le{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class E_ extends le{constructor(e,t){super(e,"in",t),this.keys=wd("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class I_ extends le{constructor(e,t){super(e,"not-in",t),this.keys=wd("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function wd(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class v_ extends le{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return sr(t)&&as(t.arrayValue,this.value)}}class A_ extends le{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&as(this.value.arrayValue,t)}}class R_ extends le{constructor(e,t){super(e,"not-in",t)}matches(e){if(as(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!as(this.value.arrayValue,t)}}class P_ extends le{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!sr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>as(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,t="asc"){this.field=e,this.dir=t}}function S_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{static fromTimestamp(e){return new j(e)}static min(){return new j(new Z(0,0))}static max(){return new j(new Z(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Se(e,0,j.min(),j.min(),j.min(),De.empty(),0)}static newFoundDocument(e,t,r,s){return new Se(e,1,t,j.min(),r,s,0)}static newNoDocument(e,t){return new Se(e,2,t,j.min(),j.min(),De.empty(),0)}static newUnknownDocument(e,t){return new Se(e,3,t,j.min(),j.min(),De.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(j.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=De.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=De.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=j.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Se&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Se(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fs=-1;function b_(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=j.fromTimestamp(r===1e9?new Z(t+1,0):new Z(t,r));return new on(s,F.empty(),e)}function C_(n){return new on(n.readTime,n.key,fs)}class on{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new on(j.min(),F.empty(),fs)}static max(){return new on(j.max(),F.empty(),fs)}}function V_(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:K(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N_{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.R=null}}function _l(n,e=null,t=[],r=[],s=null,i=null,a=null){return new N_(n,e,t,r,s,i,a)}function Td(n){const e=H(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>ma(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),Wi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>rr(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>rr(r))).join(",")),e.R=t}return e.R}function Ed(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!S_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!_d(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!gl(n.startAt,e.startAt)&&gl(n.endAt,e.endAt)}function vn(n){return!!n.isCorePipeline}function Id(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dr{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=l,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function k_(n,e,t,r,s,i,a,c){return new dr(n,e,t,r,s,i,a,c)}function Qi(n){return new dr(n)}function yl(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function D_(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function vd(n){return n.collectionGroup!==null}function Kr(n){const e=H(n);if(e.A===null){e.A=[];const t=new Set;for(const i of e.explicitOrderBy)e.A.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new de(ze.comparator);return a.filters.forEach((l=>{l.getFlattenedFilters().forEach((h=>{h.isInequality()&&(c=c.add(h.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.A.push(new ds(i,r))})),t.has(ze.keyField().canonicalString())||e.A.push(new ds(ze.keyField(),r))}return e.A}function dt(n){const e=H(n);return e.V||(e.V=O_(e,Kr(n))),e.V}function O_(n,e){if(n.limitType==="F")return _l(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new ds(s.field,i)}));const t=n.endAt?new Ai(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Ai(n.startAt.position,n.startAt.inclusive):null;return _l(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ga(n,e){const t=n.filters.concat([e]);return new dr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function x_(n,e){const t=n.explicitOrderBy.concat([e]);return new dr(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function Ri(n,e,t){return new dr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function L_(n,e){return Ed(dt(n),dt(e))&&n.limitType===e.limitType}function Qr(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>yd(s))).join(", ")}]`),Wi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>rr(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>rr(s))).join(",")),`Target(${r})`})(dt(n))}; limitType=${n.limitType})`}function Yi(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):F.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of Kr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(a,c,l){const h=ml(a,c,l);return a.inclusive?h<=0:h<0})(r.startAt,Kr(r),s)||r.endAt&&!(function(a,c,l){const h=ml(a,c,l);return a.inclusive?h>=0:h>0})(r.endAt,Kr(r),s))})(n,e)}function $a(n){return(e,t)=>{let r=!1;for(const s of Kr(n)){const i=M_(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function M_(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(i,a,c){const l=a.data.field(i),h=c.data.field(i);return l!==null&&h!==null?Be(l,h):B(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return B(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U_{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ue,Y;function F_(n){switch(n){case C.OK:return B(64938);case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0;default:return B(15467,{code:n})}}function Ad(n){if(n===void 0)return kt("GRPC error has no .code"),C.UNKNOWN;switch(n){case ue.OK:return C.OK;case ue.CANCELLED:return C.CANCELLED;case ue.UNKNOWN:return C.UNKNOWN;case ue.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case ue.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case ue.INTERNAL:return C.INTERNAL;case ue.UNAVAILABLE:return C.UNAVAILABLE;case ue.UNAUTHENTICATED:return C.UNAUTHENTICATED;case ue.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case ue.NOT_FOUND:return C.NOT_FOUND;case ue.ALREADY_EXISTS:return C.ALREADY_EXISTS;case ue.PERMISSION_DENIED:return C.PERMISSION_DENIED;case ue.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case ue.ABORTED:return C.ABORTED;case ue.OUT_OF_RANGE:return C.OUT_OF_RANGE;case ue.UNIMPLEMENTED:return C.UNIMPLEMENTED;case ue.DATA_LOSS:return C.DATA_LOSS;default:return B(39323,{code:n})}}(Y=ue||(ue={}))[Y.OK=0]="OK",Y[Y.CANCELLED=1]="CANCELLED",Y[Y.UNKNOWN=2]="UNKNOWN",Y[Y.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Y[Y.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Y[Y.NOT_FOUND=5]="NOT_FOUND",Y[Y.ALREADY_EXISTS=6]="ALREADY_EXISTS",Y[Y.PERMISSION_DENIED=7]="PERMISSION_DENIED",Y[Y.UNAUTHENTICATED=16]="UNAUTHENTICATED",Y[Y.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Y[Y.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Y[Y.ABORTED=10]="ABORTED",Y[Y.OUT_OF_RANGE=11]="OUT_OF_RANGE",Y[Y.UNIMPLEMENTED=12]="UNIMPLEMENTED",Y[Y.INTERNAL=13]="INTERNAL",Y[Y.UNAVAILABLE=14]="UNAVAILABLE",Y[Y.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){pn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return Xh(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B_=new re(F.comparator);function Me(){return B_}const Rd=new re(F.comparator);function Kn(...n){let e=Rd;for(const t of n)e=e.insert(t.key,t);return e}function Pd(n){let e=Rd;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Wt(){return Yr()}function Sd(){return Yr()}function Yr(){return new Bn((n=>n.toString()),((n,e)=>n.isEqual(e)))}const q_=new re(F.comparator),$_=new de(F.comparator);function G(...n){let e=$_;for(const t of n)e=e.add(t);return e}const j_=new de(K);function H_(){return j_}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function W_(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const z_=new Jt([4294967295,4294967295],0);function wl(n){const e=W_().encode(n),t=new Wh;return t.update(e),new Uint8Array(t.digest())}function Tl(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Jt([t,r],0),new Jt([s,i],0)]}class ja{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new jr(`Invalid padding: ${t}`);if(r<0)throw new jr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new jr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new jr(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=Jt.fromNumber(this.p)}v(e,t,r){let s=e.add(t.multiply(Jt.fromNumber(r)));return s.compare(z_)===1&&(s=new Jt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.p===0)return!1;const t=wl(e),[r,s]=Tl(t);for(let i=0;i<this.hashCount;i++){const a=this.v(r,s,i);if(!this.D(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new ja(i,s,t);return r.forEach((c=>a.insert(c))),a}insert(e){if(this.p===0)return;const t=wl(e),[r,s]=Tl(t);for(let i=0;i<this.hashCount;i++){const a=this.v(r,s,i);this.C(a)}}C(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class jr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{constructor(e,t,r,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,bs.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Ss(j.min(),s,new re(K),Me(),Me(),G())}}class bs{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new bs(r,t,G(),G(),G())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(e,t,r,s){this.F=e,this.removedTargetIds=t,this.key=r,this.O=s}}class bd{constructor(e,t){this.targetId=e,this.M=t}}class Cd{constructor(e,t,r=fe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class El{constructor(e){this.targetId=e,this.N=0,this.L=Il(),this.B=fe.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return this.N!==0}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=G(),t=G(),r=G();return this.L.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:B(38017,{changeType:i})}})),new bs(this.B,this.U,e,t,r)}G(){this.k=!1,this.L=Il()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,U(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const Ur="WatchChangeAggregator";class G_{constructor(e){this.X=e,this.ee=new Map,this.te=Me(),this.ne=ei(),this.re=Me(),this.ie=ei(),this.se=new re(K)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,(t=>{const r=this.ee.get(t);if(r)switch(e.state){case 0:this.ce(t)&&r.K(e.resumeToken);break;case 1:r.Y(),r.q||r.G(),r.K(e.resumeToken);break;case 2:r.Y(),r.q||this.removeTarget(t);break;case 3:this.ce(t)&&(r.Z(),r.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),r.K(e.resumeToken));break;default:B(56790,{state:e.state})}else x(Ur,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach(((r,s)=>{this.ce(s)&&t(s)}))}Ee(e){var t;return vn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:Id(e)}he(e){const t=e.targetId,r=e.M.count,s=this.Te(t);if(s){const i=s.target;if(this.Ee(i))if(r===0){const a=new F(vn(i)?X.fromString(i.getPipelineDocuments()[0]):i.path);this.ae(t,a,Se.newNoDocument(a,j.min()))}else U(r===1,20013,"Single document existence filter with count: "+r);else{const a=this.Pe(t);if(a!==r){const c=this.Ie(e),l=c?this.Re(c,e,a):1;if(l!==0){this.le(t);const h=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,h)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=rn(r).toUint8Array()}catch(l){if(l instanceof ed)return it("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new ja(a,s,i)}catch(l){return it(l instanceof jr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.p===0?null:c}Re(e,t,r){return t.M.count===r-this.de(e,t.targetId)?0:2}de(e,t){const r=this.X.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const a=this.X.Ve(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.ae(t,i,null),s++)})),s}fe(e){const t=new Map;this.ee.forEach(((i,a)=>{const c=this.Te(a);if(c){if(i.current&&this.Ee(c.target)){const l=vn(c.target)?X.fromString(c.target.getPipelineDocuments()[0]):c.target.path,h=new F(l);this.me(h).has(a)||this.pe(a,h)||this.ae(a,h,Se.newNoDocument(h,e))}i.$&&(t.set(a,i.W()),i.G())}}));let r=G();this.ie.forEach(((i,a)=>{let c=!0;a.forEachWhile((l=>{const h=this.Te(l);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.te.forEach(((i,a)=>a.setReadTime(e))),this.re.forEach(((i,a)=>a.setReadTime(e)));const s=new Ss(e,t,this.se,this.te,this.re,r);return this.te=Me(),this.ne=ei(),this.re=Me(),this.ie=ei(),this.se=new re(K),s}oe(e,t){const r=this.ee.get(e);if(!r||!this.ce(e))return void x(Ur,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.pe(e,t.key)?2:0;r.j(t.key,s),vn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,r){const s=this.ee.get(e);s&&this.ce(e)?(this.pe(e,t)?s.j(t,1):s.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),r&&(vn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t,r):this.te=this.te.insert(t,r))):x(Ur,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const r=t.W();return this.X.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}J(e){let t=this.ee.get(e);t||(x(Ur,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new El(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new de(K),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new de(K),this.ne=this.ne.insert(e,t)),t}ce(e){const t=this.Te(e)!==null;return t||x(Ur,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return t===void 0||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new El(e)),this.X.getRemoteKeysForTarget(e).forEach((t=>{this.ae(e,t,null)}))}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function ei(){return new re(F.comparator)}function Il(){return new re(F.comparator)}const K_={asc:"ASCENDING",desc:"DESCENDING"},Q_={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Y_={and:"AND",or:"OR"};class J_{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function _a(n,e){return n.useProto3Json||Wi(e)?e:{value:e}}function Jr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Ha(n){const e=nn(n);return new Z(e.seconds,e.nanos)}function Vd(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function ui(n,e){return Jr(n,e.toTimestamp())}function ft(n){return U(!!n,49232),j.fromTimestamp(Ha(n))}function Wa(n,e){return ya(n,e).canonicalString()}function ya(n,e){const t=(function(s){return new X(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Nd(n){const e=X.fromString(n);return U(Ld(e),10190,{key:e.toString()}),e}function Pi(n,e){return Wa(n.databaseId,e.path)}function Yo(n,e){const t=Nd(e);if(t.get(1)!==n.databaseId.projectId)throw new D(C.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new D(C.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F(Dd(t))}function kd(n,e){return Wa(n.databaseId,e)}function X_(n){const e=Nd(n);return e.length===4?X.emptyPath():Dd(e)}function wa(n){return new X(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Dd(n){return U(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function vl(n,e,t){return{name:Pi(n,e),fields:t.value.mapValue.fields}}function Z_(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:B(39313,{state:h})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(h,p){return h.useProto3Json?(U(p===void 0||typeof p=="string",58123),fe.fromBase64String(p||"")):(U(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),fe.fromUint8Array(p||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&(function(h){const p=h.code===void 0?C.UNKNOWN:Ad(h.code);return new D(p,h.message||"")})(a);t=new Cd(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Yo(n,r.document.name),i=ft(r.document.updateTime),a=r.document.createTime?ft(r.document.createTime):j.min(),c=new De({mapValue:{fields:r.document.fields}}),l=Se.newFoundDocument(s,i,a,c),h=r.targetIds||[],p=r.removedTargetIds||[];t=new ci(h,p,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Yo(n,r.document),i=r.readTime?ft(r.readTime):j.min(),a=Se.newNoDocument(s,i),c=r.removedTargetIds||[];t=new ci([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Yo(n,r.document),i=r.removedTargetIds||[];t=new ci([],i,s,null)}else{if(!("filter"in e))return B(11601,{we:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new U_(s,i),c=r.targetId;t=new bd(c,a)}}return t}function ey(n,e){let t;if(e instanceof Ps)t={update:vl(n,e.key,e.value)};else if(e instanceof qa)t={delete:Pi(n,e.key)};else if(e instanceof mn)t={update:vl(n,e.key,e.data),updateMask:ly(e.fieldMask)};else{if(!(e instanceof y_))return B(16599,{be:e.type});t={verify:Pi(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,a){const c=a.transform;if(c instanceof cs)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof us)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof ls)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof hs)return{fieldPath:a.field.canonicalString(),increment:c.h};if(c instanceof Ei)return{fieldPath:a.field.canonicalString(),minimum:c.h};if(c instanceof Ii)return{fieldPath:a.field.canonicalString(),maximum:c.h};throw B(20930,{transform:a.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:ui(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)})(n,e.precondition)),t}function ty(n,e){return n&&n.length>0?(U(e!==void 0,14353),n.map((t=>(function(s,i){let a=s.updateTime?ft(s.updateTime):ft(i);return a.isEqual(j.min())&&(a=ft(i)),new m_(a,s.transformResults||[])})(t,e)))):[]}function ny(n,e){return{documents:[kd(n,e.path)]}}function ry(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=kd(n,s);const i=(function(h){if(h.length!==0)return xd(ot.create(h,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(h){if(h.length!==0)return h.map((p=>(function(T){return{field:Qn(T.field),direction:ay(T.dir)}})(p)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=_a(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(h){return{before:h.inclusive,values:h.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(h){return{before:!h.inclusive,values:h.position}})(e.endAt)),{Se:t,parent:s}}function sy(n){let e=X_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){U(r===1,65062);const p=t.from[0];p.allDescendants?s=p.collectionId:e=e.child(p.collectionId)}let i=[];t.where&&(i=(function(m){const T=Od(m);return T instanceof ot&&gd(T)?T.getFilters():[T]})(t.where));let a=[];t.orderBy&&(a=(function(m){return m.map((T=>(function(N){return new ds(Yn(N.field),(function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(N.direction))})(T)))})(t.orderBy));let c=null;t.limit&&(c=(function(m){let T;return T=typeof m=="object"?m.value:m,Wi(T)?null:T})(t.limit));let l=null;t.startAt&&(l=(function(m){const T=!!m.before,b=m.values||[];return new Ai(b,T)})(t.startAt));let h=null;return t.endAt&&(h=(function(m){const T=!m.before,b=m.values||[];return new Ai(b,T)})(t.endAt)),k_(e,s,a,i,c,"F",l,h)}function iy(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function oy(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function Od(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Yn(t.unaryFilter.field);return le.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Yn(t.unaryFilter.field);return le.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Yn(t.unaryFilter.field);return le.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Yn(t.unaryFilter.field);return le.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}})(n):n.fieldFilter!==void 0?(function(t){return le.create(Yn(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return ot.create(t.compositeFilter.filters.map((r=>Od(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}})(t.compositeFilter.op))})(n):B(30097,{filter:n})}function ay(n){return K_[n]}function cy(n){return Q_[n]}function uy(n){return Y_[n]}function Qn(n){return{fieldPath:n.canonicalString()}}function Yn(n){return ze.fromServerFormat(n.fieldPath)}function xd(n){return n instanceof le?(function(t){if(t.op==="=="){if(qe(t.value))return{unaryFilter:{field:Qn(t.field),op:"IS_NAN"}};if(We(t.value))return{unaryFilter:{field:Qn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(qe(t.value))return{unaryFilter:{field:Qn(t.field),op:"IS_NOT_NAN"}};if(We(t.value))return{unaryFilter:{field:Qn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Qn(t.field),op:cy(t.op),value:t.value}}})(n):n instanceof ot?(function(t){const r=t.getFilters().map((s=>xd(s)));return r.length===1?r[0]:{compositeFilter:{op:uy(t.op),filters:r}}})(n):B(54877,{filter:n})}function ly(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Ld(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function Md(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function ps(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function Ud(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ji(n){return new J_(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ye(fe.fromBase64String(e))}catch(t){throw new D(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ye(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Ye._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(As(e,Ye._jsonSchema))return Ye.fromBase64String(e.bytes)}}Ye._jsonSchemaVersion="firestore/bytes/1.0",Ye._jsonSchema={type:he("string",Ye._jsonSchemaVersion),bytes:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new D(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ze(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function hy(){return new Xi(lt)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new D(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new D(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return K(this._lat,e._lat)||K(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:pt._jsonSchemaVersion}}static fromJSON(e){if(As(e,pt._jsonSchema))return new pt(e.latitude,e.longitude)}}pt._jsonSchemaVersion="firestore/geoPoint/1.0",pt._jsonSchema={type:he("string",pt._jsonSchemaVersion),latitude:he("number"),longitude:he("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Pe.UNAUTHENTICATED=new Pe(null),Pe.GOOGLE_CREDENTIALS=new Pe("google-credentials-uid"),Pe.FIRST_PARTY=new Pe("first-party-uid"),Pe.MOCK_USER=new Pe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fd{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class dy{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Pe.UNAUTHENTICATED)))}shutdown(){}}class fy{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class py{constructor(e){this.De=e,this.currentUser=Pe.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){U(this.Ce===void 0,42304);let r=this.xe;const s=l=>this.xe!==r?(r=this.xe,t(l)):Promise.resolve();let i=new bt;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),i.resolve(),i=new bt,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const l=i;e.enqueueRetryable((async()=>{await l.promise,await s(this.currentUser)}))},c=l=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),a())};this.De.onInit((l=>c(l))),setTimeout((()=>{if(!this.auth){const l=this.De.getImmediate({optional:!0});l?c(l):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new bt)}}),0),a()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.xe!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(U(typeof r.accessToken=="string",31837,{Oe:r}),new Fd(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return U(e===null||typeof e=="string",2055,{Me:e}),new Pe(e)}}class my{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r,this.type="FirstParty",this.user=Pe.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class gy{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r}getToken(){return Promise.resolve(new my(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable((()=>t(Pe.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Al{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class _y{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Le(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){U(this.Ce===void 0,3512);const r=i=>{i.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.$e;return this.$e=i.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.Ce=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.qe.getImmediate({optional:!0});i?s(i):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.Ke)return Promise.resolve(new Al(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(U(typeof t.token=="string",44558,{tokenResult:t}),this.$e=t.token,new Al(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function Bd(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yy{Qe(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rl="ConnectivityMonitor";class Pl{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){x(Rl,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){x(Rl,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ti=null;function Ta(){return ti===null?ti=(function(){return 268435456+Math.round(2147483648*Math.random())})():ti++,"0x"+ti.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jo="RestConnection",wy={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Ty{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${r}/databases/${s}`,this.tt=this.databaseId.database===wi?`project_id=${r}`:`project_id=${r}&database_id=${s}`}nt(e,t,r,s,i){const a=Ta(),c=this.rt(e,t.toUriEncodedString());x(Jo,`Sending RPC '${e}' ${a}:`,c,r);const l={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(l,s,i);const{host:h}=new URL(c),p=Is(h);return this.st(e,c,l,r,p).then((m=>(x(Jo,`Received RPC '${e}' ${a}: `,m),m)),(m=>{throw it(Jo,`RPC '${e}' ${a} failed with error: `,m,"url: ",c,"request:",r),m}))}_t(e,t,r,s,i,a){return this.nt(e,t,r,s,i)}it(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+hr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}rt(e,t){const r=wy[e];let s=`${this.Xe}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ey{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Re="WebChannelConnection",Fr=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Jn extends Ty{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!Jn.yt){const e=Qh();Fr(e,Kh.STAT_EVENT,(t=>{t.stat===ha.PROXY?x(Re,"STAT_EVENT: detected buffering proxy"):t.stat===ha.NOPROXY&&x(Re,"STAT_EVENT: detected no buffering proxy")})),Jn.yt=!0}}st(e,t,r,s,i){const a=Ta();return new Promise(((c,l)=>{const h=new zh;h.setWithCredentials(!0),h.listenOnce(Gh.COMPLETE,(()=>{try{switch(h.getLastErrorCode()){case ii.NO_ERROR:const m=h.getResponseJson();x(Re,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(m)),c(m);break;case ii.TIMEOUT:x(Re,`RPC '${e}' ${a} timed out`),l(new D(C.DEADLINE_EXCEEDED,"Request time out"));break;case ii.HTTP_ERROR:const T=h.getStatus();if(x(Re,`RPC '${e}' ${a} failed with status:`,T,"response text:",h.getResponseText()),T>0){let b=h.getResponseJson();Array.isArray(b)&&(b=b[0]);const N=b==null?void 0:b.error;if(N&&N.status&&N.message){const M=(function(z){const J=z.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf(J)>=0?J:C.UNKNOWN})(N.status);l(new D(M,N.message))}else l(new D(C.UNKNOWN,"Server responded with status "+h.getStatus()))}else l(new D(C.UNAVAILABLE,"Connection failed."));break;default:B(9055,{wt:e,streamId:a,bt:h.getLastErrorCode(),St:h.getLastError()})}}finally{x(Re,`RPC '${e}' ${a} completed.`)}}));const p=JSON.stringify(s);x(Re,`RPC '${e}' ${a} sending request:`,s),h.send(t,"POST",p,r,15)}))}vt(e,t,r){const s=Ta(),i=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.it(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const h=i.join("");x(Re,`Creating RPC '${e}' stream ${s}: ${h}`,c);const p=a.createWebChannel(h,c);this.Dt(p);let m=!1,T=!1;const b=new Ey({ot:N=>{T?x(Re,`Not sending because RPC '${e}' stream ${s} is closed:`,N):(m||(x(Re,`Opening RPC '${e}' stream ${s} transport.`),p.open(),m=!0),x(Re,`RPC '${e}' stream ${s} sending:`,N),p.send(N))},ut:()=>p.close()});return Fr(p,$r.EventType.OPEN,(()=>{T||(x(Re,`RPC '${e}' stream ${s} transport opened.`),b.Rt())})),Fr(p,$r.EventType.CLOSE,(()=>{T||(T=!0,x(Re,`RPC '${e}' stream ${s} transport closed`),b.Vt(),this.xt(p))})),Fr(p,$r.EventType.ERROR,(N=>{T||(T=!0,it(Re,`RPC '${e}' stream ${s} transport errored. Name:`,N.name,"Message:",N.message),b.Vt(new D(C.UNAVAILABLE,"The operation could not be completed")))})),Fr(p,$r.EventType.MESSAGE,(N=>{var M;if(!T){const L=N.data[0];U(!!L,16349);const z=L,J=(z==null?void 0:z.error)||((M=z[0])==null?void 0:M.error);if(J){x(Re,`RPC '${e}' stream ${s} received error:`,J);const ae=J.status;let Qe=(function(I){const g=ue[I];if(g!==void 0)return Ad(g)})(ae),Ie=J.message;ae==="NOT_FOUND"&&Ie.includes("database")&&Ie.includes("does not exist")&&Ie.includes(this.databaseId.database)&&it(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Qe===void 0&&(Qe=C.INTERNAL,Ie="Unknown error status: "+ae+" with message "+J.message),T=!0,b.Vt(new D(Qe,Ie)),p.close()}else x(Re,`RPC '${e}' stream ${s} received:`,L),b.dt(L)}})),Jn.gt(),setTimeout((()=>{b.At()}),0),b}terminate(){this.ft.forEach((e=>e.close())),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter((t=>t===e))}it(e,t,r){super.it(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Yh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Iy(n){return new Jn(n)}Jn.yt=!1;class qd{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Ct=e,this.timerId=t,this.Ft=r,this.Ot=s,this.Mt=i,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),r=Math.max(0,Date.now()-this.Bt),s=Math.max(0,t-r);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,s,(()=>(this.Bt=Date.now(),e()))),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){this.Lt!==null&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){this.Lt!==null&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sl="PersistentStream";class $d{constructor(e,t,r,s,i,a,c,l){this.Ct=e,this.Kt=r,this.Qt=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new qd(e,t)}Jt(){return this.state===1||this.state===5||this.Yt()}Yt(){return this.state===2||this.state===3}start(){this.jt=0,this.state!==4?this.auth():this.Zt()}async stop(){this.Jt()&&await this.close(0)}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&this.Gt===null&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,(()=>this.tn())))}nn(e){this.rn(),this.stream.send(e)}async tn(){if(this.Yt())return this.close(0)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}async close(e,t){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,e!==4?this.Ht.reset():t&&t.code===C.RESOURCE_EXHAUSTED?(kt(t.toString()),kt("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this._n(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Tt(t)}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.Wt===t&&this.un(r,s)}),(r=>{e((()=>{const s=new D(C.UNKNOWN,"Fetching auth token failed: "+r.message);return this.cn(s)}))}))}un(e,t){const r=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct((()=>{r((()=>this.listener.ct()))})),this.stream.Et((()=>{r((()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,(()=>(this.Yt()&&(this.state=3),Promise.resolve()))),this.listener.Et())))})),this.stream.Tt((s=>{r((()=>this.cn(s)))})),this.stream.onMessage((s=>{r((()=>++this.jt==1?this.hn(s):this.onNext(s)))}))}Zt(){this.state=5,this.Ht.kt((async()=>{this.state=0,this.start()}))}cn(e){return x(Sl,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget((()=>this.Wt===e?t():(x(Sl,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class vy extends $d{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=Z_(this.serializer,e),r=(function(i){if(!("targetChange"in i))return j.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?j.min():a.readTime?ft(a.readTime):j.min()})(e);return this.listener.Tn(t,r)}Pn(e){const t={};t.database=wa(this.serializer),t.addTarget=(function(i,a){let c;const l=a.target;if(c=vn(l)?{pipelineQuery:oy(i,l)}:Id(l)?{documents:ny(i,l)}:{query:ry(i,l).Se},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Vd(i,a.resumeToken);const h=_a(i,a.expectedCount);h!==null&&(c.expectedCount=h)}else if(a.snapshotVersion.compareTo(j.min())>0){c.readTime=Jr(i,a.snapshotVersion.toTimestamp());const h=_a(i,a.expectedCount);h!==null&&(c.expectedCount=h)}return c})(this.serializer,e);const r=iy(this.serializer,e);r&&(t.labels=r),this.nn(t)}In(e){const t={};t.database=wa(this.serializer),t.removeTarget=e,this.nn(t)}}class Ay extends $d{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return U(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,U(!e.writeResults||e.writeResults.length===0,55816),this.listener.Vn()}onNext(e){U(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=ty(e.writeResults,e.commitTime),r=ft(e.commitTime);return this.listener.dn(r,t)}fn(){const e={};e.database=wa(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>ey(this.serializer,r)))};this.nn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ry{}class Py extends Ry{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.mn=!1}pn(){if(this.mn)throw new D(C.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.nt(e,ya(t,r),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new D(C.UNKNOWN,i.toString())}))}_t(e,t,r,s,i){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,c])=>this.connection._t(e,ya(t,r),s,a,c,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new D(C.UNKNOWN,a.toString())}))}terminate(){this.mn=!0,this.connection.terminate()}}function Sy(n,e,t,r){return new Py(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by="ComponentProvider",bl=new Map;function Cy(n,e,t,r,s){return new i_(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Bd(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},jd=41943040;class xe{static withCacheSize(e){return new xe(e,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}xe.DEFAULT_COLLECTION_PERCENTILE=10,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,xe.DEFAULT=new xe(jd,xe.DEFAULT_COLLECTION_PERCENTILE,xe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),xe.DISABLED=new xe(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.gn(r),this.yn=r=>t.writeSequenceNumber(r))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}eo.wn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vy="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Ny{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fr(n){if(n.code!==C.FAILED_PRECONDITION||n.message!==Vy)throw n;x("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new V(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof V?t:V.resolve(t)}catch(t){return V.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):V.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):V.reject(t)}static resolve(e){return new V(((t,r)=>{t(e)}))}static reject(e){return new V(((t,r)=>{r(e)}))}static waitFor(e){return new V(((t,r)=>{let s=0,i=0,a=!1;e.forEach((c=>{++s,c.next((()=>{++i,a&&i===s&&t()}),(l=>r(l)))})),a=!0,i===s&&t()}))}static or(e){let t=V.resolve(!1);for(const r of e)t=t.next((s=>s?V.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new V(((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let l=0;l<i;l++){const h=l;t(e[h]).next((p=>{a[h]=p,++c,c===i&&r(a)}),(p=>s(p)))}}))}static doWhile(e,t){return new V(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}function ky(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function pr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vl="LruGarbageCollector",Dy=1048576;function Nl([n,e],[t,r]){const s=K(n,t);return s===0?K(e,r):s}class Oy{constructor(e){this.Yn=e,this.buffer=new de(Nl),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Nl(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class xy{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.tr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return this.tr!==null}nr(e){x(Vl,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){pr(t)?x(Vl,"Ignoring IndexedDB error during garbage collection: ",t):await fr(t)}await this.nr(3e5)}))}}class Ly{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return V.resolve(eo.wn);const r=new Oy(t);return this.rr.forEachTarget(e,(s=>r.er(s.sequenceNumber))).next((()=>this.rr.sr(e,(s=>r.er(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.rr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(x("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(Cl)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(x("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Cl):this._r(e,t)))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let r,s,i,a,c,l,h;const p=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((m=>(m>this.params.maximumSequenceNumbersToCollect?(x("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,a=Date.now(),this.nthSequenceNumber(e,s)))).next((m=>(r=m,c=Date.now(),this.removeTargets(e,r,t)))).next((m=>(i=m,l=Date.now(),this.removeOrphanedDocuments(e,r)))).next((m=>(h=Date.now(),zn()<=Q.DEBUG&&x("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${m} documents in `+(h-l)+`ms
Total Duration: ${h-p}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m}))))}}function My(n,e){return new Ly(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hd="firestore.googleapis.com",kl=!0;class Dl{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new D(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Hd,this.ssl=kl}else this.host=e.host,this.ssl=e.ssl??kl;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=jd;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Dy)throw new D(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(n_("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Bd(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new D(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new D(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new D(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new D(C.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),a=Object.keys(s);if(i.length!==a.length)return!1;for(const c of i)if(r[c]!==s[c])return!1;return!0})(this._customHeaders,e._customHeaders)}}let to=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Dl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new D(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Dl(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new dy;switch(r.type){case"firstParty":return new gy(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new D(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=bl.get(t);r&&(x(by,"Removing Datastore"),bl.delete(t),r.terminate())})(this),Promise.resolve()}};function Uy(n,e,t,r={}){var h;n=Ge(n,to);const s=Is(e),i=n._getSettings(),a={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&$h(`https://${c}`),i.host!==Hd&&i.host!==c&&it("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:s,emulatorOptions:r};if(!kn(l,a)&&(n._setSettings(l),r.mockUserToken)){let p,m;if(typeof r.mockUserToken=="string")p=r.mockUserToken,m=Pe.MOCK_USER;else{p=Mm(r.mockUserToken,(h=n._app)==null?void 0:h.options.projectId);const T=r.mockUserToken.sub||r.mockUserToken.user_id;if(!T)throw new D(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new Pe(T)}n._authCredentials=new fy(new Fd(p,m))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Lt(this.firestore,e,this._query)}}class ie{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Xt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ie(this.firestore,e,this._key)}toJSON(){return{type:ie._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(As(t,ie._jsonSchema))return new ie(e,r||null,new F(X.fromString(t.referencePath)))}}ie._jsonSchemaVersion="firestore/documentReference/1.0",ie._jsonSchema={type:he("string",ie._jsonSchemaVersion),referencePath:he("string")};class Xt extends Lt{constructor(e,t,r){super(e,t,Qi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ie(this.firestore,null,new F(e))}withConverter(e){return new Xt(this.firestore,e,this._path)}}function zR(n,e,...t){if(n=oe(n),Zh("collection","path",e),n instanceof to){const r=X.fromString(e,...t);return il(r),new Xt(n,null,r)}{if(!(n instanceof ie||n instanceof Xt))throw new D(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(e,...t));return il(r),new Xt(n.firestore,null,r)}}function GR(n,e,...t){if(n=oe(n),arguments.length===1&&(e=La.newId()),Zh("doc","path",e),n instanceof to){const r=X.fromString(e,...t);return sl(r),new ie(n,null,new F(r))}{if(!(n instanceof ie||n instanceof Xt))throw new D(C.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(X.fromString(e,...t));return sl(r),new ie(n.firestore,n instanceof Xt?n.converter:null,new F(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Ue._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(As(e,Ue._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Ue(e.vectorValues);throw new D(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ue._jsonSchemaVersion="firestore/vectorValue/1.0",Ue._jsonSchema={type:he("string",Ue._jsonSchemaVersion),vectorValues:he("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fy=/^__.*__$/;class By{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new mn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Ps(e,this.data,t,this.fieldTransforms)}}class Wd{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new mn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function zd(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:n})}}class za{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new za({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Si(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(zd(this.dataSource)&&Fy.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class qy{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ji(e)}createContext(e,t,r,s=!1){return new za({dataSource:e,methodName:t,targetDoc:r,path:ze.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ga(n){const e=n._freezeSettings(),t=Ji(n._databaseId);return new qy(n._databaseId,!!e.ignoreUndefinedProperties,t)}function $y(n,e,t,r,s,i={}){const a=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);Qa("Data must be an object, but it was:",a,r);const c=Gd(r,a);let l,h;if(i.merge)l=new He(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const p=[];for(const m of i.mergeFields){const T=Dn(e,m,t);if(!a.contains(T))throw new D(C.INVALID_ARGUMENT,`Field '${T}' is specified in your field mask but missing from your input data.`);Jd(p,T)||p.push(T)}l=new He(p),h=a.fieldTransforms.filter((m=>l.covers(m.field)))}else l=null,h=a.fieldTransforms;return new By(new De(c),l,h)}class no extends Zi{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof no}}class Ka extends Zi{_toFieldTransform(e){return new f_(e.path,new cs)}isEqual(e){return e instanceof Ka}}function jy(n,e,t,r){const s=n.createContext(1,e,t);Qa("Data must be an object, but it was:",s,r);const i=[],a=De.empty();pn(r,((l,h)=>{const p=Yd(e,l,t);h=oe(h);const m=s.childContextForFieldPath(p);if(h instanceof no)i.push(p);else{const T=an(h,m);T!=null&&(i.push(p),a.set(p,T))}}));const c=new He(i);return new Wd(a,c,s.fieldTransforms)}function Hy(n,e,t,r,s,i){const a=n.createContext(1,e,t),c=[Dn(e,r,t)],l=[s];if(i.length%2!=0)throw new D(C.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let T=0;T<i.length;T+=2)c.push(Dn(e,i[T])),l.push(i[T+1]);const h=[],p=De.empty();for(let T=c.length-1;T>=0;--T)if(!Jd(h,c[T])){const b=c[T];let N=l[T];N=oe(N);const M=a.childContextForFieldPath(b);if(N instanceof no)h.push(b);else{const L=an(N,M);L!=null&&(h.push(b),p.set(b,L))}}const m=new He(h);return new Wd(p,m,a.fieldTransforms)}function Wy(n,e,t,r=!1){return an(t,n.createContext(r?4:3,e))}function an(n,e,t){if(Qd(n=oe(n)))return Qa("Unsupported field value:",e,n),Gd(n,e);if(n instanceof Zi)return(function(s,i){if(!zd(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let c=0;for(const l of s){let h=an(l,i.childContextForArray(c));h==null&&(h={nullValue:"NULL_VALUE"}),a.push(h),c++}return{arrayValue:{values:a}}})(n,e)}return(function(s,i,a){if((s=oe(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Fa(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=Z.fromDate(s);return{timestampValue:Jr(i.serializer,c)}}if(s instanceof Z){const c=new Z(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Jr(i.serializer,c)}}if(Kd(s)){const c=Z.fromInstant(s),l=new Z(c.seconds,1e3*Math.floor(c.nanoseconds/1e3));return{timestampValue:Jr(i.serializer,l)}}if(s instanceof pt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Ye)return{bytesValue:Vd(i.serializer,s._byteString)};if(s instanceof ie){const c=i.databaseId,l=s.firestore._databaseId;if(!l.isEqual(c))throw i.createError(`Document reference is for database ${l.projectId}/${l.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:Wa(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Ue)return(function(l,h){const p=l instanceof Ue?l.toArray():l;return{mapValue:{fields:{[id]:{stringValue:od},[os]:{arrayValue:{values:p.map((T=>{if(typeof T!="number")throw h.createError("VectorValues must only contain numeric values.");return zi(h.serializer,T)}))}}}}}})(s,i);if(Md(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${ji(s)}`)})(n,e)}function Gd(n,e){const t={};return Xh(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):pn(n,((r,s)=>{const i=an(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function Kd(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.t=="bigint"}function Qd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof Z||n instanceof pt||n instanceof Ye||n instanceof ie||n instanceof Zi||n instanceof Ue||Kd(n)||Md(n))}function Qa(n,e,t){if(!Qd(t)||!vs(t)){const r=ji(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Dn(n,e,t){if((e=oe(e))instanceof Xi)return e._internalPath;if(typeof e=="string")return Yd(n,e);throw Si("Field path arguments must be of type string or ",n,!1,void 0,t)}const zy=new RegExp("[~\\*/\\[\\]]");function Yd(n,e,t){if(e.search(zy)>=0)throw Si(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Xi(...e.split("."))._internalPath}catch{throw Si(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Si(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${r}`),a&&(l+=` in document ${s}`),l+=")"),new D(C.INVALID_ARGUMENT,c+n+l)}function Jd(n,e){return n.some((t=>t.isEqual(e)))}function Xd(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=De.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const a=e[s];let c;i.nestedOptions&&vs(a)?c={mapValue:{fields:new Ce(i.nestedOptions).getOptionsProto(t,a)}}:a&&(c=an(a,t)??void 0),c&&r.set(ze.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(t_(r,((a,c)=>[ze.fromServerFormat(c),a!==void 0?an(a,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gy(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!vs(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function KR(){return new Ka("serverTimestamp")}function Ky(n){return new Ue(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(n){let e;return n instanceof qn?n:(e=vs(n)?Zy(n):n instanceof Array?ew(n):Zd(n,void 0),e)}function Xo(n){if(n instanceof qn)return n;if(n instanceof Ue)return ms(n);if(Array.isArray(n))return ms(Ky(n));throw new Error("Unsupported value: "+typeof n)}function Ya(n){return c_(n)?li(n):k(n)}class qn{constructor(){this._protoValueType="ProtoValue"}add(e){return new S("add",[this,k(e)],"add")}asBoolean(){if(this instanceof cn)return this;if(this instanceof gr)return new tf(this);if(this instanceof mr)return new Xy(this);if(this instanceof S)return new ef(this);throw new D("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new S("subtract",[this,k(e)],"subtract")}multiply(e){return new S("multiply",[this,k(e)],"multiply")}divide(e){return new S("divide",[this,k(e)],"divide")}mod(e){return new S("mod",[this,k(e)],"mod")}equal(e){return new S("equal",[this,k(e)],"equal").asBoolean()}notEqual(e){return new S("not_equal",[this,k(e)],"notEqual").asBoolean()}lessThan(e){return new S("less_than",[this,k(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new S("less_than_or_equal",[this,k(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new S("greater_than",[this,k(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new S("greater_than_or_equal",[this,k(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>k(s)));return new S("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new S("array_contains",[this,k(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Hr(e.map(k),"arrayContainsAll"):e;return new S("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Hr(e.map(k),"arrayContainsAny"):e;return new S("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new S("array_reverse",[this])}arrayLength(){return new S("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Hr(e.map(k),"equalAny"):e;return new S("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Hr(e.map(k),"notEqualAny"):e;return new S("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new S("exists",[this],"exists").asBoolean()}charLength(){return new S("char_length",[this],"charLength")}like(e){return new S("like",[this,k(e)],"like").asBoolean()}regexContains(e){return new S("regex_contains",[this,k(e)],"regexContains").asBoolean()}regexFind(e){return new S("regex_find",[this,k(e)],"regexFind")}regexFindAll(e){return new S("regex_find_all",[this,k(e)],"regexFindAll")}regexMatch(e){return new S("regex_match",[this,k(e)],"regexMatch").asBoolean()}stringContains(e){return new S("string_contains",[this,k(e)],"stringContains").asBoolean()}startsWith(e){return new S("starts_with",[this,k(e)],"startsWith").asBoolean()}endsWith(e){return new S("ends_with",[this,k(e)],"endsWith").asBoolean()}toLower(){return new S("to_lower",[this],"toLower")}toUpper(){return new S("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(k(e)),new S("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(k(e)),new S("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(k(e)),new S("rtrim",t,"rtrim")}type(){return new S("type",[this])}isType(e){return new S("is_type",[this,ms(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(k);return new S("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new S("string_index_of",[this,k(e)],"stringIndexOf")}stringRepeat(e){return new S("string_repeat",[this,k(e)],"stringRepeat")}stringReplaceAll(e,t){return new S("string_replace_all",[this,k(e),k(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new S("string_replace_one",[this,k(e),k(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(k);return new S("concat",[this,...r],"concat")}reverse(){return new S("reverse",[this],"reverse")}arrayFilter(e,t){return new S("array_filter",[this,k(e),t],"arrayFilter")}arrayTransform(e,t){return new S("array_transform",[this,k(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new S("array_transform",[this,k(e),k(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,k(e)];return t!==void 0&&r.push(k(t)),new S("array_slice",r,"arraySlice")}arrayFirst(){return new S("array_first",[this],"arrayFirst")}arrayFirstN(e){return new S("array_first_n",[this,k(e)],"arrayFirstN")}arrayLast(){return new S("array_last",[this],"arrayLast")}arrayLastN(e){return new S("array_last_n",[this,k(e)],"arrayLastN")}arrayMaximum(){return new S("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new S("maximum_n",[this,k(e)],"arrayMaximumN")}arrayMinimum(){return new S("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new S("minimum_n",[this,k(e)],"arrayMinimumN")}arrayIndexOf(e){return new S("array_index_of",[this,k(e),k("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new S("array_index_of",[this,k(e),k("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new S("array_index_of_all",[this,k(e)],"arrayIndexOfAll")}byteLength(){return new S("byte_length",[this],"byteLength")}ceil(){return new S("ceil",[this])}floor(){return new S("floor",[this])}abs(){return new S("abs",[this])}exp(){return new S("exp",[this])}mapGet(e){return new S("map_get",[this,ms(e)],"mapGet")}mapSet(e,t,...r){const s=[this,k(e),k(t),...r.map(k)];return new S("map_set",s,"mapSet")}mapKeys(){return new S("map_keys",[this],"mapKeys")}mapValues(){return new S("map_values",[this],"mapValues")}mapEntries(){return new S("map_entries",[this],"mapEntries")}getField(e){return new S("get_field",[this,k(e)],"get_field")}count(){return je._create("count",[this],"count")}sum(){return je._create("sum",[this],"sum")}average(){return je._create("average",[this],"average")}minimum(){return je._create("minimum",[this],"minimum")}maximum(){return je._create("maximum",[this],"maximum")}first(){return je._create("first",[this],"first")}last(){return je._create("last",[this],"last")}arrayAgg(){return je._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return je._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return je._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new S("maximum",[this,...r.map(k)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new S("minimum",[this,...r.map(k)],"minimum")}vectorLength(){return new S("vector_length",[this],"vectorLength")}cosineDistance(e){return new S("cosine_distance",[this,Xo(e)],"cosineDistance")}dotProduct(e){return new S("dot_product",[this,Xo(e)],"dotProduct")}euclideanDistance(e){return new S("euclidean_distance",[this,Xo(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new S("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new S("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new S("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new S("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new S("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new S("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new S("timestamp_add",[this,k(e),k(t)],"timestampAdd")}timestampSubtract(e,t){return new S("timestamp_subtract",[this,k(e),k(t)],"timestampSubtract")}timestampDiff(e,t){return new S("timestamp_diff",[this,Ya(e),k(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,k(e)];return t&&r.push(k(t)),new S("timestamp_extract",r,"timestampExtract")}documentId(){return new S("document_id",[this],"documentId")}parent(){return new S("parent",[this],"parent")}substring(e,t){const r=k(e);return new S("substring",t===void 0?[this,r]:[this,r,k(t)],"substring")}arrayGet(e){return new S("array_get",[this,k(e)],"arrayGet")}isError(){return new S("is_error",[this],"isError").asBoolean()}ifError(e){const t=new S("if_error",[this,k(e)],"ifError");return e instanceof cn?t.asBoolean():t}isAbsent(){return new S("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new S("map_remove",[this,k(e)],"mapRemove")}mapMerge(e,...t){const r=k(e),s=t.map(k);return new S("map_merge",[this,r,...s],"mapMerge")}pow(e){return new S("pow",[this,k(e)])}trunc(e){return e===void 0?new S("trunc",[this]):new S("trunc",[this,k(e)],"trunc")}round(e){return e===void 0?new S("round",[this]):new S("round",[this,k(e)],"round")}collectionId(){return new S("collection_id",[this])}length(){return new S("length",[this])}ln(){return new S("ln",[this])}sqrt(){return new S("sqrt",[this])}stringReverse(){return new S("string_reverse",[this])}ifAbsent(e){return new S("if_absent",[this,k(e)],"ifAbsent")}ifNull(e){return new S("if_null",[this,k(e)],"ifNull")}coalesce(e,...t){return new S("coalesce",[this,k(e),...t.map(k)],"coalesce")}join(e){return new S("join",[this,k(e)],"join")}log10(){return new S("log10",[this])}arraySum(){return new S("sum",[this])}split(e){return new S("split",[this,k(e)])}timestampTruncate(e,t){const r=[this,k(e)];return t&&r.push(k(t)),new S("timestamp_trunc",r)}ascending(){return tw(this)}descending(){return nw(this)}as(e){return new Yy(this,e,"as")}}class je{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new je(e,t);return s._methodName=r,s}as(e){return new Qy(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Qy{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class Yy{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Hr extends qn{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map((t=>t._toProto(e)))}}}_readUserData(e){this.cr.forEach((t=>t._readUserData(e)))}}class mr extends qn{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new S("geo_distance",[this,k(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function li(n){return Jy(n,"field")}function Jy(n,e){return new mr(typeof n=="string"?lt===n?hy()._internalPath:Dn("field",n):n._internalPath,e)}class gr extends qn{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new gr(e,void 0);return t._protoValue=e,t}_toProto(e){return U(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,Gy(this._protoValue)||(this._protoValue=an(this.value,e))}}function ms(n,e){return Zd(n,"constant")}function Zd(n,e){const t=new gr(n,e);return typeof n=="boolean"?new tf(t):t}class S extends qn{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Ce({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class cn extends qn{get _methodName(){return this._expr._methodName}countIf(){return je._create("count_if",[this],"countIf")}not(){return new S("not",[this],"not").asBoolean()}conditional(e,t){return new S("conditional",[this,e,t],"conditional")}ifError(e){const t=k(e),r=new S("if_error",[this,t],"ifError");return t instanceof cn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class ef extends cn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class tf extends cn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Xy extends cn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Zy(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(ms(r)),t.push(k(s))}return new S("map",t,"map")}function ew(n){return(function(t,r){return new S("array",t.map((s=>k(s))),r)})(n,"array")}function tw(n){return new nf(Ya(n),"ascending","ascending")}function nw(n){return new nf(Ya(n),"descending","descending")}class nf{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Ud(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class rf extends Ke{get _name(){return"add_fields"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[ps(e,this.fields)]}}_readUserData(e){super._readUserData(e),un(this.fields,e)}}class sf extends Ke{get _name(){return"aggregate"}get _optionsUtil(){return new Ce({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[ps(e,this.accumulators),ps(e,this.groups)]}}_readUserData(e){super._readUserData(e),un(this.groups,e),un(this.accumulators,e)}}class of extends Ke{get _name(){return"distinct"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[ps(e,this.groups)]}}_readUserData(e){super._readUserData(e),un(this.groups,e)}}class ro extends Ke{get _name(){return"collection"}get _optionsUtil(){return new Ce({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.hr}]}}_readUserData(e){super._readUserData(e)}}class so extends Ke{get _name(){return"collection_group"}get _optionsUtil(){return new Ce({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Ja extends Ke{get _name(){return"database"}get _optionsUtil(){return new Ce({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Xa extends Ke{get _name(){return"documents"}get _optionsUtil(){return new Ce({})}constructor(e,t){if(super(t),!e||e.length===0)throw new D(C.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new D(C.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=r,this.Pr=s}_toProto(e){return{...super._toProto(e),args:this.Tr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class io extends Ke{get _name(){return"where"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),un(this.condition,e)}}class On extends Ke{get _name(){return"limit"}get _optionsUtil(){return new Ce({})}constructor(e,t){U(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Fa(e,this.limit)]}}}class Ol extends Ke{get _name(){return"offset"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Fa(e,this.offset)]}}}class rw extends Ke{get _name(){return"select"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[ps(e,this.selections)]}}_readUserData(e){super._readUserData(e),un(this.selections,e)}}class At extends Ke{get _name(){return"sort"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),un(this.orderings,e)}}class Za extends Ke{get _name(){return"replace_with"}get _optionsUtil(){return new Ce({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Ud(Za.Ir)]}}_readUserData(e){super._readUserData(e),un(this.map,e)}}Za.Ir="full_replace";function un(n,e){return Xd(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}Vr(e,t){const r=this.userDataReader.createContext(3,e);return Xd(t)?t._readUserData(r):Array.isArray(t)?t.forEach((s=>s._readUserData(r))):t.forEach((s=>s._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.Vr("where",e),t.push(new io(e,{})),new Xr(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new On(e,{})),new Xr(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((s=>s));return"orderings"in e?r.push(new At(this.Vr("sort",e.orderings),{})):r.push(new At(this.Vr("sort",[e,...t]),{})),new Xr(this._db,this.userDataReader,this._userDataWriter,r)}dr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class ke{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return oo(this)}getPipelineCollectionGroup(){return ec(this)}getPipelineCollectionId(){return sw(this)}getPipelineDocuments(){return Ea(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==of.name&&s._name!==sf.name||(r="keyless"),s._name===rw.name&&r==="exact"&&(r="augmented"),s._name===rf.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return Zt(this)}}function Zt(n){const e=n.stages[0];return e instanceof ro||e instanceof so||e instanceof Ja||e instanceof Xa?e._name:"unknown"}function oo(n){if(Zt(n)==="collection")return n.stages[0].hr}function ec(n){if(Zt(n)==="collection_group")return n.stages[0].collectionId}function sw(n){switch(Zt(n)){case"collection":return X.fromString(oo(n)).lastSegment();case"collection_group":return ec(n);default:return}}function Ea(n){if(Zt(n)==="documents")return n.stages[0].Tr}class w{constructor(e,t){this.type=e,this.value=t}static mr(){return new w("ERROR",void 0)}static pr(){return new w("UNSET",void 0)}static gr(){return new w("NULL",nr)}static newValue(e){return We(e)?new w("NULL",nr):(function(r){return!!r&&"booleanValue"in r})(e)?new w("BOOLEAN",e):ht(e)?new w("INT",e):An(e)?new w("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new w("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new w("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new w("BYTES",e):e.referenceValue?new w("REFERENCE",e):e.geoPointValue?new w("GEO_POINT",e):sr(e)?new w("ARRAY",e):Ti(e)?new w("VECTOR",e):Sn(e)?new w("MAP",e):new w("ERROR",void 0)}yr(){return this.type==="ERROR"||this.type==="UNSET"}wr(){return this.type==="NULL"}}function Zr(n){if(!n.yr())return n.value}function af(n){return n instanceof cn?n._expr:n}function q(n){if((n=af(n))instanceof mr)return new iw(n);if(n instanceof gr)return new ow(n);if(n instanceof Hr)return new aw(n);if(n instanceof S){if(n.name==="add")return new lw(n);if(n.name==="subtract")return new hw(n);if(n.name==="multiply")return new dw(n);if(n.name==="divide")return new fw(n);if(n.name==="mod")return new pw(n);if(n.name==="and")return new mw(n);if(n.name==="equal")return new Sw(n);if(n.name==="not_equal")return new bw(n);if(n.name==="less_than")return new Cw(n);if(n.name==="less_than_or_equal")return new Vw(n);if(n.name==="greater_than")return new Nw(n);if(n.name==="greater_than_or_equal")return new kw(n);if(n.name==="array_concat")return new Dw(n);if(n.name==="array_reverse")return new Ow(n);if(n.name==="array_contains")return new xw(n);if(n.name==="array_contains_all")return new Lw(n);if(n.name==="array_contains_any")return new Mw(n);if(n.name==="array_length")return new Uw(n);if(n.name==="array_element")return new Fw(n);if(n.name==="equal_any")return new cf(n);if(n.name==="not_equal_any")return new _w(n);if(n.name==="is_nan")return new yw(n);if(n.name==="is_not_nan")return new ww(n);if(n.name==="is_null")return new Tw(n);if(n.name==="is_not_null")return new Ew(n);if(n.name==="is_error")return new Iw(n);if(n.name==="exists")return new vw(n);if(n.name==="not")return new ao(n);if(n.name==="or")return new gw(n);if(n.name==="xor")return new tc(n);if(n.name==="conditional")return new Aw(n);if(n.name==="maximum")return new Rw(n);if(n.name==="minimum")return new Pw(n);if(n.name==="reverse")return new Bw(n);if(n.name==="replace_first")return new qw(n);if(n.name==="replace_all")return new $w(n);if(n.name==="char_length")return new jw(n);if(n.name==="byte_length")return new Hw(n);if(n.name==="like")return new Ww(n);if(n.name==="regex_contains")return new zw(n);if(n.name==="regex_match")return new Gw(n);if(n.name==="string_contains")return new Kw(n);if(n.name==="starts_with")return new Qw(n);if(n.name==="ends_with")return new Yw(n);if(n.name==="to_lower")return new Jw(n);if(n.name==="to_upper")return new Xw(n);if(n.name==="trim")return new Zw(n);if(n.name==="string_concat")return new eT(n);if(n.name==="map_get")return new tT(n);if(n.name==="cosine_distance")return new nT(n);if(n.name==="dot_product")return new rT(n);if(n.name==="euclidean_distance")return new sT(n);if(n.name==="vector_length")return new iT(n);if(n.name==="unix_micros_to_timestamp")return new lT(n);if(n.name==="timestamp_to_unix_micros")return new fT(n);if(n.name==="unix_millis_to_timestamp")return new hT(n);if(n.name==="timestamp_to_unix_millis")return new pT(n);if(n.name==="unix_seconds_to_timestamp")return new dT(n);if(n.name==="timestamp_to_unix_seconds")return new mT(n);if(n.name==="timestamp_add")return new gT(n);if(n.name==="timestamp_subtract")return new _T(n)}throw new Error(`Unknown Expr : ${n}`)}class iw{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===lt)return w.newValue({referenceValue:Pi(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return w.newValue({timestampValue:ui(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return w.newValue({timestampValue:ui(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Hi(r)?w.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:ui(i.serializer,j.fromTimestamp(tr(a)))};if(i.serverTimestampBehavior==="previous"){const c=Rs(a);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):w.newValue(r):w.pr()}}class ow{constructor(e){this.expr=e}evaluate(e,t){return w.newValue(this.expr._getValue())}}class aw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.cr.map((s=>q(s).evaluate(e,t)));return r.some((s=>s.yr()))?w.mr():w.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function Ee(n){return An(n)?Number(n.doubleValue):Number(n.integerValue)}function yt(n){return BigInt(n.integerValue)}const cw=BigInt("0x7fffffffffffffff"),uw=-BigInt("0x8000000000000000");class Cs{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length>=2,24778);const r=q(this.expr.params[0]).evaluate(e,t),s=q(this.expr.params[1]).evaluate(e,t);let i=this.br(r,s);for(const a of this.expr.params.slice(2)){const c=q(a).evaluate(e,t);i=this.br(i,c)}return i}br(e,t){if(e.yr()||t.yr())return w.mr();if(e.wr()||t.wr())return w.gr();const r=e.value,s=t.value;if(!An(r)&&!ht(r)||!An(s)&&!ht(s))return w.mr();if(An(r)||An(s)){const i=this.Sr(r,s);return i?w.newValue(i):w.mr()}if(ht(r)&&ht(s)){const i=this.vr(r,s);return i===void 0?w.mr():typeof i=="number"?w.newValue({doubleValue:i}):i<uw||i>cw?w.mr():w.newValue({integerValue:`${i}`})}return w.mr()}}function Dt(n,e){return pe(n)!==pe(e)?"TYPE_MISMATCH":qe(n)||qe(e)?"NOT_EQ":We(n)&&We(e)?"EQ":We(n)||We(e)?"NULL":sr(n)&&sr(e)?(function(r,s){var a,c,l;if(((a=r.values)==null?void 0:a.length)!==((c=s.values)==null?void 0:c.length))return"NOT_EQ";let i=!1;for(let h=0;h<(((l=r.values)==null?void 0:l.length)??0);h++){const p=r.values[h],m=s.values[h];switch(Dt(p,m)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Dr:p,Cr:m})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):Ti(n)&&Ti(e)||Sn(n)&&Sn(e)?(function(r,s){const i=r.fields||{},a=s.fields||{};if(yi(i)!==yi(a))return"NOT_EQ";let c=!1;for(const l in i)if(i.hasOwnProperty(l)){if(a[l]===void 0)return"NOT_EQ";switch(Dt(i[l],a[l])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return Xe(r,s,{u:!1,i:!0,o:!0})})(n,e)?"EQ":"NOT_EQ"}class lw extends Cs{vr(e,t){return yt(e)+yt(t)}Sr(e,t){return{doubleValue:Ee(e)+Ee(t)}}}class hw extends Cs{constructor(e){super(e),this.expr=e}vr(e,t){return yt(e)-yt(t)}Sr(e,t){return{doubleValue:Ee(e)-Ee(t)}}}class dw extends Cs{constructor(e){super(e),this.expr=e}vr(e,t){return yt(e)*yt(t)}Sr(e,t){return{doubleValue:Ee(e)*Ee(t)}}}class fw extends Cs{constructor(e){super(e),this.expr=e}vr(e,t){const r=yt(t);if(r!==BigInt(0))return yt(e)/r}Sr(e,t){const r=Ee(t);return r===0?{doubleValue:is(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Ee(e)/r}}}class pw extends Cs{constructor(e){super(e),this.expr=e}vr(e,t){const r=yt(t);if(r!==BigInt(0))return yt(e)%r}Sr(e,t){const r=Ee(t);if(r!==0)return{doubleValue:Ee(e)%r}}}class mw{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((i=c.value)!=null&&i.booleanValue))return w.newValue(we);break;case"NULL":s=!0;break;default:r=!0}}return r?w.mr():s?w.gr():w.newValue(Fe)}}class ao{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,9634);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return w.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return w.gr();default:return w.mr()}}}class gw{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":if((i=c.value)!=null&&i.booleanValue)return w.newValue(Fe);break;case"NULL":s=!0;break;default:r=!0}}return r?w.mr():s?w.gr():w.newValue(we)}}class tc{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const a of this.expr.params){const c=q(a).evaluate(e,t);switch(c.type){case"BOOLEAN":r=tc.xor(r,!!((i=c.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return w.mr()}}return s?w.gr():w.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class cf{constructor(e){this.expr=e}evaluate(e,t){var a,c;U(this.expr.params.length===2,55094);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.mr()}if(r)return w.gr();for(const l of((c=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:c.values)??[])switch(We(s.value)&&We(l)?"EQ":Dt(s.value,l)){case"EQ":return w.newValue(Fe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:s.value,candidate:l})}return r?w.gr():w.newValue(we)}}class _w{constructor(e){this.expr=e}evaluate(e,t){return new ao(new S("not",[new S("equal_any",this.expr.params)])).evaluate(e,t)}}class yw{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,23322);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return w.newValue(we);case"DOUBLE":return w.newValue({booleanValue:isNaN(Ee(r.value))});case"NULL":return w.gr();default:return w.mr()}}}class ww{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,50406),new ao(new S("not",[new S("is_nan",this.expr.params)])).evaluate(e,t)}}class Tw{constructor(e){this.expr=e}evaluate(e,t){switch(U(this.expr.params.length===1,23123),q(this.expr.params[0]).evaluate(e,t).type){case"NULL":return w.newValue(Fe);case"UNSET":case"ERROR":return w.mr();default:return w.newValue(we)}}}class Ew{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,23167),new ao(new S("not",[new S("is_null",this.expr.params)])).evaluate(e,t)}}class Iw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===1,5228),q(this.expr.params[0]).evaluate(e,t).type==="ERROR"?w.newValue(Fe):w.newValue(we)}}class vw{constructor(e){this.expr=e}evaluate(e,t){switch(U(this.expr.params.length===1,6877),q(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return w.mr();case"UNSET":return w.newValue(we);default:return w.newValue(Fe)}}}class Aw{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===3,11706);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?q(this.expr.params[1]).evaluate(e,t):q(this.expr.params[2]).evaluate(e,t);case"NULL":return q(this.expr.params[2]).evaluate(e,t);default:return w.mr()}}}class Rw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Be(i.value,s.value)>0?i:s}return s===void 0?w.gr():s}}class Pw{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>q(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Be(i.value,s.value)<0?i:s}return s===void 0?w.gr():s}}class _r{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return w.mr()}const s=q(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return w.mr()}return this.Fr(r,s)}}class Sw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return w.newValue(Fe);if(e.wr()||t.wr()||qe(e.value)||qe(t.value)||pe(e.value)!==pe(t.value))return w.newValue(we);switch(Dt(e.value,t.value)){case"EQ":return w.newValue(Fe);case"NOT_EQ":return w.newValue(we);case"NULL":return w.gr();default:B(44615,{left:e,right:t})}}}class bw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){switch(Dt(e.value,t.value)){case"EQ":return w.newValue(we);case"NOT_EQ":case"TYPE_MISMATCH":return w.newValue(Fe);case"NULL":return w.gr();default:B(44614,{left:e,right:t})}}}class Cw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){return pe(e.value)!==pe(t.value)||qe(e.value)||qe(t.value)?w.newValue(we):w.newValue({booleanValue:Be(e.value,t.value)<0})}}class Vw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){return pe(e.value)!==pe(t.value)||qe(e.value)||qe(t.value)?w.newValue(we):Dt(e.value,t.value)==="EQ"?w.newValue(Fe):w.newValue({booleanValue:Be(e.value,t.value)<0})}}class Nw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){return pe(e.value)!==pe(t.value)||qe(e.value)||qe(t.value)?w.newValue(we):w.newValue({booleanValue:Be(e.value,t.value)>0})}}class kw extends _r{constructor(e){super(e),this.expr=e}Fr(e,t){return pe(e.value)!==pe(t.value)||qe(e.value)||qe(t.value)?w.newValue(we):Dt(e.value,t.value)==="EQ"?w.newValue(Fe):w.newValue({booleanValue:Be(e.value,t.value)>0})}}class Dw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Ow{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,216);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.gr();case"ARRAY":{const i=((s=r.value.arrayValue)==null?void 0:s.values)??[];return w.newValue({arrayValue:{values:[...i].reverse()}})}default:return w.mr()}}}class xw{constructor(e){this.expr=e}evaluate(e,t){return U(this.expr.params.length===2,52884),new cf(new S("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Lw{constructor(e){this.expr=e}evaluate(e,t){var l,h,p,m;U(this.expr.params.length===2,1392);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.mr()}if(r)return w.gr();const a=((h=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[],c=((m=(p=s.value)==null?void 0:p.arrayValue)==null?void 0:m.values)??[];for(const T of a){let b=!1;r=!1;for(const N of c){switch(We(T)&&We(N)?"EQ":Dt(T,N)){case"EQ":b=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44613,{value:N,search:T})}if(b)break}if(!b)return w.newValue(we)}return w.newValue(Fe)}}class Mw{constructor(e){this.expr=e}evaluate(e,t){var l,h,p,m;U(this.expr.params.length===2,2680);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.mr()}if(r)return w.gr();const a=((h=(l=i.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[],c=((m=(p=s.value)==null?void 0:p.arrayValue)==null?void 0:m.values)??[];for(const T of c)for(const b of a)switch(We(T)&&We(b)?"EQ":Dt(T,b)){case"EQ":return w.newValue(Fe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(60403,{value:T,search:b})}return r?w.gr():w.newValue(we)}}class Uw{constructor(e){this.expr=e}evaluate(e,t){var s,i,a;U(this.expr.params.length===1,38605);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.gr();case"ARRAY":return w.newValue({integerValue:`${((a=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)??0}`});default:return w.mr()}}}class Fw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Bw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,1508);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.gr();case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const c=fe.fromBase64String(a).toUint8Array();return c.reverse(),w.newValue({bytesValue:fe.fromUint8Array(c).toBase64()})}return w.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=r.value)==null?void 0:i.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),l=Array.from(c,(h=>h.segment)).reverse();return w.newValue({stringValue:l.join("")})}default:return w.mr()}}}class qw{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class $w{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class jw{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,19400);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.gr();case"STRING":{const s=(function(a){let c=0;for(let l=0;l<a.length;l++){const h=a.codePointAt(l);if(h===void 0)return;if(h<=65535)if(h>=55296&&h<=57343)if(h<=56319){const p=a.codePointAt(l+1);p!==void 0&&p>=56320&&p<=57343?(c+=1,l++):c+=1}else c+=1;else c+=1;else{if(!(h<=1114111))return;c+=1,l++}}return c})(r.value.stringValue);return s===void 0?w.mr():w.newValue({integerValue:s})}default:return w.mr()}}}class Hw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,8486);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const a=(s=r.value)==null?void 0:s.bytesValue;return typeof a=="string"?w.newValue({integerValue:fe.fromBase64String(a).toUint8Array().length}):w.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(l){let h=0;for(let p=0;p<l.length;p++){const m=l.codePointAt(p);if(m===void 0)return;if(m>=55296&&m<=57343){if(!(m<=56319))return;{const T=l.codePointAt(p+1);if(T===void 0||!(T>=56320&&T<=57343))return;h+=4,p++}}else if(m<=127)h+=1;else if(m<=2047)h+=2;else if(m<=65535)h+=3;else{if(!(m<=1114111))return;h+=4,p++}}return h})((i=r.value)==null?void 0:i.stringValue);return a===void 0?w.mr():w.newValue({integerValue:a})}case"NULL":return w.gr();default:return w.mr()}}}class yr{constructor(e){this.expr=e}evaluate(e,t){var a,c;U(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return w.mr()}return r?w.gr():this.Or((a=s.value)==null?void 0:a.stringValue,(c=i.value)==null?void 0:c.stringValue)}}class Ww extends yr{Or(e,t){try{const r=(function(a){let c="";for(let l=0;l<a.length;l++){const h=a.charAt(l);switch(h){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+h;break;default:c+=h}}return"^"+c+"$"})(t),s=ka.compile(r);return w.newValue({booleanValue:s.matches(e)})}catch(r){return it(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),w.mr()}}}class zw extends yr{Or(e,t){try{const r=ka.compile(t);return w.newValue({booleanValue:r.test(e)})}catch{return it(`Invalid regex pattern found in regex_contains: ${t}, returning error`),w.mr()}}}class Gw extends yr{Or(e,t){try{return w.newValue({booleanValue:ka.compile(t).matches(e)})}catch{return it(`Invalid regex pattern found in regex_match: ${t}, returning error`),w.mr()}}}class Kw extends yr{Or(e,t){return w.newValue({booleanValue:e.includes(t)})}}class Qw extends yr{Or(e,t){return w.newValue({booleanValue:e.startsWith(t)})}}class Yw extends yr{Or(e,t){return w.newValue({booleanValue:e.endsWith(t)})}}class Jw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,29079);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return w.gr();default:return w.mr()}}}class Xw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,60487);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return w.gr();default:return w.mr()}}}class Zw{constructor(e){this.expr=e}evaluate(e,t){var s,i;U(this.expr.params.length===1,28544);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return w.gr();default:return w.mr()}}}class eT{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((a=>q(a).evaluate(e,t)));let s="",i=!1;for(const a of r)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return w.mr()}return i?w.gr():w.newValue({stringValue:s})}}class tT{constructor(e){this.expr=e}evaluate(e,t){var a,c,l,h;U(this.expr.params.length===2,4483);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return w.pr();case"MAP":break;default:return w.mr()}const s=q(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return w.mr();const i=(h=(c=(a=r.value)==null?void 0:a.mapValue)==null?void 0:c.fields)==null?void 0:h[(l=s.value)==null?void 0:l.stringValue];return i===void 0?w.pr():w.newValue(i)}}class nc{constructor(e){this.expr=e}evaluate(e,t){var h,p;U(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return w.mr()}if(r)return w.gr();const a=pa(s.value),c=pa(i.value);if(a===void 0||c===void 0||((h=a.values)==null?void 0:h.length)!==((p=c.values)==null?void 0:p.length))return w.mr();const l=this.Mr(a,c);return l===void 0||isNaN(l)?w.mr():w.newValue({doubleValue:l})}}class nT extends nc{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return;let i=0,a=0,c=0;for(let h=0;h<r.length;h++){if(!sn(r[h])||!sn(s[h]))return;const p=Ee(r[h]),m=Ee(s[h]);i+=p*m,a+=p*p,c+=m*m}const l=Math.sqrt(a)*Math.sqrt(c);if(l!==0)return 1-Math.max(-1,Math.min(1,i/l))}}class rT extends nc{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!sn(r[a])||!sn(s[a]))return;i+=Ee(r[a])*Ee(s[a])}return i}}class sT extends nc{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let a=0;a<r.length;a++){if(!sn(r[a])||!sn(s[a]))return;const c=Ee(r[a]),l=Ee(s[a]);i+=Math.pow(c-l,2)}return Math.sqrt(i)}}class iT{constructor(e){this.expr=e}evaluate(e,t){var s;U(this.expr.params.length===1,39044);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const i=pa(r.value);return w.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return w.gr();default:return w.mr()}}}const gs=BigInt(-62135596800),_s=BigInt(253402300799),bi=BigInt(1e3),en=BigInt(1e6),oT=gs*bi,aT=_s*bi+BigInt(999),cT=gs*en,uT=_s*en+BigInt(999999);function rc(n){return n>=cT&&n<=uT}function uf(n){return n>=gs&&n<=_s}function ys(n,e){const t=BigInt(n);return!(t<gs||t>_s)&&!(e<0||e>=1e9)&&(t!==gs||e===0)&&!(t===_s&&e>999999999)}function lf(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function sc(n){return BigInt(n.seconds)*en+BigInt(Math.trunc(n.nanoseconds/1e3))}class ic{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return w.gr();default:return w.mr()}}}class lT extends ic{toTimestamp(e){if(!rc(e))return w.mr();let t=Number(e/en),r=Number(e%en*BigInt(1e3));const s=lf(t,r);return t=s.seconds,r=s.nanos,ys(t,r)?w.newValue({timestampValue:{seconds:t,nanos:r}}):w.mr()}}class hT extends ic{toTimestamp(e){if(!(function(a){return a>=oT&&a<=aT})(e))return w.mr();let t=Number(e/bi),r=Number(e%bi*BigInt(1e6));const s=lf(t,r);return t=s.seconds,r=s.nanos,ys(t,r)?w.newValue({timestampValue:{seconds:t,nanos:r}}):w.mr()}}class dT extends ic{toTimestamp(e){if(!uf(e))return w.mr();const t=Number(e);return w.newValue({timestampValue:{seconds:t,nanos:0}})}}class oc{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=q(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return w.gr();default:return w.mr()}const s=Ha(r.value.timestampValue);return ys(s.seconds,s.nanoseconds)?this.Nr(s):w.mr()}}class fT extends oc{Nr(e){const t=sc(e);return rc(t)?w.newValue({integerValue:`${t.toString()}`}):w.mr()}}class pT extends oc{Nr(e){const t=sc(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?w.newValue({integerValue:r.toString()}):w.newValue({integerValue:(r-BigInt(1)).toString()})}}class mT extends oc{Nr(e){const t=BigInt(e.seconds);return uf(t)?w.newValue({integerValue:t.toString()}):w.mr()}}class hf{constructor(e){this.expr=e}evaluate(e,t){U(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=q(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return w.mr()}const i=q(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(J){switch(J){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return w.mr();break;case"NULL":r=!0;break;default:return w.mr()}const c=q(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return w.mr()}if(r)return w.gr();const l=BigInt(c.value.integerValue);let h;try{switch(a){case"microsecond":h=l;break;case"millisecond":h=l*BigInt(1e3);break;case"second":h=l*BigInt(1e6);break;case"minute":h=l*BigInt(6e7);break;case"hour":h=l*BigInt(36e8);break;case"day":h=l*BigInt(864e8);break;default:return w.mr()}if(a!=="microsecond"&&l!==BigInt(0)&&h/l!==BigInt(this.Lr(a)))return w.mr()}catch(z){return it(`Error during timestamp arithmetic: ${z}`),w.mr()}const p=Ha(s.value.timestampValue);if(!ys(p.seconds,p.nanoseconds))return w.mr();const m=sc(p),T=this.Br(m,h);if(!rc(T))return w.mr();const b=Number(T/en),N=T%en,M=Number((N<0?N+en:N)*BigInt(1e3)),L=N<0?b-1:b;return ys(L,M)?w.newValue({timestampValue:{seconds:L,nanos:M}}):w.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class gT extends hf{Br(e,t){return e+t}}class _T extends hf{Br(e,t){return e-t}}function ws(n){if((n=af(n))instanceof mr)return`fld(${n.fieldName})`;if(n instanceof gr)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ie?`ref(${t.path})`:t instanceof Ue?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof S)return`fn(${n.name},[${n.params.map(ws).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.cr.map(ws).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function yT(n){if(n instanceof rf)return`${n._name}(${ni(n.fields)})`;if(n instanceof sf){let e=`${n._name}(${ni(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${ni(n.groups)})`),e}if(n instanceof of)return`${n._name}(${ni(n.groups)})`;if(n instanceof ro)return`${n._name}(${n.hr})`;if(n instanceof so)return`${n._name}(${n.collectionId})`;if(n instanceof Ja)return`${n._name}()`;if(n instanceof Xa)return`${n._name}(${n.Tr.sort()})`;if(n instanceof io)return`${n._name}(${ws(n.condition)})`;if(n instanceof On)return`${n._name}(${n.limit})`;if(n instanceof At)return`${n._name}(${(function(t){return t.map((r=>`${ws(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function ni(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${ws(t)}`)).join(",")}`}function Ct(n){return n.stages.map((e=>yT(e))).join("|")}function df(n,e){return Ct(n)===Ct(e)}function ge(n){return n instanceof ke}function xl(n){return ge(n)?Ct(n):Qr(n)}function ff(n){return ge(n)?Ct(n):(function(t){return`${Td(dt(t))}|lt:${t.limitType}`})(n)}function co(n,e){return n instanceof ke&&e instanceof ke?df(n,e):!(n instanceof ke&&!(e instanceof ke)||!(n instanceof ke)&&e instanceof ke)&&L_(n,e)}function pf(n){return vn(n)?Ct(n):Td(n)}function mf(n,e){return n instanceof ke&&e instanceof ke?df(n,e):!(n instanceof ke&&!(e instanceof ke)||!(n instanceof ke)&&e instanceof ke)&&Ed(n,e)}function wT(n,e){const t=(function(s){let i=!1;const a=[];for(const c of s)if(c instanceof At)if(i=!0,c.orderings.some((l=>l.expr instanceof mr&&l.expr.fieldName===lt)))a.push(c);else{const l=c.orderings.map((h=>h));l.push(li(lt).ascending()),a.push(new At(l,{}))}else c instanceof On&&(i||(a.push(new At([li(lt).ascending()],{})),i=!0)),a.push(c);return i||a.push(new At([li(lt).ascending()],{})),a})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(r)))}return new ke(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TT{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&g_(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Gr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Gr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Sd();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const l=dd(a,c);l!==null&&r.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(j.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),G())}isEqual(e){return this.batchId===e.batchId&&er(this.mutations,e.mutations,((t,r)=>dl(t,r)))&&er(this.baseMutations,e.baseMutations,((t,r)=>dl(t,r)))}}class ac{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){U(e.mutations.length===r.length,58842,{Ur:e.mutations.length,kr:r.length});let s=(function(){return q_})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new ac(e,t,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gf="";function ET(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Ll(e)),e=IT(n.get(t),e);return Ll(e)}function IT(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case gf:t+="";break;default:t+=i}}return t}function Ll(n){return n+gf+""}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e,t,r,s,i=j.min(),a=j.min(),c=fe.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new Rt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AT{constructor(e){this.$r=e}}function RT(n){const e=sy({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Ri(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PT{constructor(){this.Zi=new ST}addToCollectionParentIndex(e,t){return this.Zi.add(t),V.resolve()}getCollectionParents(e,t){return V.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return V.resolve()}deleteFieldIndex(e,t){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,t){return V.resolve()}getDocumentsMatchingTarget(e,t){return V.resolve(null)}getIndexType(e,t){return V.resolve(0)}getFieldIndexes(e,t){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,t){return V.resolve(on.min())}getMinOffsetFromCollectionGroup(e,t){return V.resolve(on.min())}updateCollectionGroup(e,t,r){return V.resolve()}updateIndexEntries(e,t){return V.resolve()}}class ST{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new de(X.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new de(X.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new ln(0)}static bs(){return new ln(-1)}}// Copyright 2024 Google LLC* @license
function _f(n,e){var r;let t=e;for(const s of n.stages)t=CT({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function uo(n,e){return _f(n,[e]).length>0}function bT(n,e){return ge(n)?uo(n,e):Yi(n,e)}function CT(n,e,t){if(e instanceof ro)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.hr))})(0,e,t);if(e instanceof io)return(function(s,i,a){return a.filter((c=>{const l=Zr(q(i.condition).evaluate(s,c));return l!==void 0&&Xe(l,Fe)}))})(n,e,t);if(e instanceof so)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Ja)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof Xa)return(function(s,i,a){return a.filter((c=>c.isFoundDocument()&&i.Pr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof On)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof At)return(function(s,i,a){const c=i.orderings.map((l=>({Ms:q(l.expr),direction:l.direction})));return[...a].sort(((l,h)=>{for(const{Ms:p,direction:m}of c){const T=Zr(p.evaluate(s,l)),b=Zr(p.evaluate(s,h)),N=Be(T??nr,b??nr);if(N!==0)return m==="ascending"?N:-N}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Ia(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof At)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=Zr(q(s.expr).evaluate({serializer:n.serializer},t)),a=Zr(q(s.expr).evaluate({serializer:n.serializer},r)),c=Be(i||nr,a||nr);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function Zo(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof On)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VT{constructor(){this.changes=new Bn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Se.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?V.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kT{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Gr(r.mutation,s,He.empty(),Z.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,G()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=G()){const s=Wt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let a=Kn();return i.forEach(((c,l)=>{a=a.insert(c,l.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=Wt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,G())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,c)=>{t.set(a,c)}))}))}computeViews(e,t,r,s){let i=Me();const a=Yr(),c=(function(){return Yr()})();return t.forEach(((l,h)=>{const p=r.get(h.key);s.has(h.key)&&(p===void 0||p.mutation instanceof mn)?i=i.insert(h.key,h):p!==void 0?(a.set(h.key,p.mutation.getFieldMask()),Gr(p.mutation,h,p.mutation.getFieldMask(),Z.now())):a.set(h.key,He.empty())})),this.recalculateAndSaveOverlays(e,i).next((l=>(l.forEach(((h,p)=>a.set(h,p))),t.forEach(((h,p)=>c.set(h,new NT(p,a.get(h)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=Yr();let s=new re(((a,c)=>a-c)),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const c of a)c.keys().forEach((l=>{const h=t.get(l);if(h===null)return;let p=r.get(l)||He.empty();p=c.applyToLocalView(h,p),r.set(l,p);const m=(s.get(c.batchId)||G()).add(l);s=s.insert(c.batchId,m)}))})).next((()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),h=l.key,p=l.value,m=Sd();p.forEach((T=>{if(!i.has(T)){const b=dd(t.get(T),r.get(T));b!==null&&m.set(T,b),i=i.add(T)}})),a.push(this.documentOverlayCache.saveOverlays(e,h,m))}return V.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return ge(t)?this.getDocumentsMatchingPipeline(e,t,r,s):D_(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):vd(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):V.resolve(Wt());let c=fs,l=i;return a.next((h=>V.forEach(h,((p,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(p)?V.resolve():this.remoteDocumentCache.getEntry(e,p).next((T=>{l=l.insert(p,T)}))))).next((()=>this.populateOverlays(e,h,i))).next((()=>this.computeViews(e,l,h,G()))).next((p=>({batchId:c,changes:Pd(p)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let s=Kn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=Kn();return this.indexManager.getCollectionParents(e,i).next((c=>V.forEach(c,(l=>{const h=(function(m,T){return new dr(T,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)})(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next((p=>{p.forEach(((m,T)=>{a=a.insert(m,T)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>Yi(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(Zt(t)==="collection_group"){const i=ec(t);let a=Kn();return this.indexManager.getCollectionParents(e,i).next((c=>V.forEach(c,(l=>{const h=(function(m,T){const b=m.stages.map((N=>N instanceof so?new ro(T.canonicalString(),{}):N));return new ke(m.serializer,b)})(t,l.child(i));return this.getDocumentsMatchingPipeline(e,h,r,s).next((p=>{p.forEach(((m,T)=>{a=a.insert(m,T)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((a=>{switch(i=a,Zt(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=G();for(const l of Ea(t))c=c.add(F.fromPath(l));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new D("invalid-argument",`Invalid pipeline source to execute offline: ${Ct(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(c=>uo(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,a)=>{const c=a.getKey();t.get(c)===null&&(t=t.insert(c,Se.newInvalidDocument(c)))}));let s=Kn();return t.forEach(((i,a)=>{const c=e.get(i);c!==void 0&&Gr(c.mutation,a,He.empty(),Z.now()),r(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,r){switch(Zt(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,X.fromString(oo(t)),r);case"collection_group":throw new D("invalid-argument",`Unexpected collection group pipeline: ${Ct(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Ea(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new D("invalid-argument",`Failed to get overlays for pipeline: ${Ct(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return V.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:ft(s.createTime)}})(t)),V.resolve()}getNamedQuery(e,t){return V.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(s){return{name:s.name,query:RT(s.bundledQuery),readTime:ft(s.readTime)}})(t)),V.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OT{constructor(){this.overlays=new re(F.comparator),this.Gs=new Map}getOverlay(e,t){return V.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Wt();return V.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=Wt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),V.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Zr(e,t,i)})),V.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Gs.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Gs.delete(r)),V.resolve()}getOverlaysForCollection(e,t,r){const s=Wt(),i=t.length+1,a=new F(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const l=c.getNext().value,h=l.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return V.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new re(((h,p)=>h-p));const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let p=i.get(h.largestBatchId);p===null&&(p=Wt(),i=i.insert(h.largestBatchId,p)),p.set(h.getKey(),h)}}const c=Wt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((h,p)=>c.set(h,p))),!(c.size()>=s)););return V.resolve(c)}Zr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Gs.get(s.largestBatchId).delete(r.key);this.Gs.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new vT(t,r));let i=this.Gs.get(t);i===void 0&&(i=G(),this.Gs.set(t,i)),this.Gs.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,V.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(){this.zs=new de(ye.js),this.Hs=new de(ye.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const r=new ye(e,t);this.zs=this.zs.add(r),this.Hs=this.Hs.add(r)}Ys(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Zs(new ye(e,t))}Xs(e,t){e.forEach((r=>this.removeReference(r,t)))}e_(e){const t=new F(new X([])),r=new ye(t,e),s=new ye(t,e+1),i=[];return this.Hs.forEachInRange([r,s],(a=>{this.Zs(a),i.push(a.key)})),i}t_(){this.zs.forEach((e=>this.Zs(e)))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new F(new X([])),r=new ye(t,e),s=new ye(t,e+1);let i=G();return this.Hs.forEachInRange([r,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new ye(e,0),r=this.zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ye{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return F.comparator(e.key,t.key)||K(e.r_,t.r_)}static Js(e,t){return K(e.r_,t.r_)||F.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new de(ye.js)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new TT(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.i_=this.i_.add(new ye(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return V.resolve(a)}lookupMutationBatch(e,t){return V.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.__(r),i=s<0?0:s;return V.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?Ma:this.Gr-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ye(t,0),s=new ye(t,Number.POSITIVE_INFINITY),i=[];return this.i_.forEachInRange([r,s],(a=>{const c=this.s_(a.r_);i.push(c)})),V.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(K);return t.forEach((s=>{const i=new ye(s,0),a=new ye(s,Number.POSITIVE_INFINITY);this.i_.forEachInRange([i,a],(c=>{r=r.add(c.r_)}))})),V.resolve(this.o_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;F.isDocumentKey(i)||(i=i.child(""));const a=new ye(new F(i),0);let c=new de(K);return this.i_.forEachWhile((l=>{const h=l.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(l.r_)),!0)}),a),V.resolve(this.o_(c))}o_(e){const t=[];return e.forEach((r=>{const s=this.s_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){U(this.a_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.i_;return V.forEach(t.mutations,(s=>{const i=new ye(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.i_=r}))}Hr(e){}containsKey(e,t){const r=new ye(t,0),s=this.i_.firstAfterOrEqual(r);return V.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}a_(e,t){return this.__(e)}__(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MT{constructor(e){this.u_=e,this.docs=(function(){return new re(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.u_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return V.resolve(r?r.document.mutableCopy():Se.newInvalidDocument(t))}getEntries(e,t){let r=Me();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Se.newInvalidDocument(s))})),V.resolve(r)}getAllEntries(e){let t=Me();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),V.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,a;ge(t)?(i=X.fromString(oo(t)),a=p=>uo(t,p)):(i=t.path,a=p=>Yi(t,p));let c=Me();const l=new F(i.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(l);for(;h.hasNext();){const{key:p,value:{document:m}}=h.getNext();if(!i.isPrefixOf(p.path))break;p.path.length>i.length+1||V_(C_(m),r)<=0||(s.has(m.key)||a(m))&&(c=c.insert(m.key,m.mutableCopy()))}return V.resolve(c)}getAllFromCollectionGroup(e,t,r,s){B(9500)}c_(e,t){return V.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new UT(this)}getSize(e){return V.resolve(this.size)}}class UT extends VT{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.$s.addEntry(e,s)):this.$s.removeEntry(r)})),V.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FT{constructor(e){this.persistence=e,this.l_=new Bn((t=>pf(t)),mf),this.lastRemoteSnapshotVersion=j.min(),this.highestTargetId=0,this.E_=0,this.h_=new cc,this.targetCount=0,this.T_=ln.ws()}forEachTarget(e,t){return this.l_.forEach(((r,s)=>t(s))),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.E_&&(this.E_=t),V.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new ln(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,V.resolve()}updateTargetData(e,t){return this.Ds(t),V.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.l_.forEach(((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.l_.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),V.waitFor(i).next((()=>s))}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,t){const r=this.l_.get(t)||null;return V.resolve(r)}addMatchingKeys(e,t,r){return this.h_.Ys(t,r),V.resolve()}removeMatchingKeys(e,t,r){this.h_.Xs(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),V.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),V.resolve()}getMatchingKeysForTargetId(e,t){const r=this.h_.n_(t);return V.resolve(r)}containsKey(e,t){return V.resolve(this.h_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yf{constructor(e,t){this.P_={},this.overlays={},this.I_=new eo(0),this.R_=!1,this.R_=!0,this.A_=new xT,this.referenceDelegate=e(this),this.V_=new FT(this),this.indexManager=new PT,this.remoteDocumentCache=(function(s){return new MT(s)})((r=>this.referenceDelegate.d_(r))),this.serializer=new AT(t),this.f_=new DT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new OT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.P_[e.toKey()];return r||(r=new LT(t,this.referenceDelegate),this.P_[e.toKey()]=r),r}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,r){x("MemoryPersistence","Starting transaction:",e);const s=new BT(this.I_.next());return this.referenceDelegate.m_(),r(s).next((i=>this.referenceDelegate.p_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}g_(e,t){return V.or(Object.values(this.P_).map((r=>()=>r.containsKey(e,t))))}}class BT extends Ny{constructor(e){super(),this.currentSequenceNumber=e}}class uc{constructor(e){this.persistence=e,this.y_=new cc,this.w_=null}static b_(e){return new uc(e)}get S_(){if(this.w_)return this.w_;throw B(60996)}addReference(e,t,r){return this.y_.addReference(r,t),this.S_.delete(r.toString()),V.resolve()}removeReference(e,t,r){return this.y_.removeReference(r,t),this.S_.add(r.toString()),V.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),V.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach((s=>this.S_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.S_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.S_,(r=>{const s=F.fromPath(r);return this.v_(e,s).next((i=>{i||t.removeEntry(s,j.min())}))})).next((()=>(this.w_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((r=>{r?this.S_.delete(t.toString()):this.S_.add(t.toString())}))}d_(e){return 0}v_(e,t){return V.or([()=>V.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class Ci{constructor(e,t){this.persistence=e,this.D_=new Bn((r=>ET(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=My(this,t)}static b_(e,t){return new Ci(e,t)}m_(){}p_(e){return V.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}sr(e,t){return V.forEach(this.D_,((r,s)=>this.Os(e,r,s).next((i=>i?V.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.c_(e,(a=>this.Os(e,a,t).next((c=>{c||(r++,i.removeEntry(a,j.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),V.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),V.resolve()}removeReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),V.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=oi(e.data.value)),t}Os(e,t,r){return V.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.D_.get(t);return V.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Vo=r,this.fo=s}static mo(e,t){let r=G(),s=G();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new lc(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qT(n,e){return F.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $T{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jT{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=(function(){return Hm()?8:ky(be())>0?6:4})()}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.vo(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.Do(e,t,s,r).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new $T;return this.xo(e,t,a).next((c=>{if(i.result=c,this.yo)return this.Co(e,t,a,c.size)}))})).next((()=>i.result))}Co(e,t,r,s){return ge(t)?V.resolve():r.documentReadCount<this.wo?(zn()<=Q.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",Qr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),V.resolve()):(zn()<=Q.DEBUG&&x("QueryEngine","Query:",Qr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.bo*s?(zn()<=Q.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",Qr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,dt(t))):V.resolve())}vo(e,t){if(ge(t))return V.resolve(null);let r=t;if(yl(r))return V.resolve(null);let s=dt(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=Ri(r,null,"F"),s=dt(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const c=G(...a);return this.So.getDocuments(e,c).next((l=>this.indexManager.getMinOffset(e,s).next((h=>{const p=this.Fo(r,l);return this.Oo(r,p,c,h.readTime)?this.vo(e,Ri(r,null,"F")):this.Mo(e,p,r,h)}))))})))))}Do(e,t,r,s){return(ge(t)?(function(a){for(const c of a.stages){if(c instanceof On||c instanceof Ol)return!1;if(c instanceof io){if(c.condition instanceof ef&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof mr&&c.condition._expr.params[0].fieldName===lt)continue;return!1}}return!0})(t):yl(t))||s.isEqual(j.min())?V.resolve(null):this.So.getDocuments(e,r).next((i=>{const a=this.Fo(t,i);return this.Oo(t,a,r,s)?V.resolve(null):(zn()<=Q.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),xl(t)),this.Mo(e,a,t,b_(s,fs)).next((c=>c)))}))}Fo(e,t){let r,s;return ge(e)?(r=new de(qT),s=i=>uo(e,i)):(r=new de($a(e)),s=i=>Yi(e,i)),t.forEach(((i,a)=>{s(a)&&(r=r.add(a))})),r}Oo(e,t,r,s){if(ge(e))return(function(c){return c.stages.some((l=>l instanceof On||l instanceof Ol))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}xo(e,t,r){return zn()<=Q.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",xl(t)),this.So.getDocumentsMatchingQuery(e,t,on.min(),r)}Mo(e,t,r,s){return this.So.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hc="LocalStore",HT=3e8;class WT{constructor(e,t,r,s){this.persistence=e,this.No=t,this.serializer=s,this.Lo=new re(K),this.Bo=new Bn((i=>pf(i)),mf),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(r)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new kT(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Lo)))}}function zT(n,e,t,r){return new WT(n,e,t,r)}async function wf(n,e){const t=H(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.qo(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const a=[],c=[];let l=G();for(const h of s){a.push(h.batchId);for(const p of h.mutations)l=l.add(p.key)}for(const h of i){c.push(h.batchId);for(const p of h.mutations)l=l.add(p.key)}return t.localDocuments.getDocuments(r,l).next((h=>({$o:h,removedBatchIds:a,addedBatchIds:c})))}))}))}function GT(n,e){const t=H(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.ko.newChangeBuffer({trackRemovals:!0});return(function(c,l,h,p){const m=h.batch,T=m.keys();let b=V.resolve();return T.forEach((N=>{b=b.next((()=>p.getEntry(l,N))).next((M=>{const L=h.docVersions.get(N);U(L!==null,48541),M.version.compareTo(L)<0&&(m.applyToRemoteDocument(M,h),M.isValidDocument()&&(M.setReadTime(h.commitVersion),p.addEntry(M)))}))})),b.next((()=>c.mutationQueue.removeMutationBatch(l,m)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let l=G();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(l=l.add(c.batch.mutations[h].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function Tf(n){const e=H(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.V_.getLastRemoteSnapshotVersion(t)))}function KT(n,e){const t=H(n),r=e.snapshotVersion;let s=t.Lo;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.ko.newChangeBuffer({trackRemovals:!0});s=t.Lo;const c=[];e.targetChanges.forEach(((p,m)=>{const T=s.get(m);if(!T)return;c.push(t.V_.removeMatchingKeys(i,p.removedDocuments,m).next((()=>t.V_.addMatchingKeys(i,p.addedDocuments,m))));let b=T.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?b=b.withResumeToken(fe.EMPTY_BYTE_STRING,j.min()).withLastLimboFreeSnapshotVersion(j.min()):p.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(p.resumeToken,r)),s=s.insert(m,b),(function(M,L,z){return M.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-M.snapshotVersion.toMicroseconds()>=HT?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0})(T,b,p)&&c.push(t.V_.updateTargetData(i,b))}));let l=Me(),h=G();if(e.documentUpdates.forEach((p=>{e.resolvedLimboDocuments.has(p)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,p))})),c.push(QT(i,a,e.documentUpdates).next((p=>{l=p.Ko,h=p.Qo}))),!r.isEqual(j.min())){const p=t.V_.getLastRemoteSnapshotVersion(i).next((m=>t.V_.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(p)}return V.waitFor(c).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,l,h))).next((()=>l))})).then((i=>(t.Lo=s,i)))}function QT(n,e,t){let r=G(),s=G();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let a=Me();return t.forEach(((c,l)=>{const h=i.get(c);l.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),l.isNoDocument()&&l.version.isEqual(j.min())?(e.removeEntry(c,l.readTime),a=a.insert(c,l)):!h.isValidDocument()||l.version.compareTo(h.version)>0||l.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(l),a=a.insert(c,l)):x(hc,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",l.version)})),{Ko:a,Qo:s}}))}function YT(n,e){const t=H(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Ma),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function JT(n,e){const t=H(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.V_.getTargetData(r,e).next((i=>i?(s=i,V.resolve(s)):t.V_.allocateTargetId(r).next((a=>(s=new Rt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.V_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.Lo.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Lo=t.Lo.insert(r.targetId,r),t.Bo.set(e,r.targetId)),r}))}async function va(n,e,t){const r=H(n),s=r.Lo.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(a=>r.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!pr(a))throw a;x(hc,`Failed to update sequence numbers for target ${e}: ${a}`)}r.Lo=r.Lo.remove(e),r.Bo.delete(s.target)}function Ml(n,e,t){const r=H(n);let s=j.min(),i=G();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(l,h,p){const m=H(l),T=m.Bo.get(p);return T!==void 0?V.resolve(m.Lo.get(T)):m.V_.getTargetData(h,p)})(r,a,ge(e)?e:dt(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(a,c.targetId).next((l=>{i=l}))})).next((()=>r.No.getDocumentsMatchingQuery(a,e,t?s:j.min(),t?i:G()))).next((c=>(XT(r,c),{documents:c,Wo:i})))))}function XT(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Uo.get(s)||j.min();r.readTime.compareTo(i)>0&&n.Uo.set(s,r.readTime)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){this.Yo===0&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve()))))}ra(e){this.state==="Online"?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,e==="Online"&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?(kt(t),this.Xo=!1):x("OnlineStateTracker",t)}ia(){this.Zo!==null&&(this.Zo.cancel(),this.Zo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wt="RemoteStore";class eE{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new ln(1e3),this.ca=new ln(1001),this.la=new Set,this.Ea=[],this.ha=i,this.ha.Qe((a=>{r.enqueueAndForget((async()=>{$n(this)&&(x(wt,"Restarting streams for network reachability change."),await(async function(l){const h=H(l);h.la.add(4),await Vs(h),h.Ta.set("Unknown"),h.la.delete(4),await lo(h)})(this))}))})),this.Ta=new ZT(r,s)}}async function lo(n){if($n(n))for(const e of n.Ea)await e(!0)}async function Vs(n){for(const e of n.Ea)await e(!1)}function Aa(n,e){return n.oa.get(e)||void 0}function Ef(n,e){const t=H(n),r=Aa(t,e.targetId);if(r!==void 0&&t._a.has(r))return;const s=(function(c,l){const h=Aa(c,l);h!==void 0&&c.aa.delete(h);const p=(function(T,b){return b%2!=0?T.ca.next():T.ua.next()})(c,l);return c.oa.set(l,p),c.aa.set(p,l),p})(t,e.targetId);x(wt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new Rt(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t._a.set(s,i),mc(t)?pc(t):wr(t).Yt()&&fc(t,i)}function dc(n,e){const t=H(n),r=wr(t),s=Aa(t,e);x(wt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t._a.delete(s),t.oa.delete(e),t.aa.delete(s),r.Yt()&&If(t,s),t._a.size===0&&(r.Yt()?r.en():$n(t)&&t.Ta.set("Unknown"))}function fc(n,e){if(n.Pa.J(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(j.min())>0){const t=n.aa.get(e.targetId);if(t===void 0)return void x(wt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}wr(n).Pn(e)}function If(n,e){n.Pa.J(e),wr(n).In(e)}function pc(n){n.Pa=new G_({getRemoteKeysForTarget:e=>{const t=n.aa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):G()},ye:e=>n._a.get(e)||null,Ve:()=>n.datastore.serializer.databaseId}),wr(n).start(),n.Ta.ea()}function mc(n){return $n(n)&&!wr(n).Jt()&&n._a.size>0}function $n(n){return H(n).la.size===0}function vf(n){n.Pa=void 0}async function tE(n){n.Ta.set("Online")}async function nE(n){n._a.forEach(((e,t)=>{fc(n,e)}))}async function rE(n,e){vf(n),mc(n)?(n.Ta.ra(e),pc(n)):n.Ta.set("Unknown")}async function sE(n,e,t){if(n.Ta.set("Online"),e instanceof Cd&&e.state===2&&e.cause)try{await(async function(s,i){const a=i.cause;for(const c of i.targetIds){if(s._a.has(c)){const l=s.aa.get(c);l!==void 0&&(await s.remoteSyncer.rejectListen(l,a),s.oa.delete(l),s.aa.delete(c)),s._a.delete(c)}s.Pa.removeTarget(c)}})(n,e)}catch(r){x(wt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Vi(n,r)}else if(e instanceof ci?n.Pa._e(e):e instanceof bd?n.Pa.he(e):n.Pa.ue(e),!t.isEqual(j.min()))try{const r=await Tf(n.localStore);t.compareTo(r)>=0&&await(function(i,a){const c=i.Pa.fe(a);c.targetChanges.forEach(((h,p)=>{if(h.resumeToken.approximateByteSize()>0){const m=i._a.get(p);m&&i._a.set(p,m.withResumeToken(h.resumeToken,a))}})),c.targetMismatches.forEach(((h,p)=>{const m=i._a.get(h);if(!m)return;i._a.set(h,m.withResumeToken(fe.EMPTY_BYTE_STRING,m.snapshotVersion)),If(i,h);const T=new Rt(m.target,h,p,m.sequenceNumber);fc(i,T)}));const l=(function(p,m){const T=new Map;m.targetChanges.forEach(((N,M)=>{const L=p.aa.get(M);L!==void 0&&T.set(L,N)}));let b=new re(K);return m.targetMismatches.forEach(((N,M)=>{const L=p.aa.get(N);L!==void 0&&(b=b.insert(L,M))})),new Ss(m.snapshotVersion,T,b,m.documentUpdates,m.augmentedDocumentUpdates,m.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(l)})(n,t)}catch(r){x(wt,"Failed to raise snapshot:",r),await Vi(n,r)}}async function Vi(n,e,t){if(!pr(e))throw e;n.la.add(1),await Vs(n),n.Ta.set("Offline"),t||(t=()=>Tf(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{x(wt,"Retrying IndexedDB access"),await t(),n.la.delete(1),await lo(n)}))}function Af(n,e){return e().catch((t=>Vi(n,t,e)))}async function ho(n){const e=H(n),t=hn(e);let r=e.sa.length>0?e.sa[e.sa.length-1].batchId:Ma;for(;iE(e);)try{const s=await YT(e.localStore,r);if(s===null){e.sa.length===0&&t.en();break}r=s.batchId,oE(e,s)}catch(s){await Vi(e,s)}Rf(e)&&Pf(e)}function iE(n){return $n(n)&&n.sa.length<10}function oE(n,e){n.sa.push(e);const t=hn(n);t.Yt()&&t.Rn&&t.An(e.mutations)}function Rf(n){return $n(n)&&!hn(n).Jt()&&n.sa.length>0}function Pf(n){hn(n).start()}async function aE(n){hn(n).fn()}async function cE(n){const e=hn(n);for(const t of n.sa)e.An(t.mutations)}async function uE(n,e,t){const r=n.sa.shift(),s=ac.from(r,e,t);await Af(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await ho(n)}async function lE(n,e){e&&hn(n).Rn&&await(async function(r,s){if((function(a){return F_(a)&&a!==C.ABORTED})(s.code)){const i=r.sa.shift();hn(r).Xt(),await Af(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await ho(r)}})(n,e),Rf(n)&&Pf(n)}async function Ul(n,e){const t=H(n);t.asyncQueue.verifyOperationInProgress(),x(wt,"RemoteStore received new credentials");const r=$n(t);t.la.add(3),await Vs(t),r&&t.Ta.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.la.delete(3),await lo(t)}async function hE(n,e){const t=H(n);e?(t.la.delete(2),await lo(t)):e||(t.la.add(2),await Vs(t),t.Ta.set("Unknown"))}function wr(n){return n.Ia||(n.Ia=(function(t,r,s){const i=H(t);return i.pn(),new vy(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:tE.bind(null,n),Et:nE.bind(null,n),Tt:rE.bind(null,n),Tn:sE.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ia.Xt(),mc(n)?pc(n):n.Ta.set("Unknown")):(await n.Ia.stop(),vf(n))}))),n.Ia}function hn(n){return n.Ra||(n.Ra=(function(t,r,s){const i=H(t);return i.pn(),new Ay(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:()=>Promise.resolve(),Et:aE.bind(null,n),Tt:lE.bind(null,n),Vn:cE.bind(null,n),dn:uE.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ra.Xt(),await ho(n)):(await n.Ra.stop(),n.sa.length>0&&(x(wt,`Stopping write stream with ${n.sa.length} pending writes`),n.sa=[]))}))),n.Ra}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):kt("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new _c(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function yc(n,e){if(kt("AsyncQueue",`${e}: ${n}`),pr(n))return new D(C.UNAVAILABLE,`${e}: ${n}`);throw n}class Fl{constructor(){this.activeTargetIds=H_()}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class dE{constructor(){this.fu=new Fl,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,r){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new Fl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function ea(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bn{static emptySet(e){return new bn(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=Kn(),this.sortedSet=new re(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof bn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new bn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(){this.pu=new re(F.comparator)}track(e){const t=e.doc.key,r=this.pu.get(t);r?e.type!==0&&r.type===3?this.pu=this.pu.insert(t,e):e.type===3&&r.type!==1?this.pu=this.pu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.pu=this.pu.remove(t):e.type===1&&r.type===2?this.pu=this.pu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):B(63341,{we:e,gu:r}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal(((t,r)=>{e.push(r)})),e}}class ir{constructor(e,t,r,s,i,a,c,l,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach((c=>{a.push({type:0,doc:c})})),new ir(e,t,bn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&co(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fE{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some((e=>e.vu()))}}class pE{constructor(){this.queries=ql(),this.onlineState="Unknown",this.Du=new Set}terminate(){(function(t,r){const s=H(t),i=s.queries;s.queries=ql(),i.forEach(((a,c)=>{for(const l of c.bu)l.onError(r)}))})(this,new D(C.ABORTED,"Firestore shutting down"))}}function ql(){return new Bn((n=>ff(n)),co)}async function wc(n,e){const t=H(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.Su()&&e.vu()&&(r=2):(i=new fE,r=e.vu()?0:1);try{switch(r){case 0:i.wu=await t.onListen(s,!0);break;case 1:i.wu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=yc(a,`Initialization of query '${ge(e.query)?Ct(e.query):Qr(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.bu.push(e),e.xu(t.onlineState),i.wu&&e.Cu(i.wu)&&Ec(t)}async function Tc(n,e){const t=H(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.bu.indexOf(e);a>=0&&(i.bu.splice(a,1),i.bu.length===0?s=e.vu()?0:1:!i.Su()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function mE(n,e){const t=H(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.bu)c.Cu(s)&&(r=!0);a.wu=s}}r&&Ec(t)}function gE(n,e,t){const r=H(n),s=r.queries.get(e);if(s)for(const i of s.bu)i.onError(t);r.queries.delete(e)}function Ec(n){n.Du.forEach((e=>{e.next()}))}var Ra;(function(n){n.Default="default",n.Cache="cache"})(Ra||(Ra={}));class Ic{constructor(e,t,r){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=r||{}}Cu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new ir(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Bu(e){e=ir.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==Ra.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sf{constructor(e){this.key=e}}class bf{constructor(e){this.key=e}}class _E{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=G(),this.mutatedKeys=G(),this.Ju=ge(e)?Ia(e):$a(e),this.Yu=new bn(this.Ju)}get Zu(){return this.zu}Xu(e,t){const r=t?t.ec:new Bl,s=t?t.Yu:this.Yu;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const[l,h]=this.tc(this.query,s);e.inorderTraversal(((m,T)=>{const b=s.get(m),N=bT(this.query,T)?T:null,M=!!b&&this.mutatedKeys.has(b.key),L=!!N&&(N.hasLocalMutations||this.mutatedKeys.has(N.key)&&N.hasCommittedMutations);let z=!1;b&&N?b.data.isEqual(N.data)?M!==L&&(r.track({type:3,doc:N}),z=!0):this.nc(b,N)||(r.track({type:2,doc:N}),z=!0,(l&&this.Ju(N,l)>0||h&&this.Ju(N,h)<0)&&(c=!0)):!b&&N?(r.track({type:0,doc:N}),z=!0):b&&!N&&(r.track({type:1,doc:b}),z=!0,(l||h)&&(c=!0)),z&&(N?(a=a.add(N),i=L?i.add(m):i.delete(m)):(a=a.delete(m),i=i.delete(m)))}));const p=this.rc(this.query);if(p)if(ge(this.query)){const m=[];a.forEach((N=>m.push(N)));const T=_f(this.query,m);let b=new bn(Ia(this.query));for(const N of T)b=b.add(N);a.forEach((N=>{b.has(N.key)||(i=i.delete(N.key),r.track({type:1,doc:N}))})),a=b}else{const m=this.sc(this.query);for(;a.size>p;){const T=m==="F"?a.last():a.first();a=a.delete(T.key),i=i.delete(T.key),r.track({type:1,doc:T})}}return{Yu:a,ec:r,Oo:c,mutatedKeys:i}}rc(e){var t;return ge(e)?(t=Zo(e))==null?void 0:t.limit:e.limit||void 0}sc(e){if(ge(e)){const t=Zo(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var r;if(ge(e)){const s=(r=Zo(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.rc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const a=e.ec.yu();a.sort(((p,m)=>(function(b,N){const M=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{we:L})}};return M(b)-M(N)})(p.type,m.type)||this.Ju(p.doc,m.doc))),this._c(r),s=s??!1;const c=t&&!s?this.oc():[],l=this.Hu.size===0&&this.current&&!s?1:0,h=l!==this.ju;return this.ju=l,a.length!==0||h?{snapshot:new ir(this.query,e.Yu,i,a,e.mutatedKeys,l===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),ac:c}:{ac:c}}xu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new Bl,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach((t=>this.zu=this.zu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.zu=this.zu.delete(t))),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=G(),this.Yu.forEach((r=>{this.uc(r.key)&&(this.Hu=this.Hu.add(r.key))}));const t=[];return e.forEach((r=>{this.Hu.has(r)||t.push(new bf(r))})),this.Hu.forEach((r=>{e.has(r)||t.push(new Sf(r))})),t}cc(e){this.zu=e.Wo,this.Hu=G();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return ir.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,this.ju===0,this.hasCachedResults)}}const vc="SyncEngine";class yE{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class wE{constructor(e){this.key=e,this.Ec=!1}}class TE{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.hc={},this.Tc=new Bn((c=>ff(c)),co),this.Pc=new Map,this.Ic=new Set,this.Rc=new re(F.comparator),this.Ac=new Map,this.Vc=new cc,this.dc={},this.fc=new Map,this.mc=ln.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return this.gc===!0}}async function EE(n,e,t=!0){const r=Of(n);let s;const i=r.Tc.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=await Cf(r,e,t,!0),s}async function IE(n,e){const t=Of(n);await Cf(t,e,!0,!1)}async function Cf(n,e,t,r){const s=await JT(n.localStore,ge(e)?e:dt(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await vE(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&Ef(n.remoteStore,s),c}async function vE(n,e,t,r,s){n.yc=(m,T,b)=>(async function(M,L,z,J){let ae=L.view.Xu(z);ae.Oo&&(ae=await Ml(M.localStore,L.query,!1).then((({documents:I})=>L.view.Xu(I,ae))));const Qe=J&&J.targetChanges.get(L.targetId),Ie=J&&J.targetMismatches.get(L.targetId)!=null,ve=L.view.applyChanges(ae,M.isPrimaryClient,Qe,Ie);return jl(M,L.targetId,ve.ac),ve.snapshot})(n,m,T,b);const i=await Ml(n.localStore,e,!0),a=new _E(e,i.Wo),c=a.Xu(i.documents),l=bs.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=a.applyChanges(c,n.isPrimaryClient,l);jl(n,t,h.ac);const p=new yE(e,t,a);return n.Tc.set(e,p),n.Pc.has(t)?n.Pc.get(t).push(e):n.Pc.set(t,[e]),h.snapshot}async function AE(n,e,t){const r=H(n),s=r.Tc.get(e),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter((a=>!co(a,e)))),void r.Tc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await va(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&dc(r.remoteStore,s.targetId),Pa(r,s.targetId)})).catch(fr)):(Pa(r,s.targetId),await va(r.localStore,s.targetId,!0))}async function RE(n,e){const t=H(n),r=t.Tc.get(e),s=t.Pc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),dc(t.remoteStore,r.targetId))}async function PE(n,e,t){const r=DE(n);try{const s=await(function(a,c){const l=H(a),h=Z.now(),p=c.reduce(((b,N)=>b.add(N.key)),G());let m,T;return l.persistence.runTransaction("Locally write mutations","readwrite",(b=>{let N=Me(),M=G();return l.ko.getEntries(b,p).next((L=>{N=L,N.forEach(((z,J)=>{J.isValidDocument()||(M=M.add(z))}))})).next((()=>l.localDocuments.getOverlayedDocuments(b,N))).next((L=>{m=L;const z=[];for(const J of c){const ae=__(J,m.get(J.key).overlayedDocument);ae!=null&&z.push(new mn(J.key,ae,ad(ae.value.mapValue),nt.exists(!0)))}return l.mutationQueue.addMutationBatch(b,h,z,c)})).next((L=>{T=L;const z=L.applyToLocalDocumentSet(m,M);return l.documentOverlayCache.saveOverlays(b,L.batchId,z)}))})).then((()=>({batchId:T.batchId,changes:Pd(m)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(a,c,l){let h=a.dc[a.currentUser.toKey()];h||(h=new re(K)),h=h.insert(c,l),a.dc[a.currentUser.toKey()]=h})(r,s.batchId,t),await Ns(r,s.changes),await ho(r.remoteStore)}catch(s){const i=yc(s,"Failed to persist write");t.reject(i)}}async function Vf(n,e){const t=H(n);try{const r=await KT(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.Ac.get(i);a&&(U(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Ec=!0:s.modifiedDocuments.size>0?U(a.Ec,14607):s.removedDocuments.size>0&&(U(a.Ec,42227),a.Ec=!1))})),await Ns(t,r,e)}catch(r){await fr(r)}}function $l(n,e,t){const r=H(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tc.forEach(((i,a)=>{const c=a.view.xu(e);c.snapshot&&s.push(c.snapshot)})),(function(a,c){const l=H(a);l.onlineState=c;let h=!1;l.queries.forEach(((p,m)=>{for(const T of m.bu)T.xu(c)&&(h=!0)})),h&&Ec(l)})(r.eventManager,e),s.length&&r.hc.Tn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function SE(n,e,t){const r=H(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Ac.get(e),i=s&&s.key;if(i){let a=new re(F.comparator);a=a.insert(i,Se.newNoDocument(i,j.min()));const c=G().add(i),l=new Ss(j.min(),new Map,new re(K),a,Me(),c);await Vf(r,l),r.Rc=r.Rc.remove(i),r.Ac.delete(e),Ac(r)}else await va(r.localStore,e,!1).then((()=>Pa(r,e,t))).catch(fr)}async function bE(n,e){const t=H(n),r=e.batch.batchId;try{const s=await GT(t.localStore,e);kf(t,r,null),Nf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ns(t,s)}catch(s){await fr(s)}}async function CE(n,e,t){const r=H(n);try{const s=await(function(a,c){const l=H(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",(h=>{let p;return l.mutationQueue.lookupMutationBatch(h,c).next((m=>(U(m!==null,37113),p=m.keys(),l.mutationQueue.removeMutationBatch(h,m)))).next((()=>l.mutationQueue.performConsistencyCheck(h))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(h,p,c))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,p))).next((()=>l.localDocuments.getDocuments(h,p)))}))})(r.localStore,e);kf(r,e,t),Nf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ns(r,s)}catch(s){await fr(s)}}function Nf(n,e){(n.fc.get(e)||[]).forEach((t=>{t.resolve()})),n.fc.delete(e)}function kf(n,e,t){const r=H(n);let s=r.dc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.dc[r.currentUser.toKey()]=s}}function Pa(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Pc.get(e))n.Tc.delete(r),t&&n.hc.wc(r,t);n.Pc.delete(e),n.isPrimaryClient&&n.Vc.e_(e).forEach((r=>{n.Vc.containsKey(r)||Df(n,r)}))}function Df(n,e){n.Ic.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(dc(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ac.delete(t),Ac(n))}function jl(n,e,t){for(const r of t)r instanceof Sf?(n.Vc.addReference(r.key,e),VE(n,r)):r instanceof bf?(x(vc,"Document no longer in limbo: "+r.key),n.Vc.removeReference(r.key,e),n.Vc.containsKey(r.key)||Df(n,r.key)):B(19791,{bc:r})}function VE(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Ic.has(r)||(x(vc,"New document in limbo: "+t),n.Ic.add(r),Ac(n))}function Ac(n){for(;n.Ic.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Ic.values().next().value;n.Ic.delete(e);const t=new F(X.fromString(e)),r=n.mc.next();n.Ac.set(r,new wE(t)),n.Rc=n.Rc.insert(t,r),Ef(n.remoteStore,new Rt(dt(Qi(t.path)),r,"TargetPurposeLimboResolution",eo.wn))}}async function Ns(n,e,t){const r=H(n),s=[],i=[],a=[];r.Tc.isEmpty()||(r.Tc.forEach(((c,l)=>{a.push(r.yc(l,e,t).then((h=>{var p;if((h||t)&&r.isPrimaryClient){const m=h?!h.fromCache:(p=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:p.current;r.sharedClientState.updateQueryState(l.targetId,m?"current":"not-current")}if(h){s.push(h);const m=lc.mo(l.targetId,h);i.push(m)}})))})),await Promise.all(a),r.hc.Tn(s),await(async function(l,h){const p=H(l);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(m=>V.forEach(h,(T=>V.forEach(T.Vo,(b=>p.persistence.referenceDelegate.addReference(m,T.targetId,b))).next((()=>V.forEach(T.fo,(b=>p.persistence.referenceDelegate.removeReference(m,T.targetId,b)))))))))}catch(m){if(!pr(m))throw m;x(hc,"Failed to update sequence numbers: "+m)}for(const m of h){const T=m.targetId;if(!m.fromCache){const b=p.Lo.get(T),N=b.snapshotVersion,M=b.withLastLimboFreeSnapshotVersion(N);p.Lo=p.Lo.insert(T,M)}}})(r.localStore,i))}async function NE(n,e){const t=H(n);if(!t.currentUser.isEqual(e)){x(vc,"User change. New user:",e.toKey());const r=await wf(t.localStore,e);t.currentUser=e,(function(i,a){i.fc.forEach((c=>{c.forEach((l=>{l.reject(new D(C.CANCELLED,a))}))})),i.fc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ns(t,r.$o)}}function kE(n,e){const t=H(n),r=t.Ac.get(e);if(r&&r.Ec)return G().add(r.key);{let s=G();const i=t.Pc.get(e);if(!i)return s;for(const a of i??[]){const c=t.Tc.get(a);s=s.unionWith(c.view.Zu)}return s}}function Of(n){const e=H(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Vf.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=kE.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=SE.bind(null,e),e.hc.Tn=mE.bind(null,e.eventManager),e.hc.wc=gE.bind(null,e.eventManager),e}function DE(n){const e=H(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=bE.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=CE.bind(null,e),e}class Ni{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ji(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),await this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)}Cc(e,t){return null}Fc(e,t){return null}xc(e){return zT(this.persistence,new jT,e.initialUser,this.serializer)}Dc(e){return new yf(uc.b_,this.serializer)}vc(e){return new dE}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ni.provider={build:()=>new Ni};class OE extends Ni{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){U(this.persistence.referenceDelegate instanceof Ci,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new xy(r,e.asyncQueue,t)}Dc(e){const t=this.cacheSizeBytes!==void 0?xe.withCacheSize(this.cacheSizeBytes):xe.DEFAULT;return new yf((r=>Ci.b_(r,t)),this.serializer)}}class Sa{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>$l(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=NE.bind(null,this.syncEngine),await hE(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new pE})()}createDatastore(e){const t=Ji(e.databaseInfo.databaseId),r=Iy(e.databaseInfo);return Sy(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,a,c){return new eE(r,s,i,a,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>$l(this.syncEngine,t,0)),(function(){return Pl.Ye()?new Pl:new yy})())}createSyncEngine(e,t){return(function(s,i,a,c,l,h,p){const m=new TE(s,i,a,c,l,h);return p&&(m.gc=!0),m})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=H(s);x(wt,"RemoteStore shutting down."),i.la.add(5),await Vs(i),i.ha.shutdown(),i.Ta.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Sa.provider={build:()=>new Sa};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="FirestoreClient";class xE{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Pe.UNAUTHENTICATED,this.clientId=La.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async a=>{x(dn,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(x(dn,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=yc(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function ta(n,e){n.asyncQueue.verifyOperationInProgress(),x(dn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await wf(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Hl(n,e){n.asyncQueue.verifyOperationInProgress();const t=await LE(n);x(dn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>Ul(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>Ul(e.remoteStore,s))),n._onlineComponents=e}async function LE(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){x(dn,"Using user provided OfflineComponentProvider");try{await ta(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===C.FAILED_PRECONDITION||s.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;it("Error using user provided cache. Falling back to memory cache: "+t),await ta(n,new Ni)}}else x(dn,"Using default OfflineComponentProvider"),await ta(n,new OE(void 0));return n._offlineComponents}async function xf(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(x(dn,"Using user provided OnlineComponentProvider"),await Hl(n,n._uninitializedComponentsProvider._online)):(x(dn,"Using default OnlineComponentProvider"),await Hl(n,new Sa))),n._onlineComponents}function ME(n){return xf(n).then((e=>e.syncEngine))}async function ki(n){const e=await xf(n),t=e.eventManager;return t.onListen=EE.bind(null,e.syncEngine),t.onUnlisten=AE.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=IE.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=RE.bind(null,e.syncEngine),t}function UE(n,e,t,r){const s=new gc(r),i=new Ic(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>wc(await ki(n),i))),()=>{s.Va(),n.asyncQueue.enqueueAndForget((async()=>Tc(await ki(n),i)))}}function FE(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,a,c,l,h){const p=new gc({next:T=>{p.Va(),a.enqueueAndForget((()=>Tc(i,m)));const b=T.docs.has(c);!b&&T.fromCache?h.reject(new D(C.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&T.fromCache&&l&&l.source==="server"?h.reject(new D(C.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(T)},error:T=>h.reject(T)}),m=new Ic(Qi(c.path),p,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return wc(i,m)})(await ki(n),n.asyncQueue,e,t,r))),r.promise}function BE(n,e,t={}){const r=new bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,a,c,l,h){const p=new gc({next:T=>{p.Va(),a.enqueueAndForget((()=>Tc(i,m))),T.fromCache&&l.source==="server"?h.reject(new D(C.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(T)},error:T=>h.reject(T)}),m=new Ic(c instanceof Xr?wT(c):c,p,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return wc(i,m)})(await ki(n),n.asyncQueue,e,t,r))),r.promise}function qE(n,e){const t=new bt;return n.asyncQueue.enqueueAndForget((async()=>PE(await ME(n),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Lf=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ie(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new $E(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Dn("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},$E=class extends Lf{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jE{convertValue(e,t="none"){switch(pe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return se(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(rn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return pn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[os].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>se(a.doubleValue)));return new Ue(t)}convertGeoPoint(e){return new pt(se(e.latitude),se(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Rs(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(tr(e));default:return null}}convertTimestamp(e){const t=nn(e);return new Z(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=X.fromString(e);U(Ld(r),9688,{name:e});const s=new ss(r.get(1),r.get(3)),i=new F(r.popFirst(5));return s.isEqual(t)||kt(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HE(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wl="AsyncQueue";class zl{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new qd(this,"async_queue_retry"),this.Hc=()=>{const r=ea();r&&x(Wl,"Visibility state changed to "+r.visibilityState),this.Ht.$t()},this.Jc=e;const t=ea();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=ea();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise((()=>{}));const t=new bt;return this.Zc((()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.$c.push(e),this.Xc())))}async Xc(){if(this.$c.length!==0){try{await this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(e){if(!pr(e))throw e;x(Wl,"Operation failed with retryable error: "+e)}this.$c.length>0&&this.Ht.kt((()=>this.Xc()))}}Zc(e){const t=this.Jc.then((()=>(this.Gc=!0,e().catch((r=>{throw this.Wc=r,this.Gc=!1,kt("INTERNAL UNHANDLED ERROR: ",Gl(r)),r})).then((r=>(this.Gc=!1,r))))));return this.Jc=t,t}enqueueAfterDelay(e,t,r){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const s=_c.createAndSchedule(this,e,t,r,(i=>this.el(i)));return this.Qc.push(s),s}Yc(){this.Wc&&B(47125,{tl:Gl(this.Wc)})}verifyOperationInProgress(){}async nl(){let e;do e=this.Jc,await e;while(e!==this.Jc)}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then((()=>{this.Qc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Qc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.nl()}))}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function Gl(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class fn extends to{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new zl,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new zl(e),this._firestoreClient=void 0,await e}}}function JR(n,e){const t=typeof n=="object"?n:Oa(),r=typeof n=="string"?n:e||wi,s=ur(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Lm("firestore");i&&Uy(s,...i)}return s}function fo(n){if(n._terminated)throw new D(C.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||WE(n),n._firestoreClient}function WE(n){var r,s,i,a;const e=n._freezeSettings(),t=Cy(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new xE(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(l){const h=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(h),_online:h}})(n._componentsProvider))}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rc extends jE{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ye(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ie(this.firestore,null,t)}}class Wr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Cn extends Lf{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new hi(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Dn("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new D(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Cn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Cn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Cn._jsonSchema={type:he("string",Cn._jsonSchemaVersion),bundleSource:he("string","DocumentSnapshot"),bundleName:he("string"),bundle:he("string")};class hi extends Cn{data(e={}){return super.data(e)}}class Vn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Wr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new hi(this._firestore,this._userDataWriter,r.key,r,new Wr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new D(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((c=>{ge(s._snapshot.query)?Ia(s._snapshot.query):$a(s.query._query);const l=new hi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Wr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const l=new hi(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Wr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,p=-1;return c.type!==0&&(h=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),p=a.indexOf(c.doc.key)),{type:zE(c.type),doc:l,oldIndex:h,newIndex:p}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new D(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Vn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=La.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function zE(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:n})}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Vn._jsonSchemaVersion="firestore/querySnapshot/1.0",Vn._jsonSchema={type:he("string",Vn._jsonSchemaVersion),bundleSource:he("string","QuerySnapshot"),bundleName:he("string"),bundle:he("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mf(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new D(C.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Pc{}class Sc extends Pc{}function XR(n,e,...t){let r=[];e instanceof Pc&&r.push(e),r=r.concat(t),(function(i){const a=i.filter((l=>l instanceof Cc)).length,c=i.filter((l=>l instanceof bc)).length;if(a>1||a>0&&c>0)throw new D(C.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class bc extends Sc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new bc(e,t,r)}_apply(e){const t=this._parse(e);return Uf(e._query,t),new Lt(e.firestore,e.converter,ga(e._query,t))}_parse(e){const t=Ga(e.firestore);return(function(i,a,c,l,h,p,m){let T;if(h.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new D(C.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){Ql(m,p);const N=[];for(const M of m)N.push(Kl(l,i,M));T={arrayValue:{values:N}}}else T=Kl(l,i,m)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||Ql(m,p),T=Wy(c,a,m,p==="in"||p==="not-in");return le.create(h,p,T)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}class Cc extends Pc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Cc(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:ot.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let a=s;const c=i.getFlattenedFilters();for(const l of c)Uf(a,l),a=ga(a,l)})(e._query,t),new Lt(e.firestore,e.converter,ga(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Vc extends Sc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Vc(e,t)}_apply(e){const t=(function(s,i,a){if(s.startAt!==null)throw new D(C.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new D(C.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ds(i,a)})(e._query,this._field,this._direction);return new Lt(e.firestore,e.converter,x_(e._query,t))}}function ZR(n,e="asc"){const t=e,r=Dn("orderBy",n);return Vc._create(r,t)}class Nc extends Sc{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Nc(e,t,r)}_apply(e){return new Lt(e.firestore,e.converter,Ri(e._query,this._limit,this._limitType))}}function eP(n){return r_("limit",n),Nc._create("limit",n,"F")}function Kl(n,e,t){if(typeof(t=oe(t))=="string"){if(t==="")throw new D(C.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!vd(e)&&t.indexOf("/")!==-1)throw new D(C.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(X.fromString(t));if(!F.isDocumentKey(r))throw new D(C.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ll(n,new F(r))}if(t instanceof ie)return ll(n,t._key);throw new D(C.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ji(t)}.`)}function Ql(n,e){if(!Array.isArray(n)||n.length===0)throw new D(C.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Uf(n,e){const t=(function(s,i){for(const a of s)for(const c of a.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new D(C.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new D(C.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yl(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tP(n){n=Ge(n,ie);const e=Ge(n.firestore,fn),t=fo(e);return FE(t,n._key).then((r=>Ff(e,n,r)))}function nP(n){n=Ge(n,Lt);const e=Ge(n.firestore,fn),t=fo(e),r=new Rc(e);return Mf(n._query),BE(t,n._query).then((s=>new Vn(e,r,n,s)))}function rP(n,e,t){n=Ge(n,ie);const r=Ge(n.firestore,fn),s=HE(n.converter,e,t),i=Ga(r);return kc(r,[$y(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,nt.none())])}function sP(n,e,t,...r){n=Ge(n,ie);const s=Ge(n.firestore,fn),i=Ga(s);let a;return a=typeof(e=oe(e))=="string"||e instanceof Xi?Hy(i,"updateDoc",n._key,e,t,r):jy(i,"updateDoc",n._key,e),kc(s,[a.toMutation(n._key,nt.exists(!0))])}function iP(n){return kc(Ge(n.firestore,fn),[new qa(n._key,nt.none())])}function oP(n,...e){var h,p,m;n=oe(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Yl(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Yl(e[r])){const T=e[r];e[r]=(h=T.next)==null?void 0:h.bind(T),e[r+1]=(p=T.error)==null?void 0:p.bind(T),e[r+2]=(m=T.complete)==null?void 0:m.bind(T)}let i,a,c;if(n instanceof ie)a=Ge(n.firestore,fn),c=Qi(n._key.path),i={next:T=>{e[r]&&e[r](Ff(a,n,T))},error:e[r+1],complete:e[r+2]};else{const T=Ge(n,Lt);a=Ge(T.firestore,fn),c=T._query;const b=new Rc(a);i={next:N=>{e[r]&&e[r](new Vn(a,b,T,N))},error:e[r+1],complete:e[r+2]},Mf(n._query)}const l=fo(a);return UE(l,c,s,i)}function kc(n,e){const t=fo(n);return qE(t,e)}function Ff(n,e,t){const r=t.docs.get(e._key),s=new Rc(n);return new Cn(n,s,e._key,r,new Wr(t.hasPendingWrites,t.fromCache),e.converter)}const Jl="@firebase/firestore",Xl="4.17.2";(function(e,t=!0){Yg(lr),_t(new st("firestore",((r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new fn(new py(r.getProvider("auth-internal")),new _y(a,r.getProvider("app-check-internal")),o_(a,s),a);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),Je(Jl,Xl,e),Je(Jl,Xl,"esm2020")})();var GE="firebase",KE="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Je(GE,KE,"app");function Bf(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const QE=Bf,qf=new Fn("auth","Firebase",Bf());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Di=new Da("@firebase/auth");function di(n,...e){Di.logLevel<=Q.WARN&&Di.warn(`Auth (${lr}): ${n}`,...e)}function fi(n,...e){Di.logLevel<=Q.ERROR&&Di.error(`Auth (${lr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(n,...e){throw Dc(n,...e)}function rt(n,...e){return Dc(n,...e)}function po(n,e,t){const r={...QE(),[e]:t};return new Fn("auth","Firebase",r).create(e,{appName:n.name})}function mt(n){return po(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function YE(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&Ze(n,"argument-error"),po(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Dc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return qf.create(n,...e)}function $(n,e,...t){if(!n)throw Dc(e,...t)}function Pt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw fi(e),new Error(e)}function Ot(n,e){n||Pt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ba(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function JE(){return Zl()==="http:"||Zl()==="https:"}function Zl(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XE(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(JE()||qm()||"connection"in navigator)?navigator.onLine:!0}function ZE(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ot(t>e,"Short delay should be less than long delay!"),this.isMobile=Um()||$m()}get(){return XE()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oc(n,e){Ot(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Pt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Pt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Pt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],nI=new ks(3e4,6e4);function Mt(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Et(n,e,t,r,s={}){return jf(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=Es({...a,key:n.config.apiKey}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:l,...i};return Bm()||(h.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&Is(n.emulatorConfig.host)&&(h.credentials="include"),$f.fetch()(await Hf(n,n.config.apiHost,t,c),h)})}async function jf(n,e,t){n._canInitEmulator=!1;const r={...eI,...e};try{const s=new sI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw ri(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[l,h]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw ri(n,"credential-already-in-use",a);if(l==="EMAIL_EXISTS")throw ri(n,"email-already-in-use",a);if(l==="USER_DISABLED")throw ri(n,"user-disabled",a);const p=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw po(n,p,h);Ze(n,p)}}catch(s){if(s instanceof Tt)throw s;Ze(n,"network-request-failed",{message:String(s)})}}async function Ds(n,e,t,r,s={}){const i=await Et(n,e,t,r,s);return"mfaPendingCredential"in i&&Ze(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Hf(n,e,t,r){const s=`${e}${t}?${r}`,i=n,a=i.config.emulator?Oc(n.config,s):`${n.config.apiScheme}://${s}`;return tI.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(a).toString():a}function rI(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class sI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(rt(this.auth,"network-request-failed")),nI.get())})}}function ri(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=rt(n,e,r);return s.customData._tokenResponse=t,s}function eh(n){return n!==void 0&&n.enterprise!==void 0}class iI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return rI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function oI(n,e){return Et(n,"GET","/v2/recaptchaConfig",Mt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aI(n,e){return Et(n,"POST","/v1/accounts:delete",e)}async function Oi(n,e){return Et(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function es(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function cI(n,e=!1){const t=oe(n),r=await t.getIdToken(e),s=xc(r);$(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:es(na(s.auth_time)),issuedAtTime:es(na(s.iat)),expirationTime:es(na(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function na(n){return Number(n)*1e3}function xc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return fi("JWT malformed, contained fewer than 3 sections"),null;try{const s=xh(t);return s?JSON.parse(s):(fi("Failed to decode base64 JWT payload"),null)}catch(s){return fi("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function th(n){const e=xc(n);return $(e,"internal-error"),$(typeof e.exp<"u","internal-error"),$(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function or(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Tt&&uI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function uI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ca{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=es(this.lastLoginAt),this.creationTime=es(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xi(n){var m;const e=n.auth,t=await n.getIdToken(),r=await or(n,Oi(e,{idToken:t}));$(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(m=s.providerUserInfo)!=null&&m.length?Wf(s.providerUserInfo):[],a=dI(n.providerData,i),c=n.isAnonymous,l=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),h=c?l:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Ca(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,p)}async function hI(n){const e=oe(n);await xi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function dI(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Wf(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fI(n,e){const t=await jf(n,{},async()=>{const r=Es({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=await Hf(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:r};return n.emulatorConfig&&Is(n.emulatorConfig.host)&&(l.credentials="include"),$f.fetch()(a,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function pI(n,e){return Et(n,"POST","/v2/accounts:revokeToken",Mt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){$(e.idToken,"internal-error"),$(typeof e.idToken<"u","internal-error"),$(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):th(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){$(e.length!==0,"internal-error");const t=th(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:($(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await fI(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Xn;return r&&($(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&($(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&($(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Xn,this.toJSON())}_performRefresh(){return Pt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(n,e){$(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class tt{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new lI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ca(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await or(this,this.stsTokenManager.getToken(this.auth,e));return $(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return cI(this,e)}reload(){return hI(this)}_assign(e){this!==e&&($(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new tt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){$(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await xi(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Le(this.auth.app))return Promise.reject(mt(this.auth));const e=await this.getIdToken();return await or(this,aI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,a=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,h=t.createdAt??void 0,p=t.lastLoginAt??void 0,{uid:m,emailVerified:T,isAnonymous:b,providerData:N,stsTokenManager:M}=t;$(m&&M,e,"internal-error");const L=Xn.fromJSON(this.name,M);$(typeof m=="string",e,"internal-error"),Ht(r,e.name),Ht(s,e.name),$(typeof T=="boolean",e,"internal-error"),$(typeof b=="boolean",e,"internal-error"),Ht(i,e.name),Ht(a,e.name),Ht(c,e.name),Ht(l,e.name),Ht(h,e.name),Ht(p,e.name);const z=new tt({uid:m,auth:e,email:s,emailVerified:T,displayName:r,isAnonymous:b,photoURL:a,phoneNumber:i,tenantId:c,stsTokenManager:L,createdAt:h,lastLoginAt:p});return N&&Array.isArray(N)&&(z.providerData=N.map(J=>({...J}))),l&&(z._redirectEventId=l),z}static async _fromIdTokenResponse(e,t,r=!1){const s=new Xn;s.updateFromServerResponse(t);const i=new tt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await xi(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];$(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Wf(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Xn;c.updateFromIdToken(r);const l=new tt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Ca(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,h),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nh=new Map;function St(n){Ot(n instanceof Function,"Expected a class definition");let e=nh.get(n);return e?(Ot(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,nh.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zf{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}zf.type="NONE";const rh=zf;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pi(n,e,t){return`firebase:${n}:${e}:${t}`}class Nn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=pi(this.userKey,s.apiKey,i),this.fullPersistenceKey=pi("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Oi(this.auth,{idToken:e}).catch(()=>{});return t?tt._fromGetAccountInfoResponse(this.auth,t,e):null}return tt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,r="authUser"){if(!t.length)return new Nn(St(rh),e,r);const s=(await Promise.all(t.map(async h=>{try{if(await h._isAvailable())return h}catch{return}}))).filter(h=>h);let i=s[0]||St(rh);const a=pi(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const p=await h._get(a);if(p){let m;if(typeof p=="string"){const T=await Oi(e,{idToken:p}).catch(()=>{});if(!T)break;m=await tt._fromGetAccountInfoResponse(e,T,p)}else m=tt._fromJSON(e,p);h!==i&&(c=m),i=h;break}}catch{}const l=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Nn(i,e,r):(i=l[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new Nn(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Yf(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Gf(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Xf(e))return"Blackberry";if(Zf(e))return"Webos";if(Kf(e))return"Safari";if((e.includes("chrome/")||Qf(e))&&!e.includes("edge/"))return"Chrome";if(Jf(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Gf(n=be()){return/firefox\//i.test(n)}function Kf(n=be()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Qf(n=be()){return/crios\//i.test(n)}function Yf(n=be()){return/iemobile/i.test(n)}function Jf(n=be()){return/android/i.test(n)}function Xf(n=be()){return/blackberry/i.test(n)}function Zf(n=be()){return/webos/i.test(n)}function Lc(n=be()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function mI(n=be()){var e;return Lc(n)&&!!((e=window.navigator)!=null&&e.standalone)}function gI(){return jm()&&document.documentMode===10}function ep(n=be()){return Lc(n)||Jf(n)||Zf(n)||Xf(n)||/windows phone/i.test(n)||Yf(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tp(n,e=[]){let t;switch(n){case"Browser":t=sh(be());break;case"Worker":t=`${sh(be())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${lr}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _I{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const l=e(i);a(l)}catch(l){c(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yI(n,e={}){return Et(n,"GET","/v2/passwordPolicy",Mt(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wI=6;class TI{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??wI,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EI{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ih(this),this.idTokenSubscription=new ih(this),this.beforeStateQueue=new _I(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qf,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=St(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted){try{this.persistenceManager=await Nn.create(this,e)}catch(a){di(`Failed to initialize persistence: ${a}`),this.persistenceManager=await Nn.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(a){di(`Failed to initialize current user: ${a}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Oi(this,{idToken:e}),r=await tt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Le(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,l=await this.tryRedirectSignIn(e);(!a||a===c)&&(l!=null&&l.user)&&(r=l.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return $(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await xi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ZE()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Le(this.app))return Promise.reject(mt(this));const t=e?oe(e):null;return t&&$(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&$(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Le(this.app)?Promise.reject(mt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Le(this.app)?Promise.reject(mt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(St(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await yI(this),t=new TI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Fn("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await pI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&St(e)||this._popupRedirectResolver;$(t,this,"argument-error"),this.redirectPersistenceManager=await Nn.create(this,[St(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if($(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}).catch(l=>{if(!a)if(typeof t!="function"&&t.error)t.error(l);else if(r)r(l);else throw l}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{a=!0,l()}}else{const l=e.addObserver(t);return()=>{a=!0,l()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),s=po(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw s.customData={originalError:t},s}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return $(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=tp(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(Le(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&di(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function It(n){return oe(n)}class ih{constructor(e){this.auth=e,this.observer=null,this.addObserver=Qm(t=>this.observer=t)}get next(){return $(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let mo={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function II(n){mo=n}function np(n){return mo.loadJS(n)}function vI(){return mo.recaptchaEnterpriseScript}function AI(){return mo.gapiScript}function RI(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class PI{constructor(){this.enterprise=new SI}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class SI{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bI="recaptcha-enterprise",rp="NO_RECAPTCHA",oh="onFirebaseAuthREInstanceReady";class zt{constructor(e){this.type=bI,this.auth=It(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(a,c)=>{oI(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new iI(l);return i.tenantId==null?i._agentRecaptchaConfig=h:i._tenantRecaptchaConfigs[i.tenantId]=h,a(h.siteKey)}}).catch(l=>{c(l)})})}function s(i,a,c){const l=window.grecaptcha;eh(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(h=>{a(h)}).catch(()=>{a(rp)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new PI().execute("siteKey",{action:"verify"}):new Promise((i,a)=>{r(this.auth).then(async c=>{if(!t&&eh(window.grecaptcha)&&zt.scriptInjectionDeferred)await zt.scriptInjectionDeferred.promise,s(c,i,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let l=vI();l.length!==0&&(l+=c+`&onload=${oh}`),zt.scriptInjectionDeferred=new Fh,window[oh]=()=>{var h;(h=zt.scriptInjectionDeferred)==null||h.resolve()},np(l).then(()=>{var h;return(h=zt.scriptInjectionDeferred)==null?void 0:h.promise}).then(()=>{s(c,i,a)}).catch(h=>{a(h)})}}).catch(c=>{a(c)})})}}zt.scriptInjectionDeferred=null;async function ah(n,e,t,r=!1,s=!1){const i=new zt(n);let a;if(s)a=rp;else try{a=await i.verify(t)}catch{a=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:h,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:a}):Object.assign(c,{captchaResponse:a}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Li(n,e,t,r,s){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await ah(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await ah(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(a)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CI(n,e){const t=ur(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(kn(i,e??{}))return s;Ze(s,"already-initialized")}return t.initialize({options:e})}function VI(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(St);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function NI(n,e,t){const r=It(n);$(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=sp(e),{host:a,port:c}=kI(e),l=c===null?"":`:${c}`,h={url:`${i}//${a}${l}/`},p=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){$(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),$(kn(h,r.config.emulator)&&kn(p,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=p,r.settings.appVerificationDisabledForTesting=!0,Is(a)?$h(`${i}//${a}${l}`):DI()}function sp(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function kI(n){const e=sp(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:ch(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:ch(a)}}}function ch(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function DI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Pt("not implemented")}_getIdTokenResponse(e){return Pt("not implemented")}_linkToIdToken(e,t){return Pt("not implemented")}_getReauthenticationResolver(e){return Pt("not implemented")}}async function OI(n,e){return Et(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xI(n,e){return Ds(n,"POST","/v1/accounts:signInWithPassword",Mt(n,e))}async function LI(n,e){return Et(n,"POST","/v1/accounts:sendOobCode",Mt(n,e))}async function MI(n,e){return LI(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function UI(n,e){return Ds(n,"POST","/v1/accounts:signInWithEmailLink",Mt(n,e))}async function FI(n,e){return Ds(n,"POST","/v1/accounts:signInWithEmailLink",Mt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ts extends Mc{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Ts(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Ts(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Li(e,t,"signInWithPassword",xI);case"emailLink":return UI(e,{email:this._email,oobCode:this._password});default:Ze(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Li(e,r,"signUpPassword",OI);case"emailLink":return FI(e,{idToken:t,email:this._email,oobCode:this._password});default:Ze(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zn(n,e){return Ds(n,"POST","/v1/accounts:signInWithIdp",Mt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BI="http://localhost";class xn extends Mc{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new xn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ze("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const a=new xn(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Zn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Zn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Zn(e,t)}buildRequest(){const e={requestUri:BI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Es(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qI(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function $I(n){const e=Br(qr(n)).link,t=e?Br(qr(e)).deep_link_id:null,r=Br(qr(n)).deep_link_id;return(r?Br(qr(r)).link:null)||r||t||e||n}class Uc{constructor(e){const t=Br(qr(e)),r=t.apiKey??null,s=t.oobCode??null,i=qI(t.mode??null);$(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=$I(e);try{return new Uc(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tr{constructor(){this.providerId=Tr.PROVIDER_ID}static credential(e,t){return Ts._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Uc.parseLink(t);return $(r,"argument-error"),Ts._fromEmailAndCode(e,r.code,r.tenantId)}}Tr.PROVIDER_ID="password";Tr.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Tr.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os extends Fc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt extends Os{constructor(){super("facebook.com")}static credential(e){return xn._fromParams({providerId:Gt.PROVIDER_ID,signInMethod:Gt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Gt.credentialFromTaggedObject(e)}static credentialFromError(e){return Gt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Gt.credential(e.oauthAccessToken)}catch{return null}}}Gt.FACEBOOK_SIGN_IN_METHOD="facebook.com";Gt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt extends Os{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return xn._fromParams({providerId:Kt.PROVIDER_ID,signInMethod:Kt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Kt.credentialFromTaggedObject(e)}static credentialFromError(e){return Kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Kt.credential(t,r)}catch{return null}}}Kt.GOOGLE_SIGN_IN_METHOD="google.com";Kt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt extends Os{constructor(){super("github.com")}static credential(e){return xn._fromParams({providerId:Qt.PROVIDER_ID,signInMethod:Qt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Qt.credentialFromTaggedObject(e)}static credentialFromError(e){return Qt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Qt.credential(e.oauthAccessToken)}catch{return null}}}Qt.GITHUB_SIGN_IN_METHOD="github.com";Qt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt extends Os{constructor(){super("twitter.com")}static credential(e,t){return xn._fromParams({providerId:Yt.PROVIDER_ID,signInMethod:Yt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Yt.credentialFromTaggedObject(e)}static credentialFromError(e){return Yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Yt.credential(t,r)}catch{return null}}}Yt.TWITTER_SIGN_IN_METHOD="twitter.com";Yt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ip(n,e){return Ds(n,"POST","/v1/accounts:signUp",Mt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await tt._fromIdTokenResponse(e,r,s),a=uh(r);return new xt({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=uh(r);return new xt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function uh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aP(n){var s;if(Le(n.app))return Promise.reject(mt(n));const e=It(n);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new xt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await ip(e,{returnSecureToken:!0}),r=await xt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(r.user),r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi extends Tt{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Mi.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Mi(e,t,r,s)}}function op(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Mi._fromErrorAndOperation(n,i,e,r):i})}async function jI(n,e,t=!1){const r=await or(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return xt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function HI(n,e,t=!1){const{auth:r}=n;if(Le(r.app))return Promise.reject(mt(r));const s="reauthenticate";try{const i=await or(n,op(r,s,e,n),t);$(i.idToken,r,"internal-error");const a=xc(i.idToken);$(a,r,"internal-error");const{sub:c}=a;return $(n.uid===c,r,"user-mismatch"),xt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Ze(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ap(n,e,t=!1){if(Le(n.app))return Promise.reject(mt(n));const r="signIn",s=await op(n,r,e),i=await xt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function WI(n,e){return ap(It(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cp(n){const e=It(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function cP(n,e,t){const r=It(n);await Li(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",MI)}async function uP(n,e,t){if(Le(n.app))return Promise.reject(mt(n));const r=It(n),a=await Li(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ip).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&cp(n),l}),c=await xt._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(c.user),c}function lP(n,e,t){return Le(n.app)?Promise.reject(mt(n)):WI(oe(n),Tr.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&cp(n),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zI(n,e){return Et(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hP(n,e){const{displayName:t,photoURL:r}=e;if(t===void 0&&r===void 0)return;const s=oe(n),a={idToken:await s.getIdToken(),displayName:t,photoUrl:r,returnSecureToken:!0},c=await or(s,zI(s.auth,a));s.displayName=c.displayName||null,s.photoURL=c.photoUrl||null;const l=s.providerData.find(({providerId:h})=>h==="password");l&&(l.displayName=s.displayName,l.photoURL=s.photoURL),await s._updateTokensIfNecessary(c)}function GI(n,e,t,r){return oe(n).onIdTokenChanged(e,t,r)}function KI(n,e,t){return oe(n).beforeAuthStateChanged(e,t)}function dP(n,e,t,r){return oe(n).onAuthStateChanged(e,t,r)}function fP(n){return oe(n).signOut()}const Ui="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class up{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ui,"1"),this.storage.removeItem(Ui),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QI=1e3,YI=10;class lp extends up{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=ep(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,l)=>{this.notifyListeners(a,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);gI()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,YI):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},QI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}lp.type="LOCAL";const JI=lp;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hp extends up{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}hp.type="SESSION";const dp=hp;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XI(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new go(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async h=>h(t.origin,i)),l=await XI(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}go.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZI{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,l)=>{const h=Bc("",20);s.port1.start();const p=setTimeout(()=>{l(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const T=m;if(T.data.eventId===h)switch(T.data.status){case"ack":clearTimeout(p),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(T.data.response);break;default:clearTimeout(p),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gt(){return window}function ev(n){gt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fp(){return typeof gt().WorkerGlobalScope<"u"&&typeof gt().importScripts=="function"}async function tv(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function nv(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function rv(){return fp()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pp="firebaseLocalStorageDb",sv=1,Fi="firebaseLocalStorage",mp="fbase_key";class xs{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function _o(n,e){return n.transaction([Fi],e?"readwrite":"readonly").objectStore(Fi)}function iv(){const n=indexedDB.deleteDatabase(pp);return new xs(n).toPromise()}function gp(){const n=indexedDB.open(pp,sv);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Fi,{keyPath:mp})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Fi)?e(r):(r.close(),await iv(),e(await gp()))})})}async function lh(n,e,t){const r=_o(n,!0).put({[mp]:e,value:t});return new xs(r).toPromise()}async function ov(n,e){const t=_o(n,!1).get(e),r=await new xs(t).toPromise();return r===void 0?null:r.value}function hh(n,e){const t=_o(n,!0).delete(e);return new xs(t).toPromise()}const av=800,cv=3;class _p{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=gp(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>cv)throw r;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(await s).close()}catch{}}}}async initializeServiceWorkerMessaging(){return fp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=go._getInstance(rv()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await tv(),!this.activeServiceWorker)return;this.sender=new ZI(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||nv()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await lh(e,Ui,"1"),await hh(e,Ui)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>lh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>ov(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>hh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=_o(s,!1).getAll();return new xs(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||di(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),av)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}_p.type="LOCAL";const uv=_p;new ks(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yp(n,e){return e?St(e):($(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qc extends Mc{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Zn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Zn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Zn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function lv(n){return ap(n.auth,new qc(n),n.bypassAuthState)}function hv(n){const{auth:e,user:t}=n;return $(t,e,"internal-error"),HI(t,new qc(n),n.bypassAuthState)}async function dv(n){const{auth:e,user:t}=n;return $(t,e,"internal-error"),jI(t,new qc(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wp{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return lv;case"linkViaPopup":case"linkViaRedirect":return dv;case"reauthViaPopup":case"reauthViaRedirect":return hv;default:Ze(this.auth,"internal-error")}}resolve(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fv=new ks(2e3,1e4);async function pP(n,e,t){if(Le(n.app))return Promise.reject(rt(n,"operation-not-supported-in-this-environment"));const r=It(n);YE(n,e,Fc);const s=yp(r,t);return new Rn(r,"signInViaPopup",e,s).executeNotNull()}class Rn extends wp{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Rn.currentPopupAction&&Rn.currentPopupAction.cancel(),Rn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return $(e,this.auth,"internal-error"),e}async onExecution(){Ot(this.filter.length===1,"Popup operations only handle one event");const e=Bc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(rt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(rt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Rn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(rt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,fv.get())};e()}}Rn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pv="pendingRedirect",mi=new Map;class mv extends wp{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=mi.get(this.auth._key());if(!e){try{const r=await gv(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}mi.set(this.auth._key(),e)}return this.bypassAuthState||mi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function gv(n,e){const t=wv(e),r=yv(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function _v(n,e){mi.set(n._key(),e)}function yv(n){return St(n._redirectPersistence)}function wv(n){return pi(pv,n.config.apiKey,n.name)}async function Tv(n,e,t=!1){if(Le(n.app))return Promise.reject(mt(n));const r=It(n),s=yp(r,e),a=await new mv(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ev=600*1e3;class Iv{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!vv(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Tp(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(rt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ev&&this.cachedEventUids.clear(),this.cachedEventUids.has(dh(e))}saveEventToCache(e){this.cachedEventUids.add(dh(e)),this.lastProcessedEventTime=Date.now()}}function dh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Tp({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function vv(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Tp(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Av(n,e={}){return Et(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rv=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Pv=/^https?/;async function Sv(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Av(n);for(const t of e)try{if(bv(t))return}catch{}Ze(n,"unauthorized-domain")}function bv(n){const e=ba(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Pv.test(t))return!1;if(Rv.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cv=new ks(3e4,6e4);function fh(){const n=gt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Vv(n){return new Promise((e,t)=>{var s,i,a;function r(){fh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{fh(),t(rt(n,"network-request-failed"))},timeout:Cv.get()})}if((i=(s=gt().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((a=gt().gapi)!=null&&a.load)r();else{const c=RI("iframefcb");return gt()[c]=()=>{gapi.load?r():t(rt(n,"network-request-failed"))},np(`${AI()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw gi=null,e})}let gi=null;function Nv(n){return gi=gi||Vv(n),gi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kv=new ks(5e3,15e3),Dv="__/auth/iframe",Ov="emulator/auth/iframe",xv={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Lv=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Mv(n){const e=n.config;$(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Oc(e,Ov):`https://${n.config.authDomain}/${Dv}`,r={apiKey:e.apiKey,appName:n.name,v:lr},s=Lv.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${Es(r).slice(1)}`}async function Uv(n){const e=await Nv(n),t=gt().gapi;return $(t,n,"internal-error"),e.open({where:document.body,url:Mv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:xv,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=rt(n,"network-request-failed"),c=gt().setTimeout(()=>{i(a)},kv.get());function l(){gt().clearTimeout(c),s(r)}r.ping(l).then(l,()=>{i(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Bv=500,qv=600,$v="_blank",jv="http://localhost";class ph{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Hv(n,e,t,r=Bv,s=qv){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const l={...Fv,width:r.toString(),height:s.toString(),top:i,left:a},h=be().toLowerCase();t&&(c=Qf(h)?$v:t),Gf(h)&&(e=e||jv,l.scrollbars="yes");const p=Object.entries(l).reduce((T,[b,N])=>`${T}${b}=${N},`,"");if(mI(h)&&c!=="_self")return Wv(e||"",c),new ph(null);const m=window.open(e||"",c,p);$(m,n,"popup-blocked");try{m.focus()}catch{}return new ph(m)}function Wv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zv="__/auth/handler",Gv="emulator/auth/handler",Kv=encodeURIComponent("fac");async function mh(n,e,t,r,s,i){$(n.config.authDomain,n,"auth-domain-config-required"),$(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:lr,eventId:s};if(e instanceof Fc){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Km(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,m]of Object.entries({}))a[p]=m}if(e instanceof Os){const p=e.getScopes().filter(m=>m!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const p of Object.keys(c))c[p]===void 0&&delete c[p];const l=await n._getAppCheckToken(),h=l?`#${Kv}=${encodeURIComponent(l)}`:"";return`${Qv(n)}?${Es(c).slice(1)}${h}`}function Qv({config:n}){return n.emulator?Oc(n,Gv):`https://${n.authDomain}/${zv}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ra="webStorageSupport";class Yv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=dp,this._completeRedirectFn=Tv,this._overrideRedirectResult=_v}async _openPopup(e,t,r,s){var a;Ot((a=this.eventManagers[e._key()])==null?void 0:a.manager,"_initialize() not called before _openPopup()");const i=await mh(e,t,r,ba(),s);return Hv(e,i,Bc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await mh(e,t,r,ba(),s);return ev(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Ot(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Uv(e),r=new Iv(e);return t.register("authEvent",s=>($(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ra,{type:ra},s=>{var a;const i=(a=s==null?void 0:s[0])==null?void 0:a[ra];i!==void 0&&t(!!i),Ze(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Sv(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return ep()||Kf()||Lc()}}const Jv=Yv;var gh="@firebase/auth",_h="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){$(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zv(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function eA(n){_t(new st("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;$(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:tp(n)},h=new EI(r,s,i,l);return VI(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),_t(new st("auth-internal",e=>{const t=It(e.getProvider("auth").getImmediate());return(r=>new Xv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Je(gh,_h,Zv(n)),Je(gh,_h,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tA=300,nA=Uh("authIdTokenMaxAge")||tA;let yh=null;const rA=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>nA)return;const s=t==null?void 0:t.token;yh!==s&&(yh=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function mP(n=Oa()){const e=ur(n,"auth");if(e.isInitialized())return e.getImmediate();const t=CI(n,{popupRedirectResolver:Jv,persistence:[uv,JI,dp]}),r=Uh("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=rA(i.toString());KI(t,a,()=>a(t.currentUser)),GI(t,c=>a(c))}}const s=Lh("auth");return s&&NI(t,`http://${s}`),t}function sA(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}II({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=rt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",sA().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});eA("Browser");const Ep="@firebase/installations",$c="0.6.24";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ip=1e4,vp=`w:${$c}`,Ap="FIS_v2",iA="https://firebaseinstallations.googleapis.com/v1",oA=3600*1e3,aA="installations",cA="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uA={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Ln=new Fn(aA,cA,uA);function Rp(n){return n instanceof Tt&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pp({projectId:n}){return`${iA}/projects/${n}/installations`}function Sp(n){return{token:n.token,requestStatus:2,expiresIn:hA(n.expiresIn),creationTime:Date.now()}}async function bp(n,e){const r=(await e.json()).error;return Ln.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Cp({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function lA(n,{refreshToken:e}){const t=Cp(n);return t.append("Authorization",dA(e)),t}async function Vp(n){const e=await n();return e.status>=500&&e.status<600?n():e}function hA(n){return Number(n.replace("s","000"))}function dA(n){return`${Ap} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fA({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=Pp(n),s=Cp(n),i=e.getImmediate({optional:!0});if(i){const h=await i.getHeartbeatsHeader();h&&s.append("x-firebase-client",h)}const a={fid:t,authVersion:Ap,appId:n.appId,sdkVersion:vp},c={method:"POST",headers:s,body:JSON.stringify(a)},l=await Vp(()=>fetch(r,c));if(l.ok){const h=await l.json();return{fid:h.fid||t,registrationStatus:2,refreshToken:h.refreshToken,authToken:Sp(h.authToken)}}else throw await bp("Create Installation",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Np(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pA(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mA=/^[cdef][\w-]{21}$/,Va="";function gA(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=_A(n);return mA.test(t)?t:Va}catch{return Va}}function _A(n){return pA(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Er(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ar=new Map;function kp(n,e){const t=Er(n);Dp(t,e),TA(t,e)}function yA(n,e){Op();const t=Er(n);let r=ar.get(t);r||(r=new Set,ar.set(t,r)),r.add(e)}function wA(n,e){const t=Er(n),r=ar.get(t);r&&(r.delete(e),r.size===0&&ar.delete(t),xp())}function Dp(n,e){const t=ar.get(n);if(t)for(const r of t)r(e)}function TA(n,e){const t=Op();t&&t.postMessage({key:n,fid:e}),xp()}let Pn=null;function Op(){return!Pn&&"BroadcastChannel"in self&&(Pn=new BroadcastChannel("[Firebase] FID Change"),Pn.onmessage=n=>{Dp(n.data.key,n.data.fid)}),Pn}function xp(){ar.size===0&&Pn&&(Pn.close(),Pn=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EA="firebase-installations-database",IA=1,Mn="firebase-installations-store";let sa=null;function jc(){return sa||(sa=qi(EA,IA,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(Mn)}}})),sa}async function Bi(n,e){const t=Er(n),s=(await jc()).transaction(Mn,"readwrite"),i=s.objectStore(Mn),a=await i.get(t);return await i.put(e,t),await s.done,(!a||a.fid!==e.fid)&&kp(n,e.fid),e}async function Lp(n){const e=Er(n),r=(await jc()).transaction(Mn,"readwrite");await r.objectStore(Mn).delete(e),await r.done}async function yo(n,e){const t=Er(n),s=(await jc()).transaction(Mn,"readwrite"),i=s.objectStore(Mn),a=await i.get(t),c=e(a);return c===void 0?await i.delete(t):await i.put(c,t),await s.done,c&&(!a||a.fid!==c.fid)&&kp(n,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hc(n){let e;const t=await yo(n.appConfig,r=>{const s=vA(r),i=AA(n,s);return e=i.registrationPromise,i.installationEntry});return t.fid===Va?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function vA(n){const e=n||{fid:gA(),registrationStatus:0};return Mp(e)}function AA(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(Ln.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=RA(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:PA(n)}:{installationEntry:e}}async function RA(n,e){try{const t=await fA(n,e);return Bi(n.appConfig,t)}catch(t){throw Rp(t)&&t.customData.serverCode===409?await Lp(n.appConfig):await Bi(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function PA(n){let e=await wh(n.appConfig);for(;e.registrationStatus===1;)await Np(100),e=await wh(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await Hc(n);return r||t}return e}function wh(n){return yo(n,e=>{if(!e)throw Ln.create("installation-not-found");return Mp(e)})}function Mp(n){return SA(n)?{fid:n.fid,registrationStatus:0}:n}function SA(n){return n.registrationStatus===1&&n.registrationTime+Ip<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bA({appConfig:n,heartbeatServiceProvider:e},t){const r=CA(n,t),s=lA(n,t),i=e.getImmediate({optional:!0});if(i){const h=await i.getHeartbeatsHeader();h&&s.append("x-firebase-client",h)}const a={installation:{sdkVersion:vp,appId:n.appId}},c={method:"POST",headers:s,body:JSON.stringify(a)},l=await Vp(()=>fetch(r,c));if(l.ok){const h=await l.json();return Sp(h)}else throw await bp("Generate Auth Token",l)}function CA(n,{fid:e}){return`${Pp(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wc(n,e=!1){let t;const r=await yo(n.appConfig,i=>{if(!Up(i))throw Ln.create("not-registered");const a=i.authToken;if(!e&&kA(a))return i;if(a.requestStatus===1)return t=VA(n,e),i;{if(!navigator.onLine)throw Ln.create("app-offline");const c=OA(i);return t=NA(n,c),c}});return t?await t:r.authToken}async function VA(n,e){let t=await Th(n.appConfig);for(;t.authToken.requestStatus===1;)await Np(100),t=await Th(n.appConfig);const r=t.authToken;return r.requestStatus===0?Wc(n,e):r}function Th(n){return yo(n,e=>{if(!Up(e))throw Ln.create("not-registered");const t=e.authToken;return xA(t)?{...e,authToken:{requestStatus:0}}:e})}async function NA(n,e){try{const t=await bA(n,e),r={...e,authToken:t};return await Bi(n.appConfig,r),t}catch(t){if(Rp(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Lp(n.appConfig);else{const r={...e,authToken:{requestStatus:0}};await Bi(n.appConfig,r)}throw t}}function Up(n){return n!==void 0&&n.registrationStatus===2}function kA(n){return n.requestStatus===2&&!DA(n)}function DA(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+oA}function OA(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function xA(n){return n.requestStatus===1&&n.requestTime+Ip<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function LA(n){const e=n,{installationEntry:t,registrationPromise:r}=await Hc(e);return r?r.catch(console.error):Wc(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MA(n,e=!1){const t=n;return await UA(t),(await Wc(t,e)).token}async function UA(n){const{registrationPromise:e}=await Hc(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FA(n,e){const{appConfig:t}=n;return yA(t,e),()=>{wA(t,e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BA(n){if(!n||!n.options)throw ia("App Configuration");if(!n.name)throw ia("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw ia(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function ia(n){return Ln.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fp="installations",qA="installations-internal",$A=n=>{const e=n.getProvider("app").getImmediate(),t=BA(e),r=ur(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},jA=n=>{const e=n.getProvider("app").getImmediate(),t=ur(e,Fp).getImmediate();return{getId:()=>LA(t),getToken:s=>MA(t,s)}};function HA(){_t(new st(Fp,$A,"PUBLIC")),_t(new st(qA,jA,"PRIVATE"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */HA();Je(Ep,$c);Je(Ep,$c,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WA="/firebase-messaging-sw.js",zA="/firebase-cloud-messaging-push-scope",Bp="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",GA="https://fcmregistrations.googleapis.com/v1",qp="google.c.a.c_id",KA="google.c.a.c_l",QA="google.c.a.ts",YA="google.c.a.e",Eh=1e4;var Ih;(function(n){n[n.DATA_MESSAGE=1]="DATA_MESSAGE",n[n.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(Ih||(Ih={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var cr;(function(n){n.PUSH_RECEIVED="push-received",n.NOTIFICATION_CLICKED="notification-clicked",n.FID_REGISTERED="fid-registered"})(cr||(cr={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(n){const e=new Uint8Array(n);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function $p(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(t),s=new Uint8Array(r.length);for(let i=0;i<r.length;++i)s[i]=r.charCodeAt(i);return s}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oa="fcm_token_details_db",JA=5,vh="fcm_token_object_Store";async function XA(n){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes(oa))return null;let e=null;return(await qi(oa,JA,{upgrade:async(r,s,i,a)=>{if(s<2||!r.objectStoreNames.contains(vh))return;const c=a.objectStore(vh),l=await c.index("fcmSenderId").get(n);if(await c.clear(),!!l){if(s===2){const h=l;if(!h.auth||!h.p256dh||!h.endpoint)return;e={token:h.fcmToken,createTime:h.createTime??Date.now(),subscriptionOptions:{auth:h.auth,p256dh:h.p256dh,endpoint:h.endpoint,swScope:h.swScope,vapidKey:typeof h.vapidKey=="string"?h.vapidKey:et(h.vapidKey)}}}else if(s===3){const h=l;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:et(h.auth),p256dh:et(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:et(h.vapidKey)}}}else if(s===4){const h=l;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:et(h.auth),p256dh:et(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:et(h.vapidKey)}}}}}})).close(),await si(oa),await si("fcm_vapid_details_db"),await si("undefined"),ZA(e)?e:null}function ZA(n){if(!n||!n.subscriptionOptions)return!1;const{subscriptionOptions:e}=n;return typeof n.createTime=="number"&&n.createTime>0&&typeof n.token=="string"&&n.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eR={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","fid-registration-failed":"A problem occurred while creating an FCM registration via FID: {$errorInfo}","fid-unregister-failed":"A problem occurred while unregistering the FCM registration via FID: {$errorInfo}","fid-registration-idb-schema-unavailable":"Unable to read or persist FID registration metadata because the messaging IndexedDB schema is unavailable (for example, the database could not be upgraded to the latest version).","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used.","invalid-on-registered-handler":"No onRegistered callback handler was provided or registered. Implement onRegistered() before register()."},ee=new Fn("messaging","Messaging",eR);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ah="firebase-messaging-database",Rh=2,Un="firebase-messaging-store",Vt="firebase-messaging-fid-registration-store",tR={openDB:qi,deleteDB:si};let Ph=tR,ts=null;function nR(n,e,t){switch(e){case 0:if(n.createObjectStore(Un),t===1)break;case 1:t===2&&n.createObjectStore(Vt)}}function Sh(n){return{upgrade:(e,t)=>{nR(e,t,n)},blocked:()=>{},blocking:(e,t,r)=>{var s;ts=null,(s=r.target)==null||s.close()},terminated:()=>{ts=null}}}function wo(){return ts||(ts=Ph.openDB(Ah,Rh,Sh(2)).catch(()=>Ph.openDB(Ah,Rh-1,Sh(1)))),ts}function jp(n,e){return n.objectStoreNames.contains(e)}function Hp(n){if(!jp(n,Vt))throw ee.create("fid-registration-idb-schema-unavailable")}async function rR(n){const e=To(n),r=await(await wo()).transaction(Un).objectStore(Un).get(e);if(r)return r;{const s=await XA(n.appConfig.senderId);if(s)return await zc(n,s),s}}async function zc(n,e){const t=To(n),r=await wo(),s=[Un],i=jp(r,Vt);i&&s.push(Vt);const a=r.transaction(s,"readwrite");return await a.objectStore(Un).put(e,t),i&&await a.objectStore(Vt).delete(t),await a.done,e}async function Wp(n){const e=To(n),t=await wo();return Hp(t),await t.transaction(Vt).objectStore(Vt).get(e)}async function sR(n,e){const t=To(n),r=await wo();Hp(r);const s=r.transaction([Un,Vt],"readwrite");return await s.objectStore(Vt).put(e,t),await s.objectStore(Un).delete(t),await s.done,e}function To({appConfig:n}){return n.appId}const bh="@firebase/messaging",Na="0.13.3";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iR=3,oR=1e3;async function aR(n,e){const t=await Io(n),r=Gc(e,n.appConfig.appName,!1),s={method:"POST",headers:t,body:JSON.stringify(r)};let i;try{i=await(await fetch(Eo(n.appConfig),s)).json()}catch(a){throw ee.create("token-subscribe-failed",{errorInfo:a==null?void 0:a.toString()})}if(i.error){const a=i.error.message;throw ee.create("token-subscribe-failed",{errorInfo:a})}if(!i.token)throw ee.create("token-subscribe-no-token");return i.token}async function cR(n,e){var l;const t=await Io(n),r=Gc(e,n.appConfig.appName,!0),s={method:"POST",headers:t,body:JSON.stringify(r)};let i;try{i=await fR(()=>fetch(Eo(n.appConfig),s),iR,oR)}catch(h){throw ee.create("fid-registration-failed",{errorInfo:h==null?void 0:h.toString()})}if(i.ok)return{responseFid:await uR(i)};let a;try{a=await i.json()}catch{throw ee.create("fid-registration-failed",{errorInfo:i.statusText})}const c=((l=a.error)==null?void 0:l.message)??i.statusText;throw ee.create("fid-registration-failed",{errorInfo:c})}async function uR(n){const e=await n.text();if(!e.trim())throw ee.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is empty"});let t;try{t=JSON.parse(e)}catch{throw ee.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is not valid JSON"})}const r=t.name;if(typeof r!="string"||r.length===0)throw ee.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response did not include a non-empty name"});return lR(r)}const Ch="/registrations/";function lR(n){const e=n.indexOf(Ch);if(e!==-1){const t=n.slice(e+Ch.length);if(t.length>0)return t}throw ee.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response name is not a valid registration resource name"})}async function hR(n,e){const t=await Io(n),r=Gc(e.subscriptionOptions,n.appConfig.appName,!1),s={method:"PATCH",headers:t,body:JSON.stringify(r)};let i;try{i=await(await fetch(`${Eo(n.appConfig)}/${e.token}`,s)).json()}catch(a){throw ee.create("token-update-failed",{errorInfo:a==null?void 0:a.toString()})}if(i.error){const a=i.error.message;throw ee.create("token-update-failed",{errorInfo:a})}if(!i.token)throw ee.create("token-update-no-token");return i.token}async function dR(n,e){const r={method:"DELETE",headers:await Io(n)};try{const i=await(await fetch(`${Eo(n.appConfig)}/${e}`,r)).json();if(i.error){const a=i.error.message;throw ee.create("token-unsubscribe-failed",{errorInfo:a})}}catch(s){throw ee.create("token-unsubscribe-failed",{errorInfo:s==null?void 0:s.toString()})}}async function fR(n,e,t){let r;for(let s=0;s<e;s++)try{return await n()}catch(i){if(r=i,s<e-1){const a=t*Math.pow(2,s);await new Promise(c=>setTimeout(c,a))}}throw r}function Eo({projectId:n}){return`${GA}/projects/${n}/registrations`}async function Io({appConfig:n,installations:e}){const t=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n.apiKey,"x-goog-firebase-installations-auth":`FIS ${t}`})}function pR(n,e){var t,r;try{if(/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(n))return new URL(n).host}catch{}try{if(typeof self<"u"&&((t=self.location)!=null&&t.href))return new URL(n,self.location.origin).host}catch{}return typeof self<"u"&&((r=self.location)!=null&&r.host)?self.location.host:e}function Gc({p256dh:n,auth:e,endpoint:t,vapidKey:r,swScope:s},i,a){const c={web:{origin:pR(s,i),endpoint:t,auth:e,p256dh:n}};return a&&(c.fcm_sdk_version=Na),r!==Bp&&(c.web.applicationPubKey=r),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mR=10080*60*1e3;async function gR(n){const e=await yR(n.swRegistration,n.vapidKey),t={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:e.endpoint,auth:et(e.getKey("auth")),p256dh:et(e.getKey("p256dh"))},r=await rR(n.firebaseDependencies);if(r){if(wR(r.subscriptionOptions,t))return Date.now()>=r.createTime+mR?_R(n,{token:r.token,createTime:Date.now(),subscriptionOptions:t}):r.token;try{await dR(n.firebaseDependencies,r.token)}catch(s){console.warn(s)}return Vh(n.firebaseDependencies,t)}else return Vh(n.firebaseDependencies,t)}async function _R(n,e){try{const t=await hR(n.firebaseDependencies,e),r={...e,token:t,createTime:Date.now()};return await zc(n.firebaseDependencies,r),t}catch(t){throw t}}async function Vh(n,e){const r={token:await aR(n,e),createTime:Date.now(),subscriptionOptions:e};return await zc(n,r),r.token}async function yR(n,e){const t=await n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:$p(e)})}function wR(n,e){const t=e.vapidKey===n.vapidKey,r=e.endpoint===n.endpoint,s=e.auth===n.auth,i=e.p256dh===n.p256dh;return t&&r&&s&&i}function TR(n,e){const t=n.onRegisteredHandler;t&&(typeof t=="function"?t(e):t.next(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ER(n){try{n.swRegistration=await navigator.serviceWorker.register(WA,{scope:zA}),n.swRegistration.update().catch(()=>{}),await IR(n.swRegistration)}catch(e){throw ee.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}}async function IR(n){return new Promise((e,t)=>{const r=setTimeout(()=>t(new Error(`Service worker not registered after ${Eh} ms`)),Eh),s=n.installing||n.waiting;n.active?(clearTimeout(r),e()):s?s.onstatechange=i=>{var a;((a=i.target)==null?void 0:a.state)==="activated"&&(s.onstatechange=null,clearTimeout(r),e())}:(clearTimeout(r),t(new Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zp(n,e){if(!e&&!n.swRegistration&&await ER(n),!(!e&&n.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw ee.create("invalid-sw-registration");n.swRegistration=e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gp(n,e){e?n.vapidKey=e:n.vapidKey||(n.vapidKey=Bp)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nh=3;async function vR(n,e){const t=await AR(n.swRegistration,n.vapidKey),r={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:t.endpoint,auth:et(t.getKey("auth")),p256dh:et(t.getKey("p256dh"))},s=n.firebaseDependencies.installations;for(let i=0;i<Nh;i++){const{responseFid:a}=await cR(n.firebaseDependencies,r);if(a===e)return;i<Nh-1&&await s.getToken(!0)}throw ee.create("fid-registration-failed",{errorInfo:"CreateRegistration response FID does not match Firebase Installation ID"})}async function AR(n,e){const t=await n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:$p(e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RR=10080*60*1e3;async function Kp(n,e){if(!navigator)throw ee.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw ee.create("permission-blocked");if(!n.onRegisteredHandler)throw ee.create("invalid-on-registered-handler");await Gp(n,e==null?void 0:e.vapidKey),await zp(n,e==null?void 0:e.serviceWorkerRegistration);const t=n._registerNotifyChain.catch(()=>{});return n._registerNotifyChain=t.then(async()=>{const r=await n.firebaseDependencies.installations.getId(),s=await Wp(n.firebaseDependencies),i=Date.now();if((!s||s.fid!==r||i>=s.lastRegisterTime+RR)&&(await vR(n,r),await sR(n.firebaseDependencies,{fid:r,lastRegisterTime:i,vapidKey:n.vapidKey})),!n.onRegisteredHandler)throw ee.create("invalid-on-registered-handler");TR(n,r)}),n._registerNotifyChain}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PR(n,e){return FA(e,()=>{(async()=>!n.onRegisteredHandler||!await Wp(n.firebaseDependencies)||await Kp(n).catch(()=>{}))()})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kh(n){const e={from:n.from,collapseKey:n.collapse_key,messageId:n.fcmMessageId};return SR(e,n),bR(e,n),CR(e,n),e}function SR(n,e){if(!e.notification)return;n.notification={};const t=e.notification.title;t&&(n.notification.title=t);const r=e.notification.body;r&&(n.notification.body=r);const s=e.notification.image;s&&(n.notification.image=s);const i=e.notification.icon;i&&(n.notification.icon=i)}function bR(n,e){e.data&&(n.data=e.data)}function CR(n,e){var s,i,a,c;if(!e.fcmOptions&&!((s=e.notification)!=null&&s.click_action))return;n.fcmOptions={};const t=((i=e.fcmOptions)==null?void 0:i.link)??((a=e.notification)==null?void 0:a.click_action);t&&(n.fcmOptions.link=t);const r=(c=e.fcmOptions)==null?void 0:c.analytics_label;r&&(n.fcmOptions.analyticsLabel=r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VR(n){return typeof n=="object"&&!!n&&qp in n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NR(n){if(!n||!n.options)throw aa("App Configuration Object");if(!n.name)throw aa("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:t}=n;for(const r of e)if(!t[r])throw aa(r);return{appName:n.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}function aa(n){return ee.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kR{constructor(e,t,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.onRegisteredHandler=null,this.onUnregisteredHandler=null,this._registerNotifyChain=Promise.resolve(),this._fidChangeUnsubscribe=null,this.logEvents=[],this.logQueue={state:"stopped"};const s=NR(e);this.firebaseDependencies={app:e,appConfig:s,installations:t,analyticsProvider:r}}_delete(){return this._fidChangeUnsubscribe&&(this._fidChangeUnsubscribe(),this._fidChangeUnsubscribe=null),this.logQueue.state==="scheduled"&&clearTimeout(this.logQueue.timerId),this.logQueue={state:"stopped"},Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qp(n,e){if(!navigator)throw ee.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw ee.create("permission-blocked");return await Gp(n,e==null?void 0:e.vapidKey),await zp(n,e==null?void 0:e.serviceWorkerRegistration),gR(n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DR(n,e,t){const r=OR(e);(await n.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:t[qp],message_name:t[KA],message_time:t[QA],message_device_time:Math.floor(Date.now()/1e3)})}function OR(n){switch(n){case cr.NOTIFICATION_CLICKED:return"notification_open";case cr.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xR(n,e){const t=e.data;if(!t.isFirebaseMessaging)return;if(n.onMessageHandler&&t.messageType===cr.PUSH_RECEIVED&&(typeof n.onMessageHandler=="function"?n.onMessageHandler(kh(t)):n.onMessageHandler.next(kh(t))),n.onRegisteredHandler&&t.messageType===cr.FID_REGISTERED){const s=t.fid;typeof n.onRegisteredHandler=="function"?n.onRegisteredHandler(s):n.onRegisteredHandler.next(s)}const r=t.data;VR(r)&&r[YA]==="1"&&await DR(n,t.messageType,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LR=n=>{const e=new kR(n.getProvider("app").getImmediate(),n.getProvider("installations-internal").getImmediate(),n.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",t=>xR(e,t)),e._fidChangeUnsubscribe=PR(e,n.getProvider("installations").getImmediate()),e},MR=n=>{const e=n.getProvider("messaging").getImmediate();return{getToken:r=>Qp(e,r),register:r=>Kp(e,r)}};function UR(){_t(new st("messaging",LR,"PUBLIC")),_t(new st("messaging-internal",MR,"PRIVATE")),Je(bh,Na),Je(bh,Na,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function FR(){try{await qh()}catch{return!1}return typeof window<"u"&&Bh()&&Wm()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BR(n,e){if(!navigator)throw ee.create("only-available-in-window");return n.onMessageHandler=e,()=>{n.onMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gP(n=Oa()){return FR().then(e=>{if(!e)throw ee.create("unsupported-browser")},e=>{throw ee.create("indexed-db-unsupported")}),ur(oe(n),"messaging").getImmediate()}async function _P(n,e){return n=oe(n),Qp(n,e)}function yP(n,e){return n=oe(n),BR(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */UR();export{uP as A,hP as B,lP as C,pP as D,Kt as G,Oa as a,mP as b,JR as c,GR as d,tP as e,zR as f,$R as g,rP as h,Fg as i,KR as j,nP as k,eP as l,iP as m,gP as n,yP as o,FR as p,XR as q,_P as r,jR as s,ZR as t,oP as u,sP as v,dP as w,fP as x,aP as y,cP as z};
