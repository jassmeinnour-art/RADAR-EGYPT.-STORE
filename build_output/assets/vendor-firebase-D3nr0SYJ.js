var e,t,n,r,s,i,a,o,B,c,u,l,h,C=Object.defineProperty,d=(e,t,n)=>((e,t,n)=>t in e?C(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n)(e,"symbol"!=typeof t?t+"":t,n);var p={};
/**
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
 */const f=function(e){const t=[];let n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):55296==(64512&s)&&r+1<e.length&&56320==(64512&e.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t},g={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<e.length;s+=3){const t=e[s],i=s+1<e.length,a=i?e[s+1]:0,o=s+2<e.length,B=o?e[s+2]:0,c=t>>2,u=(3&t)<<4|a>>4;let l=(15&a)<<2|B>>6,h=63&B;o||(h=64,i||(l=64)),r.push(n[c],n[u],n[l],n[h])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(f(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):function(e){const t=[];let n=0,r=0;for(;n<e.length;){const s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-65536;t[r++]=String.fromCharCode(55296+(i>>10)),t[r++]=String.fromCharCode(56320+(1023&i))}else{const i=e[n++],a=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&a)}}return t.join("")}(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<e.length;){const t=n[e.charAt(s++)],i=s<e.length?n[e.charAt(s)]:0;++s;const a=s<e.length?n[e.charAt(s)]:64;++s;const o=s<e.length?n[e.charAt(s)]:64;if(++s,null==t||null==i||null==a||null==o)throw new m;const B=t<<2|i>>4;if(r.push(B),64!==a){const e=i<<4&240|a>>2;if(r.push(e),64!==o){const e=a<<6&192|o;r.push(e)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class m extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const E=function(e){return function(e){const t=f(e);return g.encodeByteArray(t,!0)}(e).replace(/\./g,"")},D=function(e){try{return g.decodeString(e,!0)}catch(Kf){console.error("base64Decode failed: ",Kf)}return null};
/**
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
 */
const w=()=>
/**
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
 */
function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,y=()=>{try{return w()||(()=>{if("undefined"==typeof process)return;const e=p.__FIREBASE_DEFAULTS__;return e?JSON.parse(e):void 0})()||(()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(Kf){return}const t=e&&D(e[1]);return t&&JSON.parse(t)})()}catch(Kf){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${Kf}`)}},v=e=>{var t,n;return null==(n=null==(t=y())?void 0:t.emulatorHosts)?void 0:n[e]},_=()=>{var e;return null==(e=y())?void 0:e.config},I=e=>{var t;return null==(t=y())?void 0:t[`_${e}`]};
/**
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
 */
class T{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(t):e(t,n))}}}
/**
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
 */
/**
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
 */
function b(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function A(){return!function(){var e;const t=null==(e=y())?void 0:e.forceEnvironment;if("node"===t)return!0;if("browser"===t)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(Kf){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class O extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,O.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,N.prototype.create)}}class N{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?function(e,t){try{let n=0,r="";for(;n<e.length;){const s=e.indexOf("{$",n);if(-1===s){r+=e.substring(n);break}const i=e.indexOf("}",s+2);if(-1===i){r+=e.substring(n);break}const a=e.substring(s+2,i),o=t[a];r+=e.substring(n,s)+(null!=o?String(o):`<${a}?>`),n=i+1}return r}catch(Kf){return e}}(s,n):"Error",a=`${this.serviceName}: ${i} (${r}).`;return new O(r,a,n)}}function S(e,t){if(e===t)return!0;const n=Object.keys(e),r=Object.keys(t);for(const s of n){if(!r.includes(s))return!1;const n=e[s],i=t[s];if(F(n)&&F(i)){if(!S(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function F(e){return null!==e&&"object"==typeof e}
/**
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
 */function L(e){const t=[];for(const[n,r]of Object.entries(e))Array.isArray(r)?r.forEach(e=>{t.push(encodeURIComponent(n)+"="+encodeURIComponent(e))}):t.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return t.length?"&"+t.join("&"):""}function R(e){const t={};return e.replace(/^\?/,"").split("&").forEach(e=>{if(e){const[n,r]=e.split("=");t[decodeURIComponent(n)]=decodeURIComponent(r)}}),t}function k(e){const t=e.indexOf("?");if(!t)return"";const n=e.indexOf("#",t);return e.substring(t,n>0?n:void 0)}class P{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(e=>{this.error(e)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let r;if(void 0===e&&void 0===t&&void 0===n)throw new Error("Missing Observer.");r=function(e,t){if("object"!=typeof e||null===e)return!1;for(const n of t)if(n in e&&"function"==typeof e[n])return!0;return!1}(e,["next","error","complete"])?e:{next:e,error:t,complete:n},void 0===r.next&&(r.next=x),void 0===r.error&&(r.error=x),void 0===r.complete&&(r.complete=x);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch(Kf){}}),this.observers.push(r),s}unsubscribeOne(e){void 0!==this.observers&&void 0!==this.observers[e]&&(delete this.observers[e],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[e])try{t(this.observers[e])}catch(Kf){"undefined"!=typeof console&&console.error&&console.error(Kf)}})}close(e){this.finalized||(this.finalized=!0,void 0!==e&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function x(){}
/**
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
 */function M(e){return e&&e._delegate?e._delegate:e}
/**
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
 */function G(e){try{return(e.startsWith("http://")||e.startsWith("https://")?new URL(e).hostname:e).endsWith(".cloudworkstations.dev")}catch{return!1}}async function H(e){return(await fetch(e,{credentials:"include"})).ok}class U{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}
/**
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
 */const V="[DEFAULT]";
/**
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
 */class J{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const e=new T;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:t});n&&e.resolve(n)}catch(Kf){}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(null==e?void 0:e.identifier),n=(null==e?void 0:e.optional)??!1;if(!this.isInitialized(t)&&!this.shouldAutoInitialize()){if(n)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:t})}catch(Kf){if(n)return null;throw Kf}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
/**
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
 */(e))try{this.getOrInitializeService({instanceIdentifier:V})}catch(Kf){}for(const[e,t]of this.instancesDeferred.entries()){const n=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:n});t.resolve(e)}catch(Kf){}}}}clearInstance(e=V){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=V){return this.instances.has(e)}getOptions(e=V){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,i]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&i.resolve(r)}return r}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(n)??new Set;r.add(e),this.onInitCallbacks.set(n,r);const s=this.instances.get(n);return s&&e(s,n),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const r of n)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=e,r===V?void 0:r),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}var r;return n||null}normalizeInstanceIdentifier(e=V){return this.component?this.component.multipleInstances?e:V:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class j{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new J(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}
/**
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
 */var K,q;(q=K||(K={}))[q.DEBUG=0]="DEBUG",q[q.VERBOSE=1]="VERBOSE",q[q.INFO=2]="INFO",q[q.WARN=3]="WARN",q[q.ERROR=4]="ERROR",q[q.SILENT=5]="SILENT";const z={debug:K.DEBUG,verbose:K.VERBOSE,info:K.INFO,warn:K.WARN,error:K.ERROR,silent:K.SILENT},Q=K.INFO,Y={[K.DEBUG]:"log",[K.VERBOSE]:"log",[K.INFO]:"info",[K.WARN]:"warn",[K.ERROR]:"error"},W=(e,t,...n)=>{if(t<e.logLevel)return;const r=(new Date).toISOString(),s=Y[t];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);console[s](`[${r}]  ${e.name}:`,...n)};class ${constructor(e){this.name=e,this._logLevel=Q,this._logHandler=W,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in K))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?z[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,K.DEBUG,...e),this._logHandler(this,K.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,K.VERBOSE,...e),this._logHandler(this,K.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,K.INFO,...e),this._logHandler(this,K.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,K.WARN,...e),this._logHandler(this,K.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,K.ERROR,...e),this._logHandler(this,K.ERROR,...e)}}let X,Z;const ee=new WeakMap,te=new WeakMap,ne=new WeakMap,re=new WeakMap,se=new WeakMap;let ie={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return te.get(e);if("objectStoreNames"===t)return e.objectStoreNames||ne.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Be(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function ae(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(Z||(Z=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(ce(this),t),Be(ee.get(this))}:function(...t){return Be(e.apply(ce(this),t))}:function(t,...n){const r=e.call(ce(this),t,...n);return ne.set(r,t.sort?t.sort():[t]),Be(r)}}function oe(e){return"function"==typeof e?ae(e):(e instanceof IDBTransaction&&function(e){if(te.has(e))return;const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",i),e.removeEventListener("abort",i)},s=()=>{t(),r()},i=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",s),e.addEventListener("error",i),e.addEventListener("abort",i)});te.set(e,t)}(e),t=e,(X||(X=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(e=>t instanceof e)?new Proxy(e,ie):e);var t}function Be(e){if(e instanceof IDBRequest)return function(e){const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("success",s),e.removeEventListener("error",i)},s=()=>{t(Be(e.result)),r()},i=()=>{n(e.error),r()};e.addEventListener("success",s),e.addEventListener("error",i)});return t.then(t=>{t instanceof IDBCursor&&ee.set(t,e)}).catch(()=>{}),se.set(t,e),t}(e);if(re.has(e))return re.get(e);const t=oe(e);return t!==e&&(re.set(e,t),se.set(t,e)),t}const ce=e=>se.get(e);const ue=["get","getKey","getAll","getAllKeys","count"],le=["put","add","delete","clear"],he=new Map;function Ce(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(he.get(t))return he.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,s=le.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!s&&!ue.includes(n))return;const i=async function(e,...t){const i=this.transaction(e,s?"readwrite":"readonly");let a=i.store;return r&&(a=a.index(t.shift())),(await Promise.all([a[n](...t),s&&i.done]))[0]};return he.set(t,i),i}ie=(e=>({...e,get:(t,n,r)=>Ce(t,n)||e.get(t,n,r),has:(t,n)=>!!Ce(t,n)||e.has(t,n)}))(ie);
/**
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
 */
class de{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(function(e){const t=e.getComponent();return"VERSION"===(null==t?void 0:t.type)}(e)){const t=e.getImmediate();return`${t.library}/${t.version}`}return null}).filter(e=>e).join(" ")}}const pe="@firebase/app",fe="0.16.2",ge=new $("@firebase/app"),me="@firebase/app-compat",Ee="@firebase/analytics-compat",De="@firebase/analytics",we="@firebase/app-check-compat",ye="@firebase/app-check",ve="@firebase/auth",_e="@firebase/auth-compat",Ie="@firebase/database",Te="@firebase/data-connect",be="@firebase/database-compat",Ae="@firebase/functions",Oe="@firebase/functions-compat",Ne="@firebase/installations",Se="@firebase/installations-compat",Fe="@firebase/messaging",Le="@firebase/messaging-compat",Re="@firebase/performance",ke="@firebase/performance-compat",Pe="@firebase/remote-config",xe="@firebase/remote-config-compat",Me="@firebase/storage",Ge="@firebase/storage-compat",He="@firebase/firestore",Ue="@firebase/ai",Ve="@firebase/firestore-compat",Je="firebase",je="[DEFAULT]",Ke={[pe]:"fire-core",[me]:"fire-core-compat",[De]:"fire-analytics",[Ee]:"fire-analytics-compat",[ye]:"fire-app-check",[we]:"fire-app-check-compat",[ve]:"fire-auth",[_e]:"fire-auth-compat",[Ie]:"fire-rtdb",[Te]:"fire-data-connect",[be]:"fire-rtdb-compat",[Ae]:"fire-fn",[Oe]:"fire-fn-compat",[Ne]:"fire-iid",[Se]:"fire-iid-compat",[Fe]:"fire-fcm",[Le]:"fire-fcm-compat",[Re]:"fire-perf",[ke]:"fire-perf-compat",[Pe]:"fire-rc",[xe]:"fire-rc-compat",[Me]:"fire-gcs",[Ge]:"fire-gcs-compat",[He]:"fire-fst",[Ve]:"fire-fst-compat",[Ue]:"fire-vertex","fire-js":"fire-js",[Je]:"fire-js-all"},qe=new Map,ze=new Map,Qe=new Map;function Ye(e,t){try{e.container.addComponent(t)}catch(Kf){ge.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,Kf)}}function We(e){const t=e.name;if(Qe.has(t))return ge.debug(`There were multiple attempts to register component ${t}.`),!1;Qe.set(t,e);for(const n of qe.values())Ye(n,e);for(const n of ze.values())Ye(n,e);return!0}function $e(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function Xe(e){return null!=e&&void 0!==e.settings}
/**
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
 */const Ze=new N("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
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
 */
class et{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new U("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ze.create("app-deleted",{appName:this._name})}}
/**
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
 */const tt="12.19.0";function nt(e,t={}){let n=e;if("object"!=typeof t){t={name:t}}const r={name:je,automaticDataCollectionEnabled:!0,...t},s=r.name;if("string"!=typeof s||!s)throw Ze.create("bad-app-name",{appName:String(s)});if(n||(n=_()),!n)throw Ze.create("no-options");const i=qe.get(s);if(i){if(S(n,i.options)){if(S(r,i.config))return i;throw Ze.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}throw Ze.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(n)})}const a=new j(s);for(const B of Qe.values())a.addComponent(B);const o=new et(n,r,a);return qe.set(s,o),o}function rt(e=je){const t=qe.get(e);if(!t&&e===je&&_())return nt();if(!t)throw Ze.create("no-app",{appName:e});return t}function st(){return Array.from(qe.values())}function it(e,t,n){let r=Ke[e]??e;n&&(r+=`-${n}`);const s=r.match(/\s|\//),i=t.match(/\s|\//);if(s||i){const e=[`Unable to register library "${r}" with version "${t}":`];return s&&e.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&e.push("and"),i&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),void ge.warn(e.join(" "))}We(new U(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}
/**
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
 */const at="firebase-heartbeat-store";let ot=null;function Bt(){return ot||(ot=function(e,t,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(e,t),o=Be(a);return r&&a.addEventListener("upgradeneeded",e=>{r(Be(a.result),e.oldVersion,e.newVersion,Be(a.transaction),e)}),n&&a.addEventListener("blocked",e=>n(e.oldVersion,e.newVersion,e)),o.then(e=>{i&&e.addEventListener("close",()=>i()),s&&e.addEventListener("versionchange",e=>s(e.oldVersion,e.newVersion,e))}).catch(()=>{}),o}("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(at)}catch(Kf){console.warn(Kf)}}}).catch(e=>{throw Ze.create("idb-open",{originalErrorMessage:e.message})})),ot}async function ct(e,t){try{const n=(await Bt()).transaction(at,"readwrite"),r=n.objectStore(at);await r.put(t,ut(e)),await n.done}catch(Kf){if(Kf instanceof O)ge.warn(Kf.message);else{const t=Ze.create("idb-set",{originalErrorMessage:null==Kf?void 0:Kf.message});ge.warn(t.message)}}}function ut(e){return`${e.name}!${e.options.appId}`}
/**
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
 */class lt{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Ct(t),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){var e,t;try{const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=ht();if(null==(null==(e=this._heartbeatsCache)?void 0:e.heartbeats)&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==(null==(t=this._heartbeatsCache)?void 0:t.heartbeats)))return;if(this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(e=>e.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:n}),this._heartbeatsCache.heartbeats.length>30){const e=function(e){if(0===e.length)return-1;let t=0,n=e[0].date;for(let r=1;r<e.length;r++)e[r].date<n&&(n=e[r].date,t=r);return t}
/**
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
 */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(Kf){ge.warn(Kf)}}async getHeartbeatsHeader(){var e;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null==(e=this._heartbeatsCache)?void 0:e.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const t=ht(),{heartbeatsToSend:n,unsentEntries:r}=function(e,t=1024){const n=[];let r=e.slice();for(const s of e){const e=n.find(e=>e.agent===s.agent);if(e){if(e.dates.push(s.date),dt(n)>t){e.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),dt(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),s=E(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(Kf){return ge.warn(Kf),""}}}function ht(){return(new Date).toISOString().substring(0,10)}class Ct{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(Kf){return!1}}()&&new Promise((e,t)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var e;t((null==(e=s.error)?void 0:e.message)||"")}}catch(n){t(n)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const t=(await Bt()).transaction(at),n=await t.objectStore(at).get(ut(e));return await t.done,n}catch(Kf){if(Kf instanceof O)ge.warn(Kf.message);else{const t=Ze.create("idb-get",{originalErrorMessage:null==Kf?void 0:Kf.message});ge.warn(t.message)}}}(this.app);return(null==e?void 0:e.heartbeats)?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return ct(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return ct(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:[...t.heartbeats,...e.heartbeats]})}}}function dt(e){return E(JSON.stringify({version:2,heartbeats:e})).length}var pt;
/**
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
 */pt="",We(new U("platform-logger",e=>new de(e),"PRIVATE")),We(new U("heartbeat",e=>new lt(e),"PRIVATE")),it(pe,fe,pt),it(pe,fe,"esm2020"),it("fire-js","");function ft(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}
/**
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
 */
it("firebase","12.19.0","app");const gt=ft,mt=new N("auth","Firebase",{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}),Et=new $("@firebase/auth");function Dt(e,...t){Et.logLevel<=K.WARN&&Et.warn(`Auth (${tt}): ${e}`,...t)}function wt(e,...t){Et.logLevel<=K.ERROR&&Et.error(`Auth (${tt}): ${e}`,...t)}
/**
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
 */function yt(e,...t){throw bt(e,...t)}function vt(e,...t){return bt(e,...t)}function _t(e,t,n){const r={...gt(),[t]:n};return new N("auth","Firebase",r).create(t,{appName:e.name})}function It(e){return _t(e,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Tt(e,t,n){if(!(t instanceof n))throw n.name!==t.constructor.name&&yt(e,"argument-error"),_t(e,"argument-error",`Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function bt(e,...t){if("string"!=typeof e){const n=t[0],r=[...t.slice(1)];return r[0]&&(r[0].appName=e.name),e._errorFactory.create(n,...r)}return mt.create(e,...t)}function At(e,t,...n){if(!e)throw bt(t,...n)}function Ot(e){const t="INTERNAL ASSERTION FAILED: "+e;throw wt(t),new Error(t)}function Nt(e,t){e||Ot(t)}
/**
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
 */function St(){var e;return"undefined"!=typeof self&&(null==(e=self.location)?void 0:e.href)||""}function Ft(){var e;return"undefined"!=typeof self&&(null==(e=self.location)?void 0:e.protocol)||null}
/**
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
 */function Lt(){return"undefined"==typeof navigator||!navigator||!("onLine"in navigator)||"boolean"!=typeof navigator.onLine||"http:"!==Ft()&&"https:"!==Ft()&&!function(){const e="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof e&&void 0!==e.id}()&&!("connection"in navigator)||navigator.onLine}
/**
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
 */
class Rt{constructor(e,t){this.shortDelay=e,this.longDelay=t,Nt(t>e,"Short delay should be less than long delay!"),this.isMobile="undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(b())||"object"==typeof navigator&&"ReactNative"===navigator.product}get(){return Lt()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}
/**
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
 */function kt(e,t){Nt(e.emulator,"Emulator should always be set here");const{url:n}=e.emulator;return t?`${n}${t.startsWith("/")?t.slice(1):t}`:n}
/**
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
 */class Pt{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:"undefined"!=typeof globalThis&&globalThis.fetch?globalThis.fetch:"undefined"!=typeof fetch?fetch:void Ot("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:"undefined"!=typeof globalThis&&globalThis.Headers?globalThis.Headers:"undefined"!=typeof Headers?Headers:void Ot("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:"undefined"!=typeof globalThis&&globalThis.Response?globalThis.Response:"undefined"!=typeof Response?Response:void Ot("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}
/**
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
 */const xt={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"},Mt=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Gt=new Rt(3e4,6e4);
/**
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
 */function Ht(e,t){return e.tenantId&&!t.tenantId?{...t,tenantId:e.tenantId}:t}async function Ut(e,t,n,r,s={}){return Vt(e,s,async()=>{let s={},i={};r&&("GET"===t?i=r:s={body:JSON.stringify(r)});const a=L({...i,key:e.config.apiKey}).slice(1),o=await e._getAdditionalHeaders();o["Content-Type"]="application/json",e.languageCode&&(o["X-Firebase-Locale"]=e.languageCode);const B={method:t,headers:o,...s};return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent||(B.referrerPolicy="strict-origin-when-cross-origin"),e.emulatorConfig&&G(e.emulatorConfig.host)&&(B.credentials="include"),Pt.fetch()(await jt(e,e.config.apiHost,n,a),B)})}async function Vt(e,t,n){e._canInitEmulator=!1;const r={...xt,...t};try{const t=new qt(e),s=await Promise.race([n(),t.promise]);t.clearNetworkTimeout();const i=await s.json();if("needConfirmation"in i)throw zt(e,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{const t=s.ok?i.errorMessage:i.error.message,[n,a]=t.split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===n)throw zt(e,"credential-already-in-use",i);if("EMAIL_EXISTS"===n)throw zt(e,"email-already-in-use",i);if("USER_DISABLED"===n)throw zt(e,"user-disabled",i);const o=r[n]||n.toLowerCase().replace(/[_\s]+/g,"-");if(a)throw _t(e,o,a);yt(e,o)}}catch(Kf){if(Kf instanceof O)throw Kf;yt(e,"network-request-failed",{message:String(Kf)})}}async function Jt(e,t,n,r,s={}){const i=await Ut(e,t,n,r,s);return"mfaPendingCredential"in i&&yt(e,"multi-factor-auth-required",{_serverResponse:i}),i}async function jt(e,t,n,r){const s=`${t}${n}?${r}`,i=e,a=i.config.emulator?kt(e.config,s):`${e.config.apiScheme}://${s}`;if(Mt.includes(n)&&(await i._persistenceManagerAvailable,"COOKIE"===i._getPersistenceType())){return i._getPersistence()._getFinalTarget(a).toString()}return a}function Kt(e){switch(e){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class qt{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((e,t)=>{this.timer=setTimeout(()=>t(vt(this.auth,"network-request-failed")),Gt.get())})}}function zt(e,t,n){const r={appName:e.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=vt(e,t,r);return s.customData._tokenResponse=n,s}function Qt(e){return void 0!==e&&void 0!==e.enterprise}class Yt{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],void 0===e.recaptchaKey)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||0===this.recaptchaEnforcementState.length)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Kt(t.enforcementState);return null}isProviderEnabled(e){return"ENFORCE"===this.getProviderEnforcementState(e)||"AUDIT"===this.getProviderEnforcementState(e)}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Wt(e,t){return Ut(e,"POST","/v1/accounts:lookup",t)}
/**
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
 */function $t(e){if(e)try{const t=new Date(Number(e));if(!isNaN(t.getTime()))return t.toUTCString()}catch(Kf){}}function Xt(e){return 1e3*Number(e)}function Zt(e){const[t,n,r]=e.split(".");if(void 0===t||void 0===n||void 0===r)return wt("JWT malformed, contained fewer than 3 sections"),null;try{const e=D(n);return e?JSON.parse(e):(wt("Failed to decode base64 JWT payload"),null)}catch(Kf){return wt("Caught error parsing JWT payload as JSON",null==Kf?void 0:Kf.toString()),null}}function en(e){const t=Zt(e);return At(t,"internal-error"),At(void 0!==t.exp,"internal-error"),At(void 0!==t.iat,"internal-error"),Number(t.exp)-Number(t.iat)}
/**
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
 */async function tn(e,t,n=!1){if(n)return t;try{return await t}catch(Kf){throw Kf instanceof O&&function({code:e}){return"auth/user-disabled"===e||"auth/user-token-expired"===e}
/**
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
 */(Kf)&&e.auth.currentUser===e&&await e.auth.signOut(),Kf}}class nn{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(e){if(e){const e=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),e}{this.errorBackoff=3e4;const e=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,e)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(Kf){return void("auth/network-request-failed"===(null==Kf?void 0:Kf.code)&&this.schedule(!0))}this.schedule()}}
/**
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
 */class rn{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=$t(this.lastLoginAt),this.creationTime=$t(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}
/**
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
 */async function sn(e){var t;const n=e.auth,r=await e.getIdToken(),s=await tn(e,Wt(n,{idToken:r}));At(null==s?void 0:s.users.length,n,"internal-error");const i=s.users[0];e._notifyReloadListener(i);const a=(null==(t=i.providerUserInfo)?void 0:t.length)?an(i.providerUserInfo):[],o=(B=e.providerData,c=a,[...B.filter(e=>!c.some(t=>t.providerId===e.providerId)),...c]);var B,c;const u=e.isAnonymous,l=!(e.email&&i.passwordHash||(null==o?void 0:o.length)),h=!!u&&l,C={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new rn(i.createdAt,i.lastLoginAt),isAnonymous:h};Object.assign(e,C)}function an(e){return e.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}
/**
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
 */
/**
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
 */
class on{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){At(e.idToken,"internal-error"),At(void 0!==e.idToken,"internal-error"),At(void 0!==e.refreshToken,"internal-error");const t="expiresIn"in e&&void 0!==e.expiresIn?Number(e.expiresIn):en(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){At(0!==e.length,"internal-error");const t=en(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return t||!this.accessToken||this.isExpired?(At(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null):this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:r,expiresIn:s}=await async function(e,t){const n=await Vt(e,{},async()=>{const n=L({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:r,apiKey:s}=e.config,i=await jt(e,r,"/v1/token",`key=${s}`),a=await e._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const o={method:"POST",headers:a,body:n};return e.emulatorConfig&&G(e.emulatorConfig.host)&&(o.credentials="include"),Pt.fetch()(i,o)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}(e,t);this.updateTokensAndExpiration(n,r,Number(s))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+1e3*n}static fromJSON(e,t){const{refreshToken:n,accessToken:r,expirationTime:s}=t,i=new on;return n&&(At("string"==typeof n,"internal-error",{appName:e}),i.refreshToken=n),r&&(At("string"==typeof r,"internal-error",{appName:e}),i.accessToken=r),s&&(At("number"==typeof s,"internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new on,this.toJSON())}_performRefresh(){return Ot("not implemented")}}
/**
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
 */function Bn(e,t){At("string"==typeof e||void 0===e,"internal-error",{appName:t})}class cn{constructor({uid:e,auth:t,stsTokenManager:n,...r}){this.providerId="firebase",this.proactiveRefresh=new nn(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new rn(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await tn(this,this.stsTokenManager.getToken(this.auth,e));return At(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return async function(e,t=!1){const n=M(e),r=await n.getIdToken(t),s=Zt(r);At(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i="object"==typeof s.firebase?s.firebase:void 0,a=null==i?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:$t(Xt(s.auth_time)),issuedAtTime:$t(Xt(s.iat)),expirationTime:$t(Xt(s.exp)),signInProvider:a||null,signInSecondFactor:(null==i?void 0:i.sign_in_second_factor)||null}}(this,e)}reload(){return async function(e){const t=M(e);await sn(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}(this)}_assign(e){this!==e&&(At(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(e=>({...e})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new cn({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){At(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await sn(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Xe(this.auth.app))return Promise.reject(It(this.auth));const e=await this.getIdToken();return await tn(this,
/**
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
 */
async function(e,t){return Ut(e,"POST","/v1/accounts:delete",t)}(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,r=t.email??void 0,s=t.phoneNumber??void 0,i=t.photoURL??void 0,a=t.tenantId??void 0,o=t._redirectEventId??void 0,B=t.createdAt??void 0,c=t.lastLoginAt??void 0,{uid:u,emailVerified:l,isAnonymous:h,providerData:C,stsTokenManager:d}=t;At(u&&d,e,"internal-error");const p=on.fromJSON(this.name,d);At("string"==typeof u,e,"internal-error"),Bn(n,e.name),Bn(r,e.name),At("boolean"==typeof l,e,"internal-error"),At("boolean"==typeof h,e,"internal-error"),Bn(s,e.name),Bn(i,e.name),Bn(a,e.name),Bn(o,e.name),Bn(B,e.name),Bn(c,e.name);const f=new cn({uid:u,auth:e,email:r,emailVerified:l,displayName:n,isAnonymous:h,photoURL:i,phoneNumber:s,tenantId:a,stsTokenManager:p,createdAt:B,lastLoginAt:c});return C&&Array.isArray(C)&&(f.providerData=C.map(e=>({...e}))),o&&(f._redirectEventId=o),f}static async _fromIdTokenResponse(e,t,n=!1){const r=new on;r.updateFromServerResponse(t);const s=new cn({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:n});return await sn(s),s}static async _fromGetAccountInfoResponse(e,t,n){const r=t.users[0];At(void 0!==r.localId,"internal-error");const s=void 0!==r.providerUserInfo?an(r.providerUserInfo):[],i=!(r.email&&r.passwordHash||(null==s?void 0:s.length)),a=new on;a.updateFromIdToken(n);const o=new cn({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:i}),B={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new rn(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash||(null==s?void 0:s.length))};return Object.assign(o,B),o}}
/**
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
 */const un=new Map;function ln(e){Nt(e instanceof Function,"Expected a class definition");let t=un.get(e);return t?(Nt(t instanceof e,"Instance stored in cache mismatched with class"),t):(t=new e,un.set(e,t),t)}
/**
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
 */class hn{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return void 0===t?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}hn.type="NONE";const Cn=hn;
/**
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
 */function dn(e,t,n){return`firebase:${e}:${t}:${n}`}class pn{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:r,name:s}=this.auth;this.fullUserKey=dn(this.userKey,r.apiKey,s),this.fullPersistenceKey=dn("persistence",r.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if("string"==typeof e){const t=await Wt(this.auth,{idToken:e}).catch(()=>{});return t?cn._fromGetAccountInfoResponse(this.auth,t,e):null}return cn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();return await this.removeCurrentUser(),this.persistence=e,t?this.setCurrentUser(t):void 0}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,n="authUser"){if(!t.length)return new pn(ln(Cn),e,n);const r=(await Promise.all(t.map(async e=>{try{if(await e._isAvailable())return e}catch{return}}))).filter(e=>e);let s=r[0]||ln(Cn);const i=dn(n,e.config.apiKey,e.name);let a=null;for(const B of t)try{const t=await B._get(i);if(t){let n;if("string"==typeof t){const r=await Wt(e,{idToken:t}).catch(()=>{});if(!r)break;n=await cn._fromGetAccountInfoResponse(e,r,t)}else n=cn._fromJSON(e,t);B!==s&&(a=n),s=B;break}}catch{}const o=r.filter(e=>e._shouldAllowMigration);return s._shouldAllowMigration&&o.length?(s=o[0],a&&await s._set(i,a.toJSON()),await Promise.all(t.map(async e=>{if(e!==s)try{await e._remove(i)}catch{}})),new pn(s,e,n)):new pn(s,e,n)}}
/**
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
 */function fn(e){const t=e.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(Dn(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(gn(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(yn(t))return"Blackberry";if(vn(t))return"Webos";if(mn(t))return"Safari";if((t.includes("chrome/")||En(t))&&!t.includes("edge/"))return"Chrome";if(wn(t))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=e.match(t);if(2===(null==n?void 0:n.length))return n[1]}return"Other"}function gn(e=b()){return/firefox\//i.test(e)}function mn(e=b()){const t=e.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function En(e=b()){return/crios\//i.test(e)}function Dn(e=b()){return/iemobile/i.test(e)}function wn(e=b()){return/android/i.test(e)}function yn(e=b()){return/blackberry/i.test(e)}function vn(e=b()){return/webos/i.test(e)}function _n(e=b()){return/iphone|ipad|ipod/i.test(e)||/macintosh/i.test(e)&&/mobile/i.test(e)}function In(){return function(){const e=b();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0}()&&10===document.documentMode}function Tn(e=b()){return _n(e)||wn(e)||vn(e)||yn(e)||/windows phone/i.test(e)||Dn(e)}
/**
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
 */function bn(e,t=[]){let n;switch(e){case"Browser":n=fn(b());break;case"Worker":n=`${fn(b())}-${e}`;break;default:n=e}const r=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${tt}/${r}`}
/**
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
 */class An{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=t=>new Promise((n,r)=>{try{n(e(t))}catch(Kf){r(Kf)}});n.onAbort=t,this.queue.push(n);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(Kf){t.reverse();for(const r of t)try{r()}catch(n){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:null==Kf?void 0:Kf.message})}}}
/**
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
 */class On{constructor(e){var t;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??6,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),void 0!==n.containsLowercaseCharacter&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),void 0!==n.containsUppercaseCharacter&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),void 0!==n.containsNumericCharacter&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),void 0!==n.containsNonAlphanumericCharacter&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,"ENFORCEMENT_STATE_UNSPECIFIED"===this.enforcementState&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(null==(t=e.allowedNonAlphanumericCharacters)?void 0:t.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){let n;this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);for(let r=0;r<e.length;r++)n=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}
/**
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
 */class Nn{constructor(e,t,n,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Fn(this),this.idTokenSubscription=new Fn(this),this.beforeStateQueue=new An(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=mt,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(e=>this._resolvePersistenceManagerAvailable=e)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ln(t)),this._initializationPromise=this.queue(async()=>{var n,r,s;if(!this._deleted){try{this.persistenceManager=await pn.create(this,e)}catch(Kf){Dt(`Failed to initialize persistence: ${Kf}`),this.persistenceManager=await pn.create(this,[])}finally{null==(n=this._resolvePersistenceManagerAvailable)||n.call(this)}if(!this._deleted){if(null==(r=this._popupRedirectResolver)?void 0:r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(Kf){}try{await this.initializeCurrentUser(t)}catch(Kf){Dt(`Failed to initialize current user: ${Kf}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=(null==(s=this.currentUser)?void 0:s.uid)||null,this._deleted||(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();return this.currentUser||e?this.currentUser&&e&&this.currentUser.uid===e.uid?(this._currentUser._assign(e),void(await this.currentUser.getIdToken())):void(await this._updateCurrentUser(e,!0)):void 0}async initializeCurrentUserFromIdToken(e){try{const t=await Wt(this,{idToken:e}),n=await cn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Xe(this.app)){const e=this.app.settings.authIdToken;return e?new Promise(t=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(e).then(t,t))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const n=null==(t=this.redirectUser)?void 0:t._redirectEventId,i=null==r?void 0:r._redirectEventId,a=await this.tryRedirectSignIn(e);n&&n!==i||!(null==a?void 0:a.user)||(r=a.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(Kf){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(Kf))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return At(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(Kf){await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await sn(e)}catch(Kf){if("auth/network-request-failed"!==(null==Kf?void 0:Kf.code))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;const e=navigator;return e.languages&&e.languages[0]||e.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Xe(this.app))return Promise.reject(It(this));const t=e?M(e):null;return t&&At(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&At(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Xe(this.app)?Promise.reject(It(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Xe(this.app)?Promise.reject(It(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ln(e))})}_getRecaptchaConfig(){return null==this.tenantId?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return null===this.tenantId?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await async function(e,t={}){return Ut(e,"GET","/v2/passwordPolicy",Ht(e,t))}
/**
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
 */(this),t=new On(e);null===this.tenantId?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new N("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:await this.currentUser.getIdToken()};null!=this.tenantId&&(t.tenantId=this.tenantId),await async function(e,t){return Ut(e,"POST","/v2/accounts:revokeToken",Ht(e,t))}(this,t)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:null==(e=this._currentUser)?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return null===e?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ln(e)||this._popupRedirectResolver;At(t,this,"argument-error"),this.redirectPersistenceManager=await pn.create(this,[ln(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),(null==(t=this._currentUser)?void 0:t._redirectEventId)===e?this._currentUser:(null==(n=this.redirectUser)?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const t=(null==(e=this.currentUser)?void 0:e.uid)??null;this.lastNotifiedUid!==t&&(this.lastNotifiedUid=t,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,r){if(this._deleted)return()=>{};const s="function"==typeof t?t:t.next.bind(t);let i=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(At(a,this,"internal-error"),a.then(()=>{i||s(this.currentUser)}).catch(e=>{if(!i)if("function"!=typeof t&&t.error)t.error(e);else{if(!n)throw e;n(e)}}),"function"==typeof t){const s=e.addObserver(t,n,r);return()=>{i=!0,s()}}{const n=e.addObserver(t);return()=>{i=!0,n()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(Kf){const t=_t(this,"internal-error",`An internal AuthError has occurred: ${(null==Kf?void 0:Kf.message)||String(Kf)}`);throw t.customData={originalError:Kf},t}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return At(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){e&&!this.frameworks.includes(e)&&(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=bn(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await(null==(e=this.heartbeatServiceProvider.getImmediate({optional:!0}))?void 0:e.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(t["X-Firebase-AppCheck"]=r),t}async _getAppCheckToken(){var e;if(Xe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await(null==(e=this.appCheckServiceProvider.getImmediate({optional:!0}))?void 0:e.getToken());return(null==t?void 0:t.error)&&Dt(`Error while retrieving App Check token: ${t.error}`),null==t?void 0:t.token}}function Sn(e){return M(e)}class Fn{constructor(e){this.auth=e,this.observer=null,this.addObserver=function(e,t){const n=new P(e,t);return n.subscribe.bind(n)}(e=>this.observer=e)}get next(){return At(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}
/**
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
 */let Ln={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Rn(e){return Ln.loadJS(e)}class kn{constructor(){this.enterprise=new Pn}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Pn{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}
/**
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
 */const xn="NO_RECAPTCHA",Mn="onFirebaseAuthREInstanceReady";class Gn{constructor(e){this.type="recaptcha-enterprise",this.auth=Sn(e)}async verify(e="verify",t=!1){async function n(e){if(!t){if(null==e.tenantId&&null!=e._agentRecaptchaConfig)return e._agentRecaptchaConfig.siteKey;if(null!=e.tenantId&&void 0!==e._tenantRecaptchaConfigs[e.tenantId])return e._tenantRecaptchaConfigs[e.tenantId].siteKey}return new Promise(async(t,n)=>{(async function(e,t){return Ut(e,"GET","/v2/recaptchaConfig",Ht(e,t))})(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(r=>{if(void 0!==r.recaptchaKey){const n=new Yt(r);return null==e.tenantId?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,t(n.siteKey)}n(new Error("recaptcha Enterprise site key undefined"))}).catch(e=>{n(e)})})}function r(t,n,r){const s=window.grecaptcha;Qt(s)?s.enterprise.ready(()=>{s.enterprise.execute(t,{action:e}).then(e=>{n(e)}).catch(()=>{n(xn)})}):r(Error("No reCAPTCHA enterprise script loaded."))}if(this.auth.settings.appVerificationDisabledForTesting){return(new kn).execute("siteKey",{action:"verify"})}return new Promise((e,s)=>{n(this.auth).then(async n=>{if(!t&&Qt(window.grecaptcha)&&Gn.scriptInjectionDeferred)await Gn.scriptInjectionDeferred.promise,r(n,e,s);else{if("undefined"==typeof window)return void s(new Error("RecaptchaVerifier is only supported in browser"));let t=Ln.recaptchaEnterpriseScript;0!==t.length&&(t+=n+`&onload=${Mn}`),Gn.scriptInjectionDeferred=new T,window[Mn]=()=>{var e;null==(e=Gn.scriptInjectionDeferred)||e.resolve()},Rn(t).then(()=>{var e;return null==(e=Gn.scriptInjectionDeferred)?void 0:e.promise}).then(()=>{r(n,e,s)}).catch(e=>{s(e)})}}).catch(e=>{s(e)})})}}async function Hn(e,t,n,r=!1,s=!1){const i=new Gn(e);let a;if(s)a=xn;else try{a=await i.verify(n)}catch(B){a=await i.verify(n,!0)}const o={...t};if("mfaSmsEnrollment"===n||"mfaSmsSignIn"===n){if("phoneEnrollmentInfo"in o){const e=o.phoneEnrollmentInfo.phoneNumber,t=o.phoneEnrollmentInfo.recaptchaToken;Object.assign(o,{phoneEnrollmentInfo:{phoneNumber:e,recaptchaToken:t,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in o){const e=o.phoneSignInInfo.recaptchaToken;Object.assign(o,{phoneSignInInfo:{recaptchaToken:e,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return o}return r?Object.assign(o,{captchaResp:a}):Object.assign(o,{captchaResponse:a}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function Un(e,t,n,r,s){var i;if(null==(i=e._getRecaptchaConfig())?void 0:i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const s=await Hn(e,t,n,"getOobCode"===n);return r(e,s)}return r(e,t).catch(async s=>{if("auth/missing-recaptcha-token"===s.code){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const s=await Hn(e,t,n,"getOobCode"===n);return r(e,s)}return Promise.reject(s)})}
/**
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
 */function Vn(e,t,n){const r=Sn(e);At(/^https?:\/\//.test(t),r,"invalid-emulator-scheme");const s=Jn(t),{host:i,port:a}=function(e){const t=Jn(e),n=/(\/\/)?([^?#/]+)/.exec(e.substr(t.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const e=s[1];return{host:e,port:jn(r.substr(e.length+1))}}{const[e,t]=r.split(":");return{host:e,port:jn(t)}}}(t),o=null===a?"":`:${a}`,B={url:`${s}//${i}${o}/`},c=Object.freeze({host:i,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:!1})});if(!r._canInitEmulator)return At(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),void At(S(B,r.config.emulator)&&S(c,r.emulatorConfig),r,"emulator-config-failed");r.config.emulator=B,r.emulatorConfig=c,r.settings.appVerificationDisabledForTesting=!0,G(i)?H(`${s}//${i}${o}`):function(){function e(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}"undefined"!=typeof console&&"function"==typeof console.info&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");"undefined"!=typeof window&&"undefined"!=typeof document&&("loading"===document.readyState?window.addEventListener("DOMContentLoaded",e):e())}
/**
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
 */()}function Jn(e){const t=e.indexOf(":");return t<0?"":e.substr(0,t+1)}function jn(e){if(!e)return null;const t=Number(e);return isNaN(t)?null:t}Gn.scriptInjectionDeferred=null;class Kn{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Ot("not implemented")}_getIdTokenResponse(e){return Ot("not implemented")}_linkToIdToken(e,t){return Ot("not implemented")}_getReauthenticationResolver(e){return Ot("not implemented")}}async function qn(e,t){return Ut(e,"POST","/v1/accounts:signUp",t)}
/**
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
 */async function zn(e,t){return Jt(e,"POST","/v1/accounts:signInWithPassword",Ht(e,t))}async function Qn(e,t){return async function(e,t){return Ut(e,"POST","/v1/accounts:sendOobCode",Ht(e,t))}(e,t)}
/**
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
 */
/**
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
 */
class Yn extends Kn{constructor(e,t,n,r=null){super("password",n),this._email=e,this._password=t,this._tenantId=r}static _fromEmailAndPassword(e,t){return new Yn(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new Yn(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t="string"==typeof e?JSON.parse(e):e;if((null==t?void 0:t.email)&&(null==t?void 0:t.password)){if("password"===t.signInMethod)return this._fromEmailAndPassword(t.email,t.password);if("emailLink"===t.signInMethod)return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":return Un(e,{returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signInWithPassword",zn);case"emailLink":return async function(e,t){return Jt(e,"POST","/v1/accounts:signInWithEmailLink",Ht(e,t))}(e,{email:this._email,oobCode:this._password});default:yt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":return Un(e,{idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",qn);case"emailLink":return async function(e,t){return Jt(e,"POST","/v1/accounts:signInWithEmailLink",Ht(e,t))}(e,{idToken:t,email:this._email,oobCode:this._password});default:yt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}
/**
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
 */async function Wn(e,t){return Jt(e,"POST","/v1/accounts:signInWithIdp",Ht(e,t))}
/**
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
 */class $n extends Kn{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new $n(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):yt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t="string"==typeof e?JSON.parse(e):e,{providerId:n,signInMethod:r,...s}=t;if(!n||!r)return null;const i=new $n(n,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){return Wn(e,this.buildRequest())}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Wn(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Wn(e,t)}buildRequest(){const e={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=L(t)}return e}}
/**
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
 */class Xn{constructor(e){const t=R(k(e)),n=t.apiKey??null,r=t.oobCode??null,s=function(e){switch(e){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}(t.mode??null);At(n&&r&&s,"argument-error"),this.apiKey=n,this.operation=s,this.code=r,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=function(e){const t=R(k(e)).link,n=t?R(k(t)).deep_link_id:null,r=R(k(e)).deep_link_id;return(r?R(k(r)).link:null)||r||n||t||e}(e);try{return new Xn(t)}catch{return null}}}
/**
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
 */class Zn{constructor(){this.providerId=Zn.PROVIDER_ID}static credential(e,t){return Yn._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=Xn.parseLink(t);return At(n,"argument-error"),Yn._fromEmailAndCode(e,n.code,n.tenantId)}}Zn.PROVIDER_ID="password",Zn.EMAIL_PASSWORD_SIGN_IN_METHOD="password",Zn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";
/**
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
 */
class er{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}
/**
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
 */class tr extends er{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}
/**
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
 */class nr extends tr{constructor(){super("facebook.com")}static credential(e){return $n._fromParams({providerId:nr.PROVIDER_ID,signInMethod:nr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return nr.credentialFromTaggedObject(e)}static credentialFromError(e){return nr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return nr.credential(e.oauthAccessToken)}catch{return null}}}nr.FACEBOOK_SIGN_IN_METHOD="facebook.com",nr.PROVIDER_ID="facebook.com";
/**
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
 */
class rr extends tr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return $n._fromParams({providerId:rr.PROVIDER_ID,signInMethod:rr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return rr.credentialFromTaggedObject(e)}static credentialFromError(e){return rr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return rr.credential(t,n)}catch{return null}}}rr.GOOGLE_SIGN_IN_METHOD="google.com",rr.PROVIDER_ID="google.com";
/**
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
 */
class sr extends tr{constructor(){super("github.com")}static credential(e){return $n._fromParams({providerId:sr.PROVIDER_ID,signInMethod:sr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return sr.credentialFromTaggedObject(e)}static credentialFromError(e){return sr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return sr.credential(e.oauthAccessToken)}catch{return null}}}sr.GITHUB_SIGN_IN_METHOD="github.com",sr.PROVIDER_ID="github.com";
/**
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
 */
class ir extends tr{constructor(){super("twitter.com")}static credential(e,t){return $n._fromParams({providerId:ir.PROVIDER_ID,signInMethod:ir.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ir.credentialFromTaggedObject(e)}static credentialFromError(e){return ir.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return ir.credential(t,n)}catch{return null}}}
/**
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
 */
async function ar(e,t){return Jt(e,"POST","/v1/accounts:signUp",Ht(e,t))}
/**
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
 */ir.TWITTER_SIGN_IN_METHOD="twitter.com",ir.PROVIDER_ID="twitter.com";class or{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,r=!1){const s=await cn._fromIdTokenResponse(e,n,r),i=Br(n);return new or({user:s,providerId:i,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const r=Br(n);return new or({user:e,providerId:r,_tokenResponse:n,operationType:t})}}function Br(e){return e.providerId?e.providerId:"phoneNumber"in e?"phone":null}
/**
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
 */async function cr(e){var t;if(Xe(e.app))return Promise.reject(It(e));const n=Sn(e);if(await n._initializationPromise,null==(t=n.currentUser)?void 0:t.isAnonymous)return new or({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await ar(n,{returnSecureToken:!0}),s=await or._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}
/**
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
 */class ur extends O{constructor(e,t,n,r){super(t.code,t.message),this.operationType=n,this.user=r,Object.setPrototypeOf(this,ur.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,r){return new ur(e,t,n,r)}}function lr(e,t,n,r){return("reauthenticate"===t?n._getReauthenticationResolver(e):n._getIdTokenResponse(e)).catch(n=>{if("auth/multi-factor-auth-required"===n.code)throw ur._fromErrorAndOperation(e,n,t,r);throw n})}
/**
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
 */
async function hr(e,t,n=!1){if(Xe(e.app))return Promise.reject(It(e));const r="signIn",s=await lr(e,r,t),i=await or._fromIdTokenResponse(e,r,s);return n||await e._updateCurrentUser(i.user),i}
/**
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
 */
async function Cr(e){const t=Sn(e);t._getPasswordPolicyInternal()&&await t._updatePasswordPolicy()}async function dr(e,t,n){const r=Sn(e),s={requestType:"PASSWORD_RESET",email:t,clientType:"CLIENT_TYPE_WEB"};await Un(r,s,"getOobCode",Qn)}async function pr(e,t,n){if(Xe(e.app))return Promise.reject(It(e));const r=Sn(e),s=Un(r,{returnSecureToken:!0,email:t,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ar),i=await s.catch(t=>{throw"auth/password-does-not-meet-requirements"===t.code&&Cr(e),t}),a=await or._fromIdTokenResponse(r,"signIn",i);return await r._updateCurrentUser(a.user),a}function fr(e,t,n){return Xe(e.app)?Promise.reject(It(e)):async function(e,t){return hr(Sn(e),t)}(M(e),Zn.credential(t,n)).catch(async t=>{throw"auth/password-does-not-meet-requirements"===t.code&&Cr(e),t})}
/**
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
 */
/**
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
 */
async function gr(e,t){const{displayName:n,photoURL:r}=t;if(void 0===n&&void 0===r)return;const s=M(e),i={idToken:await s.getIdToken(),displayName:n,photoUrl:r,returnSecureToken:!0},a=await tn(s,async function(e,t){return Ut(e,"POST","/v1/accounts:update",t)}(s.auth,i));s.displayName=a.displayName||null,s.photoURL=a.photoUrl||null;const o=s.providerData.find(({providerId:e})=>"password"===e);o&&(o.displayName=s.displayName,o.photoURL=s.photoURL),await s._updateTokensIfNecessary(a)}function mr(e,t,n,r){return M(e).onAuthStateChanged(t,n,r)}function Er(e){return M(e).signOut()}const Dr="__sak";
/**
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
 */class wr{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Dr,"1"),this.storage.removeItem(Dr),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}
/**
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
 */class yr extends wr{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Tn(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),r=this.localCache[t];n!==r&&e(t,r,n)}}onStorageEvent(e,t=!1){if(!e.key)return void this.forAllChangedKeys((e,t,n)=>{this.notifyListeners(e,n)});const n=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const e=this.storage.getItem(n);(t||this.localCache[n]!==e)&&this.notifyListeners(n,e)},s=this.storage.getItem(n);In()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,10):r()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const r of Array.from(n))r(t?JSON.parse(t):t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}yr.type="LOCAL";const vr=yr;
/**
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
 */class _r extends wr{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}_r.type="SESSION";const Ir=_r;
/**
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
 */
/**
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
 */
class Tr{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(t=>t.isListeningto(e));if(t)return t;const n=new Tr(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:r,data:s}=t.data,i=this.handlersMap[r];if(!(null==i?void 0:i.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:r});const a=Array.from(i).map(async e=>e(t.origin,s)),o=await function(e){return Promise.all(e.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}(a);t.ports[0].postMessage({status:"done",eventId:n,eventType:r,response:o})}_subscribe(e,t){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),t&&0!==this.handlersMap[e].size||delete this.handlersMap[e],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}
/**
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
 */
function br(e="",t=10){let n="";for(let r=0;r<t;r++)n+=Math.floor(10*Math.random());return e+n}
/**
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
 */Tr.receivers=[];class Ar{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const r="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((a,o)=>{const B=br("",20);r.port1.start();const c=setTimeout(()=>{o(new Error("unsupported_event"))},n);i={messageChannel:r,onMessage(e){const t=e;if(t.data.eventId===B)switch(t.data.status){case"ack":clearTimeout(c),s=setTimeout(()=>{o(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(t.data.response);break;default:clearTimeout(c),clearTimeout(s),o(new Error("invalid_response"))}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:B,data:t},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}}
/**
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
 */function Or(){return window}
/**
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
 */
function Nr(){return void 0!==Or().WorkerGlobalScope&&"function"==typeof Or().importScripts}
/**
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
 */
const Sr="firebaseLocalStorageDb",Fr="firebaseLocalStorage",Lr="fbase_key";class Rr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function kr(e,t){return e.transaction([Fr],t?"readwrite":"readonly").objectStore(Fr)}function Pr(){const e=indexedDB.open(Sr,1);return new Promise((t,n)=>{e.addEventListener("error",()=>{n(e.error)}),e.addEventListener("upgradeneeded",()=>{const t=e.result;try{t.createObjectStore(Fr,{keyPath:Lr})}catch(Kf){n(Kf)}}),e.addEventListener("success",async()=>{const n=e.result;n.objectStoreNames.contains(Fr)?t(n):(n.close(),await function(){const e=indexedDB.deleteDatabase(Sr);return new Rr(e).toPromise()}(),t(await Pr()))})})}async function xr(e,t,n){const r=kr(e,!0).put({[Lr]:t,value:n});return new Rr(r).toPromise()}function Mr(e,t){const n=kr(e,!0).delete(t);return new Rr(n).toPromise()}class Gr{registerLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.addEventListener&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.removeEventListener&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise||(this.dbPromise=Pr(),this.dbPromise.catch(()=>{this.dbPromise=null})),this.dbPromise}async _withRetries(e){let t=0;for(;;)try{const t=await this._openDb();return await e(t)}catch(Kf){if(t++>3)throw Kf;if(this.dbPromise){const e=this.dbPromise;this.dbPromise=null;try{(await e).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Nr()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Tr._getInstance(Nr()?self:null),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await async function(){if(!(null==navigator?void 0:navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}(),!this.activeServiceWorker)return;this.sender=new Ar(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&(null==(e=n[0])?void 0:e.fulfilled)&&(null==(t=n[0])?void 0:t.value.includes("keyChanged"))&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){var t;if(this.sender&&this.activeServiceWorker&&((null==(t=null==navigator?void 0:navigator.serviceWorker)?void 0:t.controller)||null)===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return!!indexedDB&&(await this._withRetries(async e=>{await xr(e,Dr,"1"),await Mr(e,Dr)}),!0)}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>xr(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(t=>async function(e,t){const n=kr(e,!1).get(t),r=await new Rr(n).toPromise();return void 0===r?null:r.value}(t,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Mr(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(e=>{const t=kr(e,!1).getAll();return new Rr(t).toPromise()});if(this.isClosing)return[];if(!e)return[];if(0!==this.pendingWrites)return[];const t=[],n=new Set;if(0!==e.length)for(const{fbase_key:r,value:s}of e)n.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!n.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}catch(Kf){return this.isClosing||Dt(`Firebase Auth cross-tab polling failed with error: ${Kf}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const r of Array.from(n))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Gr.type="LOCAL";const Hr=Gr;
/**
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
 */
function Ur(e,t){return t?ln(t):(At(e._popupRedirectResolver,e,"argument-error"),e._popupRedirectResolver)}
/**
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
 */new Rt(3e4,6e4);class Vr extends Kn{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Wn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Wn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Wn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Jr(e){return hr(e.auth,new Vr(e),e.bypassAuthState)}function jr(e){const{auth:t,user:n}=e;return At(n,t,"internal-error"),
/**
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
 */
async function(e,t,n=!1){const{auth:r}=e;if(Xe(r.app))return Promise.reject(It(r));const s="reauthenticate";try{const i=await tn(e,lr(r,s,t,e),n);At(i.idToken,r,"internal-error");const a=Zt(i.idToken);At(a,r,"internal-error");const{sub:o}=a;return At(e.uid===o,r,"user-mismatch"),or._forOperation(e,s,i)}catch(Kf){throw"auth/user-not-found"===(null==Kf?void 0:Kf.code)&&yt(r,"user-mismatch"),Kf}}(n,new Vr(e),e.bypassAuthState)}async function Kr(e){const{auth:t,user:n}=e;return At(n,t,"internal-error"),async function(e,t,n=!1){const r=await tn(e,t._linkToIdToken(e.auth,await e.getIdToken()),n);return or._forOperation(e,"link",r)}(n,new Vr(e),e.bypassAuthState)}
/**
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
 */class qr{constructor(e,t,n,r,s=!1){this.auth=e,this.resolver=n,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(Kf){this.reject(Kf)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:r,tenantId:s,error:i,type:a}=e;if(i)return void this.reject(i);const o={auth:this.auth,requestUri:t,sessionId:n,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(o))}catch(Kf){this.reject(Kf)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Jr;case"linkViaPopup":case"linkViaRedirect":return Kr;case"reauthViaPopup":case"reauthViaRedirect":return jr;default:yt(this.auth,"internal-error")}}resolve(e){Nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}
/**
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
 */const zr=new Rt(2e3,1e4);async function Qr(e,t,n){if(Xe(e.app))return Promise.reject(vt(e,"operation-not-supported-in-this-environment"));const r=Sn(e);Tt(e,t,er);const s=Ur(r,n);return new Yr(r,"signInViaPopup",t,s).executeNotNull()}class Yr extends qr{constructor(e,t,n,r,s){super(e,t,r,s),this.provider=n,this.authWindow=null,this.pollId=null,Yr.currentPopupAction&&Yr.currentPopupAction.cancel(),Yr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return At(e,this.auth,"internal-error"),e}async onExecution(){Nt(1===this.filter.length,"Popup operations only handle one event");const e=br();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(e=>{this.reject(e)}),this.resolver._isIframeWebStorageSupported(this.auth,e=>{e||this.reject(vt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return(null==(e=this.authWindow)?void 0:e.associatedEvent)||null}cancel(){this.reject(vt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Yr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;(null==(n=null==(t=this.authWindow)?void 0:t.window)?void 0:n.closed)?this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(vt(this.auth,"popup-closed-by-user"))},8e3):this.pollId=window.setTimeout(e,zr.get())};e()}}Yr.currentPopupAction=null;
/**
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
 */
const Wr=new Map;class $r extends qr{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Wr.get(this.auth._key());if(!e){try{const t=await async function(e,t){const n=es(t),r=Zr(e);if(!(await r._isAvailable()))return!1;const s="true"===await r._get(n);return await r._remove(n),s}(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(t)}catch(Kf){e=()=>Promise.reject(Kf)}Wr.set(this.auth._key(),e)}return this.bypassAuthState||Wr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if("signInViaRedirect"===e.type)return super.onAuthEvent(e);if("unknown"!==e.type){if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}else this.resolve(null)}async onExecution(){}cleanUp(){}}function Xr(e,t){Wr.set(e._key(),t)}function Zr(e){return ln(e._redirectPersistence)}function es(e){return dn("pendingRedirect",e.config.apiKey,e.name)}
/**
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
 */function ts(e,t,n){return async function(e,t,n){if(Xe(e.app))return Promise.reject(It(e));const r=Sn(e);Tt(e,t,er),await r._initializationPromise;const s=Ur(r,n);return await async function(e,t){return Zr(e)._set(es(t),"true")}(s,r),s._openRedirect(r,t,"signInViaRedirect")}(e,t,n)}async function ns(e,t){return await Sn(e)._initializationPromise,rs(e,t,!1)}async function rs(e,t,n=!1){if(Xe(e.app))return Promise.reject(It(e));const r=Sn(e),s=Ur(r,t),i=new $r(r,s,n),a=await i.execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,t)),a}
/**
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
 */class ss{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!function(e){switch(e.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return as(e);default:return!1}}
/**
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
 */(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!as(e)){const r=(null==(n=e.error.code)?void 0:n.split("auth/")[1])||"internal-error";t.onError(vt(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=null===t.eventId||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(is(e))}saveEventToCache(e){this.cachedEventUids.add(is(e)),this.lastProcessedEventTime=Date.now()}}function is(e){return[e.type,e.eventId,e.sessionId,e.tenantId].filter(e=>e).join("-")}function as({type:e,error:t}){return"unknown"===e&&"auth/no-auth-event"===(null==t?void 0:t.code)}
/**
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
 */
const os=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Bs=/^https?/;async function cs(e){if(e.config.emulator)return;const{authorizedDomains:t}=await async function(e,t={}){return Ut(e,"GET","/v1/projects",t)}(e);for(const n of t)try{if(us(n))return}catch{}yt(e,"unauthorized-domain")}function us(e){const t=St(),{protocol:n,hostname:r}=new URL(t);if(e.startsWith("chrome-extension://")){const s=new URL(e);return""===s.hostname&&""===r?"chrome-extension:"===n&&e.replace("chrome-extension://","")===t.replace("chrome-extension://",""):"chrome-extension:"===n&&s.hostname===r}if(!Bs.test(n))return!1;if(os.test(e))return r===e;const s=e.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}
/**
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
 */const ls=new Rt(3e4,6e4);function hs(){const e=Or().___jsl;if(null==e?void 0:e.H)for(const t of Object.keys(e.H))if(e.H[t].r=e.H[t].r||[],e.H[t].L=e.H[t].L||[],e.H[t].r=[...e.H[t].L],e.CP)for(let n=0;n<e.CP.length;n++)e.CP[n]=null}function Cs(e){return new Promise((t,n)=>{var r,s,i;function a(){hs(),gapi.load("gapi.iframes",{callback:()=>{t(gapi.iframes.getContext())},ontimeout:()=>{hs(),n(vt(e,"network-request-failed"))},timeout:ls.get()})}if(null==(s=null==(r=Or().gapi)?void 0:r.iframes)?void 0:s.Iframe)t(gapi.iframes.getContext());else{if(!(null==(i=Or().gapi)?void 0:i.load)){const t=`__${"iframefcb"}${Math.floor(1e6*Math.random())}`;return Or()[t]=()=>{gapi.load?a():n(vt(e,"network-request-failed"))},Rn(`${Ln.gapiScript}?onload=${t}`).catch(e=>n(e))}a()}}).catch(e=>{throw ds=null,e})}let ds=null;
/**
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
 */
const ps=new Rt(5e3,15e3),fs={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},gs=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function ms(e){const t=e.config;At(t.authDomain,e,"auth-domain-config-required");const n=t.emulator?kt(t,"emulator/auth/iframe"):`https://${e.config.authDomain}/__/auth/iframe`,r={apiKey:t.apiKey,appName:e.name,v:tt},s=gs.get(e.config.apiHost);s&&(r.eid=s);const i=e._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${L(r).slice(1)}`}async function Es(e){const t=await function(e){return ds=ds||Cs(e),ds}(e),n=Or().gapi;return At(n,e,"internal-error"),t.open({where:document.body,url:ms(e),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:fs,dontclear:!0},t=>new Promise(async(n,r)=>{await t.restyle({setHideOnLeave:!1});const s=vt(e,"network-request-failed"),i=Or().setTimeout(()=>{r(s)},ps.get());function a(){Or().clearTimeout(i),n(t)}t.ping(a).then(a,()=>{r(s)})}))}
/**
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
 */const Ds={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class ws{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(Kf){}}}function ys(e,t,n,r=500,s=600){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let o="";const B={...Ds,width:r.toString(),height:s.toString(),top:i,left:a},c=b().toLowerCase();n&&(o=En(c)?"_blank":n),gn(c)&&(t=t||"http://localhost",B.scrollbars="yes");const u=Object.entries(B).reduce((e,[t,n])=>`${e}${t}=${n},`,"");if(function(e=b()){var t;return _n(e)&&!!(null==(t=window.navigator)?void 0:t.standalone)}(c)&&"_self"!==o)return function(e,t){const n=document.createElement("a");n.href=e,n.target=t;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}
/**
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
 */(t||"",o),new ws(null);const l=window.open(t||"",o,u);At(l,e,"popup-blocked");try{l.focus()}catch(Kf){}return new ws(l)}const vs="__/auth/handler",_s="emulator/auth/handler",Is=encodeURIComponent("fac");async function Ts(e,t,n,r,s,i){At(e.config.authDomain,e,"auth-domain-config-required"),At(e.config.apiKey,e,"invalid-api-key");const a={apiKey:e.config.apiKey,appName:e.name,authType:n,redirectUrl:r,v:tt,eventId:s};if(t instanceof er){t.setDefaultLanguage(e.languageCode),a.providerId=t.providerId||"",function(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}(t.getCustomParameters())||(a.customParameters=JSON.stringify(t.getCustomParameters()));for(const[e,t]of Object.entries({}))a[e]=t}if(t instanceof tr){const e=t.getScopes().filter(e=>""!==e);e.length>0&&(a.scopes=e.join(","))}e.tenantId&&(a.tid=e.tenantId);const o=a;for(const u of Object.keys(o))void 0===o[u]&&delete o[u];const B=await e._getAppCheckToken(),c=B?`#${Is}=${encodeURIComponent(B)}`:"";return`${function({config:e}){if(!e.emulator)return`https://${e.authDomain}/${vs}`;return kt(e,_s)}
/**
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
 */(e)}?${L(o).slice(1)}${c}`}const bs="webStorageSupport";const As=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ir,this._completeRedirectFn=rs,this._overrideRedirectResult=Xr}async _openPopup(e,t,n,r){var s;Nt(null==(s=this.eventManagers[e._key()])?void 0:s.manager,"_initialize() not called before _openPopup()");return ys(e,await Ts(e,t,n,St(),r),br())}async _openRedirect(e,t,n,r){await this._originValidation(e);return function(e){Or().location.href=e}(await Ts(e,t,n,St(),r)),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:e,promise:n}=this.eventManagers[t];return e?Promise.resolve(e):(Nt(n,"If manager is not set, promise should be"),n)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await Es(e),n=new ss(e);return t.register("authEvent",t=>{At(null==t?void 0:t.authEvent,e,"invalid-auth-event");return{status:n.onEvent(t.authEvent)?"ACK":"ERROR"}},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(bs,{type:bs},n=>{var r;const s=null==(r=null==n?void 0:n[0])?void 0:r[bs];void 0!==s&&t(!!s),yt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=cs(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Tn()||mn()||_n()}};var Os="@firebase/auth",Ns="1.13.6";
/**
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
 */
class Ss{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),(null==(e=this.auth.currentUser)?void 0:e.uid)||null}async getToken(e){if(this.assertAuthConfigured(),await this.auth._initializationPromise,!this.auth.currentUser)return null;return{accessToken:await this.auth.currentUser.getIdToken(e)}}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(t=>{e((null==t?void 0:t.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){At(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}
/**
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
 */
/**
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
 */
const Fs=I("authIdTokenMaxAge")||300;let Ls=null;function Rs(e=rt()){const t=$e(e,"auth");if(t.isInitialized())return t.getImmediate();const n=function(e,t){const n=$e(e,"auth");if(n.isInitialized()){const e=n.getImmediate();if(S(n.getOptions(),t??{}))return e;yt(e,"already-initialized")}return n.initialize({options:t})}(e,{popupRedirectResolver:As,persistence:[Hr,vr,Ir]}),r=I("authTokenSyncURL");if(r&&"boolean"==typeof isSecureContext&&isSecureContext){const e=new URL(r,location.origin);if(location.origin===e.origin){const t=(s=e.toString(),async e=>{const t=e&&await e.getIdTokenResult(),n=t&&((new Date).getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>Fs)return;const r=null==t?void 0:t.token;Ls!==r&&(Ls=r,await fetch(s,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))});!function(e,t,n){M(e).beforeAuthStateChanged(t,n)}(n,t,()=>t(n.currentUser)),function(e,t,n,r){M(e).onIdTokenChanged(t,n,r)}(n,e=>t(e))}}var s;const i=v("auth");return i&&Vn(n,`http://${i}`),n}var ks,Ps;ks={loadJS:e=>new Promise((t,n)=>{const r=document.createElement("script");var s;r.setAttribute("src",e),r.onload=t,r.onerror=e=>{const t=vt("internal-error");t.customData=e,n(t)},r.type="text/javascript",r.charset="UTF-8",((null==(s=document.getElementsByTagName("head"))?void 0:s[0])??document).appendChild(r)}),gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="},Ln=ks,Ps="Browser",We(new U("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:a}=n.options;At(i&&!i.includes(":"),"invalid-api-key",{appName:n.name});const o={apiKey:i,authDomain:a,clientPlatform:Ps,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:bn(Ps)},B=new Nn(n,r,s,o);return function(e,t){const n=(null==t?void 0:t.persistence)||[],r=(Array.isArray(n)?n:[n]).map(ln);(null==t?void 0:t.errorMap)&&e._updateErrorMap(t.errorMap),e._initializeWithPersistence(r,null==t?void 0:t.popupRedirectResolver)}(B,t),B},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),We(new U("auth-internal",e=>{const t=Sn(e.getProvider("auth").getImmediate());return new Ss(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),it(Os,Ns,function(e){switch(e){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}(Ps)),it(Os,Ns,"esm2020");var xs,Ms,Gs="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e;
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function t(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}function n(e,t,n){n||(n=0);const r=Array(16);if("string"==typeof t)for(var s=0;s<16;++s)r[s]=t.charCodeAt(n++)|t.charCodeAt(n++)<<8|t.charCodeAt(n++)<<16|t.charCodeAt(n++)<<24;else for(s=0;s<16;++s)r[s]=t[n++]|t[n++]<<8|t[n++]<<16|t[n++]<<24;t=e.g[0],n=e.g[1],s=e.g[2];let i,a=e.g[3];i=t+(a^n&(s^a))+r[0]+3614090360&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[1]+3905402710&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[2]+606105819&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[3]+3250441966&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[4]+4118548399&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[5]+1200080426&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[6]+2821735955&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[7]+4249261313&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[8]+1770035416&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[9]+2336552879&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[10]+4294925233&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[11]+2304563134&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[12]+1804603682&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[13]+4254626195&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[14]+2792965006&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[15]+1236535329&4294967295,i=t+(s^a&((n=s+(i<<22&4294967295|i>>>10))^s))+r[1]+4129170786&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[6]+3225465664&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[11]+643717713&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[0]+3921069994&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[5]+3593408605&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[10]+38016083&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[15]+3634488961&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[4]+3889429448&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[9]+568446438&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[14]+3275163606&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[3]+4107603335&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[8]+1163531501&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[13]+2850285829&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[2]+4243563512&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[7]+1735328473&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[12]+2368359562&4294967295,i=t+((n=s+(i<<20&4294967295|i>>>12))^s^a)+r[5]+4294588738&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[8]+2272392833&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[11]+1839030562&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[14]+4259657740&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[1]+2763975236&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[4]+1272893353&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[7]+4139469664&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[10]+3200236656&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[13]+681279174&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[0]+3936430074&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[3]+3572445317&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[6]+76029189&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[9]+3654602809&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[12]+3873151461&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[15]+530742520&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[2]+3299628645&4294967295,i=t+(s^((n=s+(i<<23&4294967295|i>>>9))|~a))+r[0]+4096336452&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[7]+1126891415&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[14]+2878612391&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[5]+4237533241&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[12]+1700485571&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[3]+2399980690&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[10]+4293915773&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[1]+2240044497&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[8]+1873313359&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[15]+4264355552&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[6]+2734768916&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[13]+1309151649&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[4]+4149444226&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[11]+3174756917&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[2]+718787259&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[9]+3951481745&4294967295,e.g[0]=e.g[0]+t&4294967295,e.g[1]=e.g[1]+(s+(i<<21&4294967295|i>>>11))&4294967295,e.g[2]=e.g[2]+s&4294967295,e.g[3]=e.g[3]+a&4294967295}function r(e,t){this.h=t;const n=[];let r=!0;for(let s=e.length-1;s>=0;s--){const i=0|e[s];r&&i==t||(n[s]=i,r=!1)}this.g=n}!function(e,t){function n(){}n.prototype=t.prototype,e.F=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.D=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}(t,function(){this.blockSize=-1}),t.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},t.prototype.v=function(e,t){void 0===t&&(t=e.length);const r=t-this.blockSize,s=this.C;let i=this.h,a=0;for(;a<t;){if(0==i)for(;a<=r;)n(this,e,a),a+=this.blockSize;if("string"==typeof e){for(;a<t;)if(s[i++]=e.charCodeAt(a++),i==this.blockSize){n(this,s),i=0;break}}else for(;a<t;)if(s[i++]=e[a++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=t},t.prototype.A=function(){var e=Array((this.h<56?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var t=1;t<e.length-8;++t)e[t]=0;t=8*this.o;for(var n=e.length-8;n<e.length;++n)e[n]=255&t,t/=256;for(this.v(e),e=Array(16),t=0,n=0;n<4;++n)for(let r=0;r<32;r+=8)e[t++]=this.g[n]>>>r&255;return e};var s={};function i(e){return-128<=e&&e<128?function(e,t){var n=s;return Object.prototype.hasOwnProperty.call(n,e)?n[e]:n[e]=t(e)}(e,function(e){return new r([0|e],e<0?-1:0)}):new r([0|e],e<0?-1:0)}function a(e){if(isNaN(e)||!isFinite(e))return o;if(e<0)return h(a(-e));const t=[];let n=1;for(let r=0;e>=n;r++)t[r]=e/n|0,n*=4294967296;return new r(t,0)}var o=i(0),B=i(1),c=i(16777216);function u(e){if(0!=e.h)return!1;for(let t=0;t<e.g.length;t++)if(0!=e.g[t])return!1;return!0}function l(e){return-1==e.h}function h(e){const t=e.g.length,n=[];for(let r=0;r<t;r++)n[r]=~e.g[r];return new r(n,~e.h).add(B)}function C(e,t){return e.add(h(t))}function d(e,t){for(;(65535&e[t])!=e[t];)e[t+1]+=e[t]>>>16,e[t]&=65535,t++}function p(e,t){this.g=e,this.h=t}function f(e,t){if(u(t))throw Error("division by zero");if(u(e))return new p(o,o);if(l(e))return t=f(h(e),t),new p(h(t.g),h(t.h));if(l(t))return t=f(e,h(t)),new p(h(t.g),t.h);if(e.g.length>30){if(l(e)||l(t))throw Error("slowDivide_ only works with positive integers.");for(var n=B,r=t;r.l(e)<=0;)n=g(n),r=g(r);var s=m(n,1),i=m(r,1);for(r=m(r,2),n=m(n,2);!u(r);){var c=i.add(r);c.l(e)<=0&&(s=s.add(n),i=c),r=m(r,1),n=m(n,1)}return t=C(e,s.j(t)),new p(s,t)}for(s=o;e.l(t)>=0;){for(n=Math.max(1,Math.floor(e.m()/t.m())),r=(r=Math.ceil(Math.log(n)/Math.LN2))<=48?1:Math.pow(2,r-48),c=(i=a(n)).j(t);l(c)||c.l(e)>0;)c=(i=a(n-=r)).j(t);u(i)&&(i=B),s=s.add(i),e=C(e,c)}return new p(s,e)}function g(e){const t=e.g.length+1,n=[];for(let r=0;r<t;r++)n[r]=e.i(r)<<1|e.i(r-1)>>>31;return new r(n,e.h)}function m(e,t){const n=t>>5;t%=32;const s=e.g.length-n,i=[];for(let r=0;r<s;r++)i[r]=t>0?e.i(r+n)>>>t|e.i(r+n+1)<<32-t:e.i(r+n);return new r(i,e.h)}(e=r.prototype).m=function(){if(l(this))return-h(this).m();let e=0,t=1;for(let n=0;n<this.g.length;n++){const r=this.i(n);e+=(r>=0?r:4294967296+r)*t,t*=4294967296}return e},e.toString=function(e){if((e=e||10)<2||36<e)throw Error("radix out of range: "+e);if(u(this))return"0";if(l(this))return"-"+h(this).toString(e);const t=a(Math.pow(e,6));var n=this;let r="";for(;;){const s=f(n,t).g;let i=(((n=C(n,s.j(t))).g.length>0?n.g[0]:n.h)>>>0).toString(e);if(u(n=s))return i+r;for(;i.length<6;)i="0"+i;r=i+r}},e.i=function(e){return e<0?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return l(e=C(this,e))?-1:u(e)?0:1},e.abs=function(){return l(this)?h(this):this},e.add=function(e){const t=Math.max(this.g.length,e.g.length),n=[];let s=0;for(let r=0;r<=t;r++){let t=s+(65535&this.i(r))+(65535&e.i(r)),i=(t>>>16)+(this.i(r)>>>16)+(e.i(r)>>>16);s=i>>>16,t&=65535,i&=65535,n[r]=i<<16|t}return new r(n,-2147483648&n[n.length-1]?-1:0)},e.j=function(e){if(u(this)||u(e))return o;if(l(this))return l(e)?h(this).j(h(e)):h(h(this).j(e));if(l(e))return h(this.j(h(e)));if(this.l(c)<0&&e.l(c)<0)return a(this.m()*e.m());const t=this.g.length+e.g.length,n=[];for(var s=0;s<2*t;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(let t=0;t<e.g.length;t++){const r=this.i(s)>>>16,i=65535&this.i(s),a=e.i(t)>>>16,o=65535&e.i(t);n[2*s+2*t]+=i*o,d(n,2*s+2*t),n[2*s+2*t+1]+=r*o,d(n,2*s+2*t+1),n[2*s+2*t+1]+=i*a,d(n,2*s+2*t+1),n[2*s+2*t+2]+=r*a,d(n,2*s+2*t+2)}for(e=0;e<t;e++)n[e]=n[2*e+1]<<16|n[2*e];for(e=t;e<2*t;e++)n[e]=0;return new r(n,0)},e.B=function(e){return f(this,e).h},e.and=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)&e.i(r);return new r(n,this.h&e.h)},e.or=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)|e.i(r);return new r(n,this.h|e.h)},e.xor=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)^e.i(r);return new r(n,this.h^e.h)},t.prototype.digest=t.prototype.A,t.prototype.reset=t.prototype.u,t.prototype.update=t.prototype.v,Ms=t,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.B,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=a,r.fromString=function e(t,n){if(0==t.length)throw Error("number format error: empty string");if((n=n||10)<2||36<n)throw Error("radix out of range: "+n);if("-"==t.charAt(0))return h(e(t.substring(1),n));if(t.indexOf("-")>=0)throw Error('number format error: interior "-" character');const r=a(Math.pow(n,8));let s=o;for(let o=0;o<t.length;o+=8){var i=Math.min(8,t.length-o);const e=parseInt(t.substring(o,o+i),n);i<8?(i=a(Math.pow(n,i)),s=s.j(i).add(a(e))):(s=s.j(r),s=s.add(a(e)))}return s},xs=r}).apply(void 0!==Gs?Gs:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var Hs,Us,Vs,Js,js,Ks,qs,zs,Qs="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e,t=Object.defineProperty;var n=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof Qs&&Qs];for(var t=0;t<e.length;++t){var n=e[t];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);function r(e,r){if(r)e:{var s=n;e=e.split(".");for(var i=0;i<e.length-1;i++){var a=e[i];if(!(a in s))break e;s=s[a]}(r=r(i=s[e=e[e.length-1]]))!=i&&null!=r&&t(s,e,{configurable:!0,writable:!0,value:r})}}r("Symbol.dispose",function(e){return e||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(e){return e||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(e){return e||function(e){var t,n=[];for(t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.push([t,e[t]]);return n}});
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
var s=s||{},i=this||self;function a(e){var t=typeof e;return"object"==t&&null!=e||"function"==t}function o(e,t,n){return e.call.apply(e.bind,arguments)}function B(e,t,n){return(B=o).apply(null,arguments)}function c(e,t){var n=Array.prototype.slice.call(arguments,1);return function(){var t=n.slice();return t.push.apply(t,arguments),e.apply(this,t)}}function u(e,t){function n(){}n.prototype=t.prototype,e.Z=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.Ob=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}var l="undefined"!=typeof AsyncContext&&"function"==typeof AsyncContext.Snapshot?e=>e&&AsyncContext.Snapshot.wrap(e):e=>e;function h(e){const t=e.length;if(t>0){const n=Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}return[]}function C(e,t){for(let r=1;r<arguments.length;r++){const t=arguments[r];var n=typeof t;if("array"==(n="object"!=n?n:t?Array.isArray(t)?"array":n:"null")||"object"==n&&"number"==typeof t.length){n=e.length||0;const r=t.length||0;e.length=n+r;for(let s=0;s<r;s++)e[n+s]=t[s]}else e.push(t)}}function d(e){i.setTimeout(()=>{throw e},0)}function p(){var e=D;let t=null;return e.g&&(t=e.g,e.g=e.g.next,e.g||(e.h=null),t.next=null),t}var f=new class{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return this.h>0?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}(()=>new g,e=>e.reset());class g{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}let m,E=!1,D=new class{constructor(){this.h=this.g=null}add(e,t){const n=f.get();n.set(e,t),this.h?this.h.next=n:this.g=n,this.h=n}},w=()=>{const e=Promise.resolve(void 0);m=()=>{e.then(y)}};function y(){for(var e;e=p();){try{e.h.call(e.g)}catch(n){d(n)}var t=f;t.j(e),t.h<100&&(t.h++,e.next=t.g,t.g=e)}E=!1}function v(){this.u=this.u,this.C=this.C}function _(e,t){this.type=e,this.g=this.target=t,this.defaultPrevented=!1}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},_.prototype.h=function(){this.defaultPrevented=!0};var I=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var e=!1,t=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const e=()=>{};i.addEventListener("test",e,t),i.removeEventListener("test",e,t)}catch(n){}return e}();function T(e){return/^[\s\xa0]*$/.test(e)}function b(e,t){_.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e&&this.init(e,t)}u(b,_),b.prototype.init=function(e,t){const n=this.type=e.type,r=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;this.target=e.target||e.srcElement,this.g=t,(t=e.relatedTarget)||("mouseover"==n?t=e.fromElement:"mouseout"==n&&(t=e.toElement)),this.relatedTarget=t,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=e.pointerType,this.state=e.state,this.i=e,e.defaultPrevented&&b.Z.h.call(this)},b.prototype.h=function(){b.Z.h.call(this);const e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var A="closure_listenable_"+(1e6*Math.random()|0),O=0;function N(e,t,n,r,s){this.listener=e,this.proxy=null,this.src=t,this.type=n,this.capture=!!r,this.ha=s,this.key=++O,this.da=this.fa=!1}function S(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function F(e,t,n){for(const r in e)t.call(n,e[r],r,e)}function L(e){const t={};for(const n in e)t[n]=e[n];return t}const R="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function k(e,t){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)e[n]=r[n];for(let t=0;t<R.length;t++)n=R[t],Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}}function P(e){this.src=e,this.g={},this.h=0}function x(e,t){const n=t.type;if(n in e.g){var r,s=e.g[n],i=Array.prototype.indexOf.call(s,t,void 0);(r=i>=0)&&Array.prototype.splice.call(s,i,1),r&&(S(t),0==e.g[n].length&&(delete e.g[n],e.h--))}}function M(e,t,n,r){for(let s=0;s<e.length;++s){const i=e[s];if(!i.da&&i.listener==t&&i.capture==!!n&&i.ha==r)return s}return-1}P.prototype.add=function(e,t,n,r,s){const i=e.toString();(e=this.g[i])||(e=this.g[i]=[],this.h++);const a=M(e,t,r,s);return a>-1?(t=e[a],n||(t.fa=!1)):((t=new N(t,this.src,i,!!r,s)).fa=n,e.push(t)),t};var G="closure_lm_"+(1e6*Math.random()|0),H={};function U(e,t,n,r,s){if(Array.isArray(t)){for(let i=0;i<t.length;i++)U(e,t[i],n,r,s);return null}return n=Q(n),e&&e[A]?e.J(t,n,!!a(r)&&!!r.capture,s):function(e,t,n,r,s,i){if(!t)throw Error("Invalid event type");const o=a(s)?!!s.capture:!!s;let B=q(e);if(B||(e[G]=B=new P(e)),n=B.add(t,n,r,o,i),n.proxy)return n;if(r=function(){function e(n){return t.call(e.src,e.listener,n)}const t=K;return e}(),n.proxy=r,r.src=e,r.listener=n,e.addEventListener)I||(s=o),void 0===s&&(s=!1),e.addEventListener(t.toString(),r,s);else if(e.attachEvent)e.attachEvent(j(t.toString()),r);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(r)}return n}(e,t,n,!1,r,s)}function V(e,t,n,r,s){if(Array.isArray(t))for(var i=0;i<t.length;i++)V(e,t[i],n,r,s);else r=a(r)?!!r.capture:!!r,n=Q(n),e&&e[A]?(e=e.i,(i=String(t).toString())in e.g&&((n=M(t=e.g[i],n,r,s))>-1&&(S(t[n]),Array.prototype.splice.call(t,n,1),0==t.length&&(delete e.g[i],e.h--)))):e&&(e=q(e))&&(t=e.g[t.toString()],e=-1,t&&(e=M(t,n,r,s)),(n=e>-1?t[e]:null)&&J(n))}function J(e){if("number"!=typeof e&&e&&!e.da){var t=e.src;if(t&&t[A])x(t.i,e);else{var n=e.type,r=e.proxy;t.removeEventListener?t.removeEventListener(n,r,e.capture):t.detachEvent?t.detachEvent(j(n),r):t.addListener&&t.removeListener&&t.removeListener(r),(n=q(t))?(x(n,e),0==n.h&&(n.src=null,t[G]=null)):S(e)}}}function j(e){return e in H?H[e]:H[e]="on"+e}function K(e,t){if(e.da)e=!0;else{t=new b(t,this);const n=e.listener,r=e.ha||e.src;e.fa&&J(e),e=n.call(r,t)}return e}function q(e){return(e=e[G])instanceof P?e:null}var z="__closure_events_fn_"+(1e9*Math.random()>>>0);function Q(e){return"function"==typeof e?e:(e[z]||(e[z]=function(t){return e.handleEvent(t)}),e[z])}function Y(){v.call(this),this.i=new P(this),this.M=this,this.G=null}function W(e,t){var n,r=e.G;if(r)for(n=[];r;r=r.G)n.push(r);if(e=e.M,r=t.type||t,"string"==typeof t)t=new _(t,e);else if(t instanceof _)t.target=t.target||e;else{var s=t;k(t=new _(r,e),s)}let i,a;if(s=!0,n)for(a=n.length-1;a>=0;a--)i=t.g=n[a],s=$(i,r,!0,t)&&s;if(i=t.g=e,s=$(i,r,!0,t)&&s,s=$(i,r,!1,t)&&s,n)for(a=0;a<n.length;a++)i=t.g=n[a],s=$(i,r,!1,t)&&s}function $(e,t,n,r){if(!(t=e.i.g[String(t)]))return!0;t=t.concat();let s=!0;for(let i=0;i<t.length;++i){const a=t[i];if(a&&!a.da&&a.capture==n){const t=a.listener,n=a.ha||a.src;a.fa&&x(e.i,a),s=!1!==t.call(n,r)&&s}}return s&&!r.defaultPrevented}function X(e){e.g=function(e,t){if("function"!=typeof e){if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=B(e.handleEvent,e)}return Number(t)>2147483647?-1:i.setTimeout(e,t||0)}(()=>{e.g=null,e.i&&(e.i=!1,X(e))},e.l);const t=e.h;e.h=null,e.m.apply(null,t)}u(Y,v),Y.prototype[A]=!0,Y.prototype.removeEventListener=function(e,t,n,r){V(this,e,t,n,r)},Y.prototype.N=function(){if(Y.Z.N.call(this),this.i){var e=this.i;for(const t in e.g){const n=e.g[t];for(let e=0;e<n.length;e++)S(n[e]);delete e.g[t],e.h--}}this.G=null},Y.prototype.J=function(e,t,n,r){return this.i.add(String(e),t,!1,n,r)},Y.prototype.K=function(e,t,n,r){return this.i.add(String(e),t,!0,n,r)};class Z extends v{constructor(e,t){super(),this.m=e,this.l=t,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:X(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ee(e){v.call(this),this.h=e,this.g={}}u(ee,v);var te=[];function ne(e){F(e.g,function(e,t){this.g.hasOwnProperty(t)&&J(e)},e),e.g={}}ee.prototype.N=function(){ee.Z.N.call(this),ne(this)},ee.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var re=i.JSON.stringify,se=i.JSON.parse,ie=class{stringify(e){return i.JSON.stringify(e,void 0)}parse(e){return i.JSON.parse(e,void 0)}};function ae(){}function oe(){}var Be={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ce(){_.call(this,"d")}function ue(){_.call(this,"c")}u(ce,_),u(ue,_);var le={},he=null;function Ce(){return he=he||new Y}function de(e){_.call(this,le.Ia,e)}function pe(e){const t=Ce();W(t,new de(t))}function fe(e,t){_.call(this,le.STAT_EVENT,e),this.stat=t}function ge(e){const t=Ce();W(t,new fe(t,e))}function me(e,t){_.call(this,le.Ja,e),this.size=t}function Ee(e,t){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){e()},t)}function De(){this.g=!0}function we(e,t,n,r){e.info(function(){return"XMLHTTP TEXT ("+t+"): "+function(e,t){if(!e.g)return t;if(!t)return null;try{const i=JSON.parse(t);if(i)for(e=0;e<i.length;e++)if(Array.isArray(i[e])){var n=i[e];if(!(n.length<2)){var r=n[1];if(Array.isArray(r)&&!(r.length<1)){var s=r[0];if("noop"!=s&&"stop"!=s&&"close"!=s)for(let e=1;e<r.length;e++)r[e]=""}}}return re(i)}catch(i){return t}}(e,n)+(r?" "+r:"")})}le.Ia="serverreachability",u(de,_),le.STAT_EVENT="statevent",u(fe,_),le.Ja="timingevent",u(me,_),De.prototype.ua=function(){this.g=!1},De.prototype.info=function(){};var ye,ve={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},_e={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"};function Ie(){}function Te(e){return encodeURIComponent(String(e))}function be(e){var t=1;e=e.split(":");const n=[];for(;t>0&&e.length;)n.push(e.shift()),t--;return e.length&&n.push(e.join(":")),n}function Ae(e,t,n,r){this.j=e,this.i=t,this.l=n,this.S=r||1,this.V=new ee(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Oe}function Oe(){this.i=null,this.g="",this.h=!1}u(Ie,ae),Ie.prototype.g=function(){return new XMLHttpRequest},ye=new Ie;var Ne={},Se={};function Fe(e,t,n){e.M=1,e.A=rt(Xe(t)),e.u=n,e.R=!0,Le(e,null)}function Le(e,t){e.F=Date.now(),Pe(e),e.B=Xe(e.A);var n=e.B,r=e.S;Array.isArray(r)||(r=[String(r)]),gt(n.i,"t",r),e.C=0,n=e.j.L,e.h=new Oe,e.g=rn(e.j,n?t:null,!e.u),e.P>0&&(e.O=new Z(B(e.Y,e,e.g),e.P)),t=e.V,n=e.g,r=e.ba;var s="readystatechange";Array.isArray(s)||(s&&(te[0]=s.toString()),s=te);for(let i=0;i<s.length;i++){const e=U(n,s[i],r||t.handleEvent,!1,t.h||t);if(!e)break;t.g[e.key]=e}t=e.J?L(e.J):{},e.u?(e.v||(e.v="POST"),t["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.B,e.v,e.u,t)):(e.v="GET",e.g.ea(e.B,e.v,null,t)),pe(),function(e,t,n,r,s,i){e.info(function(){if(e.g)if(i){var a="",o=i.split("&");for(let e=0;e<o.length;e++){var B=o[e].split("=");if(B.length>1){const e=B[0];B=B[1];const t=e.split("_");a=t.length>=2&&"type"==t[1]?a+(e+"=")+B+"&":a+(e+"=redacted&")}}}else a=null;else a=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+t+"\n"+n+"\n"+a})}(e.i,e.v,e.B,e.l,e.S,e.u)}function Re(e){return!!e.g&&("GET"==e.v&&2!=e.M&&e.j.Aa)}function ke(e,t){var n=e.C,r=t.indexOf("\n",n);return-1==r?Se:(n=Number(t.substring(n,r)),isNaN(n)?Ne:(r+=1)+n>t.length?Se:(t=t.slice(r,r+n),e.C=r+n,t))}function Pe(e){e.T=Date.now()+e.H,xe(e,e.H)}function xe(e,t){if(null!=e.D)throw Error("WatchDog timer not null");e.D=Ee(B(e.aa,e),t)}function Me(e){e.D&&(i.clearTimeout(e.D),e.D=null)}function Ge(e){0==e.j.I||e.K||Xt(e.j,e)}function He(e){Me(e);var t=e.O;t&&"function"==typeof t.dispose&&t.dispose(),e.O=null,ne(e.V),e.g&&(t=e.g,e.g=null,t.abort(),t.dispose())}function Ue(e,t){try{var n=e.j;if(0!=n.I&&(n.g==e||qe(n.h,e)))if(!e.L&&qe(n.h,e)&&3==n.I){try{var r=n.Ba.g.parse(t)}catch(u){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){e:if(!n.v){if(n.g){if(!(n.g.F+3e3<e.F))break e;$t(n),Ut(n)}Qt(n),ge(18)}}else n.xa=s[1],0<n.xa-n.K&&s[2]<37500&&n.F&&0==n.A&&!n.C&&(n.C=Ee(B(n.Va,n),6e3));Ke(n.h)<=1&&n.ta&&(n.ta=void 0)}else en(n,11)}else if((e.L||n.g==e)&&$t(n),!T(t))for(s=n.Ba.g.parse(t),t=0;t<s.length;t++){let B=s[t];const u=B[0];if(!(u<=n.K))if(n.K=u,B=B[1],2==n.I)if("c"==B[0]){n.M=B[1],n.ba=B[2];const t=B[3];null!=t&&(n.ka=t,n.j.info("VER="+n.ka));const s=B[4];null!=s&&(n.za=s,n.j.info("SVER="+n.za));const u=B[5];null!=u&&"number"==typeof u&&u>0&&(r=1.5*u,n.O=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const l=e.g;if(l){const e=l.g?l.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var i=r.h;i.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(ze(i,i.h),i.h=null))}if(r.G){const e=l.g?l.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(r.wa=e,nt(r.J,r.G,e))}}n.I=3,n.l&&n.l.ra(),n.aa&&(n.T=Date.now()-e.F,n.j.info("Handshake RTT: "+n.T+"ms"));var a=e;if((r=n).na=nn(r,r.L?r.ba:null,r.W),a.L){Qe(r.h,a);var o=a,c=r.O;c&&(o.H=c),o.D&&(Me(o),Pe(o)),r.g=a}else zt(r);n.i.length>0&&Jt(n)}else"stop"!=B[0]&&"close"!=B[0]||en(n,7);else 3==n.I&&("stop"==B[0]||"close"==B[0]?"stop"==B[0]?en(n,7):Ht(n):"noop"!=B[0]&&n.l&&n.l.qa(B),n.A=0)}pe()}catch(u){}}Ae.prototype.ba=function(e){e=e.target;const t=this.O;t&&3==Pt(e)?t.j():this.Y(e)},Ae.prototype.Y=function(e){try{if(e==this.g)e:{const B=Pt(this.g),c=this.g.ya();this.g.ca();if(!(B<3)&&(3!=B||this.g&&(this.h.h||this.g.la()||xt(this.g)))){this.K||4!=B||7==c||pe(),Me(this);var t=this.g.ca();this.X=t;var n=function(e){if(!Re(e))return e.g.la();const t=xt(e.g);if(""===t)return"";let n="";const r=t.length,s=4==Pt(e.g);if(!e.h.i){if("undefined"==typeof TextDecoder)return He(e),Ge(e),"";e.h.i=new i.TextDecoder}for(let i=0;i<r;i++)e.h.h=!0,n+=e.h.i.decode(t[i],{stream:!(s&&i==r-1)});return t.length=0,e.h.g+=n,e.C=0,e.h.g}(this);if(this.o=200==t,function(e,t,n,r,s,i,a){e.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+t+"\n"+n+"\n"+i+" "+a})}(this.i,this.v,this.B,this.l,this.S,B,t),this.o){if(this.U&&!this.L){t:{if(this.g){var r,s=this.g;if((r=s.g?s.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(r)){var a=r;break t}}a=null}if(!(e=a)){this.o=!1,this.m=3,ge(12),He(this),Ge(this);break e}we(this.i,this.l,e,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ue(this,e)}if(this.R){let t;for(e=!0;!this.K&&this.C<n.length;){if(t=ke(this,n),t==Se){4==B&&(this.m=4,ge(14),e=!1),we(this.i,this.l,null,"[Incomplete Response]");break}if(t==Ne){this.m=4,ge(15),we(this.i,this.l,n,"[Invalid Chunk]"),e=!1;break}we(this.i,this.l,t,null),Ue(this,t)}if(Re(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=B||0!=n.length||this.h.h||(this.m=1,ge(16),e=!1),this.o=this.o&&e,e){if(n.length>0&&!this.W){this.W=!0;var o=this.j;o.g==this&&o.aa&&!o.P&&(o.j.info("Great, no buffering proxy detected. Bytes received: "+n.length),Yt(o),o.P=!0,ge(11))}}else we(this.i,this.l,n,"[Invalid Chunked Response]"),He(this),Ge(this)}else we(this.i,this.l,n,null),Ue(this,n);4==B&&He(this),this.o&&!this.K&&(4==B?Xt(this.j,this):(this.o=!1,Pe(this)))}else(function(e){const t={};e=(e.g&&Pt(e)>=2&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<e.length;r++){if(T(e[r]))continue;var n=be(e[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=t[s]||[];t[s]=i,i.push(n)}!function(e,t){for(const n in e)t.call(void 0,e[n],n,e)}(t,function(e){return e.join(", ")})})(this.g),400==t&&n.indexOf("Unknown SID")>0?(this.m=3,ge(12)):(this.m=0,ge(13)),He(this),Ge(this)}}}catch(B){}},Ae.prototype.cancel=function(){this.K=!0,He(this)},Ae.prototype.aa=function(){this.D=null;const e=Date.now();e-this.T>=0?(function(e,t){e.info(function(){return"TIMEOUT: "+t})}(this.i,this.B),2!=this.M&&(pe(),ge(17)),He(this),this.m=2,Ge(this)):xe(this,this.T-e)};var Ve=class{constructor(e,t){this.g=e,this.map=t}};function Je(e){this.l=e||10,i.PerformanceNavigationTiming?e=(e=i.performance.getEntriesByType("navigation")).length>0&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function je(e){return!!e.h||!!e.g&&e.g.size>=e.j}function Ke(e){return e.h?1:e.g?e.g.size:0}function qe(e,t){return e.h?e.h==t:!!e.g&&e.g.has(t)}function ze(e,t){e.g?e.g.add(t):e.h=t}function Qe(e,t){e.h&&e.h==t?e.h=null:e.g&&e.g.has(t)&&e.g.delete(t)}function Ye(e){if(null!=e.h)return e.i.concat(e.h.G);if(null!=e.g&&0!==e.g.size){let t=e.i;for(const n of e.g.values())t=t.concat(n.G);return t}return h(e.i)}Je.prototype.cancel=function(){if(this.i=Ye(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var We=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function $e(e){let t;this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1,e instanceof $e?(this.l=e.l,Ze(this,e.j),this.o=e.o,this.g=e.g,et(this,e.u),this.h=e.h,tt(this,mt(e.i)),this.m=e.m):e&&(t=String(e).match(We))?(this.l=!1,Ze(this,t[1]||"",!0),this.o=st(t[2]||""),this.g=st(t[3]||"",!0),et(this,t[4]),this.h=st(t[5]||"",!0),tt(this,t[6]||"",!0),this.m=st(t[7]||"")):(this.l=!1,this.i=new ht(null,this.l))}function Xe(e){return new $e(e)}function Ze(e,t,n){e.j=n?st(t,!0):t,e.j&&(e.j=e.j.replace(/:$/,""))}function et(e,t){if(t){if(t=Number(t),isNaN(t)||t<0)throw Error("Bad port number "+t);e.u=t}else e.u=null}function tt(e,t,n){t instanceof ht?(e.i=t,function(e,t){t&&!e.j&&(Ct(e),e.i=null,e.g.forEach(function(e,t){const n=t.toLowerCase();t!=n&&(dt(this,t),gt(this,n,e))},e)),e.j=t}(e.i,e.l)):(n||(t=it(t,ut)),e.i=new ht(t,e.l))}function nt(e,t,n){e.i.set(t,n)}function rt(e){return nt(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function st(e,t){return e?t?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function it(e,t,n){return"string"==typeof e?(e=encodeURI(e).replace(t,at),n&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function at(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}$e.prototype.toString=function(){const e=[];var t=this.j;t&&e.push(it(t,ot,!0),":");var n=this.g;return(n||"file"==t)&&(e.push("//"),(t=this.o)&&e.push(it(t,ot,!0),"@"),e.push(Te(n).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.u)&&e.push(":",String(n))),(n=this.h)&&(this.g&&"/"!=n.charAt(0)&&e.push("/"),e.push(it(n,"/"==n.charAt(0)?ct:Bt,!0))),(n=this.i.toString())&&e.push("?",n),(n=this.m)&&e.push("#",it(n,lt)),e.join("")},$e.prototype.resolve=function(e){const t=Xe(this);let n=!!e.j;n?Ze(t,e.j):n=!!e.o,n?t.o=e.o:n=!!e.g,n?t.g=e.g:n=null!=e.u;var r=e.h;if(n)et(t,e.u);else if(n=!!e.h){if("/"!=r.charAt(0))if(this.g&&!this.h)r="/"+r;else{var s=t.h.lastIndexOf("/");-1!=s&&(r=t.h.slice(0,s+1)+r)}if(".."==(s=r)||"."==s)r="";else if(-1!=s.indexOf("./")||-1!=s.indexOf("/.")){r=0==s.lastIndexOf("/",0),s=s.split("/");const e=[];for(let t=0;t<s.length;){const n=s[t++];"."==n?r&&t==s.length&&e.push(""):".."==n?((e.length>1||1==e.length&&""!=e[0])&&e.pop(),r&&t==s.length&&e.push("")):(e.push(n),r=!0)}r=e.join("/")}else r=s}return n?t.h=r:n=""!==e.i.toString(),n?tt(t,mt(e.i)):n=!!e.m,n&&(t.m=e.m),t};var ot=/[#\/\?@]/g,Bt=/[#\?:]/g,ct=/[#\?]/g,ut=/[#\?@]/g,lt=/#/g;function ht(e,t){this.h=this.g=null,this.i=e||null,this.j=!!t}function Ct(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,t){if(e){e=e.split("&");for(let n=0;n<e.length;n++){const r=e[n].indexOf("=");let s,i=null;r>=0?(s=e[n].substring(0,r),i=e[n].substring(r+1)):s=e[n],t(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}(e.i,function(t,n){e.add(decodeURIComponent(t.replace(/\+/g," ")),n)}))}function dt(e,t){Ct(e),t=Et(e,t),e.g.has(t)&&(e.i=null,e.h-=e.g.get(t).length,e.g.delete(t))}function pt(e,t){return Ct(e),t=Et(e,t),e.g.has(t)}function ft(e,t){Ct(e);let n=[];if("string"==typeof t)pt(e,t)&&(n=n.concat(e.g.get(Et(e,t))));else for(e=Array.from(e.g.values()),t=0;t<e.length;t++)n=n.concat(e[t]);return n}function gt(e,t,n){dt(e,t),n.length>0&&(e.i=null,e.g.set(Et(e,t),h(n)),e.h+=n.length)}function mt(e){const t=new ht;return t.i=e.i,e.g&&(t.g=new Map(e.g),t.h=e.h),t}function Et(e,t){return t=String(t),e.j&&(t=t.toLowerCase()),t}function Dt(e,t,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function wt(){this.g=new ie}function yt(e){this.i=e.Sb||null,this.h=e.ab||!1}function vt(e,t){Y.call(this),this.H=e,this.o=t,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}function _t(e){e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e))}function It(e){e.readyState=4,e.l=null,e.j=null,e.B=null,Tt(e)}function Tt(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function bt(e){let t="";return F(e,function(e,n){t+=n,t+=":",t+=e,t+="\r\n"}),t}function At(e,t,n){e:{for(r in n){var r=!1;break e}r=!0}r||(n=bt(n),"string"==typeof e?null!=n&&Te(n):nt(e,t,n))}function Ot(e){Y.call(this),this.headers=new Map,this.L=e||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}(e=ht.prototype).add=function(e,t){Ct(this),this.i=null,e=Et(this,e);let n=this.g.get(e);return n||this.g.set(e,n=[]),n.push(t),this.h+=1,this},e.forEach=function(e,t){Ct(this),this.g.forEach(function(n,r){n.forEach(function(n){e.call(t,n,r,this)},this)},this)},e.set=function(e,t){return Ct(this),this.i=null,pt(this,e=Et(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[t]),this.h+=1,this},e.get=function(e,t){return e&&(e=ft(this,e)).length>0?String(e[0]):t},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],t=Array.from(this.g.keys());for(let r=0;r<t.length;r++){var n=t[r];const s=Te(n);n=ft(this,n);for(let t=0;t<n.length;t++){let r=s;""!==n[t]&&(r+="="+Te(n[t])),e.push(r)}}return this.i=e.join("&")},u(yt,ae),yt.prototype.g=function(){return new vt(this.i,this.h)},u(vt,Y),(e=vt.prototype).open=function(e,t){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.F=e,this.D=t,this.readyState=1,Tt(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const t={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};e&&(t.body=e),(this.H||i).fetch(new Request(this.D,t)).then(this.Pa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&4!=this.readyState&&(this.g=!1,It(this)),this.readyState=0},e.Pa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Tt(this)),this.g&&(this.readyState=3,Tt(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(void 0!==i.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;_t(this)}else e.text().then(this.Oa.bind(this),this.ga.bind(this))},e.Ma=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var t=e.value?e.value:new Uint8Array(0);(t=this.B.decode(t,{stream:!e.done}))&&(this.response=this.responseText+=t)}e.done?It(this):Tt(this),3==this.readyState&&_t(this)}},e.Oa=function(e){this.g&&(this.response=this.responseText=e,It(this))},e.Na=function(e){this.g&&(this.response=e,It(this))},e.ga=function(){this.g&&It(this)},e.setRequestHeader=function(e,t){this.A.append(e,t)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],t=this.h.entries();for(var n=t.next();!n.done;)n=n.value,e.push(n[0]+": "+n[1]),n=t.next();return e.join("\r\n")},Object.defineProperty(vt.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),u(Ot,Y);var Nt=/^https?$/i,St=["POST","PUT"];function Ft(e,t){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=t,e.o=5,Lt(e),kt(e)}function Lt(e){e.A||(e.A=!0,W(e,"complete"),W(e,"error"))}function Rt(e){if(e.h&&void 0!==s)if(e.v&&4==Pt(e))setTimeout(e.Ca.bind(e),0);else if(W(e,"readystatechange"),4==Pt(e)){e.h=!1;try{const s=e.ca();e:switch(s){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var t=!0;break e;default:t=!1}var n;if(!(n=t)){var r;if(r=0===s){let t=String(e.D).match(We)[1]||null;!t&&i.self&&i.self.location&&(t=i.self.location.protocol.slice(0,-1)),r=!Nt.test(t?t.toLowerCase():"")}n=r}if(n)W(e,"complete"),W(e,"success");else{e.o=6;try{var a=Pt(e)>2?e.g.statusText:""}catch(o){a=""}e.l=a+" ["+e.ca()+"]",Lt(e)}}finally{kt(e)}}}function kt(e,t){if(e.g){e.m&&(clearTimeout(e.m),e.m=null);const r=e.g;e.g=null,t||W(e,"ready");try{r.onreadystatechange=null}catch(n){}}}function Pt(e){return e.g?e.g.readyState:0}function xt(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.F){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(t){return null}}function Mt(e,t,n){return n&&n.internalChannelParams&&n.internalChannelParams[e]||t}function Gt(e){this.za=0,this.i=[],this.j=new De,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Mt("failFast",!1,e),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Mt("baseRetryDelayMs",5e3,e),this.Za=Mt("retryDelaySeedMs",1e4,e),this.Ta=Mt("forwardChannelMaxRetries",2,e),this.va=Mt("forwardChannelRequestTimeoutMs",2e4,e),this.ma=e&&e.xmlHttpFactory||void 0,this.Ua=e&&e.Rb||void 0,this.Aa=e&&e.useFetchStreams||!1,this.O=void 0,this.L=e&&e.supportsCrossDomainXhr||!1,this.M="",this.h=new Je(e&&e.concurrentRequestLimit),this.Ba=new wt,this.S=e&&e.fastHandshake||!1,this.R=e&&e.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=e&&e.Pb||!1,e&&e.ua&&this.j.ua(),e&&e.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&e&&e.detectBufferingProxy||!1,this.ia=void 0,e&&e.longPollingTimeout&&e.longPollingTimeout>0&&(this.ia=e.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}function Ht(e){if(Vt(e),3==e.I){var t=e.V++,n=Xe(e.J);if(nt(n,"SID",e.M),nt(n,"RID",t),nt(n,"TYPE","terminate"),Kt(e,n),(t=new Ae(e,e.j,t)).M=2,t.A=rt(Xe(n)),n=!1,i.navigator&&i.navigator.sendBeacon)try{n=i.navigator.sendBeacon(t.A.toString(),"")}catch(r){}!n&&i.Image&&((new Image).src=t.A,n=!0),n||(t.g=rn(t.j,null),t.g.ea(t.A)),t.F=Date.now(),Pe(t)}tn(e)}function Ut(e){e.g&&(Yt(e),e.g.cancel(),e.g=null)}function Vt(e){Ut(e),e.v&&(i.clearTimeout(e.v),e.v=null),$t(e),e.h.cancel(),e.m&&("number"==typeof e.m&&i.clearTimeout(e.m),e.m=null)}function Jt(e){if(!je(e.h)&&!e.m){e.m=!0;var t=e.Ea;m||w(),E||(m(),E=!0),D.add(t,e),e.D=0}}function jt(e,t){var n;n=t?t.l:e.V++;const r=Xe(e.J);nt(r,"SID",e.M),nt(r,"RID",n),nt(r,"AID",e.K),Kt(e,r),e.u&&e.o&&At(r,e.u,e.o),n=new Ae(e,e.j,n,e.D+1),null===e.u&&(n.J=e.o),t&&(e.i=t.G.concat(e.i)),t=qt(e,n,1e3),n.H=Math.round(.5*e.va)+Math.round(.5*e.va*Math.random()),ze(e.h,n),Fe(n,r,t)}function Kt(e,t){e.H&&F(e.H,function(e,n){nt(t,n,e)}),e.l&&F({},function(e,n){nt(t,n,e)})}function qt(e,t,n){n=Math.min(e.i.length,n);const r=e.l?B(e.l.Ka,e.l,e):null;e:{var s=e.i;let t=-1;for(;;){const e=["count="+n];-1==t?n>0?(t=s[0].g,e.push("ofs="+t)):t=0:e.push("ofs="+t);let B=!0;for(let u=0;u<n;u++){var i=s[u].g;const n=s[u].map;if((i-=t)<0)t=Math.max(0,s[u].g-100),B=!1;else try{i="req"+i+"_"||"";try{var o=n instanceof Map?n:Object.entries(n);for(const[t,n]of o){let r=n;a(n)&&(r=re(n)),e.push(i+t+"="+encodeURIComponent(r))}}catch(c){throw e.push(i+"type="+encodeURIComponent("_badmap")),c}}catch(c){r&&r(n)}}if(B){o=e.join("&");break e}}o=void 0}return e=e.i.splice(0,n),t.G=e,o}function zt(e){if(!e.g&&!e.v){e.Y=1;var t=e.Da;m||w(),E||(m(),E=!0),D.add(t,e),e.A=0}}function Qt(e){return!(e.g||e.v||e.A>=3)&&(e.Y++,e.v=Ee(B(e.Da,e),Zt(e,e.A)),e.A++,!0)}function Yt(e){null!=e.B&&(i.clearTimeout(e.B),e.B=null)}function Wt(e){e.g=new Ae(e,e.j,"rpc",e.Y),null===e.u&&(e.g.J=e.o),e.g.P=0;var t=Xe(e.na);nt(t,"RID","rpc"),nt(t,"SID",e.M),nt(t,"AID",e.K),nt(t,"CI",e.F?"0":"1"),!e.F&&e.ia&&nt(t,"TO",e.ia),nt(t,"TYPE","xmlhttp"),Kt(e,t),e.u&&e.o&&At(t,e.u,e.o),e.O&&(e.g.H=e.O);var n=e.g;e=e.ba,n.M=1,n.A=rt(Xe(t)),n.u=null,n.R=!0,Le(n,e)}function $t(e){null!=e.C&&(i.clearTimeout(e.C),e.C=null)}function Xt(e,t){var n=null;if(e.g==t){$t(e),Yt(e),e.g=null;var r=2}else{if(!qe(e.h,t))return;n=t.G,Qe(e.h,t),r=1}if(0!=e.I)if(t.o)if(1==r){n=t.u?t.u.length:0,t=Date.now()-t.F;var s=e.D;W(r=Ce(),new me(r,n)),Jt(e)}else zt(e);else if(3==(s=t.m)||0==s&&t.X>0||!(1==r&&function(e,t){return!(Ke(e.h)>=e.h.j-(e.m?1:0)||(e.m?(e.i=t.G.concat(e.i),0):1==e.I||2==e.I||e.D>=(e.Sa?0:e.Ta)||(e.m=Ee(B(e.Ea,e,t),Zt(e,e.D)),e.D++,0)))}(e,t)||2==r&&Qt(e)))switch(n&&n.length>0&&(t=e.h,t.i=t.i.concat(n)),s){case 1:en(e,5);break;case 4:en(e,10);break;case 3:en(e,6);break;default:en(e,2)}}function Zt(e,t){let n=e.Qa+Math.floor(Math.random()*e.Za);return e.isActive()||(n*=2),n*t}function en(e,t){if(e.j.info("Error code "+t),2==t){var n=B(e.bb,e),r=e.Ua;const t=!r;r=new $e(r||"//www.google.com/images/cleardot.gif"),i.location&&"http"==i.location.protocol||Ze(r,"https"),rt(r),t?function(e,t){const n=new De;if(i.Image){const r=new Image;r.onload=c(Dt,n,"TestLoadImage: loaded",!0,t,r),r.onerror=c(Dt,n,"TestLoadImage: error",!1,t,r),r.onabort=c(Dt,n,"TestLoadImage: abort",!1,t,r),r.ontimeout=c(Dt,n,"TestLoadImage: timeout",!1,t,r),i.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=e}else t(!1)}(r.toString(),n):function(e,t){new De;const n=new AbortController,r=setTimeout(()=>{n.abort(),Dt(0,0,!1,t)},1e4);fetch(e,{signal:n.signal}).then(e=>{clearTimeout(r),e.ok?Dt(0,0,!0,t):Dt(0,0,!1,t)}).catch(()=>{clearTimeout(r),Dt(0,0,!1,t)})}(r.toString(),n)}else ge(2);e.I=0,e.l&&e.l.pa(t),tn(e),Vt(e)}function tn(e){if(e.I=0,e.ja=[],e.l){const t=Ye(e.h);0==t.length&&0==e.i.length||(C(e.ja,t),C(e.ja,e.i),e.h.i.length=0,h(e.i),e.i.length=0),e.l.oa()}}function nn(e,t,n){var r=n instanceof $e?Xe(n):new $e(n);if(""!=r.g)t&&(r.g=t+"."+r.g),et(r,r.u);else{var s=i.location;r=s.protocol,t=t?t+"."+s.hostname:s.hostname,s=+s.port;const e=new $e(null);r&&Ze(e,r),t&&(e.g=t),s&&et(e,s),n&&(e.h=n),r=e}return n=e.G,t=e.wa,n&&t&&nt(r,n,t),nt(r,"VER",e.ka),Kt(e,r),r}function rn(e,t,n){if(t&&!e.L)throw Error("Can't create secondary domain capable XhrIo object.");return(t=e.Aa&&!e.ma?new Ot(new yt({ab:n})):new Ot(e.ma)).Fa(e.L),t}function sn(){}function an(){}function on(e,t){Y.call(this),this.g=new Gt(t),this.l=e,this.h=t&&t.messageUrlParams||null,e=t&&t.messageHeaders||null,t&&t.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=t&&t.initMessageHeaders||null,t&&t.messageContentType&&(e?e["X-WebChannel-Content-Type"]=t.messageContentType:e={"X-WebChannel-Content-Type":t.messageContentType}),t&&t.sa&&(e?e["X-WebChannel-Client-Profile"]=t.sa:e={"X-WebChannel-Client-Profile":t.sa}),this.g.U=e,(e=t&&t.Qb)&&!T(e)&&(this.g.u=e),this.A=t&&t.supportsCrossDomainXhr||!1,this.v=t&&t.sendRawJson||!1,(t=t&&t.httpSessionIdParam)&&!T(t)&&(this.g.G=t,null!==(e=this.h)&&t in e&&(t in(e=this.h)&&delete e[t])),this.j=new un(this)}function Bn(e){ce.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var t=e.__sm__;if(t){e:{for(const n in t){e=n;break e}e=void 0}(this.i=e)&&(e=this.i,t=null!==t&&e in t?t[e]:void 0),this.data=t}else this.data=e}function cn(){ue.call(this),this.status=1}function un(e){this.g=e}(e=Ot.prototype).Fa=function(e){this.H=e},e.ea=function(e,t,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);t=t?t.toUpperCase():"GET",this.D=e,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ye.g(),this.g.onreadystatechange=l(B(this.Ca,this));try{this.B=!0,this.g.open(t,String(e),!0),this.B=!1}catch(a){return void Ft(this,a)}if(e=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var s in r)n.set(s,r[s]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const e of r.keys())n.set(e,r.get(e))}r=Array.from(n.keys()).find(e=>"content-type"==e.toLowerCase()),s=i.FormData&&e instanceof i.FormData,!(Array.prototype.indexOf.call(St,t,void 0)>=0)||r||s||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[i,o]of n)this.g.setRequestHeader(i,o);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(e),this.v=!1}catch(a){Ft(this,a)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=e||7,W(this,"complete"),W(this,"abort"),kt(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),kt(this,!0)),Ot.Z.N.call(this)},e.Ca=function(){this.u||(this.B||this.v||this.j?Rt(this):this.Xa())},e.Xa=function(){Rt(this)},e.isActive=function(){return!!this.g},e.ca=function(){try{return Pt(this)>2?this.g.status:-1}catch(e){return-1}},e.la=function(){try{return this.g?this.g.responseText:""}catch(e){return""}},e.La=function(e){if(this.g){var t=this.g.responseText;return e&&0==t.indexOf(e)&&(t=t.substring(e.length)),se(t)}},e.ya=function(){return this.o},e.Ha=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=Gt.prototype).ka=8,e.I=1,e.connect=function(e,t,n,r){ge(0),this.W=e,this.H=t||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.J=nn(this,null,this.W),Jt(this)},e.Ea=function(e){if(this.m)if(this.m=null,1==this.I){if(!e){this.V=Math.floor(1e5*Math.random()),e=this.V++;const s=new Ae(this,this.j,e);let i=this.o;if(this.U&&(i?(i=L(i),k(i,this.U)):i=this.U),null!==this.u||this.R||(s.J=i,i=null),this.S)e:{for(var t=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if((t+=r)>4096){t=n;break e}if(4096===t||n===this.i.length-1){t=n+1;break e}}t=1e3}else t=1e3;t=qt(this,s,t),nt(n=Xe(this.J),"RID",e),nt(n,"CVER",22),this.G&&nt(n,"X-HTTP-Session-Id",this.G),Kt(this,n),i&&(this.R?t="headers="+Te(bt(i))+"&"+t:this.u&&At(n,this.u,i)),ze(this.h,s),this.Ra&&nt(n,"TYPE","init"),this.S?(nt(n,"$req",t),nt(n,"SID","null"),s.U=!0,Fe(s,n,null)):Fe(s,n,t),this.I=2}}else 3==this.I&&(e?jt(this,e):0==this.i.length||je(this.h)||jt(this))},e.Da=function(){if(this.v=null,Wt(this),this.aa&&!(this.P||null==this.g||this.T<=0)){var e=4*this.T;this.j.info("BP detection timer enabled: "+e),this.B=Ee(B(this.Wa,this),e)}},e.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ge(10),Ut(this),Wt(this))},e.Va=function(){null!=this.C&&(this.C=null,Ut(this),Qt(this),ge(19))},e.bb=function(e){e?(this.j.info("Successfully pinged google.com"),ge(2)):(this.j.info("Failed to ping google.com"),ge(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=sn.prototype).ra=function(){},e.qa=function(){},e.pa=function(){},e.oa=function(){},e.isActive=function(){return!0},e.Ka=function(){},an.prototype.g=function(e,t){return new on(e,t)},u(on,Y),on.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},on.prototype.close=function(){Ht(this.g)},on.prototype.o=function(e){var t=this.g;if("string"==typeof e){var n={};n.__data__=e,e=n}else this.v&&((n={}).__data__=re(e),e=n);t.i.push(new Ve(t.Ya++,e)),3==t.I&&Jt(t)},on.prototype.N=function(){this.g.l=null,delete this.j,Ht(this.g),delete this.g,on.Z.N.call(this)},u(Bn,ce),u(cn,ue),u(un,sn),un.prototype.ra=function(){W(this.g,"a")},un.prototype.qa=function(e){W(this.g,new Bn(e))},un.prototype.pa=function(e){W(this.g,new cn)},un.prototype.oa=function(){W(this.g,"b")},an.prototype.createWebChannel=an.prototype.g,on.prototype.send=on.prototype.o,on.prototype.open=on.prototype.m,on.prototype.close=on.prototype.close,zs=function(){return new an},qs=function(){return Ce()},Ks=le,js={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ve.NO_ERROR=0,ve.TIMEOUT=8,ve.HTTP_ERROR=6,Js=ve,_e.COMPLETE="complete",Vs=_e,oe.EventType=Be,Be.OPEN="a",Be.CLOSE="b",Be.ERROR="c",Be.MESSAGE="d",Y.prototype.listen=Y.prototype.J,Us=oe,Ot.prototype.listenOnce=Ot.prototype.K,Ot.prototype.getLastError=Ot.prototype.Ha,Ot.prototype.getLastErrorCode=Ot.prototype.ya,Ot.prototype.getStatus=Ot.prototype.ca,Ot.prototype.getResponseJson=Ot.prototype.La,Ot.prototype.getResponseText=Ot.prototype.la,Ot.prototype.send=Ot.prototype.ea,Ot.prototype.setWithCredentials=Ot.prototype.Fa,Hs=Ot}).apply(void 0!==Qs?Qs:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});
/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/
var Ys=(d(e=class{},"FOLD_CASE",1),d(e,"LITERAL",2),d(e,"CLASS_NL",4),d(e,"DOT_NL",8),d(e,"ONE_LINE",16),d(e,"NON_GREEDY",32),d(e,"PERL_X",64),d(e,"UNICODE_GROUPS",128),d(e,"WAS_DOLLAR",256),d(e,"LOOKBEHIND",512),d(e,"MATCH_NL",e.CLASS_NL|e.DOT_NL),d(e,"PERL",e.CLASS_NL|e.ONE_LINE|e.PERL_X|e.UNICODE_GROUPS),d(e,"POSIX",0),d(e,"UNANCHORED",0),d(e,"ANCHOR_START",1),d(e,"ANCHOR_BOTH",2),e);const Ws=1,$s=2,Xs=4,Zs=8,ei=16,ti=512,ni=128,ri=new Int32Array(ni),si=new Int32Array(ni),ii=65535;for(let em=0;em<ni;em++)ri[em]=em>=97&&em<=122?em-32:em,si[em]=em>=65&&em<=90?em+32:em;var ai=(d(t=class{static toUpperCase(e){if(e<ni)return ri[e];const t=String.fromCodePoint(e).toUpperCase(),n=t.codePointAt(0)>ii?2:1;if(t.length>n)return e;const r=String.fromCodePoint(t.codePointAt(0)).toLowerCase(),s=r.codePointAt(0)>ii?2:1;return r.length>s||r.codePointAt(0)!==e?e:t.codePointAt(0)}static toLowerCase(e){if(e<ni)return si[e];const t=String.fromCodePoint(e).toLowerCase(),n=t.codePointAt(0)>ii?2:1;if(t.length>n)return e;const r=String.fromCodePoint(t.codePointAt(0)).toUpperCase(),s=r.codePointAt(0)>ii?2:1;return r.length>s||r.codePointAt(0)!==e?e:t.codePointAt(0)}},"CODES",new Map([["",7],["\b",8],["\t",9],["\n",10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),t),oi=class{constructor(e,t=!1){this.data=e,this.isStride1=t,this.SIZE=t?2:3}getLo(e){return this.data[e*this.SIZE]}getHi(e){return this.data[e*this.SIZE+1]}getStride(e){return this.isStride1?1:this.data[e*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const Bi=new Uint8Array(256);for(let em=0,tm="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";em<64;em++)Bi[tm.charCodeAt(em)]=em;const ci=e=>{const t=[];let n=0,r=0;for(let s=0;s<e.length;s++){let i=Bi[e.charCodeAt(s)];n|=(31&i)<<r,32&i?r+=5:(t.push(n),n=0,r=0)}return t},ui=(e,t)=>{const n=ci(e),r=t?n.length/2:n.length/3,s=new Uint32Array(3*r);let i=0,a=0;for(let o=0;o<r;o++)i+=n[a++],s[3*o]=i,i+=n[a++],s[3*o+1]=i,s[3*o+2]=t?1:n[a++];return s};var li=class{constructor(e){this.initializer=e,this.cache=new Map}has(e){return e in this.initializer}get(e){if(this.cache.has(e))return this.cache.get(e);const t=this.initializer[e],n=t?t():null;return this.cache.set(e,n),n}},hi=(d(n=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=(e=>{const t=ci(e),n=new Map;let r=0;for(let s=0;s<t.length;s+=2){r+=t[s];const e=t[s+1],i=e>>>1^-(1&e);n.set(r,r+i)}return n})("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new oi(ui("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},"_CASE_ORBIT",null),d(n,"_Print",null),d(n,"CATEGORIES",new li({C:()=>new oi(ui("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new oi(ui("AfgDgB",!0)),Cf:()=>new oi(ui("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new oi(ui("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new oi(ui("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new oi(ui("gg2B--B",!0)),L:()=>new oi(ui("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new oi(ui("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new oi(ui("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new oi(ui("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new oi(ui("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new oi(ui("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new oi(ui("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new oi(ui("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new oi(ui("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new oi(ui("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new oi(ui("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new oi(ui("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new oi(ui("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new oi(ui("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new oi(ui("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new oi(ui("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new oi(ui("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new oi(ui("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new oi(ui("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new oi(ui("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new oi(ui("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new oi(ui("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new oi(ui("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new oi(ui("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new oi(ui("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new oi(ui("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new oi(ui("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new oi(ui("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new oi(ui("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new oi(ui("ohIA",!0)),Zp:()=>new oi(ui("phIA",!0)),Zs:()=>new oi(ui("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new oi(ui("wBJIFbF",!0)),Alphabetic:()=>new oi(ui("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new oi(ui("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new oi(ui("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new oi(ui("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new oi(ui("7-8DE",!0)),Emoji_Modifier_Base:()=>new oi(ui("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new oi(ui("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new oi(ui("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new oi(ui("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new oi(ui("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new oi(ui("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new oi(ui("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new oi(ui("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new oi(ui("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new oi(ui("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),d(n,"SCRIPTS",new li({Adlam:()=>new oi(ui("go6DrCFJFB",!0)),Ahom:()=>new oi(ui("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new oi(ui("ggxCmS",!0)),Arabic:()=>new oi(ui("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new oi(ui("xpBlBDxBDCks9BE",!0)),Avestan:()=>new oi(ui("g4iC1BEG",!0)),Balinese:()=>new oi(ui("g4GsCCxB",!0)),Bamum:()=>new oi(ui("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new oi(ui("w26CdDF",!0)),Batak:()=>new oi(ui("g+GzBJD",!0)),Bengali:()=>new oi(ui("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new oi(ui("g17CYDY",!0)),Bhaiksuki:()=>new oi(ui("ggnCICsBCNLc",!0)),Bopomofo:()=>new oi(ui("qXB6wLqBxDf",!0)),Brahmi:()=>new oi(ui("ggkCtCFjBKA",!0)),Braille:()=>new oi(ui("ggK-H",!0)),Buginese:()=>new oi(ui("gwGbDB",!0)),Buhid:()=>new oi(ui("g6FT",!0)),Canadian_Aboriginal:()=>new oi(ui("ggF-TxRlC7tgCP",!0)),Carian:()=>new oi(ui("g1gCwB",!0)),Caucasian_Albanian:()=>new oi(ui("wphCzBMA",!0)),Chakma:()=>new oi(ui("gokC0BCR",!0)),Cham:()=>new oi(ui("gwqB2BKNDJDD",!0)),Cherokee:()=>new oi(ui("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new oi(ui("w9jCb",!0)),Common:()=>new oi(ui("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new oi(ui("ifNxkKzDGG",!0)),Cuneiform:()=>new oi(ui("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new oi(ui("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new oi(ui("w8rCiD",!0)),Cyrillic:()=>new oi(ui("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new oi(ui("gghCvC",!0)),Devanagari:()=>new oi(ui("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new oi(ui("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new oi(ui("ggmC7B",!0)),Duployan:()=>new oi(ui("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new oi(ui("ggsC1iBL68D",!0)),Elbasan:()=>new oi(ui("gohCnB",!0)),Elymaic:()=>new oi(ui("g-jCW",!0)),Ethiopic:()=>new oi(ui("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new oi(ui("gqjClBEcJB",!0)),Georgian:()=>new oi(ui("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new oi(ui("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new oi(ui("w5gCa",!0)),Grantha:()=>new oi(ui("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new oi(ui("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new oi(ui("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new oi(ui("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new oi(ui("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new oi(ui("go4C5B",!0)),Han:()=>new oi(ui("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new oi(ui("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new oi(ui("gojCnBJJ",!0)),Hanunoo:()=>new oi(ui("g5FU",!0)),Hatran:()=>new oi(ui("gniCSCBGE",!0)),Hebrew:()=>new oi(ui("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new oi(ui("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new oi(ui("giiCVCI",!0)),Inherited:()=>new oi(ui("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new oi(ui("g7iCSGH",!0)),Inscriptional_Parthian:()=>new oi(ui("g6iCVDH",!0)),Javanese:()=>new oi(ui("gsqBtCDJFB",!0)),Kaithi:()=>new oi(ui("gkkCiCLA",!0)),Kannada:()=>new oi(ui("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new oi(ui("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new oi(ui("g4nCQCoBEc",!0)),Kayah_Li:()=>new oi(ui("goqBtBCA",!0)),Kharoshthi:()=>new oi(ui("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new oi(ui("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new oi(ui("g8F9CDJHJnPf",!0)),Khojki:()=>new oi(ui("gwkCRCuB",!0)),Khudawadi:()=>new oi(ui("w1kC6BGJ",!0)),Kirat_Rai:()=>new oi(ui("gq7C5B",!0)),Lao:()=>new oi(ui("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new oi(ui("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new oi(ui("ggH3BEOEC",!0)),Limbu:()=>new oi(ui("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new oi(ui("gwhC2JKVLH",!0)),Linear_B:()=>new oi(ui("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new oi(ui("wmpBvBx1eA",!0)),Lycian:()=>new oi(ui("g0gCc",!0)),Lydian:()=>new oi(ui("gpiCZGA",!0)),Mahajani:()=>new oi(ui("wqkCmB",!0)),Makasar:()=>new oi(ui("g3nCY",!0)),Malayalam:()=>new oi(ui("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new oi(ui("giCbDA",!0)),Manichaean:()=>new oi(ui("g2iCmBFL",!0)),Marchen:()=>new oi(ui("wjnCfDVCN",!0)),Masaram_Gondi:()=>new oi(ui("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new oi(ui("gy7C6C",!0)),Meetei_Mayek:()=>new oi(ui("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new oi(ui("gg6DkGDP",!0)),Meroitic_Cursive:()=>new oi(ui("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new oi(ui("gsiCf",!0)),Miao:()=>new oi(ui("g47CqCF4BIQ",!0)),Modi:()=>new oi(ui("gwlCkCMJ",!0)),Mongolian:()=>new oi(ui("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new oi(ui("gy6CeCJFB",!0)),Multani:()=>new oi(ui("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new oi(ui("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new oi(ui("gkiCeJI",!0)),Nag_Mundari:()=>new oi(ui("wm5DpB",!0)),Nandinagari:()=>new oi(ui("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new oi(ui("gsGrBFZHKEB",!0)),Newa:()=>new oi(ui("gglC7CCE",!0)),Nko:()=>new oi(ui("g+B6BDC",!0)),Nushu:()=>new oi(ui("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new oi(ui("go4DsBENDJFB",!0)),Ogham:()=>new oi(ui("g0Fc",!0)),Ol_Chiki:()=>new oi(ui("wiHvB",!0)),Ol_Onal:()=>new oi(ui("wu5DqBFA",!0)),Old_Hungarian:()=>new oi(ui("gkjCyBOyBIF",!0)),Old_Italic:()=>new oi(ui("g4gCjBKC",!0)),Old_North_Arabian:()=>new oi(ui("g0iCf",!0)),Old_Permic:()=>new oi(ui("w6gCqB",!0)),Old_Persian:()=>new oi(ui("g9gCjBFN",!0)),Old_Sogdian:()=>new oi(ui("g4jCnB",!0)),Old_South_Arabian:()=>new oi(ui("gziCf",!0)),Old_Turkic:()=>new oi(ui("ggjCoC",!0)),Old_Uyghur:()=>new oi(ui("w7jCZ",!0)),Oriya:()=>new oi(ui("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new oi(ui("wlhCjBFjB",!0)),Osmanya:()=>new oi(ui("gkhCdDJ",!0)),Pahawh_Hmong:()=>new oi(ui("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new oi(ui("gjiCf",!0)),Pau_Cin_Hau:()=>new oi(ui("g2mC4B",!0)),Phags_Pa:()=>new oi(ui("giqB3B",!0)),Phoenician:()=>new oi(ui("goiCbEA",!0)),Psalter_Pahlavi:()=>new oi(ui("g8iCRIDNG",!0)),Rejang:()=>new oi(ui("wpqBjBMA",!0)),Runic:()=>new oi(ui("g1FqCEK",!0)),Samaritan:()=>new oi(ui("ggCtBDO",!0)),Saurashtra:()=>new oi(ui("gkqBlCJL",!0)),Sharada:()=>new oi(ui("gskC-ChsCH",!0)),Shavian:()=>new oi(ui("wihCvB",!0)),Siddham:()=>new oi(ui("gslC1BDlB",!0)),Sidetic:()=>new oi(ui("gqiCZ",!0)),SignWriting:()=>new oi(ui("gg2DrUQECO",!0)),Sinhala:()=>new oi(ui("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new oi(ui("w5jCpB",!0)),Sora_Sompeng:()=>new oi(ui("wmkCYIJ",!0)),Soyombo:()=>new oi(ui("wymCyC",!0)),Sundanese:()=>new oi(ui("g8G-BhIH",!0)),Sunuwar:()=>new oi(ui("g+mChBPJ",!0)),Syloti_Nagri:()=>new oi(ui("ggqBsB",!0)),Syriac:()=>new oi(ui("g4BNC7BDCxIK",!0)),Tagalog:()=>new oi(ui("g4FVKA",!0)),Tagbanwa:()=>new oi(ui("g7FMCCCB",!0)),Tai_Le:()=>new oi(ui("wqGdDE",!0)),Tai_Tham:()=>new oi(ui("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new oi(ui("g0qBiCZE",!0)),Tai_Yo:()=>new oi(ui("g25DeCVJB",!0)),Takri:()=>new oi(ui("g0lC5BHJ",!0)),Tamil:()=>new oi(ui("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new oi(ui("wz6CuCCJ",!0)),Tangut:()=>new oi(ui("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new oi(ui("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new oi(ui("g8BxB",!0)),Thai:()=>new oi(ui("hwD5BGb",!0)),Tibetan:()=>new oi(ui("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new oi(ui("wpL3BIBPA",!0)),Tirhuta:()=>new oi(ui("gklCnCJJ",!0)),Todhri:()=>new oi(ui("guhCzB",!0)),Tolong_Siki:()=>new oi(ui("wtnCrBFJ",!0)),Toto:()=>new oi(ui("w04De",!0)),Tulu_Tigalari:()=>new oi(ui("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new oi(ui("g8gCdCA",!0)),Unknown:()=>new oi(ui("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new oi(ui("gopBrJ",!0)),Vithkuqi:()=>new oi(ui("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new oi(ui("g24D5BGA",!0)),Warang_Citi:()=>new oi(ui("glmCyCNA",!0)),Yezidi:()=>new oi(ui("g0jCpBCCDB",!0)),Yi:()=>new oi(ui("ggoBskBE2B",!0)),Zanabazar_Square:()=>new oi(ui("gwmCnC",!0))})),d(n,"FOLD_CATEGORIES",new li({L:()=>new oi(ui("laA",!0)),LC:()=>new oi(ui("laA",!0)),Ll:()=>new oi(ui("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new oi(ui("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new oi(ui("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new oi(ui("5cgBgBlgHAB",!1)),Mn:()=>new oi(ui("5cgBgBlgHAB",!1)),Emoji:()=>new oi(ui("8mJA",!0)),Extended_Pictographic:()=>new oi(ui("8mJA",!0)),Lowercase:()=>new oi(ui("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new oi(ui("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new oi(ui("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),d(n,"FOLD_SCRIPT",new li({Common:()=>new oi(ui("8cgBgB",!1)),Greek:()=>new oi(ui("1FwUwU",!1)),Inherited:()=>new oi(ui("5cgBgBlgHAB",!1))})),n),Ci=(d(r=class{static is32(e,t){let n=0,r=e.length;for(;n<r;){const s=n+Math.floor((r-n)/2),i=e.getLo(s),a=e.getHi(s);if(i<=t&&t<=a){return(t-i)%e.getStride(s)===0}t<i?r=s:n=s+1}return!1}static is(e,t){if(t<=r.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const r=e.getLo(n);if(t<r)return!1;return(t-r)%e.getStride(n)===0}return!1}return e.length>0&&t>=e.getLo(0)&&r.is32(e,t)}static isUpper(e){if(e<=r.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return r.is(hi.Upper,e)}static isPrint(e){return e<=r.MAX_LATIN1?e>=32&&e<r.MAX_ASCII||e>=161&&173!==e:r.is(hi.Print,e)}static simpleFold(e){if(hi.CASE_ORBIT.has(e))return hi.CASE_ORBIT.get(e);const t=ai.toLowerCase(e);return t!==e?t:ai.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=r.MAX_ASCII&&t<=r.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=r.simpleFold(e);n!==e;n=r.simpleFold(n))if(n===t)return!0;return!1}},"MAX_RUNE",1114111),d(r,"MAX_ASCII",127),d(r,"MAX_LATIN1",255),d(r,"MAX_BMP",65535),d(r,"MIN_FOLD",65),d(r,"MAX_FOLD",125251),d(r,"MIN_HIGH_SURROGATE",55296),d(r,"MAX_HIGH_SURROGATE",56319),d(r,"MIN_LOW_SURROGATE",56320),d(r,"MAX_LOW_SURROGATE",57343),d(r,"MIN_SUPPLEMENTARY_CODE_POINT",65536),r);const di=new Uint8Array(256);for(let em=0;em<256;em++)di[em]=97<=em&&em<=122||65<=em&&em<=90||48<=em&&em<=57||95===em?1:0;let pi=null,fi=null;var gi=(s=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return ai.CODES.get("0")<=e&&e<=ai.CODES.get("9")||ai.CODES.get("a")<=e&&e<=ai.CODES.get("z")||ai.CODES.get("A")<=e&&e<=ai.CODES.get("Z")}static unhex(e){return ai.CODES.get("0")<=e&&e<=ai.CODES.get("9")?e-ai.CODES.get("0"):ai.CODES.get("a")<=e&&e<=ai.CODES.get("f")?e-ai.CODES.get("a")+10:ai.CODES.get("A")<=e&&e<=ai.CODES.get("F")?e-ai.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(Ci.isPrint(e))s.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case ai.CODES.get('"'):t+='\\"';break;case ai.CODES.get("\\"):t+="\\\\";break;case ai.CODES.get("\t"):t+="\\t";break;case ai.CODES.get("\n"):t+="\\n";break;case ai.CODES.get("\r"):t+="\\r";break;case ai.CODES.get("\b"):t+="\\b";break;case ai.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",1===n.length&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let r=0;for(;r<t.length;){const e=t.codePointAt(r);n.push(e),r+=e>Ci.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<256&&1===di[e]}static emptyOpContext(e,t){let n=0;return e<0&&(n|=s.EMPTY_BEGIN_TEXT|s.EMPTY_BEGIN_LINE),10===e&&(n|=s.EMPTY_BEGIN_LINE),t<0&&(n|=s.EMPTY_END_TEXT|s.EMPTY_END_LINE),10===t&&(n|=s.EMPTY_END_LINE),s.isWordRune(e)!==s.isWordRune(t)?n|=s.EMPTY_WORD_BOUNDARY:n|=s.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(e=>s.METACHARACTERS.indexOf(e)>=0?`\\${e}`:e).join("")}static charCount(e){return e>Ci.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return pi||(pi=new TextEncoder),pi.encode(e);{let t=[],n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):(64512&s)===Ci.MIN_HIGH_SURROGATE&&r+1<e.length&&(64512&e.charCodeAt(r+1))===Ci.MIN_LOW_SURROGATE?(s=Ci.MIN_SUPPLEMENTARY_CODE_POINT+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){fi||(fi=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return fi.decode(t)}{let t=[],n=0,r=0;for(;n<e.length;){let s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){let i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){let i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-Ci.MIN_SUPPLEMENTARY_CODE_POINT;t[r++]=String.fromCharCode(Ci.MIN_HIGH_SURROGATE+(i>>10)),t[r++]=String.fromCharCode(Ci.MIN_LOW_SURROGATE+(1023&i))}else{let i=e[n++],a=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&a)}}return t.join("")}}},d(s,"METACHARACTERS","\\.+*?()|[]{}^$"),d(s,"EMPTY_BEGIN_LINE",1),d(s,"EMPTY_END_LINE",2),d(s,"EMPTY_BEGIN_TEXT",4),d(s,"EMPTY_END_TEXT",8),d(s,"EMPTY_WORD_BOUNDARY",16),d(s,"EMPTY_NO_WORD_BOUNDARY",32),d(s,"EMPTY_ALL",-1),s);const mi=(e=[],t=0)=>{const n=Object.create(null);for(let r=0;r<e.length;r++){const s=e[r],i=t+r;n[s]=i,n[i]=s}return Object.freeze(n)};var Ei=(d(i=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===i.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===i.Encoding.UTF_16}},"Encoding",mi(["UTF_16","UTF_8"])),i),Di=class extends Ei{constructor(e=null){super(),this.bytes=e}getEncoding(){return Ei.Encoding.UTF_8}asCharSequence(){return gi.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},wi=class extends Ei{constructor(e=null){super(),this.charSequence=e}getEncoding(){return Ei.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return gi.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},yi=class{static utf16(e){return new wi(e)}static utf8(e){return gi.isByteArray(e)?new Di(e):new Di(gi.stringToUtf8ByteArray(e))}},vi=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},_i=class extends vi{constructor(e,t=0,n=e.length){super(),this.bytes=e,this.start=t,this.end=n}hasString(e,t){const n=e.bytes;if(0===n.length)return!0;const r=this.indexOf(this.bytes,n,this.start+t);return-1!==r&&r<=this.end-n.length}hasAnyString(e,t){return!!e.ac8&&e.ac8.searchUTF8(this.bytes,this.start+t,this.end)}step(e){if((e+=this.start)>=this.end)return vi.EOF();const t=255&this.bytes[e];if(t<128)return t<<3|1;if(t>=194&&t<=223&&e+1<this.end){const n=255&this.bytes[e+1];return 128!=(192&n)?t<<3|1:((31&t)<<6|63&n)<<3|2}if(t>=224&&t<=239&&e+2<this.end){const n=255&this.bytes[e+1];if(128!=(192&n))return t<<3|1;const r=255&this.bytes[e+2];return 128!=(192&r)?t<<3|1:((15&t)<<12|(63&n)<<6|63&r)<<3|3}if(t>=240&&t<=244&&e+3<this.end){const n=255&this.bytes[e+1];if(128!=(192&n))return t<<3|1;const r=255&this.bytes[e+2];if(128!=(192&r))return t<<3|1;const s=255&this.bytes[e+3];return 128!=(192&s)?t<<3|1:((7&t)<<18|(63&n)<<12|(63&r)<<6|63&s)<<3|4}return t<<3|1}index(e,t){t+=this.start;const n=this.indexOf(this.bytes,e.prefixUTF8,t);return n<0?n:n-t}context(e){let t=-1;if((e+=this.start)>this.start&&e<=this.end){let n=e-1;if(t=this.bytes[n--],t>=128){let r=e-4;for(r<this.start&&(r=this.start);n>=r&&128==(192&this.bytes[n]);)n--;n<this.start&&(n=this.start),t=this.step(n-this.start)>>3}}const n=e<this.end?this.step(e-this.start)>>3:-1;return gi.emptyOpContext(t,n)}indexOf(e,t,n=0){let r=t.length;if(0===r)return n<=this.end?n:-1;const s=t[0];let i=this.end-r;const a="function"==typeof e.indexOf;let o=n;for(;o<=i;){if(a){if(o=e.indexOf(s,o),-1===o||o>i)return-1}else{for(;o<=i&&e[o]!==s;)o++;if(o>i)return-1}let n=!0;for(let s=1;s<r;s++)if(e[o+s]!==t[s]){n=!1;break}if(n)return o;o++}return-1}prefixLength(e){return e.prefixUTF8.length}},Ii=class extends vi{constructor(e,t=0,n=e.length){super(),this.charSequence=e,this.start=t,this.end=n}hasString(e,t){const n=this.charSequence.indexOf(e.str,this.start+t);return-1!==n&&n<=this.end-e.str.length}hasAnyString(e,t){return!!e.ac16&&e.ac16.searchUTF16(this.charSequence,this.start+t,this.end)}step(e){if((e+=this.start)>=this.end)return vi.EOF();const t=this.charSequence.charCodeAt(e);if(t<Ci.MIN_HIGH_SURROGATE||t>Ci.MAX_HIGH_SURROGATE||e+1>=this.end)return t<<3|1;const n=this.charSequence.charCodeAt(e+1);return n>=Ci.MIN_LOW_SURROGATE&&n<=Ci.MAX_LOW_SURROGATE?1024*(t-Ci.MIN_HIGH_SURROGATE)+(n-Ci.MIN_LOW_SURROGATE)+Ci.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:t<<3|1}index(e,t){t+=this.start;const n=this.charSequence.indexOf(e.prefix,t);return n<0||n>this.end-e.prefix.length?-1:n-t}context(e){const t=(e+=this.start)>this.start&&e<=this.end?this.charSequence.charCodeAt(e-1):-1,n=e<this.end?this.charSequence.charCodeAt(e):-1;return gi.emptyOpContext(t,n)}prefixLength(e){return e.prefix.length}},Ti=class{static fromUTF8(e,t=0,n=e.length){return new _i(e,t,n)}static fromUTF16(e,t=0,n=e.length){return new Ii(e,t,n)}},bi=class extends Error{constructor(e){super(e),this.name="RE2JSException"}},Ai=class extends bi{constructor(e,t=null){let n=`error parsing regexp: ${e}`;t&&(n+=`: \`${t}\``),super(n),this.name="RE2JSSyntaxException",this.message=n,this.error=e,this.input=t}getDescription(){return this.error}getPattern(){return this.input}},Oi=class extends bi{constructor(e){super(e),this.name="RE2JSCompileException"}},Ni=class extends bi{constructor(e){super(e),this.name="RE2JSGroupException"}},Si=class extends bi{constructor(e){super(e),this.name="RE2JSFlagsException"}},Fi=class extends bi{constructor(e){super(e),this.name="RE2JSInternalException"}},Li=(a=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(e=>{const t=e.codePointAt(0);return t===ai.CODES.get("\\")||t===ai.CODES.get("$")?`\\${e}`:e}).join(""):e.indexOf("$")<0?e:e.split("").map(e=>e.codePointAt(0)===ai.CODES.get("$")?"$$":e).join("")}constructor(e,t){if(null===e)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof Ei?this.resetMatcherInput(t):gi.isByteArray(t)?this.resetMatcherInput(yi.utf8(t)):this.resetMatcherInput(yi.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(null===e)throw new Error("input is null");return e instanceof Ei||(e=gi.isByteArray(e)?yi.utf8(e):yi.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Ni(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Ni(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Ni(`group '${e}' not found`);e=t}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new Ni("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new Ni(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new Ni("perhaps no match attempted");if(0===e||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new Ni("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,Ys.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,Ys.ANCHOR_START)}find(e=null){if(null!==e){if(e<0||e>this.matcherInputLength)throw new Ni(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?Ti.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):Ti.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=7&t}return this.genMatch(e,Ys.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=0===this.patternGroupCount,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?gi.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const r=this.start(),s=this.end();return this.appendPos<r&&(n+=this.substring(this.appendPos,r)),this.appendPos=s,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const r=e.length;let s=0;for(;s<r;){const i=e.codePointAt(s);if(i!==ai.CODES.get("\\")){if(i===ai.CODES.get("$")){if(n<s&&(t+=e.substring(n,s)),s+1>=r)throw new Ni("Illegal group reference: group index is missing");const i=e.codePointAt(s+1);if(ai.CODES.get("0")<=i&&i<=ai.CODES.get("9")){let a=i-ai.CODES.get("0"),o=s+2;for(;o<r;o++){const t=e.codePointAt(o);if(t<ai.CODES.get("0")||t>ai.CODES.get("9")||10*a+t-ai.CODES.get("0")>this.patternGroupCount)break;a=10*a+t-ai.CODES.get("0")}if(a>this.patternGroupCount)throw new Ni(`n > number of groups: ${a}`);const B=this.group(a);null!==B&&(t+=B),s=o,n=s}else{if(i!==ai.CODES.get("{"))throw new Ni("Illegal group reference");{let i=s+2;for(;i<r&&e.codePointAt(i)!==ai.CODES.get("}");)i++;if(i>=r)throw new Ni("named capture group is missing trailing '}'");const a=e.substring(s+2,i),o=this.group(a);null!==o&&(t+=o),s=i+1,n=s}}continue}s++}else{if(n<s&&(t+=e.substring(n,s)),s++,s>=r)throw new Ni("character to be escaped is missing");n=s,s++}}return n<r&&(t+=e.substring(n,r)),t}appendReplacementInternalJs(e){let t="",n=0;const r=e.length;for(let s=0;s<r-1;s++)if(e.codePointAt(s)===ai.CODES.get("$")){let i=e.codePointAt(s+1);if(ai.CODES.get("$")===i){n<s&&(t+=e.substring(n,s)),t+="$",s++,n=s+1;continue}if(ai.CODES.get("&")===i){n<s&&(t+=e.substring(n,s));const r=this.group(0);t+=null!==r?r:"$&",s++,n=s+1;continue}if(ai.CODES.get("`")===i){n<s&&(t+=e.substring(n,s)),t+=this.substring(0,this.start(0)),s++,n=s+1;continue}if(ai.CODES.get("'")===i){n<s&&(t+=e.substring(n,s)),t+=this.substring(this.end(0),this.matcherInputLength),s++,n=s+1;continue}if(ai.CODES.get("1")<=i&&i<=ai.CODES.get("9")){let a=i-ai.CODES.get("0");for(n<s&&(t+=e.substring(n,s)),s+=2;s<r&&(i=e.codePointAt(s),!(i<ai.CODES.get("0")||i>ai.CODES.get("9")||10*a+i-ai.CODES.get("0")>this.patternGroupCount));s++)a=10*a+i-ai.CODES.get("0");if(a>this.patternGroupCount){t+=`$${a}`,n=s,s--;continue}const o=this.group(a);null!==o&&(t+=o),n=s,s--;continue}if(i===ai.CODES.get("<")){n<s&&(t+=e.substring(n,s)),s++;let r=s+1;for(;r<e.length&&e.codePointAt(r)!==ai.CODES.get(">")&&e.codePointAt(r)!==ai.CODES.get(" ");)r++;if(r===e.length||e.codePointAt(r)!==ai.CODES.get(">")){t+=e.substring(s-1,r+1),n=r+1,s=r;continue}const i=e.substring(s+1,r);if(Object.prototype.hasOwnProperty.call(this.namedGroups,i)){const e=this.group(i);null!==e&&(t+=e)}else t+=`$<${i}>`;n=r+1,s=r;continue}}return n<r&&(t+=e.substring(n,r)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let r="";this.reset();const s="function"==typeof e,i=Object.keys(this.namedGroups).length>0;let o=null;if(s){if(this.groupCount()>=a.MAX_REPLACER_ARGS)throw new Ni("Too many capture groups to safely invoke replacer function");o=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(r+=s?this.appendReplacementFunc(e,i,o):this.appendReplacement(e,n),t););return r+=this.appendTail(),r}appendReplacementFunc(e,t,n){let r="";const s=this.start(),i=this.end();this.appendPos<s&&(r+=this.substring(this.appendPos,s)),this.appendPos=i;const a=this.buildReplacerArgs(s,t,n);return r+=String(e(...a)),r}buildReplacerArgs(e,t,n){const r=[this.group(0)],s=this.groupCount();for(let i=1;i<=s;i++){const e=this.start(i);e<0?r.push(void 0):r.push(this.substring(e,this.end(i)))}if(r.push(e),r.push(n),t){const e=this.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);r.push(e)}return r}},d(a,"MAX_REPLACER_ARGS",65535),a),Ri=(d(o=class{static isRuneOp(e){return o.RUNE<=e&&e<=o.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=gi.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(1===this.runes.length){const t=this.runes[0];return 0!==(this.arg&Ys.FOLD_CASE)?Ci.equalsIgnoreCase(t,e):e===t}const t=this.runes.length;if(0===t)return!1;if(2===t||4===t||6===t||8===t){for(let n=0;n<t;n+=2){if(e<this.runes[n])return!1;if(e<=this.runes[n+1])return!0}return!1}let n=0,r=t>>1;for(;r>1;){const t=r>>1;n+=this.runes[n+t<<1]<=e?t:0,r-=t}n+=this.runes[n<<1]<=e?1:0;const s=n-1;return s>=0&&e<=this.runes[s<<1|1]}matchRunePos(e){if(1===this.runes.length){const t=this.runes[0];return 0!==(this.arg&Ys.FOLD_CASE)?Ci.equalsIgnoreCase(t,e)?0:-1:e===t?0:-1}const t=this.runes.length;if(0===t)return-1;if(2===t||4===t||6===t||8===t){for(let n=0;n<t;n+=2){if(e<this.runes[n])return-1;if(e<=this.runes[n+1])return Math.floor(n/2)}return-1}let n=0,r=t>>1;for(;r>1;){const t=r>>1;n+=this.runes[n+t<<1]<=e?t:0,r-=t}n+=this.runes[n<<1]<=e?1:0;const s=n-1;return s>=0&&e<=this.runes[s<<1|1]?s:-1}toString(){switch(this.op){case o.ALT:return`alt -> ${this.out}, ${this.arg}`;case o.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case o.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case o.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case o.MATCH:return"match"+(0!==this.arg?` ${this.arg}`:"");case o.FAIL:return"fail";case o.NOP:return`nop -> ${this.out}`;case o.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case o.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case o.RUNE:return null===this.runes?"rune <null>":["rune ",o.escapeRunes(this.runes),0!==(this.arg&Ys.FOLD_CASE)?"/i":""," -> ",this.out].join("");case o.RUNE1:return`rune1 ${o.escapeRunes(this.runes)} -> ${this.out}`;case o.RUNE_ANY:return`any -> ${this.out}`;case o.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},"ALT",1),d(o,"ALT_MATCH",2),d(o,"CAPTURE",3),d(o,"EMPTY_WIDTH",4),d(o,"FAIL",5),d(o,"MATCH",6),d(o,"NOP",7),d(o,"RUNE",8),d(o,"RUNE1",9),d(o,"RUNE_ANY",10),d(o,"RUNE_ANY_NOT_NL",11),d(o,"LB_WRITE",12),d(o,"LB_CHECK",13),o),ki=class{constructor(e){this.sparse=new Int32Array(e),this.densePcs=new Int32Array(e),this.denseCaps=null,this.size=0,this.ncap=0}init(e){this.ncap=e;const t=this.densePcs.length*e;(!this.denseCaps||this.denseCaps.length<t)&&(this.denseCaps=new Int32Array(t))}contains(e){const t=this.sparse[e];return t<this.size&&this.densePcs[t]===e}isEmpty(){return 0===this.size}add(e){const t=this.size++;return this.sparse[e]=t,this.densePcs[t]=e,t}clear(){this.size=0}toString(){let e="{";for(let t=0;t<this.size;t++)0!==t&&(e+=", "),e+=this.densePcs[t];return e+="}",e}},Pi=class e{static fromRE2(t){const n=new e;return n.prog=t.prog,n.re2=t,n.q0=new ki(n.prog.numInst()),n.q1=new ki(n.prog.numInst()),n.matched=!1,n.matchcap=new Int32Array(n.prog.numCap<2?2:n.prog.numCap),n.ncap=0,n}static fromMachine(t){return e.fromRE2(t.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return 0===this.ncap?gi.emptyInts():gi.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const r=this.re2.cond;if(r===gi.EMPTY_ALL)return!1;if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==t)return!1;this.matched=!1,this.matchcap.fill(-1);let s,i=this.prog.numLb>0?0:t,a=t,o=this.q0,B=this.q1,c=e.step(i),u=c>>3,l=7&c,h=-1,C=0;for(c!==vi.EOF()&&(c=e.step(i+l),h=c>>3,C=7&c),s=0===i?gi.emptyOpContext(-1,u):e.context(i);;){if(o.isEmpty()){if(0!==(r&gi.EMPTY_BEGIN_TEXT)&&0!==i)break;if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==i)break;if(this.matched)break;if(0===this.prog.numLb&&0!==this.re2.prefix.length&&h!==this.re2.prefixRune&&e.canCheckPrefix()){const t=e.index(this.re2,i);if(t<0)break;i+=t,c=e.step(i),u=c>>3,l=7&c,c=e.step(i+l),h=c>>3,C=7&c,s=e.context(i)}}if(0===i&&this.prog.numLb>0)for(let e=0;e<this.prog.lbStarts.length;e++)this.add(o,this.prog.lbStarts[e],i,this.matchcap,0,s);this.matched||0!==i&&n!==Ys.UNANCHORED||i>=a&&(this.ncap>0&&(this.matchcap[0]=i),this.add(o,this.prog.start,i,this.matchcap,0,s));const t=i+l;if(s=e.context(t),this.step(o,B,i,t,u,s,n,i===e.endPos()),0===l)break;if(0===this.ncap&&this.matched)break;i+=l,u=h,l=C,-1!==u&&(c=e.step(i+l),h=c>>3,C=7&c);const d=o;o=B,B=d}return B.clear(),this.matched}matchSet(e,t,n){const r=this.re2.cond;if(r===gi.EMPTY_ALL)return[];if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==t)return[];let s=this.prog.numLb>0?0:t,i=t,a=this.q0,o=this.q1,B=e.step(s),c=B>>3,u=7&B,l=-1,h=0;B!==vi.EOF()&&(B=e.step(s+u),l=B>>3,h=7&B);let C=0===s?gi.emptyOpContext(-1,c):e.context(s);const d=new Set;for(;;){if(a.isEmpty()){if(0!==(r&gi.EMPTY_BEGIN_TEXT)&&0!==s)break;if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==s)break}if(0===s&&this.prog.numLb>0)for(let e=0;e<this.prog.lbStarts.length;e++)this.add(a,this.prog.lbStarts[e],s,this.matchcap,0,C);0!==s&&n!==Ys.UNANCHORED||s>=i&&this.add(a,this.prog.start,s,this.matchcap,0,C);const t=s+u;C=e.context(t);for(let r=0;r<a.size;r++){const i=a.densePcs[r],B=this.prog.inst[i],u=r*this.ncap;let l=!1;switch(B.op){case Ri.MATCH:if(n===Ys.ANCHOR_BOTH&&s!==e.endPos())break;d.add(B.arg);break;case Ri.RUNE:l=B.matchRune(c);break;case Ri.RUNE1:l=c===B.runes[0];break;case Ri.RUNE_ANY:l=!0;break;case Ri.RUNE_ANY_NOT_NL:l=10!==c;break;default:continue}l&&this.add(o,B.out,t,a.denseCaps,u,C)}if(a.clear(),0===u)break;s+=u,c=l,u=h,-1!==c&&(B=e.step(s+u),l=B>>3,h=7&B);const p=a;a=o,o=p}return o.clear(),Array.from(d).sort((e,t)=>e-t)}step(e,t,n,r,s,i,a,o){const B=this.re2.longest;for(let c=0;c<e.size;c++){const u=e.densePcs[c],l=c*this.ncap;if(B&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[l])continue;const h=this.prog.inst[u];let C=!1;switch(h.op){case Ri.MATCH:if(a===Ys.ANCHOR_BOTH&&!o)break;if(this.ncap>0&&(!B||!this.matched||this.matchcap[1]<n)){e.denseCaps[l+1]=n;for(let t=0;t<this.ncap;t++)this.matchcap[t]=e.denseCaps[l+t]}B||(e.size=0),this.matched=!0;break;case Ri.RUNE:C=h.matchRune(s);break;case Ri.RUNE1:C=s===h.runes[0];break;case Ri.RUNE_ANY:C=!0;break;case Ri.RUNE_ANY_NOT_NL:C=10!==s;break;default:continue}C&&this.add(t,h.out,r,e.denseCaps,l,i)}e.clear()}add(e,t,n,r,s,i){for(;;){if(0===t)return;if(e.contains(t))return;const a=e.add(t),o=this.prog.inst[t];switch(o.op){case Ri.FAIL:return;case Ri.ALT:case Ri.ALT_MATCH:this.add(e,o.out,n,r,s,i),t=o.arg;continue;case Ri.EMPTY_WIDTH:if(0===(o.arg&~i)){t=o.out;continue}return;case Ri.NOP:t=o.out;continue;case Ri.CAPTURE:if(o.arg<this.ncap){const t=r[s+o.arg];return r[s+o.arg]=n,this.add(e,o.out,n,r,s,i),void(r[s+o.arg]=t)}t=o.out;continue;case Ri.LB_WRITE:this.lbTable[Math.abs(o.arg)]=n,t=o.out;continue;case Ri.LB_CHECK:if(o.arg>0){if(this.lbTable[o.arg]===n){t=o.out;continue}}else if(this.lbTable[-o.arg]!==n){t=o.out;continue}return;case Ri.MATCH:case Ri.RUNE:case Ri.RUNE1:case Ri.RUNE_ANY:case Ri.RUNE_ANY_NOT_NL:if(this.ncap>0){const t=a*this.ncap;for(let n=0;n<this.ncap;n++)e.denseCaps[t+n]=r[s+n]}return;default:throw new Fi("unhandled")}}}};const xi=e=>{let t=-2128831035;for(let n=0;n<e.length;n++)t^=e[n],t=Math.imul(t,16777619);return t},Mi=(e,t)=>{if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0};var Gi=class{constructor(e,t,n=[]){this.nfaStates=e,this.isMatch=t,this.matchIDs=n,this.nextLatin1=new Array(Ci.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(Ci.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},Hi=(d(B=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/B.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let r=!1;const s=[];for(;n.length>0;){const e=n.pop();if(t.has(e))continue;t.add(e);const i=this.prog.getInst(e);switch(i.op){case Ri.MATCH:r=!0,s.includes(i.arg)||s.push(i.arg);break;case Ri.ALT:case Ri.ALT_MATCH:n.push(i.out),n.push(i.arg);break;case Ri.NOP:case Ri.CAPTURE:n.push(i.out);break;case Ri.EMPTY_WIDTH:case Ri.LB_WRITE:case Ri.LB_CHECK:return null}}const i=Int32Array.from(t).sort();return s.sort((e,t)=>e-t),{pcs:i,isMatch:r,matchIDs:s}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,r=xi(n);let s=this.stateCache.get(r);if(s)for(let a=0;a<s.length;a++){const e=s[a];if(Mi(e.nfaStates,n))return e.lastSeen=++this.clock,e}else s=[],this.stateCache.set(r,s);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=B.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),s=this.stateCache.get(r),s||(s=[],this.stateCache.set(r,s))}const i=new Gi(n,t.isMatch,t.matchIDs);return i.lastSeen=++this.clock,s.push(i),this.stateCount++,i}evictCache(){const e=[];for(const i of this.stateCache.values())for(let t=0;t<i.length;t++)e.push(i[t]);e.sort((e,t)=>e.lastSeen-t.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,r=e.slice(n),s=new Set(r);this.stateCache.clear(),this.stateCount=0;for(let i=0;i<r.length;i++){const e=r[i];e.nextLatin1.fill(null),e.nextLatin1Anchored.fill(null),e.transKeys.length=0,e.transVals.length=0;const t=xi(e.nfaStates);let n=this.stateCache.get(t);n||(n=[],this.stateCache.set(t,n)),n.push(e),this.stateCount++}this.startState&&!s.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=Ci.MAX_LATIN1)if(n===Ys.UNANCHORED){const n=e.nextLatin1[t];if(null!==n)return n}else{const n=e.nextLatin1Anchored[t];if(null!==n)return n}else{const r=t+(n===Ys.UNANCHORED?0:Ci.MAX_RUNE+1),s=e.transKeys,i=s.length;for(let t=0;t<i;t++)if(s[t]===r)return e.transVals[t]}const r=[];for(let i=0;i<e.nfaStates.length;i++){const n=e.nfaStates[i],s=this.prog.getInst(n);Ri.isRuneOp(s.op)&&s.matchRune(t)&&r.push(s.out)}n===Ys.UNANCHORED&&r.push(this.prog.start);const s=this.getState(r);if(t<=Ci.MAX_LATIN1)n===Ys.UNANCHORED?e.nextLatin1[t]=s:e.nextLatin1Anchored[t]=s;else{const r=t+(n===Ys.UNANCHORED?0:Ci.MAX_RUNE+1);e.transKeys.push(r),e.transVals.push(s)}return s}match(e,t,n){if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==t)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let r=e.endPos(),s=this.startState;if(s.isMatch){if(n!==Ys.ANCHOR_BOTH)return!0;if(t===r)return!0}let i=t;for(;i<r;){const t=e.step(i),a=t>>3,o=7&t;if(0===o)break;if(s=n===Ys.UNANCHORED&&a<=Ci.MAX_LATIN1&&s.nextLatin1[a]||this.step(s,a,n),null===s)return null;if(s.lastSeen=++this.clock,s.isMatch){if(n!==Ys.ANCHOR_BOTH)return!0;if(i+o===r)return!0}if(0===s.nfaStates.length&&n!==Ys.UNANCHORED)return!1;i+=o}return!1}matchSet(e,t,n){if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==t)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let r=e.endPos(),s=this.startState;const i=new Set,a=(e,t)=>{e.isMatch&&(n===Ys.ANCHOR_BOTH?t===r&&e.matchIDs.forEach(e=>i.add(e)):e.matchIDs.forEach(e=>i.add(e)))};a(s,t);let o=t;for(;o<r;){const t=e.step(o),r=t>>3,i=7&t;if(0===i)break;if(s=n===Ys.UNANCHORED&&r<=Ci.MAX_LATIN1&&s.nextLatin1[r]||this.step(s,r,n),null===s)return null;if(s.lastSeen=++this.clock,o+=i,a(s,o),0===s.nfaStates.length&&n!==Ys.UNANCHORED)break}return Array.from(i).sort((e,t)=>e-t)}},"MAX_CACHE_CLEARS",5),d(B,"STATE_MEMORY_ESTIMATE",838),B);var Ui=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(256),this.jobArg=new Uint8Array(256),this.jobPos=new Int32Array(256),this.jobLen=0,this.visited=new Uint32Array(0)}reset(e,t,n){this.end=t,this.jobLen=0,this.ncap=n;const r=e.numInst()*(t+1)+32-1>>>5;this.visited.length<r?this.visited=new Uint32Array(r):this.visited.fill(0,0,r),this.cap.length<n?this.cap=new Int32Array(n).fill(-1):this.cap.fill(-1,0,n),this.matchcap.length<n?this.matchcap=new Int32Array(n).fill(-1):this.matchcap.fill(-1,0,n)}shouldVisit(e,t){const n=e*(this.end+1)+t,r=n>>>5,s=1<<(31&n);return 0===(this.visited[r]&s)&&(this.visited[r]|=s,!0)}push(e,t,n,r){if(e.prog.getInst(t).op!==Ri.FAIL&&(r||this.shouldVisit(t,n))){if(this.jobLen>=this.jobPc.length){const e=2*this.jobPc.length,t=new Int32Array(e);t.set(this.jobPc),this.jobPc=t;const n=new Uint8Array(e);n.set(this.jobArg),this.jobArg=n;const r=new Int32Array(e);r.set(this.jobPos),this.jobPos=r}this.jobPc[this.jobLen]=t,this.jobArg[this.jobLen]=r?1:0,this.jobPos[this.jobLen]=n,this.jobLen++}}tryBacktrack(e,t,n,r,s){const i=e.longest;for(this.push(e,n,r,!1);this.jobLen>0;){this.jobLen--;let n=this.jobPc[this.jobLen],r=1===this.jobArg[this.jobLen],a=this.jobPos[this.jobLen],o=!0;for(;o||this.shouldVisit(n,a);){o=!1;const B=e.prog.getInst(n);switch(B.op){case Ri.FAIL:throw new Fi("unexpected InstFail");case Ri.ALT:if(r){r=!1,n=B.arg;continue}this.push(e,n,a,!0),n=B.out;continue;case Ri.ALT_MATCH:{const t=e.prog.getInst(B.out);if(Ri.isRuneOp(t.op)){this.push(e,B.arg,a,!1),n=B.arg,a=this.end;continue}this.push(e,B.out,this.end,!1),n=B.out;continue}case Ri.RUNE:{const e=t.step(a);if(e===vi.EOF())break;if(!B.matchRune(e>>3))break;a+=7&e,n=B.out;continue}case Ri.RUNE1:{const e=t.step(a);if(e===vi.EOF())break;if(e>>3!==B.runes[0])break;a+=7&e,n=B.out;continue}case Ri.RUNE_ANY_NOT_NL:{const e=t.step(a);if(e===vi.EOF())break;if(e>>3==10)break;a+=7&e,n=B.out;continue}case Ri.RUNE_ANY:{const e=t.step(a);if(e===vi.EOF())break;a+=7&e,n=B.out;continue}case Ri.CAPTURE:if(r){this.cap[B.arg]=a;break}B.arg<this.ncap&&(this.push(e,n,this.cap[B.arg],!0),this.cap[B.arg]=a),n=B.out;continue;case Ri.EMPTY_WIDTH:{const e=t.context(a);if(0!==(B.arg&~e))break;n=B.out;continue}case Ri.NOP:n=B.out;continue;case Ri.MATCH:{if(s===Ys.ANCHOR_BOTH&&a!==this.end)break;if(0===this.ncap)return!0;this.ncap>1&&(this.cap[1]=a);const e=this.matchcap[1];if((-1===e||i&&a>0&&a>e)&&this.matchcap.set(this.cap),!i)return!0;if(a===this.end)return!0;break}case Ri.LB_WRITE:case Ri.LB_CHECK:throw new Fi("Backtracker cannot evaluate Lookbehind instructions");default:throw new Fi("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const Vi=[];var Ji=class e{static shouldBacktrack(e){return e.numInst()<=500}static maxBitStateLen(t){return e.shouldBacktrack(t)?Math.floor(262144/t.numInst()):0}static execute(e,t,n,r,s){const i=e.cond;if(i===gi.EMPTY_ALL)return null;if((r===Ys.ANCHOR_START||r===Ys.ANCHOR_BOTH)&&0!==n)return null;if(0!==(i&gi.EMPTY_BEGIN_TEXT)&&0!==n)return null;const a=Vi.length>0?Vi.pop():new Ui,o=t.endPos();a.reset(e.prog,o,s);let B=!1;if(0!==(i&gi.EMPTY_BEGIN_TEXT)||r===Ys.ANCHOR_START||r===Ys.ANCHOR_BOTH)a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,r)&&(B=!0);else{let s=-1;for(;n<=o&&0!==s;n+=s){if(e.prefix.length>0){const r=t.index(e,n);if(r<0)break;n+=r}if(a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,r)){B=!0;break}const i=t.step(n);s=i===vi.EOF()?0:7&i}}if(!B)return Vi.push(a),null;const c=0===s?[]:gi.toArray(a.matchcap.subarray(0,s));return Vi.push(a),c}},ji=class{constructor(e){this.sparse=new Uint32Array(e),this.dense=new Uint32Array(e),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(e){return e<this.sparse.length&&this.sparse[e]<this.size&&this.dense[this.sparse[e]]===e}insert(e){this.contains(e)||this.insertNew(e)}insertNew(e){e>=this.sparse.length||(this.sparse[e]=this.size,this.dense[this.size]=e,this.size++)}};var Ki=class{constructor(e){this.start=e.start,this.numCap=e.numCap,this.inst=new Array(e.inst.length);for(let t=0;t<e.inst.length;t++){const n=e.inst[t],r=new Ri(n.op);r.out=n.out,r.arg=n.arg,r.runes=n.runes?n.runes.slice():[],r.next=null,this.inst[t]=r}}};var qi=class e{static compile(e){if(0===e.start)return null;if(e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==Ri.EMPTY_WIDTH||0===(t.arg&gi.EMPTY_BEGIN_TEXT))return null;let n=!1;for(let s=0;s<e.inst.length;s++)if(e.inst[s].op===Ri.ALT||e.inst[s].op===Ri.ALT_MATCH){n=!0;break}for(let s=0;s<e.inst.length;s++){const t=e.inst[s],r=e.inst[t.out].op;switch(t.op){case Ri.ALT:case Ri.ALT_MATCH:if(r===Ri.MATCH||e.inst[t.arg].op===Ri.MATCH)return null;break;case Ri.EMPTY_WIDTH:if(r===Ri.MATCH){if((t.arg&gi.EMPTY_END_TEXT)===gi.EMPTY_END_TEXT)continue;return null}break;default:if(r===Ri.MATCH&&n)return null}}let r=(e=>{const t=new Ki(e);for(let n=0;n<t.inst.length;n++){const e=t.inst[n];if(e.op!==Ri.ALT&&e.op!==Ri.ALT_MATCH)continue;let r="out",s="arg",i=t.inst[e[s]];if(i.op!==Ri.ALT&&i.op!==Ri.ALT_MATCH&&(r="arg",s="out",i=t.inst[e[s]],i.op!==Ri.ALT&&i.op!==Ri.ALT_MATCH))continue;const a=t.inst[e[r]];if(a.op===Ri.ALT||a.op===Ri.ALT_MATCH)continue;let o="out",B="arg",c=!1;i.out===n?c=!0:i.arg===n&&(c=!0,o="arg",B="out"),c&&(i[o]=e[r]),e[r]===i[o]&&(e[s]=i[B])}return t})(e);return r=(e=>{if(e.inst.length>=1e3)return null;const t=new ji(e.inst.length),n=new ji(e.inst.length),r=new Array(e.inst.length),s=new Array(e.inst.length).fill(!1),i=a=>{let o=!0;const B=e.inst[a];if(n.contains(a))return!0;switch(n.insert(a),B.op){case Ri.ALT:case Ri.ALT_MATCH:{o=i(B.out)&&i(B.arg);let e=s[B.out],t=s[B.arg];if(e&&t)return!1;if(t){const n=B.out;B.out=B.arg,B.arg=n;const r=e;e=t,t=r}e&&(s[a]=!0,B.op=Ri.ALT_MATCH);const n=((e,t,n,r)=>{const s=e.length,i=t.length;let a=0,o=0;const B=[],c=[];let u=!0,l=-1;const h=s=>{const i=s?e:t,u=s?a:o,h=s?n:r;return!(l>0&&i[u]<=B[l]||(B.push(i[u],i[u+1]),s?a+=2:o+=2,l+=2,c.push(h),0))};for(;a<s||o<i;)if(u=o>=i?h(!0):a>=s||t[o]<e[a]?h(!1):h(!0),!u)return null;return{merged:B,next:c}})(r[B.out]||[],r[B.arg]||[],B.out,B.arg);if(!n)return!1;r[a]=n.merged,B.next=new Uint32Array(n.next);break}case Ri.CAPTURE:case Ri.EMPTY_WIDTH:case Ri.NOP:o=i(B.out),s[a]=s[B.out],r[a]=r[B.out]?r[B.out].slice():[],B.next=new Uint32Array(Math.floor(r[a].length/2)+1).fill(B.out);break;case Ri.MATCH:case Ri.FAIL:s[a]=B.op===Ri.MATCH;break;case Ri.RUNE:{if(s[a]=!1,B.next&&B.next.length>0)break;if(t.insert(B.out),!B.runes||0===B.runes.length){r[a]=[],B.next=new Uint32Array([B.out]);break}let e=[];if(1===B.runes.length&&0!==(B.arg&Ys.FOLD_CASE)){const t=B.runes[0];e.push(t,t);for(let n=Ci.simpleFold(t);n!==t;n=Ci.simpleFold(n))e.push(n,n);e.sort((e,t)=>e-t)}else for(let t=0;t<B.runes.length;t++)e.push(B.runes[t]);r[a]=e,B.next=new Uint32Array(Math.floor(e.length/2)+1).fill(B.out),B.op=Ri.RUNE;break}case Ri.RUNE1:{if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out);let e=[];if(0!==(B.arg&Ys.FOLD_CASE)){const t=B.runes[0];e.push(t,t);for(let n=Ci.simpleFold(t);n!==t;n=Ci.simpleFold(n))e.push(n,n);e.sort((e,t)=>e-t)}else e.push(B.runes[0],B.runes[0]);r[a]=e,B.next=new Uint32Array(Math.floor(e.length/2)+1).fill(B.out),B.op=Ri.RUNE;break}case Ri.RUNE_ANY:if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out),r[a]=[0,Ci.MAX_RUNE],B.next=new Uint32Array([B.out]);break;case Ri.RUNE_ANY_NOT_NL:if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out),r[a]=[0,9,11,Ci.MAX_RUNE],B.next=new Uint32Array(Math.floor(r[a].length/2)+1).fill(B.out)}return o};for(t.clear(),t.insert(e.start);!t.empty();)if(n.clear(),!i(t.next()))return null;for(let a=0;a<e.inst.length;a++)r[a]&&(e.inst[a].runes=r[a]);return e})(r),null!==r&&((e,t)=>{for(let n=0;n<t.inst.length;n++){const r=t.inst[n];switch(r.op){case Ri.ALT:case Ri.ALT_MATCH:case Ri.RUNE:break;case Ri.CAPTURE:case Ri.EMPTY_WIDTH:case Ri.NOP:case Ri.MATCH:case Ri.FAIL:e.inst[n].next=null;break;case Ri.RUNE1:case Ri.RUNE_ANY:case Ri.RUNE_ANY_NOT_NL:e.inst[n].next=null,e.inst[n].op=r.op,e.inst[n].runes=r.runes?r.runes.slice():[]}}})(r,e),r}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===Ri.ALT_MATCH?e.out:0}static execute(t,n,r,s,i){const a=t.onepass;if(!a)return null;const o=new Int32Array(i).fill(-1);let B=!1,c=n.step(r),u=c>>3,l=7&c,h=vi.EOF(),C=-1,d=0;c!==vi.EOF()&&(h=n.step(r+l),h!==vi.EOF()&&(C=h>>3,d=7&h));let p,f=0===r?gi.emptyOpContext(-1,u):n.context(r),g=a.start;for(;;){switch(p=a.inst[g],g=p.out,p.op){case Ri.MATCH:return s===Ys.ANCHOR_BOTH&&r!==n.endPos()?null:(B=!0,o.length>0&&(o[0]=0,o[1]=r),0===i?[]:gi.toArray(o));case Ri.RUNE:if(!p.matchRune(u))return null;break;case Ri.RUNE1:if(u!==p.runes[0])return null;break;case Ri.RUNE_ANY:break;case Ri.RUNE_ANY_NOT_NL:if(10===u)return null;break;case Ri.ALT:case Ri.ALT_MATCH:g=e.next(p,u);continue;case Ri.FAIL:return null;case Ri.NOP:continue;case Ri.EMPTY_WIDTH:if(0!==(p.arg&~f))return null;continue;case Ri.CAPTURE:p.arg<o.length&&(o[p.arg]=r);continue;default:throw new Fi("bad inst")}if(0===l)break;f=gi.emptyOpContext(u,C),r+=l,u=C,l=d,-1!==u&&(h=n.step(r+l),h!==vi.EOF()?(C=h>>3,d=7&h):(C=-1,d=0))}return B?0===i?[]:gi.toArray(o):null}},zi=(d(c=class{static isPseudoOp(e){return e>=c.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===ai.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new c(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=c.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=c.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case c.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case c.Op.EMPTY_MATCH:e+="(?:)";break;case c.Op.STAR:case c.Op.PLUS:case c.Op.QUEST:case c.Op.REPEAT:{const t=this.subs[0];switch(t.op>c.Op.CAPTURE||t.op===c.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case c.Op.STAR:e+="*";break;case c.Op.PLUS:e+="+";break;case c.Op.QUEST:e+="?";break;case c.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}"}0!==(this.flags&Ys.NON_GREEDY)&&(e+="?");break}case c.Op.CONCAT:for(let t of this.subs)t.op===c.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case c.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case c.Op.LITERAL:0!==(this.flags&Ys.FOLD_CASE)&&(e+="(?i:");for(let t of this.runes)e+=gi.escapeRune(t);0!==(this.flags&Ys.FOLD_CASE)&&(e+=")");break;case c.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case c.Op.ANY_CHAR:e+="(?s:.)";break;case c.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case c.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case c.Op.CAPTURE:null===this.name||0===this.name.length?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==c.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case c.Op.BEGIN_TEXT:e+="\\A";break;case c.Op.END_TEXT:0!==(this.flags&Ys.WAS_DOLLAR)?e+="(?-m:$)":e+="\\z";break;case c.Op.BEGIN_LINE:e+="^";break;case c.Op.END_LINE:e+="$";break;case c.Op.WORD_BOUNDARY:e+="\\b";break;case c.Op.NO_WORD_BOUNDARY:e+="\\B";break;case c.Op.CHAR_CLASS:if(this.runes.length%2!=0){e+="[invalid char class]";break}if(e+="[",0===this.runes.length)e+="^\\x00-\\x{10FFFF}";else if(0===this.runes[0]&&this.runes[this.runes.length-1]===Ci.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,r=this.runes[t+1]-1;e+=c.quoteIfHyphen(n),e+=gi.escapeRune(n),n!==r&&(e+="-",e+=c.quoteIfHyphen(r),e+=gi.escapeRune(r))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],r=this.runes[t+1];e+=c.quoteIfHyphen(n),e+=gi.escapeRune(n),n!==r&&(e+="-",e+=c.quoteIfHyphen(r),e+=gi.escapeRune(r))}e+="]";break;default:e+=this.op}return e}maxCap(){let e=0;if(this.op===c.Op.CAPTURE&&(e=this.cap),null!==this.subs)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(null!==e&&e instanceof c))return!1;if(this.op!==e.op)return!1;switch(this.op){case c.Op.END_TEXT:if((this.flags&Ys.WAS_DOLLAR)!==(e.flags&Ys.WAS_DOLLAR))return!1;break;case c.Op.LITERAL:case c.Op.CHAR_CLASS:if(null===this.runes&&null===e.runes)break;if(null===this.runes||null===e.runes)return!1;if(this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case c.Op.ALTERNATE:case c.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case c.Op.STAR:case c.Op.PLUS:case c.Op.QUEST:if((this.flags&Ys.NON_GREEDY)!==(e.flags&Ys.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.REPEAT:if((this.flags&Ys.NON_GREEDY)!==(e.flags&Ys.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.CAPTURE:if(this.cap!==e.cap||(null===this.name?null!==e.name:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.PLB:case c.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1}return!0}},"Op",mi(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),c),Qi=class{constructor(e){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const n of e){let e=0;for(let t=0;t<n.length;t++){const r=n[t];r in this.next[e]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[e][r]=this.next.length-1),e=this.next[e][r]}this.match[e]=!0}const t=[];for(const n in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],n)){const e=this.next[0][n];this.fail[e]=0,t.push(e)}for(;t.length>0;){const e=t.shift();for(const n in this.next[e])if(Object.prototype.hasOwnProperty.call(this.next[e],n)){const r=this.next[e][n];let s=this.fail[e];for(;0!==s&&!(n in this.next[s]);)s=this.fail[s];n in this.next[s]?this.fail[r]=this.next[s][n]:this.fail[r]=0,this.match[r]=this.match[r]||this.match[this.fail[r]],t.push(r)}}}searchUTF16(e,t,n){let r=0;for(let s=t;s<n;s++){const t=e.charCodeAt(s);for(;0!==r&&!(t in this.next[r]);)r=this.fail[r];if(t in this.next[r]&&(r=this.next[r][t]),this.match[r])return!0}return!1}searchUTF8(e,t,n){let r=0;for(let s=t;s<n;s++){const t=e[s];for(;0!==r&&!(t in this.next[r]);)r=this.fail[r];if(t in this.next[r]&&(r=this.next[r][t]),this.match[r])return!0}return!1}},Yi=(d(u=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case u.Type.NONE:return!0;case u.Type.EXACT:return e.hasString(this,t);case u.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case u.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},"Type",{NONE:0,EXACT:1,AND:2,OR:3}),u),Wi=class e{static build(t){const n=e.fromRegexp(t);return e.simplify(n)}static fromRegexp(t){if(!t)return new Yi(Yi.Type.NONE);switch(t.op){case zi.Op.PLB:case zi.Op.NLB:case zi.Op.NO_MATCH:case zi.Op.EMPTY_MATCH:case zi.Op.BEGIN_LINE:case zi.Op.END_LINE:case zi.Op.BEGIN_TEXT:case zi.Op.END_TEXT:case zi.Op.WORD_BOUNDARY:case zi.Op.NO_WORD_BOUNDARY:case zi.Op.CHAR_CLASS:case zi.Op.ANY_CHAR_NOT_NL:case zi.Op.ANY_CHAR:return new Yi(Yi.Type.NONE);case zi.Op.LITERAL:{if(0===t.runes.length||0!==(t.flags&Ys.FOLD_CASE))return new Yi(Yi.Type.NONE);const e=new Yi(Yi.Type.EXACT);let n="";for(let r=0;r<t.runes.length;r++)n+=String.fromCodePoint(t.runes[r]);return e.str=n,e.bytes=gi.stringToUtf8ByteArray(e.str),e}case zi.Op.CAPTURE:case zi.Op.PLUS:return e.fromRegexp(t.subs[0]);case zi.Op.REPEAT:return t.min>=1?e.fromRegexp(t.subs[0]):new Yi(Yi.Type.NONE);case zi.Op.CONCAT:{const n=new Yi(Yi.Type.AND);for(const r of t.subs)n.subs.push(e.fromRegexp(r));return n}case zi.Op.ALTERNATE:{const n=new Yi(Yi.Type.OR);for(const r of t.subs)n.subs.push(e.fromRegexp(r));return n}default:return new Yi(Yi.Type.NONE)}}static simplify(t){if(t.type===Yi.Type.EXACT||t.type===Yi.Type.NONE)return t;if(t.type===Yi.Type.AND){const n=[];for(const r of t.subs){const t=e.simplify(r);if(t.type!==Yi.Type.NONE)if(t.type===Yi.Type.AND)for(let e=0;e<t.subs.length;e++)n.push(t.subs[e]);else n.push(t)}return 0===n.length?new Yi(Yi.Type.NONE):1===n.length?n[0]:(t.subs=n,t)}if(t.type===Yi.Type.OR){const n=[];for(const a of t.subs){const t=e.simplify(a);if(t.type===Yi.Type.NONE)return new Yi(Yi.Type.NONE);if(t.type===Yi.Type.OR)for(let e=0;e<t.subs.length;e++)n.push(t.subs[e]);else n.push(t)}if(0===n.length)return new Yi(Yi.Type.NONE);if(1===n.length)return n[0];const r=new Set,s=[];for(const e of n)e.type===Yi.Type.EXACT?r.has(e.str)||(r.add(e.str),s.push(e)):s.push(e);t.subs=s;let i=!0;for(const e of s)if(e.type!==Yi.Type.EXACT){i=!1;break}return i&&s.length>1&&(t.ac16=new Qi(s.map(e=>{const t=[];for(let n=0;n<e.str.length;n++)t.push(e.str.charCodeAt(n));return t})),t.ac8=new Qi(s.map(e=>e.bytes))),t}return t}},$i=class{constructor(e=0,t=0){this.head=e,this.tail=t}},Xi=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(e){return this.inst[e]}numInst(){return this.inst.length}addInst(e){this.inst.push(new Ri(e))}skipNop(e){let t=this.inst[e];for(;t.op===Ri.NOP||t.op===Ri.CAPTURE;)t=this.inst[e],e=t.out;return t}prefix(){let e="",t=this.skipNop(this.start);if(!Ri.isRuneOp(t.op)||1!==t.runes.length)return[t.op===Ri.MATCH,e];for(;Ri.isRuneOp(t.op)&&1===t.runes.length&&0===(t.arg&Ys.FOLD_CASE);)e+=String.fromCodePoint(t.runes[0]),t=this.skipNop(t.out);return[t.op===Ri.MATCH,e]}startCond(){let e=0,t=this.start;e:for(;;){const n=this.inst[t];switch(n.op){case Ri.EMPTY_WIDTH:e|=n.arg;break;case Ri.FAIL:return-1;case Ri.CAPTURE:case Ri.NOP:break;default:break e}t=n.out}return e}patch(e,t){let n=e.head;for(;0!==n;){const e=this.inst[n>>1];1&n?(n=e.arg,e.arg=t):(n=e.out,e.out=t)}}append(e,t){if(0===e.head)return t;if(0===t.head)return e;const n=this.inst[e.tail>>1];return 1&e.tail?n.arg=t.head:n.out=t.head,new $i(e.head,t.tail)}toString(){let e="";for(let t=0;t<this.inst.length;t++){const n=e.length;e+=t,t===this.start&&(e+="*"),e+="        ".substring(e.length-n),e+=this.inst[t],e+="\n"}return e}},Zi=class{constructor(e=0,t=new $i,n=!1){this.i=e,this.out=t,this.nullable=n}},ea=class e{static ANY_RUNE_NOT_NL(){return[0,ai.CODES.get("\n")-1,ai.CODES.get("\n")+1,Ci.MAX_RUNE]}static ANY_RUNE(){return[0,Ci.MAX_RUNE]}static compileRegexp(t){const n=new e,r=n.compile(t);return n.prog.patch(r.out,n.newInst(Ri.MATCH).i),n.prog.start=r.i,n.prog}static compileSet(t){const n=new e;if(0===t.length)return n.prog.start=n.newInst(Ri.FAIL).i,n.prog;let r=[];for(let e=0;e<t.length;e++){const s=n.compile(t[e]),i=n.newInst(Ri.MATCH);n.prog.getInst(i.i).arg=e,n.prog.patch(s.out,i.i),r.push(s.i)}let s=r[0];for(let e=1;e<r.length;e++){const t=n.newInst(Ri.ALT),i=n.prog.getInst(t.i);i.out=s,i.arg=r[e],s=t.i}return n.prog.start=s,n.prog}constructor(){this.prog=new Xi,this.newInst(Ri.FAIL)}newInst(e){return this.prog.addInst(e),new Zi(this.prog.numInst()-1,new $i,!0)}nop(){const e=this.newInst(Ri.NOP);return e.out=new $i(e.i<<1,e.i<<1),e}fail(){return new Zi}cap(e){const t=this.newInst(Ri.CAPTURE);return t.out=new $i(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return 0===e.i||0===t.i?this.fail():(this.prog.patch(e.out,t.i),new Zi(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(0===e.i)return t;if(0===t.i)return e;const n=this.newInst(Ri.ALT),r=this.prog.getInst(n.i);return r.out=e.i,r.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(Ri.ALT),r=this.prog.getInst(n.i);return t?(r.arg=e.i,n.out=new $i(n.i<<1,n.i<<1)):(r.out=e.i,n.out=new $i(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(Ri.ALT),r=this.prog.getInst(n.i);return t?(r.arg=e.i,n.out=new $i(n.i<<1,n.i<<1)):(r.out=e.i,n.out=new $i(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new Zi(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(Ri.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new $i(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(Ri.RUNE);n.nullable=!1;const r=this.prog.getInst(n.i);return r.runes=e,t&=Ys.FOLD_CASE,1===e.length&&Ci.simpleFold(e[0])!==e[0]||(t&=-2),r.arg=t,n.out=new $i(n.i<<1,n.i<<1),0===(t&Ys.FOLD_CASE)&&1===e.length||2===e.length&&e[0]===e[1]?r.op=Ri.RUNE1:2===e.length&&0===e[0]&&e[1]===Ci.MAX_RUNE?r.op=Ri.RUNE_ANY:4===e.length&&0===e[0]&&e[1]===ai.CODES.get("\n")-1&&e[2]===ai.CODES.get("\n")+1&&e[3]===Ci.MAX_RUNE&&(r.op=Ri.RUNE_ANY_NOT_NL),n}lookBehind(t,n){const r=this.newInst(Ri.LB_WRITE);this.prog.getInst(r.i).arg=n;const s=this.rune(e.ANY_RUNE(),0),i=this.star(s,!0),a=this.cat(i,t);this.prog.patch(a.out,r.i);const o=this.newInst(Ri.LB_CHECK);return this.prog.getInst(o.i).arg=n,this.prog.lbStarts.push(a.i),Math.abs(n)>this.prog.numLb&&(this.prog.numLb=Math.abs(n)),o.out=new $i(o.i<<1,o.i<<1),o}compile(t){switch(t.op){case zi.Op.NO_MATCH:return this.fail();case zi.Op.EMPTY_MATCH:return this.nop();case zi.Op.LITERAL:if(0===t.runes.length)return this.nop();{let e=null;for(let n of t.runes){const r=this.rune([n],t.flags);e=null===e?r:this.cat(e,r)}return e}case zi.Op.CHAR_CLASS:return this.rune(t.runes,t.flags);case zi.Op.ANY_CHAR_NOT_NL:return this.rune(e.ANY_RUNE_NOT_NL(),0);case zi.Op.ANY_CHAR:return this.rune(e.ANY_RUNE(),0);case zi.Op.BEGIN_LINE:return this.empty(gi.EMPTY_BEGIN_LINE);case zi.Op.END_LINE:return this.empty(gi.EMPTY_END_LINE);case zi.Op.BEGIN_TEXT:return this.empty(gi.EMPTY_BEGIN_TEXT);case zi.Op.END_TEXT:return this.empty(gi.EMPTY_END_TEXT);case zi.Op.WORD_BOUNDARY:return this.empty(gi.EMPTY_WORD_BOUNDARY);case zi.Op.NO_WORD_BOUNDARY:return this.empty(gi.EMPTY_NO_WORD_BOUNDARY);case zi.Op.PLB:case zi.Op.NLB:return this.lookBehind(this.compile(t.subs[0]),t.lb);case zi.Op.CAPTURE:{const e=this.cap(t.cap<<1),n=this.compile(t.subs[0]),r=this.cap(t.cap<<1|1);return this.cat(this.cat(e,n),r)}case zi.Op.STAR:return this.star(this.compile(t.subs[0]),0!==(t.flags&Ys.NON_GREEDY));case zi.Op.PLUS:return this.plus(this.compile(t.subs[0]),0!==(t.flags&Ys.NON_GREEDY));case zi.Op.QUEST:return this.quest(this.compile(t.subs[0]),0!==(t.flags&Ys.NON_GREEDY));case zi.Op.CONCAT:if(0===t.subs.length)return this.nop();{let e=null;for(let n of t.subs){const t=this.compile(n);e=null===e?t:this.cat(e,t)}return e}case zi.Op.ALTERNATE:if(0===t.subs.length)return this.nop();{let e=null;for(let n of t.subs){const t=this.compile(n);e=null===e?t:this.alt(e,t)}return e}default:throw new Oi("regexp: unhandled case in compile")}}},ta=class e{static simplify(t){if(null===t)return null;switch(t.op){case zi.Op.PLB:case zi.Op.NLB:case zi.Op.CAPTURE:{const n=e.simplify(t.subs[0]);if(n!==t.subs[0]){const e=zi.fromRegexp(t);return e.runes=[],e.subs=[n],e}return t}case zi.Op.CONCAT:case zi.Op.ALTERNATE:{const n=[];let r=!1;for(let s=0;s<t.subs.length;s++){const i=t.subs[s],a=e.simplify(i);if(a!==i&&(r=!0),t.op===zi.Op.CONCAT){if(a.op===zi.Op.NO_MATCH)return new zi(zi.Op.NO_MATCH);if(a.op===zi.Op.EMPTY_MATCH){r=!0;continue}if(a.op===zi.Op.CONCAT){r=!0;for(let e=0;e<a.subs.length;e++)n.push(a.subs[e]);continue}}else if(t.op===zi.Op.ALTERNATE){if(a.op===zi.Op.NO_MATCH){r=!0;continue}if(a.op===zi.Op.ALTERNATE){r=!0;for(let e=0;e<a.subs.length;e++)n.push(a.subs[e]);continue}}n.push(a)}if(r){if(0===n.length)return new zi(t.op===zi.Op.CONCAT?zi.Op.EMPTY_MATCH:zi.Op.NO_MATCH);if(1===n.length)return n[0];const e=zi.fromRegexp(t);return e.runes=[],e.subs=n,e}return t}case zi.Op.CHAR_CLASS:return null===t.runes?t:0===t.runes.length?new zi(zi.Op.NO_MATCH):2===t.runes.length&&0===t.runes[0]&&t.runes[1]===Ci.MAX_RUNE?new zi(zi.Op.ANY_CHAR):4===t.runes.length&&0===t.runes[0]&&t.runes[1]===ai.CODES.get("\n")-1&&t.runes[2]===ai.CODES.get("\n")+1&&t.runes[3]===Ci.MAX_RUNE?new zi(zi.Op.ANY_CHAR_NOT_NL):t;case zi.Op.STAR:case zi.Op.PLUS:case zi.Op.QUEST:{const n=e.simplify(t.subs[0]);return e.simplify1(t.op,t.flags,n,t)}case zi.Op.REPEAT:{if(0===t.min&&0===t.max)return new zi(zi.Op.EMPTY_MATCH);const n=e.simplify(t.subs[0]);if(-1===t.max){if(0===t.min)return e.simplify1(zi.Op.STAR,t.flags,n,null);if(1===t.min)return e.simplify1(zi.Op.PLUS,t.flags,n,null);const r=new zi(zi.Op.CONCAT),s=[];for(let e=0;e<t.min-1;e++)s.push(n);return s.push(e.simplify1(zi.Op.PLUS,t.flags,n,null)),r.subs=s.slice(0),e.simplify(r)}if(1===t.min&&1===t.max)return n;let r=null;if(t.min>0){r=[];for(let e=0;e<t.min;e++)r.push(n)}if(t.max>t.min){let s=e.simplify1(zi.Op.QUEST,t.flags,n,null);for(let r=t.min+1;r<t.max;r++){const r=new zi(zi.Op.CONCAT);r.subs=[n,s],s=e.simplify1(zi.Op.QUEST,t.flags,r,null)}if(null===r)return s;r.push(s)}if(null!==r){const t=new zi(zi.Op.CONCAT);return t.subs=r.slice(0),e.simplify(t)}return new zi(zi.Op.NO_MATCH)}}return t}static simplify1(e,t,n,r){if(n.op===zi.Op.EMPTY_MATCH)return n;if(n.op===zi.Op.NO_MATCH)return e===zi.Op.PLUS?n:new zi(zi.Op.EMPTY_MATCH);if(e===n.op&&(t&Ys.NON_GREEDY)===(n.flags&Ys.NON_GREEDY))return n;if(null!==r&&r.op===e&&(r.flags&Ys.NON_GREEDY)===(t&Ys.NON_GREEDY)&&n===r.subs[0])return r;const s=new zi(e);return s.flags=t,s.subs=[n],s}},na=class{constructor(e,t){this.sign=e,this.cls=t}};const ra=[48,57],sa=[9,10,12,13,32,32],ia=[48,57,65,90,95,95,97,122],aa=new Map([["\\d",new na(1,ra)],["\\D",new na(-1,ra)],["\\s",new na(1,sa)],["\\S",new na(-1,sa)],["\\w",new na(1,ia)],["\\W",new na(-1,ia)]]),oa=[48,57,65,90,97,122],Ba=[65,90,97,122],ca=[0,127],ua=[9,9,32,32],la=[0,31,127,127],ha=[48,57],Ca=[33,126],da=[97,122],pa=[32,126],fa=[33,47,58,64,91,96,123,126],ga=[9,13,32,32],ma=[65,90],Ea=[48,57,65,90,95,95,97,122],Da=[48,57,65,70,97,102],wa=new Map([["[:alnum:]",new na(1,oa)],["[:^alnum:]",new na(-1,oa)],["[:alpha:]",new na(1,Ba)],["[:^alpha:]",new na(-1,Ba)],["[:ascii:]",new na(1,ca)],["[:^ascii:]",new na(-1,ca)],["[:blank:]",new na(1,ua)],["[:^blank:]",new na(-1,ua)],["[:cntrl:]",new na(1,la)],["[:^cntrl:]",new na(-1,la)],["[:digit:]",new na(1,ha)],["[:^digit:]",new na(-1,ha)],["[:graph:]",new na(1,Ca)],["[:^graph:]",new na(-1,Ca)],["[:lower:]",new na(1,da)],["[:^lower:]",new na(-1,da)],["[:print:]",new na(1,pa)],["[:^print:]",new na(-1,pa)],["[:punct:]",new na(1,fa)],["[:^punct:]",new na(-1,fa)],["[:space:]",new na(1,ga)],["[:^space:]",new na(-1,ga)],["[:upper:]",new na(1,ma)],["[:^upper:]",new na(-1,ma)],["[:word:]",new na(1,Ea)],["[:^word:]",new na(-1,Ea)],["[:xdigit:]",new na(1,Da)],["[:^xdigit:]",new na(-1,Da)]]);var ya=class e{static charClassToString(e,t){let n="[";for(let r=0;r<t;r+=2){r>0&&(n+=" ");const t=e[r],s=e[r+1];n+=t===s?`0x${t.toString(16)}`:`0x${t.toString(16)}-0x${s.toString(16)}`}return n+="]",n}static cmp(e,t,n,r){const s=e[t]-n;return 0!==s?s:r-e[t+1]}static qsortIntPair(t,n,r){const s=(n+r)/2&-2,i=t[s],a=t[s+1];let o=n,B=r;for(;o<=B;){for(;o<r&&e.cmp(t,o,i,a)<0;)o+=2;for(;B>n&&e.cmp(t,B,i,a)>0;)B-=2;if(o<=B){if(o!==B){let e=t[o];t[o]=t[B],t[B]=e,e=t[o+1],t[o+1]=t[B+1],t[B+1]=e}o+=2,B-=2}}n<B&&e.qsortIntPair(t,n,B),o<r&&e.qsortIntPair(t,o,r)}constructor(e=gi.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;e.qsortIntPair(this.r,0,this.len-2);let t=2;for(let e=2;e<this.len;e+=2){const n=this.r[e],r=this.r[e+1];n<=this.r[t-1]+1?r>this.r[t-1]&&(this.r[t-1]=r):(this.r[t]=n,this.r[t+1]=r,t+=2)}return this.len=t,this}appendLiteral(e,t){return 0!==(t&Ys.FOLD_CASE)?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0)for(let n=2;n<=4;n+=2)if(this.len>=n){const r=this.r[this.len-n],s=this.r[this.len-n+1];if(e<=s+1&&r<=t+1)return e<r&&(this.r[this.len-n]=e),t>s&&(this.r[this.len-n+1]=t),this}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=Ci.MIN_FOLD&&t>=Ci.MAX_FOLD)return this.appendRange(e,t);if(t<Ci.MIN_FOLD||e>Ci.MAX_FOLD)return this.appendRange(e,t);e<Ci.MIN_FOLD&&(this.appendRange(e,Ci.MIN_FOLD-1),e=Ci.MIN_FOLD),t>Ci.MAX_FOLD&&(this.appendRange(Ci.MAX_FOLD+1,t),t=Ci.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let e=Ci.simpleFold(n);e!==n;e=Ci.simpleFold(e))this.appendRange(e,e)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const r=e[n],s=e[n+1];t<=r-1&&this.appendRange(t,r-1),t=s+1}return t<=Ci.MAX_RUNE&&this.appendRange(t,Ci.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),r=e.getHi(t),s=e.getStride(t);if(1!==s)for(let e=n;e<=r;e+=s)this.appendRange(e,e);else this.appendRange(n,r)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const r=e.getLo(n),s=e.getHi(n),i=e.getStride(n);if(1!==i)for(let e=r;e<=s;e+=i)t<=e-1&&this.appendRange(t,e-1),t=e+1;else t<=r-1&&this.appendRange(t,r-1),t=s+1}return t<=Ci.MAX_RUNE&&this.appendRange(t,Ci.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const r=this.r[n],s=this.r[n+1];e<=r-1&&(this.r[t]=e,this.r[t+1]=r-1,t+=2),e=s+1}return this.len=t,e<=Ci.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=Ci.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(t,n){let r=t.cls;return n&&(r=(new e).appendFoldedClass(r).cleanClass().toArray()),this.appendClassWithSign(r,t.sign)}toString(){return e.charClassToString(this.r,this.len)}},va=class{constructor(e){this.str=e,this.position=0}pos(){return this.position}rewindTo(e){this.position=e}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(e){this.position+=e}skipString(e){this.position+=e.length}pop(){const e=this.str.codePointAt(this.position);return this.position+=gi.charCount(e),e}lookingAt(e){return this.str.startsWith(e,this.position)}rest(){return this.str.substring(this.position)}from(e){return this.str.substring(e,this.position)}toString(){return this.rest()}},_a=(l=class{static unicodeTable(e){return"Any"===e?{tab:l.ANY_TABLE,fold:l.ANY_TABLE,sign:1}:"Ascii"===e?{tab:l.ASCII_TABLE,fold:l.ASCII_FOLD_TABLE,sign:1}:"Assigned"===e?{tab:hi.CATEGORIES.get("Cn"),fold:hi.CATEGORIES.get("Cn"),sign:-1}:"Lc"===e?{tab:hi.CATEGORIES.get("LC"),fold:hi.FOLD_CATEGORIES.get("LC"),sign:1}:hi.CATEGORIES.has(e)?{tab:hi.CATEGORIES.get(e),fold:hi.FOLD_CATEGORIES.get(e),sign:1}:hi.SCRIPTS.has(e)?{tab:hi.SCRIPTS.get(e),fold:hi.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<Ci.MIN_FOLD||e>Ci.MAX_FOLD)return e;let t=e;const n=e;for(e=Ci.simpleFold(e);e!==n;e=Ci.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===zi.Op.EMPTY_MATCH)return null;if(e.op===zi.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===zi.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new zi(zi.Op.LITERAL);return n.flags=t,n.runes=gi.stringToRunes(e),n}static parse(e,t){return new l(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=l.parseInt(e);if(-1===n)return-1;if(!e.more())return-1;let r;if(e.lookingAt(",")){if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))r=-1;else if(-1===(r=l.parseInt(e)))return-1}else r=n;if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||-2===r||r>1e3||r>=0&&n>r)throw new Ai(l.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|r&Ci.MAX_BMP}static isValidCaptureName(e){if(0===e.length)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==ai.CODES.get("_")&&!gi.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=ai.CODES.get("0")&&e.peek()<=ai.CODES.get("9");)e.skip(1);const n=e.from(t);return 0===n.length||n.length>1&&n.codePointAt(0)===ai.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===zi.Op.LITERAL&&1===e.runes.length||e.op===zi.Op.CHAR_CLASS||e.op===zi.Op.ANY_CHAR_NOT_NL||e.op===zi.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case zi.Op.LITERAL:return 1===e.runes.length&&e.runes[0]===t;case zi.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case zi.Op.ANY_CHAR_NOT_NL:return t!==ai.CODES.get("\n");case zi.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case zi.Op.ANY_CHAR:break;case zi.Op.ANY_CHAR_NOT_NL:l.matchRune(t,ai.CODES.get("\n"))&&(e.op=zi.Op.ANY_CHAR);break;case zi.Op.CHAR_CLASS:t.op===zi.Op.LITERAL?e.runes=new ya(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new ya(e.runes).appendClass(t.runes).toArray();break;case zi.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=zi.Op.CHAR_CLASS,e.runes=(new ya).appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray()}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new Ai(l.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case ai.CODES.get("1"):case ai.CODES.get("2"):case ai.CODES.get("3"):case ai.CODES.get("4"):case ai.CODES.get("5"):case ai.CODES.get("6"):case ai.CODES.get("7"):if(!e.more()||e.peek()<ai.CODES.get("0")||e.peek()>ai.CODES.get("7"))break;case ai.CODES.get("0"):{let t=n-ai.CODES.get("0");for(let n=1;n<3&&!(!e.more()||e.peek()<ai.CODES.get("0")||e.peek()>ai.CODES.get("7"));n++)t=8*t+e.peek()-ai.CODES.get("0"),e.skip(1);return t}case ai.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===ai.CODES.get("{")){let t=0,r=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===ai.CODES.get("}"))break;const s=gi.unhex(n);if(s<0)break e;if(r=16*r+s,r>Ci.MAX_RUNE)break e;t++}if(0===t)break e;return r}const t=gi.unhex(n);if(!e.more())break;n=e.pop();const r=gi.unhex(n);if(t<0||r<0)break;return 16*t+r}case ai.CODES.get("a"):return ai.CODES.get("");case ai.CODES.get("f"):return ai.CODES.get("\f");case ai.CODES.get("n"):return ai.CODES.get("\n");case ai.CODES.get("r"):return ai.CODES.get("\r");case ai.CODES.get("t"):return ai.CODES.get("\t");case ai.CODES.get("v"):return ai.CODES.get("\v");default:if(n<=Ci.MAX_ASCII&&!gi.isalnum(n))return n}throw new Ai(l.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new Ai(l.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?l.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(null===e)return!1;if(e.op===zi.Op.CAPTURE)return!0;if(e.subs)for(let t of e.subs)if(l.hasCapture(t))return!0;return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return null!==t&&null!==t.subs&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new zi(e),this.numRegexp+=1),t}reuse(e){null!==this.height&&this.height.has(e)&&this.height.delete(e),null!==e.subs&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>l.MAX_RUNES)throw new Ai(l.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(null===this.size){if(0===this.repeats&&(this.repeats=1),e.op===zi.Op.REPEAT){let t=e.max;-1===t&&(t=e.min),t<=0&&(t=1),t>Math.floor(l.MAX_SIZE/this.repeats)?this.repeats=l.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(l.MAX_SIZE/this.repeats))return;this.size=new Map;for(let e of this.stack)this.checkSize(e)}if(this.calcSize(e,!0)>l.MAX_SIZE)throw new Ai(l.ERR_LARGE)}calcSize(e,t=!1){if(!t&&null!==this.size&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case zi.Op.LITERAL:n=e.runes.length;break;case zi.Op.PLB:case zi.Op.NLB:case zi.Op.CAPTURE:case zi.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case zi.Op.PLUS:case zi.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case zi.Op.CONCAT:for(let t of e.subs)n+=this.calcSize(t);break;case zi.Op.ALTERNATE:for(let t of e.subs)n+=this.calcSize(t);e.subs.length>1&&(n=n+e.subs.length-1);break;case zi.Op.REPEAT:{let t=this.calcSize(e.subs[0]);if(-1===e.max){n=0===e.min?2+t:1+e.min*t;break}n=e.max*t+(e.max-e.min);break}}return n=Math.max(1,n),null===this.size&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<l.MAX_HEIGHT)){if(null===this.height){this.height=new Map;for(let e of this.stack)this.checkHeight(e)}if(this.calcHeight(e,!0)>l.MAX_HEIGHT)throw new Ai(l.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&null!==this.height&&this.height.has(e))return this.height.get(e);let n=1;for(let r of e.subs){const e=this.calcHeight(r);n<1+e&&(n=1+e)}return null===this.height&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!zi.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===zi.Op.CHAR_CLASS&&2===e.runes.length&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],-2&this.flags))return null;e.op=zi.Op.LITERAL,e.runes=[e.runes[0]],e.flags=-2&this.flags}else if(e.op===zi.Op.CHAR_CLASS&&4===e.runes.length&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&Ci.simpleFold(e.runes[0])===e.runes[2]&&Ci.simpleFold(e.runes[2])===e.runes[0]||e.op===zi.Op.CHAR_CLASS&&2===e.runes.length&&e.runes[0]+1===e.runes[1]&&Ci.simpleFold(e.runes[0])===e.runes[1]&&Ci.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|Ys.FOLD_CASE))return null;e.op=zi.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|Ys.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const r=this.stack[n-1],s=this.stack[n-2];return r.op===zi.Op.LITERAL&&s.op===zi.Op.LITERAL&&(r.flags&Ys.FOLD_CASE)===(s.flags&Ys.FOLD_CASE)&&(s.runes=l.concatRunes(s.runes,r.runes),e>=0?(r.runes=[e],r.flags=t,!0):(this.pop(),this.reuse(r),!1))}newLiteral(e,t){const n=this.newRegexp(zi.Op.LITERAL);return n.flags=t,0!==(t&Ys.FOLD_CASE)&&(e=l.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,r,s,i){let a=this.flags;if(0!==(a&Ys.PERL_X)&&(s.more()&&s.lookingAt("?")&&(s.skip(1),a^=Ys.NON_GREEDY),-1!==i))throw new Ai(l.ERR_INVALID_REPEAT_OP,s.from(i));const o=this.stack.length;if(0===o)throw new Ai(l.ERR_MISSING_REPEAT_ARGUMENT,s.from(r));const B=this.stack[o-1];if(zi.isPseudoOp(B.op))throw new Ai(l.ERR_MISSING_REPEAT_ARGUMENT,s.from(r));const c=this.newRegexp(e);if(c.min=t,c.max=n,c.flags=a,c.subs=[B],this.stack[o-1]=c,this.checkLimits(c),e===zi.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(c,1e3))throw new Ai(l.ERR_INVALID_REPEAT_SIZE,s.from(r))}repeatIsValid(e,t){if(e.op===zi.Op.REPEAT){let n=e.max;if(0===n)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return 0===e.length?this.push(this.newRegexp(zi.Op.EMPTY_MATCH)):this.push(this.collapse(e,zi.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),0===e.length?this.push(this.newRegexp(zi.Op.NO_MATCH)):this.push(this.collapse(e,zi.Op.ALTERNATE))}cleanAlt(e){e.op===zi.Op.CHAR_CLASS&&(e.runes=new ya(e.runes).cleanClass().toArray(),2===e.runes.length&&0===e.runes[0]&&e.runes[1]===Ci.MAX_RUNE?(e.runes=[],e.op=zi.Op.ANY_CHAR):4===e.runes.length&&0===e.runes[0]&&e.runes[1]===ai.CODES.get("\n")-1&&e.runes[2]===ai.CODES.get("\n")+1&&e.runes[3]===Ci.MAX_RUNE&&(e.runes=[],e.op=zi.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(1===e.length)return e[0];let n=0;for(let a of e)n+=a.op===t?a.subs.length:1;let r=new Array(n).fill(null),s=0;for(let a of e)if(a.op===t){for(let e=0;e<a.subs.length;e++)r[s++]=a.subs[e];this.reuse(a)}else r[s++]=a;let i=this.newRegexp(t);if(i.subs=r,t===zi.Op.ALTERNATE&&(i.subs=this.factor(i.subs),1===i.subs.length)){const e=i;i=i.subs[0],this.reuse(e)}return i}factor(e){if(e.length<2)return e;let t=0,n=e.length,r=0,s=null,i=0,a=0,o=0;for(let c=0;c<=n;c++){let B=null,u=0,l=0;if(c<n){let n=e[t+c];if(n.op===zi.Op.CONCAT&&n.subs.length>0&&(n=n.subs[0]),n.op===zi.Op.LITERAL&&(B=n.runes,u=n.runes.length,l=n.flags&Ys.FOLD_CASE),l===a){let e=0;for(;e<i&&e<u&&s[e]===B[e];)e++;if(e>0){i=e;continue}}}if(c===o);else if(c===o+1)e[r++]=e[t+o];else{const n=this.newRegexp(zi.Op.LITERAL);n.flags=a,n.runes=s.slice(0,i);for(let r=o;r<c;r++)e[t+r]=this.removeLeadingString(e[t+r],i),this.checkLimits(e[t+r]);const B=this.collapse(e.slice(t+o,t+c),zi.Op.ALTERNATE),u=this.newRegexp(zi.Op.CONCAT);u.subs=[n,B],e[r++]=u}o=c,s=B,i=u,a=l}n=r,t=0,o=0,r=0;let B=null;for(let c=0;c<=n;c++){let s=null;if(!(c<n&&(s=l.leadingRegexp(e[t+c]),null!==B&&B.equals(s)&&(l.isCharClass(B)||B.op===zi.Op.REPEAT&&B.min===B.max&&l.isCharClass(B.subs[0]))))){if(c===o);else if(c===o+1)e[r++]=e[t+o];else{const n=B;for(let r=o;r<c;r++){const n=r!==o;e[t+r]=this.removeLeadingRegexp(e[t+r],n),this.checkLimits(e[t+r])}const s=this.collapse(e.slice(t+o,t+c),zi.Op.ALTERNATE),i=this.newRegexp(zi.Op.CONCAT);i.subs=[n,s],e[r++]=i}o=c,B=s}}n=r,t=0,o=0,r=0;for(let c=0;c<=n;c++)if(!(c<n&&l.isCharClass(e[t+c]))){if(c===o);else if(c===o+1)e[r++]=e[t+o];else{let n=o;for(let r=o+1;r<c;r++){const s=e[t+n],i=e[t+r];(s.op<i.op||s.op===i.op&&(null!==s.runes?s.runes.length:0)<(null!==i.runes?i.runes.length:0))&&(n=r)}const s=e[t+o];e[t+o]=e[t+n],e[t+n]=s;for(let r=o+1;r<c;r++)l.mergeCharClass(e[t+o],e[t+r]),this.reuse(e[t+r]);this.cleanAlt(e[t+o]),e[r++]=e[t+o]}c<n&&(e[r++]=e[t+c]),o=c+1}n=r,t=0,o=0,r=0;for(let c=0;c<n;++c)c+1<n&&e[t+c].op===zi.Op.EMPTY_MATCH&&e[t+c+1].op===zi.Op.EMPTY_MATCH||(e[r++]=e[t+c]);return n=r,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===zi.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===zi.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=zi.Op.EMPTY_MATCH,e.subs=zi.emptySubs();break;case 2:{const t=e;e=e.subs[1],this.reuse(t);break}default:e.subs=e.subs.slice(1,e.subs.length)}return e}return e.op===zi.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),0===e.runes.length&&(e.op=zi.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===zi.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=zi.Op.EMPTY_MATCH,e.subs=zi.emptySubs();break;case 1:{const t=e;e=e.subs[0],this.reuse(t);break}}return e}return t&&this.reuse(e),this.newRegexp(zi.Op.EMPTY_MATCH)}parseInternal(){if(0!==(this.flags&Ys.LITERAL))return l.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const r=new va(this.wholeRegexp);for(;r.more();){let s=-1;e:switch(r.peek()){case ai.CODES.get("("):if(0!==(this.flags&Ys.LOOKBEHIND)){if(r.lookingAt("(?<=")){this.parsePosLookBehind(),r.skip(4);break}if(r.lookingAt("(?<!")){this.parseNegLookBehind(),r.skip(4);break}}if(0!==(this.flags&Ys.PERL_X)&&r.lookingAt("(?")){this.parsePerlFlags(r);break}this.op(zi.Op.LEFT_PAREN).cap=++this.numCap,r.skip(1);break;case ai.CODES.get("|"):this.parseVerticalBar(),r.skip(1);break;case ai.CODES.get(")"):this.parseRightParen(),r.skip(1);break;case ai.CODES.get("^"):0!==(this.flags&Ys.ONE_LINE)?this.op(zi.Op.BEGIN_TEXT):this.op(zi.Op.BEGIN_LINE),r.skip(1);break;case ai.CODES.get("$"):0!==(this.flags&Ys.ONE_LINE)?this.op(zi.Op.END_TEXT).flags|=Ys.WAS_DOLLAR:this.op(zi.Op.END_LINE),r.skip(1);break;case ai.CODES.get("."):0!==(this.flags&Ys.DOT_NL)?this.op(zi.Op.ANY_CHAR):this.op(zi.Op.ANY_CHAR_NOT_NL),r.skip(1);break;case ai.CODES.get("["):this.parseClass(r);break;case ai.CODES.get("*"):case ai.CODES.get("+"):case ai.CODES.get("?"):{s=r.pos();let i=null;switch(r.pop()){case ai.CODES.get("*"):i=zi.Op.STAR;break;case ai.CODES.get("+"):i=zi.Op.PLUS;break;case ai.CODES.get("?"):i=zi.Op.QUEST}this.repeat(i,t,n,s,r,e);break}case ai.CODES.get("{"):{s=r.pos();const i=l.parseRepeat(r);if(i<0){r.rewindTo(s),this.literal(r.pop());break}t=i>>16,n=(i&Ci.MAX_BMP)<<16>>16,this.repeat(zi.Op.REPEAT,t,n,s,r,e);break}case ai.CODES.get("\\"):{const e=r.pos();if(r.skip(1),0!==(this.flags&Ys.PERL_X)&&r.more())switch(r.pop()){case ai.CODES.get("A"):this.op(zi.Op.BEGIN_TEXT);break e;case ai.CODES.get("b"):this.op(zi.Op.WORD_BOUNDARY);break e;case ai.CODES.get("B"):this.op(zi.Op.NO_WORD_BOUNDARY);break e;case ai.CODES.get("C"):throw new Ai(l.ERR_INVALID_ESCAPE,"\\C");case ai.CODES.get("Q"):{let e=r.rest();const t=e.indexOf("\\E");t>=0?(e=e.substring(0,t),r.skipString(e),r.skipString("\\E")):r.skipString(e);let n=0;for(;n<e.length;){const t=e.codePointAt(n);this.literal(t),n+=gi.charCount(t)}break e}case ai.CODES.get("z"):this.op(zi.Op.END_TEXT);break e;default:r.rewindTo(e)}else r.rewindTo(e);const t=this.newRegexp(zi.Op.CHAR_CLASS);if(t.flags=this.flags,r.lookingAt("\\p")||r.lookingAt("\\P")){const e=new ya;if(this.parseUnicodeClass(r,e)){t.runes=e.toArray(),this.push(t);break e}}const n=new ya;if(this.parsePerlClassEscape(r,n)){t.runes=n.toArray(),this.push(t);break e}r.rewindTo(e),this.reuse(t),this.literal(l.parseEscape(r));break}default:this.literal(r.pop())}e=s}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),1!==this.stack.length)throw new Ai(l.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const t="P"===n.charAt(2)?4:3,r=n.indexOf(">");if(r<0)throw new Ai(l.ERR_INVALID_NAMED_CAPTURE,n);const s=n.substring(t,r);if(e.skipString(s),e.skip(t+1),!l.isValidCaptureName(s))throw new Ai(l.ERR_INVALID_NAMED_CAPTURE,n.substring(0,r+1));const i=this.op(zi.Op.LEFT_PAREN);if(i.cap=++this.numCap,this.namedGroups[s])throw new Ai(l.ERR_DUPLICATE_NAMED_CAPTURE,s);return this.namedGroups[s]=this.numCap,void(i.name=s)}e.skip(2);let r=this.flags,s=1,i=!1;e:for(;e.more();){const t=e.pop();switch(t){case ai.CODES.get("i"):r|=Ys.FOLD_CASE,i=!0;break;case ai.CODES.get("m"):r&=-17,i=!0;break;case ai.CODES.get("s"):r|=Ys.DOT_NL,i=!0;break;case ai.CODES.get("U"):r|=Ys.NON_GREEDY,i=!0;break;case ai.CODES.get("-"):if(s<0)break e;s=-1,r=~r,i=!1;break;case ai.CODES.get(":"):case ai.CODES.get(")"):if(s<0){if(!i)break e;r=~r}return t===ai.CODES.get(":")&&this.op(zi.Op.LEFT_PAREN),void(this.flags=r);default:break e}}throw new Ai(l.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(zi.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(zi.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(zi.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===zi.Op.VERTICAL_BAR&&l.isCharClass(this.stack[e-1])&&l.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const r=n;n=t,t=r,this.stack[e-3]=n}return l.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===zi.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new Ai(l.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==zi.Op.LEFT_PAREN)throw new Ai(l.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,0!==t.lb){if(l.hasCapture(e))throw new Ai(l.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);return t.lb>0?t.op=zi.Op.PLB:t.op=zi.Op.NLB,t.subs=[e],void this.push(t)}0===t.cap?this.push(e):(t.op=zi.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if(0===(this.flags&Ys.PERL_X)||!e.more()||e.pop()!==ai.CODES.get("\\")||!e.more())return!1;e.pop();const r=e.from(n),s=aa.has(r)?aa.get(r):null;return null!==s&&(t.appendGroup(s,0!==(this.flags&Ys.FOLD_CASE)),!0)}parseNamedClass(e,t){const n=e.rest(),r=n.indexOf(":]");if(r<0)return!1;const s=n.substring(0,r+2);e.skipString(s);const i=wa.has(s)?wa.get(s):null;if(null===i)throw new Ai(l.ERR_INVALID_CHAR_RANGE,s);return t.appendGroup(i,0!==(this.flags&Ys.FOLD_CASE)),!0}parseUnicodeClass(e,t){const n=e.pos();if(0===(this.flags&Ys.UNICODE_GROUPS)||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let r,s=1,i=e.pop();if(i===ai.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new Ai(l.ERR_INVALID_CHAR_RANGE,e.rest());if(i=e.pop(),i!==ai.CODES.get("{"))r=gi.runeToString(i);else{const t=e.rest(),s=t.indexOf("}");if(s<0)throw e.rewindTo(n),new Ai(l.ERR_INVALID_CHAR_RANGE,e.rest());r=t.substring(0,s),e.skipString(r),e.skip(1)}0!==r.length&&r.codePointAt(0)===ai.CODES.get("^")&&(s=0-s,r=r.substring(1));const a=l.unicodeTable(r);if(null===a)throw new Ai(l.ERR_INVALID_CHAR_RANGE,e.from(n));a.sign<0&&(s=0-s);const o=a.tab,B=a.fold;if(0===(this.flags&Ys.FOLD_CASE)||null===B)t.appendTableWithSign(o,s);else{const e=(new ya).appendTable(o).appendTable(B).cleanClass().toArray();t.appendClassWithSign(e,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(zi.Op.CHAR_CLASS);n.flags=this.flags;const r=new ya;let s=1;e.more()&&e.lookingAt("^")&&(s=-1,e.skip(1),0===(this.flags&Ys.CLASS_NL)&&r.appendRange(ai.CODES.get("\n"),ai.CODES.get("\n")));let i=!0;for(;!e.more()||e.peek()!==ai.CODES.get("]")||i;){if(e.more()&&e.lookingAt("-")&&0===(this.flags&Ys.PERL_X)&&!i){const n=e.rest();if("-"===n||!n.startsWith("-]"))throw e.rewindTo(t),new Ai(l.ERR_INVALID_CHAR_RANGE,e.rest())}i=!1;const n=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,r))continue;e.rewindTo(n)}if(this.parseUnicodeClass(e,r))continue;if(this.parsePerlClassEscape(e,r))continue;e.rewindTo(n);const s=l.parseClassChar(e,t);let a=s;if(e.more()&&e.lookingAt("-"))if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(a=l.parseClassChar(e,t),a<s)throw new Ai(l.ERR_INVALID_CHAR_RANGE,e.from(n));0===(this.flags&Ys.FOLD_CASE)?r.appendRange(s,a):r.appendFoldedRange(s,a)}e.skip(1),r.cleanClass(),s<0&&r.negateClass(),n.runes=r.toArray(),this.push(n)}},d(l,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),d(l,"ERR_INVALID_CHAR_RANGE","invalid character class range"),d(l,"ERR_INVALID_ESCAPE","invalid escape sequence"),d(l,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),d(l,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),d(l,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),d(l,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),d(l,"ERR_MISSING_BRACKET","missing closing ]"),d(l,"ERR_MISSING_PAREN","missing closing )"),d(l,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),d(l,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),d(l,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),d(l,"ERR_UNEXPECTED_PAREN","unexpected )"),d(l,"ERR_NESTING_DEPTH","expression nests too deeply"),d(l,"ERR_LARGE","expression too large"),d(l,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),d(l,"MAX_HEIGHT",1e3),d(l,"MAX_SIZE",3355443),d(l,"MAX_RUNES",33554432),d(l,"ANY_TABLE",new oi(new Uint32Array([0,Ci.MAX_RUNE,1]))),d(l,"ASCII_TABLE",new oi(new Uint32Array([0,127,1]))),d(l,"ASCII_FOLD_TABLE",new oi(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),l),Ia=class e{static initTest(t){const n=e.compile(t),r=new e(n.expr,n.prog,n.numSubexp,n.longest);return r.cond=n.cond,r.prefix=n.prefix,r.prefixUTF8=n.prefixUTF8,r.prefixComplete=n.prefixComplete,r.prefixRune=n.prefixRune,r.prefilter=n.prefilter,r}static compile(t){return e.compileImpl(t,Ys.PERL,!1)}static compilePOSIX(t){return e.compileImpl(t,Ys.POSIX,!0)}static compileImpl(t,n,r){let s=_a.parse(t,n);const i=s.maxCap();s=ta.simplify(s);const a=Wi.build(s),o=ea.compileRegexp(s),B=new e(t,o,i,r);B.prefilter=a.type===Yi.Type.NONE?null:a;const[c,u]=o.prefix();return B.prefixComplete=c,B.prefix=u,B.prefixUTF8=gi.stringToUtf8ByteArray(B.prefix),B.prefix.length>0&&(B.prefixRune=B.prefix.codePointAt(0)),B.namedGroups=s.namedGroups,B}static match(t,n){return e.compile(t).match(n)}constructor(e,t,n=0,r=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=r,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new Hi(this.prog),this.onepass=qi.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,r){if((n===Ys.ANCHOR_START||n===Ys.ANCHOR_BOTH)&&0!==t)return null;let s=-1,i=-1;const a=e.prefixLength(this);if(n===Ys.UNANCHORED){const n=e.index(this,t);if(n<0)return null;s=t+n,i=s+a}else if(n===Ys.ANCHOR_BOTH){if(e.endPos()!==a)return null;if(0!==e.index(this,0))return null;s=0,i=a}else if(n===Ys.ANCHOR_START){if(0!==e.index(this,0))return null;s=0,i=a}if(s<0)return null;if(r>0){const e=new Int32Array(r).fill(-1);return e[0]=s,e[1]=i,Array.from(e)}return[]}executeEngine(e,t,n,r){if(this.prefixComplete&&(0===r||0===this.numSubexp))return this.matchPrefixComplete(e,t,n,r);if(null!==this.prefilter&&n===Ys.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(null!==this.onepass)return qi.execute(this,e,t,n,r);if(r>0)return 0===this.prog.numLb&&e.endPos()<=Ji.maxBitStateLen(this.prog)?Ji.execute(this,e,t,n,r):this.doExecuteNFA(e,t,n,r);if(0===this.prog.numLb){const s=this.dfa.match(e,t,n);if(null!==s)return s?[]:null;if(e.endPos()<=Ji.maxBitStateLen(this.prog))return Ji.execute(this,e,t,n,r)}return this.doExecuteNFA(e,t,n,r)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,r){let s=this.get();s||(s=Pi.fromRE2(this)),s.init(r);const i=s.match(e,t,n)?s.submatches():null;return this.put(s),i}match(e){return null!==this.executeEngine(Ti.fromUTF16(e),0,Ys.UNANCHORED,0)}matchWithGroup(e,t,n,r,s){return e instanceof Ei||(e=gi.isByteArray(e)?yi.utf8(e):yi.utf16(e)),this.matchMachineInput(e,t,n,r,s)}matchMachineInput(e,t,n,r,s){if(t>n)return[!1,null];const i=e.isUTF16Encoding()?Ti.fromUTF16(e.asCharSequence(),0,n):Ti.fromUTF8(e.asBytes(),0,n),a=this.executeEngine(i,t,r,2*s);return null===a?[!1,null]:[!0,a]}matchUTF8(e){return null!==this.executeEngine(Ti.fromUTF8(e),0,Ys.UNANCHORED,0)}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let r=0,s=0,i="";const a=Ti.fromUTF16(e);let o=0;for(;s<=e.length;){const B=this.executeEngine(a,s,Ys.UNANCHORED,2);if(null===B||0===B.length)break;i+=e.substring(r,B[0]),(B[1]>r||0===B[0])&&(i+=t(e.substring(B[0],B[1])),o++),r=B[1];const c=7&a.step(s);if(s+c>B[1]?s+=c:s+1>B[1]?s++:s=B[1],o>=n)break}return i+=e.substring(r),i}pad(e){if(null===e)return null;let t=2*(1+this.numSubexp);if(e.length<t){let n=new Array(t).fill(-1);for(let t=0;t<e.length;t++)n[t]=e[t];e=n}return e}allMatches(e,t,n=e=>e){let r=[];const s=e.endPos();t<0&&(t=s+1);let i=0,a=0,o=-1;for(;a<t&&i<=s;){const t=this.executeEngine(e,i,Ys.UNANCHORED,this.prog.numCap);if(null===t||0===t.length)break;let B=!0;if(t[1]===i){t[0]===o&&(B=!1);const n=e.step(i);n<0?i=s+1:i+=7&n}else i=t[1];o=t[1],B&&(r.push(n(this.pad(t))),a++)}return r}findUTF8(e){const t=this.executeEngine(Ti.fromUTF8(e),0,Ys.UNANCHORED,2);return null===t?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(Ti.fromUTF8(e),0,Ys.UNANCHORED,2);return null===t?null:t.slice(0,2)}find(e){const t=this.executeEngine(Ti.fromUTF16(e),0,Ys.UNANCHORED,2);return null===t?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(Ti.fromUTF16(e),0,Ys.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(Ti.fromUTF8(e),0,Ys.UNANCHORED,this.prog.numCap);if(null===t)return null;const n=new Array(1+this.numSubexp).fill(null);for(let r=0;r<n.length;r++)2*r<t.length&&t[2*r]>=0&&(n[r]=e.slice(t[2*r],t[2*r+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(Ti.fromUTF8(e),0,Ys.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(Ti.fromUTF16(e),0,Ys.UNANCHORED,this.prog.numCap);if(null===t)return null;const n=new Array(1+this.numSubexp).fill(null);for(let r=0;r<n.length;r++)2*r<t.length&&t[2*r]>=0&&(n[r]=e.substring(t[2*r],t[2*r+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(Ti.fromUTF16(e),0,Ys.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(Ti.fromUTF8(e),t,t=>e.slice(t[0],t[1]));return 0===n.length?null:n}findAllUTF8Index(e,t){const n=this.allMatches(Ti.fromUTF8(e),t,e=>e.slice(0,2));return 0===n.length?null:n}findAll(e,t){const n=this.allMatches(Ti.fromUTF16(e),t,t=>e.substring(t[0],t[1]));return 0===n.length?null:n}findAllIndex(e,t){const n=this.allMatches(Ti.fromUTF16(e),t,e=>e.slice(0,2));return 0===n.length?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(Ti.fromUTF8(e),t,t=>{let n=new Array(t.length/2|0).fill(null);for(let r=0;r<n.length;r++)t[2*r]>=0&&(n[r]=e.slice(t[2*r],t[2*r+1]));return n});return 0===n.length?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(Ti.fromUTF8(e),t);return 0===n.length?null:n}findAllSubmatch(e,t){const n=this.allMatches(Ti.fromUTF16(e),t,t=>{let n=new Array(t.length/2|0).fill(null);for(let r=0;r<n.length;r++)t[2*r]>=0&&(n[r]=e.substring(t[2*r],t[2*r+1]));return n});return 0===n.length?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(Ti.fromUTF16(e),t);return 0===n.length?null:n}},Ta=class e{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(t){let n="";if(t instanceof RegExp&&(t.ignoreCase&&(n+="i"),t.multiline&&(n+="m"),t.dotAll&&(n+="s"),t=t.source),"string"!=typeof t)return t;let r="",s=!1,i=t.length;0===i&&(r="(?:)",s=!0);let a=!1,o=0;for(;o<i;){let n=t[o];if("\\"===n){if(o+1<i)switch(n=t[o+1],n){case"\\":r+="\\\\",o+=2;continue;case"c":if(o+2<i){let e=t[o+2].charCodeAt(0);if(e>=65&&e<=90||e>=97&&e<=122){let t=e%32;r+="\\x",r+=(t>>4).toString(16).toUpperCase(),r+=(15&t).toString(16).toUpperCase(),o+=3,s=!0;continue}}r+="c",o+=2,s=!0;continue;case"u":if(o+2<i)if("{"===t[o+2]){let n=o+3,a=!1,B=!1;for(;n<i;){const r=t[n];if("}"===r){B=!0;break}if(!e.isHexadecimal(r))break;a=!0,n++}if(B&&a){r+="\\x",o+=2,s=!0;continue}}else if(o+5<i){let n=!0;for(let r=0;r<4;r++)if(!e.isHexadecimal(t[o+2+r])){n=!1;break}if(n){r+="\\x{"+t.substring(o+2,o+6)+"}",o+=6,s=!0;continue}}r+="u",o+=2,s=!0;continue;case"x":{let n=!1;if(o+2<i&&"{"===t[o+2]){let r=o+3,s=!1,a=!1;for(;r<i;){const n=t[r];if("}"===n){a=!0;break}if(!e.isHexadecimal(n))break;s=!0,r++}a&&s&&(n=!0)}else o+3<i&&e.isHexadecimal(t[o+2])&&e.isHexadecimal(t[o+3])&&(n=!0);n?(r+="\\x",o+=2):(r+="x",o+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":r+="\\"+n,o+=2;continue;default:{let e=t.codePointAt(o+1);if(e>=48&&e<=57||e>=65&&e<=90||e>=97&&e<=122){let n=gi.charCount(e);r+=t.substring(o+1,o+1+n),o+=n+1,s=!0}else{r+="\\";let n=gi.charCount(e);r+=t.substring(o+1,o+1+n),o+=n+1}continue}}}else{if("/"===n){r+="\\/",o+=1,s=!0;continue}if("["===n)a=!0;else if("]"===n)a=!1;else if(!a&&"("===n&&o+2<i&&"?"===t[o+1]&&"<"===t[o+2]&&o+3<i&&!"=!>)".includes(t[o+3])){r+="(?P<",o+=3,s=!0;continue}}let B=t.codePointAt(o),c=gi.charCount(B);r+=t.substring(o,o+c),o+=c}const B=s?r:t;return n.length>0?`(?${n})${B}`:B}},ba=(h=class{static quote(e){return gi.quoteMeta(e)}static quoteReplacement(e,t=!1){return Li.quoteReplacement(e,t)}static translateRegExp(e){return Ta.translate(e)}static compile(e,t=0){let n=e;if(0!==(t&h.CASE_INSENSITIVE)&&(n=`(?i)${n}`),0!==(t&h.DOTALL)&&(n=`(?s)${n}`),0!==(t&h.MULTILINE)&&(n=`(?m)${n}`),-544&t)throw new Si("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let r=Ys.PERL;0!==(t&h.DISABLE_UNICODE_GROUPS)&&(r&=-129),0!==(t&h.LOOKBEHINDS)&&(r|=Ys.LOOKBEHIND);const s=new h(e,t);return s.re2Input=Ia.compileImpl(n,r,0!==(t&h.LONGEST_MATCH)),s}static matches(e,t){return h.compile(e).testExact(t)}static initTest(e,t,n){if(null==e)throw new Error("pattern is null");if(null==n)throw new Error("re2 is null");const r=new h(e,t);return r.re2Input=n,r}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return gi.isByteArray(e)&&(e=yi.utf8(e)),new Li(this,e)}test(e){return gi.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=gi.isByteArray(e)?Ti.fromUTF8(e):Ti.fromUTF16(e);return null!==this.re2Input.executeEngine(t,0,Ys.ANCHOR_BOTH,0)}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let s=1;s<=t.groupCount();s++){const e=t.group(s);n.push(null===e?void 0:e)}n.index=t.start(0),n.input=e;const r=this.namedGroups();if(Object.keys(r).length>0){const e=t.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);n.groups=e}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),r=[];let s=0,i=0;for(;n.find();)if(0!==i||0!==n.end()){if(t>0&&r.length===t-1)break;if(i===n.start()){if(0===t){s+=1,i=n.end();continue}}else for(;s>0;)r.push(""),s-=1;r.push(n.substring(i,n.start())),i=n.end()}else i=n.end();if(0===t&&i!==n.inputLength()){for(;s>0;)r.push(""),s-=1;r.push(n.substring(i,n.inputLength()))}return 0===t&&(0!==r.length||i===n.inputLength()&&i>0)||r.push(n.substring(i,n.inputLength())),r}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let e=1;e<=t.groupCount();e++){const r=t.group(e);n.push(null===r?void 0:r)}n.index=t.start(0),n.input=e;const r=this.namedGroups();if(Object.keys(r).length>0){const e=t.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);n.groups=e}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e||null!==e&&this.constructor===e.constructor&&(this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput)}},d(h,"CASE_INSENSITIVE",Ws),d(h,"DOTALL",$s),d(h,"MULTILINE",Xs),d(h,"DISABLE_UNICODE_GROUPS",Zs),d(h,"LONGEST_MATCH",ei),d(h,"LOOKBEHINDS",ti),h);
/**
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
 */
let Aa="12.19.0";
/**
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
 */
/**
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
 */
const Oa=new $("@firebase/firestore");function Na(){return Oa.logLevel}function Sa(e){Oa.setLogLevel(e)}function Fa(e,...t){if(Oa.logLevel<=K.DEBUG){const n=t.map(ka);Oa.debug(`Firestore (${Aa}): ${e}`,...n)}}function La(e,...t){if(Oa.logLevel<=K.ERROR){const n=t.map(ka);Oa.error(`Firestore (${Aa}): ${e}`,...n)}}function Ra(e,...t){if(Oa.logLevel<=K.WARN){const n=t.map(ka);Oa.warn(`Firestore (${Aa}): ${e}`,...n)}}function ka(e){if("string"==typeof e)return e;try{return t=e,JSON.stringify(t)}catch(n){return e}var t}
/**
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
 */function Pa(e,t,n){let r="Unexpected state";"string"==typeof t?r=t:n=t,xa(e,r,n)}function xa(e,t,n){let r=`FIRESTORE (${Aa}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(s){r+=" CONTEXT: "+n}throw La(r),new Error(r)}function Ma(e,t,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,e||xa(t,s,r)}function Ga(e,t){return e}
/**
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
 */function Ha(e){const t="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(n);else for(let r=0;r<e;r++)n[r]=Math.floor(256*Math.random());return n}
/**
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
 */class Ua{static newId(){const e=62*Math.floor(256/62);let t="";for(;t.length<20;){const n=Ha(40);for(let r=0;r<n.length;++r)t.length<20&&n[r]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return t}}function Va(e,t){return e<t?-1:e>t?1:0}function Ja(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=e.charAt(r),s=t.charAt(r);if(n!==s)return qa(n)===qa(s)?Va(n,s):qa(n)?1:-1}return Va(e.length,t.length)}const ja=55296,Ka=57343;function qa(e){const t=e.charCodeAt(0);return t>=ja&&t<=Ka}function za(e,t,n){return e.length===t.length&&e.every((e,r)=>n(e,t[r]))}
/**
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
 */class Qa{constructor(e,t){this.comparator=e,this.root=t||Wa.EMPTY}insert(e,t){return new Qa(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Wa.BLACK,null,null))}remove(e){return new Qa(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Wa.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(0===n)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(0===r)return t+n.left.size;r<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ya(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ya(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ya(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ya(this.root,e,this.comparator,!0)}}class Ya{constructor(e,t,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Wa{constructor(e,t,n,r,s){this.key=e,this.value=t,this.color=null!=n?n:Wa.RED,this.left=null!=r?r:Wa.EMPTY,this.right=null!=s?s:Wa.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,r,s){return new Wa(null!=e?e:this.key,null!=t?t:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const s=n(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,t,n),null):0===s?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return Wa.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===t(e,r.key)){if(r.right.isEmpty())return Wa.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Wa.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Wa.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Pa(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Pa(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Pa(27949);return e+(this.isRed()?0:1)}}Wa.EMPTY=null,Wa.RED=!0,Wa.BLACK=!1,Wa.EMPTY=new class{constructor(){this.size=0}get key(){throw Pa(57766)}get value(){throw Pa(16141)}get color(){throw Pa(16727)}get left(){throw Pa(29726)}get right(){throw Pa(36894)}copy(e,t,n,r,s){return this}insert(e,t,n){return new Wa(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
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
 */
class $a{constructor(e){this.comparator=e,this.data=new Qa(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let n;for(n=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Xa(this.data.getIterator())}getIteratorFrom(e){return new Xa(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof $a))return!1;if(this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(0!==this.comparator(e,r))return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new $a(this.comparator);return t.data=e,t}}class Xa{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
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
 */const Za={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class eo extends O{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
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
 */const to="__name__";class no{constructor(e,t,n){void 0===t?t=0:t>e.length&&Pa(637,{offset:t,range:e.length}),void 0===n?n=e.length-t:n>e.length-t&&Pa(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return 0===no.comparator(this,e)}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof no?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=no.compareSegments(e.get(r),t.get(r));if(0!==n)return n}return Va(e.length,t.length)}static compareSegments(e,t){const n=no.isNumericId(e),r=no.isNumericId(t);return n&&!r?-1:!n&&r?1:n&&r?no.extractNumericId(e).compare(no.extractNumericId(t)):Ja(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return xs.fromString(e.substring(4,e.length-2))}}class ro extends no{construct(e,t,n){return new ro(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new eo(Za.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(e=>e.length>0))}return new ro(t)}static emptyPath(){return new ro([])}}const so=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let io=class e extends no{construct(t,n,r){return new e(t,n,r)}static isValidIdentifier(e){return so.test(e)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),e.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===to}static keyField(){return new e([to])}static fromServerFormat(t){const n=[];let r="",s=0;const i=()=>{if(0===r.length)throw new eo(Za.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<t.length;){const e=t[s];if("\\"===e){if(s+1===t.length)throw new eo(Za.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const e=t[s+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new eo(Za.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=e,s+=2}else"`"===e?(a=!a,s++):"."!==e||a?(r+=e,s++):(i(),s++)}if(i(),a)throw new eo(Za.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new e(n)}static emptyPath(){return new e([])}};
/**
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
 */class ao{constructor(e){this.fields=e,e.sort(io.comparator)}static empty(){return new ao([])}unionWith(e){let t=new $a(io.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new ao(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return za(this.fields,e.fields,(e,t)=>e.isEqual(t))}}
/**
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
 */function oo(e){let t=0;for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t++;return t}function Bo(e,t){for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t(n,e[n])}function co(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}
/**
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
 */class uo{constructor(e){this.path=e}static fromPath(e){return new uo(ro.fromString(e))}static fromName(e){return new uo(ro.fromString(e).popFirst(5))}static empty(){return new uo(ro.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===ro.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return ro.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new uo(new ro(e.slice()))}}
/**
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
 */function lo(e,t,n){if(!n)throw new eo(Za.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function ho(e){if(!uo.isDocumentKey(e))throw new eo(Za.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function Co(e){if(uo.isDocumentKey(e))throw new eo(Za.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function po(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function fo(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const n=(t=e).constructor?t.constructor.name:null;return n?`a custom ${n} object`:"an object"}}var t;return"function"==typeof e?"a function":Pa(12329,{type:typeof e})}function go(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new eo(Za.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=fo(e);throw new eo(Za.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return e}
/**
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
 */function mo(e,t){const n={typeString:e};return t&&(n.value=t),n}function Eo(e,t){if(!po(e))throw new eo(Za.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in t)if(t[r]){const s=t[r].typeString,i="value"in t[r]?{value:t[r].value}:void 0;if(!(r in e)){n=`JSON missing required field: '${r}'`;break}const a=e[r];if(s&&typeof a!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&a!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new eo(Za.INVALID_ARGUMENT,n);return!0}
/**
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
 */const Do=-62135596800,wo=1e6;class yo{static now(){return yo.fromMillis(Date.now())}static fromDate(e){return yo.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*wo);return new yo(t,n)}static fromInstant(e){if(!e||"bigint"!=typeof e.t)throw new eo(Za.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return yo._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,n;if(e>=0n)t=Number(e/1000000000n),n=Number(e%1000000000n);else{const r=e%1000000000n;0n===r?(t=Number(e/1000000000n),n=0):(t=Number(e/1000000000n-1n),n=Number(r+1000000000n))}return new yo(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new eo(Za.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new eo(Za.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Do)throw new eo(Za.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new eo(Za.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/wo}toInstant(){if("undefined"==typeof Temporal||!Temporal.Instant)throw new eo(Za.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?Va(this.nanoseconds,e.nanoseconds):Va(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:yo._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Eo(e,yo._jsonSchema))return new yo(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Do;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}yo._jsonSchemaVersion="firestore/timestamp/1.0",yo._jsonSchema={type:mo("string",yo._jsonSchemaVersion),seconds:mo("number"),nanoseconds:mo("number")};
/**
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
 */
class vo extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
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
 */class _o{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(e){try{return atob(e)}catch(t){throw"undefined"!=typeof DOMException&&t instanceof DOMException?new vo("Invalid base64 string: "+t):t}}(e);return new _o(t)}static fromUint8Array(e){const t=function(e){let t="";for(let n=0;n<e.length;++n)t+=String.fromCharCode(e[n]);return t}(e);return new _o(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Va(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}_o.EMPTY_BYTE_STRING=new _o("");const Io=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function To(e){if(Ma(!!e,39018),"string"==typeof e){let t=0;const n=Io.exec(e);if(Ma(!!n,46558,{timestamp:e}),n[1]){let e=n[1];e=(e+"000000000").substr(0,9),t=Number(e)}const r=new Date(e);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:bo(e.seconds),nanos:bo(e.nanos)}}function bo(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function Ao(e){return"string"==typeof e?_o.fromBase64String(e):_o.fromUint8Array(e)}
/**
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
 */const Oo="server_timestamp",No="__type__",So="__previous_value__",Fo="__local_write_time__";function Lo(e){var t,n;return(null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[No])?void 0:n.stringValue)===Oo}function Ro(e){const t=e.mapValue.fields[So];return Lo(t)?Ro(t):t}function ko(e){const t=To(e.mapValue.fields[Fo].timestampValue);return new yo(t.seconds,t.nanos)}
/**
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
 */class Po{constructor(e,t,n,r,s,i,a,o,B,c,u,l,h){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.longPollingOptions=o,this.useFetchStreams=B,this.isUsingEmulator=c,this.apiKey=u,this._customHeaders=l,this.grpcFlowControlWindow=h}}const xo="(default)";class Mo{constructor(e,t){this.projectId=e,this.database=t||xo}static empty(){return new Mo("","")}get isDefaultDatabase(){return this.database===xo}isEqual(e){return e instanceof Mo&&e.projectId===this.projectId&&e.database===this.database}}function Go(e){return null==e}function Ho(e){return 0===e&&1/e==-1/0}
/**
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
 */
const Uo="__type__",Vo="__max__",Jo={},jo="__vector__",Ko="value",qo={nullValue:"NULL_VALUE"},zo={booleanValue:!0},Qo={booleanValue:!1};function Yo(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?Lo(e)?4:function(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===Vo}
/**
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
 */(e)?9007199254740991:lB(e)?10:11:Pa(28295,{value:e})}function Wo(e,t,n){if(e===t)return!0;const r=Yo(e);if(r!==Yo(t))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return ko(e).isEqual(ko(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;const n=To(e.timestampValue),r=To(t.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return s=t,Ao(e.bytesValue).isEqual(Ao(s.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return function(e,t){return bo(e.geoPointValue.latitude)===bo(t.geoPointValue.latitude)&&bo(e.geoPointValue.longitude)===bo(t.geoPointValue.longitude)}(e,t);case 2:return function(e,t,n){if("integerValue"in e&&"integerValue"in t)return bo(e.integerValue)===bo(t.integerValue);let r,s;if("doubleValue"in e&&"doubleValue"in t)r=bo(e.doubleValue),s=bo(t.doubleValue);else{if(!(null==n?void 0:n.i))return!1;r=bo(e.integerValue??e.doubleValue),s=bo(t.integerValue??t.doubleValue)}return r===s?!!(null==n?void 0:n.o)||Ho(r)===Ho(s):!(void 0!==n&&!n.u)&&isNaN(r)&&isNaN(s)}(e,t,n);case 9:return za(e.arrayValue.values||[],t.arrayValue.values||[],(e,t)=>Wo(e,t,n));case 10:case 11:return function(e,t,n){const r=e.mapValue.fields||{},s=t.mapValue.fields||{};if(oo(r)!==oo(s))return!1;for(const i in r)if(r.hasOwnProperty(i)&&(void 0===s[i]||!Wo(r[i],s[i],n)))return!1;return!0}(e,t,n);default:return Pa(52216,{left:e})}var s}function $o(e,t){return void 0!==(e.values||[]).find(e=>Wo(e,t))}function Xo(e,t){if(e===t)return 0;const n=Yo(e),r=Yo(t);if(n!==r)return Va(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Va(e.booleanValue,t.booleanValue);case 2:return function(e,t){const n=bo(e.integerValue||e.doubleValue),r=bo(t.integerValue||t.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(e,t);case 3:return Zo(e.timestampValue,t.timestampValue);case 4:return Zo(ko(e),ko(t));case 5:return Ja(e.stringValue,t.stringValue);case 6:return function(e,t){const n=Ao(e),r=Ao(t);return n.compareTo(r)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){const n=e.split("/"),r=t.split("/");for(let s=0;s<n.length&&s<r.length;s++){const e=Va(n[s],r[s]);if(0!==e)return e}return Va(n.length,r.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){const n=Va(bo(e.latitude),bo(t.latitude));return 0!==n?n:Va(bo(e.longitude),bo(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return eB(e.arrayValue,t.arrayValue);case 10:return function(e,t){var n,r,s,i;const a=e.fields||{},o=t.fields||{},B=null==(n=a[Ko])?void 0:n.arrayValue,c=null==(r=o[Ko])?void 0:r.arrayValue,u=Va((null==(s=null==B?void 0:B.values)?void 0:s.length)||0,(null==(i=null==c?void 0:c.values)?void 0:i.length)||0);return 0!==u?u:eB(B,c)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===Jo&&t===Jo)return 0;if(e===Jo)return 1;if(t===Jo)return-1;const n=e.fields||{},r=Object.keys(n),s=t.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let a=0;a<r.length&&a<i.length;++a){const e=Ja(r[a],i[a]);if(0!==e)return e;const t=Xo(n[r[a]],s[i[a]]);if(0!==t)return t}return Va(r.length,i.length)}(e.mapValue,t.mapValue);default:throw Pa(23264,{l:n})}}function Zo(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return Va(e,t);const n=To(e),r=To(t),s=Va(n.seconds,r.seconds);return 0!==s?s:Va(n.nanos,r.nanos)}function eB(e,t){const n=e.values||[],r=t.values||[];for(let s=0;s<n.length&&s<r.length;++s){const e=Xo(n[s],r[s]);if(void 0!==e&&0!==e)return e}return Va(n.length,r.length)}function tB(e){return nB(e)}function nB(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const t=To(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?Ao(e.bytesValue).toBase64():"referenceValue"in e?function(e){return uo.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let t="[",n=!0;for(const r of e.values||[])n?n=!1:t+=",",t+=nB(r);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){const t=Object.keys(e.fields||{}).sort();let n="{",r=!0;for(const s of t)r?r=!1:n+=",",n+=`${s}:${nB(e.fields[s])}`;return n+"}"}(e.mapValue):Pa(61005,{value:e})}function rB(e){switch(Yo(e)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=Ro(e);return t?16+rB(t):16;case 5:return 2*e.stringValue.length;case 6:return Ao(e.bytesValue).approximateByteSize();case 7:return e.referenceValue.length;case 9:return(e.arrayValue.values||[]).reduce((e,t)=>e+rB(t),0);case 10:case 11:return function(e){let t=0;return Bo(e.fields,(e,n)=>{t+=e.length+rB(n)}),t}(e.mapValue);default:throw Pa(13486,{value:e})}}function sB(e){return!!e&&"integerValue"in e}function iB(e){return!!e&&"doubleValue"in e}function aB(e){return sB(e)||iB(e)}function oB(e){return!!e&&"arrayValue"in e}function BB(e){return!!e&&"nullValue"in e}function cB(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function uB(e){return!!e&&"mapValue"in e}function lB(e){var t,n;return(null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[Uo])?void 0:n.stringValue)===jo}function hB(e){var t,n;return null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[Ko])?void 0:n.arrayValue}function CB(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){const t={mapValue:{fields:{}}};return Bo(e.mapValue.fields,(e,n)=>t.mapValue.fields[e]=CB(n)),t}if(e.arrayValue){const t={arrayValue:{values:[]}};for(let n=0;n<(e.arrayValue.values||[]).length;++n)t.arrayValue.values[n]=CB(e.arrayValue.values[n]);return t}return{...e}}class dB{constructor(e){this.value=e}static empty(){return new dB({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!uB(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=CB(t)}setAll(e){let t=io.emptyPath(),n={},r=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){const e=this.getFieldsMap(t);this.applyChanges(e,n,r),n={},r=[],t=s.popLast()}e?n[s.lastSegment()]=CB(e):r.push(s.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,n,r)}delete(e){const t=this.field(e.popLast());uB(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Wo(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=t.mapValue.fields[e.get(n)];uB(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,n){Bo(t,(t,n)=>e[t]=n);for(const r of n)delete e[r]}clone(){return new dB(CB(this.value))}}function pB(e){const t=[];return Bo(e.fields,(e,n)=>{const r=new io([e]);if(uB(n)){const e=pB(n.mapValue).fields;if(0===e.length)t.push(r);else for(const n of e)t.push(r.child(n))}else t.push(r)}),new ao(t)
/**
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
 */}function fB(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ho(t)?"-0":t}}function gB(e){return{integerValue:""+e}}function mB(e,t,n){return function(e){return"number"==typeof e&&Number.isInteger(e)&&!Ho(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}(t)?gB(t):fB(e,t)}
/**
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
 */class EB{constructor(){this._=void 0}}function DB(e,t,n){return e instanceof vB?function(e,t){const n={fields:{[No]:{stringValue:Oo},[Fo]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&Lo(t)&&(t=Ro(t)),t&&(n.fields[So]=t),{mapValue:n}}(n,t):e instanceof _B?IB(e,t):e instanceof TB?bB(e,t):e instanceof OB?function(e,t){const n=yB(e,t),r=LB(n)+LB(e.h);return sB(n)&&sB(e.h)?gB(r):fB(e.serializer,r)}(e,t):e instanceof NB?FB(e,t,Math.min):e instanceof SB?function(e,t){return FB(e,t,Math.max)}(e,t):void 0}function wB(e,t,n){return e instanceof _B?IB(e,t):e instanceof TB?bB(e,t):n}function yB(e,t){return e instanceof OB?aB(t)?t:{integerValue:0}:null}class vB extends EB{}class _B extends EB{constructor(e){super(),this.elements=e}}function IB(e,t){const n=RB(t);for(const r of e.elements)n.some(e=>Wo(e,r))||n.push(r);return{arrayValue:{values:n}}}class TB extends EB{constructor(e){super(),this.elements=e}}function bB(e,t){let n=RB(t);for(const r of e.elements)n=n.filter(e=>!Wo(e,r));return{arrayValue:{values:n}}}class AB extends EB{constructor(e,t){super(),this.serializer=e,this.h=t}}class OB extends AB{}class NB extends AB{}class SB extends AB{}function FB(e,t,n){if(!aB(t))return e.h;const r=n(LB(t),LB(e.h));return sB(t)&&sB(e.h)?gB(r):fB(e.serializer,r)}function LB(e){return bo(e.integerValue||e.doubleValue)}function RB(e){return oB(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}
/**
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
 */class kB{constructor(e,t){this.field=e,this.transform=t}}class PB{constructor(e,t){this.version=e,this.transformResults=t}}class xB{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new xB}static exists(e){return new xB(void 0,e)}static updateTime(e){return new xB(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function MB(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class GB{}function HB(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new WB(e.key,xB.none()):new KB(e.key,e.data,xB.none());{const n=e.data,r=dB.empty();let s=new $a(io.comparator);for(let e of t.fields)if(!s.has(e)){let t=n.field(e);null===t&&e.length>1&&(e=e.popLast(),t=n.field(e)),null===t?r.delete(e):r.set(e,t),s=s.add(e)}return new qB(e.key,r,new ao(s.toArray()),xB.none())}}function UB(e,t,n){var r;e instanceof KB?function(e,t,n){const r=e.value.clone(),s=QB(e.fieldTransforms,t,n.transformResults);r.setAll(s),t.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(e,t,n):e instanceof qB?function(e,t,n){if(!MB(e.precondition,t))return void t.convertToUnknownDocument(n.version);const r=QB(e.fieldTransforms,t,n.transformResults),s=t.data;s.setAll(zB(e)),s.setAll(r),t.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(e,t,n):(r=n,t.convertToNoDocument(r.version).setHasCommittedMutations())}function VB(e,t,n,r){return e instanceof KB?function(e,t,n,r){if(!MB(e.precondition,t))return n;const s=e.value.clone(),i=YB(e.fieldTransforms,r,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,n,r):e instanceof qB?function(e,t,n,r){if(!MB(e.precondition,t))return n;const s=YB(e.fieldTransforms,r,t),i=t.data;return i.setAll(zB(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===n?null:n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,n,r):(s=t,i=n,MB(e.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):i);var s,i}function JB(e,t){let n=null;for(const r of e.fieldTransforms){const e=t.data.field(r.field),s=yB(r.transform,e||null);null!=s&&(null===n&&(n=dB.empty()),n.set(r.field,s))}return n||null}function jB(e,t){return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(n=e.fieldTransforms,r=t.fieldTransforms,!!(void 0===n&&void 0===r||n&&r&&za(n,r,(e,t)=>function(e,t){return e.field.isEqual(t.field)&&(n=e.transform,r=t.transform,n instanceof _B&&r instanceof _B||n instanceof TB&&r instanceof TB?za(n.elements,r.elements,Wo):n instanceof OB&&r instanceof OB||n instanceof NB&&r instanceof NB||n instanceof SB&&r instanceof SB?Wo(n.h,r.h):n instanceof vB&&r instanceof vB);var n,r}(e,t)))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask)));var n,r}class KB extends GB{constructor(e,t,n,r=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class qB extends GB{constructor(e,t,n,r,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function zB(e){const t=new Map;return e.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=e.data.field(n);t.set(n,r)}}),t}function QB(e,t,n){const r=new Map;Ma(e.length===n.length,32656,{T:n.length,P:e.length});for(let s=0;s<n.length;s++){const i=e[s],a=i.transform,o=t.data.field(i.field);r.set(i.field,wB(a,o,n[s]))}return r}function YB(e,t,n){const r=new Map;for(const s of e){const e=s.transform,i=n.data.field(s.field);r.set(s.field,DB(e,i,t))}return r}class WB extends GB{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class $B extends GB{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
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
 */class XB{constructor(e,t){this.position=e,this.inclusive=t}}function ZB(e,t,n){let r=0;for(let s=0;s<e.position.length;s++){const i=t[s],a=e.position[s];if(r=i.field.isKeyField()?uo.comparator(uo.fromName(a.referenceValue),n.key):Xo(a,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function ec(e,t){if(null===e)return null===t;if(null===t)return!1;if(e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let n=0;n<e.position.length;n++)if(!Wo(e.position[n],t.position[n]))return!1;return!0}
/**
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
 */class tc{}class nc extends tc{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,n):new cc(e,t,n):"array-contains"===t?new Cc(e,n):"in"===t?new dc(e,n):"not-in"===t?new pc(e,n):"array-contains-any"===t?new fc(e,n):new nc(e,t,n)}static createKeyFieldInFilter(e,t,n){return"in"===t?new uc(e,n):new lc(e,n)}matches(e){const t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(Xo(t,this.value)):null!==t&&Yo(this.value)===Yo(t)&&this.matchesComparison(Xo(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return Pa(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class rc extends tc{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new rc(e,t)}matches(e){return sc(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.I||(this.I=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function sc(e){return"and"===e.op}function ic(e){return function(e){for(const t of e.filters)if(t instanceof rc)return!1;return!0}(e)&&sc(e)}function ac(e){if(e instanceof nc)return e.field.canonicalString()+e.op.toString()+tB(e.value);if(ic(e))return e.filters.map(e=>ac(e)).join(",");{const t=e.filters.map(e=>ac(e)).join(",");return`${e.op}(${t})`}}function oc(e,t){return e instanceof nc?(n=e,(r=t)instanceof nc&&n.op===r.op&&n.field.isEqual(r.field)&&Wo(n.value,r.value)):e instanceof rc?function(e,t){return t instanceof rc&&e.op===t.op&&e.filters.length===t.filters.length&&e.filters.reduce((e,n,r)=>e&&oc(n,t.filters[r]),!0)}(e,t):void Pa(19439);var n,r}function Bc(e){return e instanceof nc?`${(t=e).field.canonicalString()} ${t.op} ${tB(t.value)}`:e instanceof rc?function(e){return e.op.toString()+" {"+e.getFilters().map(Bc).join(" ,")+"}"}(e):"Filter";var t}class cc extends nc{constructor(e,t,n){super(e,t,n),this.key=uo.fromName(n.referenceValue)}matches(e){const t=uo.comparator(e.key,this.key);return this.matchesComparison(t)}}class uc extends nc{constructor(e,t){super(e,"in",t),this.keys=hc("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class lc extends nc{constructor(e,t){super(e,"not-in",t),this.keys=hc("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function hc(e,t){var n;return((null==(n=t.arrayValue)?void 0:n.values)||[]).map(e=>uo.fromName(e.referenceValue))}class Cc extends nc{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return oB(t)&&$o(t.arrayValue,this.value)}}class dc extends nc{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return null!==t&&$o(this.value.arrayValue,t)}}class pc extends nc{constructor(e,t){super(e,"not-in",t)}matches(e){if($o(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!$o(this.value.arrayValue,t)}}class fc extends nc{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!oB(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>$o(this.value.arrayValue,e))}}
/**
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
 */class gc{constructor(e,t="asc"){this.field=e,this.dir=t}}function mc(e,t){return e.dir===t.dir&&e.field.isEqual(t.field)}
/**
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
 */class Ec{static fromTimestamp(e){return new Ec(e)}static min(){return new Ec(new yo(0,0))}static max(){return new Ec(new yo(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
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
 */class Dc{constructor(e,t,n,r,s,i,a){this.key=e,this.documentType=t,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=a}static newInvalidDocument(e){return new Dc(e,0,Ec.min(),Ec.min(),Ec.min(),dB.empty(),0)}static newFoundDocument(e,t,n,r){return new Dc(e,1,t,Ec.min(),n,r,0)}static newNoDocument(e,t){return new Dc(e,2,t,Ec.min(),Ec.min(),dB.empty(),0)}static newUnknownDocument(e,t){return new Dc(e,3,t,Ec.min(),Ec.min(),dB.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(Ec.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=dB.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=dB.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Ec.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof Dc&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Dc(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
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
 */function wc(e){return new yc(e.readTime,e.key,-1)}class yc{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new yc(Ec.min(),uo.empty(),-1)}static max(){return new yc(Ec.max(),uo.empty(),-1)}}function vc(e,t){let n=e.readTime.compareTo(t.readTime);return 0!==n?n:(n=uo.comparator(e.documentKey,t.documentKey),0!==n?n:Va(e.largestBatchId,t.largestBatchId)
/**
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
 */)}class _c{constructor(e,t=null,n=[],r=[],s=null,i=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=a,this.R=null}}function Ic(e,t=null,n=[],r=[],s=null,i=null,a=null){return new _c(e,t,n,r,s,i,a)}function Tc(e){const t=Ga(e);if(null===t.R){let e=t.path.canonicalString();null!==t.collectionGroup&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(e=>ac(e)).join(","),e+="|ob:",e+=t.orderBy.map(e=>{return(t=e).field.canonicalString()+t.dir;var t}).join(","),Go(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(e=>tB(e)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(e=>tB(e)).join(",")),t.R=e}return t.R}function bc(e,t){if(e.limit!==t.limit)return!1;if(e.orderBy.length!==t.orderBy.length)return!1;for(let n=0;n<e.orderBy.length;n++)if(!mc(e.orderBy[n],t.orderBy[n]))return!1;if(e.filters.length!==t.filters.length)return!1;for(let n=0;n<e.filters.length;n++)if(!oc(e.filters[n],t.filters[n]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!ec(e.startAt,t.startAt)&&ec(e.endAt,t.endAt)}function Ac(e){return!!e.isCorePipeline}function Oc(e){return!!e.path&&uo.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}
/**
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
 */class Nc{constructor(e,t=null,n=[],r=[],s=null,i="F",a=null,o=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function Sc(e){return new Nc(e)}function Fc(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function Lc(e){const t=Ga(e);if(null===t.A){t.A=[];const e=new Set;for(const r of t.explicitOrderBy)t.A.push(r),e.add(r.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(e){let t=new $a(io.comparator);return e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t})(t).forEach(r=>{e.has(r.canonicalString())||r.isKeyField()||t.A.push(new gc(r,n))}),e.has(io.keyField().canonicalString())||t.A.push(new gc(io.keyField(),n))}return t.A}function Rc(e){const t=Ga(e);return t.V||(t.V=function(e,t){if("F"===e.limitType)return Ic(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{const t="desc"===e.dir?"asc":"desc";return new gc(e.field,t)});const n=e.endAt?new XB(e.endAt.position,e.endAt.inclusive):null,r=e.startAt?new XB(e.startAt.position,e.startAt.inclusive):null;return Ic(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}}(t,Lc(e))),t.V}function kc(e,t,n){return new Nc(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,n,e.startAt,e.endAt)}function Pc(e){return`Query(target=${function(e){let t=e.path.canonicalString();return null!==e.collectionGroup&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map(e=>Bc(e)).join(", ")}]`),Go(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map(e=>{return`${(t=e).field.canonicalString()} (${t.dir})`;var t}).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(e=>tB(e)).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(e=>tB(e)).join(",")),`Target(${t})`}(Rc(e))}; limitType=${e.limitType})`}function xc(e,t){return t.isFoundDocument()&&function(e,t){const n=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(n):uo.isDocumentKey(e.path)?e.path.isEqual(n):e.path.isImmediateParentOf(n)}(e,t)&&function(e,t){for(const n of Lc(e))if(!n.field.isKeyField()&&null===t.data.field(n.field))return!1;return!0}(e,t)&&function(e,t){for(const n of e.filters)if(!n.matches(t))return!1;return!0}(e,t)&&(r=t,!((n=e).startAt&&!function(e,t,n){const r=ZB(e,t,n);return e.inclusive?r<=0:r<0}(n.startAt,Lc(n),r)||n.endAt&&!function(e,t,n){const r=ZB(e,t,n);return e.inclusive?r>=0:r>0}(n.endAt,Lc(n),r)));var n,r}function Mc(e){return(t,n)=>{let r=!1;for(const s of Lc(e)){const e=Gc(s,t,n);if(0!==e)return e;r=r||s.field.isKeyField()}return 0}}function Gc(e,t,n){const r=e.field.isKeyField()?uo.comparator(t.key,n.key):function(e,t,n){const r=t.data.field(e),s=n.data.field(e);return null!==r&&null!==s?Xo(r,s):Pa(42886)}(e.field,t,n);switch(e.dir){case"asc":return r;case"desc":return-1*r;default:return Pa(19790,{direction:e.dir})}}
/**
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
 */class Hc{constructor(e,t){this.count=e,this.unchangedNames=t}}
/**
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
 */var Uc,Vc;function Jc(e){if(void 0===e)return La("GRPC error has no .code"),Za.UNKNOWN;switch(e){case Uc.OK:return Za.OK;case Uc.CANCELLED:return Za.CANCELLED;case Uc.UNKNOWN:return Za.UNKNOWN;case Uc.DEADLINE_EXCEEDED:return Za.DEADLINE_EXCEEDED;case Uc.RESOURCE_EXHAUSTED:return Za.RESOURCE_EXHAUSTED;case Uc.INTERNAL:return Za.INTERNAL;case Uc.UNAVAILABLE:return Za.UNAVAILABLE;case Uc.UNAUTHENTICATED:return Za.UNAUTHENTICATED;case Uc.INVALID_ARGUMENT:return Za.INVALID_ARGUMENT;case Uc.NOT_FOUND:return Za.NOT_FOUND;case Uc.ALREADY_EXISTS:return Za.ALREADY_EXISTS;case Uc.PERMISSION_DENIED:return Za.PERMISSION_DENIED;case Uc.FAILED_PRECONDITION:return Za.FAILED_PRECONDITION;case Uc.ABORTED:return Za.ABORTED;case Uc.OUT_OF_RANGE:return Za.OUT_OF_RANGE;case Uc.UNIMPLEMENTED:return Za.UNIMPLEMENTED;case Uc.DATA_LOSS:return Za.DATA_LOSS;default:return Pa(39323,{code:e})}}(Vc=Uc||(Uc={}))[Vc.OK=0]="OK",Vc[Vc.CANCELLED=1]="CANCELLED",Vc[Vc.UNKNOWN=2]="UNKNOWN",Vc[Vc.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Vc[Vc.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Vc[Vc.NOT_FOUND=5]="NOT_FOUND",Vc[Vc.ALREADY_EXISTS=6]="ALREADY_EXISTS",Vc[Vc.PERMISSION_DENIED=7]="PERMISSION_DENIED",Vc[Vc.UNAUTHENTICATED=16]="UNAUTHENTICATED",Vc[Vc.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Vc[Vc.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Vc[Vc.ABORTED=10]="ABORTED",Vc[Vc.OUT_OF_RANGE=11]="OUT_OF_RANGE",Vc[Vc.UNIMPLEMENTED=12]="UNIMPLEMENTED",Vc[Vc.INTERNAL=13]="INTERNAL",Vc[Vc.UNAVAILABLE=14]="UNAVAILABLE",Vc[Vc.DATA_LOSS=15]="DATA_LOSS";
/**
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
 */
class jc{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,e))return s}has(e){return void 0!==this.get(e)}set(e,t){const n=this.mapKeyFn(e),r=this.inner[n];if(void 0===r)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return 1===n.length?delete this.inner[t]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Bo(this.inner,(t,n)=>{for(const[r,s]of n)e(r,s)})}isEmpty(){return co(this.inner)}size(){return this.innerSize}}
/**
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
 */const Kc=new Qa(uo.comparator);function qc(){return Kc}const zc=new Qa(uo.comparator);function Qc(...e){let t=zc;for(const n of e)t=t.insert(n.key,n);return t}function Yc(e){let t=zc;return e.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function Wc(){return Xc()}function $c(){return Xc()}function Xc(){return new jc(e=>e.toString(),(e,t)=>e.isEqual(t))}const Zc=new Qa(uo.comparator),eu=new $a(uo.comparator);function tu(...e){let t=eu;for(const n of e)t=t.add(n);return t}const nu=new $a(Va);
/**
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
 */
const ru=new xs([4294967295,4294967295],0);function su(e){const t=(new TextEncoder).encode(e),n=new Ms;return n.update(t),new Uint8Array(n.digest())}function iu(e){const t=new DataView(e.buffer),n=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new xs([n,r],0),new xs([s,i],0)]}class au{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new ou(`Invalid padding: ${t}`);if(n<0)throw new ou(`Invalid hash count: ${n}`);if(e.length>0&&0===this.hashCount)throw new ou(`Invalid hash count: ${n}`);if(0===e.length&&0!==t)throw new ou(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=xs.fromNumber(this.p)}v(e,t,n){let r=e.add(t.multiply(xs.fromNumber(n)));return 1===r.compare(ru)&&(r=new xs([r.getBits(0),r.getBits(1)],0)),r.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.p)return!1;const t=su(e),[n,r]=iu(t);for(let s=0;s<this.hashCount;s++){const e=this.v(n,r,s);if(!this.D(e))return!1}return!0}static create(e,t,n){const r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new au(s,r,t);return n.forEach(e=>i.insert(e)),i}insert(e){if(0===this.p)return;const t=su(e),[n,r]=iu(t);for(let s=0;s<this.hashCount;s++){const e=this.v(n,r,s);this.C(e)}}C(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class ou extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
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
 */class Bu{constructor(e,t,n,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=r,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const r=new Map;return r.set(e,cu.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new Bu(Ec.min(),r,new Qa(Va),qc(),qc(),tu())}}class cu{constructor(e,t,n,r,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new cu(n,t,tu(),tu(),tu())}}
/**
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
 */class uu{constructor(e,t,n,r){this.F=e,this.removedTargetIds=t,this.key=n,this.O=r}}class lu{constructor(e,t){this.targetId=e,this.M=t}}class hu{constructor(e,t,n=_o.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=r}}class Cu{constructor(e){this.targetId=e,this.N=0,this.L=gu(),this.B=_o.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return 0!==this.N}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=tu(),t=tu(),n=tu();return this.L.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:n=n.add(r);break;default:Pa(38017,{changeType:s})}}),new cu(this.B,this.U,e,t,n)}G(){this.k=!1,this.L=gu()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,Ma(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const du="WatchChangeAggregator";class pu{constructor(e){this.X=e,this.ee=new Map,this.te=qc(),this.ne=fu(),this.re=qc(),this.ie=fu(),this.se=new Qa(Va)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,t=>{const n=this.ee.get(t);if(n)switch(e.state){case 0:this.ce(t)&&n.K(e.resumeToken);break;case 1:n.Y(),n.q||n.G(),n.K(e.resumeToken);break;case 2:n.Y(),n.q||this.removeTarget(t);break;case 3:this.ce(t)&&(n.Z(),n.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),n.K(e.resumeToken));break;default:Pa(56790,{state:e.state})}else Fa(du,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach((e,n)=>{this.ce(n)&&t(n)})}Ee(e){var t;return Ac(e)?"documents"===e.getPipelineSourceType()&&1===(null==(t=e.getPipelineDocuments())?void 0:t.length):Oc(e)}he(e){const t=e.targetId,n=e.M.count,r=this.Te(t);if(r){const s=r.target;if(this.Ee(s))if(0===n){const e=new uo(Ac(s)?ro.fromString(s.getPipelineDocuments()[0]):s.path);this.ae(t,e,Dc.newNoDocument(e,Ec.min()))}else Ma(1===n,20013,"Single document existence filter with count: "+n);else{const r=this.Pe(t);if(r!==n){const n=this.Ie(e),s=n?this.Re(n,e,r):1;if(0!==s){this.le(t);const e=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,e)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=t;let i,a;try{i=Ao(n).toUint8Array()}catch(o){if(o instanceof vo)return Ra("Decoding the base64 bloom filter in existence filter failed ("+o.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw o}try{a=new au(i,r,s)}catch(o){return Ra(o instanceof ou?"BloomFilter error: ":"Applying bloom filter failed: ",o),null}return 0===a.p?null:a}Re(e,t,n){return t.M.count===n-this.de(e,t.targetId)?0:2}de(e,t){const n=this.X.getRemoteKeysForTarget(t);let r=0;return n.forEach(n=>{const s=this.X.Ve(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;e.mightContain(i)||(this.ae(t,n,null),r++)}),r}fe(e){const t=new Map;this.ee.forEach((n,r)=>{const s=this.Te(r);if(s){if(n.current&&this.Ee(s.target)){const t=Ac(s.target)?ro.fromString(s.target.getPipelineDocuments()[0]):s.target.path,n=new uo(t);this.me(n).has(r)||this.pe(r,n)||this.ae(r,n,Dc.newNoDocument(n,e))}n.$&&(t.set(r,n.W()),n.G())}});let n=tu();this.ie.forEach((e,t)=>{let r=!0;t.forEachWhile(e=>{const t=this.Te(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(r=!1,!1)}),r&&(n=n.add(e))}),this.te.forEach((t,n)=>n.setReadTime(e)),this.re.forEach((t,n)=>n.setReadTime(e));const r=new Bu(e,t,this.se,this.te,this.re,n);return this.te=qc(),this.ne=fu(),this.re=qc(),this.ie=fu(),this.se=new Qa(Va),r}oe(e,t){const n=this.ee.get(e);if(!n||!this.ce(e))return void Fa(du,`addDocumentToTarget received document for unknown inactive target (${e})`);const r=this.pe(e,t.key)?2:0;n.j(t.key,r),Ac(this.Te(e).target)&&"exact"!==this.Te(e).target.getPipelineFlavor()?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,n){const r=this.ee.get(e);r&&this.ce(e)?(this.pe(e,t)?r.j(t,1):r.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),n&&(Ac(this.Te(e).target)&&"exact"!==this.Te(e).target.getPipelineFlavor()?this.re=this.re.insert(t,n):this.te=this.te.insert(t,n))):Fa(du,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const n=t.W();return this.X.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}J(e){let t=this.ee.get(e);t||(Fa(du,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Cu(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new $a(Va),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new $a(Va),this.ne=this.ne.insert(e,t)),t}ce(e){const t=null!==this.Te(e);return t||Fa(du,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return void 0===t||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new Cu(e)),this.X.getRemoteKeysForTarget(e).forEach(t=>{this.ae(e,t,null)})}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function fu(){return new Qa(uo.comparator)}function gu(){return new Qa(uo.comparator)}const mu=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),Eu=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),Du=(()=>({and:"AND",or:"OR"}))();class wu{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function yu(e,t){return e.useProto3Json||Go(t)?t:{value:t}}function vu(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function _u(e){const t=To(e);return new yo(t.seconds,t.nanos)}function Iu(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function Tu(e,t){return vu(e,t.toTimestamp())}function bu(e){return Ma(!!e,49232),Ec.fromTimestamp(_u(e))}function Au(e,t){return Ou(e,t).canonicalString()}function Ou(e,t){const n=(r=e,new ro(["projects",r.projectId,"databases",r.database])).child("documents");var r;return void 0===t?n:n.child(t)}function Nu(e){const t=ro.fromString(e);return Ma(Yu(t),10190,{key:t.toString()}),t}function Su(e,t){return Au(e.databaseId,t.path)}function Fu(e,t){const n=Nu(t);if(n.get(1)!==e.databaseId.projectId)throw new eo(Za.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+e.databaseId.projectId);if(n.get(3)!==e.databaseId.database)throw new eo(Za.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+e.databaseId.database);return new uo(ku(n))}function Lu(e,t){return Au(e.databaseId,t)}function Ru(e){return new ro(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function ku(e){return Ma(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function Pu(e,t,n){return{name:Su(e,t),fields:n.value.mapValue.fields}}function xu(e,t){return{documents:[Lu(e,t.path)]}}function Mu(e,t){const n={structuredQuery:{}},r=t.path;let s;null!==t.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Lu(e,s);const i=function(e){if(0!==e.length)return zu(rc.create(e,"and"))}(t.filters);i&&(n.structuredQuery.where=i);const a=function(e){if(0!==e.length)return e.map(e=>{return{field:Ku((t=e).field),direction:Vu(t.dir)};var t})}(t.orderBy);a&&(n.structuredQuery.orderBy=a);const o=yu(e,t.limit);return null!==o&&(n.structuredQuery.limit=o),t.startAt&&(n.structuredQuery.startAt={before:(B=t.startAt).inclusive,values:B.position}),t.endAt&&(n.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(t.endAt)),{Se:n,parent:s};var B}function Gu(e){let t=function(e){const t=Nu(e);return 4===t.length?ro.emptyPath():ku(t)}(e.parent);const n=e.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Ma(1===r,65062);const e=n.from[0];e.allDescendants?s=e.collectionId:t=t.child(e.collectionId)}let i=[];n.where&&(i=function(e){const t=Uu(e);return t instanceof rc&&ic(t)?t.getFilters():[t]}(n.where));let a=[];n.orderBy&&(a=n.orderBy.map(e=>{return new gc(qu((t=e).field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction));var t}));let o=null;n.limit&&(o=function(e){let t;return t="object"==typeof e?e.value:e,Go(t)?null:t}(n.limit));let B=null;n.startAt&&(B=function(e){const t=!!e.before,n=e.values||[];return new XB(n,t)}(n.startAt));let c=null;return n.endAt&&(c=function(e){const t=!e.before,n=e.values||[];return new XB(n,t)}(n.endAt)),function(e,t,n,r,s,i,a,o){return new Nc(e,t,n,r,s,i,a,o)}(t,s,a,i,o,"F",B,c)}function Hu(e,t){return{structuredPipeline:{pipeline:{stages:t.stages.map(t=>t._toProto(e))}}}}function Uu(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=qu(e.unaryFilter.field);return nc.create(t,"==",{doubleValue:NaN});case"IS_NULL":const n=qu(e.unaryFilter.field);return nc.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=qu(e.unaryFilter.field);return nc.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=qu(e.unaryFilter.field);return nc.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Pa(61313);default:return Pa(60726)}}(e):void 0!==e.fieldFilter?(t=e,nc.create(qu(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Pa(58110);default:return Pa(50506)}}(t.fieldFilter.op),t.fieldFilter.value)):void 0!==e.compositeFilter?function(e){return rc.create(e.compositeFilter.filters.map(e=>Uu(e)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return Pa(1026)}}(e.compositeFilter.op))}(e):Pa(30097,{filter:e});var t}function Vu(e){return mu[e]}function Ju(e){return Eu[e]}function ju(e){return Du[e]}function Ku(e){return{fieldPath:e.canonicalString()}}function qu(e){return io.fromServerFormat(e.fieldPath)}function zu(e){return e instanceof nc?function(e){if("=="===e.op){if(cB(e.value))return{unaryFilter:{field:Ku(e.field),op:"IS_NAN"}};if(BB(e.value))return{unaryFilter:{field:Ku(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(cB(e.value))return{unaryFilter:{field:Ku(e.field),op:"IS_NOT_NAN"}};if(BB(e.value))return{unaryFilter:{field:Ku(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ku(e.field),op:Ju(e.op),value:e.value}}}(e):e instanceof rc?function(e){const t=e.getFilters().map(e=>zu(e));return 1===t.length?t[0]:{compositeFilter:{op:ju(e.op),filters:t}}}(e):Pa(54877,{filter:e})}function Qu(e){const t=[];return e.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function Yu(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}function Wu(e){return!!e&&"function"==typeof e._toProto&&"ProtoValue"===e._protoValueType}function $u(e,t){const n={fields:{}};return t.forEach((t,r)=>{if("string"!=typeof r)throw new Error(`Cannot encode map with non-string key: ${r}`);n.fields[r]=t._toProto(e)}),{mapValue:n}}function Xu(e){return{stringValue:e}}
/**
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
 */function Zu(e){return new wu(e,!0)}
/**
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
 */class el{constructor(e){this._byteString=e}static fromBase64String(e){try{return new el(_o.fromBase64String(e))}catch(t){throw new eo(Za.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new el(_o.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:el._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Eo(e,el._jsonSchema))return el.fromBase64String(e.bytes)}}el._jsonSchemaVersion="firestore/bytes/1.0",el._jsonSchema={type:mo("string",el._jsonSchemaVersion),bytes:mo("string")};
/**
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
 */
class tl{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new eo(Za.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new io(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
/**
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
 */
class nl{constructor(e){this._methodName=e}}
/**
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
 */class rl{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new eo(Za.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new eo(Za.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Va(this._lat,e._lat)||Va(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:rl._jsonSchemaVersion}}static fromJSON(e){if(Eo(e,rl._jsonSchema))return new rl(e.latitude,e.longitude)}}rl._jsonSchemaVersion="firestore/geoPoint/1.0",rl._jsonSchema={type:mo("string",rl._jsonSchemaVersion),latitude:mo("number"),longitude:mo("number")};
/**
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
 */
class sl{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}sl.UNAUTHENTICATED=new sl(null),sl.GOOGLE_CREDENTIALS=new sl("google-credentials-uid"),sl.FIRST_PARTY=new sl("first-party-uid"),sl.MOCK_USER=new sl("mock-user");
/**
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
 */
class il{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}
/**
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
 */class al{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ol{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(sl.UNAUTHENTICATED))}shutdown(){}}class Bl{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class cl{constructor(e){this.De=e,this.currentUser=sl.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ma(void 0===this.Ce,42304);let n=this.xe;const r=e=>this.xe!==n?(n=this.xe,t(e)):Promise.resolve();let s=new il;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),s.resolve(),s=new il,e.enqueueRetryable(()=>r(this.currentUser))};const i=()=>{const t=s;e.enqueueRetryable(async()=>{await t.promise,await r(this.currentUser)})},a=e=>{Fa("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),i())};this.De.onInit(e=>a(e)),setTimeout(()=>{if(!this.auth){const e=this.De.getImmediate({optional:!0});e?a(e):(Fa("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new il)}},0),i()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.xe!==e?(Fa("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(Ma("string"==typeof t.accessToken,31837,{Oe:t}),new al(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return Ma(null===e||"string"==typeof e,2055,{Me:e}),new sl(e)}}class ul{constructor(e,t,n){this.Ne=e,this.Le=t,this.Be=n,this.type="FirstParty",this.user=sl.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class ll{constructor(e,t,n){this.Ne=e,this.Le=t,this.Be=n}getToken(){return Promise.resolve(new ul(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable(()=>t(sl.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class hl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Cl{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Xe(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){Ma(void 0===this.Ce,3512);const n=e=>{null!=e.error&&Fa("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const n=e.token!==this.$e;return this.$e=e.token,Fa("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?t(e.token):Promise.resolve()};this.Ce=t=>{e.enqueueRetryable(()=>n(t))};const r=e=>{Fa("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit(e=>r(e)),setTimeout(()=>{if(!this.appCheck){const e=this.qe.getImmediate({optional:!0});e?r(e):Fa("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.Ke)return Promise.resolve(new hl(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(Ma("string"==typeof e.token,44558,{tokenResult:e}),this.$e=e.token,new hl(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function dl(e){const t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t
/**
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
 */}class pl{Qe(e){}shutdown(){}}
/**
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
 */const fl="ConnectivityMonitor";class gl{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){Fa(fl,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){Fa(fl,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
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
 */let ml=null;function El(){return null===ml?ml=268435456+Math.round(2147483648*Math.random()):ml++,"0x"+ml.toString(16)
/**
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
 */}const Dl="RestConnection",wl={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class yl{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${n}/databases/${r}`,this.tt=this.databaseId.database===xo?`project_id=${n}`:`project_id=${n}&database_id=${r}`}nt(e,t,n,r,s){const i=El(),a=this.rt(e,t.toUriEncodedString());Fa(Dl,`Sending RPC '${e}' ${i}:`,a,n);const o={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(o,r,s);const{host:B}=new URL(a),c=G(B);return this.st(e,a,o,n,c).then(t=>(Fa(Dl,`Received RPC '${e}' ${i}: `,t),t),t=>{throw Ra(Dl,`RPC '${e}' ${i} failed with error: `,t,"url: ",a,"request:",n),t})}_t(e,t,n,r,s,i){return this.nt(e,t,n,r,s)}it(e,t,n){if(e["X-Goog-Api-Client"]="gl-js/ fire/"+Aa,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,n)=>e[n]=t),n&&n.headers.forEach((t,n)=>e[n]=t),this.databaseInfo._customHeaders)for(const r of Object.keys(this.databaseInfo._customHeaders))e[r]=this.databaseInfo._customHeaders[r]}rt(e,t){const n=wl[e];let r=`${this.Xe}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}}
/**
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
 */class vl{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}
/**
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
 */const _l="WebChannelConnection",Il=(e,t,n)=>{e.listen(t,e=>{try{n(e)}catch(t){setTimeout(()=>{throw t},0)}})};class Tl extends yl{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!Tl.yt){const e=qs();Il(e,Ks.STAT_EVENT,e=>{e.stat===js.PROXY?Fa(_l,"STAT_EVENT: detected buffering proxy"):e.stat===js.NOPROXY&&Fa(_l,"STAT_EVENT: detected no buffering proxy")}),Tl.yt=!0}}st(e,t,n,r,s){const i=El();return new Promise((s,a)=>{const o=new Hs;o.setWithCredentials(!0),o.listenOnce(Vs.COMPLETE,()=>{try{switch(o.getLastErrorCode()){case Js.NO_ERROR:const t=o.getResponseJson();Fa(_l,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case Js.TIMEOUT:Fa(_l,`RPC '${e}' ${i} timed out`),a(new eo(Za.DEADLINE_EXCEEDED,"Request time out"));break;case Js.HTTP_ERROR:const n=o.getStatus();if(Fa(_l,`RPC '${e}' ${i} failed with status:`,n,"response text:",o.getResponseText()),n>0){let e=o.getResponseJson();Array.isArray(e)&&(e=e[0]);const t=null==e?void 0:e.error;if(t&&t.status&&t.message){const e=function(e){const t=e.toLowerCase().replace(/_/g,"-");return Object.values(Za).indexOf(t)>=0?t:Za.UNKNOWN}(t.status);a(new eo(e,t.message))}else a(new eo(Za.UNKNOWN,"Server responded with status "+o.getStatus()))}else a(new eo(Za.UNAVAILABLE,"Connection failed."));break;default:Pa(9055,{wt:e,streamId:i,bt:o.getLastErrorCode(),St:o.getLastError()})}}finally{Fa(_l,`RPC '${e}' ${i} completed.`)}});const B=JSON.stringify(r);Fa(_l,`RPC '${e}' ${i} sending request:`,r),o.send(t,"POST",B,n,15)})}vt(e,t,n){const r=El(),s=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},o=this.longPollingOptions.timeoutSeconds;void 0!==o&&(a.longPollingTimeout=Math.round(1e3*o)),this.useFetchStreams&&(a.useFetchStreams=!0),this.it(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const B=s.join("");Fa(_l,`Creating RPC '${e}' stream ${r}: ${B}`,a);const c=i.createWebChannel(B,a);this.Dt(c);let u=!1,l=!1;const h=new vl({ot:t=>{l?Fa(_l,`Not sending because RPC '${e}' stream ${r} is closed:`,t):(u||(Fa(_l,`Opening RPC '${e}' stream ${r} transport.`),c.open(),u=!0),Fa(_l,`RPC '${e}' stream ${r} sending:`,t),c.send(t))},ut:()=>c.close()});return Il(c,Us.EventType.OPEN,()=>{l||(Fa(_l,`RPC '${e}' stream ${r} transport opened.`),h.Rt())}),Il(c,Us.EventType.CLOSE,()=>{l||(l=!0,Fa(_l,`RPC '${e}' stream ${r} transport closed`),h.Vt(),this.xt(c))}),Il(c,Us.EventType.ERROR,t=>{l||(l=!0,Ra(_l,`RPC '${e}' stream ${r} transport errored. Name:`,t.name,"Message:",t.message),h.Vt(new eo(Za.UNAVAILABLE,"The operation could not be completed")))}),Il(c,Us.EventType.MESSAGE,t=>{var n;if(!l){const s=t.data[0];Ma(!!s,16349);const i=s,a=(null==i?void 0:i.error)||(null==(n=i[0])?void 0:n.error);if(a){Fa(_l,`RPC '${e}' stream ${r} received error:`,a);const t=a.status;let n=function(e){const t=Uc[e];if(void 0!==t)return Jc(t)}(t),s=a.message;"NOT_FOUND"===t&&s.includes("database")&&s.includes("does not exist")&&s.includes(this.databaseId.database)&&Ra(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),void 0===n&&(n=Za.INTERNAL,s="Unknown error status: "+t+" with message "+a.message),l=!0,h.Vt(new eo(n,s)),c.close()}else Fa(_l,`RPC '${e}' stream ${r} received:`,s),h.dt(s)}}),Tl.gt(),setTimeout(()=>{h.At()},0),h}terminate(){this.ft.forEach(e=>e.close()),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter(t=>t===e)}it(e,t,n){super.it(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return zs()}}
/**
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
 */Tl.yt=!1;class bl{constructor(e,t,n=1e3,r=1.5,s=6e4){this.Ct=e,this.timerId=t,this.Ft=n,this.Ot=r,this.Mt=s,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),n=Math.max(0,Date.now()-this.Bt),r=Math.max(0,t-n);r>0&&Fa("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,r,()=>(this.Bt=Date.now(),e())),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){null!==this.Lt&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){null!==this.Lt&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}
/**
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
 */const Al="PersistentStream";class Ol{constructor(e,t,n,r,s,i,a,o){this.Ct=e,this.Kt=n,this.Qt=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=a,this.listener=o,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new bl(e,t)}Jt(){return 1===this.state||5===this.state||this.Yt()}Yt(){return 2===this.state||3===this.state}start(){this.jt=0,4!==this.state?this.auth():this.Zt()}async stop(){this.Jt()&&await this.close(0)}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&null===this.Gt&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,()=>this.tn()))}nn(e){this.rn(),this.stream.send(e)}async tn(){if(this.Yt())return this.close(0)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}async close(e,t){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,4!==e?this.Ht.reset():t&&t.code===Za.RESOURCE_EXHAUSTED?(La(t.toString()),La("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===Za.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this._n(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Tt(t)}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,n])=>{this.Wt===t&&this.un(e,n)},t=>{e(()=>{const e=new eo(Za.UNKNOWN,"Fetching auth token failed: "+t.message);return this.cn(e)})})}un(e,t){const n=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct(()=>{n(()=>this.listener.ct())}),this.stream.Et(()=>{n(()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,()=>(this.Yt()&&(this.state=3),Promise.resolve())),this.listener.Et()))}),this.stream.Tt(e=>{n(()=>this.cn(e))}),this.stream.onMessage(e=>{n(()=>1==++this.jt?this.hn(e):this.onNext(e))})}Zt(){this.state=5,this.Ht.kt(async()=>{this.state=0,this.start()})}cn(e){return Fa(Al,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget(()=>this.Wt===e?t():(Fa(Al,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Nl extends Ol{constructor(e,t,n,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=function(e,t){let n;if("targetChange"in t){t.targetChange;const s="NO_CHANGE"===(r=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===r?1:"REMOVE"===r?2:"CURRENT"===r?3:"RESET"===r?4:Pa(39313,{state:r}),i=t.targetChange.targetIds||[],a=function(e,t){return e.useProto3Json?(Ma(void 0===t||"string"==typeof t,58123),_o.fromBase64String(t||"")):(Ma(void 0===t||t instanceof Buffer||t instanceof Uint8Array,16193),_o.fromUint8Array(t||new Uint8Array))}(e,t.targetChange.resumeToken),o=t.targetChange.cause,B=o&&function(e){const t=void 0===e.code?Za.UNKNOWN:Jc(e.code);return new eo(t,e.message||"")}(o);n=new hu(s,i,a,B||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=Fu(e,r.document.name),i=bu(r.document.updateTime),a=r.document.createTime?bu(r.document.createTime):Ec.min(),o=new dB({mapValue:{fields:r.document.fields}}),B=Dc.newFoundDocument(s,i,a,o),c=r.targetIds||[],u=r.removedTargetIds||[];n=new uu(c,u,B.key,B)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=Fu(e,r.document),i=r.readTime?bu(r.readTime):Ec.min(),a=Dc.newNoDocument(s,i),o=r.removedTargetIds||[];n=new uu([],o,a.key,a)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=Fu(e,r.document),i=r.removedTargetIds||[];n=new uu([],i,s,null)}else{if(!("filter"in t))return Pa(11601,{we:t});{t.filter;const e=t.filter;e.targetId;const{count:r=0,unchangedNames:s}=e,i=new Hc(r,s),a=e.targetId;n=new lu(a,i)}}var r;return n}(this.serializer,e),n=function(e){if(!("targetChange"in e))return Ec.min();const t=e.targetChange;return t.targetIds&&t.targetIds.length?Ec.min():t.readTime?bu(t.readTime):Ec.min()}(e);return this.listener.Tn(t,n)}Pn(e){const t={};t.database=Ru(this.serializer),t.addTarget=function(e,t){let n;const r=t.target;if(n=Ac(r)?{pipelineQuery:Hu(e,r)}:Oc(r)?{documents:xu(e,r)}:{query:Mu(e,r).Se},n.targetId=t.targetId,t.resumeToken.approximateByteSize()>0){n.resumeToken=Iu(e,t.resumeToken);const r=yu(e,t.expectedCount);null!==r&&(n.expectedCount=r)}else if(t.snapshotVersion.compareTo(Ec.min())>0){n.readTime=vu(e,t.snapshotVersion.toTimestamp());const r=yu(e,t.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,e);const n=function(e,t){const n=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Pa(28987,{purpose:e})}}(t.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,e);n&&(t.labels=n),this.nn(t)}In(e){const t={};t.database=Ru(this.serializer),t.removeTarget=e,this.nn(t)}}class Sl extends Ol{constructor(e,t,n,r,s,i){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return Ma(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Ma(!e.writeResults||0===e.writeResults.length,55816),this.listener.Vn()}onNext(e){Ma(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=function(e,t){return e&&e.length>0?(Ma(void 0!==t,14353),e.map(e=>function(e,t){let n=e.updateTime?bu(e.updateTime):bu(t);return n.isEqual(Ec.min())&&(n=bu(t)),new PB(n,e.transformResults||[])}(e,t))):[]}(e.writeResults,e.commitTime),n=bu(e.commitTime);return this.listener.dn(n,t)}fn(){const e={};e.database=Ru(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map(e=>function(e,t){let n;if(t instanceof KB)n={update:Pu(e,t.key,t.value)};else if(t instanceof WB)n={delete:Su(e,t.key)};else if(t instanceof qB)n={update:Pu(e,t.key,t.data),updateMask:Qu(t.fieldMask)};else{if(!(t instanceof $B))return Pa(16599,{be:t.type});n={verify:Su(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map(e=>function(e,t){const n=t.transform;if(n instanceof vB)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof _B)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof TB)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof OB)return{fieldPath:t.field.canonicalString(),increment:n.h};if(n instanceof NB)return{fieldPath:t.field.canonicalString(),minimum:n.h};if(n instanceof SB)return{fieldPath:t.field.canonicalString(),maximum:n.h};throw Pa(20930,{transform:t.transform})}(0,e))),t.precondition.isNone||(n.currentDocument=(r=e,void 0!==(s=t.precondition).updateTime?{updateTime:Tu(r,s.updateTime)}:void 0!==s.exists?{exists:s.exists}:Pa(27497))),n;var r,s}(this.serializer,e))};this.nn(t)}}
/**
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
 */class Fl{}class Ll extends Fl{constructor(e,t,n,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=r,this.mn=!1}pn(){if(this.mn)throw new eo(Za.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,n,r){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.nt(e,Ou(t,n),r,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Za.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new eo(Za.UNKNOWN,e.toString())})}_t(e,t,n,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection._t(e,Ou(t,n),r,i,a,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Za.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new eo(Za.UNKNOWN,e.toString())})}terminate(){this.mn=!0,this.connection.terminate()}}
/**
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
 */
const Rl=new Map;
/**
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
 */
const kl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Pl=41943040;class xl{static withCacheSize(e){return new xl(e,xl.DEFAULT_COLLECTION_PERCENTILE,xl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}xl.DEFAULT_COLLECTION_PERCENTILE=10,xl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,xl.DEFAULT=new xl(Pl,xl.DEFAULT_COLLECTION_PERCENTILE,xl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),xl.DISABLED=new xl(-1,0,0);
/**
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
 */
class Ml{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.gn(e),this.yn=e=>t.writeSequenceNumber(e))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}Ml.wn=-1;class Gl{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}
/**
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
 */async function Hl(e){if(e.code!==Za.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;Fa("LocalStore","Unexpectedly lost primary lease")}
/**
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
 */class Ul{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Pa(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new Ul((n,r)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(n,r)},this.catchCallback=e=>{this.wrapFailure(t,e).next(n,r)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof Ul?t:Ul.resolve(t)}catch(t){return Ul.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):Ul.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):Ul.reject(t)}static resolve(e){return new Ul((t,n)=>{t(e)})}static reject(e){return new Ul((t,n)=>{n(e)})}static waitFor(e){return new Ul((t,n)=>{let r=0,s=0,i=!1;e.forEach(e=>{++r,e.next(()=>{++s,i&&s===r&&t()},e=>n(e))}),i=!0,s===r&&t()})}static or(e){let t=Ul.resolve(!1);for(const n of e)t=t.next(e=>e?Ul.resolve(e):n());return t}static forEach(e,t){const n=[];return e.forEach((e,r)=>{n.push(t.call(this,e,r))}),this.waitFor(n)}static mapArray(e,t){return new Ul((n,r)=>{const s=e.length,i=new Array(s);let a=0;for(let o=0;o<s;o++){const B=o;t(e[B]).next(e=>{i[B]=e,++a,a===s&&n(i)},e=>r(e))}})}static doWhile(e,t){return new Ul((n,r)=>{const s=()=>{!0===e()?t().next(()=>{s()},r):n()};s()})}}function Vl(e){return"IndexedDbTransactionError"===e.name}
/**
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
 */const Jl="LruGarbageCollector";function jl([e,t],[n,r]){const s=Va(e,n);return 0===s?Va(t,r):s}class Kl{constructor(e){this.Yn=e,this.buffer=new $a(jl),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const e=this.buffer.last();jl(t,e)<0&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class ql{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.tr=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return null!==this.tr}nr(e){Fa(Jl,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Vl(e)?Fa(Jl,"Ignoring IndexedDB error during garbage collection: ",e):await Hl(e)}await this.nr(3e5)})}}class zl{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return Ul.resolve(Ml.wn);const n=new Kl(t);return this.rr.forEachTarget(e,e=>n.er(e.sequenceNumber)).next(()=>this.rr.sr(e,e=>n.er(e))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.rr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return-1===this.params.cacheSizeCollectionThreshold?(Fa("LruGarbageCollector","Garbage collection skipped; disabled"),Ul.resolve(kl)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(Fa("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),kl):this._r(e,t))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let n,r,s,i,a,o,B;const c=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(Fa("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),r=this.params.maximumSequenceNumbersToCollect):r=t,i=Date.now(),this.nthSequenceNumber(e,r))).next(r=>(n=r,a=Date.now(),this.removeTargets(e,n,t))).next(t=>(s=t,o=Date.now(),this.removeOrphanedDocuments(e,n))).next(e=>(B=Date.now(),Na()<=K.DEBUG&&Fa("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-c}ms\n\tDetermined least recently used ${r} in `+(a-i)+`ms\n\tRemoved ${s} targets in `+(o-a)+`ms\n\tRemoved ${e} documents in `+(B-o)+`ms\nTotal Duration: ${B-c}ms`),Ul.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:e})))}}
/**
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
 */
const Ql="firestore.googleapis.com",Yl=!0;class Wl{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new eo(Za.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Ql,this.ssl=Yl}else this.host=e.host,this.ssl=e.ssl??Yl;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),void 0===e.cacheSizeBytes)this.cacheSizeBytes=Pl;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new eo(Za.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(function(e,t,n,r){if(!0===t&&!0===r)throw new eo(Za.INVALID_ARGUMENT,`${e} and ${n} cannot be used together.`)}("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=dl(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new eo(Za.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new eo(Za.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new eo(Za.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,void 0!==e.grpcFlowControlWindow){if("number"!=typeof e.grpcFlowControlWindow||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new eo(Za.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(
/**
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
    */
t=this.experimentalLongPollingOptions,n=e.experimentalLongPollingOptions,t.timeoutSeconds===n.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(e,t){if(e===t)return!0;if(!e||!t)return!1;const n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(const s of n)if(e[s]!==t[s])return!1;return!0}(this._customHeaders,e._customHeaders);var t,n}}let $l=class{constructor(e,t,n,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Wl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new eo(Za.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new eo(Za.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Wl(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new ol;switch(e.type){case"firstParty":return new ll(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new eo(Za.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=Rl.get(e);t&&(Fa("ComponentProvider","Removing Datastore"),Rl.delete(e),t.terminate())}(this),Promise.resolve()}};function Xl(e,t,n,r={}){var s;e=go(e,$l);const i=G(t),a=e._getSettings(),o={...a,emulatorOptions:e._getEmulatorOptions()},B=`${t}:${n}`;i&&H(`https://${B}`),a.host!==Ql&&a.host!==B&&Ra("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...a,host:B,ssl:i,emulatorOptions:r};if(!S(c,o)&&(e._setSettings(c),r.mockUserToken)){let t,n;if("string"==typeof r.mockUserToken)t=r.mockUserToken,n=sl.MOCK_USER;else{t=function(e,t){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=t||"demo-project",r=e.iat||0,s=e.sub||e.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const i={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...e};return[E(JSON.stringify({alg:"none",type:"JWT"})),E(JSON.stringify(i)),""].join(".")}(r.mockUserToken,null==(s=e._app)?void 0:s.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new eo(Za.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new sl(i)}e._authCredentials=new Bl(new al(t,n))}}
/**
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
 */class Zl{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Zl(this.firestore,e,this._query)}}class eh{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new th(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new eh(this.firestore,e,this._key)}toJSON(){return{type:eh._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(Eo(t,eh._jsonSchema))return new eh(e,n||null,new uo(ro.fromString(t.referencePath)))}}eh._jsonSchemaVersion="firestore/documentReference/1.0",eh._jsonSchema={type:mo("string",eh._jsonSchemaVersion),referencePath:mo("string")};class th extends Zl{constructor(e,t,n){super(e,t,Sc(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new eh(this.firestore,null,new uo(e))}withConverter(e){return new th(this.firestore,e,this._path)}}function nh(e,t,...n){if(e=M(e),lo("collection","path",t),e instanceof $l){const r=ro.fromString(t,...n);return Co(r),new th(e,null,r)}{if(!(e instanceof eh||e instanceof th))throw new eo(Za.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(ro.fromString(t,...n));return Co(r),new th(e.firestore,null,r)}}function rh(e,t,...n){if(e=M(e),1===arguments.length&&(t=Ua.newId()),lo("doc","path",t),e instanceof $l){const r=ro.fromString(t,...n);return ho(r),new eh(e,null,new uo(r))}{if(!(e instanceof eh||e instanceof th))throw new eo(Za.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(ro.fromString(t,...n));return ho(r),new eh(e.firestore,e instanceof th?e.converter:null,new uo(r))}}
/**
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
 */
/**
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
 */class sh{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;++n)if(e[n]!==t[n])return!1;return!0}(this._values,e._values)}toJSON(){return{type:sh._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Eo(e,sh._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new sh(e.vectorValues);throw new eo(Za.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}sh._jsonSchemaVersion="firestore/vectorValue/1.0",sh._jsonSchema={type:mo("string",sh._jsonSchemaVersion),vectorValues:mo("object")};
/**
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
 */
const ih=/^__.*__$/;class ah{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return null!==this.fieldMask?new qB(e,this.data,this.fieldMask,t,this.fieldTransforms):new KB(e,this.data,t,this.fieldTransforms)}}class oh{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new qB(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Bh(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Pa(40011,{dataSource:e})}}class ch{constructor(e,t,n,r,s,i){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new ch({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var t;const n=null==(t=this.path)?void 0:t.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var t;const n=null==(t=this.path)?void 0:t.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return vh(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(0===e.length)throw this.createError("Document fields must not be empty");if(Bh(this.dataSource)&&ih.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class uh{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Zu(e)}createContext(e,t,n,r=!1){return new ch({dataSource:e,methodName:t,targetDoc:n,path:io.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function lh(e){const t=e._freezeSettings(),n=Zu(e._databaseId);return new uh(e._databaseId,!!t.ignoreUndefinedProperties,n)}function hh(e,t,n,r,s,i={}){const a=e.createContext(i.merge||i.mergeFields?2:0,t,n,s);Eh("Data must be an object, but it was:",a,r);const o=fh(r,a);let B,c;if(i.merge)B=new ao(a.fieldMask),c=a.fieldTransforms;else if(i.mergeFields){const e=[];for(const r of i.mergeFields){const s=Dh(t,r,n);if(!a.contains(s))throw new eo(Za.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);_h(e,s)||e.push(s)}B=new ao(e),c=a.fieldTransforms.filter(e=>B.covers(e.field))}else B=null,c=a.fieldTransforms;return new ah(new dB(o),B,c)}class Ch extends nl{_toFieldTransform(e){if(2!==e.dataSource)throw 1===e.dataSource?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ch}}class dh extends nl{_toFieldTransform(e){return new kB(e.path,new vB)}isEqual(e){return e instanceof dh}}function ph(e,t,n){if(mh(e=M(e)))return Eh("Unsupported field value:",t,e),fh(e,t);if(e instanceof nl)return function(e,t){if(!Bh(t.dataSource))throw t.createError(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.createError(`${e._methodName}() is not currently supported inside arrays`);const n=e._toFieldTransform(t);n&&t.fieldTransforms.push(n)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.arrayElement&&4!==t.dataSource)throw t.createError("Nested arrays are not supported");return function(e,t){const n=[];let r=0;for(const s of e){let e=ph(s,t.childContextForArray(r));null==e&&(e={nullValue:"NULL_VALUE"}),n.push(e),r++}return{arrayValue:{values:n}}}(e,t)}return function(e,t){if(null===(e=M(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return mB(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const n=yo.fromDate(e);return{timestampValue:vu(t.serializer,n)}}if(e instanceof yo){const n=new yo(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:vu(t.serializer,n)}}if(gh(e)){const n=yo.fromInstant(e),r=new yo(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:vu(t.serializer,r)}}if(e instanceof rl)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof el)return{bytesValue:Iu(t.serializer,e._byteString)};if(e instanceof eh){const n=t.databaseId,r=e.firestore._databaseId;if(!r.isEqual(n))throw t.createError(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:Au(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof sh)return function(e,t){const n=e instanceof sh?e.toArray():e;return{mapValue:{fields:{[Uo]:{stringValue:jo},[Ko]:{arrayValue:{values:n.map(e=>{if("number"!=typeof e)throw t.createError("VectorValues must only contain numeric values.");return fB(t.serializer,e)})}}}}}}(e,t);if(Wu(e))return e._toProto(t.serializer);throw t.createError(`Unsupported field value: ${fo(e)}`)}(e,t)}function fh(e,t){const n={};return co(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Bo(e,(e,r)=>{const s=ph(r,t.childContextForField(e));null!=s&&(n[e]=s)}),{mapValue:{fields:n}}}function gh(e){if("object"!=typeof e||null===e)return!1;if("undefined"!=typeof Temporal&&"function"==typeof Temporal.Instant&&e instanceof Temporal.Instant)return!0;const t=e;return"Temporal.Instant"===t[Symbol.toStringTag]&&"bigint"==typeof t.t}function mh(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof yo||e instanceof rl||e instanceof el||e instanceof eh||e instanceof nl||e instanceof sh||gh(e)||Wu(e))}function Eh(e,t,n){if(!mh(n)||!po(n)){const r=fo(n);throw"an object"===r?t.createError(e+" a custom object"):t.createError(e+" "+r)}}function Dh(e,t,n){if((t=M(t))instanceof tl)return t._internalPath;if("string"==typeof t)return yh(e,t);throw vh("Field path arguments must be of type string or ",e,!1,void 0,n)}const wh=new RegExp("[~\\*/\\[\\]]");function yh(e,t,n){if(t.search(wh)>=0)throw vh(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,n);try{return new tl(...t.split("."))._internalPath}catch(r){throw vh(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,n)}}function vh(e,t,n,r,s){const i=r&&!r.isEmpty(),a=void 0!==s;let o=`Function ${t}() called with invalid data`;n&&(o+=" (via `toFirestore()`)"),o+=". ";let B="";return(i||a)&&(B+=" (found",i&&(B+=` in field ${r}`),a&&(B+=` in document ${s}`),B+=")"),new eo(Za.INVALID_ARGUMENT,o+e+B)}function _h(e,t){return e.some(e=>e.isEqual(t))}
/**
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
 */
class Ih{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=dB.empty();for(const r in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(r)){const s=this.optionDefinitions[r];if(r in e){const i=e[r];let a;s.nestedOptions&&po(i)?a={mapValue:{fields:new Ih(s.nestedOptions).getOptionsProto(t,i)}}:i&&(a=ph(i,t)??void 0),a&&n.set(io.fromServerFormat(s.serverName),a)}}return n}getOptionsProto(e,t,n){const r=this._getKnownOptions(t,e);if(n){const t=new Map(function(e,t){const n=[];for(const r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.push(t(e[r],r,e));return n}(n,(t,n)=>[io.fromServerFormat(n),void 0!==t?ph(t,e):null]));r.setAll(t)}return r.value.mapValue.fields??{}}}
/**
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
 */function Th(){return new dh("serverTimestamp")}
/**
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
 */
function bh(e){let t;return e instanceof Nh?e:(t=po(e)?function(e){const t=[];for(const n in e)if(Object.prototype.hasOwnProperty.call(e,n)){const r=e[n];t.push(xh(n)),t.push(bh(r))}return new Gh("map",t,"map")}(e):e instanceof Array?function(e){return t=e,n="array",new Gh("array",t.map(e=>bh(e)),n);var t,n}(e):Mh(e,void 0),t)}function Ah(e){if(e instanceof Nh)return e;if(e instanceof sh)return xh(e);if(Array.isArray(e))return xh(function(e){return new sh(e)}(e));throw new Error("Unsupported value: "+typeof e)}function Oh(e){return function(e){return"string"==typeof e}(e)?function(e){return function(e,t){return new kh("string"==typeof e?to===e?new tl(to)._internalPath:Dh("field",e):e._internalPath,t)}(e,"field")}(e):bh(e)}class Nh{constructor(){this._protoValueType="ProtoValue"}add(e){return new Gh("add",[this,bh(e)],"add")}asBoolean(){if(this instanceof Hh)return this;if(this instanceof Ph)return new Vh(this);if(this instanceof kh)return new Jh(this);if(this instanceof Gh)return new Uh(this);throw new eo("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new Gh("subtract",[this,bh(e)],"subtract")}multiply(e){return new Gh("multiply",[this,bh(e)],"multiply")}divide(e){return new Gh("divide",[this,bh(e)],"divide")}mod(e){return new Gh("mod",[this,bh(e)],"mod")}equal(e){return new Gh("equal",[this,bh(e)],"equal").asBoolean()}notEqual(e){return new Gh("not_equal",[this,bh(e)],"notEqual").asBoolean()}lessThan(e){return new Gh("less_than",[this,bh(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new Gh("less_than_or_equal",[this,bh(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new Gh("greater_than",[this,bh(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new Gh("greater_than_or_equal",[this,bh(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map(e=>bh(e));return new Gh("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new Gh("array_contains",[this,bh(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Rh(e.map(bh),"arrayContainsAll"):e;return new Gh("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Rh(e.map(bh),"arrayContainsAny"):e;return new Gh("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new Gh("array_reverse",[this])}arrayLength(){return new Gh("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Rh(e.map(bh),"equalAny"):e;return new Gh("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Rh(e.map(bh),"notEqualAny"):e;return new Gh("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new Gh("exists",[this],"exists").asBoolean()}charLength(){return new Gh("char_length",[this],"charLength")}like(e){return new Gh("like",[this,bh(e)],"like").asBoolean()}regexContains(e){return new Gh("regex_contains",[this,bh(e)],"regexContains").asBoolean()}regexFind(e){return new Gh("regex_find",[this,bh(e)],"regexFind")}regexFindAll(e){return new Gh("regex_find_all",[this,bh(e)],"regexFindAll")}regexMatch(e){return new Gh("regex_match",[this,bh(e)],"regexMatch").asBoolean()}stringContains(e){return new Gh("string_contains",[this,bh(e)],"stringContains").asBoolean()}startsWith(e){return new Gh("starts_with",[this,bh(e)],"startsWith").asBoolean()}endsWith(e){return new Gh("ends_with",[this,bh(e)],"endsWith").asBoolean()}toLower(){return new Gh("to_lower",[this],"toLower")}toUpper(){return new Gh("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(bh(e)),new Gh("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(bh(e)),new Gh("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(bh(e)),new Gh("rtrim",t,"rtrim")}type(){return new Gh("type",[this])}isType(e){return new Gh("is_type",[this,xh(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(bh);return new Gh("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new Gh("string_index_of",[this,bh(e)],"stringIndexOf")}stringRepeat(e){return new Gh("string_repeat",[this,bh(e)],"stringRepeat")}stringReplaceAll(e,t){return new Gh("string_replace_all",[this,bh(e),bh(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new Gh("string_replace_one",[this,bh(e),bh(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(bh);return new Gh("concat",[this,...n],"concat")}reverse(){return new Gh("reverse",[this],"reverse")}arrayFilter(e,t){return new Gh("array_filter",[this,bh(e),t],"arrayFilter")}arrayTransform(e,t){return new Gh("array_transform",[this,bh(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new Gh("array_transform",[this,bh(e),bh(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,bh(e)];return void 0!==t&&n.push(bh(t)),new Gh("array_slice",n,"arraySlice")}arrayFirst(){return new Gh("array_first",[this],"arrayFirst")}arrayFirstN(e){return new Gh("array_first_n",[this,bh(e)],"arrayFirstN")}arrayLast(){return new Gh("array_last",[this],"arrayLast")}arrayLastN(e){return new Gh("array_last_n",[this,bh(e)],"arrayLastN")}arrayMaximum(){return new Gh("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new Gh("maximum_n",[this,bh(e)],"arrayMaximumN")}arrayMinimum(){return new Gh("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new Gh("minimum_n",[this,bh(e)],"arrayMinimumN")}arrayIndexOf(e){return new Gh("array_index_of",[this,bh(e),bh("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new Gh("array_index_of",[this,bh(e),bh("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new Gh("array_index_of_all",[this,bh(e)],"arrayIndexOfAll")}byteLength(){return new Gh("byte_length",[this],"byteLength")}ceil(){return new Gh("ceil",[this])}floor(){return new Gh("floor",[this])}abs(){return new Gh("abs",[this])}exp(){return new Gh("exp",[this])}mapGet(e){return new Gh("map_get",[this,xh(e)],"mapGet")}mapSet(e,t,...n){const r=[this,bh(e),bh(t),...n.map(bh)];return new Gh("map_set",r,"mapSet")}mapKeys(){return new Gh("map_keys",[this],"mapKeys")}mapValues(){return new Gh("map_values",[this],"mapValues")}mapEntries(){return new Gh("map_entries",[this],"mapEntries")}getField(e){return new Gh("get_field",[this,bh(e)],"get_field")}count(){return Sh._create("count",[this],"count")}sum(){return Sh._create("sum",[this],"sum")}average(){return Sh._create("average",[this],"average")}minimum(){return Sh._create("minimum",[this],"minimum")}maximum(){return Sh._create("maximum",[this],"maximum")}first(){return Sh._create("first",[this],"first")}last(){return Sh._create("last",[this],"last")}arrayAgg(){return Sh._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Sh._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Sh._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new Gh("maximum",[this,...n.map(bh)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new Gh("minimum",[this,...n.map(bh)],"minimum")}vectorLength(){return new Gh("vector_length",[this],"vectorLength")}cosineDistance(e){return new Gh("cosine_distance",[this,Ah(e)],"cosineDistance")}dotProduct(e){return new Gh("dot_product",[this,Ah(e)],"dotProduct")}euclideanDistance(e){return new Gh("euclidean_distance",[this,Ah(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new Gh("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new Gh("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new Gh("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new Gh("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new Gh("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new Gh("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new Gh("timestamp_add",[this,bh(e),bh(t)],"timestampAdd")}timestampSubtract(e,t){return new Gh("timestamp_subtract",[this,bh(e),bh(t)],"timestampSubtract")}timestampDiff(e,t){return new Gh("timestamp_diff",[this,Oh(e),bh(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,bh(e)];return t&&n.push(bh(t)),new Gh("timestamp_extract",n,"timestampExtract")}documentId(){return new Gh("document_id",[this],"documentId")}parent(){return new Gh("parent",[this],"parent")}substring(e,t){const n=bh(e);return new Gh("substring",void 0===t?[this,n]:[this,n,bh(t)],"substring")}arrayGet(e){return new Gh("array_get",[this,bh(e)],"arrayGet")}isError(){return new Gh("is_error",[this],"isError").asBoolean()}ifError(e){const t=new Gh("if_error",[this,bh(e)],"ifError");return e instanceof Hh?t.asBoolean():t}isAbsent(){return new Gh("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new Gh("map_remove",[this,bh(e)],"mapRemove")}mapMerge(e,...t){const n=bh(e),r=t.map(bh);return new Gh("map_merge",[this,n,...r],"mapMerge")}pow(e){return new Gh("pow",[this,bh(e)])}trunc(e){return void 0===e?new Gh("trunc",[this]):new Gh("trunc",[this,bh(e)],"trunc")}round(e){return void 0===e?new Gh("round",[this]):new Gh("round",[this,bh(e)],"round")}collectionId(){return new Gh("collection_id",[this])}length(){return new Gh("length",[this])}ln(){return new Gh("ln",[this])}sqrt(){return new Gh("sqrt",[this])}stringReverse(){return new Gh("string_reverse",[this])}ifAbsent(e){return new Gh("if_absent",[this,bh(e)],"ifAbsent")}ifNull(e){return new Gh("if_null",[this,bh(e)],"ifNull")}coalesce(e,...t){return new Gh("coalesce",[this,bh(e),...t.map(bh)],"coalesce")}join(e){return new Gh("join",[this,bh(e)],"join")}log10(){return new Gh("log10",[this])}arraySum(){return new Gh("sum",[this])}split(e){return new Gh("split",[this,bh(e)])}timestampTruncate(e,t){const n=[this,bh(e)];return t&&n.push(bh(t)),new Gh("timestamp_trunc",n)}ascending(){return new jh(Oh(this),"ascending","ascending")}descending(){return new jh(Oh(this),"descending","descending")}as(e){return new Lh(this,e,"as")}}class Sh{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const r=new Sh(e,t);return r._methodName=n,r}as(e){return new Fh(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class Fh{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class Lh{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Rh extends Nh{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map(t=>t._toProto(e))}}}_readUserData(e){this.cr.forEach(t=>t._readUserData(e))}}class kh extends Nh{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new Gh("geo_distance",[this,bh(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}class Ph extends Nh{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Ph(e,void 0);return t._protoValue=e,t}_toProto(e){return Ma(void 0!==this._protoValue,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,function(e){return"object"==typeof e&&null!==e&&!!("nullValue"in e&&(null===e.nullValue||"NULL_VALUE"===e.nullValue)||"booleanValue"in e&&(null===e.booleanValue||"boolean"==typeof e.booleanValue)||"integerValue"in e&&(null===e.integerValue||"number"==typeof e.integerValue||"string"==typeof e.integerValue)||"doubleValue"in e&&(null===e.doubleValue||"number"==typeof e.doubleValue)||"timestampValue"in e&&(null===e.timestampValue||(t=e.timestampValue,"object"==typeof t&&null!==t&&"seconds"in t&&(null===t.seconds||"number"==typeof t.seconds||"string"==typeof t.seconds)&&"nanos"in t&&(null===t.nanos||"number"==typeof t.nanos)))||"stringValue"in e&&(null===e.stringValue||"string"==typeof e.stringValue)||"bytesValue"in e&&(null===e.bytesValue||e.bytesValue instanceof Uint8Array)||"referenceValue"in e&&(null===e.referenceValue||"string"==typeof e.referenceValue)||"geoPointValue"in e&&(null===e.geoPointValue||function(e){return"object"==typeof e&&null!==e&&"latitude"in e&&(null===e.latitude||"number"==typeof e.latitude)&&"longitude"in e&&(null===e.longitude||"number"==typeof e.longitude)}(e.geoPointValue))||"arrayValue"in e&&(null===e.arrayValue||function(e){return"object"==typeof e&&null!==e&&!(!("values"in e)||null!==e.values&&!Array.isArray(e.values))}(e.arrayValue))||"mapValue"in e&&(null===e.mapValue||function(e){return"object"==typeof e&&null!==e&&!(!("fields"in e)||null!==e.fields&&!po(e.fields))}(e.mapValue))||"fieldReferenceValue"in e&&(null===e.fieldReferenceValue||"string"==typeof e.fieldReferenceValue)||"functionValue"in e&&(null===e.functionValue||function(e){return"object"==typeof e&&null!==e&&!(!("name"in e)||null!==e.name&&"string"!=typeof e.name||!("args"in e)||null!==e.args&&!Array.isArray(e.args))}(e.functionValue))||"pipelineValue"in e&&(null===e.pipelineValue||function(e){return"object"==typeof e&&null!==e&&!(!("stages"in e)||null!==e.stages&&!Array.isArray(e.stages))}(e.pipelineValue)));var t}(this._protoValue)||(this._protoValue=ph(this.value,e))}}function xh(e,t){return Mh(e,"constant")}function Mh(e,t){const n=new Ph(e,t);return"boolean"==typeof e?new Vh(n):n}class Gh extends Nh{constructor(e,t,n,r){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,void 0!==n&&(this._methodName=n),void 0!==r&&(this._options=r)}get _optionsUtil(){return new Ih({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Hh extends Nh{get _methodName(){return this._expr._methodName}countIf(){return Sh._create("count_if",[this],"countIf")}not(){return new Gh("not",[this],"not").asBoolean()}conditional(e,t){return new Gh("conditional",[this,e,t],"conditional")}ifError(e){const t=bh(e),n=new Gh("if_error",[this,t],"ifError");return t instanceof Hh?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Uh extends Hh{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Vh extends Hh{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Jh extends Hh{constructor(e){super(),this._expr=e,this.expressionType="Field"}}class jh{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Xu(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}
/**
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
 */class Kh{constructor(e){this.optionsProto=void 0,({rawOptions:this.rawOptions,...this.knownOptions}=e)}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class qh extends Kh{get _name(){return"add_fields"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[$u(e,this.fields)]}}_readUserData(e){super._readUserData(e),iC(this.fields,e)}}class zh extends Kh{get _name(){return"aggregate"}get _optionsUtil(){return new Ih({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[$u(e,this.accumulators),$u(e,this.groups)]}}_readUserData(e){super._readUserData(e),iC(this.groups,e),iC(this.accumulators,e)}}class Qh extends Kh{get _name(){return"distinct"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[$u(e,this.groups)]}}_readUserData(e){super._readUserData(e),iC(this.groups,e)}}class Yh extends Kh{get _name(){return"collection"}get _optionsUtil(){return new Ih({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.hr}]}}_readUserData(e){super._readUserData(e)}}class Wh extends Kh{get _name(){return"collection_group"}get _optionsUtil(){return new Ih({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class $h extends Kh{get _name(){return"database"}get _optionsUtil(){return new Ih({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Xh extends Kh{get _name(){return"documents"}get _optionsUtil(){return new Ih({})}constructor(e,t){if(super(t),!e||0===e.length)throw new eo(Za.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map(e=>e.startsWith("/")?e:"/"+e),r=new Set(n);if(r.size!==n.length)throw new eo(Za.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=n,this.Pr=r}_toProto(e){return{...super._toProto(e),args:this.Tr.map(e=>({referenceValue:e}))}}_readUserData(e){super._readUserData(e)}}class Zh extends Kh{get _name(){return"where"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),iC(this.condition,e)}}class eC extends Kh{get _name(){return"limit"}get _optionsUtil(){return new Ih({})}constructor(e,t){Ma(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[mB(e,this.limit)]}}}class tC extends Kh{get _name(){return"offset"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[mB(e,this.offset)]}}}class nC extends Kh{get _name(){return"select"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[$u(e,this.selections)]}}_readUserData(e){super._readUserData(e),iC(this.selections,e)}}class rC extends Kh{get _name(){return"sort"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),iC(this.orderings,e)}}class sC extends Kh{get _name(){return"replace_with"}get _optionsUtil(){return new Ih({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Xu(sC.Ir)]}}_readUserData(e){super._readUserData(e),iC(this.map,e)}}function iC(e,t){return function(e){return"function"==typeof e._readUserData}(e)?e._readUserData(t):Array.isArray(e)||e instanceof Map?e.forEach(e=>e._readUserData(t)):Object.values(e).forEach(e=>e._readUserData(t)),e}
// Copyright 2024 Google LLC* @license
sC.Ir="full_replace";class aC{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return BC(this)}getPipelineCollectionGroup(){return cC(this)}getPipelineCollectionId(){return function(e){switch(oC(e)){case"collection":return ro.fromString(BC(e)).lastSegment();case"collection_group":return cC(e);default:return}}(this)}getPipelineDocuments(){return uC(this)}getPipelineFlavor(){return function(e){let t="exact";return e.stages.forEach((n,r)=>{n._name!==Qh.name&&n._name!==zh.name||(t="keyless"),n._name===nC.name&&"exact"===t&&(t="augmented"),n._name===qh.name&&r<e.stages.length-1&&"exact"===t&&(t="augmented")}),t}(this)}getPipelineSourceType(){return oC(this)}}function oC(e){const t=e.stages[0];return t instanceof Yh||t instanceof Wh||t instanceof $h||t instanceof Xh?t._name:"unknown"}function BC(e){if("collection"===oC(e))return e.stages[0].hr}function cC(e){if("collection_group"===oC(e))return e.stages[0].collectionId}function uC(e){if("documents"===oC(e))return e.stages[0].Tr}class lC{constructor(e,t){this.type=e,this.value=t}static mr(){return new lC("ERROR",void 0)}static pr(){return new lC("UNSET",void 0)}static gr(){return new lC("NULL",qo)}static newValue(e){return BB(e)?new lC("NULL",qo):(t=e)&&"booleanValue"in t?new lC("BOOLEAN",e):sB(e)?new lC("INT",e):iB(e)?new lC("DOUBLE",e):function(e){return!!e&&"timestampValue"in e&&!!e.timestampValue}(e)?new lC("TIMESTAMP",e):function(e){return!!e&&"stringValue"in e}(e)?new lC("STRING",e):function(e){return!!e&&"bytesValue"in e}(e)?new lC("BYTES",e):e.referenceValue?new lC("REFERENCE",e):e.geoPointValue?new lC("GEO_POINT",e):oB(e)?new lC("ARRAY",e):lB(e)?new lC("VECTOR",e):uB(e)?new lC("MAP",e):new lC("ERROR",void 0);var t}yr(){return"ERROR"===this.type||"UNSET"===this.type}wr(){return"NULL"===this.type}}function hC(e){if(!e.yr())return e.value}function CC(e){return e instanceof Hh?e._expr:e}function dC(e){if((e=CC(e))instanceof kh)return new pC(e);if(e instanceof Ph)return new fC(e);if(e instanceof Rh)return new gC(e);if(e instanceof Gh){if("add"===e.name)return new _C(e);if("subtract"===e.name)return new IC(e);if("multiply"===e.name)return new TC(e);if("divide"===e.name)return new bC(e);if("mod"===e.name)return new AC(e);if("and"===e.name)return new OC(e);if("equal"===e.name)return new KC(e);if("not_equal"===e.name)return new qC(e);if("less_than"===e.name)return new zC(e);if("less_than_or_equal"===e.name)return new QC(e);if("greater_than"===e.name)return new YC(e);if("greater_than_or_equal"===e.name)return new WC(e);if("array_concat"===e.name)return new $C(e);if("array_reverse"===e.name)return new XC(e);if("array_contains"===e.name)return new ZC(e);if("array_contains_all"===e.name)return new ed(e);if("array_contains_any"===e.name)return new td(e);if("array_length"===e.name)return new nd(e);if("array_element"===e.name)return new rd(e);if("equal_any"===e.name)return new LC(e);if("not_equal_any"===e.name)return new RC(e);if("is_nan"===e.name)return new kC(e);if("is_not_nan"===e.name)return new PC(e);if("is_null"===e.name)return new xC(e);if("is_not_null"===e.name)return new MC(e);if("is_error"===e.name)return new GC(e);if("exists"===e.name)return new HC(e);if("not"===e.name)return new NC(e);if("or"===e.name)return new SC(e);if("xor"===e.name)return new FC(e);if("conditional"===e.name)return new UC(e);if("maximum"===e.name)return new VC(e);if("minimum"===e.name)return new JC(e);if("reverse"===e.name)return new sd(e);if("replace_first"===e.name)return new id(e);if("replace_all"===e.name)return new ad(e);if("char_length"===e.name)return new od(e);if("byte_length"===e.name)return new Bd(e);if("like"===e.name)return new ud(e);if("regex_contains"===e.name)return new ld(e);if("regex_match"===e.name)return new hd(e);if("string_contains"===e.name)return new Cd(e);if("starts_with"===e.name)return new dd(e);if("ends_with"===e.name)return new pd(e);if("to_lower"===e.name)return new fd(e);if("to_upper"===e.name)return new gd(e);if("trim"===e.name)return new md(e);if("string_concat"===e.name)return new Ed(e);if("map_get"===e.name)return new Dd(e);if("cosine_distance"===e.name)return new yd(e);if("dot_product"===e.name)return new vd(e);if("euclidean_distance"===e.name)return new _d(e);if("vector_length"===e.name)return new Id(e);if("unix_micros_to_timestamp"===e.name)return new Hd(e);if("timestamp_to_unix_micros"===e.name)return new jd(e);if("unix_millis_to_timestamp"===e.name)return new Ud(e);if("timestamp_to_unix_millis"===e.name)return new Kd(e);if("unix_seconds_to_timestamp"===e.name)return new Vd(e);if("timestamp_to_unix_seconds"===e.name)return new qd(e);if("timestamp_add"===e.name)return new Qd(e);if("timestamp_subtract"===e.name)return new Yd(e)}throw new Error(`Unknown Expr : ${e}`)}class pC{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===to)return lC.newValue({referenceValue:Su(e.serializer,t.key)});if("__update_time__"===this.expr.fieldName)return lC.newValue({timestampValue:Tu(e.serializer,t.version)});if("__create_time__"===this.expr.fieldName)return lC.newValue({timestampValue:Tu(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?Lo(n)?lC.newValue(function(e,t){if("estimate"===e.serverTimestampBehavior)return{timestampValue:Tu(e.serializer,Ec.fromTimestamp(ko(t)))};if("previous"===e.serverTimestampBehavior){const e=Ro(t);if(e)return e}return{nullValue:"NULL_VALUE"}}(e,n)):lC.newValue(n):lC.pr()}}class fC{constructor(e){this.expr=e}evaluate(e,t){return lC.newValue(this.expr._getValue())}}class gC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.cr.map(n=>dC(n).evaluate(e,t));return n.some(e=>e.yr())?lC.mr():lC.newValue({arrayValue:{values:n.map(e=>e.value)}})}}function mC(e){return iB(e)?Number(e.doubleValue):Number(e.integerValue)}function EC(e){return BigInt(e.integerValue)}const DC=BigInt("0x7fffffffffffffff"),wC=-BigInt("0x8000000000000000");class yC{constructor(e){this.expr=e}evaluate(e,t){Ma(this.expr.params.length>=2,24778);const n=dC(this.expr.params[0]).evaluate(e,t),r=dC(this.expr.params[1]).evaluate(e,t);let s=this.br(n,r);for(const i of this.expr.params.slice(2)){const n=dC(i).evaluate(e,t);s=this.br(s,n)}return s}br(e,t){if(e.yr()||t.yr())return lC.mr();if(e.wr()||t.wr())return lC.gr();const n=e.value,r=t.value;if(!iB(n)&&!sB(n)||!iB(r)&&!sB(r))return lC.mr();if(iB(n)||iB(r)){const e=this.Sr(n,r);return e?lC.newValue(e):lC.mr()}if(sB(n)&&sB(r)){const e=this.vr(n,r);return void 0===e?lC.mr():"number"==typeof e?lC.newValue({doubleValue:e}):e<wC||e>DC?lC.mr():lC.newValue({integerValue:`${e}`})}return lC.mr()}}function vC(e,t){return Yo(e)!==Yo(t)?"TYPE_MISMATCH":cB(e)||cB(t)?"NOT_EQ":BB(e)&&BB(t)?"EQ":BB(e)||BB(t)?"NULL":oB(e)&&oB(t)?function(e,t){var n,r,s;if((null==(n=e.values)?void 0:n.length)!==(null==(r=t.values)?void 0:r.length))return"NOT_EQ";let i=!1;for(let a=0;a<((null==(s=e.values)?void 0:s.length)??0);a++){const n=e.values[a],r=t.values[a];switch(vC(n,r)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:Pa(44609,{Dr:n,Cr:r})}}return i?"NULL":"EQ"}(e.arrayValue,t.arrayValue):lB(e)&&lB(t)||uB(e)&&uB(t)?function(e,t){const n=e.fields||{},r=t.fields||{};if(oo(n)!==oo(r))return"NOT_EQ";let s=!1;for(const i in n)if(n.hasOwnProperty(i)){if(void 0===r[i])return"NOT_EQ";switch(vC(n[i],r[i])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0}}return s?"NULL":"EQ"}(e.mapValue,t.mapValue):Wo(e,t,{u:!1,i:!0,o:!0})?"EQ":"NOT_EQ"}class _C extends yC{vr(e,t){return EC(e)+EC(t)}Sr(e,t){return{doubleValue:mC(e)+mC(t)}}}class IC extends yC{constructor(e){super(e),this.expr=e}vr(e,t){return EC(e)-EC(t)}Sr(e,t){return{doubleValue:mC(e)-mC(t)}}}class TC extends yC{constructor(e){super(e),this.expr=e}vr(e,t){return EC(e)*EC(t)}Sr(e,t){return{doubleValue:mC(e)*mC(t)}}}class bC extends yC{constructor(e){super(e),this.expr=e}vr(e,t){const n=EC(t);if(n!==BigInt(0))return EC(e)/n}Sr(e,t){const n=mC(t);return 0===n?{doubleValue:Ho(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:mC(e)/n}}}class AC extends yC{constructor(e){super(e),this.expr=e}vr(e,t){const n=EC(t);if(n!==BigInt(0))return EC(e)%n}Sr(e,t){const n=mC(t);if(0!==n)return{doubleValue:mC(e)%n}}}class OC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=dC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":if(!(null==(n=a.value)?void 0:n.booleanValue))return lC.newValue(Qo);break;case"NULL":s=!0;break;default:r=!0}}return r?lC.mr():s?lC.gr():lC.newValue(zo)}}class NC{constructor(e){this.expr=e}evaluate(e,t){var n;Ma(1===this.expr.params.length,9634);const r=dC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return lC.newValue({booleanValue:!(null==(n=r.value)?void 0:n.booleanValue)});case"NULL":return lC.gr();default:return lC.mr()}}}class SC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=dC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":if(null==(n=a.value)?void 0:n.booleanValue)return lC.newValue(zo);break;case"NULL":s=!0;break;default:r=!0}}return r?lC.mr():s?lC.gr():lC.newValue(Qo)}}class FC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=dC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":r=FC.xor(r,!!(null==(n=a.value)?void 0:n.booleanValue));break;case"NULL":s=!0;break;default:return lC.mr()}}return s?lC.gr():lC.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class LC{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(2===this.expr.params.length,55094);let s=!1;const i=dC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":s=!0;break;case"ERROR":case"UNSET":return lC.mr()}const a=dC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"ARRAY":break;case"NULL":s=!0;break;default:return lC.mr()}if(s)return lC.gr();for(const o of(null==(r=null==(n=a.value)?void 0:n.arrayValue)?void 0:r.values)??[])switch(BB(i.value)&&BB(o)?"EQ":vC(i.value,o)){case"EQ":return lC.newValue(zo);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":s=!0;break;default:Pa(44608,{value:i.value,candidate:o})}return s?lC.gr():lC.newValue(Qo)}}class RC{constructor(e){this.expr=e}evaluate(e,t){return new NC(new Gh("not",[new Gh("equal_any",this.expr.params)])).evaluate(e,t)}}class kC{constructor(e){this.expr=e}evaluate(e,t){Ma(1===this.expr.params.length,23322);const n=dC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return lC.newValue(Qo);case"DOUBLE":return lC.newValue({booleanValue:isNaN(mC(n.value))});case"NULL":return lC.gr();default:return lC.mr()}}}class PC{constructor(e){this.expr=e}evaluate(e,t){return Ma(1===this.expr.params.length,50406),new NC(new Gh("not",[new Gh("is_nan",this.expr.params)])).evaluate(e,t)}}class xC{constructor(e){this.expr=e}evaluate(e,t){switch(Ma(1===this.expr.params.length,23123),dC(this.expr.params[0]).evaluate(e,t).type){case"NULL":return lC.newValue(zo);case"UNSET":case"ERROR":return lC.mr();default:return lC.newValue(Qo)}}}class MC{constructor(e){this.expr=e}evaluate(e,t){return Ma(1===this.expr.params.length,23167),new NC(new Gh("not",[new Gh("is_null",this.expr.params)])).evaluate(e,t)}}class GC{constructor(e){this.expr=e}evaluate(e,t){return Ma(1===this.expr.params.length,5228),"ERROR"===dC(this.expr.params[0]).evaluate(e,t).type?lC.newValue(zo):lC.newValue(Qo)}}class HC{constructor(e){this.expr=e}evaluate(e,t){switch(Ma(1===this.expr.params.length,6877),dC(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return lC.mr();case"UNSET":return lC.newValue(Qo);default:return lC.newValue(zo)}}}class UC{constructor(e){this.expr=e}evaluate(e,t){var n;Ma(3===this.expr.params.length,11706);const r=dC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(null==(n=r.value)?void 0:n.booleanValue)?dC(this.expr.params[1]).evaluate(e,t):dC(this.expr.params[2]).evaluate(e,t);case"NULL":return dC(this.expr.params[2]).evaluate(e,t);default:return lC.mr()}}}class VC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>dC(n).evaluate(e,t));let r;for(const s of n)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||Xo(s.value,r.value)>0?s:r}return void 0===r?lC.gr():r}}class JC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>dC(n).evaluate(e,t));let r;for(const s of n)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||Xo(s.value,r.value)<0?s:r}return void 0===r?lC.gr():r}}class jC{constructor(e){this.expr=e}evaluate(e,t){Ma(2===this.expr.params.length,31033,`${this.expr.name}() function should have exactly 2 params`);const n=dC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return lC.mr()}const r=dC(this.expr.params[1]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return lC.mr()}return this.Fr(n,r)}}class KC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return lC.newValue(zo);if(e.wr()||t.wr())return lC.newValue(Qo);if(cB(e.value)||cB(t.value))return lC.newValue(Qo);if(Yo(e.value)!==Yo(t.value))return lC.newValue(Qo);switch(vC(e.value,t.value)){case"EQ":return lC.newValue(zo);case"NOT_EQ":return lC.newValue(Qo);case"NULL":return lC.gr();default:Pa(44615,{left:e,right:t})}}}class qC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){switch(vC(e.value,t.value)){case"EQ":return lC.newValue(Qo);case"NOT_EQ":case"TYPE_MISMATCH":return lC.newValue(zo);case"NULL":return lC.gr();default:Pa(44614,{left:e,right:t})}}}class zC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){return Yo(e.value)!==Yo(t.value)||cB(e.value)||cB(t.value)?lC.newValue(Qo):lC.newValue({booleanValue:Xo(e.value,t.value)<0})}}class QC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){return Yo(e.value)!==Yo(t.value)||cB(e.value)||cB(t.value)?lC.newValue(Qo):"EQ"===vC(e.value,t.value)?lC.newValue(zo):lC.newValue({booleanValue:Xo(e.value,t.value)<0})}}class YC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){return Yo(e.value)!==Yo(t.value)||cB(e.value)||cB(t.value)?lC.newValue(Qo):lC.newValue({booleanValue:Xo(e.value,t.value)>0})}}class WC extends jC{constructor(e){super(e),this.expr=e}Fr(e,t){return Yo(e.value)!==Yo(t.value)||cB(e.value)||cB(t.value)?lC.newValue(Qo):"EQ"===vC(e.value,t.value)?lC.newValue(zo):lC.newValue({booleanValue:Xo(e.value,t.value)>0})}}class $C{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class XC{constructor(e){this.expr=e}evaluate(e,t){var n;Ma(1===this.expr.params.length,216);const r=dC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return lC.gr();case"ARRAY":{const e=(null==(n=r.value.arrayValue)?void 0:n.values)??[];return lC.newValue({arrayValue:{values:[...e].reverse()}})}default:return lC.mr()}}}class ZC{constructor(e){this.expr=e}evaluate(e,t){return Ma(2===this.expr.params.length,52884),new LC(new Gh("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class ed{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;Ma(2===this.expr.params.length,1392);let a=!1;const o=dC(this.expr.params[0]).evaluate(e,t);switch(o.type){case"ARRAY":break;case"NULL":a=!0;break;default:return lC.mr()}const B=dC(this.expr.params[1]).evaluate(e,t);switch(B.type){case"ARRAY":break;case"NULL":a=!0;break;default:return lC.mr()}if(a)return lC.gr();const c=(null==(r=null==(n=B.value)?void 0:n.arrayValue)?void 0:r.values)??[],u=(null==(i=null==(s=o.value)?void 0:s.arrayValue)?void 0:i.values)??[];for(const l of c){let e=!1;a=!1;for(const t of u){switch(BB(l)&&BB(t)?"EQ":vC(l,t)){case"EQ":e=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":a=!0;break;default:Pa(44613,{value:t,search:l})}if(e)break}if(!e)return lC.newValue(Qo)}return lC.newValue(zo)}}class td{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;Ma(2===this.expr.params.length,2680);let a=!1;const o=dC(this.expr.params[0]).evaluate(e,t);switch(o.type){case"ARRAY":break;case"NULL":a=!0;break;default:return lC.mr()}const B=dC(this.expr.params[1]).evaluate(e,t);switch(B.type){case"ARRAY":break;case"NULL":a=!0;break;default:return lC.mr()}if(a)return lC.gr();const c=(null==(r=null==(n=B.value)?void 0:n.arrayValue)?void 0:r.values)??[],u=(null==(i=null==(s=o.value)?void 0:s.arrayValue)?void 0:i.values)??[];for(const l of u)for(const e of c)switch(BB(l)&&BB(e)?"EQ":vC(l,e)){case"EQ":return lC.newValue(zo);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":a=!0;break;default:Pa(60403,{value:l,search:e})}return a?lC.gr():lC.newValue(Qo)}}class nd{constructor(e){this.expr=e}evaluate(e,t){var n,r,s;Ma(1===this.expr.params.length,38605);const i=dC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":return lC.gr();case"ARRAY":return lC.newValue({integerValue:`${(null==(s=null==(r=null==(n=i.value)?void 0:n.arrayValue)?void 0:r.values)?void 0:s.length)??0}`});default:return lC.mr()}}}class rd{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class sd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(1===this.expr.params.length,1508);const s=dC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":return lC.gr();case"BYTES":{const e=null==(n=s.value)?void 0:n.bytesValue;if("string"==typeof e){const t=_o.fromBase64String(e).toUint8Array();return t.reverse(),lC.newValue({bytesValue:_o.fromUint8Array(t).toBase64()})}return lC.newValue({bytesValue:new Uint8Array(e).reverse()})}case"STRING":{const e=null==(r=s.value)?void 0:r.stringValue,t=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(e),n=Array.from(t,e=>e.segment).reverse();return lC.newValue({stringValue:n.join("")})}default:return lC.mr()}}}class id{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class ad{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class od{constructor(e){this.expr=e}evaluate(e,t){Ma(1===this.expr.params.length,19400);const n=dC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return lC.gr();case"STRING":{const e=function(e){let t=0;for(let n=0;n<e.length;n++){const r=e.codePointAt(n);if(void 0===r)return;if(r<=65535)if(r>=55296&&r<=57343)if(r<=56319){const r=e.codePointAt(n+1);void 0!==r&&r>=56320&&r<=57343?(t+=1,n++):t+=1}else t+=1;else t+=1;else{if(!(r<=1114111))return;t+=1,n++}}return t}(n.value.stringValue);return void 0===e?lC.mr():lC.newValue({integerValue:e})}default:return lC.mr()}}}class Bd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(1===this.expr.params.length,8486);const s=dC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"BYTES":{const e=null==(n=s.value)?void 0:n.bytesValue;return"string"==typeof e?lC.newValue({integerValue:_o.fromBase64String(e).toUint8Array().length}):lC.newValue({integerValue:new Uint8Array(e).length})}case"STRING":{const e=function(e){let t=0;for(let n=0;n<e.length;n++){const r=e.codePointAt(n);if(void 0===r)return;if(r>=55296&&r<=57343){if(!(r<=56319))return;{const r=e.codePointAt(n+1);if(void 0===r||!(r>=56320&&r<=57343))return;t+=4,n++}}else if(r<=127)t+=1;else if(r<=2047)t+=2;else if(r<=65535)t+=3;else{if(!(r<=1114111))return;t+=4,n++}}return t}(null==(r=s.value)?void 0:r.stringValue);return void 0===e?lC.mr():lC.newValue({integerValue:e})}case"NULL":return lC.gr();default:return lC.mr()}}}class cd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(2===this.expr.params.length,39773,`${this.expr.name}() function should have exactly two parameters`);let s=!1;const i=dC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":s=!0;break;default:return lC.mr()}const a=dC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"STRING":break;case"NULL":s=!0;break;default:return lC.mr()}return s?lC.gr():this.Or(null==(n=i.value)?void 0:n.stringValue,null==(r=a.value)?void 0:r.stringValue)}}class ud extends cd{Or(e,t){try{const n=function(e){let t="";for(let n=0;n<e.length;n++){const r=e.charAt(n);switch(r){case"_":t+=".";break;case"%":t+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":t+="\\"+r;break;default:t+=r}}return"^"+t+"$"}(t),r=ba.compile(n);return lC.newValue({booleanValue:r.matches(e)})}catch(n){return Ra(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),lC.mr()}}}class ld extends cd{Or(e,t){try{const n=ba.compile(t);return lC.newValue({booleanValue:n.test(e)})}catch(n){return Ra(`Invalid regex pattern found in regex_contains: ${t}, returning error`),lC.mr()}}}class hd extends cd{Or(e,t){try{return lC.newValue({booleanValue:ba.compile(t).matches(e)})}catch(n){return Ra(`Invalid regex pattern found in regex_match: ${t}, returning error`),lC.mr()}}}class Cd extends cd{Or(e,t){return lC.newValue({booleanValue:e.includes(t)})}}class dd extends cd{Or(e,t){return lC.newValue({booleanValue:e.startsWith(t)})}}class pd extends cd{Or(e,t){return lC.newValue({booleanValue:e.endsWith(t)})}}class fd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(1===this.expr.params.length,29079);const s=dC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return lC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.toLowerCase()});case"NULL":return lC.gr();default:return lC.mr()}}}class gd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(1===this.expr.params.length,60487);const s=dC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return lC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.toUpperCase()});case"NULL":return lC.gr();default:return lC.mr()}}}class md{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(1===this.expr.params.length,28544);const s=dC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return lC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.trim()});case"NULL":return lC.gr();default:return lC.mr()}}}class Ed{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>dC(n).evaluate(e,t));let r="",s=!1;for(const i of n)switch(i.type){case"STRING":r+=i.value.stringValue;break;case"NULL":s=!0;break;default:return lC.mr()}return s?lC.gr():lC.newValue({stringValue:r})}}class Dd{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;Ma(2===this.expr.params.length,4483);const a=dC(this.expr.params[0]).evaluate(e,t);switch(a.type){case"UNSET":return lC.pr();case"MAP":break;default:return lC.mr()}const o=dC(this.expr.params[1]).evaluate(e,t);if("STRING"!==o.type)return lC.mr();const B=null==(i=null==(r=null==(n=a.value)?void 0:n.mapValue)?void 0:r.fields)?void 0:i[null==(s=o.value)?void 0:s.stringValue];return void 0===B?lC.pr():lC.newValue(B)}}class wd{constructor(e){this.expr=e}evaluate(e,t){var n,r;Ma(2===this.expr.params.length,25231,`${this.expr.name}() function should have exactly 2 params`);let s=!1;const i=dC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":s=!0;break;default:return lC.mr()}const a=dC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"VECTOR":break;case"NULL":s=!0;break;default:return lC.mr()}if(s)return lC.gr();const o=hB(i.value),B=hB(a.value);if(void 0===o||void 0===B||(null==(n=o.values)?void 0:n.length)!==(null==(r=B.values)?void 0:r.length))return lC.mr();const c=this.Mr(o,B);return void 0===c||isNaN(c)?lC.mr():lC.newValue({doubleValue:c})}}class yd extends wd{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return;let s=0,i=0,a=0;for(let B=0;B<n.length;B++){if(!aB(n[B])||!aB(r[B]))return;const e=mC(n[B]),t=mC(r[B]);s+=e*t,i+=e*e,a+=t*t}const o=Math.sqrt(i)*Math.sqrt(a);return 0!==o?1-Math.max(-1,Math.min(1,s/o)):void 0}}class vd extends wd{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return 0;let s=0;for(let i=0;i<n.length;i++){if(!aB(n[i])||!aB(r[i]))return;s+=mC(n[i])*mC(r[i])}return s}}class _d extends wd{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return 0;let s=0;for(let i=0;i<n.length;i++){if(!aB(n[i])||!aB(r[i]))return;const e=mC(n[i]),t=mC(r[i]);s+=Math.pow(e-t,2)}return Math.sqrt(s)}}class Id{constructor(e){this.expr=e}evaluate(e,t){var n;Ma(1===this.expr.params.length,39044);const r=dC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const e=hB(r.value);return lC.newValue({integerValue:(null==(n=null==e?void 0:e.values)?void 0:n.length)??0})}case"NULL":return lC.gr();default:return lC.mr()}}}const Td=BigInt(-62135596800),bd=BigInt(253402300799),Ad=BigInt(1e3),Od=BigInt(1e6),Nd=Td*Ad,Sd=bd*Ad+BigInt(999),Fd=Td*Od,Ld=bd*Od+BigInt(999999);function Rd(e){return e>=Fd&&e<=Ld}function kd(e){return e>=Td&&e<=bd}function Pd(e,t){const n=BigInt(e);return!(n<Td||n>bd||t<0||t>=1e9||n===Td&&0!==t||n===bd&&t>999999999)}function xd(e,t){return t<0?{seconds:e-1,nanos:t+1e9}:{seconds:e,nanos:t}}function Md(e){return BigInt(e.seconds)*Od+BigInt(Math.trunc(e.nanoseconds/1e3))}class Gd{constructor(e){this.expr=e}evaluate(e,t){Ma(1===this.expr.params.length,49262,`${this.expr.name}() function should have exactly one parameter`);const n=dC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return lC.gr();default:return lC.mr()}}}class Hd extends Gd{toTimestamp(e){if(!Rd(e))return lC.mr();let t=Number(e/Od),n=Number(e%Od*BigInt(1e3));const r=xd(t,n);return t=r.seconds,n=r.nanos,Pd(t,n)?lC.newValue({timestampValue:{seconds:t,nanos:n}}):lC.mr()}}class Ud extends Gd{toTimestamp(e){if(!((t=e)>=Nd&&t<=Sd))return lC.mr();var t;let n=Number(e/Ad),r=Number(e%Ad*BigInt(1e6));const s=xd(n,r);return n=s.seconds,r=s.nanos,Pd(n,r)?lC.newValue({timestampValue:{seconds:n,nanos:r}}):lC.mr()}}class Vd extends Gd{toTimestamp(e){if(!kd(e))return lC.mr();const t=Number(e);return lC.newValue({timestampValue:{seconds:t,nanos:0}})}}class Jd{constructor(e){this.expr=e}evaluate(e,t){Ma(1===this.expr.params.length,1265,`${this.expr.name}() function should have exactly one parameter`);const n=dC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return lC.gr();default:return lC.mr()}const r=_u(n.value.timestampValue);return Pd(r.seconds,r.nanoseconds)?this.Nr(r):lC.mr()}}class jd extends Jd{Nr(e){const t=Md(e);return Rd(t)?lC.newValue({integerValue:`${t.toString()}`}):lC.mr()}}class Kd extends Jd{Nr(e){const t=Md(e),n=t/BigInt(1e3),r=t%BigInt(1e3);return n>BigInt(0)||r===BigInt(0)?lC.newValue({integerValue:n.toString()}):lC.newValue({integerValue:(n-BigInt(1)).toString()})}}class qd extends Jd{Nr(e){const t=BigInt(e.seconds);return kd(t)?lC.newValue({integerValue:t.toString()}):lC.mr()}}class zd{constructor(e){this.expr=e}evaluate(e,t){Ma(3===this.expr.params.length,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const r=dC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return lC.mr()}const s=dC(this.expr.params[1]).evaluate(e,t);let i;switch(s.type){case"STRING":if(i=function(e){switch(e){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(s.value.stringValue),void 0===i)return lC.mr();break;case"NULL":n=!0;break;default:return lC.mr()}const a=dC(this.expr.params[2]).evaluate(e,t);switch(a.type){case"INT":break;case"NULL":n=!0;break;default:return lC.mr()}if(n)return lC.gr();const o=BigInt(a.value.integerValue);let B;try{switch(i){case"microsecond":B=o;break;case"millisecond":B=o*BigInt(1e3);break;case"second":B=o*BigInt(1e6);break;case"minute":B=o*BigInt(6e7);break;case"hour":B=o*BigInt(36e8);break;case"day":B=o*BigInt(864e8);break;default:return lC.mr()}if("microsecond"!==i&&o!==BigInt(0)&&B/o!==BigInt(this.Lr(i)))return lC.mr()}catch(f){return Ra(`Error during timestamp arithmetic: ${f}`),lC.mr()}const c=_u(r.value.timestampValue);if(!Pd(c.seconds,c.nanoseconds))return lC.mr();const u=Md(c),l=this.Br(u,B);if(!Rd(l))return lC.mr();const h=Number(l/Od),C=l%Od,d=Number((C<0?C+Od:C)*BigInt(1e3)),p=C<0?h-1:h;return Pd(p,d)?lC.newValue({timestampValue:{seconds:p,nanos:d}}):lC.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class Qd extends zd{Br(e,t){return e+t}}class Yd extends zd{Br(e,t){return e-t}}function Wd(e){if((e=CC(e))instanceof kh)return`fld(${e.fieldName})`;if(e instanceof Ph)return`cst(${t=e.value,null===t?"null":"number"==typeof t?t.toString():"string"==typeof t?`"${t}"`:t instanceof eh?`ref(${t.path})`:t instanceof sh?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})`;var t;if(e instanceof Gh)return`fn(${e.name},[${e.params.map(Wd).join(",")}])`;if("ListOfExpressions"===e.expressionType)return`list([${e.cr.map(Wd).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(e,null,2)}`)}function $d(e){return`${Array.from(e.entries()).sort().map(([e,t])=>`${e}=${Wd(t)}`).join(",")}`}function Xd(e){return e.stages.map(e=>function(e){if(e instanceof qh)return`${e._name}(${$d(e.fields)})`;if(e instanceof zh){let t=`${e._name}(${$d(e.accumulators)})`;return e.groups.size>0&&(t+=`grouping(${$d(e.groups)})`),t}if(e instanceof Qh)return`${e._name}(${$d(e.groups)})`;if(e instanceof Yh)return`${e._name}(${e.hr})`;if(e instanceof Wh)return`${e._name}(${e.collectionId})`;if(e instanceof $h)return`${e._name}()`;if(e instanceof Xh)return`${e._name}(${e.Tr.sort()})`;if(e instanceof Zh)return`${e._name}(${Wd(e.condition)})`;if(e instanceof eC)return`${e._name}(${e.limit})`;if(e instanceof rC)return`${e._name}(${t=e.orderings,t.map(e=>`${Wd(e.expr)}${e.direction}`).join(",")})`;var t;throw new Error(`Unrecognized stage ${e._name}`)}(e)).join("|")}function Zd(e,t){return Xd(e)===Xd(t)}function ep(e){return e instanceof aC}function tp(e){return ep(e)?Xd(e):Pc(e)}function np(e){return ep(e)?Xd(e):`${Tc(Rc(t=e))}|lt:${t.limitType}`;var t}function rp(e,t){return e instanceof aC&&t instanceof aC?Zd(e,t):!(e instanceof aC&&!(t instanceof aC)||!(e instanceof aC)&&t instanceof aC)&&function(e,t){return bc(Rc(e),Rc(t))&&e.limitType===t.limitType}(e,t)}function sp(e){return Ac(e)?Xd(e):Tc(e)}function ip(e,t){return e instanceof aC&&t instanceof aC?Zd(e,t):!(e instanceof aC&&!(t instanceof aC)||!(e instanceof aC)&&t instanceof aC)&&bc(e,t)}
/**
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
 */class ap{constructor(e,t,n,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const t=this.mutations[r];t.key.isEqual(e.key)&&UB(t,e,n[r])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=VB(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=VB(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=$c();return this.mutations.forEach(r=>{const s=e.get(r.key),i=s.overlayedDocument;let a=this.applyToLocalView(i,s.mutatedFields);a=t.has(r.key)?null:a;const o=HB(i,a);null!==o&&n.set(r.key,o),i.isValidDocument()||i.convertToNoDocument(Ec.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),tu())}isEqual(e){return this.batchId===e.batchId&&za(this.mutations,e.mutations,(e,t)=>jB(e,t))&&za(this.baseMutations,e.baseMutations,(e,t)=>jB(e,t))}}class op{constructor(e,t,n,r){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=r}static from(e,t,n){Ma(e.mutations.length===n.length,58842,{Ur:e.mutations.length,kr:n.length});let r=function(){return Zc}();const s=e.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new op(e,t,n,r)}}
/**
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
 */function Bp(e,t){let n=t;const r=e.length;for(let s=0;s<r;s++){const t=e.charAt(s);switch(t){case"\0":n+="";break;case"":n+="";break;default:n+=t}}return n}function cp(e){return e+""}
/**
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
 */class up{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
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
 */class lp{constructor(e,t,n,r,s=Ec.min(),i=Ec.min(),a=_o.EMPTY_BYTE_STRING,o=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=a,this.expectedCount=o}withSequenceNumber(e){return new lp(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new lp(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new lp(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new lp(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
/**
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
 */class hp{constructor(e){this.$r=e}}function Cp(e){const t=Gu({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?kc(t,t.limit,"L"):t}
/**
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
 */class dp{constructor(){this.Zi=new pp}addToCollectionParentIndex(e,t){return this.Zi.add(t),Ul.resolve()}getCollectionParents(e,t){return Ul.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return Ul.resolve()}deleteFieldIndex(e,t){return Ul.resolve()}deleteAllFieldIndexes(e){return Ul.resolve()}createTargetIndexes(e,t){return Ul.resolve()}getDocumentsMatchingTarget(e,t){return Ul.resolve(null)}getIndexType(e,t){return Ul.resolve(0)}getFieldIndexes(e,t){return Ul.resolve([])}getNextCollectionGroupToUpdate(e){return Ul.resolve(null)}getMinOffset(e,t){return Ul.resolve(yc.min())}getMinOffsetFromCollectionGroup(e,t){return Ul.resolve(yc.min())}updateCollectionGroup(e,t,n){return Ul.resolve()}updateIndexEntries(e,t){return Ul.resolve()}}class pp{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t]||new $a(ro.comparator),s=!r.has(n);return this.index[t]=r.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t];return r&&r.has(n)}getEntries(e){return(this.index[e]||new $a(ro.comparator)).toArray()}}
/**
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
 */class fp{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new fp(0)}static bs(){return new fp(-1)}}
// Copyright 2024 Google LLC* @license
function gp(e,t){var n;let r=t;for(const s of e.stages)r=Ep({serializer:e.serializer,serverTimestampBehavior:null==(n=e.listenOptions)?void 0:n.serverTimestampBehavior},s,r);return r}function mp(e,t){return gp(e,[t]).length>0}function Ep(e,t,n){if(t instanceof Yh)return r=t,n.filter(e=>e.isFoundDocument()&&`/${e.key.getCollectionPath().canonicalString()}`===r.hr);var r;if(t instanceof Zh)return function(e,t,n){return n.filter(n=>{const r=hC(dC(t.condition).evaluate(e,n));return void 0!==r&&Wo(r,zo)})}(e,t,n);if(t instanceof Wh)return function(e,t,n){return n.filter(e=>e.isFoundDocument()&&e.key.getCollectionPath().lastSegment()===t.collectionId)}(0,t,n);if(t instanceof $h)return function(e,t,n){return n.filter(e=>e.isFoundDocument())}(0,0,n);if(t instanceof Xh)return function(e,t,n){return n.filter(e=>e.isFoundDocument()&&t.Pr.has(e.key.path.toStringWithLeadingSlash()))}(0,t,n);if(t instanceof eC)return function(e,t,n){return n.slice(0,t.limit)}(0,t,n);if(t instanceof rC)return function(e,t,n){const r=t.orderings.map(e=>({Ms:dC(e.expr),direction:e.direction}));return[...n].sort((t,n)=>{for(const{Ms:s,direction:i}of r){const r=hC(s.evaluate(e,t)),a=hC(s.evaluate(e,n)),o=Xo(r??qo,a??qo);if(0!==o)return"ascending"===i?o:-o}return 0})}(e,t,n);throw new Error(`Unknown stage: ${t._name}`)}function Dp(e){const t=function(e){for(let t=e.stages.length-1;t>=0;t--){const n=e.stages[t];if(n instanceof rC)return n.orderings}throw new Error("Pipeline must contain at least one Sort stage")}(e);return(n,r)=>{for(const s of t){const t=hC(dC(s.expr).evaluate({serializer:e.serializer},n)),i=hC(dC(s.expr).evaluate({serializer:e.serializer},r)),a=Xo(t||qo,i||qo);if(0!==a)return"ascending"===s.direction?a:-a}return 0}}function wp(e){for(let t=e.stages.length-1;t>=0;t--){const n=e.stages[t];if(n instanceof eC)return{limit:n.limit}}}
/**
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
 */class yp{constructor(){this.changes=new jc(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Dc.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return void 0!==n?Ul.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
/**
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
 */
/**
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
 */class vp{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}
/**
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
 */class _p{constructor(e,t,n,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(r=>(n=r,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==n&&VB(n.mutation,e,ao.empty(),yo.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,tu()).next(()=>t))}getLocalViewOfDocuments(e,t,n=tu()){const r=Wc();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,n).next(e=>{let t=Qc();return e.forEach((e,n)=>{t=t.insert(e,n.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){const n=Wc();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,tu()))}populateOverlays(e,t,n){const r=[];return n.forEach(e=>{t.has(e)||r.push(e)}),this.documentOverlayCache.getOverlays(e,r).next(e=>{e.forEach((e,n)=>{t.set(e,n)})})}computeViews(e,t,n,r){let s=qc();const i=Xc(),a=Xc();return t.forEach((e,t)=>{const a=n.get(t.key);r.has(t.key)&&(void 0===a||a.mutation instanceof qB)?s=s.insert(t.key,t):void 0!==a?(i.set(t.key,a.mutation.getFieldMask()),VB(a.mutation,t,a.mutation.getFieldMask(),yo.now())):i.set(t.key,ao.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>a.set(e,new vp(t,i.get(e)??null))),a))}recalculateAndSaveOverlays(e,t){const n=Xc();let r=new Qa((e,t)=>e-t),s=tu();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(const s of e)s.keys().forEach(e=>{const i=t.get(e);if(null===i)return;let a=n.get(e)||ao.empty();a=s.applyToLocalView(i,a),n.set(e,a);const o=(r.get(s.batchId)||tu()).add(e);r=r.insert(s.batchId,o)})}).next(()=>{const i=[],a=r.getReverseIterator();for(;a.hasNext();){const r=a.getNext(),o=r.key,B=r.value,c=$c();B.forEach(e=>{if(!s.has(e)){const r=HB(t.get(e),n.get(e));null!==r&&c.set(e,r),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,o,c))}return Ul.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,n,r){return ep(t)?this.getDocumentsMatchingPipeline(e,t,n,r):function(e){return uo.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):function(e){return null!==e.collectionGroup}(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,r):this.getDocumentsMatchingCollectionQuery(e,t,n,r)}getNextDocuments(e,t,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,r).next(s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,r-s.size):Ul.resolve(Wc());let a=-1,o=s;return i.next(t=>Ul.forEach(t,(t,n)=>(a<n.largestBatchId&&(a=n.largestBatchId),s.get(t)?Ul.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{o=o.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,o,t,tu())).next(e=>({batchId:a,changes:Yc(e)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new uo(t)).next(e=>{let t=Qc();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,n,r){const s=t.collectionGroup;let i=Qc();return this.indexManager.getCollectionParents(e,s).next(a=>Ul.forEach(a,a=>{const o=(B=t,c=a.child(s),new Nc(c,null,B.explicitOrderBy.slice(),B.filters.slice(),B.limit,B.limitType,B.startAt,B.endAt));var B,c;return this.getDocumentsMatchingCollectionQuery(e,o,n,r).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r))).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>xc(t,e)))}getDocumentsMatchingPipeline(e,t,n,r){if("collection_group"===oC(t)){const s=cC(t);let i=Qc();return this.indexManager.getCollectionParents(e,s).next(a=>Ul.forEach(a,a=>{const o=function(e,t){const n=e.stages.map(e=>e instanceof Wh?new Yh(t.canonicalString(),{}):e);return new aC(e.serializer,n)}(t,a.child(s));return this.getDocumentsMatchingPipeline(e,o,n,r).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}{let s;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next(i=>{switch(s=i,oC(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r);case"documents":let i=tu();for(const e of uC(t))i=i.add(uo.fromPath(e));return this.remoteDocumentCache.getEntries(e,i);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new eo("invalid-argument",`Invalid pipeline source to execute offline: ${Xd(t)}`)}}).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>mp(t,e)))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach((e,n)=>{const r=n.getKey();null===t.get(r)&&(t=t.insert(r,Dc.newInvalidDocument(r)))});let r=Qc();return t.forEach((t,s)=>{const i=e.get(t);void 0!==i&&VB(i.mutation,s,ao.empty(),yo.now()),n(s)&&(r=r.insert(t,s))}),r}getOverlaysForPipeline(e,t,n){switch(oC(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ro.fromString(BC(t)),n);case"collection_group":throw new eo("invalid-argument",`Unexpected collection group pipeline: ${Xd(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,uC(t).map(e=>uo.fromPath(e)));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new eo("invalid-argument",`Failed to get overlays for pipeline: ${Xd(t)}`)}}}
/**
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
 */class Ip{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return Ul.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,{id:(n=t).id,version:n.version,createTime:bu(n.createTime)}),Ul.resolve();var n}getNamedQuery(e,t){return Ul.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,{name:(n=t).name,query:Cp(n.bundledQuery),readTime:bu(n.readTime)}),Ul.resolve();var n}}
/**
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
 */class Tp{constructor(){this.overlays=new Qa(uo.comparator),this.Gs=new Map}getOverlay(e,t){return Ul.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Wc();return Ul.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&n.set(t,e)})).next(()=>n)}getAllOverlays(e,t){const n=Wc();return this.overlays.forEach((e,r)=>{r.largestBatchId>t&&n.set(e,r)}),Ul.resolve(n)}saveOverlays(e,t,n){return n.forEach((n,r)=>{this.Zr(e,t,r)}),Ul.resolve()}removeOverlaysForBatchId(e,t,n){const r=this.Gs.get(n);return void 0!==r&&(r.forEach(e=>this.overlays=this.overlays.remove(e)),this.Gs.delete(n)),Ul.resolve()}getOverlaysForCollection(e,t,n){const r=Wc(),s=t.length+1,i=new uo(t.child("")),a=this.overlays.getIteratorFrom(i);for(;a.hasNext();){const e=a.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>n&&r.set(e.getKey(),e)}return Ul.resolve(r)}getOverlaysForCollectionGroup(e,t,n,r){let s=new Qa((e,t)=>e-t);const i=this.overlays.getIterator();for(;i.hasNext();){const e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>n){let t=s.get(e.largestBatchId);null===t&&(t=Wc(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}const a=Wc(),o=s.getIterator();for(;o.hasNext()&&(o.getNext().value.forEach((e,t)=>a.set(e,t)),!(a.size()>=r)););return Ul.resolve(a)}Zr(e,t,n){const r=this.overlays.get(n.key);if(null!==r){const e=this.Gs.get(r.largestBatchId).delete(n.key);this.Gs.set(r.largestBatchId,e)}this.overlays=this.overlays.insert(n.key,new up(t,n));let s=this.Gs.get(t);void 0===s&&(s=tu(),this.Gs.set(t,s)),this.Gs.set(t,s.add(n.key))}}
/**
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
 */class bp{constructor(){this.sessionToken=_o.EMPTY_BYTE_STRING}getSessionToken(e){return Ul.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,Ul.resolve()}}
/**
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
 */class Ap{constructor(){this.zs=new $a(Op.js),this.Hs=new $a(Op.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const n=new Op(e,t);this.zs=this.zs.add(n),this.Hs=this.Hs.add(n)}Ys(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Zs(new Op(e,t))}Xs(e,t){e.forEach(e=>this.removeReference(e,t))}e_(e){const t=new uo(new ro([])),n=new Op(t,e),r=new Op(t,e+1),s=[];return this.Hs.forEachInRange([n,r],e=>{this.Zs(e),s.push(e.key)}),s}t_(){this.zs.forEach(e=>this.Zs(e))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new uo(new ro([])),n=new Op(t,e),r=new Op(t,e+1);let s=tu();return this.Hs.forEachInRange([n,r],e=>{s=s.add(e.key)}),s}containsKey(e){const t=new Op(e,0),n=this.zs.firstAfterOrEqual(t);return null!==n&&e.isEqual(n.key)}}class Op{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return uo.comparator(e.key,t.key)||Va(e.r_,t.r_)}static Js(e,t){return Va(e.r_,t.r_)||uo.comparator(e.key,t.key)}}
/**
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
 */class Np{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new $a(Op.js)}checkEmpty(e){return Ul.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,n,r){const s=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new ap(s,t,n,r);this.mutationQueue.push(i);for(const a of r)this.i_=this.i_.add(new Op(a.key,s)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return Ul.resolve(i)}lookupMutationBatch(e,t){return Ul.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=this.__(n),s=r<0?0:r;return Ul.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return Ul.resolve(0===this.mutationQueue.length?-1:this.Gr-1)}getAllMutationBatches(e){return Ul.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new Op(t,0),r=new Op(t,Number.POSITIVE_INFINITY),s=[];return this.i_.forEachInRange([n,r],e=>{const t=this.s_(e.r_);s.push(t)}),Ul.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new $a(Va);return t.forEach(e=>{const t=new Op(e,0),r=new Op(e,Number.POSITIVE_INFINITY);this.i_.forEachInRange([t,r],e=>{n=n.add(e.r_)})}),Ul.resolve(this.o_(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1;let s=n;uo.isDocumentKey(s)||(s=s.child(""));const i=new Op(new uo(s),0);let a=new $a(Va);return this.i_.forEachWhile(e=>{const t=e.key.path;return!!n.isPrefixOf(t)&&(t.length===r&&(a=a.add(e.r_)),!0)},i),Ul.resolve(this.o_(a))}o_(e){const t=[];return e.forEach(e=>{const n=this.s_(e);null!==n&&t.push(n)}),t}removeMutationBatch(e,t){Ma(0===this.a_(t.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.i_;return Ul.forEach(t.mutations,r=>{const s=new Op(r.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.i_=n})}Hr(e){}containsKey(e,t){const n=new Op(t,0),r=this.i_.firstAfterOrEqual(n);return Ul.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,Ul.resolve()}a_(e,t){return this.__(e)}__(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}
/**
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
 */class Sp{constructor(e){this.u_=e,this.docs=new Qa(uo.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,r=this.docs.get(n),s=r?r.size:0,i=this.u_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return Ul.resolve(n?n.document.mutableCopy():Dc.newInvalidDocument(t))}getEntries(e,t){let n=qc();return t.forEach(e=>{const t=this.docs.get(e);n=n.insert(e,t?t.document.mutableCopy():Dc.newInvalidDocument(e))}),Ul.resolve(n)}getAllEntries(e){let t=qc();return this.docs.forEach((e,n)=>{t=t.insert(e,n.document)}),Ul.resolve(t)}getDocumentsMatchingQuery(e,t,n,r){let s,i;ep(t)?(s=ro.fromString(BC(t)),i=e=>mp(t,e)):(s=t.path,i=e=>xc(t,e));let a=qc();const o=new uo(s.child("__id-9223372036854775808__")),B=this.docs.getIteratorFrom(o);for(;B.hasNext();){const{key:e,value:{document:t}}=B.getNext();if(!s.isPrefixOf(e.path))break;e.path.length>s.length+1||vc(wc(t),n)<=0||(r.has(t.key)||i(t))&&(a=a.insert(t.key,t.mutableCopy()))}return Ul.resolve(a)}getAllFromCollectionGroup(e,t,n,r){Pa(9500)}c_(e,t){return Ul.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new Fp(this)}getSize(e){return Ul.resolve(this.size)}}class Fp extends yp{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?t.push(this.$s.addEntry(e,r)):this.$s.removeEntry(n)}),Ul.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}
/**
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
 */class Lp{constructor(e){this.persistence=e,this.l_=new jc(e=>sp(e),ip),this.lastRemoteSnapshotVersion=Ec.min(),this.highestTargetId=0,this.E_=0,this.h_=new Ap,this.targetCount=0,this.T_=fp.ws()}forEachTarget(e,t){return this.l_.forEach((e,n)=>t(n)),Ul.resolve()}getLastRemoteSnapshotVersion(e){return Ul.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return Ul.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),Ul.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.E_&&(this.E_=t),Ul.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new fp(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,Ul.resolve()}updateTargetData(e,t){return this.Ds(t),Ul.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,Ul.resolve()}removeTargets(e,t,n){let r=0;const s=[];return this.l_.forEach((i,a)=>{a.sequenceNumber<=t&&null===n.get(a.targetId)&&(this.l_.delete(i),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),r++)}),Ul.waitFor(s).next(()=>r)}getTargetCount(e){return Ul.resolve(this.targetCount)}getTargetData(e,t){const n=this.l_.get(t)||null;return Ul.resolve(n)}addMatchingKeys(e,t,n){return this.h_.Ys(t,n),Ul.resolve()}removeMatchingKeys(e,t,n){this.h_.Xs(t,n);const r=this.persistence.referenceDelegate,s=[];return r&&t.forEach(t=>{s.push(r.markPotentiallyOrphaned(e,t))}),Ul.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),Ul.resolve()}getMatchingKeysForTargetId(e,t){const n=this.h_.n_(t);return Ul.resolve(n)}containsKey(e,t){return Ul.resolve(this.h_.containsKey(t))}}
/**
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
 */class Rp{constructor(e,t){this.P_={},this.overlays={},this.I_=new Ml(0),this.R_=!1,this.R_=!0,this.A_=new bp,this.referenceDelegate=e(this),this.V_=new Lp(this),this.indexManager=new dp,this.remoteDocumentCache=new Sp(e=>this.referenceDelegate.d_(e)),this.serializer=new hp(t),this.f_=new Ip(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Tp,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.P_[e.toKey()];return n||(n=new Np(t,this.referenceDelegate),this.P_[e.toKey()]=n),n}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,n){Fa("MemoryPersistence","Starting transaction:",e);const r=new kp(this.I_.next());return this.referenceDelegate.m_(),n(r).next(e=>this.referenceDelegate.p_(r).next(()=>e)).toPromise().then(e=>(r.raiseOnCommittedEvent(),e))}g_(e,t){return Ul.or(Object.values(this.P_).map(n=>()=>n.containsKey(e,t)))}}class kp extends Gl{constructor(e){super(),this.currentSequenceNumber=e}}class Pp{constructor(e){this.persistence=e,this.y_=new Ap,this.w_=null}static b_(e){return new Pp(e)}get S_(){if(this.w_)return this.w_;throw Pa(60996)}addReference(e,t,n){return this.y_.addReference(n,t),this.S_.delete(n.toString()),Ul.resolve()}removeReference(e,t,n){return this.y_.removeReference(n,t),this.S_.add(n.toString()),Ul.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),Ul.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach(e=>this.S_.add(e.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.S_.add(e.toString()))}).next(()=>n.removeTargetData(e,t))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return Ul.forEach(this.S_,n=>{const r=uo.fromPath(n);return this.v_(e,r).next(e=>{e||t.removeEntry(r,Ec.min())})}).next(()=>(this.w_=null,t.apply(e)))}updateLimboDocument(e,t){return this.v_(e,t).next(e=>{e?this.S_.delete(t.toString()):this.S_.add(t.toString())})}d_(e){return 0}v_(e,t){return Ul.or([()=>Ul.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class xp{constructor(e,t){this.persistence=e,this.D_=new jc(e=>function(e){let t="";for(let n=0;n<e.length;n++)t.length>0&&(t=cp(t)),t=Bp(e.get(n),t);return cp(t)}(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=function(e,t){return new zl(e,t)}(this,t)}static b_(e,t){return new xp(e,t)}m_(){}p_(e){return Ul.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}Cs(e){let t=0;return this.sr(e,e=>{t++}).next(()=>t)}sr(e,t){return Ul.forEach(this.D_,(n,r)=>this.Os(e,n,r).next(e=>e?Ul.resolve():t(r)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.c_(e,r=>this.Os(e,r,t).next(e=>{e||(n++,s.removeEntry(r,Ec.min()))})).next(()=>s.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),Ul.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.D_.set(n,e.currentSequenceNumber),Ul.resolve()}removeReference(e,t,n){return this.D_.set(n,e.currentSequenceNumber),Ul.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),Ul.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=rB(e.data.value)),t}Os(e,t,n){return Ul.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const e=this.D_.get(t);return Ul.resolve(void 0!==e&&e>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}
/**
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
 */class Mp{constructor(e,t,n,r){this.targetId=e,this.fromCache=t,this.Vo=n,this.fo=r}static mo(e,t){let n=tu(),r=tu();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new Mp(e,t.fromCache,n,r)}}
/**
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
 */function Gp(e,t){return uo.comparator(e.key,t.key)}
/**
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
 */class Hp{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
/**
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
 */class Up{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=A()?8:function(e){const t=e.match(/Android ([\d.]+)/i),n=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(n)}(b())>0?6:4}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,n,r){const s={result:null};return this.vo(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.Do(e,t,r,n).next(e=>{s.result=e})}).next(()=>{if(s.result)return;const n=new Hp;return this.xo(e,t,n).next(r=>{if(s.result=r,this.yo)return this.Co(e,t,n,r.size)})}).next(()=>s.result)}Co(e,t,n,r){return ep(t)?Ul.resolve():n.documentReadCount<this.wo?(Na()<=K.DEBUG&&Fa("QueryEngine","SDK will not create cache indexes for query:",Pc(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),Ul.resolve()):(Na()<=K.DEBUG&&Fa("QueryEngine","Query:",Pc(t),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.bo*r?(Na()<=K.DEBUG&&Fa("QueryEngine","The SDK decides to create cache indexes for query:",Pc(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Rc(t))):Ul.resolve())}vo(e,t){if(ep(t))return Ul.resolve(null);let n=t;if(Fc(n))return Ul.resolve(null);let r=Rc(n);return this.indexManager.getIndexType(e,r).next(t=>0===t?null:(null!==n.limit&&1===t&&(n=kc(n,null,"F"),r=Rc(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(t=>{const s=tu(...t);return this.So.getDocuments(e,s).next(t=>this.indexManager.getMinOffset(e,r).next(r=>{const i=this.Fo(n,t);return this.Oo(n,i,s,r.readTime)?this.vo(e,kc(n,null,"F")):this.Mo(e,i,n,r)}))})))}Do(e,t,n,r){return(ep(t)?function(e){for(const t of e.stages){if(t instanceof eC||t instanceof tC)return!1;if(t instanceof Zh){if(t.condition instanceof Uh&&"exists"===t.condition._expr.name&&t.condition._expr.params[0]instanceof kh&&t.condition._expr.params[0].fieldName===to)continue;return!1}}return!0}(t):Fc(t))||r.isEqual(Ec.min())?Ul.resolve(null):this.So.getDocuments(e,n).next(s=>{const i=this.Fo(t,s);return this.Oo(t,i,n,r)?Ul.resolve(null):(Na()<=K.DEBUG&&Fa("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),tp(t)),this.Mo(e,i,t,function(e,t){const n=e.toTimestamp().seconds,r=e.toTimestamp().nanoseconds+1,s=Ec.fromTimestamp(1e9===r?new yo(n+1,0):new yo(n,r));return new yc(s,uo.empty(),t)}(r,-1)).next(e=>e))})}Fo(e,t){let n,r;return ep(e)?(n=new $a(Gp),r=t=>mp(e,t)):(n=new $a(Mc(e)),r=t=>xc(e,t)),t.forEach((e,t)=>{r(t)&&(n=n.add(t))}),n}Oo(e,t,n,r){if(ep(e))return e.stages.some(e=>e instanceof eC||e instanceof tC);if(null===e.limit)return!1;if(n.size!==t.size)return!0;const s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}xo(e,t,n){return Na()<=K.DEBUG&&Fa("QueryEngine","Using full collection scan to execute query:",tp(t)),this.So.getDocumentsMatchingQuery(e,t,yc.min(),n)}Mo(e,t,n,r){return this.So.getDocumentsMatchingQuery(e,n,r).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}
/**
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
 */const Vp="LocalStore";class Jp{constructor(e,t,n,r){this.persistence=e,this.No=t,this.serializer=r,this.Lo=new Qa(Va),this.Bo=new jc(e=>sp(e),ip),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(n)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new _p(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Lo))}}async function jp(e,t){const n=Ga(e);return await n.persistence.runTransaction("Handle user change","readonly",e=>{let r;return n.mutationQueue.getAllMutationBatches(e).next(s=>(r=s,n.qo(t),n.mutationQueue.getAllMutationBatches(e))).next(t=>{const s=[],i=[];let a=tu();for(const e of r){s.push(e.batchId);for(const t of e.mutations)a=a.add(t.key)}for(const e of t){i.push(e.batchId);for(const t of e.mutations)a=a.add(t.key)}return n.localDocuments.getDocuments(e,a).next(e=>({$o:e,removedBatchIds:s,addedBatchIds:i}))})})}function Kp(e){const t=Ga(e);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.V_.getLastRemoteSnapshotVersion(e))}function qp(e,t){const n=Ga(e),r=t.snapshotVersion;let s=n.Lo;return n.persistence.runTransaction("Apply remote event","readwrite-primary",e=>{const i=n.ko.newChangeBuffer({trackRemovals:!0});s=n.Lo;const a=[];t.targetChanges.forEach((i,o)=>{const B=s.get(o);if(!B)return;a.push(n.V_.removeMatchingKeys(e,i.removedDocuments,o).next(()=>n.V_.addMatchingKeys(e,i.addedDocuments,o)));let c=B.withSequenceNumber(e.currentSequenceNumber);null!==t.targetMismatches.get(o)?c=c.withResumeToken(_o.EMPTY_BYTE_STRING,Ec.min()).withLastLimboFreeSnapshotVersion(Ec.min()):i.resumeToken.approximateByteSize()>0&&(c=c.withResumeToken(i.resumeToken,r)),s=s.insert(o,c),function(e,t,n){if(0===e.resumeToken.approximateByteSize())return!0;if(t.snapshotVersion.toMicroseconds()-e.snapshotVersion.toMicroseconds()>=3e8)return!0;return n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0}(B,c,i)&&a.push(n.V_.updateTargetData(e,c))});let o=qc(),B=tu();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&a.push(n.persistence.referenceDelegate.updateLimboDocument(e,r))}),a.push(function(e,t,n){let r=tu(),s=tu();return n.forEach(e=>r=r.add(e)),t.getEntries(e,r).next(e=>{let r=qc();return n.forEach((n,i)=>{const a=e.get(n);i.isFoundDocument()!==a.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(Ec.min())?(t.removeEntry(n,i.readTime),r=r.insert(n,i)):!a.isValidDocument()||i.version.compareTo(a.version)>0||0===i.version.compareTo(a.version)&&a.hasPendingWrites?(t.addEntry(i),r=r.insert(n,i)):Fa(Vp,"Ignoring outdated watch update for ",n,". Current version:",a.version," Watch version:",i.version)}),{Ko:r,Qo:s}})}(e,i,t.documentUpdates).next(e=>{o=e.Ko,B=e.Qo})),!r.isEqual(Ec.min())){const t=n.V_.getLastRemoteSnapshotVersion(e).next(t=>n.V_.setTargetsMetadata(e,e.currentSequenceNumber,r));a.push(t)}return Ul.waitFor(a).next(()=>i.apply(e)).next(()=>n.localDocuments.getLocalViewOfDocuments(e,o,B)).next(()=>o)}).then(e=>(n.Lo=s,e))}function zp(e,t){const n=Ga(e);return n.persistence.runTransaction("Get next mutation batch","readonly",e=>(void 0===t&&(t=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(e,t)))}async function Qp(e,t,n){const r=Ga(e),s=r.Lo.get(t),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,e=>r.persistence.referenceDelegate.removeTarget(e,s))}catch(a){if(!Vl(a))throw a;Fa(Vp,`Failed to update sequence numbers for target ${t}: ${a}`)}r.Lo=r.Lo.remove(t),r.Bo.delete(s.target)}function Yp(e,t,n){const r=Ga(e);let s=Ec.min(),i=tu();return r.persistence.runTransaction("Execute query","readwrite",e=>function(e,t,n){const r=Ga(e),s=r.Bo.get(n);return void 0!==s?Ul.resolve(r.Lo.get(s)):r.V_.getTargetData(t,n)}(r,e,ep(t)?t:Rc(t)).next(t=>{if(t)return s=t.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(e,t.targetId).next(e=>{i=e})}).next(()=>r.No.getDocumentsMatchingQuery(e,t,n?s:Ec.min(),n?i:tu())).next(e=>(function(e,t){t.forEach((t,n)=>{const r=n.key.getCollectionGroup(),s=e.Uo.get(r)||Ec.min();n.readTime.compareTo(s)>0&&e.Uo.set(r,n.readTime)})}
/**
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
 */(r,e),{documents:e,Wo:i})))}class Wp{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){0===this.Yo&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve())))}ra(e){"Online"===this.state?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,"Online"===e&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?(La(t),this.Xo=!1):Fa("OnlineStateTracker",t)}ia(){null!==this.Zo&&(this.Zo.cancel(),this.Zo=null)}}
/**
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
 */const $p="RemoteStore";class Xp{constructor(e,t,n,r,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new fp(1e3),this.ca=new fp(1001),this.la=new Set,this.Ea=[],this.ha=s,this.ha.Qe(e=>{n.enqueueAndForget(async()=>{cf(this)&&(Fa($p,"Restarting streams for network reachability change."),await async function(e){const t=Ga(e);t.la.add(4),await ef(t),t.Ta.set("Unknown"),t.la.delete(4),await Zp(t)}(this))})}),this.Ta=new Wp(n,r)}}async function Zp(e){if(cf(e))for(const t of e.Ea)await t(!0)}async function ef(e){for(const t of e.Ea)await t(!1)}function tf(e,t){return e.oa.get(t)||void 0}function nf(e,t){const n=Ga(e),r=tf(n,t.targetId);if(void 0!==r&&n._a.has(r))return;const s=function(e,t){const n=tf(e,t);void 0!==n&&e.aa.delete(n);const r=(s=e,t%2!=0?s.ca.next():s.ua.next());var s;return e.oa.set(t,r),e.aa.set(r,t),r}(n,t.targetId);Fa($p,"remoteStoreListen mapping SDK target ID to remote",t.targetId,s);const i=new lp(t.target,s,t.purpose,t.sequenceNumber,t.snapshotVersion,t.lastLimboFreeSnapshotVersion,t.resumeToken);n._a.set(s,i),Bf(n)?of(n):bf(n).Yt()&&sf(n,i)}function rf(e,t){const n=Ga(e),r=bf(n),s=tf(n,t);Fa($p,"remoteStoreUnlisten removing mapping of SDK target ID to remote",t,s),n._a.delete(s),n.oa.delete(t),n.aa.delete(s),r.Yt()&&af(n,s),0===n._a.size&&(r.Yt()?r.en():cf(n)&&n.Ta.set("Unknown"))}function sf(e,t){if(e.Pa.J(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(Ec.min())>0){const n=e.aa.get(t.targetId);if(void 0===n)return void Fa($p,"SDK target ID not found for remote ID: "+t.targetId);const r=e.remoteSyncer.getRemoteKeysForTarget(n).size;t=t.withExpectedCount(r)}bf(e).Pn(t)}function af(e,t){e.Pa.J(t),bf(e).In(t)}function of(e){e.Pa=new pu({getRemoteKeysForTarget:t=>{const n=e.aa.get(t);return void 0!==n?e.remoteSyncer.getRemoteKeysForTarget(n):tu()},ye:t=>e._a.get(t)||null,Ve:()=>e.datastore.serializer.databaseId}),bf(e).start(),e.Ta.ea()}function Bf(e){return cf(e)&&!bf(e).Jt()&&e._a.size>0}function cf(e){return 0===Ga(e).la.size}function uf(e){e.Pa=void 0}async function lf(e){e.Ta.set("Online")}async function hf(e){e._a.forEach((t,n)=>{sf(e,t)})}async function Cf(e,t){uf(e),Bf(e)?(e.Ta.ra(t),of(e)):e.Ta.set("Unknown")}async function df(e,t,n){if(e.Ta.set("Online"),t instanceof hu&&2===t.state&&t.cause)try{await async function(e,t){const n=t.cause;for(const r of t.targetIds){if(e._a.has(r)){const t=e.aa.get(r);void 0!==t&&(await e.remoteSyncer.rejectListen(t,n),e.oa.delete(t),e.aa.delete(r)),e._a.delete(r)}e.Pa.removeTarget(r)}}(e,t)}catch(r){Fa($p,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await pf(e,r)}else if(t instanceof uu?e.Pa._e(t):t instanceof lu?e.Pa.he(t):e.Pa.ue(t),!n.isEqual(Ec.min()))try{const t=await Kp(e.localStore);n.compareTo(t)>=0&&await function(e,t){const n=e.Pa.fe(t);n.targetChanges.forEach((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=e._a.get(r);s&&e._a.set(r,s.withResumeToken(n.resumeToken,t))}}),n.targetMismatches.forEach((t,n)=>{const r=e._a.get(t);if(!r)return;e._a.set(t,r.withResumeToken(_o.EMPTY_BYTE_STRING,r.snapshotVersion)),af(e,t);const s=new lp(r.target,t,n,r.sequenceNumber);sf(e,s)});const r=function(e,t){const n=new Map;t.targetChanges.forEach((t,r)=>{const s=e.aa.get(r);void 0!==s&&n.set(s,t)});let r=new Qa(Va);return t.targetMismatches.forEach((t,n)=>{const s=e.aa.get(t);void 0!==s&&(r=r.insert(s,n))}),new Bu(t.snapshotVersion,n,r,t.documentUpdates,t.augmentedDocumentUpdates,t.resolvedLimboDocuments)}(e,n);return e.remoteSyncer.applyRemoteEvent(r)}(e,n)}catch(s){Fa($p,"Failed to raise snapshot:",s),await pf(e,s)}}async function pf(e,t,n){if(!Vl(t))throw t;e.la.add(1),await ef(e),e.Ta.set("Offline"),n||(n=()=>Kp(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{Fa($p,"Retrying IndexedDB access"),await n(),e.la.delete(1),await Zp(e)})}function ff(e,t){return t().catch(n=>pf(e,n,t))}async function gf(e){const t=Ga(e),n=Af(t);let r=t.sa.length>0?t.sa[t.sa.length-1].batchId:-1;for(;mf(t);)try{const e=await zp(t.localStore,r);if(null===e){0===t.sa.length&&n.en();break}r=e.batchId,Ef(t,e)}catch(s){await pf(t,s)}Df(t)&&wf(t)}function mf(e){return cf(e)&&e.sa.length<10}function Ef(e,t){e.sa.push(t);const n=Af(e);n.Yt()&&n.Rn&&n.An(t.mutations)}function Df(e){return cf(e)&&!Af(e).Jt()&&e.sa.length>0}function wf(e){Af(e).start()}async function yf(e){Af(e).fn()}async function vf(e){const t=Af(e);for(const n of e.sa)t.An(n.mutations)}async function _f(e,t,n){const r=e.sa.shift(),s=op.from(r,t,n);await ff(e,()=>e.remoteSyncer.applySuccessfulWrite(s)),await gf(e)}async function If(e,t){t&&Af(e).Rn&&await async function(e,t){if(function(e){switch(e){case Za.OK:return Pa(64938);case Za.CANCELLED:case Za.UNKNOWN:case Za.DEADLINE_EXCEEDED:case Za.RESOURCE_EXHAUSTED:case Za.INTERNAL:case Za.UNAVAILABLE:case Za.UNAUTHENTICATED:return!1;case Za.INVALID_ARGUMENT:case Za.NOT_FOUND:case Za.ALREADY_EXISTS:case Za.PERMISSION_DENIED:case Za.FAILED_PRECONDITION:case Za.ABORTED:case Za.OUT_OF_RANGE:case Za.UNIMPLEMENTED:case Za.DATA_LOSS:return!0;default:return Pa(15467,{code:e})}}(n=t.code)&&n!==Za.ABORTED){const n=e.sa.shift();Af(e).Xt(),await ff(e,()=>e.remoteSyncer.rejectFailedWrite(n.batchId,t)),await gf(e)}var n}(e,t),Df(e)&&wf(e)}async function Tf(e,t){const n=Ga(e);n.asyncQueue.verifyOperationInProgress(),Fa($p,"RemoteStore received new credentials");const r=cf(n);n.la.add(3),await ef(n),r&&n.Ta.set("Unknown"),await n.remoteSyncer.handleCredentialChange(t),n.la.delete(3),await Zp(n)}function bf(e){return e.Ia||(e.Ia=function(e,t,n){const r=Ga(e);return r.pn(),new Nl(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{ct:lf.bind(null,e),Et:hf.bind(null,e),Tt:Cf.bind(null,e),Tn:df.bind(null,e)}),e.Ea.push(async t=>{t?(e.Ia.Xt(),Bf(e)?of(e):e.Ta.set("Unknown")):(await e.Ia.stop(),uf(e))})),e.Ia}function Af(e){return e.Ra||(e.Ra=function(e,t,n){const r=Ga(e);return r.pn(),new Sl(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{ct:()=>Promise.resolve(),Et:yf.bind(null,e),Tt:If.bind(null,e),Vn:vf.bind(null,e),dn:_f.bind(null,e)}),e.Ea.push(async t=>{t?(e.Ra.Xt(),await gf(e)):(await e.Ra.stop(),e.sa.length>0&&(Fa($p,`Stopping write stream with ${e.sa.length} pending writes`),e.sa=[]))})),e.Ra
/**
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
 */}class Of{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):La("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout(()=>{this.muted||e(t)},0)}}
/**
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
 */class Nf{constructor(e,t,n,r,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new il,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,r,s){const i=Date.now()+n,a=new Nf(e,t,i,r,s);return a.start(n),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new eo(Za.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Sf(e,t){if(La("AsyncQueue",`${t}: ${e}`),Vl(e))return new eo(Za.UNAVAILABLE,`${t}: ${e}`);throw e}class Ff{constructor(){this.activeTargetIds=nu}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Lf{constructor(){this.fu=new Ff,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,n){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new Ff,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function Rf(){return"undefined"!=typeof document?document:null}
/**
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
 */class kf{static emptySet(e){return new kf(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||uo.comparator(t.key,n.key):(e,t)=>uo.comparator(e.key,t.key),this.keyedMap=Qc(),this.sortedSet=new Qa(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof kf))return!1;if(this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(!e.isEqual(r))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){const n=new kf;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}
/**
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
 */class Pf{constructor(){this.pu=new Qa(uo.comparator)}track(e){const t=e.doc.key,n=this.pu.get(t);n?0!==e.type&&3===n.type?this.pu=this.pu.insert(t,e):3===e.type&&1!==n.type?this.pu=this.pu.insert(t,{type:n.type,doc:e.doc}):2===e.type&&2===n.type?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):2===e.type&&0===n.type?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):1===e.type&&0===n.type?this.pu=this.pu.remove(t):1===e.type&&2===n.type?this.pu=this.pu.insert(t,{type:1,doc:n.doc}):0===e.type&&1===n.type?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):Pa(63341,{we:e,gu:n}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal((t,n)=>{e.push(n)}),e}}class xf{constructor(e,t,n,r,s,i,a,o,B){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=a,this.excludesMetadataChanges=o,this.hasCachedResults=B}static fromInitialDocuments(e,t,n,r,s){const i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new xf(e,t,kf.emptySet(t),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&rp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==n[r].type||!t[r].doc.isEqual(n[r].doc))return!1;return!0}}
/**
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
 */class Mf{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some(e=>e.vu())}}class Gf{constructor(){this.queries=Hf(),this.onlineState="Unknown",this.Du=new Set}terminate(){!function(e,t){const n=Ga(e),r=n.queries;n.queries=Hf(),r.forEach((e,n)=>{for(const r of n.bu)r.onError(t)})}(this,new eo(Za.ABORTED,"Firestore shutting down"))}}function Hf(){return new jc(e=>np(e),rp)}function Uf(e,t){const n=Ga(e);let r=!1;for(const s of t){const e=s.query,t=n.queries.get(e);if(t){for(const e of t.bu)e.Cu(s)&&(r=!0);t.wu=s}}r&&Jf(n)}function Vf(e,t,n){const r=Ga(e),s=r.queries.get(t);if(s)for(const i of s.bu)i.onError(n);r.queries.delete(t)}function Jf(e){e.Du.forEach(e=>{e.next()})}var jf,Kf;(Kf=jf||(jf={})).Default="default",Kf.Cache="cache";class qf{constructor(e,t,n){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=n||{}}Cu(e){if(!this.options.includeMetadataChanges){const t=[];for(const n of e.docChanges)3!==n.type&&t.push(n);e=new xf(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache)return!0;if(!this.vu())return!0;const n="Offline"!==t;return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}Bu(e){e=xf.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==jf.Cache}}
/**
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
 */class zf{constructor(e){this.key=e}}class Qf{constructor(e){this.key=e}}class Yf{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=tu(),this.mutatedKeys=tu(),this.Ju=ep(e)?Dp(e):Mc(e),this.Yu=new kf(this.Ju)}get Zu(){return this.zu}Xu(e,t){const n=t?t.ec:new Pf,r=t?t.Yu:this.Yu;let s=t?t.mutatedKeys:this.mutatedKeys,i=r,a=!1;const[o,B]=this.tc(this.query,r);e.inorderTraversal((e,t)=>{const c=r.get(e),u=function(e,t){return ep(e)?mp(e,t):xc(e,t)}(this.query,t)?t:null,l=!!c&&this.mutatedKeys.has(c.key),h=!!u&&(u.hasLocalMutations||this.mutatedKeys.has(u.key)&&u.hasCommittedMutations);let C=!1;c&&u?c.data.isEqual(u.data)?l!==h&&(n.track({type:3,doc:u}),C=!0):this.nc(c,u)||(n.track({type:2,doc:u}),C=!0,(o&&this.Ju(u,o)>0||B&&this.Ju(u,B)<0)&&(a=!0)):!c&&u?(n.track({type:0,doc:u}),C=!0):c&&!u&&(n.track({type:1,doc:c}),C=!0,(o||B)&&(a=!0)),C&&(u?(i=i.add(u),s=h?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))});const c=this.rc(this.query);if(c)if(ep(this.query)){const e=[];i.forEach(t=>e.push(t));const t=gp(this.query,e);let r=new kf(Dp(this.query));for(const n of t)r=r.add(n);i.forEach(e=>{r.has(e.key)||(s=s.delete(e.key),n.track({type:1,doc:e}))}),i=r}else{const e=this.sc(this.query);for(;i.size>c;){const t="F"===e?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),n.track({type:1,doc:t})}}return{Yu:i,ec:n,Oo:a,mutatedKeys:s}}rc(e){var t;return ep(e)?null==(t=wp(e))?void 0:t.limit:e.limit||void 0}sc(e){if(ep(e)){const t=wp(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var n;if(ep(e)){const r=null==(n=wp(e))?void 0:n.limit;return[t.size===r?t.last():null,null]}return["F"===e.limitType&&t.size===this.rc(this.query)?t.last():null,"L"===e.limitType&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,r){const s=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const i=e.ec.yu();i.sort((e,t)=>function(e,t){const n=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Pa(20277,{we:e})}};return n(e)-n(t)}(e.type,t.type)||this.Ju(e.doc,t.doc)),this._c(n),r=r??!1;const a=t&&!r?this.oc():[],o=0===this.Hu.size&&this.current&&!r?1:0,B=o!==this.ju;return this.ju=o,0!==i.length||B?{snapshot:new xf(this.query,e.Yu,s,i,e.mutatedKeys,0===o,B,!1,!!n&&n.resumeToken.approximateByteSize()>0),ac:a}:{ac:a}}xu(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new Pf,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach(e=>this.zu=this.zu.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.zu=this.zu.delete(e)),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=tu(),this.Yu.forEach(e=>{this.uc(e.key)&&(this.Hu=this.Hu.add(e.key))});const t=[];return e.forEach(e=>{this.Hu.has(e)||t.push(new Qf(e))}),this.Hu.forEach(n=>{e.has(n)||t.push(new zf(n))}),t}cc(e){this.zu=e.Wo,this.Hu=tu();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return xf.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,0===this.ju,this.hasCachedResults)}}const Wf="SyncEngine";class $f{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class Xf{constructor(e){this.key=e,this.Ec=!1}}class Zf{constructor(e,t,n,r,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.hc={},this.Tc=new jc(e=>np(e),rp),this.Pc=new Map,this.Ic=new Set,this.Rc=new Qa(uo.comparator),this.Ac=new Map,this.Vc=new Ap,this.dc={},this.fc=new Map,this.mc=fp.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return!0===this.gc}}async function eg(e,t,n=!0){const r=wg(e);let s;const i=r.Tc.get(t);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=await ng(r,t,n,!0),s}async function tg(e,t){const n=wg(e);await ng(n,t,!0,!1)}async function ng(e,t,n,r){const s=await function(e,t){const n=Ga(e);return n.persistence.runTransaction("Allocate target","readwrite",e=>{let r;return n.V_.getTargetData(e,t).next(s=>s?(r=s,Ul.resolve(r)):n.V_.allocateTargetId(e).next(s=>(r=new lp(t,s,"TargetPurposeListen",e.currentSequenceNumber),n.V_.addTargetData(e,r).next(()=>r))))}).then(e=>{const r=n.Lo.get(e.targetId);return(null===r||e.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Lo=n.Lo.insert(e.targetId,e),n.Bo.set(t,e.targetId)),e})}(e.localStore,ep(t)?t:Rc(t)),i=s.targetId,a=e.sharedClientState.addLocalQueryTarget(i,n);let o;return r&&(o=await async function(e,t,n,r,s){e.yc=(t,n,r)=>async function(e,t,n,r){let s=t.view.Xu(n);s.Oo&&(s=await Yp(e.localStore,t.query,!1).then(({documents:e})=>t.view.Xu(e,s)));const i=r&&r.targetChanges.get(t.targetId),a=r&&null!=r.targetMismatches.get(t.targetId),o=t.view.applyChanges(s,e.isPrimaryClient,i,a);return pg(e,t.targetId,o.ac),o.snapshot}(e,t,n,r);const i=await Yp(e.localStore,t,!0),a=new Yf(t,i.Wo),o=a.Xu(i.documents),B=cu.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==e.onlineState,s),c=a.applyChanges(o,e.isPrimaryClient,B);pg(e,n,c.ac);const u=new $f(t,n,a);return e.Tc.set(t,u),e.Pc.has(n)?e.Pc.get(n).push(t):e.Pc.set(n,[t]),c.snapshot}(e,t,i,"current"===a,s.resumeToken)),e.isPrimaryClient&&n&&nf(e.remoteStore,s),o}async function rg(e,t,n){const r=Ga(e),s=r.Tc.get(t),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter(e=>!rp(e,t))),void r.Tc.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Qp(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&rf(r.remoteStore,s.targetId),Cg(r,s.targetId)}).catch(Hl)):(Cg(r,s.targetId),await Qp(r.localStore,s.targetId,!0))}async function sg(e,t){const n=Ga(e),r=n.Tc.get(t),s=n.Pc.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),rf(n.remoteStore,r.targetId))}async function ig(e,t,n){const r=function(e){const t=Ga(e);return t.remoteStore.remoteSyncer.applySuccessfulWrite=cg.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=ug.bind(null,t),t}(e);try{const e=await function(e,t){const n=Ga(e),r=yo.now(),s=t.reduce((e,t)=>e.add(t.key),tu());let i,a;return n.persistence.runTransaction("Locally write mutations","readwrite",e=>{let o=qc(),B=tu();return n.ko.getEntries(e,s).next(e=>{o=e,o.forEach((e,t)=>{t.isValidDocument()||(B=B.add(e))})}).next(()=>n.localDocuments.getOverlayedDocuments(e,o)).next(s=>{i=s;const a=[];for(const e of t){const t=JB(e,i.get(e.key).overlayedDocument);null!=t&&a.push(new qB(e.key,t,pB(t.value.mapValue),xB.exists(!0)))}return n.mutationQueue.addMutationBatch(e,r,a,t)}).next(t=>{a=t;const r=t.applyToLocalDocumentSet(i,B);return n.documentOverlayCache.saveOverlays(e,t.batchId,r)})}).then(()=>({batchId:a.batchId,changes:Yc(i)}))}(r.localStore,t);r.sharedClientState.addPendingMutation(e.batchId),function(e,t,n){let r=e.dc[e.currentUser.toKey()];r||(r=new Qa(Va)),r=r.insert(t,n),e.dc[e.currentUser.toKey()]=r}(r,e.batchId,n),await mg(r,e.changes),await gf(r.remoteStore)}catch(s){const e=Sf(s,"Failed to persist write");n.reject(e)}}async function ag(e,t){const n=Ga(e);try{const e=await qp(n.localStore,t);t.targetChanges.forEach((e,t)=>{const r=n.Ac.get(t);r&&(Ma(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1,22616),e.addedDocuments.size>0?r.Ec=!0:e.modifiedDocuments.size>0?Ma(r.Ec,14607):e.removedDocuments.size>0&&(Ma(r.Ec,42227),r.Ec=!1))}),await mg(n,e,t)}catch(r){await Hl(r)}}function og(e,t,n){const r=Ga(e);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const e=[];r.Tc.forEach((n,r)=>{const s=r.view.xu(t);s.snapshot&&e.push(s.snapshot)}),function(e,t){const n=Ga(e);n.onlineState=t;let r=!1;n.queries.forEach((e,n)=>{for(const s of n.bu)s.xu(t)&&(r=!0)}),r&&Jf(n)}(r.eventManager,t),e.length&&r.hc.Tn(e),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function Bg(e,t,n){const r=Ga(e);r.sharedClientState.updateQueryState(t,"rejected",n);const s=r.Ac.get(t),i=s&&s.key;if(i){let e=new Qa(uo.comparator);e=e.insert(i,Dc.newNoDocument(i,Ec.min()));const n=tu().add(i),s=new Bu(Ec.min(),new Map,new Qa(Va),e,qc(),n);await ag(r,s),r.Rc=r.Rc.remove(i),r.Ac.delete(t),gg(r)}else await Qp(r.localStore,t,!1).then(()=>Cg(r,t,n)).catch(Hl)}async function cg(e,t){const n=Ga(e),r=t.batch.batchId;try{const e=await function(e,t){const n=Ga(e);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{const r=t.batch.keys(),s=n.ko.newChangeBuffer({trackRemovals:!0});return function(e,t,n,r){const s=n.batch,i=s.keys();let a=Ul.resolve();return i.forEach(e=>{a=a.next(()=>r.getEntry(t,e)).next(t=>{const i=n.docVersions.get(e);Ma(null!==i,48541),t.version.compareTo(i)<0&&(s.applyToRemoteDocument(t,n),t.isValidDocument()&&(t.setReadTime(n.commitVersion),r.addEntry(t)))})}),a.next(()=>e.mutationQueue.removeMutationBatch(t,s))}(n,e,t,s).next(()=>s.apply(e)).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=tu();for(let n=0;n<e.mutationResults.length;++n)e.mutationResults[n].transformResults.length>0&&(t=t.add(e.batch.mutations[n].key));return t}(t))).next(()=>n.localDocuments.getDocuments(e,r))})}(n.localStore,t);hg(n,r,null),lg(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await mg(n,e)}catch(s){await Hl(s)}}async function ug(e,t,n){const r=Ga(e);try{const e=await function(e,t){const n=Ga(e);return n.persistence.runTransaction("Reject batch","readwrite-primary",e=>{let r;return n.mutationQueue.lookupMutationBatch(e,t).next(t=>(Ma(null!==t,37113),r=t.keys(),n.mutationQueue.removeMutationBatch(e,t))).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,r)).next(()=>n.localDocuments.getDocuments(e,r))})}(r.localStore,t);hg(r,t,n),lg(r,t),r.sharedClientState.updateMutationState(t,"rejected",n),await mg(r,e)}catch(s){await Hl(s)}}function lg(e,t){(e.fc.get(t)||[]).forEach(e=>{e.resolve()}),e.fc.delete(t)}function hg(e,t,n){const r=Ga(e);let s=r.dc[r.currentUser.toKey()];if(s){const e=s.get(t);e&&(n?e.reject(n):e.resolve(),s=s.remove(t)),r.dc[r.currentUser.toKey()]=s}}function Cg(e,t,n=null){e.sharedClientState.removeLocalQueryTarget(t);for(const r of e.Pc.get(t))e.Tc.delete(r),n&&e.hc.wc(r,n);e.Pc.delete(t),e.isPrimaryClient&&e.Vc.e_(t).forEach(t=>{e.Vc.containsKey(t)||dg(e,t)})}function dg(e,t){e.Ic.delete(t.path.canonicalString());const n=e.Rc.get(t);null!==n&&(rf(e.remoteStore,n),e.Rc=e.Rc.remove(t),e.Ac.delete(n),gg(e))}function pg(e,t,n){for(const r of n)r instanceof zf?(e.Vc.addReference(r.key,t),fg(e,r)):r instanceof Qf?(Fa(Wf,"Document no longer in limbo: "+r.key),e.Vc.removeReference(r.key,t),e.Vc.containsKey(r.key)||dg(e,r.key)):Pa(19791,{bc:r})}function fg(e,t){const n=t.key,r=n.path.canonicalString();e.Rc.get(n)||e.Ic.has(r)||(Fa(Wf,"New document in limbo: "+n),e.Ic.add(r),gg(e))}function gg(e){for(;e.Ic.size>0&&e.Rc.size<e.maxConcurrentLimboResolutions;){const t=e.Ic.values().next().value;e.Ic.delete(t);const n=new uo(ro.fromString(t)),r=e.mc.next();e.Ac.set(r,new Xf(n)),e.Rc=e.Rc.insert(n,r),nf(e.remoteStore,new lp(Rc(Sc(n.path)),r,"TargetPurposeLimboResolution",Ml.wn))}}async function mg(e,t,n){const r=Ga(e),s=[],i=[],a=[];r.Tc.isEmpty()||(r.Tc.forEach((e,o)=>{a.push(r.yc(o,t,n).then(e=>{var t;if((e||n)&&r.isPrimaryClient){const s=e?!e.fromCache:null==(t=null==n?void 0:n.targetChanges.get(o.targetId))?void 0:t.current;r.sharedClientState.updateQueryState(o.targetId,s?"current":"not-current")}if(e){s.push(e);const t=Mp.mo(o.targetId,e);i.push(t)}}))}),await Promise.all(a),r.hc.Tn(s),await async function(e,t){const n=Ga(e);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",e=>Ul.forEach(t,t=>Ul.forEach(t.Vo,r=>n.persistence.referenceDelegate.addReference(e,t.targetId,r)).next(()=>Ul.forEach(t.fo,r=>n.persistence.referenceDelegate.removeReference(e,t.targetId,r)))))}catch(r){if(!Vl(r))throw r;Fa(Vp,"Failed to update sequence numbers: "+r)}for(const s of t){const e=s.targetId;if(!s.fromCache){const t=n.Lo.get(e),r=t.snapshotVersion,s=t.withLastLimboFreeSnapshotVersion(r);n.Lo=n.Lo.insert(e,s)}}}(r.localStore,i))}async function Eg(e,t){const n=Ga(e);if(!n.currentUser.isEqual(t)){Fa(Wf,"User change. New user:",t.toKey());const e=await jp(n.localStore,t);n.currentUser=t,s="'waitForPendingWrites' promise is rejected due to a user change.",(r=n).fc.forEach(e=>{e.forEach(e=>{e.reject(new eo(Za.CANCELLED,s))})}),r.fc.clear(),n.sharedClientState.handleUserChange(t,e.removedBatchIds,e.addedBatchIds),await mg(n,e.$o)}var r,s}function Dg(e,t){const n=Ga(e),r=n.Ac.get(t);if(r&&r.Ec)return tu().add(r.key);{let e=tu();const r=n.Pc.get(t);if(!r)return e;for(const t of r??[]){const r=n.Tc.get(t);e=e.unionWith(r.view.Zu)}return e}}function wg(e){const t=Ga(e);return t.remoteStore.remoteSyncer.applyRemoteEvent=ag.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Dg.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Bg.bind(null,t),t.hc.Tn=Uf.bind(null,t.eventManager),t.hc.wc=Vf.bind(null,t.eventManager),t}class yg{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Zu(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),await this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)}Cc(e,t){return null}Fc(e,t){return null}xc(e){return function(e,t,n,r){return new Jp(e,t,n,r)}(this.persistence,new Up,e.initialUser,this.serializer)}Dc(e){return new Rp(Pp.b_,this.serializer)}vc(e){return new Lf}async terminate(){var e,t;null==(e=this.gcScheduler)||e.stop(),null==(t=this.indexBackfillerScheduler)||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}yg.provider={build:()=>new yg};class vg extends yg{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){Ma(this.persistence.referenceDelegate instanceof xp,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new ql(n,e.asyncQueue,t)}Dc(e){const t=void 0!==this.cacheSizeBytes?xl.withCacheSize(this.cacheSizeBytes):xl.DEFAULT;return new Rp(e=>xp.b_(e,t),this.serializer)}}class _g{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>og(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=Eg.bind(null,this.syncEngine),await async function(e,t){const n=Ga(e);t?(n.la.delete(2),await Zp(n)):t||(n.la.add(2),await ef(n),n.Ta.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new Gf}createDatastore(e){const t=Zu(e.databaseInfo.databaseId),n=function(e){return new Tl(e)}(e.databaseInfo);return function(e,t,n,r){return new Ll(e,t,n,r)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return t=this.localStore,n=this.datastore,r=e.asyncQueue,s=e=>og(this.syncEngine,e,0),i=gl.Ye()?new gl:new pl,new Xp(t,n,r,s,i);var t,n,r,s,i}createSyncEngine(e,t){return function(e,t,n,r,s,i,a){const o=new Zf(e,t,n,r,s,i);return a&&(o.gc=!0),o}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(e){const t=Ga(e);Fa($p,"RemoteStore shutting down."),t.la.add(5),await ef(t),t.ha.shutdown(),t.Ta.set("Unknown")}(this.remoteStore),null==(e=this.datastore)||e.terminate(),null==(t=this.eventManager)||t.terminate()}}_g.provider={build:()=>new _g};
/**
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
 */
const Ig="FirestoreClient";class Tg{constructor(e,t,n,r,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=r,this.user=sl.UNAUTHENTICATED,this.clientId=Ua.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async e=>{Fa(Ig,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(n,e=>(Fa(Ig,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new il;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Sf(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function bg(e,t){e.asyncQueue.verifyOperationInProgress(),Fa(Ig,"Initializing OfflineComponentProvider");const n=e.configuration;await t.initialize(n);let r=n.initialUser;e.setCredentialChangeListener(async e=>{r.isEqual(e)||(await jp(t.localStore,e),r=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function Ag(e,t){e.asyncQueue.verifyOperationInProgress();const n=await async function(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){Fa(Ig,"Using user provided OfflineComponentProvider");try{await bg(e,e._uninitializedComponentsProvider._offline)}catch(t){const s=t;if(!("FirebaseError"===(n=s).name?n.code===Za.FAILED_PRECONDITION||n.code===Za.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&n instanceof DOMException)||22===n.code||20===n.code||11===n.code))throw s;Ra("Error using user provided cache. Falling back to memory cache: "+s),await bg(e,new yg)}}else Fa(Ig,"Using default OfflineComponentProvider"),await bg(e,new vg(void 0));var n;return e._offlineComponents}(e);Fa(Ig,"Initializing OnlineComponentProvider"),await t.initialize(n,e.configuration),e.setCredentialChangeListener(e=>Tf(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,n)=>Tf(t.remoteStore,n)),e._onlineComponents=t}async function Og(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(Fa(Ig,"Using user provided OnlineComponentProvider"),await Ag(e,e._uninitializedComponentsProvider._online)):(Fa(Ig,"Using default OnlineComponentProvider"),await Ag(e,new _g))),e._onlineComponents}async function Ng(e){const t=await Og(e),n=t.eventManager;return n.onListen=eg.bind(null,t.syncEngine),n.onUnlisten=rg.bind(null,t.syncEngine),n.onFirstRemoteStoreListen=tg.bind(null,t.syncEngine),n.onLastRemoteStoreUnlisten=sg.bind(null,t.syncEngine),n}function Sg(e,t,n={}){const r=new il;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,r,s){const i=new Of({next:o=>{i.Va(),t.enqueueAndForget(()=>async function(e,t){const n=Ga(e),r=t.query;let s=3;const i=n.queries.get(r);if(i){const e=i.bu.indexOf(t);e>=0&&(i.bu.splice(e,1),0===i.bu.length?s=t.vu()?0:1:!i.Su()&&t.vu()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}(e,a));const B=o.docs.has(n);!B&&o.fromCache?s.reject(new eo(Za.UNAVAILABLE,"Failed to get document because the client is offline.")):B&&o.fromCache&&r&&"server"===r.source?s.reject(new eo(Za.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(o)},error:e=>s.reject(e)}),a=new qf(Sc(n.path),i,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return async function(e,t){const n=Ga(e);let r=3;const s=t.query;let i=n.queries.get(s);i?!i.Su()&&t.vu()&&(r=2):(i=new Mf,r=t.vu()?0:1);try{switch(r){case 0:i.wu=await n.onListen(s,!0);break;case 1:i.wu=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const e=Sf(a,`Initialization of query '${ep(t.query)?Xd(t.query):Pc(t.query)}' failed`);return void t.onError(e)}n.queries.set(s,i),i.bu.push(t),t.xu(n.onlineState),i.wu&&t.Cu(i.wu)&&Jf(n)}(e,a)}(await Ng(e),e.asyncQueue,t,n,r)),r.promise}function Fg(e,t){const n=new il;return e.asyncQueue.enqueueAndForget(async()=>ig(await function(e){return Og(e).then(e=>e.syncEngine)}(e),t,n)),n.promise
/**
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
 */}let Lg=class{constructor(e,t,n,r,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new eh(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new Rg(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return(null==(e=this._document)?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Dh("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}},Rg=class extends Lg{data(){return super.data()}};
/**
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
 */class kg{convertValue(e,t="none"){switch(Yo(e)){case 0:return null;case 1:return e.booleanValue;case 2:return bo(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Ao(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Pa(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Bo(e,(e,r)=>{n[e]=this.convertValue(r,t)}),n}convertVectorValue(e){var t,n,r;const s=null==(r=null==(n=null==(t=e.fields)?void 0:t[Ko].arrayValue)?void 0:n.values)?void 0:r.map(e=>bo(e.doubleValue));return new sh(s)}convertGeoPoint(e){return new rl(bo(e.latitude),bo(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Ro(e);return null==n?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(ko(e));default:return null}}convertTimestamp(e){const t=To(e);return new yo(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=ro.fromString(e);Ma(Yu(n),9688,{name:e});const r=new Mo(n.get(1),n.get(3)),s=new uo(n.popFirst(5));return r.isEqual(t)||La(`A document reference to ${s} refers to a different database (${r.projectId}/${r.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}
/**
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
 */
/**
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
 */
const Pg="AsyncQueue";class xg{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new bl(this,"async_queue_retry"),this.Hc=()=>{const e=Rf();e&&Fa(Pg,"Visibility state changed to "+e.visibilityState),this.Ht.$t()},this.Jc=e;const t=Rf();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=Rf();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise(()=>{});const t=new il;return this.Zc(()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.$c.push(e),this.Xc()))}async Xc(){if(0!==this.$c.length){try{await this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(Kf){if(!Vl(Kf))throw Kf;Fa(Pg,"Operation failed with retryable error: "+Kf)}this.$c.length>0&&this.Ht.kt(()=>this.Xc())}}Zc(e){const t=this.Jc.then(()=>(this.Gc=!0,e().catch(e=>{throw this.Wc=e,this.Gc=!1,La("INTERNAL UNHANDLED ERROR: ",Mg(e)),e}).then(e=>(this.Gc=!1,e))));return this.Jc=t,t}enqueueAfterDelay(e,t,n){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const r=Nf.createAndSchedule(this,e,t,n,e=>this.el(e));return this.Qc.push(r),r}Yc(){this.Wc&&Pa(47125,{tl:Mg(this.Wc)})}verifyOperationInProgress(){}async nl(){let e;do{e=this.Jc,await e}while(e!==this.Jc)}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then(()=>{this.Qc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs);for(const t of this.Qc)if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.nl()})}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function Mg(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class Gg extends $l{constructor(e,t,n,r){super(e,t,n,r),this.type="firestore",this._queue=new xg,this._persistenceKey=(null==r?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new xg(e),this._firestoreClient=void 0,await e}}}function Hg(e,t){const n="object"==typeof e?e:rt(),r="string"==typeof e?e:t||xo,s=$e(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const e=(e=>{const t=v(e);if(!t)return;const n=t.lastIndexOf(":");if(n<=0||n+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(n+1),10);return"["===t[0]?[t.substring(1,n-1),r]:[t.substring(0,n),r]})("firestore");e&&Xl(s,...e)}return s}function Ug(e){if(e._terminated)throw new eo(Za.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,n,r,s;const i=e._freezeSettings(),a=function(e,t,n,r,s){return new Po(e,t,n,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,dl(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}(e._databaseId,(null==(t=e._app)?void 0:t.options.appId)||"",e._persistenceKey,null==(n=e._app)?void 0:n.options.apiKey,i);e._componentsProvider||(null==(r=i.localCache)?void 0:r._offlineComponentProvider)&&(null==(s=i.localCache)?void 0:s._onlineComponentProvider)&&(e._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),e._firestoreClient=new Tg(e._authCredentials,e._appCheckCredentials,e._queue,a,e._componentsProvider&&function(e){const t=null==e?void 0:e._online.build();return{_offline:null==e?void 0:e._offline.build(t),_online:t}}(e._componentsProvider))}
/**
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
 */(e),e._firestoreClient}class Vg extends kg{constructor(e){super(),this.firestore=e}convertBytes(e){return new el(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new eh(this.firestore,null,t)}}class Jg{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class jg extends Lg{constructor(e,t,n,r,s,i){super(e,t,n,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Kg(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(Dh("DocumentSnapshot.get",e));if(null!==n)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new eo(Za.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=jg._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()?(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t):t}}jg._jsonSchemaVersion="firestore/documentSnapshot/1.0",jg._jsonSchema={type:mo("string",jg._jsonSchemaVersion),bundleSource:mo("string","DocumentSnapshot"),bundleName:mo("string"),bundle:mo("string")};class Kg extends jg{data(e={}){return super.data(e)}}class qg{constructor(e,t,n,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new Jg(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new Kg(this._firestore,this._userDataWriter,n.key,n,new Jg(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new eo(Za.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(n=>{ep(e._snapshot.query)?Dp(e._snapshot.query):Mc(e.query._query);const r=new Kg(e._firestore,e._userDataWriter,n.doc.key,n.doc,new Jg(e._snapshot.mutatedKeys.has(n.doc.key),e._snapshot.fromCache),e.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:t++}})}{let n=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{const r=new Kg(e._firestore,e._userDataWriter,t.doc.key,t.doc,new Jg(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter);let s=-1,i=-1;return 0!==t.type&&(s=n.indexOf(t.doc.key),n=n.delete(t.doc.key)),1!==t.type&&(n=n.add(t.doc),i=n.indexOf(t.doc.key)),{type:zg(t.type),doc:r,oldIndex:s,newIndex:i}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new eo(Za.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=qg._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ua.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],r=[];return this.docs.forEach(e=>{null!==e._document&&(t.push(e._document),n.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),r.push(e.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function zg(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Pa(61501,{type:e})}}
/**
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
 */
/**
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
 */
function Qg(e){e=go(e,eh);const t=go(e.firestore,Gg);return Sg(Ug(t),e._key).then(n=>function(e,t,n){const r=n.docs.get(t._key),s=new Vg(e);return new jg(e,s,t._key,r,new Jg(n.hasPendingWrites,n.fromCache),t.converter)}(t,e,n))}function Yg(e,t,n){e=go(e,eh);const r=go(e.firestore,Gg),s=function(e,t,n){let r;return r=e?n&&(n.merge||n.mergeFields)?e.toFirestore(t,n):e.toFirestore(t):t,r}(e.converter,t,n);return $g(r,[hh(lh(r),"setDoc",e._key,s,null!==e.converter,n).toMutation(e._key,xB.none())])}function Wg(e,t,n,...r){e=go(e,eh);const s=go(e.firestore,Gg),i=lh(s);let a;return a="string"==typeof(t=M(t))||t instanceof tl?function(e,t,n,r,s,i){const a=e.createContext(1,t,n),o=[Dh(t,r,n)],B=[s];if(i.length%2!=0)throw new eo(Za.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let h=0;h<i.length;h+=2)o.push(Dh(t,i[h])),B.push(i[h+1]);const c=[],u=dB.empty();for(let h=o.length-1;h>=0;--h)if(!_h(c,o[h])){const e=o[h];let t=B[h];t=M(t);const n=a.childContextForFieldPath(e);if(t instanceof Ch)c.push(e);else{const r=ph(t,n);null!=r&&(c.push(e),u.set(e,r))}}const l=new ao(c);return new oh(u,l,a.fieldTransforms)}(i,"updateDoc",e._key,t,n,r):function(e,t,n,r){const s=e.createContext(1,t,n);Eh("Data must be an object, but it was:",s,r);const i=[],a=dB.empty();Bo(r,(e,r)=>{const o=yh(t,e,n);r=M(r);const B=s.childContextForFieldPath(o);if(r instanceof Ch)i.push(o);else{const e=ph(r,B);null!=e&&(i.push(o),a.set(o,e))}});const o=new ao(i);return new oh(a,o,s.fieldTransforms)}(i,"updateDoc",e._key,t),$g(s,[a.toMutation(e._key,xB.exists(!0))])}function $g(e,t){return Fg(Ug(e),t)}qg._jsonSchemaVersion="firestore/querySnapshot/1.0",qg._jsonSchema={type:mo("string",qg._jsonSchemaVersion),bundleSource:mo("string","QuerySnapshot"),bundleName:mo("string"),bundle:mo("string")};const Xg="@firebase/firestore",Zg="4.17.2";
/**
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
 */
!function(e,t=!0){(function(e){Aa=e})(tt),We(new U("firestore",(e,{instanceIdentifier:n,options:r})=>{const s=e.getProvider("app").getImmediate(),i=new Gg(new cl(e.getProvider("auth-internal")),new Cl(s,e.getProvider("app-check-internal")),function(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new eo(Za.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Mo(e.options.projectId,t)}
/**
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
 */(s,n),s);return r={useFetchStreams:t,...r},i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),it(Xg,Zg,e),it(Xg,Zg,"esm2020")}();export{rr as G,rt as a,Rs as b,Hg as c,rh as d,Qg as e,ns as f,st as g,Er as h,nt as i,fr as j,Qr as k,ts as l,Yg as m,nh as n,mr as o,Th as p,cr as q,dr as r,Sa as s,pr as t,Wg as u,gr as v};
