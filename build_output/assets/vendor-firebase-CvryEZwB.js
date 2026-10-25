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
 */const f=function(e){const t=[];let n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):55296==(64512&s)&&r+1<e.length&&56320==(64512&e.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t},g={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<e.length;s+=3){const t=e[s],i=s+1<e.length,a=i?e[s+1]:0,o=s+2<e.length,B=o?e[s+2]:0,c=t>>2,u=(3&t)<<4|a>>4;let l=(15&a)<<2|B>>6,h=63&B;o||(h=64,i||(l=64)),r.push(n[c],n[u],n[l],n[h])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(f(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):function(e){const t=[];let n=0,r=0;for(;n<e.length;){const s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-65536;t[r++]=String.fromCharCode(55296+(i>>10)),t[r++]=String.fromCharCode(56320+(1023&i))}else{const i=e[n++],a=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&a)}}return t.join("")}(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<e.length;){const t=n[e.charAt(s++)],i=s<e.length?n[e.charAt(s)]:0;++s;const a=s<e.length?n[e.charAt(s)]:64;++s;const o=s<e.length?n[e.charAt(s)]:64;if(++s,null==t||null==i||null==a||null==o)throw new m;const B=t<<2|i>>4;if(r.push(B),64!==a){const e=i<<4&240|a>>2;if(r.push(e),64!==o){const e=a<<6&192|o;r.push(e)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class m extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const E=function(e){return function(e){const t=f(e);return g.encodeByteArray(t,!0)}(e).replace(/\./g,"")},D=function(e){try{return g.decodeString(e,!0)}catch(Vf){console.error("base64Decode failed: ",Vf)}return null};
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
function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,y=()=>{try{return w()||(()=>{if("undefined"==typeof process)return;const e=p.__FIREBASE_DEFAULTS__;return e?JSON.parse(e):void 0})()||(()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(Vf){return}const t=e&&D(e[1]);return t&&JSON.parse(t)})()}catch(Vf){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${Vf}`)}},v=e=>{var t,n;return null==(n=null==(t=y())?void 0:t.emulatorHosts)?void 0:n[e]},_=()=>{var e;return null==(e=y())?void 0:e.config},I=e=>{var t;return null==(t=y())?void 0:t[`_${e}`]};
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
function b(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function A(){return!function(){var e;const t=null==(e=y())?void 0:e.forceEnvironment;if("node"===t)return!0;if("browser"===t)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(Vf){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class O extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,O.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,N.prototype.create)}}class N{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?function(e,t){try{let n=0,r="";for(;n<e.length;){const s=e.indexOf("{$",n);if(-1===s){r+=e.substring(n);break}const i=e.indexOf("}",s+2);if(-1===i){r+=e.substring(n);break}const a=e.substring(s+2,i),o=t[a];r+=e.substring(n,s)+(null!=o?String(o):`<${a}?>`),n=i+1}return r}catch(Vf){return e}}(s,n):"Error",a=`${this.serviceName}: ${i} (${r}).`;return new O(r,a,n)}}function S(e,t){if(e===t)return!0;const n=Object.keys(e),r=Object.keys(t);for(const s of n){if(!r.includes(s))return!1;const n=e[s],i=t[s];if(F(n)&&F(i)){if(!S(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function F(e){return null!==e&&"object"==typeof e}
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
 */function L(e){const t=[];for(const[n,r]of Object.entries(e))Array.isArray(r)?r.forEach(e=>{t.push(encodeURIComponent(n)+"="+encodeURIComponent(e))}):t.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return t.length?"&"+t.join("&"):""}function R(e){const t={};return e.replace(/^\?/,"").split("&").forEach(e=>{if(e){const[n,r]=e.split("=");t[decodeURIComponent(n)]=decodeURIComponent(r)}}),t}function k(e){const t=e.indexOf("?");if(!t)return"";const n=e.indexOf("#",t);return e.substring(t,n>0?n:void 0)}class P{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(e=>{this.error(e)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let r;if(void 0===e&&void 0===t&&void 0===n)throw new Error("Missing Observer.");r=function(e,t){if("object"!=typeof e||null===e)return!1;for(const n of t)if(n in e&&"function"==typeof e[n])return!0;return!1}(e,["next","error","complete"])?e:{next:e,error:t,complete:n},void 0===r.next&&(r.next=x),void 0===r.error&&(r.error=x),void 0===r.complete&&(r.complete=x);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch(Vf){}}),this.observers.push(r),s}unsubscribeOne(e){void 0!==this.observers&&void 0!==this.observers[e]&&(delete this.observers[e],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[e])try{t(this.observers[e])}catch(Vf){"undefined"!=typeof console&&console.error&&console.error(Vf)}})}close(e){this.finalized||(this.finalized=!0,void 0!==e&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function x(){}
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
 */class J{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const e=new T;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:t});n&&e.resolve(n)}catch(Vf){}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(null==e?void 0:e.identifier),n=(null==e?void 0:e.optional)??!1;if(!this.isInitialized(t)&&!this.shouldAutoInitialize()){if(n)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:t})}catch(Vf){if(n)return null;throw Vf}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
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
 */(e))try{this.getOrInitializeService({instanceIdentifier:V})}catch(Vf){}for(const[e,t]of this.instancesDeferred.entries()){const n=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:n});t.resolve(e)}catch(Vf){}}}}clearInstance(e=V){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=V){return this.instances.has(e)}getOptions(e=V){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,i]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&i.resolve(r)}return r}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(n)??new Set;r.add(e),this.onInitCallbacks.set(n,r);const s=this.instances.get(n);return s&&e(s,n),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const r of n)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=e,r===V?void 0:r),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}var r;return n||null}normalizeInstanceIdentifier(e=V){return this.component?this.component.multipleInstances?e:V:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class j{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new J(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}
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
class de{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(function(e){const t=e.getComponent();return"VERSION"===(null==t?void 0:t.type)}(e)){const t=e.getImmediate();return`${t.library}/${t.version}`}return null}).filter(e=>e).join(" ")}}const pe="@firebase/app",fe="0.16.2",ge=new $("@firebase/app"),me="@firebase/app-compat",Ee="@firebase/analytics-compat",De="@firebase/analytics",we="@firebase/app-check-compat",ye="@firebase/app-check",ve="@firebase/auth",_e="@firebase/auth-compat",Ie="@firebase/database",Te="@firebase/data-connect",be="@firebase/database-compat",Ae="@firebase/functions",Oe="@firebase/functions-compat",Ne="@firebase/installations",Se="@firebase/installations-compat",Fe="@firebase/messaging",Le="@firebase/messaging-compat",Re="@firebase/performance",ke="@firebase/performance-compat",Pe="@firebase/remote-config",xe="@firebase/remote-config-compat",Me="@firebase/storage",Ge="@firebase/storage-compat",He="@firebase/firestore",Ue="@firebase/ai",Ve="@firebase/firestore-compat",Je="firebase",je="[DEFAULT]",Ke={[pe]:"fire-core",[me]:"fire-core-compat",[De]:"fire-analytics",[Ee]:"fire-analytics-compat",[ye]:"fire-app-check",[we]:"fire-app-check-compat",[ve]:"fire-auth",[_e]:"fire-auth-compat",[Ie]:"fire-rtdb",[Te]:"fire-data-connect",[be]:"fire-rtdb-compat",[Ae]:"fire-fn",[Oe]:"fire-fn-compat",[Ne]:"fire-iid",[Se]:"fire-iid-compat",[Fe]:"fire-fcm",[Le]:"fire-fcm-compat",[Re]:"fire-perf",[ke]:"fire-perf-compat",[Pe]:"fire-rc",[xe]:"fire-rc-compat",[Me]:"fire-gcs",[Ge]:"fire-gcs-compat",[He]:"fire-fst",[Ve]:"fire-fst-compat",[Ue]:"fire-vertex","fire-js":"fire-js",[Je]:"fire-js-all"},qe=new Map,ze=new Map,Qe=new Map;function Ye(e,t){try{e.container.addComponent(t)}catch(Vf){ge.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,Vf)}}function We(e){const t=e.name;if(Qe.has(t))return ge.debug(`There were multiple attempts to register component ${t}.`),!1;Qe.set(t,e);for(const n of qe.values())Ye(n,e);for(const n of ze.values())Ye(n,e);return!0}function $e(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function Xe(e){return null!=e&&void 0!==e.settings}
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
 */const at="firebase-heartbeat-store";let ot=null;function Bt(){return ot||(ot=function(e,t,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(e,t),o=Be(a);return r&&a.addEventListener("upgradeneeded",e=>{r(Be(a.result),e.oldVersion,e.newVersion,Be(a.transaction),e)}),n&&a.addEventListener("blocked",e=>n(e.oldVersion,e.newVersion,e)),o.then(e=>{i&&e.addEventListener("close",()=>i()),s&&e.addEventListener("versionchange",e=>s(e.oldVersion,e.newVersion,e))}).catch(()=>{}),o}("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(at)}catch(Vf){console.warn(Vf)}}}).catch(e=>{throw Ze.create("idb-open",{originalErrorMessage:e.message})})),ot}async function ct(e,t){try{const n=(await Bt()).transaction(at,"readwrite"),r=n.objectStore(at);await r.put(t,ut(e)),await n.done}catch(Vf){if(Vf instanceof O)ge.warn(Vf.message);else{const t=Ze.create("idb-set",{originalErrorMessage:null==Vf?void 0:Vf.message});ge.warn(t.message)}}}function ut(e){return`${e.name}!${e.options.appId}`}
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
 */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(Vf){ge.warn(Vf)}}async getHeartbeatsHeader(){var e;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null==(e=this._heartbeatsCache)?void 0:e.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const t=ht(),{heartbeatsToSend:n,unsentEntries:r}=function(e,t=1024){const n=[];let r=e.slice();for(const s of e){const e=n.find(e=>e.agent===s.agent);if(e){if(e.dates.push(s.date),dt(n)>t){e.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),dt(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),s=E(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(Vf){return ge.warn(Vf),""}}}function ht(){return(new Date).toISOString().substring(0,10)}class Ct{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(Vf){return!1}}()&&new Promise((e,t)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var e;t((null==(e=s.error)?void 0:e.message)||"")}}catch(n){t(n)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const t=(await Bt()).transaction(at),n=await t.objectStore(at).get(ut(e));return await t.done,n}catch(Vf){if(Vf instanceof O)ge.warn(Vf.message);else{const t=Ze.create("idb-get",{originalErrorMessage:null==Vf?void 0:Vf.message});ge.warn(t.message)}}}(this.app);return(null==e?void 0:e.heartbeats)?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return ct(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return ct(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:[...t.heartbeats,...e.heartbeats]})}}}function dt(e){return E(JSON.stringify({version:2,heartbeats:e})).length}var pt;
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
 */function yt(e,...t){throw Tt(e,...t)}function vt(e,...t){return Tt(e,...t)}function _t(e,t,n){const r={...gt(),[t]:n};return new N("auth","Firebase",r).create(t,{appName:e.name})}function It(e){return _t(e,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Tt(e,...t){if("string"!=typeof e){const n=t[0],r=[...t.slice(1)];return r[0]&&(r[0].appName=e.name),e._errorFactory.create(n,...r)}return mt.create(e,...t)}function bt(e,t,...n){if(!e)throw Tt(t,...n)}function At(e){const t="INTERNAL ASSERTION FAILED: "+e;throw wt(t),new Error(t)}function Ot(e,t){e||At(t)}
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
 */function Nt(){var e;return"undefined"!=typeof self&&(null==(e=self.location)?void 0:e.href)||""}function St(){var e;return"undefined"!=typeof self&&(null==(e=self.location)?void 0:e.protocol)||null}
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
 */function Ft(){return"undefined"==typeof navigator||!navigator||!("onLine"in navigator)||"boolean"!=typeof navigator.onLine||"http:"!==St()&&"https:"!==St()&&!function(){const e="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof e&&void 0!==e.id}()&&!("connection"in navigator)||navigator.onLine}
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
class Lt{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ot(t>e,"Short delay should be less than long delay!"),this.isMobile="undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(b())||"object"==typeof navigator&&"ReactNative"===navigator.product}get(){return Ft()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}
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
 */function Rt(e,t){Ot(e.emulator,"Emulator should always be set here");const{url:n}=e.emulator;return t?`${n}${t.startsWith("/")?t.slice(1):t}`:n}
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
 */class kt{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:"undefined"!=typeof globalThis&&globalThis.fetch?globalThis.fetch:"undefined"!=typeof fetch?fetch:void At("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:"undefined"!=typeof globalThis&&globalThis.Headers?globalThis.Headers:"undefined"!=typeof Headers?Headers:void At("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:"undefined"!=typeof globalThis&&globalThis.Response?globalThis.Response:"undefined"!=typeof Response?Response:void At("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}
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
 */const Pt={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"},xt=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Mt=new Lt(3e4,6e4);
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
 */function Gt(e,t){return e.tenantId&&!t.tenantId?{...t,tenantId:e.tenantId}:t}async function Ht(e,t,n,r,s={}){return Ut(e,s,async()=>{let s={},i={};r&&("GET"===t?i=r:s={body:JSON.stringify(r)});const a=L({...i,key:e.config.apiKey}).slice(1),o=await e._getAdditionalHeaders();o["Content-Type"]="application/json",e.languageCode&&(o["X-Firebase-Locale"]=e.languageCode);const B={method:t,headers:o,...s};return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent||(B.referrerPolicy="strict-origin-when-cross-origin"),e.emulatorConfig&&G(e.emulatorConfig.host)&&(B.credentials="include"),kt.fetch()(await Jt(e,e.config.apiHost,n,a),B)})}async function Ut(e,t,n){e._canInitEmulator=!1;const r={...Pt,...t};try{const t=new Kt(e),s=await Promise.race([n(),t.promise]);t.clearNetworkTimeout();const i=await s.json();if("needConfirmation"in i)throw qt(e,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{const t=s.ok?i.errorMessage:i.error.message,[n,a]=t.split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===n)throw qt(e,"credential-already-in-use",i);if("EMAIL_EXISTS"===n)throw qt(e,"email-already-in-use",i);if("USER_DISABLED"===n)throw qt(e,"user-disabled",i);const o=r[n]||n.toLowerCase().replace(/[_\s]+/g,"-");if(a)throw _t(e,o,a);yt(e,o)}}catch(Vf){if(Vf instanceof O)throw Vf;yt(e,"network-request-failed",{message:String(Vf)})}}async function Vt(e,t,n,r,s={}){const i=await Ht(e,t,n,r,s);return"mfaPendingCredential"in i&&yt(e,"multi-factor-auth-required",{_serverResponse:i}),i}async function Jt(e,t,n,r){const s=`${t}${n}?${r}`,i=e,a=i.config.emulator?Rt(e.config,s):`${e.config.apiScheme}://${s}`;if(xt.includes(n)&&(await i._persistenceManagerAvailable,"COOKIE"===i._getPersistenceType())){return i._getPersistence()._getFinalTarget(a).toString()}return a}function jt(e){switch(e){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Kt{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((e,t)=>{this.timer=setTimeout(()=>t(vt(this.auth,"network-request-failed")),Mt.get())})}}function qt(e,t,n){const r={appName:e.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=vt(e,t,r);return s.customData._tokenResponse=n,s}function zt(e){return void 0!==e&&void 0!==e.enterprise}class Qt{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],void 0===e.recaptchaKey)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||0===this.recaptchaEnforcementState.length)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return jt(t.enforcementState);return null}isProviderEnabled(e){return"ENFORCE"===this.getProviderEnforcementState(e)||"AUDIT"===this.getProviderEnforcementState(e)}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Yt(e,t){return Ht(e,"POST","/v1/accounts:lookup",t)}
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
 */function Wt(e){if(e)try{const t=new Date(Number(e));if(!isNaN(t.getTime()))return t.toUTCString()}catch(Vf){}}function $t(e){return 1e3*Number(e)}function Xt(e){const[t,n,r]=e.split(".");if(void 0===t||void 0===n||void 0===r)return wt("JWT malformed, contained fewer than 3 sections"),null;try{const e=D(n);return e?JSON.parse(e):(wt("Failed to decode base64 JWT payload"),null)}catch(Vf){return wt("Caught error parsing JWT payload as JSON",null==Vf?void 0:Vf.toString()),null}}function Zt(e){const t=Xt(e);return bt(t,"internal-error"),bt(void 0!==t.exp,"internal-error"),bt(void 0!==t.iat,"internal-error"),Number(t.exp)-Number(t.iat)}
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
 */async function en(e,t,n=!1){if(n)return t;try{return await t}catch(Vf){throw Vf instanceof O&&function({code:e}){return"auth/user-disabled"===e||"auth/user-token-expired"===e}
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
 */(Vf)&&e.auth.currentUser===e&&await e.auth.signOut(),Vf}}class tn{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(e){if(e){const e=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),e}{this.errorBackoff=3e4;const e=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,e)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(Vf){return void("auth/network-request-failed"===(null==Vf?void 0:Vf.code)&&this.schedule(!0))}this.schedule()}}
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
 */class nn{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Wt(this.lastLoginAt),this.creationTime=Wt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}
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
 */async function rn(e){var t;const n=e.auth,r=await e.getIdToken(),s=await en(e,Yt(n,{idToken:r}));bt(null==s?void 0:s.users.length,n,"internal-error");const i=s.users[0];e._notifyReloadListener(i);const a=(null==(t=i.providerUserInfo)?void 0:t.length)?sn(i.providerUserInfo):[],o=(B=e.providerData,c=a,[...B.filter(e=>!c.some(t=>t.providerId===e.providerId)),...c]);var B,c;const u=e.isAnonymous,l=!(e.email&&i.passwordHash||(null==o?void 0:o.length)),h=!!u&&l,C={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new nn(i.createdAt,i.lastLoginAt),isAnonymous:h};Object.assign(e,C)}function sn(e){return e.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}
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
class an{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){bt(e.idToken,"internal-error"),bt(void 0!==e.idToken,"internal-error"),bt(void 0!==e.refreshToken,"internal-error");const t="expiresIn"in e&&void 0!==e.expiresIn?Number(e.expiresIn):Zt(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){bt(0!==e.length,"internal-error");const t=Zt(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return t||!this.accessToken||this.isExpired?(bt(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null):this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:r,expiresIn:s}=await async function(e,t){const n=await Ut(e,{},async()=>{const n=L({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:r,apiKey:s}=e.config,i=await Jt(e,r,"/v1/token",`key=${s}`),a=await e._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const o={method:"POST",headers:a,body:n};return e.emulatorConfig&&G(e.emulatorConfig.host)&&(o.credentials="include"),kt.fetch()(i,o)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}(e,t);this.updateTokensAndExpiration(n,r,Number(s))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+1e3*n}static fromJSON(e,t){const{refreshToken:n,accessToken:r,expirationTime:s}=t,i=new an;return n&&(bt("string"==typeof n,"internal-error",{appName:e}),i.refreshToken=n),r&&(bt("string"==typeof r,"internal-error",{appName:e}),i.accessToken=r),s&&(bt("number"==typeof s,"internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new an,this.toJSON())}_performRefresh(){return At("not implemented")}}
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
 */function on(e,t){bt("string"==typeof e||void 0===e,"internal-error",{appName:t})}class Bn{constructor({uid:e,auth:t,stsTokenManager:n,...r}){this.providerId="firebase",this.proactiveRefresh=new tn(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new nn(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await en(this,this.stsTokenManager.getToken(this.auth,e));return bt(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return async function(e,t=!1){const n=M(e),r=await n.getIdToken(t),s=Xt(r);bt(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i="object"==typeof s.firebase?s.firebase:void 0,a=null==i?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Wt($t(s.auth_time)),issuedAtTime:Wt($t(s.iat)),expirationTime:Wt($t(s.exp)),signInProvider:a||null,signInSecondFactor:(null==i?void 0:i.sign_in_second_factor)||null}}(this,e)}reload(){return async function(e){const t=M(e);await rn(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}(this)}_assign(e){this!==e&&(bt(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(e=>({...e})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Bn({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){bt(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await rn(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Xe(this.auth.app))return Promise.reject(It(this.auth));const e=await this.getIdToken();return await en(this,
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
async function(e,t){return Ht(e,"POST","/v1/accounts:delete",t)}(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,r=t.email??void 0,s=t.phoneNumber??void 0,i=t.photoURL??void 0,a=t.tenantId??void 0,o=t._redirectEventId??void 0,B=t.createdAt??void 0,c=t.lastLoginAt??void 0,{uid:u,emailVerified:l,isAnonymous:h,providerData:C,stsTokenManager:d}=t;bt(u&&d,e,"internal-error");const p=an.fromJSON(this.name,d);bt("string"==typeof u,e,"internal-error"),on(n,e.name),on(r,e.name),bt("boolean"==typeof l,e,"internal-error"),bt("boolean"==typeof h,e,"internal-error"),on(s,e.name),on(i,e.name),on(a,e.name),on(o,e.name),on(B,e.name),on(c,e.name);const f=new Bn({uid:u,auth:e,email:r,emailVerified:l,displayName:n,isAnonymous:h,photoURL:i,phoneNumber:s,tenantId:a,stsTokenManager:p,createdAt:B,lastLoginAt:c});return C&&Array.isArray(C)&&(f.providerData=C.map(e=>({...e}))),o&&(f._redirectEventId=o),f}static async _fromIdTokenResponse(e,t,n=!1){const r=new an;r.updateFromServerResponse(t);const s=new Bn({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:n});return await rn(s),s}static async _fromGetAccountInfoResponse(e,t,n){const r=t.users[0];bt(void 0!==r.localId,"internal-error");const s=void 0!==r.providerUserInfo?sn(r.providerUserInfo):[],i=!(r.email&&r.passwordHash||(null==s?void 0:s.length)),a=new an;a.updateFromIdToken(n);const o=new Bn({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:i}),B={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new nn(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash||(null==s?void 0:s.length))};return Object.assign(o,B),o}}
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
 */const cn=new Map;function un(e){Ot(e instanceof Function,"Expected a class definition");let t=cn.get(e);return t?(Ot(t instanceof e,"Instance stored in cache mismatched with class"),t):(t=new e,cn.set(e,t),t)}
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
 */class ln{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return void 0===t?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}ln.type="NONE";const hn=ln;
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
 */function Cn(e,t,n){return`firebase:${e}:${t}:${n}`}class dn{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:r,name:s}=this.auth;this.fullUserKey=Cn(this.userKey,r.apiKey,s),this.fullPersistenceKey=Cn("persistence",r.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if("string"==typeof e){const t=await Yt(this.auth,{idToken:e}).catch(()=>{});return t?Bn._fromGetAccountInfoResponse(this.auth,t,e):null}return Bn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();return await this.removeCurrentUser(),this.persistence=e,t?this.setCurrentUser(t):void 0}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,n="authUser"){if(!t.length)return new dn(un(hn),e,n);const r=(await Promise.all(t.map(async e=>{try{if(await e._isAvailable())return e}catch{return}}))).filter(e=>e);let s=r[0]||un(hn);const i=Cn(n,e.config.apiKey,e.name);let a=null;for(const B of t)try{const t=await B._get(i);if(t){let n;if("string"==typeof t){const r=await Yt(e,{idToken:t}).catch(()=>{});if(!r)break;n=await Bn._fromGetAccountInfoResponse(e,r,t)}else n=Bn._fromJSON(e,t);B!==s&&(a=n),s=B;break}}catch{}const o=r.filter(e=>e._shouldAllowMigration);return s._shouldAllowMigration&&o.length?(s=o[0],a&&await s._set(i,a.toJSON()),await Promise.all(t.map(async e=>{if(e!==s)try{await e._remove(i)}catch{}})),new dn(s,e,n)):new dn(s,e,n)}}
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
 */function pn(e){const t=e.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(En(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(fn(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(wn(t))return"Blackberry";if(yn(t))return"Webos";if(gn(t))return"Safari";if((t.includes("chrome/")||mn(t))&&!t.includes("edge/"))return"Chrome";if(Dn(t))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=e.match(t);if(2===(null==n?void 0:n.length))return n[1]}return"Other"}function fn(e=b()){return/firefox\//i.test(e)}function gn(e=b()){const t=e.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function mn(e=b()){return/crios\//i.test(e)}function En(e=b()){return/iemobile/i.test(e)}function Dn(e=b()){return/android/i.test(e)}function wn(e=b()){return/blackberry/i.test(e)}function yn(e=b()){return/webos/i.test(e)}function vn(e=b()){return/iphone|ipad|ipod/i.test(e)||/macintosh/i.test(e)&&/mobile/i.test(e)}function _n(){return function(){const e=b();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0}()&&10===document.documentMode}function In(e=b()){return vn(e)||Dn(e)||yn(e)||wn(e)||/windows phone/i.test(e)||En(e)}
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
 */function Tn(e,t=[]){let n;switch(e){case"Browser":n=pn(b());break;case"Worker":n=`${pn(b())}-${e}`;break;default:n=e}const r=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${tt}/${r}`}
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
 */class bn{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=t=>new Promise((n,r)=>{try{n(e(t))}catch(Vf){r(Vf)}});n.onAbort=t,this.queue.push(n);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(Vf){t.reverse();for(const r of t)try{r()}catch(n){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:null==Vf?void 0:Vf.message})}}}
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
 */class An{constructor(e){var t;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??6,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),void 0!==n.containsLowercaseCharacter&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),void 0!==n.containsUppercaseCharacter&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),void 0!==n.containsNumericCharacter&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),void 0!==n.containsNonAlphanumericCharacter&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,"ENFORCEMENT_STATE_UNSPECIFIED"===this.enforcementState&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(null==(t=e.allowedNonAlphanumericCharacters)?void 0:t.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){let n;this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);for(let r=0;r<e.length;r++)n=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}
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
 */class On{constructor(e,t,n,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Sn(this),this.idTokenSubscription=new Sn(this),this.beforeStateQueue=new bn(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=mt,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(e=>this._resolvePersistenceManagerAvailable=e)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=un(t)),this._initializationPromise=this.queue(async()=>{var n,r,s;if(!this._deleted){try{this.persistenceManager=await dn.create(this,e)}catch(Vf){Dt(`Failed to initialize persistence: ${Vf}`),this.persistenceManager=await dn.create(this,[])}finally{null==(n=this._resolvePersistenceManagerAvailable)||n.call(this)}if(!this._deleted){if(null==(r=this._popupRedirectResolver)?void 0:r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(Vf){}try{await this.initializeCurrentUser(t)}catch(Vf){Dt(`Failed to initialize current user: ${Vf}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=(null==(s=this.currentUser)?void 0:s.uid)||null,this._deleted||(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();return this.currentUser||e?this.currentUser&&e&&this.currentUser.uid===e.uid?(this._currentUser._assign(e),void(await this.currentUser.getIdToken())):void(await this._updateCurrentUser(e,!0)):void 0}async initializeCurrentUserFromIdToken(e){try{const t=await Yt(this,{idToken:e}),n=await Bn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Xe(this.app)){const e=this.app.settings.authIdToken;return e?new Promise(t=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(e).then(t,t))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const n=null==(t=this.redirectUser)?void 0:t._redirectEventId,i=null==r?void 0:r._redirectEventId,a=await this.tryRedirectSignIn(e);n&&n!==i||!(null==a?void 0:a.user)||(r=a.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(Vf){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(Vf))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return bt(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(Vf){await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await rn(e)}catch(Vf){if("auth/network-request-failed"!==(null==Vf?void 0:Vf.code))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;const e=navigator;return e.languages&&e.languages[0]||e.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Xe(this.app))return Promise.reject(It(this));const t=e?M(e):null;return t&&bt(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&bt(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Xe(this.app)?Promise.reject(It(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Xe(this.app)?Promise.reject(It(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(un(e))})}_getRecaptchaConfig(){return null==this.tenantId?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return null===this.tenantId?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await async function(e,t={}){return Ht(e,"GET","/v2/passwordPolicy",Gt(e,t))}
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
 */(this),t=new An(e);null===this.tenantId?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new N("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:await this.currentUser.getIdToken()};null!=this.tenantId&&(t.tenantId=this.tenantId),await async function(e,t){return Ht(e,"POST","/v2/accounts:revokeToken",Gt(e,t))}(this,t)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:null==(e=this._currentUser)?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return null===e?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&un(e)||this._popupRedirectResolver;bt(t,this,"argument-error"),this.redirectPersistenceManager=await dn.create(this,[un(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),(null==(t=this._currentUser)?void 0:t._redirectEventId)===e?this._currentUser:(null==(n=this.redirectUser)?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const t=(null==(e=this.currentUser)?void 0:e.uid)??null;this.lastNotifiedUid!==t&&(this.lastNotifiedUid=t,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,r){if(this._deleted)return()=>{};const s="function"==typeof t?t:t.next.bind(t);let i=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(bt(a,this,"internal-error"),a.then(()=>{i||s(this.currentUser)}).catch(e=>{if(!i)if("function"!=typeof t&&t.error)t.error(e);else{if(!n)throw e;n(e)}}),"function"==typeof t){const s=e.addObserver(t,n,r);return()=>{i=!0,s()}}{const n=e.addObserver(t);return()=>{i=!0,n()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(Vf){const t=_t(this,"internal-error",`An internal AuthError has occurred: ${(null==Vf?void 0:Vf.message)||String(Vf)}`);throw t.customData={originalError:Vf},t}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return bt(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){e&&!this.frameworks.includes(e)&&(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Tn(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await(null==(e=this.heartbeatServiceProvider.getImmediate({optional:!0}))?void 0:e.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(t["X-Firebase-AppCheck"]=r),t}async _getAppCheckToken(){var e;if(Xe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await(null==(e=this.appCheckServiceProvider.getImmediate({optional:!0}))?void 0:e.getToken());return(null==t?void 0:t.error)&&Dt(`Error while retrieving App Check token: ${t.error}`),null==t?void 0:t.token}}function Nn(e){return M(e)}class Sn{constructor(e){this.auth=e,this.observer=null,this.addObserver=function(e,t){const n=new P(e,t);return n.subscribe.bind(n)}(e=>this.observer=e)}get next(){return bt(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}
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
 */let Fn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Ln(e){return Fn.loadJS(e)}class Rn{constructor(){this.enterprise=new kn}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class kn{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}
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
 */const Pn="NO_RECAPTCHA",xn="onFirebaseAuthREInstanceReady";class Mn{constructor(e){this.type="recaptcha-enterprise",this.auth=Nn(e)}async verify(e="verify",t=!1){async function n(e){if(!t){if(null==e.tenantId&&null!=e._agentRecaptchaConfig)return e._agentRecaptchaConfig.siteKey;if(null!=e.tenantId&&void 0!==e._tenantRecaptchaConfigs[e.tenantId])return e._tenantRecaptchaConfigs[e.tenantId].siteKey}return new Promise(async(t,n)=>{(async function(e,t){return Ht(e,"GET","/v2/recaptchaConfig",Gt(e,t))})(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(r=>{if(void 0!==r.recaptchaKey){const n=new Qt(r);return null==e.tenantId?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,t(n.siteKey)}n(new Error("recaptcha Enterprise site key undefined"))}).catch(e=>{n(e)})})}function r(t,n,r){const s=window.grecaptcha;zt(s)?s.enterprise.ready(()=>{s.enterprise.execute(t,{action:e}).then(e=>{n(e)}).catch(()=>{n(Pn)})}):r(Error("No reCAPTCHA enterprise script loaded."))}if(this.auth.settings.appVerificationDisabledForTesting){return(new Rn).execute("siteKey",{action:"verify"})}return new Promise((e,s)=>{n(this.auth).then(async n=>{if(!t&&zt(window.grecaptcha)&&Mn.scriptInjectionDeferred)await Mn.scriptInjectionDeferred.promise,r(n,e,s);else{if("undefined"==typeof window)return void s(new Error("RecaptchaVerifier is only supported in browser"));let t=Fn.recaptchaEnterpriseScript;0!==t.length&&(t+=n+`&onload=${xn}`),Mn.scriptInjectionDeferred=new T,window[xn]=()=>{var e;null==(e=Mn.scriptInjectionDeferred)||e.resolve()},Ln(t).then(()=>{var e;return null==(e=Mn.scriptInjectionDeferred)?void 0:e.promise}).then(()=>{r(n,e,s)}).catch(e=>{s(e)})}}).catch(e=>{s(e)})})}}async function Gn(e,t,n,r=!1,s=!1){const i=new Mn(e);let a;if(s)a=Pn;else try{a=await i.verify(n)}catch(B){a=await i.verify(n,!0)}const o={...t};if("mfaSmsEnrollment"===n||"mfaSmsSignIn"===n){if("phoneEnrollmentInfo"in o){const e=o.phoneEnrollmentInfo.phoneNumber,t=o.phoneEnrollmentInfo.recaptchaToken;Object.assign(o,{phoneEnrollmentInfo:{phoneNumber:e,recaptchaToken:t,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in o){const e=o.phoneSignInInfo.recaptchaToken;Object.assign(o,{phoneSignInInfo:{recaptchaToken:e,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return o}return r?Object.assign(o,{captchaResp:a}):Object.assign(o,{captchaResponse:a}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function Hn(e,t,n,r,s){var i;if(null==(i=e._getRecaptchaConfig())?void 0:i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const s=await Gn(e,t,n,"getOobCode"===n);return r(e,s)}return r(e,t).catch(async s=>{if("auth/missing-recaptcha-token"===s.code){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const s=await Gn(e,t,n,"getOobCode"===n);return r(e,s)}return Promise.reject(s)})}
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
 */function Un(e,t,n){const r=Nn(e);bt(/^https?:\/\//.test(t),r,"invalid-emulator-scheme");const s=Vn(t),{host:i,port:a}=function(e){const t=Vn(e),n=/(\/\/)?([^?#/]+)/.exec(e.substr(t.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const e=s[1];return{host:e,port:Jn(r.substr(e.length+1))}}{const[e,t]=r.split(":");return{host:e,port:Jn(t)}}}(t),o=null===a?"":`:${a}`,B={url:`${s}//${i}${o}/`},c=Object.freeze({host:i,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:!1})});if(!r._canInitEmulator)return bt(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),void bt(S(B,r.config.emulator)&&S(c,r.emulatorConfig),r,"emulator-config-failed");r.config.emulator=B,r.emulatorConfig=c,r.settings.appVerificationDisabledForTesting=!0,G(i)?H(`${s}//${i}${o}`):function(){function e(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}"undefined"!=typeof console&&"function"==typeof console.info&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");"undefined"!=typeof window&&"undefined"!=typeof document&&("loading"===document.readyState?window.addEventListener("DOMContentLoaded",e):e())}
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
 */()}function Vn(e){const t=e.indexOf(":");return t<0?"":e.substr(0,t+1)}function Jn(e){if(!e)return null;const t=Number(e);return isNaN(t)?null:t}Mn.scriptInjectionDeferred=null;class jn{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return At("not implemented")}_getIdTokenResponse(e){return At("not implemented")}_linkToIdToken(e,t){return At("not implemented")}_getReauthenticationResolver(e){return At("not implemented")}}async function Kn(e,t){return Ht(e,"POST","/v1/accounts:signUp",t)}
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
 */async function qn(e,t){return Vt(e,"POST","/v1/accounts:signInWithPassword",Gt(e,t))}async function zn(e,t){return async function(e,t){return Ht(e,"POST","/v1/accounts:sendOobCode",Gt(e,t))}(e,t)}
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
class Qn extends jn{constructor(e,t,n,r=null){super("password",n),this._email=e,this._password=t,this._tenantId=r}static _fromEmailAndPassword(e,t){return new Qn(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new Qn(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t="string"==typeof e?JSON.parse(e):e;if((null==t?void 0:t.email)&&(null==t?void 0:t.password)){if("password"===t.signInMethod)return this._fromEmailAndPassword(t.email,t.password);if("emailLink"===t.signInMethod)return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":return Hn(e,{returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signInWithPassword",qn);case"emailLink":return async function(e,t){return Vt(e,"POST","/v1/accounts:signInWithEmailLink",Gt(e,t))}(e,{email:this._email,oobCode:this._password});default:yt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":return Hn(e,{idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Kn);case"emailLink":return async function(e,t){return Vt(e,"POST","/v1/accounts:signInWithEmailLink",Gt(e,t))}(e,{idToken:t,email:this._email,oobCode:this._password});default:yt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}
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
 */async function Yn(e,t){return Vt(e,"POST","/v1/accounts:signInWithIdp",Gt(e,t))}
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
 */class Wn extends jn{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Wn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):yt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t="string"==typeof e?JSON.parse(e):e,{providerId:n,signInMethod:r,...s}=t;if(!n||!r)return null;const i=new Wn(n,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){return Yn(e,this.buildRequest())}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Yn(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Yn(e,t)}buildRequest(){const e={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=L(t)}return e}}
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
 */class $n{constructor(e){const t=R(k(e)),n=t.apiKey??null,r=t.oobCode??null,s=function(e){switch(e){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}(t.mode??null);bt(n&&r&&s,"argument-error"),this.apiKey=n,this.operation=s,this.code=r,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=function(e){const t=R(k(e)).link,n=t?R(k(t)).deep_link_id:null,r=R(k(e)).deep_link_id;return(r?R(k(r)).link:null)||r||n||t||e}(e);try{return new $n(t)}catch{return null}}}
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
 */class Xn{constructor(){this.providerId=Xn.PROVIDER_ID}static credential(e,t){return Qn._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=$n.parseLink(t);return bt(n,"argument-error"),Qn._fromEmailAndCode(e,n.code,n.tenantId)}}Xn.PROVIDER_ID="password",Xn.EMAIL_PASSWORD_SIGN_IN_METHOD="password",Xn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";
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
class Zn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}
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
 */class er extends Zn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}
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
 */class tr extends er{constructor(){super("facebook.com")}static credential(e){return Wn._fromParams({providerId:tr.PROVIDER_ID,signInMethod:tr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return tr.credentialFromTaggedObject(e)}static credentialFromError(e){return tr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return tr.credential(e.oauthAccessToken)}catch{return null}}}tr.FACEBOOK_SIGN_IN_METHOD="facebook.com",tr.PROVIDER_ID="facebook.com";
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
class nr extends er{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Wn._fromParams({providerId:nr.PROVIDER_ID,signInMethod:nr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return nr.credentialFromTaggedObject(e)}static credentialFromError(e){return nr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return nr.credential(t,n)}catch{return null}}}nr.GOOGLE_SIGN_IN_METHOD="google.com",nr.PROVIDER_ID="google.com";
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
class rr extends er{constructor(){super("github.com")}static credential(e){return Wn._fromParams({providerId:rr.PROVIDER_ID,signInMethod:rr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return rr.credentialFromTaggedObject(e)}static credentialFromError(e){return rr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return rr.credential(e.oauthAccessToken)}catch{return null}}}rr.GITHUB_SIGN_IN_METHOD="github.com",rr.PROVIDER_ID="github.com";
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
class sr extends er{constructor(){super("twitter.com")}static credential(e,t){return Wn._fromParams({providerId:sr.PROVIDER_ID,signInMethod:sr.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return sr.credentialFromTaggedObject(e)}static credentialFromError(e){return sr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return sr.credential(t,n)}catch{return null}}}
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
async function ir(e,t){return Vt(e,"POST","/v1/accounts:signUp",Gt(e,t))}
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
 */sr.TWITTER_SIGN_IN_METHOD="twitter.com",sr.PROVIDER_ID="twitter.com";class ar{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,r=!1){const s=await Bn._fromIdTokenResponse(e,n,r),i=or(n);return new ar({user:s,providerId:i,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const r=or(n);return new ar({user:e,providerId:r,_tokenResponse:n,operationType:t})}}function or(e){return e.providerId?e.providerId:"phoneNumber"in e?"phone":null}
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
 */async function Br(e){var t;if(Xe(e.app))return Promise.reject(It(e));const n=Nn(e);if(await n._initializationPromise,null==(t=n.currentUser)?void 0:t.isAnonymous)return new ar({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await ir(n,{returnSecureToken:!0}),s=await ar._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}
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
 */class cr extends O{constructor(e,t,n,r){super(t.code,t.message),this.operationType=n,this.user=r,Object.setPrototypeOf(this,cr.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,r){return new cr(e,t,n,r)}}function ur(e,t,n,r){return("reauthenticate"===t?n._getReauthenticationResolver(e):n._getIdTokenResponse(e)).catch(n=>{if("auth/multi-factor-auth-required"===n.code)throw cr._fromErrorAndOperation(e,n,t,r);throw n})}
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
async function lr(e,t,n=!1){if(Xe(e.app))return Promise.reject(It(e));const r="signIn",s=await ur(e,r,t),i=await ar._fromIdTokenResponse(e,r,s);return n||await e._updateCurrentUser(i.user),i}
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
async function hr(e){const t=Nn(e);t._getPasswordPolicyInternal()&&await t._updatePasswordPolicy()}async function Cr(e,t,n){const r=Nn(e),s={requestType:"PASSWORD_RESET",email:t,clientType:"CLIENT_TYPE_WEB"};await Hn(r,s,"getOobCode",zn)}async function dr(e,t,n){if(Xe(e.app))return Promise.reject(It(e));const r=Nn(e),s=Hn(r,{returnSecureToken:!0,email:t,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",ir),i=await s.catch(t=>{throw"auth/password-does-not-meet-requirements"===t.code&&hr(e),t}),a=await ar._fromIdTokenResponse(r,"signIn",i);return await r._updateCurrentUser(a.user),a}function pr(e,t,n){return Xe(e.app)?Promise.reject(It(e)):async function(e,t){return lr(Nn(e),t)}(M(e),Xn.credential(t,n)).catch(async t=>{throw"auth/password-does-not-meet-requirements"===t.code&&hr(e),t})}
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
async function fr(e,t){const{displayName:n,photoURL:r}=t;if(void 0===n&&void 0===r)return;const s=M(e),i={idToken:await s.getIdToken(),displayName:n,photoUrl:r,returnSecureToken:!0},a=await en(s,async function(e,t){return Ht(e,"POST","/v1/accounts:update",t)}(s.auth,i));s.displayName=a.displayName||null,s.photoURL=a.photoUrl||null;const o=s.providerData.find(({providerId:e})=>"password"===e);o&&(o.displayName=s.displayName,o.photoURL=s.photoURL),await s._updateTokensIfNecessary(a)}function gr(e,t,n,r){return M(e).onAuthStateChanged(t,n,r)}function mr(e){return M(e).signOut()}const Er="__sak";
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
 */class Dr{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Er,"1"),this.storage.removeItem(Er),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}
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
 */class wr extends Dr{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=In(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),r=this.localCache[t];n!==r&&e(t,r,n)}}onStorageEvent(e,t=!1){if(!e.key)return void this.forAllChangedKeys((e,t,n)=>{this.notifyListeners(e,n)});const n=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const e=this.storage.getItem(n);(t||this.localCache[n]!==e)&&this.notifyListeners(n,e)},s=this.storage.getItem(n);_n()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,10):r()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const r of Array.from(n))r(t?JSON.parse(t):t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}wr.type="LOCAL";const yr=wr;
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
 */class vr extends Dr{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}vr.type="SESSION";const _r=vr;
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
class Ir{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(t=>t.isListeningto(e));if(t)return t;const n=new Ir(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:r,data:s}=t.data,i=this.handlersMap[r];if(!(null==i?void 0:i.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:r});const a=Array.from(i).map(async e=>e(t.origin,s)),o=await function(e){return Promise.all(e.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}(a);t.ports[0].postMessage({status:"done",eventId:n,eventType:r,response:o})}_subscribe(e,t){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),t&&0!==this.handlersMap[e].size||delete this.handlersMap[e],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}
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
function Tr(e="",t=10){let n="";for(let r=0;r<t;r++)n+=Math.floor(10*Math.random());return e+n}
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
 */Ir.receivers=[];class br{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const r="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((a,o)=>{const B=Tr("",20);r.port1.start();const c=setTimeout(()=>{o(new Error("unsupported_event"))},n);i={messageChannel:r,onMessage(e){const t=e;if(t.data.eventId===B)switch(t.data.status){case"ack":clearTimeout(c),s=setTimeout(()=>{o(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(t.data.response);break;default:clearTimeout(c),clearTimeout(s),o(new Error("invalid_response"))}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:B,data:t},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}}
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
 */function Ar(){return window}
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
function Or(){return void 0!==Ar().WorkerGlobalScope&&"function"==typeof Ar().importScripts}
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
const Nr="firebaseLocalStorageDb",Sr="firebaseLocalStorage",Fr="fbase_key";class Lr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Rr(e,t){return e.transaction([Sr],t?"readwrite":"readonly").objectStore(Sr)}function kr(){const e=indexedDB.open(Nr,1);return new Promise((t,n)=>{e.addEventListener("error",()=>{n(e.error)}),e.addEventListener("upgradeneeded",()=>{const t=e.result;try{t.createObjectStore(Sr,{keyPath:Fr})}catch(Vf){n(Vf)}}),e.addEventListener("success",async()=>{const n=e.result;n.objectStoreNames.contains(Sr)?t(n):(n.close(),await function(){const e=indexedDB.deleteDatabase(Nr);return new Lr(e).toPromise()}(),t(await kr()))})})}async function Pr(e,t,n){const r=Rr(e,!0).put({[Fr]:t,value:n});return new Lr(r).toPromise()}function xr(e,t){const n=Rr(e,!0).delete(t);return new Lr(n).toPromise()}class Mr{registerLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.addEventListener&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.removeEventListener&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise||(this.dbPromise=kr(),this.dbPromise.catch(()=>{this.dbPromise=null})),this.dbPromise}async _withRetries(e){let t=0;for(;;)try{const t=await this._openDb();return await e(t)}catch(Vf){if(t++>3)throw Vf;if(this.dbPromise){const e=this.dbPromise;this.dbPromise=null;try{(await e).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Or()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ir._getInstance(Or()?self:null),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await async function(){if(!(null==navigator?void 0:navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}(),!this.activeServiceWorker)return;this.sender=new br(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&(null==(e=n[0])?void 0:e.fulfilled)&&(null==(t=n[0])?void 0:t.value.includes("keyChanged"))&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){var t;if(this.sender&&this.activeServiceWorker&&((null==(t=null==navigator?void 0:navigator.serviceWorker)?void 0:t.controller)||null)===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return!!indexedDB&&(await this._withRetries(async e=>{await Pr(e,Er,"1"),await xr(e,Er)}),!0)}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Pr(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(t=>async function(e,t){const n=Rr(e,!1).get(t),r=await new Lr(n).toPromise();return void 0===r?null:r.value}(t,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>xr(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(e=>{const t=Rr(e,!1).getAll();return new Lr(t).toPromise()});if(this.isClosing)return[];if(!e)return[];if(0!==this.pendingWrites)return[];const t=[],n=new Set;if(0!==e.length)for(const{fbase_key:r,value:s}of e)n.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!n.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}catch(Vf){return this.isClosing||Dt(`Firebase Auth cross-tab polling failed with error: ${Vf}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const r of Array.from(n))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Mr.type="LOCAL";const Gr=Mr;
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
function Hr(e,t){return t?un(t):(bt(e._popupRedirectResolver,e,"argument-error"),e._popupRedirectResolver)}
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
 */new Lt(3e4,6e4);class Ur extends jn{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Yn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Yn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Yn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Vr(e){return lr(e.auth,new Ur(e),e.bypassAuthState)}function Jr(e){const{auth:t,user:n}=e;return bt(n,t,"internal-error"),
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
async function(e,t,n=!1){const{auth:r}=e;if(Xe(r.app))return Promise.reject(It(r));const s="reauthenticate";try{const i=await en(e,ur(r,s,t,e),n);bt(i.idToken,r,"internal-error");const a=Xt(i.idToken);bt(a,r,"internal-error");const{sub:o}=a;return bt(e.uid===o,r,"user-mismatch"),ar._forOperation(e,s,i)}catch(Vf){throw"auth/user-not-found"===(null==Vf?void 0:Vf.code)&&yt(r,"user-mismatch"),Vf}}(n,new Ur(e),e.bypassAuthState)}async function jr(e){const{auth:t,user:n}=e;return bt(n,t,"internal-error"),async function(e,t,n=!1){const r=await en(e,t._linkToIdToken(e.auth,await e.getIdToken()),n);return ar._forOperation(e,"link",r)}(n,new Ur(e),e.bypassAuthState)}
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
 */class Kr{constructor(e,t,n,r,s=!1){this.auth=e,this.resolver=n,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(Vf){this.reject(Vf)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:r,tenantId:s,error:i,type:a}=e;if(i)return void this.reject(i);const o={auth:this.auth,requestUri:t,sessionId:n,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(o))}catch(Vf){this.reject(Vf)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Vr;case"linkViaPopup":case"linkViaRedirect":return jr;case"reauthViaPopup":case"reauthViaRedirect":return Jr;default:yt(this.auth,"internal-error")}}resolve(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ot(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}
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
 */const qr=new Lt(2e3,1e4);async function zr(e,t,n){if(Xe(e.app))return Promise.reject(vt(e,"operation-not-supported-in-this-environment"));const r=Nn(e);!function(e,t,n){if(!(t instanceof n))throw n.name!==t.constructor.name&&yt(e,"argument-error"),_t(e,"argument-error",`Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}(e,t,Zn);const s=Hr(r,n);return new Qr(r,"signInViaPopup",t,s).executeNotNull()}class Qr extends Kr{constructor(e,t,n,r,s){super(e,t,r,s),this.provider=n,this.authWindow=null,this.pollId=null,Qr.currentPopupAction&&Qr.currentPopupAction.cancel(),Qr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return bt(e,this.auth,"internal-error"),e}async onExecution(){Ot(1===this.filter.length,"Popup operations only handle one event");const e=Tr();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(e=>{this.reject(e)}),this.resolver._isIframeWebStorageSupported(this.auth,e=>{e||this.reject(vt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return(null==(e=this.authWindow)?void 0:e.associatedEvent)||null}cancel(){this.reject(vt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Qr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;(null==(n=null==(t=this.authWindow)?void 0:t.window)?void 0:n.closed)?this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(vt(this.auth,"popup-closed-by-user"))},8e3):this.pollId=window.setTimeout(e,qr.get())};e()}}Qr.currentPopupAction=null;
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
const Yr="pendingRedirect",Wr=new Map;class $r extends Kr{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Wr.get(this.auth._key());if(!e){try{const t=await async function(e,t){const n=function(e){return Cn(Yr,e.config.apiKey,e.name)}(t),r=function(e){return un(e._redirectPersistence)}(e);if(!(await r._isAvailable()))return!1;const s="true"===await r._get(n);return await r._remove(n),s}(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(t)}catch(Vf){e=()=>Promise.reject(Vf)}Wr.set(this.auth._key(),e)}return this.bypassAuthState||Wr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if("signInViaRedirect"===e.type)return super.onAuthEvent(e);if("unknown"!==e.type){if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}else this.resolve(null)}async onExecution(){}cleanUp(){}}function Xr(e,t){Wr.set(e._key(),t)}async function Zr(e,t){return await Nn(e)._initializationPromise,es(e,t,!1)}async function es(e,t,n=!1){if(Xe(e.app))return Promise.reject(It(e));const r=Nn(e),s=Hr(r,t),i=new $r(r,s,n),a=await i.execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,t)),a}
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
 */class ts{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!function(e){switch(e.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return rs(e);default:return!1}}
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
 */(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!rs(e)){const r=(null==(n=e.error.code)?void 0:n.split("auth/")[1])||"internal-error";t.onError(vt(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=null===t.eventId||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(ns(e))}saveEventToCache(e){this.cachedEventUids.add(ns(e)),this.lastProcessedEventTime=Date.now()}}function ns(e){return[e.type,e.eventId,e.sessionId,e.tenantId].filter(e=>e).join("-")}function rs({type:e,error:t}){return"unknown"===e&&"auth/no-auth-event"===(null==t?void 0:t.code)}
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
const ss=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,is=/^https?/;async function as(e){if(e.config.emulator)return;const{authorizedDomains:t}=await async function(e,t={}){return Ht(e,"GET","/v1/projects",t)}(e);for(const n of t)try{if(os(n))return}catch{}yt(e,"unauthorized-domain")}function os(e){const t=Nt(),{protocol:n,hostname:r}=new URL(t);if(e.startsWith("chrome-extension://")){const s=new URL(e);return""===s.hostname&&""===r?"chrome-extension:"===n&&e.replace("chrome-extension://","")===t.replace("chrome-extension://",""):"chrome-extension:"===n&&s.hostname===r}if(!is.test(n))return!1;if(ss.test(e))return r===e;const s=e.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}
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
 */const Bs=new Lt(3e4,6e4);function cs(){const e=Ar().___jsl;if(null==e?void 0:e.H)for(const t of Object.keys(e.H))if(e.H[t].r=e.H[t].r||[],e.H[t].L=e.H[t].L||[],e.H[t].r=[...e.H[t].L],e.CP)for(let n=0;n<e.CP.length;n++)e.CP[n]=null}function us(e){return new Promise((t,n)=>{var r,s,i;function a(){cs(),gapi.load("gapi.iframes",{callback:()=>{t(gapi.iframes.getContext())},ontimeout:()=>{cs(),n(vt(e,"network-request-failed"))},timeout:Bs.get()})}if(null==(s=null==(r=Ar().gapi)?void 0:r.iframes)?void 0:s.Iframe)t(gapi.iframes.getContext());else{if(!(null==(i=Ar().gapi)?void 0:i.load)){const t=`__${"iframefcb"}${Math.floor(1e6*Math.random())}`;return Ar()[t]=()=>{gapi.load?a():n(vt(e,"network-request-failed"))},Ln(`${Fn.gapiScript}?onload=${t}`).catch(e=>n(e))}a()}}).catch(e=>{throw ls=null,e})}let ls=null;
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
const hs=new Lt(5e3,15e3),Cs={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},ds=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function ps(e){const t=e.config;bt(t.authDomain,e,"auth-domain-config-required");const n=t.emulator?Rt(t,"emulator/auth/iframe"):`https://${e.config.authDomain}/__/auth/iframe`,r={apiKey:t.apiKey,appName:e.name,v:tt},s=ds.get(e.config.apiHost);s&&(r.eid=s);const i=e._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${L(r).slice(1)}`}async function fs(e){const t=await function(e){return ls=ls||us(e),ls}(e),n=Ar().gapi;return bt(n,e,"internal-error"),t.open({where:document.body,url:ps(e),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Cs,dontclear:!0},t=>new Promise(async(n,r)=>{await t.restyle({setHideOnLeave:!1});const s=vt(e,"network-request-failed"),i=Ar().setTimeout(()=>{r(s)},hs.get());function a(){Ar().clearTimeout(i),n(t)}t.ping(a).then(a,()=>{r(s)})}))}
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
 */const gs={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class ms{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(Vf){}}}function Es(e,t,n,r=500,s=600){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let o="";const B={...gs,width:r.toString(),height:s.toString(),top:i,left:a},c=b().toLowerCase();n&&(o=mn(c)?"_blank":n),fn(c)&&(t=t||"http://localhost",B.scrollbars="yes");const u=Object.entries(B).reduce((e,[t,n])=>`${e}${t}=${n},`,"");if(function(e=b()){var t;return vn(e)&&!!(null==(t=window.navigator)?void 0:t.standalone)}(c)&&"_self"!==o)return function(e,t){const n=document.createElement("a");n.href=e,n.target=t;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}
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
 */(t||"",o),new ms(null);const l=window.open(t||"",o,u);bt(l,e,"popup-blocked");try{l.focus()}catch(Vf){}return new ms(l)}const Ds="__/auth/handler",ws="emulator/auth/handler",ys=encodeURIComponent("fac");async function vs(e,t,n,r,s,i){bt(e.config.authDomain,e,"auth-domain-config-required"),bt(e.config.apiKey,e,"invalid-api-key");const a={apiKey:e.config.apiKey,appName:e.name,authType:n,redirectUrl:r,v:tt,eventId:s};if(t instanceof Zn){t.setDefaultLanguage(e.languageCode),a.providerId=t.providerId||"",function(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}(t.getCustomParameters())||(a.customParameters=JSON.stringify(t.getCustomParameters()));for(const[e,t]of Object.entries({}))a[e]=t}if(t instanceof er){const e=t.getScopes().filter(e=>""!==e);e.length>0&&(a.scopes=e.join(","))}e.tenantId&&(a.tid=e.tenantId);const o=a;for(const u of Object.keys(o))void 0===o[u]&&delete o[u];const B=await e._getAppCheckToken(),c=B?`#${ys}=${encodeURIComponent(B)}`:"";return`${function({config:e}){if(!e.emulator)return`https://${e.authDomain}/${Ds}`;return Rt(e,ws)}
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
 */(e)}?${L(o).slice(1)}${c}`}const _s="webStorageSupport";const Is=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=_r,this._completeRedirectFn=es,this._overrideRedirectResult=Xr}async _openPopup(e,t,n,r){var s;Ot(null==(s=this.eventManagers[e._key()])?void 0:s.manager,"_initialize() not called before _openPopup()");return Es(e,await vs(e,t,n,Nt(),r),Tr())}async _openRedirect(e,t,n,r){await this._originValidation(e);return function(e){Ar().location.href=e}(await vs(e,t,n,Nt(),r)),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:e,promise:n}=this.eventManagers[t];return e?Promise.resolve(e):(Ot(n,"If manager is not set, promise should be"),n)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await fs(e),n=new ts(e);return t.register("authEvent",t=>{bt(null==t?void 0:t.authEvent,e,"invalid-auth-event");return{status:n.onEvent(t.authEvent)?"ACK":"ERROR"}},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(_s,{type:_s},n=>{var r;const s=null==(r=null==n?void 0:n[0])?void 0:r[_s];void 0!==s&&t(!!s),yt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=as(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return In()||gn()||vn()}};var Ts="@firebase/auth",bs="1.13.6";
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
class As{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),(null==(e=this.auth.currentUser)?void 0:e.uid)||null}async getToken(e){if(this.assertAuthConfigured(),await this.auth._initializationPromise,!this.auth.currentUser)return null;return{accessToken:await this.auth.currentUser.getIdToken(e)}}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(t=>{e((null==t?void 0:t.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){bt(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}
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
const Os=I("authIdTokenMaxAge")||300;let Ns=null;function Ss(e=rt()){const t=$e(e,"auth");if(t.isInitialized())return t.getImmediate();const n=function(e,t){const n=$e(e,"auth");if(n.isInitialized()){const e=n.getImmediate();if(S(n.getOptions(),t??{}))return e;yt(e,"already-initialized")}return n.initialize({options:t})}(e,{popupRedirectResolver:Is,persistence:[Gr,yr,_r]}),r=I("authTokenSyncURL");if(r&&"boolean"==typeof isSecureContext&&isSecureContext){const e=new URL(r,location.origin);if(location.origin===e.origin){const t=(s=e.toString(),async e=>{const t=e&&await e.getIdTokenResult(),n=t&&((new Date).getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>Os)return;const r=null==t?void 0:t.token;Ns!==r&&(Ns=r,await fetch(s,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))});!function(e,t,n){M(e).beforeAuthStateChanged(t,n)}(n,t,()=>t(n.currentUser)),function(e,t,n,r){M(e).onIdTokenChanged(t,n,r)}(n,e=>t(e))}}var s;const i=v("auth");return i&&Un(n,`http://${i}`),n}var Fs,Ls;Fs={loadJS:e=>new Promise((t,n)=>{const r=document.createElement("script");var s;r.setAttribute("src",e),r.onload=t,r.onerror=e=>{const t=vt("internal-error");t.customData=e,n(t)},r.type="text/javascript",r.charset="UTF-8",((null==(s=document.getElementsByTagName("head"))?void 0:s[0])??document).appendChild(r)}),gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="},Fn=Fs,Ls="Browser",We(new U("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:a}=n.options;bt(i&&!i.includes(":"),"invalid-api-key",{appName:n.name});const o={apiKey:i,authDomain:a,clientPlatform:Ls,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Tn(Ls)},B=new On(n,r,s,o);return function(e,t){const n=(null==t?void 0:t.persistence)||[],r=(Array.isArray(n)?n:[n]).map(un);(null==t?void 0:t.errorMap)&&e._updateErrorMap(t.errorMap),e._initializeWithPersistence(r,null==t?void 0:t.popupRedirectResolver)}(B,t),B},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),We(new U("auth-internal",e=>{const t=Nn(e.getProvider("auth").getImmediate());return new As(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),it(Ts,bs,function(e){switch(e){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}(Ls)),it(Ts,bs,"esm2020");var Rs,ks,Ps="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e;
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function t(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}function n(e,t,n){n||(n=0);const r=Array(16);if("string"==typeof t)for(var s=0;s<16;++s)r[s]=t.charCodeAt(n++)|t.charCodeAt(n++)<<8|t.charCodeAt(n++)<<16|t.charCodeAt(n++)<<24;else for(s=0;s<16;++s)r[s]=t[n++]|t[n++]<<8|t[n++]<<16|t[n++]<<24;t=e.g[0],n=e.g[1],s=e.g[2];let i,a=e.g[3];i=t+(a^n&(s^a))+r[0]+3614090360&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[1]+3905402710&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[2]+606105819&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[3]+3250441966&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[4]+4118548399&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[5]+1200080426&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[6]+2821735955&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[7]+4249261313&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[8]+1770035416&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[9]+2336552879&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[10]+4294925233&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[11]+2304563134&4294967295,i=t+(a^(n=s+(i<<22&4294967295|i>>>10))&(s^a))+r[12]+1804603682&4294967295,i=a+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[13]+4254626195&4294967295,a=t+(i<<12&4294967295|i>>>20),i=s+(n^a&(t^n))+r[14]+2792965006&4294967295,i=n+(t^(s=a+(i<<17&4294967295|i>>>15))&(a^t))+r[15]+1236535329&4294967295,i=t+(s^a&((n=s+(i<<22&4294967295|i>>>10))^s))+r[1]+4129170786&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[6]+3225465664&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[11]+643717713&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[0]+3921069994&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[5]+3593408605&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[10]+38016083&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[15]+3634488961&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[4]+3889429448&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[9]+568446438&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[14]+3275163606&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[3]+4107603335&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[8]+1163531501&4294967295,i=t+(s^a&((n=s+(i<<20&4294967295|i>>>12))^s))+r[13]+2850285829&4294967295,i=a+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[2]+4243563512&4294967295,a=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(a^t))+r[7]+1735328473&4294967295,i=n+(a^t&((s=a+(i<<14&4294967295|i>>>18))^a))+r[12]+2368359562&4294967295,i=t+((n=s+(i<<20&4294967295|i>>>12))^s^a)+r[5]+4294588738&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[8]+2272392833&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[11]+1839030562&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[14]+4259657740&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[1]+2763975236&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[4]+1272893353&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[7]+4139469664&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[10]+3200236656&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[13]+681279174&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[0]+3936430074&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[3]+3572445317&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[6]+76029189&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^a)+r[9]+3654602809&4294967295,i=a+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[12]+3873151461&4294967295,a=t+(i<<11&4294967295|i>>>21),i=s+(a^t^n)+r[15]+530742520&4294967295,i=n+((s=a+(i<<16&4294967295|i>>>16))^a^t)+r[2]+3299628645&4294967295,i=t+(s^((n=s+(i<<23&4294967295|i>>>9))|~a))+r[0]+4096336452&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[7]+1126891415&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[14]+2878612391&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[5]+4237533241&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[12]+1700485571&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[3]+2399980690&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[10]+4293915773&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[1]+2240044497&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[8]+1873313359&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[15]+4264355552&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[6]+2734768916&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[13]+1309151649&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~a))+r[4]+4149444226&4294967295,i=a+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[11]+3174756917&4294967295,a=t+(i<<10&4294967295|i>>>22),i=s+(t^(a|~n))+r[2]+718787259&4294967295,i=n+(a^((s=a+(i<<15&4294967295|i>>>17))|~t))+r[9]+3951481745&4294967295,e.g[0]=e.g[0]+t&4294967295,e.g[1]=e.g[1]+(s+(i<<21&4294967295|i>>>11))&4294967295,e.g[2]=e.g[2]+s&4294967295,e.g[3]=e.g[3]+a&4294967295}function r(e,t){this.h=t;const n=[];let r=!0;for(let s=e.length-1;s>=0;s--){const i=0|e[s];r&&i==t||(n[s]=i,r=!1)}this.g=n}!function(e,t){function n(){}n.prototype=t.prototype,e.F=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.D=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}(t,function(){this.blockSize=-1}),t.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},t.prototype.v=function(e,t){void 0===t&&(t=e.length);const r=t-this.blockSize,s=this.C;let i=this.h,a=0;for(;a<t;){if(0==i)for(;a<=r;)n(this,e,a),a+=this.blockSize;if("string"==typeof e){for(;a<t;)if(s[i++]=e.charCodeAt(a++),i==this.blockSize){n(this,s),i=0;break}}else for(;a<t;)if(s[i++]=e[a++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=t},t.prototype.A=function(){var e=Array((this.h<56?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var t=1;t<e.length-8;++t)e[t]=0;t=8*this.o;for(var n=e.length-8;n<e.length;++n)e[n]=255&t,t/=256;for(this.v(e),e=Array(16),t=0,n=0;n<4;++n)for(let r=0;r<32;r+=8)e[t++]=this.g[n]>>>r&255;return e};var s={};function i(e){return-128<=e&&e<128?function(e,t){var n=s;return Object.prototype.hasOwnProperty.call(n,e)?n[e]:n[e]=t(e)}(e,function(e){return new r([0|e],e<0?-1:0)}):new r([0|e],e<0?-1:0)}function a(e){if(isNaN(e)||!isFinite(e))return o;if(e<0)return h(a(-e));const t=[];let n=1;for(let r=0;e>=n;r++)t[r]=e/n|0,n*=4294967296;return new r(t,0)}var o=i(0),B=i(1),c=i(16777216);function u(e){if(0!=e.h)return!1;for(let t=0;t<e.g.length;t++)if(0!=e.g[t])return!1;return!0}function l(e){return-1==e.h}function h(e){const t=e.g.length,n=[];for(let r=0;r<t;r++)n[r]=~e.g[r];return new r(n,~e.h).add(B)}function C(e,t){return e.add(h(t))}function d(e,t){for(;(65535&e[t])!=e[t];)e[t+1]+=e[t]>>>16,e[t]&=65535,t++}function p(e,t){this.g=e,this.h=t}function f(e,t){if(u(t))throw Error("division by zero");if(u(e))return new p(o,o);if(l(e))return t=f(h(e),t),new p(h(t.g),h(t.h));if(l(t))return t=f(e,h(t)),new p(h(t.g),t.h);if(e.g.length>30){if(l(e)||l(t))throw Error("slowDivide_ only works with positive integers.");for(var n=B,r=t;r.l(e)<=0;)n=g(n),r=g(r);var s=m(n,1),i=m(r,1);for(r=m(r,2),n=m(n,2);!u(r);){var c=i.add(r);c.l(e)<=0&&(s=s.add(n),i=c),r=m(r,1),n=m(n,1)}return t=C(e,s.j(t)),new p(s,t)}for(s=o;e.l(t)>=0;){for(n=Math.max(1,Math.floor(e.m()/t.m())),r=(r=Math.ceil(Math.log(n)/Math.LN2))<=48?1:Math.pow(2,r-48),c=(i=a(n)).j(t);l(c)||c.l(e)>0;)c=(i=a(n-=r)).j(t);u(i)&&(i=B),s=s.add(i),e=C(e,c)}return new p(s,e)}function g(e){const t=e.g.length+1,n=[];for(let r=0;r<t;r++)n[r]=e.i(r)<<1|e.i(r-1)>>>31;return new r(n,e.h)}function m(e,t){const n=t>>5;t%=32;const s=e.g.length-n,i=[];for(let r=0;r<s;r++)i[r]=t>0?e.i(r+n)>>>t|e.i(r+n+1)<<32-t:e.i(r+n);return new r(i,e.h)}(e=r.prototype).m=function(){if(l(this))return-h(this).m();let e=0,t=1;for(let n=0;n<this.g.length;n++){const r=this.i(n);e+=(r>=0?r:4294967296+r)*t,t*=4294967296}return e},e.toString=function(e){if((e=e||10)<2||36<e)throw Error("radix out of range: "+e);if(u(this))return"0";if(l(this))return"-"+h(this).toString(e);const t=a(Math.pow(e,6));var n=this;let r="";for(;;){const s=f(n,t).g;let i=(((n=C(n,s.j(t))).g.length>0?n.g[0]:n.h)>>>0).toString(e);if(u(n=s))return i+r;for(;i.length<6;)i="0"+i;r=i+r}},e.i=function(e){return e<0?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return l(e=C(this,e))?-1:u(e)?0:1},e.abs=function(){return l(this)?h(this):this},e.add=function(e){const t=Math.max(this.g.length,e.g.length),n=[];let s=0;for(let r=0;r<=t;r++){let t=s+(65535&this.i(r))+(65535&e.i(r)),i=(t>>>16)+(this.i(r)>>>16)+(e.i(r)>>>16);s=i>>>16,t&=65535,i&=65535,n[r]=i<<16|t}return new r(n,-2147483648&n[n.length-1]?-1:0)},e.j=function(e){if(u(this)||u(e))return o;if(l(this))return l(e)?h(this).j(h(e)):h(h(this).j(e));if(l(e))return h(this.j(h(e)));if(this.l(c)<0&&e.l(c)<0)return a(this.m()*e.m());const t=this.g.length+e.g.length,n=[];for(var s=0;s<2*t;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(let t=0;t<e.g.length;t++){const r=this.i(s)>>>16,i=65535&this.i(s),a=e.i(t)>>>16,o=65535&e.i(t);n[2*s+2*t]+=i*o,d(n,2*s+2*t),n[2*s+2*t+1]+=r*o,d(n,2*s+2*t+1),n[2*s+2*t+1]+=i*a,d(n,2*s+2*t+1),n[2*s+2*t+2]+=r*a,d(n,2*s+2*t+2)}for(e=0;e<t;e++)n[e]=n[2*e+1]<<16|n[2*e];for(e=t;e<2*t;e++)n[e]=0;return new r(n,0)},e.B=function(e){return f(this,e).h},e.and=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)&e.i(r);return new r(n,this.h&e.h)},e.or=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)|e.i(r);return new r(n,this.h|e.h)},e.xor=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)^e.i(r);return new r(n,this.h^e.h)},t.prototype.digest=t.prototype.A,t.prototype.reset=t.prototype.u,t.prototype.update=t.prototype.v,ks=t,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.B,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=a,r.fromString=function e(t,n){if(0==t.length)throw Error("number format error: empty string");if((n=n||10)<2||36<n)throw Error("radix out of range: "+n);if("-"==t.charAt(0))return h(e(t.substring(1),n));if(t.indexOf("-")>=0)throw Error('number format error: interior "-" character');const r=a(Math.pow(n,8));let s=o;for(let o=0;o<t.length;o+=8){var i=Math.min(8,t.length-o);const e=parseInt(t.substring(o,o+i),n);i<8?(i=a(Math.pow(n,i)),s=s.j(i).add(a(e))):(s=s.j(r),s=s.add(a(e)))}return s},Rs=r}).apply(void 0!==Ps?Ps:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var xs,Ms,Gs,Hs,Us,Vs,Js,js,Ks="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e,t=Object.defineProperty;var n=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof Ks&&Ks];for(var t=0;t<e.length;++t){var n=e[t];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);function r(e,r){if(r)e:{var s=n;e=e.split(".");for(var i=0;i<e.length-1;i++){var a=e[i];if(!(a in s))break e;s=s[a]}(r=r(i=s[e=e[e.length-1]]))!=i&&null!=r&&t(s,e,{configurable:!0,writable:!0,value:r})}}r("Symbol.dispose",function(e){return e||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(e){return e||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(e){return e||function(e){var t,n=[];for(t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.push([t,e[t]]);return n}});
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
var s=s||{},i=this||self;function a(e){var t=typeof e;return"object"==t&&null!=e||"function"==t}function o(e,t,n){return e.call.apply(e.bind,arguments)}function B(e,t,n){return(B=o).apply(null,arguments)}function c(e,t){var n=Array.prototype.slice.call(arguments,1);return function(){var t=n.slice();return t.push.apply(t,arguments),e.apply(this,t)}}function u(e,t){function n(){}n.prototype=t.prototype,e.Z=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.Ob=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}var l="undefined"!=typeof AsyncContext&&"function"==typeof AsyncContext.Snapshot?e=>e&&AsyncContext.Snapshot.wrap(e):e=>e;function h(e){const t=e.length;if(t>0){const n=Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}return[]}function C(e,t){for(let r=1;r<arguments.length;r++){const t=arguments[r];var n=typeof t;if("array"==(n="object"!=n?n:t?Array.isArray(t)?"array":n:"null")||"object"==n&&"number"==typeof t.length){n=e.length||0;const r=t.length||0;e.length=n+r;for(let s=0;s<r;s++)e[n+s]=t[s]}else e.push(t)}}function d(e){i.setTimeout(()=>{throw e},0)}function p(){var e=D;let t=null;return e.g&&(t=e.g,e.g=e.g.next,e.g||(e.h=null),t.next=null),t}var f=new class{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return this.h>0?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}(()=>new g,e=>e.reset());class g{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}let m,E=!1,D=new class{constructor(){this.h=this.g=null}add(e,t){const n=f.get();n.set(e,t),this.h?this.h.next=n:this.g=n,this.h=n}},w=()=>{const e=Promise.resolve(void 0);m=()=>{e.then(y)}};function y(){for(var e;e=p();){try{e.h.call(e.g)}catch(n){d(n)}var t=f;t.j(e),t.h<100&&(t.h++,e.next=t.g,t.g=e)}E=!1}function v(){this.u=this.u,this.C=this.C}function _(e,t){this.type=e,this.g=this.target=t,this.defaultPrevented=!1}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},_.prototype.h=function(){this.defaultPrevented=!0};var I=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var e=!1,t=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const e=()=>{};i.addEventListener("test",e,t),i.removeEventListener("test",e,t)}catch(n){}return e}();function T(e){return/^[\s\xa0]*$/.test(e)}function b(e,t){_.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e&&this.init(e,t)}u(b,_),b.prototype.init=function(e,t){const n=this.type=e.type,r=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;this.target=e.target||e.srcElement,this.g=t,(t=e.relatedTarget)||("mouseover"==n?t=e.fromElement:"mouseout"==n&&(t=e.toElement)),this.relatedTarget=t,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=e.pointerType,this.state=e.state,this.i=e,e.defaultPrevented&&b.Z.h.call(this)},b.prototype.h=function(){b.Z.h.call(this);const e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var A="closure_listenable_"+(1e6*Math.random()|0),O=0;function N(e,t,n,r,s){this.listener=e,this.proxy=null,this.src=t,this.type=n,this.capture=!!r,this.ha=s,this.key=++O,this.da=this.fa=!1}function S(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function F(e,t,n){for(const r in e)t.call(n,e[r],r,e)}function L(e){const t={};for(const n in e)t[n]=e[n];return t}const R="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function k(e,t){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)e[n]=r[n];for(let t=0;t<R.length;t++)n=R[t],Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}}function P(e){this.src=e,this.g={},this.h=0}function x(e,t){const n=t.type;if(n in e.g){var r,s=e.g[n],i=Array.prototype.indexOf.call(s,t,void 0);(r=i>=0)&&Array.prototype.splice.call(s,i,1),r&&(S(t),0==e.g[n].length&&(delete e.g[n],e.h--))}}function M(e,t,n,r){for(let s=0;s<e.length;++s){const i=e[s];if(!i.da&&i.listener==t&&i.capture==!!n&&i.ha==r)return s}return-1}P.prototype.add=function(e,t,n,r,s){const i=e.toString();(e=this.g[i])||(e=this.g[i]=[],this.h++);const a=M(e,t,r,s);return a>-1?(t=e[a],n||(t.fa=!1)):((t=new N(t,this.src,i,!!r,s)).fa=n,e.push(t)),t};var G="closure_lm_"+(1e6*Math.random()|0),H={};function U(e,t,n,r,s){if(Array.isArray(t)){for(let i=0;i<t.length;i++)U(e,t[i],n,r,s);return null}return n=Q(n),e&&e[A]?e.J(t,n,!!a(r)&&!!r.capture,s):function(e,t,n,r,s,i){if(!t)throw Error("Invalid event type");const o=a(s)?!!s.capture:!!s;let B=q(e);if(B||(e[G]=B=new P(e)),n=B.add(t,n,r,o,i),n.proxy)return n;if(r=function(){function e(n){return t.call(e.src,e.listener,n)}const t=K;return e}(),n.proxy=r,r.src=e,r.listener=n,e.addEventListener)I||(s=o),void 0===s&&(s=!1),e.addEventListener(t.toString(),r,s);else if(e.attachEvent)e.attachEvent(j(t.toString()),r);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(r)}return n}(e,t,n,!1,r,s)}function V(e,t,n,r,s){if(Array.isArray(t))for(var i=0;i<t.length;i++)V(e,t[i],n,r,s);else r=a(r)?!!r.capture:!!r,n=Q(n),e&&e[A]?(e=e.i,(i=String(t).toString())in e.g&&((n=M(t=e.g[i],n,r,s))>-1&&(S(t[n]),Array.prototype.splice.call(t,n,1),0==t.length&&(delete e.g[i],e.h--)))):e&&(e=q(e))&&(t=e.g[t.toString()],e=-1,t&&(e=M(t,n,r,s)),(n=e>-1?t[e]:null)&&J(n))}function J(e){if("number"!=typeof e&&e&&!e.da){var t=e.src;if(t&&t[A])x(t.i,e);else{var n=e.type,r=e.proxy;t.removeEventListener?t.removeEventListener(n,r,e.capture):t.detachEvent?t.detachEvent(j(n),r):t.addListener&&t.removeListener&&t.removeListener(r),(n=q(t))?(x(n,e),0==n.h&&(n.src=null,t[G]=null)):S(e)}}}function j(e){return e in H?H[e]:H[e]="on"+e}function K(e,t){if(e.da)e=!0;else{t=new b(t,this);const n=e.listener,r=e.ha||e.src;e.fa&&J(e),e=n.call(r,t)}return e}function q(e){return(e=e[G])instanceof P?e:null}var z="__closure_events_fn_"+(1e9*Math.random()>>>0);function Q(e){return"function"==typeof e?e:(e[z]||(e[z]=function(t){return e.handleEvent(t)}),e[z])}function Y(){v.call(this),this.i=new P(this),this.M=this,this.G=null}function W(e,t){var n,r=e.G;if(r)for(n=[];r;r=r.G)n.push(r);if(e=e.M,r=t.type||t,"string"==typeof t)t=new _(t,e);else if(t instanceof _)t.target=t.target||e;else{var s=t;k(t=new _(r,e),s)}let i,a;if(s=!0,n)for(a=n.length-1;a>=0;a--)i=t.g=n[a],s=$(i,r,!0,t)&&s;if(i=t.g=e,s=$(i,r,!0,t)&&s,s=$(i,r,!1,t)&&s,n)for(a=0;a<n.length;a++)i=t.g=n[a],s=$(i,r,!1,t)&&s}function $(e,t,n,r){if(!(t=e.i.g[String(t)]))return!0;t=t.concat();let s=!0;for(let i=0;i<t.length;++i){const a=t[i];if(a&&!a.da&&a.capture==n){const t=a.listener,n=a.ha||a.src;a.fa&&x(e.i,a),s=!1!==t.call(n,r)&&s}}return s&&!r.defaultPrevented}function X(e){e.g=function(e,t){if("function"!=typeof e){if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=B(e.handleEvent,e)}return Number(t)>2147483647?-1:i.setTimeout(e,t||0)}(()=>{e.g=null,e.i&&(e.i=!1,X(e))},e.l);const t=e.h;e.h=null,e.m.apply(null,t)}u(Y,v),Y.prototype[A]=!0,Y.prototype.removeEventListener=function(e,t,n,r){V(this,e,t,n,r)},Y.prototype.N=function(){if(Y.Z.N.call(this),this.i){var e=this.i;for(const t in e.g){const n=e.g[t];for(let e=0;e<n.length;e++)S(n[e]);delete e.g[t],e.h--}}this.G=null},Y.prototype.J=function(e,t,n,r){return this.i.add(String(e),t,!1,n,r)},Y.prototype.K=function(e,t,n,r){return this.i.add(String(e),t,!0,n,r)};class Z extends v{constructor(e,t){super(),this.m=e,this.l=t,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:X(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ee(e){v.call(this),this.h=e,this.g={}}u(ee,v);var te=[];function ne(e){F(e.g,function(e,t){this.g.hasOwnProperty(t)&&J(e)},e),e.g={}}ee.prototype.N=function(){ee.Z.N.call(this),ne(this)},ee.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var re=i.JSON.stringify,se=i.JSON.parse,ie=class{stringify(e){return i.JSON.stringify(e,void 0)}parse(e){return i.JSON.parse(e,void 0)}};function ae(){}function oe(){}var Be={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ce(){_.call(this,"d")}function ue(){_.call(this,"c")}u(ce,_),u(ue,_);var le={},he=null;function Ce(){return he=he||new Y}function de(e){_.call(this,le.Ia,e)}function pe(e){const t=Ce();W(t,new de(t))}function fe(e,t){_.call(this,le.STAT_EVENT,e),this.stat=t}function ge(e){const t=Ce();W(t,new fe(t,e))}function me(e,t){_.call(this,le.Ja,e),this.size=t}function Ee(e,t){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){e()},t)}function De(){this.g=!0}function we(e,t,n,r){e.info(function(){return"XMLHTTP TEXT ("+t+"): "+function(e,t){if(!e.g)return t;if(!t)return null;try{const i=JSON.parse(t);if(i)for(e=0;e<i.length;e++)if(Array.isArray(i[e])){var n=i[e];if(!(n.length<2)){var r=n[1];if(Array.isArray(r)&&!(r.length<1)){var s=r[0];if("noop"!=s&&"stop"!=s&&"close"!=s)for(let e=1;e<r.length;e++)r[e]=""}}}return re(i)}catch(i){return t}}(e,n)+(r?" "+r:"")})}le.Ia="serverreachability",u(de,_),le.STAT_EVENT="statevent",u(fe,_),le.Ja="timingevent",u(me,_),De.prototype.ua=function(){this.g=!1},De.prototype.info=function(){};var ye,ve={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},_e={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"};function Ie(){}function Te(e){return encodeURIComponent(String(e))}function be(e){var t=1;e=e.split(":");const n=[];for(;t>0&&e.length;)n.push(e.shift()),t--;return e.length&&n.push(e.join(":")),n}function Ae(e,t,n,r){this.j=e,this.i=t,this.l=n,this.S=r||1,this.V=new ee(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Oe}function Oe(){this.i=null,this.g="",this.h=!1}u(Ie,ae),Ie.prototype.g=function(){return new XMLHttpRequest},ye=new Ie;var Ne={},Se={};function Fe(e,t,n){e.M=1,e.A=rt(Xe(t)),e.u=n,e.R=!0,Le(e,null)}function Le(e,t){e.F=Date.now(),Pe(e),e.B=Xe(e.A);var n=e.B,r=e.S;Array.isArray(r)||(r=[String(r)]),gt(n.i,"t",r),e.C=0,n=e.j.L,e.h=new Oe,e.g=rn(e.j,n?t:null,!e.u),e.P>0&&(e.O=new Z(B(e.Y,e,e.g),e.P)),t=e.V,n=e.g,r=e.ba;var s="readystatechange";Array.isArray(s)||(s&&(te[0]=s.toString()),s=te);for(let i=0;i<s.length;i++){const e=U(n,s[i],r||t.handleEvent,!1,t.h||t);if(!e)break;t.g[e.key]=e}t=e.J?L(e.J):{},e.u?(e.v||(e.v="POST"),t["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.B,e.v,e.u,t)):(e.v="GET",e.g.ea(e.B,e.v,null,t)),pe(),function(e,t,n,r,s,i){e.info(function(){if(e.g)if(i){var a="",o=i.split("&");for(let e=0;e<o.length;e++){var B=o[e].split("=");if(B.length>1){const e=B[0];B=B[1];const t=e.split("_");a=t.length>=2&&"type"==t[1]?a+(e+"=")+B+"&":a+(e+"=redacted&")}}}else a=null;else a=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+t+"\n"+n+"\n"+a})}(e.i,e.v,e.B,e.l,e.S,e.u)}function Re(e){return!!e.g&&("GET"==e.v&&2!=e.M&&e.j.Aa)}function ke(e,t){var n=e.C,r=t.indexOf("\n",n);return-1==r?Se:(n=Number(t.substring(n,r)),isNaN(n)?Ne:(r+=1)+n>t.length?Se:(t=t.slice(r,r+n),e.C=r+n,t))}function Pe(e){e.T=Date.now()+e.H,xe(e,e.H)}function xe(e,t){if(null!=e.D)throw Error("WatchDog timer not null");e.D=Ee(B(e.aa,e),t)}function Me(e){e.D&&(i.clearTimeout(e.D),e.D=null)}function Ge(e){0==e.j.I||e.K||Xt(e.j,e)}function He(e){Me(e);var t=e.O;t&&"function"==typeof t.dispose&&t.dispose(),e.O=null,ne(e.V),e.g&&(t=e.g,e.g=null,t.abort(),t.dispose())}function Ue(e,t){try{var n=e.j;if(0!=n.I&&(n.g==e||qe(n.h,e)))if(!e.L&&qe(n.h,e)&&3==n.I){try{var r=n.Ba.g.parse(t)}catch(u){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){e:if(!n.v){if(n.g){if(!(n.g.F+3e3<e.F))break e;$t(n),Ut(n)}Qt(n),ge(18)}}else n.xa=s[1],0<n.xa-n.K&&s[2]<37500&&n.F&&0==n.A&&!n.C&&(n.C=Ee(B(n.Va,n),6e3));Ke(n.h)<=1&&n.ta&&(n.ta=void 0)}else en(n,11)}else if((e.L||n.g==e)&&$t(n),!T(t))for(s=n.Ba.g.parse(t),t=0;t<s.length;t++){let B=s[t];const u=B[0];if(!(u<=n.K))if(n.K=u,B=B[1],2==n.I)if("c"==B[0]){n.M=B[1],n.ba=B[2];const t=B[3];null!=t&&(n.ka=t,n.j.info("VER="+n.ka));const s=B[4];null!=s&&(n.za=s,n.j.info("SVER="+n.za));const u=B[5];null!=u&&"number"==typeof u&&u>0&&(r=1.5*u,n.O=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const l=e.g;if(l){const e=l.g?l.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var i=r.h;i.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(ze(i,i.h),i.h=null))}if(r.G){const e=l.g?l.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(r.wa=e,nt(r.J,r.G,e))}}n.I=3,n.l&&n.l.ra(),n.aa&&(n.T=Date.now()-e.F,n.j.info("Handshake RTT: "+n.T+"ms"));var a=e;if((r=n).na=nn(r,r.L?r.ba:null,r.W),a.L){Qe(r.h,a);var o=a,c=r.O;c&&(o.H=c),o.D&&(Me(o),Pe(o)),r.g=a}else zt(r);n.i.length>0&&Jt(n)}else"stop"!=B[0]&&"close"!=B[0]||en(n,7);else 3==n.I&&("stop"==B[0]||"close"==B[0]?"stop"==B[0]?en(n,7):Ht(n):"noop"!=B[0]&&n.l&&n.l.qa(B),n.A=0)}pe()}catch(u){}}Ae.prototype.ba=function(e){e=e.target;const t=this.O;t&&3==Pt(e)?t.j():this.Y(e)},Ae.prototype.Y=function(e){try{if(e==this.g)e:{const B=Pt(this.g),c=this.g.ya();this.g.ca();if(!(B<3)&&(3!=B||this.g&&(this.h.h||this.g.la()||xt(this.g)))){this.K||4!=B||7==c||pe(),Me(this);var t=this.g.ca();this.X=t;var n=function(e){if(!Re(e))return e.g.la();const t=xt(e.g);if(""===t)return"";let n="";const r=t.length,s=4==Pt(e.g);if(!e.h.i){if("undefined"==typeof TextDecoder)return He(e),Ge(e),"";e.h.i=new i.TextDecoder}for(let i=0;i<r;i++)e.h.h=!0,n+=e.h.i.decode(t[i],{stream:!(s&&i==r-1)});return t.length=0,e.h.g+=n,e.C=0,e.h.g}(this);if(this.o=200==t,function(e,t,n,r,s,i,a){e.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+t+"\n"+n+"\n"+i+" "+a})}(this.i,this.v,this.B,this.l,this.S,B,t),this.o){if(this.U&&!this.L){t:{if(this.g){var r,s=this.g;if((r=s.g?s.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(r)){var a=r;break t}}a=null}if(!(e=a)){this.o=!1,this.m=3,ge(12),He(this),Ge(this);break e}we(this.i,this.l,e,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ue(this,e)}if(this.R){let t;for(e=!0;!this.K&&this.C<n.length;){if(t=ke(this,n),t==Se){4==B&&(this.m=4,ge(14),e=!1),we(this.i,this.l,null,"[Incomplete Response]");break}if(t==Ne){this.m=4,ge(15),we(this.i,this.l,n,"[Invalid Chunk]"),e=!1;break}we(this.i,this.l,t,null),Ue(this,t)}if(Re(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=B||0!=n.length||this.h.h||(this.m=1,ge(16),e=!1),this.o=this.o&&e,e){if(n.length>0&&!this.W){this.W=!0;var o=this.j;o.g==this&&o.aa&&!o.P&&(o.j.info("Great, no buffering proxy detected. Bytes received: "+n.length),Yt(o),o.P=!0,ge(11))}}else we(this.i,this.l,n,"[Invalid Chunked Response]"),He(this),Ge(this)}else we(this.i,this.l,n,null),Ue(this,n);4==B&&He(this),this.o&&!this.K&&(4==B?Xt(this.j,this):(this.o=!1,Pe(this)))}else(function(e){const t={};e=(e.g&&Pt(e)>=2&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<e.length;r++){if(T(e[r]))continue;var n=be(e[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=t[s]||[];t[s]=i,i.push(n)}!function(e,t){for(const n in e)t.call(void 0,e[n],n,e)}(t,function(e){return e.join(", ")})})(this.g),400==t&&n.indexOf("Unknown SID")>0?(this.m=3,ge(12)):(this.m=0,ge(13)),He(this),Ge(this)}}}catch(B){}},Ae.prototype.cancel=function(){this.K=!0,He(this)},Ae.prototype.aa=function(){this.D=null;const e=Date.now();e-this.T>=0?(function(e,t){e.info(function(){return"TIMEOUT: "+t})}(this.i,this.B),2!=this.M&&(pe(),ge(17)),He(this),this.m=2,Ge(this)):xe(this,this.T-e)};var Ve=class{constructor(e,t){this.g=e,this.map=t}};function Je(e){this.l=e||10,i.PerformanceNavigationTiming?e=(e=i.performance.getEntriesByType("navigation")).length>0&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function je(e){return!!e.h||!!e.g&&e.g.size>=e.j}function Ke(e){return e.h?1:e.g?e.g.size:0}function qe(e,t){return e.h?e.h==t:!!e.g&&e.g.has(t)}function ze(e,t){e.g?e.g.add(t):e.h=t}function Qe(e,t){e.h&&e.h==t?e.h=null:e.g&&e.g.has(t)&&e.g.delete(t)}function Ye(e){if(null!=e.h)return e.i.concat(e.h.G);if(null!=e.g&&0!==e.g.size){let t=e.i;for(const n of e.g.values())t=t.concat(n.G);return t}return h(e.i)}Je.prototype.cancel=function(){if(this.i=Ye(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var We=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function $e(e){let t;this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1,e instanceof $e?(this.l=e.l,Ze(this,e.j),this.o=e.o,this.g=e.g,et(this,e.u),this.h=e.h,tt(this,mt(e.i)),this.m=e.m):e&&(t=String(e).match(We))?(this.l=!1,Ze(this,t[1]||"",!0),this.o=st(t[2]||""),this.g=st(t[3]||"",!0),et(this,t[4]),this.h=st(t[5]||"",!0),tt(this,t[6]||"",!0),this.m=st(t[7]||"")):(this.l=!1,this.i=new ht(null,this.l))}function Xe(e){return new $e(e)}function Ze(e,t,n){e.j=n?st(t,!0):t,e.j&&(e.j=e.j.replace(/:$/,""))}function et(e,t){if(t){if(t=Number(t),isNaN(t)||t<0)throw Error("Bad port number "+t);e.u=t}else e.u=null}function tt(e,t,n){t instanceof ht?(e.i=t,function(e,t){t&&!e.j&&(Ct(e),e.i=null,e.g.forEach(function(e,t){const n=t.toLowerCase();t!=n&&(dt(this,t),gt(this,n,e))},e)),e.j=t}(e.i,e.l)):(n||(t=it(t,ut)),e.i=new ht(t,e.l))}function nt(e,t,n){e.i.set(t,n)}function rt(e){return nt(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function st(e,t){return e?t?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function it(e,t,n){return"string"==typeof e?(e=encodeURI(e).replace(t,at),n&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function at(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}$e.prototype.toString=function(){const e=[];var t=this.j;t&&e.push(it(t,ot,!0),":");var n=this.g;return(n||"file"==t)&&(e.push("//"),(t=this.o)&&e.push(it(t,ot,!0),"@"),e.push(Te(n).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.u)&&e.push(":",String(n))),(n=this.h)&&(this.g&&"/"!=n.charAt(0)&&e.push("/"),e.push(it(n,"/"==n.charAt(0)?ct:Bt,!0))),(n=this.i.toString())&&e.push("?",n),(n=this.m)&&e.push("#",it(n,lt)),e.join("")},$e.prototype.resolve=function(e){const t=Xe(this);let n=!!e.j;n?Ze(t,e.j):n=!!e.o,n?t.o=e.o:n=!!e.g,n?t.g=e.g:n=null!=e.u;var r=e.h;if(n)et(t,e.u);else if(n=!!e.h){if("/"!=r.charAt(0))if(this.g&&!this.h)r="/"+r;else{var s=t.h.lastIndexOf("/");-1!=s&&(r=t.h.slice(0,s+1)+r)}if(".."==(s=r)||"."==s)r="";else if(-1!=s.indexOf("./")||-1!=s.indexOf("/.")){r=0==s.lastIndexOf("/",0),s=s.split("/");const e=[];for(let t=0;t<s.length;){const n=s[t++];"."==n?r&&t==s.length&&e.push(""):".."==n?((e.length>1||1==e.length&&""!=e[0])&&e.pop(),r&&t==s.length&&e.push("")):(e.push(n),r=!0)}r=e.join("/")}else r=s}return n?t.h=r:n=""!==e.i.toString(),n?tt(t,mt(e.i)):n=!!e.m,n&&(t.m=e.m),t};var ot=/[#\/\?@]/g,Bt=/[#\?:]/g,ct=/[#\?]/g,ut=/[#\?@]/g,lt=/#/g;function ht(e,t){this.h=this.g=null,this.i=e||null,this.j=!!t}function Ct(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,t){if(e){e=e.split("&");for(let n=0;n<e.length;n++){const r=e[n].indexOf("=");let s,i=null;r>=0?(s=e[n].substring(0,r),i=e[n].substring(r+1)):s=e[n],t(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}(e.i,function(t,n){e.add(decodeURIComponent(t.replace(/\+/g," ")),n)}))}function dt(e,t){Ct(e),t=Et(e,t),e.g.has(t)&&(e.i=null,e.h-=e.g.get(t).length,e.g.delete(t))}function pt(e,t){return Ct(e),t=Et(e,t),e.g.has(t)}function ft(e,t){Ct(e);let n=[];if("string"==typeof t)pt(e,t)&&(n=n.concat(e.g.get(Et(e,t))));else for(e=Array.from(e.g.values()),t=0;t<e.length;t++)n=n.concat(e[t]);return n}function gt(e,t,n){dt(e,t),n.length>0&&(e.i=null,e.g.set(Et(e,t),h(n)),e.h+=n.length)}function mt(e){const t=new ht;return t.i=e.i,e.g&&(t.g=new Map(e.g),t.h=e.h),t}function Et(e,t){return t=String(t),e.j&&(t=t.toLowerCase()),t}function Dt(e,t,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function wt(){this.g=new ie}function yt(e){this.i=e.Sb||null,this.h=e.ab||!1}function vt(e,t){Y.call(this),this.H=e,this.o=t,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}function _t(e){e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e))}function It(e){e.readyState=4,e.l=null,e.j=null,e.B=null,Tt(e)}function Tt(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function bt(e){let t="";return F(e,function(e,n){t+=n,t+=":",t+=e,t+="\r\n"}),t}function At(e,t,n){e:{for(r in n){var r=!1;break e}r=!0}r||(n=bt(n),"string"==typeof e?null!=n&&Te(n):nt(e,t,n))}function Ot(e){Y.call(this),this.headers=new Map,this.L=e||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}(e=ht.prototype).add=function(e,t){Ct(this),this.i=null,e=Et(this,e);let n=this.g.get(e);return n||this.g.set(e,n=[]),n.push(t),this.h+=1,this},e.forEach=function(e,t){Ct(this),this.g.forEach(function(n,r){n.forEach(function(n){e.call(t,n,r,this)},this)},this)},e.set=function(e,t){return Ct(this),this.i=null,pt(this,e=Et(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[t]),this.h+=1,this},e.get=function(e,t){return e&&(e=ft(this,e)).length>0?String(e[0]):t},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],t=Array.from(this.g.keys());for(let r=0;r<t.length;r++){var n=t[r];const s=Te(n);n=ft(this,n);for(let t=0;t<n.length;t++){let r=s;""!==n[t]&&(r+="="+Te(n[t])),e.push(r)}}return this.i=e.join("&")},u(yt,ae),yt.prototype.g=function(){return new vt(this.i,this.h)},u(vt,Y),(e=vt.prototype).open=function(e,t){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.F=e,this.D=t,this.readyState=1,Tt(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const t={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};e&&(t.body=e),(this.H||i).fetch(new Request(this.D,t)).then(this.Pa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&4!=this.readyState&&(this.g=!1,It(this)),this.readyState=0},e.Pa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Tt(this)),this.g&&(this.readyState=3,Tt(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(void 0!==i.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;_t(this)}else e.text().then(this.Oa.bind(this),this.ga.bind(this))},e.Ma=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var t=e.value?e.value:new Uint8Array(0);(t=this.B.decode(t,{stream:!e.done}))&&(this.response=this.responseText+=t)}e.done?It(this):Tt(this),3==this.readyState&&_t(this)}},e.Oa=function(e){this.g&&(this.response=this.responseText=e,It(this))},e.Na=function(e){this.g&&(this.response=e,It(this))},e.ga=function(){this.g&&It(this)},e.setRequestHeader=function(e,t){this.A.append(e,t)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],t=this.h.entries();for(var n=t.next();!n.done;)n=n.value,e.push(n[0]+": "+n[1]),n=t.next();return e.join("\r\n")},Object.defineProperty(vt.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),u(Ot,Y);var Nt=/^https?$/i,St=["POST","PUT"];function Ft(e,t){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=t,e.o=5,Lt(e),kt(e)}function Lt(e){e.A||(e.A=!0,W(e,"complete"),W(e,"error"))}function Rt(e){if(e.h&&void 0!==s)if(e.v&&4==Pt(e))setTimeout(e.Ca.bind(e),0);else if(W(e,"readystatechange"),4==Pt(e)){e.h=!1;try{const s=e.ca();e:switch(s){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var t=!0;break e;default:t=!1}var n;if(!(n=t)){var r;if(r=0===s){let t=String(e.D).match(We)[1]||null;!t&&i.self&&i.self.location&&(t=i.self.location.protocol.slice(0,-1)),r=!Nt.test(t?t.toLowerCase():"")}n=r}if(n)W(e,"complete"),W(e,"success");else{e.o=6;try{var a=Pt(e)>2?e.g.statusText:""}catch(o){a=""}e.l=a+" ["+e.ca()+"]",Lt(e)}}finally{kt(e)}}}function kt(e,t){if(e.g){e.m&&(clearTimeout(e.m),e.m=null);const r=e.g;e.g=null,t||W(e,"ready");try{r.onreadystatechange=null}catch(n){}}}function Pt(e){return e.g?e.g.readyState:0}function xt(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.F){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(t){return null}}function Mt(e,t,n){return n&&n.internalChannelParams&&n.internalChannelParams[e]||t}function Gt(e){this.za=0,this.i=[],this.j=new De,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Mt("failFast",!1,e),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Mt("baseRetryDelayMs",5e3,e),this.Za=Mt("retryDelaySeedMs",1e4,e),this.Ta=Mt("forwardChannelMaxRetries",2,e),this.va=Mt("forwardChannelRequestTimeoutMs",2e4,e),this.ma=e&&e.xmlHttpFactory||void 0,this.Ua=e&&e.Rb||void 0,this.Aa=e&&e.useFetchStreams||!1,this.O=void 0,this.L=e&&e.supportsCrossDomainXhr||!1,this.M="",this.h=new Je(e&&e.concurrentRequestLimit),this.Ba=new wt,this.S=e&&e.fastHandshake||!1,this.R=e&&e.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=e&&e.Pb||!1,e&&e.ua&&this.j.ua(),e&&e.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&e&&e.detectBufferingProxy||!1,this.ia=void 0,e&&e.longPollingTimeout&&e.longPollingTimeout>0&&(this.ia=e.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}function Ht(e){if(Vt(e),3==e.I){var t=e.V++,n=Xe(e.J);if(nt(n,"SID",e.M),nt(n,"RID",t),nt(n,"TYPE","terminate"),Kt(e,n),(t=new Ae(e,e.j,t)).M=2,t.A=rt(Xe(n)),n=!1,i.navigator&&i.navigator.sendBeacon)try{n=i.navigator.sendBeacon(t.A.toString(),"")}catch(r){}!n&&i.Image&&((new Image).src=t.A,n=!0),n||(t.g=rn(t.j,null),t.g.ea(t.A)),t.F=Date.now(),Pe(t)}tn(e)}function Ut(e){e.g&&(Yt(e),e.g.cancel(),e.g=null)}function Vt(e){Ut(e),e.v&&(i.clearTimeout(e.v),e.v=null),$t(e),e.h.cancel(),e.m&&("number"==typeof e.m&&i.clearTimeout(e.m),e.m=null)}function Jt(e){if(!je(e.h)&&!e.m){e.m=!0;var t=e.Ea;m||w(),E||(m(),E=!0),D.add(t,e),e.D=0}}function jt(e,t){var n;n=t?t.l:e.V++;const r=Xe(e.J);nt(r,"SID",e.M),nt(r,"RID",n),nt(r,"AID",e.K),Kt(e,r),e.u&&e.o&&At(r,e.u,e.o),n=new Ae(e,e.j,n,e.D+1),null===e.u&&(n.J=e.o),t&&(e.i=t.G.concat(e.i)),t=qt(e,n,1e3),n.H=Math.round(.5*e.va)+Math.round(.5*e.va*Math.random()),ze(e.h,n),Fe(n,r,t)}function Kt(e,t){e.H&&F(e.H,function(e,n){nt(t,n,e)}),e.l&&F({},function(e,n){nt(t,n,e)})}function qt(e,t,n){n=Math.min(e.i.length,n);const r=e.l?B(e.l.Ka,e.l,e):null;e:{var s=e.i;let t=-1;for(;;){const e=["count="+n];-1==t?n>0?(t=s[0].g,e.push("ofs="+t)):t=0:e.push("ofs="+t);let B=!0;for(let u=0;u<n;u++){var i=s[u].g;const n=s[u].map;if((i-=t)<0)t=Math.max(0,s[u].g-100),B=!1;else try{i="req"+i+"_"||"";try{var o=n instanceof Map?n:Object.entries(n);for(const[t,n]of o){let r=n;a(n)&&(r=re(n)),e.push(i+t+"="+encodeURIComponent(r))}}catch(c){throw e.push(i+"type="+encodeURIComponent("_badmap")),c}}catch(c){r&&r(n)}}if(B){o=e.join("&");break e}}o=void 0}return e=e.i.splice(0,n),t.G=e,o}function zt(e){if(!e.g&&!e.v){e.Y=1;var t=e.Da;m||w(),E||(m(),E=!0),D.add(t,e),e.A=0}}function Qt(e){return!(e.g||e.v||e.A>=3)&&(e.Y++,e.v=Ee(B(e.Da,e),Zt(e,e.A)),e.A++,!0)}function Yt(e){null!=e.B&&(i.clearTimeout(e.B),e.B=null)}function Wt(e){e.g=new Ae(e,e.j,"rpc",e.Y),null===e.u&&(e.g.J=e.o),e.g.P=0;var t=Xe(e.na);nt(t,"RID","rpc"),nt(t,"SID",e.M),nt(t,"AID",e.K),nt(t,"CI",e.F?"0":"1"),!e.F&&e.ia&&nt(t,"TO",e.ia),nt(t,"TYPE","xmlhttp"),Kt(e,t),e.u&&e.o&&At(t,e.u,e.o),e.O&&(e.g.H=e.O);var n=e.g;e=e.ba,n.M=1,n.A=rt(Xe(t)),n.u=null,n.R=!0,Le(n,e)}function $t(e){null!=e.C&&(i.clearTimeout(e.C),e.C=null)}function Xt(e,t){var n=null;if(e.g==t){$t(e),Yt(e),e.g=null;var r=2}else{if(!qe(e.h,t))return;n=t.G,Qe(e.h,t),r=1}if(0!=e.I)if(t.o)if(1==r){n=t.u?t.u.length:0,t=Date.now()-t.F;var s=e.D;W(r=Ce(),new me(r,n)),Jt(e)}else zt(e);else if(3==(s=t.m)||0==s&&t.X>0||!(1==r&&function(e,t){return!(Ke(e.h)>=e.h.j-(e.m?1:0)||(e.m?(e.i=t.G.concat(e.i),0):1==e.I||2==e.I||e.D>=(e.Sa?0:e.Ta)||(e.m=Ee(B(e.Ea,e,t),Zt(e,e.D)),e.D++,0)))}(e,t)||2==r&&Qt(e)))switch(n&&n.length>0&&(t=e.h,t.i=t.i.concat(n)),s){case 1:en(e,5);break;case 4:en(e,10);break;case 3:en(e,6);break;default:en(e,2)}}function Zt(e,t){let n=e.Qa+Math.floor(Math.random()*e.Za);return e.isActive()||(n*=2),n*t}function en(e,t){if(e.j.info("Error code "+t),2==t){var n=B(e.bb,e),r=e.Ua;const t=!r;r=new $e(r||"//www.google.com/images/cleardot.gif"),i.location&&"http"==i.location.protocol||Ze(r,"https"),rt(r),t?function(e,t){const n=new De;if(i.Image){const r=new Image;r.onload=c(Dt,n,"TestLoadImage: loaded",!0,t,r),r.onerror=c(Dt,n,"TestLoadImage: error",!1,t,r),r.onabort=c(Dt,n,"TestLoadImage: abort",!1,t,r),r.ontimeout=c(Dt,n,"TestLoadImage: timeout",!1,t,r),i.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=e}else t(!1)}(r.toString(),n):function(e,t){new De;const n=new AbortController,r=setTimeout(()=>{n.abort(),Dt(0,0,!1,t)},1e4);fetch(e,{signal:n.signal}).then(e=>{clearTimeout(r),e.ok?Dt(0,0,!0,t):Dt(0,0,!1,t)}).catch(()=>{clearTimeout(r),Dt(0,0,!1,t)})}(r.toString(),n)}else ge(2);e.I=0,e.l&&e.l.pa(t),tn(e),Vt(e)}function tn(e){if(e.I=0,e.ja=[],e.l){const t=Ye(e.h);0==t.length&&0==e.i.length||(C(e.ja,t),C(e.ja,e.i),e.h.i.length=0,h(e.i),e.i.length=0),e.l.oa()}}function nn(e,t,n){var r=n instanceof $e?Xe(n):new $e(n);if(""!=r.g)t&&(r.g=t+"."+r.g),et(r,r.u);else{var s=i.location;r=s.protocol,t=t?t+"."+s.hostname:s.hostname,s=+s.port;const e=new $e(null);r&&Ze(e,r),t&&(e.g=t),s&&et(e,s),n&&(e.h=n),r=e}return n=e.G,t=e.wa,n&&t&&nt(r,n,t),nt(r,"VER",e.ka),Kt(e,r),r}function rn(e,t,n){if(t&&!e.L)throw Error("Can't create secondary domain capable XhrIo object.");return(t=e.Aa&&!e.ma?new Ot(new yt({ab:n})):new Ot(e.ma)).Fa(e.L),t}function sn(){}function an(){}function on(e,t){Y.call(this),this.g=new Gt(t),this.l=e,this.h=t&&t.messageUrlParams||null,e=t&&t.messageHeaders||null,t&&t.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=t&&t.initMessageHeaders||null,t&&t.messageContentType&&(e?e["X-WebChannel-Content-Type"]=t.messageContentType:e={"X-WebChannel-Content-Type":t.messageContentType}),t&&t.sa&&(e?e["X-WebChannel-Client-Profile"]=t.sa:e={"X-WebChannel-Client-Profile":t.sa}),this.g.U=e,(e=t&&t.Qb)&&!T(e)&&(this.g.u=e),this.A=t&&t.supportsCrossDomainXhr||!1,this.v=t&&t.sendRawJson||!1,(t=t&&t.httpSessionIdParam)&&!T(t)&&(this.g.G=t,null!==(e=this.h)&&t in e&&(t in(e=this.h)&&delete e[t])),this.j=new un(this)}function Bn(e){ce.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var t=e.__sm__;if(t){e:{for(const n in t){e=n;break e}e=void 0}(this.i=e)&&(e=this.i,t=null!==t&&e in t?t[e]:void 0),this.data=t}else this.data=e}function cn(){ue.call(this),this.status=1}function un(e){this.g=e}(e=Ot.prototype).Fa=function(e){this.H=e},e.ea=function(e,t,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);t=t?t.toUpperCase():"GET",this.D=e,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():ye.g(),this.g.onreadystatechange=l(B(this.Ca,this));try{this.B=!0,this.g.open(t,String(e),!0),this.B=!1}catch(a){return void Ft(this,a)}if(e=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var s in r)n.set(s,r[s]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const e of r.keys())n.set(e,r.get(e))}r=Array.from(n.keys()).find(e=>"content-type"==e.toLowerCase()),s=i.FormData&&e instanceof i.FormData,!(Array.prototype.indexOf.call(St,t,void 0)>=0)||r||s||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[i,o]of n)this.g.setRequestHeader(i,o);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(e),this.v=!1}catch(a){Ft(this,a)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=e||7,W(this,"complete"),W(this,"abort"),kt(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),kt(this,!0)),Ot.Z.N.call(this)},e.Ca=function(){this.u||(this.B||this.v||this.j?Rt(this):this.Xa())},e.Xa=function(){Rt(this)},e.isActive=function(){return!!this.g},e.ca=function(){try{return Pt(this)>2?this.g.status:-1}catch(e){return-1}},e.la=function(){try{return this.g?this.g.responseText:""}catch(e){return""}},e.La=function(e){if(this.g){var t=this.g.responseText;return e&&0==t.indexOf(e)&&(t=t.substring(e.length)),se(t)}},e.ya=function(){return this.o},e.Ha=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=Gt.prototype).ka=8,e.I=1,e.connect=function(e,t,n,r){ge(0),this.W=e,this.H=t||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.J=nn(this,null,this.W),Jt(this)},e.Ea=function(e){if(this.m)if(this.m=null,1==this.I){if(!e){this.V=Math.floor(1e5*Math.random()),e=this.V++;const s=new Ae(this,this.j,e);let i=this.o;if(this.U&&(i?(i=L(i),k(i,this.U)):i=this.U),null!==this.u||this.R||(s.J=i,i=null),this.S)e:{for(var t=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if((t+=r)>4096){t=n;break e}if(4096===t||n===this.i.length-1){t=n+1;break e}}t=1e3}else t=1e3;t=qt(this,s,t),nt(n=Xe(this.J),"RID",e),nt(n,"CVER",22),this.G&&nt(n,"X-HTTP-Session-Id",this.G),Kt(this,n),i&&(this.R?t="headers="+Te(bt(i))+"&"+t:this.u&&At(n,this.u,i)),ze(this.h,s),this.Ra&&nt(n,"TYPE","init"),this.S?(nt(n,"$req",t),nt(n,"SID","null"),s.U=!0,Fe(s,n,null)):Fe(s,n,t),this.I=2}}else 3==this.I&&(e?jt(this,e):0==this.i.length||je(this.h)||jt(this))},e.Da=function(){if(this.v=null,Wt(this),this.aa&&!(this.P||null==this.g||this.T<=0)){var e=4*this.T;this.j.info("BP detection timer enabled: "+e),this.B=Ee(B(this.Wa,this),e)}},e.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ge(10),Ut(this),Wt(this))},e.Va=function(){null!=this.C&&(this.C=null,Ut(this),Qt(this),ge(19))},e.bb=function(e){e?(this.j.info("Successfully pinged google.com"),ge(2)):(this.j.info("Failed to ping google.com"),ge(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=sn.prototype).ra=function(){},e.qa=function(){},e.pa=function(){},e.oa=function(){},e.isActive=function(){return!0},e.Ka=function(){},an.prototype.g=function(e,t){return new on(e,t)},u(on,Y),on.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},on.prototype.close=function(){Ht(this.g)},on.prototype.o=function(e){var t=this.g;if("string"==typeof e){var n={};n.__data__=e,e=n}else this.v&&((n={}).__data__=re(e),e=n);t.i.push(new Ve(t.Ya++,e)),3==t.I&&Jt(t)},on.prototype.N=function(){this.g.l=null,delete this.j,Ht(this.g),delete this.g,on.Z.N.call(this)},u(Bn,ce),u(cn,ue),u(un,sn),un.prototype.ra=function(){W(this.g,"a")},un.prototype.qa=function(e){W(this.g,new Bn(e))},un.prototype.pa=function(e){W(this.g,new cn)},un.prototype.oa=function(){W(this.g,"b")},an.prototype.createWebChannel=an.prototype.g,on.prototype.send=on.prototype.o,on.prototype.open=on.prototype.m,on.prototype.close=on.prototype.close,js=function(){return new an},Js=function(){return Ce()},Vs=le,Us={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ve.NO_ERROR=0,ve.TIMEOUT=8,ve.HTTP_ERROR=6,Hs=ve,_e.COMPLETE="complete",Gs=_e,oe.EventType=Be,Be.OPEN="a",Be.CLOSE="b",Be.ERROR="c",Be.MESSAGE="d",Y.prototype.listen=Y.prototype.J,Ms=oe,Ot.prototype.listenOnce=Ot.prototype.K,Ot.prototype.getLastError=Ot.prototype.Ha,Ot.prototype.getLastErrorCode=Ot.prototype.ya,Ot.prototype.getStatus=Ot.prototype.ca,Ot.prototype.getResponseJson=Ot.prototype.La,Ot.prototype.getResponseText=Ot.prototype.la,Ot.prototype.send=Ot.prototype.ea,Ot.prototype.setWithCredentials=Ot.prototype.Fa,xs=Ot}).apply(void 0!==Ks?Ks:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});
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
var qs=(d(e=class{},"FOLD_CASE",1),d(e,"LITERAL",2),d(e,"CLASS_NL",4),d(e,"DOT_NL",8),d(e,"ONE_LINE",16),d(e,"NON_GREEDY",32),d(e,"PERL_X",64),d(e,"UNICODE_GROUPS",128),d(e,"WAS_DOLLAR",256),d(e,"LOOKBEHIND",512),d(e,"MATCH_NL",e.CLASS_NL|e.DOT_NL),d(e,"PERL",e.CLASS_NL|e.ONE_LINE|e.PERL_X|e.UNICODE_GROUPS),d(e,"POSIX",0),d(e,"UNANCHORED",0),d(e,"ANCHOR_START",1),d(e,"ANCHOR_BOTH",2),e);const zs=1,Qs=2,Ys=4,Ws=8,$s=16,Xs=512,Zs=128,ei=new Int32Array(Zs),ti=new Int32Array(Zs),ni=65535;for(let $g=0;$g<Zs;$g++)ei[$g]=$g>=97&&$g<=122?$g-32:$g,ti[$g]=$g>=65&&$g<=90?$g+32:$g;var ri=(d(t=class{static toUpperCase(e){if(e<Zs)return ei[e];const t=String.fromCodePoint(e).toUpperCase(),n=t.codePointAt(0)>ni?2:1;if(t.length>n)return e;const r=String.fromCodePoint(t.codePointAt(0)).toLowerCase(),s=r.codePointAt(0)>ni?2:1;return r.length>s||r.codePointAt(0)!==e?e:t.codePointAt(0)}static toLowerCase(e){if(e<Zs)return ti[e];const t=String.fromCodePoint(e).toLowerCase(),n=t.codePointAt(0)>ni?2:1;if(t.length>n)return e;const r=String.fromCodePoint(t.codePointAt(0)).toUpperCase(),s=r.codePointAt(0)>ni?2:1;return r.length>s||r.codePointAt(0)!==e?e:t.codePointAt(0)}},"CODES",new Map([["",7],["\b",8],["\t",9],["\n",10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),t),si=class{constructor(e,t=!1){this.data=e,this.isStride1=t,this.SIZE=t?2:3}getLo(e){return this.data[e*this.SIZE]}getHi(e){return this.data[e*this.SIZE+1]}getStride(e){return this.isStride1?1:this.data[e*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const ii=new Uint8Array(256);for(let $g=0,Xg="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";$g<64;$g++)ii[Xg.charCodeAt($g)]=$g;const ai=e=>{const t=[];let n=0,r=0;for(let s=0;s<e.length;s++){let i=ii[e.charCodeAt(s)];n|=(31&i)<<r,32&i?r+=5:(t.push(n),n=0,r=0)}return t},oi=(e,t)=>{const n=ai(e),r=t?n.length/2:n.length/3,s=new Uint32Array(3*r);let i=0,a=0;for(let o=0;o<r;o++)i+=n[a++],s[3*o]=i,i+=n[a++],s[3*o+1]=i,s[3*o+2]=t?1:n[a++];return s};var Bi=class{constructor(e){this.initializer=e,this.cache=new Map}has(e){return e in this.initializer}get(e){if(this.cache.has(e))return this.cache.get(e);const t=this.initializer[e],n=t?t():null;return this.cache.set(e,n),n}},ci=(d(n=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=(e=>{const t=ai(e),n=new Map;let r=0;for(let s=0;s<t.length;s+=2){r+=t[s];const e=t[s+1],i=e>>>1^-(1&e);n.set(r,r+i)}return n})("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new si(oi("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},"_CASE_ORBIT",null),d(n,"_Print",null),d(n,"CATEGORIES",new Bi({C:()=>new si(oi("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new si(oi("AfgDgB",!0)),Cf:()=>new si(oi("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new si(oi("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new si(oi("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new si(oi("gg2B--B",!0)),L:()=>new si(oi("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new si(oi("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new si(oi("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new si(oi("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new si(oi("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new si(oi("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new si(oi("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new si(oi("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new si(oi("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new si(oi("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new si(oi("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new si(oi("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new si(oi("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new si(oi("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new si(oi("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new si(oi("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new si(oi("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new si(oi("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new si(oi("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new si(oi("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new si(oi("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new si(oi("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new si(oi("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new si(oi("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new si(oi("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new si(oi("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new si(oi("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new si(oi("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new si(oi("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new si(oi("ohIA",!0)),Zp:()=>new si(oi("phIA",!0)),Zs:()=>new si(oi("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new si(oi("wBJIFbF",!0)),Alphabetic:()=>new si(oi("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new si(oi("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new si(oi("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new si(oi("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new si(oi("7-8DE",!0)),Emoji_Modifier_Base:()=>new si(oi("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new si(oi("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new si(oi("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new si(oi("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new si(oi("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new si(oi("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new si(oi("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new si(oi("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new si(oi("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new si(oi("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),d(n,"SCRIPTS",new Bi({Adlam:()=>new si(oi("go6DrCFJFB",!0)),Ahom:()=>new si(oi("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new si(oi("ggxCmS",!0)),Arabic:()=>new si(oi("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new si(oi("xpBlBDxBDCks9BE",!0)),Avestan:()=>new si(oi("g4iC1BEG",!0)),Balinese:()=>new si(oi("g4GsCCxB",!0)),Bamum:()=>new si(oi("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new si(oi("w26CdDF",!0)),Batak:()=>new si(oi("g+GzBJD",!0)),Bengali:()=>new si(oi("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new si(oi("g17CYDY",!0)),Bhaiksuki:()=>new si(oi("ggnCICsBCNLc",!0)),Bopomofo:()=>new si(oi("qXB6wLqBxDf",!0)),Brahmi:()=>new si(oi("ggkCtCFjBKA",!0)),Braille:()=>new si(oi("ggK-H",!0)),Buginese:()=>new si(oi("gwGbDB",!0)),Buhid:()=>new si(oi("g6FT",!0)),Canadian_Aboriginal:()=>new si(oi("ggF-TxRlC7tgCP",!0)),Carian:()=>new si(oi("g1gCwB",!0)),Caucasian_Albanian:()=>new si(oi("wphCzBMA",!0)),Chakma:()=>new si(oi("gokC0BCR",!0)),Cham:()=>new si(oi("gwqB2BKNDJDD",!0)),Cherokee:()=>new si(oi("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new si(oi("w9jCb",!0)),Common:()=>new si(oi("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new si(oi("ifNxkKzDGG",!0)),Cuneiform:()=>new si(oi("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new si(oi("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new si(oi("w8rCiD",!0)),Cyrillic:()=>new si(oi("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new si(oi("gghCvC",!0)),Devanagari:()=>new si(oi("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new si(oi("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new si(oi("ggmC7B",!0)),Duployan:()=>new si(oi("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new si(oi("ggsC1iBL68D",!0)),Elbasan:()=>new si(oi("gohCnB",!0)),Elymaic:()=>new si(oi("g-jCW",!0)),Ethiopic:()=>new si(oi("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new si(oi("gqjClBEcJB",!0)),Georgian:()=>new si(oi("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new si(oi("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new si(oi("w5gCa",!0)),Grantha:()=>new si(oi("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new si(oi("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new si(oi("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new si(oi("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new si(oi("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new si(oi("go4C5B",!0)),Han:()=>new si(oi("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new si(oi("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new si(oi("gojCnBJJ",!0)),Hanunoo:()=>new si(oi("g5FU",!0)),Hatran:()=>new si(oi("gniCSCBGE",!0)),Hebrew:()=>new si(oi("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new si(oi("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new si(oi("giiCVCI",!0)),Inherited:()=>new si(oi("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new si(oi("g7iCSGH",!0)),Inscriptional_Parthian:()=>new si(oi("g6iCVDH",!0)),Javanese:()=>new si(oi("gsqBtCDJFB",!0)),Kaithi:()=>new si(oi("gkkCiCLA",!0)),Kannada:()=>new si(oi("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new si(oi("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new si(oi("g4nCQCoBEc",!0)),Kayah_Li:()=>new si(oi("goqBtBCA",!0)),Kharoshthi:()=>new si(oi("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new si(oi("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new si(oi("g8F9CDJHJnPf",!0)),Khojki:()=>new si(oi("gwkCRCuB",!0)),Khudawadi:()=>new si(oi("w1kC6BGJ",!0)),Kirat_Rai:()=>new si(oi("gq7C5B",!0)),Lao:()=>new si(oi("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new si(oi("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new si(oi("ggH3BEOEC",!0)),Limbu:()=>new si(oi("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new si(oi("gwhC2JKVLH",!0)),Linear_B:()=>new si(oi("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new si(oi("wmpBvBx1eA",!0)),Lycian:()=>new si(oi("g0gCc",!0)),Lydian:()=>new si(oi("gpiCZGA",!0)),Mahajani:()=>new si(oi("wqkCmB",!0)),Makasar:()=>new si(oi("g3nCY",!0)),Malayalam:()=>new si(oi("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new si(oi("giCbDA",!0)),Manichaean:()=>new si(oi("g2iCmBFL",!0)),Marchen:()=>new si(oi("wjnCfDVCN",!0)),Masaram_Gondi:()=>new si(oi("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new si(oi("gy7C6C",!0)),Meetei_Mayek:()=>new si(oi("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new si(oi("gg6DkGDP",!0)),Meroitic_Cursive:()=>new si(oi("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new si(oi("gsiCf",!0)),Miao:()=>new si(oi("g47CqCF4BIQ",!0)),Modi:()=>new si(oi("gwlCkCMJ",!0)),Mongolian:()=>new si(oi("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new si(oi("gy6CeCJFB",!0)),Multani:()=>new si(oi("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new si(oi("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new si(oi("gkiCeJI",!0)),Nag_Mundari:()=>new si(oi("wm5DpB",!0)),Nandinagari:()=>new si(oi("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new si(oi("gsGrBFZHKEB",!0)),Newa:()=>new si(oi("gglC7CCE",!0)),Nko:()=>new si(oi("g+B6BDC",!0)),Nushu:()=>new si(oi("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new si(oi("go4DsBENDJFB",!0)),Ogham:()=>new si(oi("g0Fc",!0)),Ol_Chiki:()=>new si(oi("wiHvB",!0)),Ol_Onal:()=>new si(oi("wu5DqBFA",!0)),Old_Hungarian:()=>new si(oi("gkjCyBOyBIF",!0)),Old_Italic:()=>new si(oi("g4gCjBKC",!0)),Old_North_Arabian:()=>new si(oi("g0iCf",!0)),Old_Permic:()=>new si(oi("w6gCqB",!0)),Old_Persian:()=>new si(oi("g9gCjBFN",!0)),Old_Sogdian:()=>new si(oi("g4jCnB",!0)),Old_South_Arabian:()=>new si(oi("gziCf",!0)),Old_Turkic:()=>new si(oi("ggjCoC",!0)),Old_Uyghur:()=>new si(oi("w7jCZ",!0)),Oriya:()=>new si(oi("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new si(oi("wlhCjBFjB",!0)),Osmanya:()=>new si(oi("gkhCdDJ",!0)),Pahawh_Hmong:()=>new si(oi("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new si(oi("gjiCf",!0)),Pau_Cin_Hau:()=>new si(oi("g2mC4B",!0)),Phags_Pa:()=>new si(oi("giqB3B",!0)),Phoenician:()=>new si(oi("goiCbEA",!0)),Psalter_Pahlavi:()=>new si(oi("g8iCRIDNG",!0)),Rejang:()=>new si(oi("wpqBjBMA",!0)),Runic:()=>new si(oi("g1FqCEK",!0)),Samaritan:()=>new si(oi("ggCtBDO",!0)),Saurashtra:()=>new si(oi("gkqBlCJL",!0)),Sharada:()=>new si(oi("gskC-ChsCH",!0)),Shavian:()=>new si(oi("wihCvB",!0)),Siddham:()=>new si(oi("gslC1BDlB",!0)),Sidetic:()=>new si(oi("gqiCZ",!0)),SignWriting:()=>new si(oi("gg2DrUQECO",!0)),Sinhala:()=>new si(oi("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new si(oi("w5jCpB",!0)),Sora_Sompeng:()=>new si(oi("wmkCYIJ",!0)),Soyombo:()=>new si(oi("wymCyC",!0)),Sundanese:()=>new si(oi("g8G-BhIH",!0)),Sunuwar:()=>new si(oi("g+mChBPJ",!0)),Syloti_Nagri:()=>new si(oi("ggqBsB",!0)),Syriac:()=>new si(oi("g4BNC7BDCxIK",!0)),Tagalog:()=>new si(oi("g4FVKA",!0)),Tagbanwa:()=>new si(oi("g7FMCCCB",!0)),Tai_Le:()=>new si(oi("wqGdDE",!0)),Tai_Tham:()=>new si(oi("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new si(oi("g0qBiCZE",!0)),Tai_Yo:()=>new si(oi("g25DeCVJB",!0)),Takri:()=>new si(oi("g0lC5BHJ",!0)),Tamil:()=>new si(oi("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new si(oi("wz6CuCCJ",!0)),Tangut:()=>new si(oi("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new si(oi("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new si(oi("g8BxB",!0)),Thai:()=>new si(oi("hwD5BGb",!0)),Tibetan:()=>new si(oi("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new si(oi("wpL3BIBPA",!0)),Tirhuta:()=>new si(oi("gklCnCJJ",!0)),Todhri:()=>new si(oi("guhCzB",!0)),Tolong_Siki:()=>new si(oi("wtnCrBFJ",!0)),Toto:()=>new si(oi("w04De",!0)),Tulu_Tigalari:()=>new si(oi("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new si(oi("g8gCdCA",!0)),Unknown:()=>new si(oi("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new si(oi("gopBrJ",!0)),Vithkuqi:()=>new si(oi("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new si(oi("g24D5BGA",!0)),Warang_Citi:()=>new si(oi("glmCyCNA",!0)),Yezidi:()=>new si(oi("g0jCpBCCDB",!0)),Yi:()=>new si(oi("ggoBskBE2B",!0)),Zanabazar_Square:()=>new si(oi("gwmCnC",!0))})),d(n,"FOLD_CATEGORIES",new Bi({L:()=>new si(oi("laA",!0)),LC:()=>new si(oi("laA",!0)),Ll:()=>new si(oi("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new si(oi("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new si(oi("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new si(oi("5cgBgBlgHAB",!1)),Mn:()=>new si(oi("5cgBgBlgHAB",!1)),Emoji:()=>new si(oi("8mJA",!0)),Extended_Pictographic:()=>new si(oi("8mJA",!0)),Lowercase:()=>new si(oi("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new si(oi("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new si(oi("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),d(n,"FOLD_SCRIPT",new Bi({Common:()=>new si(oi("8cgBgB",!1)),Greek:()=>new si(oi("1FwUwU",!1)),Inherited:()=>new si(oi("5cgBgBlgHAB",!1))})),n),ui=(d(r=class{static is32(e,t){let n=0,r=e.length;for(;n<r;){const s=n+Math.floor((r-n)/2),i=e.getLo(s),a=e.getHi(s);if(i<=t&&t<=a){return(t-i)%e.getStride(s)===0}t<i?r=s:n=s+1}return!1}static is(e,t){if(t<=r.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const r=e.getLo(n);if(t<r)return!1;return(t-r)%e.getStride(n)===0}return!1}return e.length>0&&t>=e.getLo(0)&&r.is32(e,t)}static isUpper(e){if(e<=r.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return r.is(ci.Upper,e)}static isPrint(e){return e<=r.MAX_LATIN1?e>=32&&e<r.MAX_ASCII||e>=161&&173!==e:r.is(ci.Print,e)}static simpleFold(e){if(ci.CASE_ORBIT.has(e))return ci.CASE_ORBIT.get(e);const t=ri.toLowerCase(e);return t!==e?t:ri.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=r.MAX_ASCII&&t<=r.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=r.simpleFold(e);n!==e;n=r.simpleFold(n))if(n===t)return!0;return!1}},"MAX_RUNE",1114111),d(r,"MAX_ASCII",127),d(r,"MAX_LATIN1",255),d(r,"MAX_BMP",65535),d(r,"MIN_FOLD",65),d(r,"MAX_FOLD",125251),d(r,"MIN_HIGH_SURROGATE",55296),d(r,"MAX_HIGH_SURROGATE",56319),d(r,"MIN_LOW_SURROGATE",56320),d(r,"MAX_LOW_SURROGATE",57343),d(r,"MIN_SUPPLEMENTARY_CODE_POINT",65536),r);const li=new Uint8Array(256);for(let $g=0;$g<256;$g++)li[$g]=97<=$g&&$g<=122||65<=$g&&$g<=90||48<=$g&&$g<=57||95===$g?1:0;let hi=null,Ci=null;var di=(s=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return ri.CODES.get("0")<=e&&e<=ri.CODES.get("9")||ri.CODES.get("a")<=e&&e<=ri.CODES.get("z")||ri.CODES.get("A")<=e&&e<=ri.CODES.get("Z")}static unhex(e){return ri.CODES.get("0")<=e&&e<=ri.CODES.get("9")?e-ri.CODES.get("0"):ri.CODES.get("a")<=e&&e<=ri.CODES.get("f")?e-ri.CODES.get("a")+10:ri.CODES.get("A")<=e&&e<=ri.CODES.get("F")?e-ri.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(ui.isPrint(e))s.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case ri.CODES.get('"'):t+='\\"';break;case ri.CODES.get("\\"):t+="\\\\";break;case ri.CODES.get("\t"):t+="\\t";break;case ri.CODES.get("\n"):t+="\\n";break;case ri.CODES.get("\r"):t+="\\r";break;case ri.CODES.get("\b"):t+="\\b";break;case ri.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",1===n.length&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let r=0;for(;r<t.length;){const e=t.codePointAt(r);n.push(e),r+=e>ui.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<256&&1===li[e]}static emptyOpContext(e,t){let n=0;return e<0&&(n|=s.EMPTY_BEGIN_TEXT|s.EMPTY_BEGIN_LINE),10===e&&(n|=s.EMPTY_BEGIN_LINE),t<0&&(n|=s.EMPTY_END_TEXT|s.EMPTY_END_LINE),10===t&&(n|=s.EMPTY_END_LINE),s.isWordRune(e)!==s.isWordRune(t)?n|=s.EMPTY_WORD_BOUNDARY:n|=s.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(e=>s.METACHARACTERS.indexOf(e)>=0?`\\${e}`:e).join("")}static charCount(e){return e>ui.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return hi||(hi=new TextEncoder),hi.encode(e);{let t=[],n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):(64512&s)===ui.MIN_HIGH_SURROGATE&&r+1<e.length&&(64512&e.charCodeAt(r+1))===ui.MIN_LOW_SURROGATE?(s=ui.MIN_SUPPLEMENTARY_CODE_POINT+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){Ci||(Ci=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return Ci.decode(t)}{let t=[],n=0,r=0;for(;n<e.length;){let s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){let i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){let i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-ui.MIN_SUPPLEMENTARY_CODE_POINT;t[r++]=String.fromCharCode(ui.MIN_HIGH_SURROGATE+(i>>10)),t[r++]=String.fromCharCode(ui.MIN_LOW_SURROGATE+(1023&i))}else{let i=e[n++],a=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&a)}}return t.join("")}}},d(s,"METACHARACTERS","\\.+*?()|[]{}^$"),d(s,"EMPTY_BEGIN_LINE",1),d(s,"EMPTY_END_LINE",2),d(s,"EMPTY_BEGIN_TEXT",4),d(s,"EMPTY_END_TEXT",8),d(s,"EMPTY_WORD_BOUNDARY",16),d(s,"EMPTY_NO_WORD_BOUNDARY",32),d(s,"EMPTY_ALL",-1),s);const pi=(e=[],t=0)=>{const n=Object.create(null);for(let r=0;r<e.length;r++){const s=e[r],i=t+r;n[s]=i,n[i]=s}return Object.freeze(n)};var fi=(d(i=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===i.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===i.Encoding.UTF_16}},"Encoding",pi(["UTF_16","UTF_8"])),i),gi=class extends fi{constructor(e=null){super(),this.bytes=e}getEncoding(){return fi.Encoding.UTF_8}asCharSequence(){return di.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},mi=class extends fi{constructor(e=null){super(),this.charSequence=e}getEncoding(){return fi.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return di.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},Ei=class{static utf16(e){return new mi(e)}static utf8(e){return di.isByteArray(e)?new gi(e):new gi(di.stringToUtf8ByteArray(e))}},Di=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},wi=class extends Di{constructor(e,t=0,n=e.length){super(),this.bytes=e,this.start=t,this.end=n}hasString(e,t){const n=e.bytes;if(0===n.length)return!0;const r=this.indexOf(this.bytes,n,this.start+t);return-1!==r&&r<=this.end-n.length}hasAnyString(e,t){return!!e.ac8&&e.ac8.searchUTF8(this.bytes,this.start+t,this.end)}step(e){if((e+=this.start)>=this.end)return Di.EOF();const t=255&this.bytes[e];if(t<128)return t<<3|1;if(t>=194&&t<=223&&e+1<this.end){const n=255&this.bytes[e+1];return 128!=(192&n)?t<<3|1:((31&t)<<6|63&n)<<3|2}if(t>=224&&t<=239&&e+2<this.end){const n=255&this.bytes[e+1];if(128!=(192&n))return t<<3|1;const r=255&this.bytes[e+2];return 128!=(192&r)?t<<3|1:((15&t)<<12|(63&n)<<6|63&r)<<3|3}if(t>=240&&t<=244&&e+3<this.end){const n=255&this.bytes[e+1];if(128!=(192&n))return t<<3|1;const r=255&this.bytes[e+2];if(128!=(192&r))return t<<3|1;const s=255&this.bytes[e+3];return 128!=(192&s)?t<<3|1:((7&t)<<18|(63&n)<<12|(63&r)<<6|63&s)<<3|4}return t<<3|1}index(e,t){t+=this.start;const n=this.indexOf(this.bytes,e.prefixUTF8,t);return n<0?n:n-t}context(e){let t=-1;if((e+=this.start)>this.start&&e<=this.end){let n=e-1;if(t=this.bytes[n--],t>=128){let r=e-4;for(r<this.start&&(r=this.start);n>=r&&128==(192&this.bytes[n]);)n--;n<this.start&&(n=this.start),t=this.step(n-this.start)>>3}}const n=e<this.end?this.step(e-this.start)>>3:-1;return di.emptyOpContext(t,n)}indexOf(e,t,n=0){let r=t.length;if(0===r)return n<=this.end?n:-1;const s=t[0];let i=this.end-r;const a="function"==typeof e.indexOf;let o=n;for(;o<=i;){if(a){if(o=e.indexOf(s,o),-1===o||o>i)return-1}else{for(;o<=i&&e[o]!==s;)o++;if(o>i)return-1}let n=!0;for(let s=1;s<r;s++)if(e[o+s]!==t[s]){n=!1;break}if(n)return o;o++}return-1}prefixLength(e){return e.prefixUTF8.length}},yi=class extends Di{constructor(e,t=0,n=e.length){super(),this.charSequence=e,this.start=t,this.end=n}hasString(e,t){const n=this.charSequence.indexOf(e.str,this.start+t);return-1!==n&&n<=this.end-e.str.length}hasAnyString(e,t){return!!e.ac16&&e.ac16.searchUTF16(this.charSequence,this.start+t,this.end)}step(e){if((e+=this.start)>=this.end)return Di.EOF();const t=this.charSequence.charCodeAt(e);if(t<ui.MIN_HIGH_SURROGATE||t>ui.MAX_HIGH_SURROGATE||e+1>=this.end)return t<<3|1;const n=this.charSequence.charCodeAt(e+1);return n>=ui.MIN_LOW_SURROGATE&&n<=ui.MAX_LOW_SURROGATE?1024*(t-ui.MIN_HIGH_SURROGATE)+(n-ui.MIN_LOW_SURROGATE)+ui.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:t<<3|1}index(e,t){t+=this.start;const n=this.charSequence.indexOf(e.prefix,t);return n<0||n>this.end-e.prefix.length?-1:n-t}context(e){const t=(e+=this.start)>this.start&&e<=this.end?this.charSequence.charCodeAt(e-1):-1,n=e<this.end?this.charSequence.charCodeAt(e):-1;return di.emptyOpContext(t,n)}prefixLength(e){return e.prefix.length}},vi=class{static fromUTF8(e,t=0,n=e.length){return new wi(e,t,n)}static fromUTF16(e,t=0,n=e.length){return new yi(e,t,n)}},_i=class extends Error{constructor(e){super(e),this.name="RE2JSException"}},Ii=class extends _i{constructor(e,t=null){let n=`error parsing regexp: ${e}`;t&&(n+=`: \`${t}\``),super(n),this.name="RE2JSSyntaxException",this.message=n,this.error=e,this.input=t}getDescription(){return this.error}getPattern(){return this.input}},Ti=class extends _i{constructor(e){super(e),this.name="RE2JSCompileException"}},bi=class extends _i{constructor(e){super(e),this.name="RE2JSGroupException"}},Ai=class extends _i{constructor(e){super(e),this.name="RE2JSFlagsException"}},Oi=class extends _i{constructor(e){super(e),this.name="RE2JSInternalException"}},Ni=(a=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(e=>{const t=e.codePointAt(0);return t===ri.CODES.get("\\")||t===ri.CODES.get("$")?`\\${e}`:e}).join(""):e.indexOf("$")<0?e:e.split("").map(e=>e.codePointAt(0)===ri.CODES.get("$")?"$$":e).join("")}constructor(e,t){if(null===e)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof fi?this.resetMatcherInput(t):di.isByteArray(t)?this.resetMatcherInput(Ei.utf8(t)):this.resetMatcherInput(Ei.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(null===e)throw new Error("input is null");return e instanceof fi||(e=di.isByteArray(e)?Ei.utf8(e):Ei.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new bi(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new bi(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if("string"==typeof e){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new bi(`group '${e}' not found`);e=t}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new bi("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new bi(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new bi("perhaps no match attempted");if(0===e||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new bi("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,qs.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,qs.ANCHOR_START)}find(e=null){if(null!==e){if(e<0||e>this.matcherInputLength)throw new bi(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?vi.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):vi.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=7&t}return this.genMatch(e,qs.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=0===this.patternGroupCount,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?di.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const r=this.start(),s=this.end();return this.appendPos<r&&(n+=this.substring(this.appendPos,r)),this.appendPos=s,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const r=e.length;let s=0;for(;s<r;){const i=e.codePointAt(s);if(i!==ri.CODES.get("\\")){if(i===ri.CODES.get("$")){if(n<s&&(t+=e.substring(n,s)),s+1>=r)throw new bi("Illegal group reference: group index is missing");const i=e.codePointAt(s+1);if(ri.CODES.get("0")<=i&&i<=ri.CODES.get("9")){let a=i-ri.CODES.get("0"),o=s+2;for(;o<r;o++){const t=e.codePointAt(o);if(t<ri.CODES.get("0")||t>ri.CODES.get("9")||10*a+t-ri.CODES.get("0")>this.patternGroupCount)break;a=10*a+t-ri.CODES.get("0")}if(a>this.patternGroupCount)throw new bi(`n > number of groups: ${a}`);const B=this.group(a);null!==B&&(t+=B),s=o,n=s}else{if(i!==ri.CODES.get("{"))throw new bi("Illegal group reference");{let i=s+2;for(;i<r&&e.codePointAt(i)!==ri.CODES.get("}");)i++;if(i>=r)throw new bi("named capture group is missing trailing '}'");const a=e.substring(s+2,i),o=this.group(a);null!==o&&(t+=o),s=i+1,n=s}}continue}s++}else{if(n<s&&(t+=e.substring(n,s)),s++,s>=r)throw new bi("character to be escaped is missing");n=s,s++}}return n<r&&(t+=e.substring(n,r)),t}appendReplacementInternalJs(e){let t="",n=0;const r=e.length;for(let s=0;s<r-1;s++)if(e.codePointAt(s)===ri.CODES.get("$")){let i=e.codePointAt(s+1);if(ri.CODES.get("$")===i){n<s&&(t+=e.substring(n,s)),t+="$",s++,n=s+1;continue}if(ri.CODES.get("&")===i){n<s&&(t+=e.substring(n,s));const r=this.group(0);t+=null!==r?r:"$&",s++,n=s+1;continue}if(ri.CODES.get("`")===i){n<s&&(t+=e.substring(n,s)),t+=this.substring(0,this.start(0)),s++,n=s+1;continue}if(ri.CODES.get("'")===i){n<s&&(t+=e.substring(n,s)),t+=this.substring(this.end(0),this.matcherInputLength),s++,n=s+1;continue}if(ri.CODES.get("1")<=i&&i<=ri.CODES.get("9")){let a=i-ri.CODES.get("0");for(n<s&&(t+=e.substring(n,s)),s+=2;s<r&&(i=e.codePointAt(s),!(i<ri.CODES.get("0")||i>ri.CODES.get("9")||10*a+i-ri.CODES.get("0")>this.patternGroupCount));s++)a=10*a+i-ri.CODES.get("0");if(a>this.patternGroupCount){t+=`$${a}`,n=s,s--;continue}const o=this.group(a);null!==o&&(t+=o),n=s,s--;continue}if(i===ri.CODES.get("<")){n<s&&(t+=e.substring(n,s)),s++;let r=s+1;for(;r<e.length&&e.codePointAt(r)!==ri.CODES.get(">")&&e.codePointAt(r)!==ri.CODES.get(" ");)r++;if(r===e.length||e.codePointAt(r)!==ri.CODES.get(">")){t+=e.substring(s-1,r+1),n=r+1,s=r;continue}const i=e.substring(s+1,r);if(Object.prototype.hasOwnProperty.call(this.namedGroups,i)){const e=this.group(i);null!==e&&(t+=e)}else t+=`$<${i}>`;n=r+1,s=r;continue}}return n<r&&(t+=e.substring(n,r)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let r="";this.reset();const s="function"==typeof e,i=Object.keys(this.namedGroups).length>0;let o=null;if(s){if(this.groupCount()>=a.MAX_REPLACER_ARGS)throw new bi("Too many capture groups to safely invoke replacer function");o=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(r+=s?this.appendReplacementFunc(e,i,o):this.appendReplacement(e,n),t););return r+=this.appendTail(),r}appendReplacementFunc(e,t,n){let r="";const s=this.start(),i=this.end();this.appendPos<s&&(r+=this.substring(this.appendPos,s)),this.appendPos=i;const a=this.buildReplacerArgs(s,t,n);return r+=String(e(...a)),r}buildReplacerArgs(e,t,n){const r=[this.group(0)],s=this.groupCount();for(let i=1;i<=s;i++){const e=this.start(i);e<0?r.push(void 0):r.push(this.substring(e,this.end(i)))}if(r.push(e),r.push(n),t){const e=this.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);r.push(e)}return r}},d(a,"MAX_REPLACER_ARGS",65535),a),Si=(d(o=class{static isRuneOp(e){return o.RUNE<=e&&e<=o.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=di.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(1===this.runes.length){const t=this.runes[0];return 0!==(this.arg&qs.FOLD_CASE)?ui.equalsIgnoreCase(t,e):e===t}const t=this.runes.length;if(0===t)return!1;if(2===t||4===t||6===t||8===t){for(let n=0;n<t;n+=2){if(e<this.runes[n])return!1;if(e<=this.runes[n+1])return!0}return!1}let n=0,r=t>>1;for(;r>1;){const t=r>>1;n+=this.runes[n+t<<1]<=e?t:0,r-=t}n+=this.runes[n<<1]<=e?1:0;const s=n-1;return s>=0&&e<=this.runes[s<<1|1]}matchRunePos(e){if(1===this.runes.length){const t=this.runes[0];return 0!==(this.arg&qs.FOLD_CASE)?ui.equalsIgnoreCase(t,e)?0:-1:e===t?0:-1}const t=this.runes.length;if(0===t)return-1;if(2===t||4===t||6===t||8===t){for(let n=0;n<t;n+=2){if(e<this.runes[n])return-1;if(e<=this.runes[n+1])return Math.floor(n/2)}return-1}let n=0,r=t>>1;for(;r>1;){const t=r>>1;n+=this.runes[n+t<<1]<=e?t:0,r-=t}n+=this.runes[n<<1]<=e?1:0;const s=n-1;return s>=0&&e<=this.runes[s<<1|1]?s:-1}toString(){switch(this.op){case o.ALT:return`alt -> ${this.out}, ${this.arg}`;case o.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case o.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case o.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case o.MATCH:return"match"+(0!==this.arg?` ${this.arg}`:"");case o.FAIL:return"fail";case o.NOP:return`nop -> ${this.out}`;case o.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case o.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case o.RUNE:return null===this.runes?"rune <null>":["rune ",o.escapeRunes(this.runes),0!==(this.arg&qs.FOLD_CASE)?"/i":""," -> ",this.out].join("");case o.RUNE1:return`rune1 ${o.escapeRunes(this.runes)} -> ${this.out}`;case o.RUNE_ANY:return`any -> ${this.out}`;case o.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},"ALT",1),d(o,"ALT_MATCH",2),d(o,"CAPTURE",3),d(o,"EMPTY_WIDTH",4),d(o,"FAIL",5),d(o,"MATCH",6),d(o,"NOP",7),d(o,"RUNE",8),d(o,"RUNE1",9),d(o,"RUNE_ANY",10),d(o,"RUNE_ANY_NOT_NL",11),d(o,"LB_WRITE",12),d(o,"LB_CHECK",13),o),Fi=class{constructor(e){this.sparse=new Int32Array(e),this.densePcs=new Int32Array(e),this.denseCaps=null,this.size=0,this.ncap=0}init(e){this.ncap=e;const t=this.densePcs.length*e;(!this.denseCaps||this.denseCaps.length<t)&&(this.denseCaps=new Int32Array(t))}contains(e){const t=this.sparse[e];return t<this.size&&this.densePcs[t]===e}isEmpty(){return 0===this.size}add(e){const t=this.size++;return this.sparse[e]=t,this.densePcs[t]=e,t}clear(){this.size=0}toString(){let e="{";for(let t=0;t<this.size;t++)0!==t&&(e+=", "),e+=this.densePcs[t];return e+="}",e}},Li=class e{static fromRE2(t){const n=new e;return n.prog=t.prog,n.re2=t,n.q0=new Fi(n.prog.numInst()),n.q1=new Fi(n.prog.numInst()),n.matched=!1,n.matchcap=new Int32Array(n.prog.numCap<2?2:n.prog.numCap),n.ncap=0,n}static fromMachine(t){return e.fromRE2(t.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return 0===this.ncap?di.emptyInts():di.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const r=this.re2.cond;if(r===di.EMPTY_ALL)return!1;if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==t)return!1;this.matched=!1,this.matchcap.fill(-1);let s,i=this.prog.numLb>0?0:t,a=t,o=this.q0,B=this.q1,c=e.step(i),u=c>>3,l=7&c,h=-1,C=0;for(c!==Di.EOF()&&(c=e.step(i+l),h=c>>3,C=7&c),s=0===i?di.emptyOpContext(-1,u):e.context(i);;){if(o.isEmpty()){if(0!==(r&di.EMPTY_BEGIN_TEXT)&&0!==i)break;if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==i)break;if(this.matched)break;if(0===this.prog.numLb&&0!==this.re2.prefix.length&&h!==this.re2.prefixRune&&e.canCheckPrefix()){const t=e.index(this.re2,i);if(t<0)break;i+=t,c=e.step(i),u=c>>3,l=7&c,c=e.step(i+l),h=c>>3,C=7&c,s=e.context(i)}}if(0===i&&this.prog.numLb>0)for(let e=0;e<this.prog.lbStarts.length;e++)this.add(o,this.prog.lbStarts[e],i,this.matchcap,0,s);this.matched||0!==i&&n!==qs.UNANCHORED||i>=a&&(this.ncap>0&&(this.matchcap[0]=i),this.add(o,this.prog.start,i,this.matchcap,0,s));const t=i+l;if(s=e.context(t),this.step(o,B,i,t,u,s,n,i===e.endPos()),0===l)break;if(0===this.ncap&&this.matched)break;i+=l,u=h,l=C,-1!==u&&(c=e.step(i+l),h=c>>3,C=7&c);const d=o;o=B,B=d}return B.clear(),this.matched}matchSet(e,t,n){const r=this.re2.cond;if(r===di.EMPTY_ALL)return[];if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==t)return[];let s=this.prog.numLb>0?0:t,i=t,a=this.q0,o=this.q1,B=e.step(s),c=B>>3,u=7&B,l=-1,h=0;B!==Di.EOF()&&(B=e.step(s+u),l=B>>3,h=7&B);let C=0===s?di.emptyOpContext(-1,c):e.context(s);const d=new Set;for(;;){if(a.isEmpty()){if(0!==(r&di.EMPTY_BEGIN_TEXT)&&0!==s)break;if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==s)break}if(0===s&&this.prog.numLb>0)for(let e=0;e<this.prog.lbStarts.length;e++)this.add(a,this.prog.lbStarts[e],s,this.matchcap,0,C);0!==s&&n!==qs.UNANCHORED||s>=i&&this.add(a,this.prog.start,s,this.matchcap,0,C);const t=s+u;C=e.context(t);for(let r=0;r<a.size;r++){const i=a.densePcs[r],B=this.prog.inst[i],u=r*this.ncap;let l=!1;switch(B.op){case Si.MATCH:if(n===qs.ANCHOR_BOTH&&s!==e.endPos())break;d.add(B.arg);break;case Si.RUNE:l=B.matchRune(c);break;case Si.RUNE1:l=c===B.runes[0];break;case Si.RUNE_ANY:l=!0;break;case Si.RUNE_ANY_NOT_NL:l=10!==c;break;default:continue}l&&this.add(o,B.out,t,a.denseCaps,u,C)}if(a.clear(),0===u)break;s+=u,c=l,u=h,-1!==c&&(B=e.step(s+u),l=B>>3,h=7&B);const p=a;a=o,o=p}return o.clear(),Array.from(d).sort((e,t)=>e-t)}step(e,t,n,r,s,i,a,o){const B=this.re2.longest;for(let c=0;c<e.size;c++){const u=e.densePcs[c],l=c*this.ncap;if(B&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[l])continue;const h=this.prog.inst[u];let C=!1;switch(h.op){case Si.MATCH:if(a===qs.ANCHOR_BOTH&&!o)break;if(this.ncap>0&&(!B||!this.matched||this.matchcap[1]<n)){e.denseCaps[l+1]=n;for(let t=0;t<this.ncap;t++)this.matchcap[t]=e.denseCaps[l+t]}B||(e.size=0),this.matched=!0;break;case Si.RUNE:C=h.matchRune(s);break;case Si.RUNE1:C=s===h.runes[0];break;case Si.RUNE_ANY:C=!0;break;case Si.RUNE_ANY_NOT_NL:C=10!==s;break;default:continue}C&&this.add(t,h.out,r,e.denseCaps,l,i)}e.clear()}add(e,t,n,r,s,i){for(;;){if(0===t)return;if(e.contains(t))return;const a=e.add(t),o=this.prog.inst[t];switch(o.op){case Si.FAIL:return;case Si.ALT:case Si.ALT_MATCH:this.add(e,o.out,n,r,s,i),t=o.arg;continue;case Si.EMPTY_WIDTH:if(0===(o.arg&~i)){t=o.out;continue}return;case Si.NOP:t=o.out;continue;case Si.CAPTURE:if(o.arg<this.ncap){const t=r[s+o.arg];return r[s+o.arg]=n,this.add(e,o.out,n,r,s,i),void(r[s+o.arg]=t)}t=o.out;continue;case Si.LB_WRITE:this.lbTable[Math.abs(o.arg)]=n,t=o.out;continue;case Si.LB_CHECK:if(o.arg>0){if(this.lbTable[o.arg]===n){t=o.out;continue}}else if(this.lbTable[-o.arg]!==n){t=o.out;continue}return;case Si.MATCH:case Si.RUNE:case Si.RUNE1:case Si.RUNE_ANY:case Si.RUNE_ANY_NOT_NL:if(this.ncap>0){const t=a*this.ncap;for(let n=0;n<this.ncap;n++)e.denseCaps[t+n]=r[s+n]}return;default:throw new Oi("unhandled")}}}};const Ri=e=>{let t=-2128831035;for(let n=0;n<e.length;n++)t^=e[n],t=Math.imul(t,16777619);return t},ki=(e,t)=>{if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0};var Pi=class{constructor(e,t,n=[]){this.nfaStates=e,this.isMatch=t,this.matchIDs=n,this.nextLatin1=new Array(ui.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(ui.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},xi=(d(B=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/B.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let r=!1;const s=[];for(;n.length>0;){const e=n.pop();if(t.has(e))continue;t.add(e);const i=this.prog.getInst(e);switch(i.op){case Si.MATCH:r=!0,s.includes(i.arg)||s.push(i.arg);break;case Si.ALT:case Si.ALT_MATCH:n.push(i.out),n.push(i.arg);break;case Si.NOP:case Si.CAPTURE:n.push(i.out);break;case Si.EMPTY_WIDTH:case Si.LB_WRITE:case Si.LB_CHECK:return null}}const i=Int32Array.from(t).sort();return s.sort((e,t)=>e-t),{pcs:i,isMatch:r,matchIDs:s}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,r=Ri(n);let s=this.stateCache.get(r);if(s)for(let a=0;a<s.length;a++){const e=s[a];if(ki(e.nfaStates,n))return e.lastSeen=++this.clock,e}else s=[],this.stateCache.set(r,s);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=B.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),s=this.stateCache.get(r),s||(s=[],this.stateCache.set(r,s))}const i=new Pi(n,t.isMatch,t.matchIDs);return i.lastSeen=++this.clock,s.push(i),this.stateCount++,i}evictCache(){const e=[];for(const i of this.stateCache.values())for(let t=0;t<i.length;t++)e.push(i[t]);e.sort((e,t)=>e.lastSeen-t.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,r=e.slice(n),s=new Set(r);this.stateCache.clear(),this.stateCount=0;for(let i=0;i<r.length;i++){const e=r[i];e.nextLatin1.fill(null),e.nextLatin1Anchored.fill(null),e.transKeys.length=0,e.transVals.length=0;const t=Ri(e.nfaStates);let n=this.stateCache.get(t);n||(n=[],this.stateCache.set(t,n)),n.push(e),this.stateCount++}this.startState&&!s.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=ui.MAX_LATIN1)if(n===qs.UNANCHORED){const n=e.nextLatin1[t];if(null!==n)return n}else{const n=e.nextLatin1Anchored[t];if(null!==n)return n}else{const r=t+(n===qs.UNANCHORED?0:ui.MAX_RUNE+1),s=e.transKeys,i=s.length;for(let t=0;t<i;t++)if(s[t]===r)return e.transVals[t]}const r=[];for(let i=0;i<e.nfaStates.length;i++){const n=e.nfaStates[i],s=this.prog.getInst(n);Si.isRuneOp(s.op)&&s.matchRune(t)&&r.push(s.out)}n===qs.UNANCHORED&&r.push(this.prog.start);const s=this.getState(r);if(t<=ui.MAX_LATIN1)n===qs.UNANCHORED?e.nextLatin1[t]=s:e.nextLatin1Anchored[t]=s;else{const r=t+(n===qs.UNANCHORED?0:ui.MAX_RUNE+1);e.transKeys.push(r),e.transVals.push(s)}return s}match(e,t,n){if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==t)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let r=e.endPos(),s=this.startState;if(s.isMatch){if(n!==qs.ANCHOR_BOTH)return!0;if(t===r)return!0}let i=t;for(;i<r;){const t=e.step(i),a=t>>3,o=7&t;if(0===o)break;if(s=n===qs.UNANCHORED&&a<=ui.MAX_LATIN1&&s.nextLatin1[a]||this.step(s,a,n),null===s)return null;if(s.lastSeen=++this.clock,s.isMatch){if(n!==qs.ANCHOR_BOTH)return!0;if(i+o===r)return!0}if(0===s.nfaStates.length&&n!==qs.UNANCHORED)return!1;i+=o}return!1}matchSet(e,t,n){if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==t)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let r=e.endPos(),s=this.startState;const i=new Set,a=(e,t)=>{e.isMatch&&(n===qs.ANCHOR_BOTH?t===r&&e.matchIDs.forEach(e=>i.add(e)):e.matchIDs.forEach(e=>i.add(e)))};a(s,t);let o=t;for(;o<r;){const t=e.step(o),r=t>>3,i=7&t;if(0===i)break;if(s=n===qs.UNANCHORED&&r<=ui.MAX_LATIN1&&s.nextLatin1[r]||this.step(s,r,n),null===s)return null;if(s.lastSeen=++this.clock,o+=i,a(s,o),0===s.nfaStates.length&&n!==qs.UNANCHORED)break}return Array.from(i).sort((e,t)=>e-t)}},"MAX_CACHE_CLEARS",5),d(B,"STATE_MEMORY_ESTIMATE",838),B);var Mi=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(256),this.jobArg=new Uint8Array(256),this.jobPos=new Int32Array(256),this.jobLen=0,this.visited=new Uint32Array(0)}reset(e,t,n){this.end=t,this.jobLen=0,this.ncap=n;const r=e.numInst()*(t+1)+32-1>>>5;this.visited.length<r?this.visited=new Uint32Array(r):this.visited.fill(0,0,r),this.cap.length<n?this.cap=new Int32Array(n).fill(-1):this.cap.fill(-1,0,n),this.matchcap.length<n?this.matchcap=new Int32Array(n).fill(-1):this.matchcap.fill(-1,0,n)}shouldVisit(e,t){const n=e*(this.end+1)+t,r=n>>>5,s=1<<(31&n);return 0===(this.visited[r]&s)&&(this.visited[r]|=s,!0)}push(e,t,n,r){if(e.prog.getInst(t).op!==Si.FAIL&&(r||this.shouldVisit(t,n))){if(this.jobLen>=this.jobPc.length){const e=2*this.jobPc.length,t=new Int32Array(e);t.set(this.jobPc),this.jobPc=t;const n=new Uint8Array(e);n.set(this.jobArg),this.jobArg=n;const r=new Int32Array(e);r.set(this.jobPos),this.jobPos=r}this.jobPc[this.jobLen]=t,this.jobArg[this.jobLen]=r?1:0,this.jobPos[this.jobLen]=n,this.jobLen++}}tryBacktrack(e,t,n,r,s){const i=e.longest;for(this.push(e,n,r,!1);this.jobLen>0;){this.jobLen--;let n=this.jobPc[this.jobLen],r=1===this.jobArg[this.jobLen],a=this.jobPos[this.jobLen],o=!0;for(;o||this.shouldVisit(n,a);){o=!1;const B=e.prog.getInst(n);switch(B.op){case Si.FAIL:throw new Oi("unexpected InstFail");case Si.ALT:if(r){r=!1,n=B.arg;continue}this.push(e,n,a,!0),n=B.out;continue;case Si.ALT_MATCH:{const t=e.prog.getInst(B.out);if(Si.isRuneOp(t.op)){this.push(e,B.arg,a,!1),n=B.arg,a=this.end;continue}this.push(e,B.out,this.end,!1),n=B.out;continue}case Si.RUNE:{const e=t.step(a);if(e===Di.EOF())break;if(!B.matchRune(e>>3))break;a+=7&e,n=B.out;continue}case Si.RUNE1:{const e=t.step(a);if(e===Di.EOF())break;if(e>>3!==B.runes[0])break;a+=7&e,n=B.out;continue}case Si.RUNE_ANY_NOT_NL:{const e=t.step(a);if(e===Di.EOF())break;if(e>>3==10)break;a+=7&e,n=B.out;continue}case Si.RUNE_ANY:{const e=t.step(a);if(e===Di.EOF())break;a+=7&e,n=B.out;continue}case Si.CAPTURE:if(r){this.cap[B.arg]=a;break}B.arg<this.ncap&&(this.push(e,n,this.cap[B.arg],!0),this.cap[B.arg]=a),n=B.out;continue;case Si.EMPTY_WIDTH:{const e=t.context(a);if(0!==(B.arg&~e))break;n=B.out;continue}case Si.NOP:n=B.out;continue;case Si.MATCH:{if(s===qs.ANCHOR_BOTH&&a!==this.end)break;if(0===this.ncap)return!0;this.ncap>1&&(this.cap[1]=a);const e=this.matchcap[1];if((-1===e||i&&a>0&&a>e)&&this.matchcap.set(this.cap),!i)return!0;if(a===this.end)return!0;break}case Si.LB_WRITE:case Si.LB_CHECK:throw new Oi("Backtracker cannot evaluate Lookbehind instructions");default:throw new Oi("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const Gi=[];var Hi=class e{static shouldBacktrack(e){return e.numInst()<=500}static maxBitStateLen(t){return e.shouldBacktrack(t)?Math.floor(262144/t.numInst()):0}static execute(e,t,n,r,s){const i=e.cond;if(i===di.EMPTY_ALL)return null;if((r===qs.ANCHOR_START||r===qs.ANCHOR_BOTH)&&0!==n)return null;if(0!==(i&di.EMPTY_BEGIN_TEXT)&&0!==n)return null;const a=Gi.length>0?Gi.pop():new Mi,o=t.endPos();a.reset(e.prog,o,s);let B=!1;if(0!==(i&di.EMPTY_BEGIN_TEXT)||r===qs.ANCHOR_START||r===qs.ANCHOR_BOTH)a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,r)&&(B=!0);else{let s=-1;for(;n<=o&&0!==s;n+=s){if(e.prefix.length>0){const r=t.index(e,n);if(r<0)break;n+=r}if(a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,r)){B=!0;break}const i=t.step(n);s=i===Di.EOF()?0:7&i}}if(!B)return Gi.push(a),null;const c=0===s?[]:di.toArray(a.matchcap.subarray(0,s));return Gi.push(a),c}},Ui=class{constructor(e){this.sparse=new Uint32Array(e),this.dense=new Uint32Array(e),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(e){return e<this.sparse.length&&this.sparse[e]<this.size&&this.dense[this.sparse[e]]===e}insert(e){this.contains(e)||this.insertNew(e)}insertNew(e){e>=this.sparse.length||(this.sparse[e]=this.size,this.dense[this.size]=e,this.size++)}};var Vi=class{constructor(e){this.start=e.start,this.numCap=e.numCap,this.inst=new Array(e.inst.length);for(let t=0;t<e.inst.length;t++){const n=e.inst[t],r=new Si(n.op);r.out=n.out,r.arg=n.arg,r.runes=n.runes?n.runes.slice():[],r.next=null,this.inst[t]=r}}};var Ji=class e{static compile(e){if(0===e.start)return null;if(e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==Si.EMPTY_WIDTH||0===(t.arg&di.EMPTY_BEGIN_TEXT))return null;let n=!1;for(let s=0;s<e.inst.length;s++)if(e.inst[s].op===Si.ALT||e.inst[s].op===Si.ALT_MATCH){n=!0;break}for(let s=0;s<e.inst.length;s++){const t=e.inst[s],r=e.inst[t.out].op;switch(t.op){case Si.ALT:case Si.ALT_MATCH:if(r===Si.MATCH||e.inst[t.arg].op===Si.MATCH)return null;break;case Si.EMPTY_WIDTH:if(r===Si.MATCH){if((t.arg&di.EMPTY_END_TEXT)===di.EMPTY_END_TEXT)continue;return null}break;default:if(r===Si.MATCH&&n)return null}}let r=(e=>{const t=new Vi(e);for(let n=0;n<t.inst.length;n++){const e=t.inst[n];if(e.op!==Si.ALT&&e.op!==Si.ALT_MATCH)continue;let r="out",s="arg",i=t.inst[e[s]];if(i.op!==Si.ALT&&i.op!==Si.ALT_MATCH&&(r="arg",s="out",i=t.inst[e[s]],i.op!==Si.ALT&&i.op!==Si.ALT_MATCH))continue;const a=t.inst[e[r]];if(a.op===Si.ALT||a.op===Si.ALT_MATCH)continue;let o="out",B="arg",c=!1;i.out===n?c=!0:i.arg===n&&(c=!0,o="arg",B="out"),c&&(i[o]=e[r]),e[r]===i[o]&&(e[s]=i[B])}return t})(e);return r=(e=>{if(e.inst.length>=1e3)return null;const t=new Ui(e.inst.length),n=new Ui(e.inst.length),r=new Array(e.inst.length),s=new Array(e.inst.length).fill(!1),i=a=>{let o=!0;const B=e.inst[a];if(n.contains(a))return!0;switch(n.insert(a),B.op){case Si.ALT:case Si.ALT_MATCH:{o=i(B.out)&&i(B.arg);let e=s[B.out],t=s[B.arg];if(e&&t)return!1;if(t){const n=B.out;B.out=B.arg,B.arg=n;const r=e;e=t,t=r}e&&(s[a]=!0,B.op=Si.ALT_MATCH);const n=((e,t,n,r)=>{const s=e.length,i=t.length;let a=0,o=0;const B=[],c=[];let u=!0,l=-1;const h=s=>{const i=s?e:t,u=s?a:o,h=s?n:r;return!(l>0&&i[u]<=B[l]||(B.push(i[u],i[u+1]),s?a+=2:o+=2,l+=2,c.push(h),0))};for(;a<s||o<i;)if(u=o>=i?h(!0):a>=s||t[o]<e[a]?h(!1):h(!0),!u)return null;return{merged:B,next:c}})(r[B.out]||[],r[B.arg]||[],B.out,B.arg);if(!n)return!1;r[a]=n.merged,B.next=new Uint32Array(n.next);break}case Si.CAPTURE:case Si.EMPTY_WIDTH:case Si.NOP:o=i(B.out),s[a]=s[B.out],r[a]=r[B.out]?r[B.out].slice():[],B.next=new Uint32Array(Math.floor(r[a].length/2)+1).fill(B.out);break;case Si.MATCH:case Si.FAIL:s[a]=B.op===Si.MATCH;break;case Si.RUNE:{if(s[a]=!1,B.next&&B.next.length>0)break;if(t.insert(B.out),!B.runes||0===B.runes.length){r[a]=[],B.next=new Uint32Array([B.out]);break}let e=[];if(1===B.runes.length&&0!==(B.arg&qs.FOLD_CASE)){const t=B.runes[0];e.push(t,t);for(let n=ui.simpleFold(t);n!==t;n=ui.simpleFold(n))e.push(n,n);e.sort((e,t)=>e-t)}else for(let t=0;t<B.runes.length;t++)e.push(B.runes[t]);r[a]=e,B.next=new Uint32Array(Math.floor(e.length/2)+1).fill(B.out),B.op=Si.RUNE;break}case Si.RUNE1:{if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out);let e=[];if(0!==(B.arg&qs.FOLD_CASE)){const t=B.runes[0];e.push(t,t);for(let n=ui.simpleFold(t);n!==t;n=ui.simpleFold(n))e.push(n,n);e.sort((e,t)=>e-t)}else e.push(B.runes[0],B.runes[0]);r[a]=e,B.next=new Uint32Array(Math.floor(e.length/2)+1).fill(B.out),B.op=Si.RUNE;break}case Si.RUNE_ANY:if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out),r[a]=[0,ui.MAX_RUNE],B.next=new Uint32Array([B.out]);break;case Si.RUNE_ANY_NOT_NL:if(s[a]=!1,B.next&&B.next.length>0)break;t.insert(B.out),r[a]=[0,9,11,ui.MAX_RUNE],B.next=new Uint32Array(Math.floor(r[a].length/2)+1).fill(B.out)}return o};for(t.clear(),t.insert(e.start);!t.empty();)if(n.clear(),!i(t.next()))return null;for(let a=0;a<e.inst.length;a++)r[a]&&(e.inst[a].runes=r[a]);return e})(r),null!==r&&((e,t)=>{for(let n=0;n<t.inst.length;n++){const r=t.inst[n];switch(r.op){case Si.ALT:case Si.ALT_MATCH:case Si.RUNE:break;case Si.CAPTURE:case Si.EMPTY_WIDTH:case Si.NOP:case Si.MATCH:case Si.FAIL:e.inst[n].next=null;break;case Si.RUNE1:case Si.RUNE_ANY:case Si.RUNE_ANY_NOT_NL:e.inst[n].next=null,e.inst[n].op=r.op,e.inst[n].runes=r.runes?r.runes.slice():[]}}})(r,e),r}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===Si.ALT_MATCH?e.out:0}static execute(t,n,r,s,i){const a=t.onepass;if(!a)return null;const o=new Int32Array(i).fill(-1);let B=!1,c=n.step(r),u=c>>3,l=7&c,h=Di.EOF(),C=-1,d=0;c!==Di.EOF()&&(h=n.step(r+l),h!==Di.EOF()&&(C=h>>3,d=7&h));let p,f=0===r?di.emptyOpContext(-1,u):n.context(r),g=a.start;for(;;){switch(p=a.inst[g],g=p.out,p.op){case Si.MATCH:return s===qs.ANCHOR_BOTH&&r!==n.endPos()?null:(B=!0,o.length>0&&(o[0]=0,o[1]=r),0===i?[]:di.toArray(o));case Si.RUNE:if(!p.matchRune(u))return null;break;case Si.RUNE1:if(u!==p.runes[0])return null;break;case Si.RUNE_ANY:break;case Si.RUNE_ANY_NOT_NL:if(10===u)return null;break;case Si.ALT:case Si.ALT_MATCH:g=e.next(p,u);continue;case Si.FAIL:return null;case Si.NOP:continue;case Si.EMPTY_WIDTH:if(0!==(p.arg&~f))return null;continue;case Si.CAPTURE:p.arg<o.length&&(o[p.arg]=r);continue;default:throw new Oi("bad inst")}if(0===l)break;f=di.emptyOpContext(u,C),r+=l,u=C,l=d,-1!==u&&(h=n.step(r+l),h!==Di.EOF()?(C=h>>3,d=7&h):(C=-1,d=0))}return B?0===i?[]:di.toArray(o):null}},ji=(d(c=class{static isPseudoOp(e){return e>=c.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===ri.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new c(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=c.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=c.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case c.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case c.Op.EMPTY_MATCH:e+="(?:)";break;case c.Op.STAR:case c.Op.PLUS:case c.Op.QUEST:case c.Op.REPEAT:{const t=this.subs[0];switch(t.op>c.Op.CAPTURE||t.op===c.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case c.Op.STAR:e+="*";break;case c.Op.PLUS:e+="+";break;case c.Op.QUEST:e+="?";break;case c.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}"}0!==(this.flags&qs.NON_GREEDY)&&(e+="?");break}case c.Op.CONCAT:for(let t of this.subs)t.op===c.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case c.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case c.Op.LITERAL:0!==(this.flags&qs.FOLD_CASE)&&(e+="(?i:");for(let t of this.runes)e+=di.escapeRune(t);0!==(this.flags&qs.FOLD_CASE)&&(e+=")");break;case c.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case c.Op.ANY_CHAR:e+="(?s:.)";break;case c.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case c.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case c.Op.CAPTURE:null===this.name||0===this.name.length?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==c.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case c.Op.BEGIN_TEXT:e+="\\A";break;case c.Op.END_TEXT:0!==(this.flags&qs.WAS_DOLLAR)?e+="(?-m:$)":e+="\\z";break;case c.Op.BEGIN_LINE:e+="^";break;case c.Op.END_LINE:e+="$";break;case c.Op.WORD_BOUNDARY:e+="\\b";break;case c.Op.NO_WORD_BOUNDARY:e+="\\B";break;case c.Op.CHAR_CLASS:if(this.runes.length%2!=0){e+="[invalid char class]";break}if(e+="[",0===this.runes.length)e+="^\\x00-\\x{10FFFF}";else if(0===this.runes[0]&&this.runes[this.runes.length-1]===ui.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,r=this.runes[t+1]-1;e+=c.quoteIfHyphen(n),e+=di.escapeRune(n),n!==r&&(e+="-",e+=c.quoteIfHyphen(r),e+=di.escapeRune(r))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],r=this.runes[t+1];e+=c.quoteIfHyphen(n),e+=di.escapeRune(n),n!==r&&(e+="-",e+=c.quoteIfHyphen(r),e+=di.escapeRune(r))}e+="]";break;default:e+=this.op}return e}maxCap(){let e=0;if(this.op===c.Op.CAPTURE&&(e=this.cap),null!==this.subs)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(null!==e&&e instanceof c))return!1;if(this.op!==e.op)return!1;switch(this.op){case c.Op.END_TEXT:if((this.flags&qs.WAS_DOLLAR)!==(e.flags&qs.WAS_DOLLAR))return!1;break;case c.Op.LITERAL:case c.Op.CHAR_CLASS:if(null===this.runes&&null===e.runes)break;if(null===this.runes||null===e.runes)return!1;if(this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case c.Op.ALTERNATE:case c.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case c.Op.STAR:case c.Op.PLUS:case c.Op.QUEST:if((this.flags&qs.NON_GREEDY)!==(e.flags&qs.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.REPEAT:if((this.flags&qs.NON_GREEDY)!==(e.flags&qs.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.CAPTURE:if(this.cap!==e.cap||(null===this.name?null!==e.name:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case c.Op.PLB:case c.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1}return!0}},"Op",pi(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),c),Ki=class{constructor(e){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const n of e){let e=0;for(let t=0;t<n.length;t++){const r=n[t];r in this.next[e]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[e][r]=this.next.length-1),e=this.next[e][r]}this.match[e]=!0}const t=[];for(const n in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],n)){const e=this.next[0][n];this.fail[e]=0,t.push(e)}for(;t.length>0;){const e=t.shift();for(const n in this.next[e])if(Object.prototype.hasOwnProperty.call(this.next[e],n)){const r=this.next[e][n];let s=this.fail[e];for(;0!==s&&!(n in this.next[s]);)s=this.fail[s];n in this.next[s]?this.fail[r]=this.next[s][n]:this.fail[r]=0,this.match[r]=this.match[r]||this.match[this.fail[r]],t.push(r)}}}searchUTF16(e,t,n){let r=0;for(let s=t;s<n;s++){const t=e.charCodeAt(s);for(;0!==r&&!(t in this.next[r]);)r=this.fail[r];if(t in this.next[r]&&(r=this.next[r][t]),this.match[r])return!0}return!1}searchUTF8(e,t,n){let r=0;for(let s=t;s<n;s++){const t=e[s];for(;0!==r&&!(t in this.next[r]);)r=this.fail[r];if(t in this.next[r]&&(r=this.next[r][t]),this.match[r])return!0}return!1}},qi=(d(u=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case u.Type.NONE:return!0;case u.Type.EXACT:return e.hasString(this,t);case u.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case u.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},"Type",{NONE:0,EXACT:1,AND:2,OR:3}),u),zi=class e{static build(t){const n=e.fromRegexp(t);return e.simplify(n)}static fromRegexp(t){if(!t)return new qi(qi.Type.NONE);switch(t.op){case ji.Op.PLB:case ji.Op.NLB:case ji.Op.NO_MATCH:case ji.Op.EMPTY_MATCH:case ji.Op.BEGIN_LINE:case ji.Op.END_LINE:case ji.Op.BEGIN_TEXT:case ji.Op.END_TEXT:case ji.Op.WORD_BOUNDARY:case ji.Op.NO_WORD_BOUNDARY:case ji.Op.CHAR_CLASS:case ji.Op.ANY_CHAR_NOT_NL:case ji.Op.ANY_CHAR:return new qi(qi.Type.NONE);case ji.Op.LITERAL:{if(0===t.runes.length||0!==(t.flags&qs.FOLD_CASE))return new qi(qi.Type.NONE);const e=new qi(qi.Type.EXACT);let n="";for(let r=0;r<t.runes.length;r++)n+=String.fromCodePoint(t.runes[r]);return e.str=n,e.bytes=di.stringToUtf8ByteArray(e.str),e}case ji.Op.CAPTURE:case ji.Op.PLUS:return e.fromRegexp(t.subs[0]);case ji.Op.REPEAT:return t.min>=1?e.fromRegexp(t.subs[0]):new qi(qi.Type.NONE);case ji.Op.CONCAT:{const n=new qi(qi.Type.AND);for(const r of t.subs)n.subs.push(e.fromRegexp(r));return n}case ji.Op.ALTERNATE:{const n=new qi(qi.Type.OR);for(const r of t.subs)n.subs.push(e.fromRegexp(r));return n}default:return new qi(qi.Type.NONE)}}static simplify(t){if(t.type===qi.Type.EXACT||t.type===qi.Type.NONE)return t;if(t.type===qi.Type.AND){const n=[];for(const r of t.subs){const t=e.simplify(r);if(t.type!==qi.Type.NONE)if(t.type===qi.Type.AND)for(let e=0;e<t.subs.length;e++)n.push(t.subs[e]);else n.push(t)}return 0===n.length?new qi(qi.Type.NONE):1===n.length?n[0]:(t.subs=n,t)}if(t.type===qi.Type.OR){const n=[];for(const a of t.subs){const t=e.simplify(a);if(t.type===qi.Type.NONE)return new qi(qi.Type.NONE);if(t.type===qi.Type.OR)for(let e=0;e<t.subs.length;e++)n.push(t.subs[e]);else n.push(t)}if(0===n.length)return new qi(qi.Type.NONE);if(1===n.length)return n[0];const r=new Set,s=[];for(const e of n)e.type===qi.Type.EXACT?r.has(e.str)||(r.add(e.str),s.push(e)):s.push(e);t.subs=s;let i=!0;for(const e of s)if(e.type!==qi.Type.EXACT){i=!1;break}return i&&s.length>1&&(t.ac16=new Ki(s.map(e=>{const t=[];for(let n=0;n<e.str.length;n++)t.push(e.str.charCodeAt(n));return t})),t.ac8=new Ki(s.map(e=>e.bytes))),t}return t}},Qi=class{constructor(e=0,t=0){this.head=e,this.tail=t}},Yi=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(e){return this.inst[e]}numInst(){return this.inst.length}addInst(e){this.inst.push(new Si(e))}skipNop(e){let t=this.inst[e];for(;t.op===Si.NOP||t.op===Si.CAPTURE;)t=this.inst[e],e=t.out;return t}prefix(){let e="",t=this.skipNop(this.start);if(!Si.isRuneOp(t.op)||1!==t.runes.length)return[t.op===Si.MATCH,e];for(;Si.isRuneOp(t.op)&&1===t.runes.length&&0===(t.arg&qs.FOLD_CASE);)e+=String.fromCodePoint(t.runes[0]),t=this.skipNop(t.out);return[t.op===Si.MATCH,e]}startCond(){let e=0,t=this.start;e:for(;;){const n=this.inst[t];switch(n.op){case Si.EMPTY_WIDTH:e|=n.arg;break;case Si.FAIL:return-1;case Si.CAPTURE:case Si.NOP:break;default:break e}t=n.out}return e}patch(e,t){let n=e.head;for(;0!==n;){const e=this.inst[n>>1];1&n?(n=e.arg,e.arg=t):(n=e.out,e.out=t)}}append(e,t){if(0===e.head)return t;if(0===t.head)return e;const n=this.inst[e.tail>>1];return 1&e.tail?n.arg=t.head:n.out=t.head,new Qi(e.head,t.tail)}toString(){let e="";for(let t=0;t<this.inst.length;t++){const n=e.length;e+=t,t===this.start&&(e+="*"),e+="        ".substring(e.length-n),e+=this.inst[t],e+="\n"}return e}},Wi=class{constructor(e=0,t=new Qi,n=!1){this.i=e,this.out=t,this.nullable=n}},$i=class e{static ANY_RUNE_NOT_NL(){return[0,ri.CODES.get("\n")-1,ri.CODES.get("\n")+1,ui.MAX_RUNE]}static ANY_RUNE(){return[0,ui.MAX_RUNE]}static compileRegexp(t){const n=new e,r=n.compile(t);return n.prog.patch(r.out,n.newInst(Si.MATCH).i),n.prog.start=r.i,n.prog}static compileSet(t){const n=new e;if(0===t.length)return n.prog.start=n.newInst(Si.FAIL).i,n.prog;let r=[];for(let e=0;e<t.length;e++){const s=n.compile(t[e]),i=n.newInst(Si.MATCH);n.prog.getInst(i.i).arg=e,n.prog.patch(s.out,i.i),r.push(s.i)}let s=r[0];for(let e=1;e<r.length;e++){const t=n.newInst(Si.ALT),i=n.prog.getInst(t.i);i.out=s,i.arg=r[e],s=t.i}return n.prog.start=s,n.prog}constructor(){this.prog=new Yi,this.newInst(Si.FAIL)}newInst(e){return this.prog.addInst(e),new Wi(this.prog.numInst()-1,new Qi,!0)}nop(){const e=this.newInst(Si.NOP);return e.out=new Qi(e.i<<1,e.i<<1),e}fail(){return new Wi}cap(e){const t=this.newInst(Si.CAPTURE);return t.out=new Qi(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return 0===e.i||0===t.i?this.fail():(this.prog.patch(e.out,t.i),new Wi(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(0===e.i)return t;if(0===t.i)return e;const n=this.newInst(Si.ALT),r=this.prog.getInst(n.i);return r.out=e.i,r.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(Si.ALT),r=this.prog.getInst(n.i);return t?(r.arg=e.i,n.out=new Qi(n.i<<1,n.i<<1)):(r.out=e.i,n.out=new Qi(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(Si.ALT),r=this.prog.getInst(n.i);return t?(r.arg=e.i,n.out=new Qi(n.i<<1,n.i<<1)):(r.out=e.i,n.out=new Qi(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new Wi(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(Si.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new Qi(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(Si.RUNE);n.nullable=!1;const r=this.prog.getInst(n.i);return r.runes=e,t&=qs.FOLD_CASE,1===e.length&&ui.simpleFold(e[0])!==e[0]||(t&=-2),r.arg=t,n.out=new Qi(n.i<<1,n.i<<1),0===(t&qs.FOLD_CASE)&&1===e.length||2===e.length&&e[0]===e[1]?r.op=Si.RUNE1:2===e.length&&0===e[0]&&e[1]===ui.MAX_RUNE?r.op=Si.RUNE_ANY:4===e.length&&0===e[0]&&e[1]===ri.CODES.get("\n")-1&&e[2]===ri.CODES.get("\n")+1&&e[3]===ui.MAX_RUNE&&(r.op=Si.RUNE_ANY_NOT_NL),n}lookBehind(t,n){const r=this.newInst(Si.LB_WRITE);this.prog.getInst(r.i).arg=n;const s=this.rune(e.ANY_RUNE(),0),i=this.star(s,!0),a=this.cat(i,t);this.prog.patch(a.out,r.i);const o=this.newInst(Si.LB_CHECK);return this.prog.getInst(o.i).arg=n,this.prog.lbStarts.push(a.i),Math.abs(n)>this.prog.numLb&&(this.prog.numLb=Math.abs(n)),o.out=new Qi(o.i<<1,o.i<<1),o}compile(t){switch(t.op){case ji.Op.NO_MATCH:return this.fail();case ji.Op.EMPTY_MATCH:return this.nop();case ji.Op.LITERAL:if(0===t.runes.length)return this.nop();{let e=null;for(let n of t.runes){const r=this.rune([n],t.flags);e=null===e?r:this.cat(e,r)}return e}case ji.Op.CHAR_CLASS:return this.rune(t.runes,t.flags);case ji.Op.ANY_CHAR_NOT_NL:return this.rune(e.ANY_RUNE_NOT_NL(),0);case ji.Op.ANY_CHAR:return this.rune(e.ANY_RUNE(),0);case ji.Op.BEGIN_LINE:return this.empty(di.EMPTY_BEGIN_LINE);case ji.Op.END_LINE:return this.empty(di.EMPTY_END_LINE);case ji.Op.BEGIN_TEXT:return this.empty(di.EMPTY_BEGIN_TEXT);case ji.Op.END_TEXT:return this.empty(di.EMPTY_END_TEXT);case ji.Op.WORD_BOUNDARY:return this.empty(di.EMPTY_WORD_BOUNDARY);case ji.Op.NO_WORD_BOUNDARY:return this.empty(di.EMPTY_NO_WORD_BOUNDARY);case ji.Op.PLB:case ji.Op.NLB:return this.lookBehind(this.compile(t.subs[0]),t.lb);case ji.Op.CAPTURE:{const e=this.cap(t.cap<<1),n=this.compile(t.subs[0]),r=this.cap(t.cap<<1|1);return this.cat(this.cat(e,n),r)}case ji.Op.STAR:return this.star(this.compile(t.subs[0]),0!==(t.flags&qs.NON_GREEDY));case ji.Op.PLUS:return this.plus(this.compile(t.subs[0]),0!==(t.flags&qs.NON_GREEDY));case ji.Op.QUEST:return this.quest(this.compile(t.subs[0]),0!==(t.flags&qs.NON_GREEDY));case ji.Op.CONCAT:if(0===t.subs.length)return this.nop();{let e=null;for(let n of t.subs){const t=this.compile(n);e=null===e?t:this.cat(e,t)}return e}case ji.Op.ALTERNATE:if(0===t.subs.length)return this.nop();{let e=null;for(let n of t.subs){const t=this.compile(n);e=null===e?t:this.alt(e,t)}return e}default:throw new Ti("regexp: unhandled case in compile")}}},Xi=class e{static simplify(t){if(null===t)return null;switch(t.op){case ji.Op.PLB:case ji.Op.NLB:case ji.Op.CAPTURE:{const n=e.simplify(t.subs[0]);if(n!==t.subs[0]){const e=ji.fromRegexp(t);return e.runes=[],e.subs=[n],e}return t}case ji.Op.CONCAT:case ji.Op.ALTERNATE:{const n=[];let r=!1;for(let s=0;s<t.subs.length;s++){const i=t.subs[s],a=e.simplify(i);if(a!==i&&(r=!0),t.op===ji.Op.CONCAT){if(a.op===ji.Op.NO_MATCH)return new ji(ji.Op.NO_MATCH);if(a.op===ji.Op.EMPTY_MATCH){r=!0;continue}if(a.op===ji.Op.CONCAT){r=!0;for(let e=0;e<a.subs.length;e++)n.push(a.subs[e]);continue}}else if(t.op===ji.Op.ALTERNATE){if(a.op===ji.Op.NO_MATCH){r=!0;continue}if(a.op===ji.Op.ALTERNATE){r=!0;for(let e=0;e<a.subs.length;e++)n.push(a.subs[e]);continue}}n.push(a)}if(r){if(0===n.length)return new ji(t.op===ji.Op.CONCAT?ji.Op.EMPTY_MATCH:ji.Op.NO_MATCH);if(1===n.length)return n[0];const e=ji.fromRegexp(t);return e.runes=[],e.subs=n,e}return t}case ji.Op.CHAR_CLASS:return null===t.runes?t:0===t.runes.length?new ji(ji.Op.NO_MATCH):2===t.runes.length&&0===t.runes[0]&&t.runes[1]===ui.MAX_RUNE?new ji(ji.Op.ANY_CHAR):4===t.runes.length&&0===t.runes[0]&&t.runes[1]===ri.CODES.get("\n")-1&&t.runes[2]===ri.CODES.get("\n")+1&&t.runes[3]===ui.MAX_RUNE?new ji(ji.Op.ANY_CHAR_NOT_NL):t;case ji.Op.STAR:case ji.Op.PLUS:case ji.Op.QUEST:{const n=e.simplify(t.subs[0]);return e.simplify1(t.op,t.flags,n,t)}case ji.Op.REPEAT:{if(0===t.min&&0===t.max)return new ji(ji.Op.EMPTY_MATCH);const n=e.simplify(t.subs[0]);if(-1===t.max){if(0===t.min)return e.simplify1(ji.Op.STAR,t.flags,n,null);if(1===t.min)return e.simplify1(ji.Op.PLUS,t.flags,n,null);const r=new ji(ji.Op.CONCAT),s=[];for(let e=0;e<t.min-1;e++)s.push(n);return s.push(e.simplify1(ji.Op.PLUS,t.flags,n,null)),r.subs=s.slice(0),e.simplify(r)}if(1===t.min&&1===t.max)return n;let r=null;if(t.min>0){r=[];for(let e=0;e<t.min;e++)r.push(n)}if(t.max>t.min){let s=e.simplify1(ji.Op.QUEST,t.flags,n,null);for(let r=t.min+1;r<t.max;r++){const r=new ji(ji.Op.CONCAT);r.subs=[n,s],s=e.simplify1(ji.Op.QUEST,t.flags,r,null)}if(null===r)return s;r.push(s)}if(null!==r){const t=new ji(ji.Op.CONCAT);return t.subs=r.slice(0),e.simplify(t)}return new ji(ji.Op.NO_MATCH)}}return t}static simplify1(e,t,n,r){if(n.op===ji.Op.EMPTY_MATCH)return n;if(n.op===ji.Op.NO_MATCH)return e===ji.Op.PLUS?n:new ji(ji.Op.EMPTY_MATCH);if(e===n.op&&(t&qs.NON_GREEDY)===(n.flags&qs.NON_GREEDY))return n;if(null!==r&&r.op===e&&(r.flags&qs.NON_GREEDY)===(t&qs.NON_GREEDY)&&n===r.subs[0])return r;const s=new ji(e);return s.flags=t,s.subs=[n],s}},Zi=class{constructor(e,t){this.sign=e,this.cls=t}};const ea=[48,57],ta=[9,10,12,13,32,32],na=[48,57,65,90,95,95,97,122],ra=new Map([["\\d",new Zi(1,ea)],["\\D",new Zi(-1,ea)],["\\s",new Zi(1,ta)],["\\S",new Zi(-1,ta)],["\\w",new Zi(1,na)],["\\W",new Zi(-1,na)]]),sa=[48,57,65,90,97,122],ia=[65,90,97,122],aa=[0,127],oa=[9,9,32,32],Ba=[0,31,127,127],ca=[48,57],ua=[33,126],la=[97,122],ha=[32,126],Ca=[33,47,58,64,91,96,123,126],da=[9,13,32,32],pa=[65,90],fa=[48,57,65,90,95,95,97,122],ga=[48,57,65,70,97,102],ma=new Map([["[:alnum:]",new Zi(1,sa)],["[:^alnum:]",new Zi(-1,sa)],["[:alpha:]",new Zi(1,ia)],["[:^alpha:]",new Zi(-1,ia)],["[:ascii:]",new Zi(1,aa)],["[:^ascii:]",new Zi(-1,aa)],["[:blank:]",new Zi(1,oa)],["[:^blank:]",new Zi(-1,oa)],["[:cntrl:]",new Zi(1,Ba)],["[:^cntrl:]",new Zi(-1,Ba)],["[:digit:]",new Zi(1,ca)],["[:^digit:]",new Zi(-1,ca)],["[:graph:]",new Zi(1,ua)],["[:^graph:]",new Zi(-1,ua)],["[:lower:]",new Zi(1,la)],["[:^lower:]",new Zi(-1,la)],["[:print:]",new Zi(1,ha)],["[:^print:]",new Zi(-1,ha)],["[:punct:]",new Zi(1,Ca)],["[:^punct:]",new Zi(-1,Ca)],["[:space:]",new Zi(1,da)],["[:^space:]",new Zi(-1,da)],["[:upper:]",new Zi(1,pa)],["[:^upper:]",new Zi(-1,pa)],["[:word:]",new Zi(1,fa)],["[:^word:]",new Zi(-1,fa)],["[:xdigit:]",new Zi(1,ga)],["[:^xdigit:]",new Zi(-1,ga)]]);var Ea=class e{static charClassToString(e,t){let n="[";for(let r=0;r<t;r+=2){r>0&&(n+=" ");const t=e[r],s=e[r+1];n+=t===s?`0x${t.toString(16)}`:`0x${t.toString(16)}-0x${s.toString(16)}`}return n+="]",n}static cmp(e,t,n,r){const s=e[t]-n;return 0!==s?s:r-e[t+1]}static qsortIntPair(t,n,r){const s=(n+r)/2&-2,i=t[s],a=t[s+1];let o=n,B=r;for(;o<=B;){for(;o<r&&e.cmp(t,o,i,a)<0;)o+=2;for(;B>n&&e.cmp(t,B,i,a)>0;)B-=2;if(o<=B){if(o!==B){let e=t[o];t[o]=t[B],t[B]=e,e=t[o+1],t[o+1]=t[B+1],t[B+1]=e}o+=2,B-=2}}n<B&&e.qsortIntPair(t,n,B),o<r&&e.qsortIntPair(t,o,r)}constructor(e=di.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;e.qsortIntPair(this.r,0,this.len-2);let t=2;for(let e=2;e<this.len;e+=2){const n=this.r[e],r=this.r[e+1];n<=this.r[t-1]+1?r>this.r[t-1]&&(this.r[t-1]=r):(this.r[t]=n,this.r[t+1]=r,t+=2)}return this.len=t,this}appendLiteral(e,t){return 0!==(t&qs.FOLD_CASE)?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0)for(let n=2;n<=4;n+=2)if(this.len>=n){const r=this.r[this.len-n],s=this.r[this.len-n+1];if(e<=s+1&&r<=t+1)return e<r&&(this.r[this.len-n]=e),t>s&&(this.r[this.len-n+1]=t),this}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=ui.MIN_FOLD&&t>=ui.MAX_FOLD)return this.appendRange(e,t);if(t<ui.MIN_FOLD||e>ui.MAX_FOLD)return this.appendRange(e,t);e<ui.MIN_FOLD&&(this.appendRange(e,ui.MIN_FOLD-1),e=ui.MIN_FOLD),t>ui.MAX_FOLD&&(this.appendRange(ui.MAX_FOLD+1,t),t=ui.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let e=ui.simpleFold(n);e!==n;e=ui.simpleFold(e))this.appendRange(e,e)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const r=e[n],s=e[n+1];t<=r-1&&this.appendRange(t,r-1),t=s+1}return t<=ui.MAX_RUNE&&this.appendRange(t,ui.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),r=e.getHi(t),s=e.getStride(t);if(1!==s)for(let e=n;e<=r;e+=s)this.appendRange(e,e);else this.appendRange(n,r)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const r=e.getLo(n),s=e.getHi(n),i=e.getStride(n);if(1!==i)for(let e=r;e<=s;e+=i)t<=e-1&&this.appendRange(t,e-1),t=e+1;else t<=r-1&&this.appendRange(t,r-1),t=s+1}return t<=ui.MAX_RUNE&&this.appendRange(t,ui.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const r=this.r[n],s=this.r[n+1];e<=r-1&&(this.r[t]=e,this.r[t+1]=r-1,t+=2),e=s+1}return this.len=t,e<=ui.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=ui.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(t,n){let r=t.cls;return n&&(r=(new e).appendFoldedClass(r).cleanClass().toArray()),this.appendClassWithSign(r,t.sign)}toString(){return e.charClassToString(this.r,this.len)}},Da=class{constructor(e){this.str=e,this.position=0}pos(){return this.position}rewindTo(e){this.position=e}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(e){this.position+=e}skipString(e){this.position+=e.length}pop(){const e=this.str.codePointAt(this.position);return this.position+=di.charCount(e),e}lookingAt(e){return this.str.startsWith(e,this.position)}rest(){return this.str.substring(this.position)}from(e){return this.str.substring(e,this.position)}toString(){return this.rest()}},wa=(l=class{static unicodeTable(e){return"Any"===e?{tab:l.ANY_TABLE,fold:l.ANY_TABLE,sign:1}:"Ascii"===e?{tab:l.ASCII_TABLE,fold:l.ASCII_FOLD_TABLE,sign:1}:"Assigned"===e?{tab:ci.CATEGORIES.get("Cn"),fold:ci.CATEGORIES.get("Cn"),sign:-1}:"Lc"===e?{tab:ci.CATEGORIES.get("LC"),fold:ci.FOLD_CATEGORIES.get("LC"),sign:1}:ci.CATEGORIES.has(e)?{tab:ci.CATEGORIES.get(e),fold:ci.FOLD_CATEGORIES.get(e),sign:1}:ci.SCRIPTS.has(e)?{tab:ci.SCRIPTS.get(e),fold:ci.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<ui.MIN_FOLD||e>ui.MAX_FOLD)return e;let t=e;const n=e;for(e=ui.simpleFold(e);e!==n;e=ui.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===ji.Op.EMPTY_MATCH)return null;if(e.op===ji.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===ji.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new ji(ji.Op.LITERAL);return n.flags=t,n.runes=di.stringToRunes(e),n}static parse(e,t){return new l(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=l.parseInt(e);if(-1===n)return-1;if(!e.more())return-1;let r;if(e.lookingAt(",")){if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))r=-1;else if(-1===(r=l.parseInt(e)))return-1}else r=n;if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||-2===r||r>1e3||r>=0&&n>r)throw new Ii(l.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|r&ui.MAX_BMP}static isValidCaptureName(e){if(0===e.length)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==ri.CODES.get("_")&&!di.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=ri.CODES.get("0")&&e.peek()<=ri.CODES.get("9");)e.skip(1);const n=e.from(t);return 0===n.length||n.length>1&&n.codePointAt(0)===ri.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===ji.Op.LITERAL&&1===e.runes.length||e.op===ji.Op.CHAR_CLASS||e.op===ji.Op.ANY_CHAR_NOT_NL||e.op===ji.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case ji.Op.LITERAL:return 1===e.runes.length&&e.runes[0]===t;case ji.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case ji.Op.ANY_CHAR_NOT_NL:return t!==ri.CODES.get("\n");case ji.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case ji.Op.ANY_CHAR:break;case ji.Op.ANY_CHAR_NOT_NL:l.matchRune(t,ri.CODES.get("\n"))&&(e.op=ji.Op.ANY_CHAR);break;case ji.Op.CHAR_CLASS:t.op===ji.Op.LITERAL?e.runes=new Ea(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new Ea(e.runes).appendClass(t.runes).toArray();break;case ji.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=ji.Op.CHAR_CLASS,e.runes=(new Ea).appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray()}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new Ii(l.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case ri.CODES.get("1"):case ri.CODES.get("2"):case ri.CODES.get("3"):case ri.CODES.get("4"):case ri.CODES.get("5"):case ri.CODES.get("6"):case ri.CODES.get("7"):if(!e.more()||e.peek()<ri.CODES.get("0")||e.peek()>ri.CODES.get("7"))break;case ri.CODES.get("0"):{let t=n-ri.CODES.get("0");for(let n=1;n<3&&!(!e.more()||e.peek()<ri.CODES.get("0")||e.peek()>ri.CODES.get("7"));n++)t=8*t+e.peek()-ri.CODES.get("0"),e.skip(1);return t}case ri.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===ri.CODES.get("{")){let t=0,r=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===ri.CODES.get("}"))break;const s=di.unhex(n);if(s<0)break e;if(r=16*r+s,r>ui.MAX_RUNE)break e;t++}if(0===t)break e;return r}const t=di.unhex(n);if(!e.more())break;n=e.pop();const r=di.unhex(n);if(t<0||r<0)break;return 16*t+r}case ri.CODES.get("a"):return ri.CODES.get("");case ri.CODES.get("f"):return ri.CODES.get("\f");case ri.CODES.get("n"):return ri.CODES.get("\n");case ri.CODES.get("r"):return ri.CODES.get("\r");case ri.CODES.get("t"):return ri.CODES.get("\t");case ri.CODES.get("v"):return ri.CODES.get("\v");default:if(n<=ui.MAX_ASCII&&!di.isalnum(n))return n}throw new Ii(l.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new Ii(l.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?l.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(null===e)return!1;if(e.op===ji.Op.CAPTURE)return!0;if(e.subs)for(let t of e.subs)if(l.hasCapture(t))return!0;return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return null!==t&&null!==t.subs&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new ji(e),this.numRegexp+=1),t}reuse(e){null!==this.height&&this.height.has(e)&&this.height.delete(e),null!==e.subs&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>l.MAX_RUNES)throw new Ii(l.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(null===this.size){if(0===this.repeats&&(this.repeats=1),e.op===ji.Op.REPEAT){let t=e.max;-1===t&&(t=e.min),t<=0&&(t=1),t>Math.floor(l.MAX_SIZE/this.repeats)?this.repeats=l.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(l.MAX_SIZE/this.repeats))return;this.size=new Map;for(let e of this.stack)this.checkSize(e)}if(this.calcSize(e,!0)>l.MAX_SIZE)throw new Ii(l.ERR_LARGE)}calcSize(e,t=!1){if(!t&&null!==this.size&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case ji.Op.LITERAL:n=e.runes.length;break;case ji.Op.PLB:case ji.Op.NLB:case ji.Op.CAPTURE:case ji.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case ji.Op.PLUS:case ji.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case ji.Op.CONCAT:for(let t of e.subs)n+=this.calcSize(t);break;case ji.Op.ALTERNATE:for(let t of e.subs)n+=this.calcSize(t);e.subs.length>1&&(n=n+e.subs.length-1);break;case ji.Op.REPEAT:{let t=this.calcSize(e.subs[0]);if(-1===e.max){n=0===e.min?2+t:1+e.min*t;break}n=e.max*t+(e.max-e.min);break}}return n=Math.max(1,n),null===this.size&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<l.MAX_HEIGHT)){if(null===this.height){this.height=new Map;for(let e of this.stack)this.checkHeight(e)}if(this.calcHeight(e,!0)>l.MAX_HEIGHT)throw new Ii(l.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&null!==this.height&&this.height.has(e))return this.height.get(e);let n=1;for(let r of e.subs){const e=this.calcHeight(r);n<1+e&&(n=1+e)}return null===this.height&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!ji.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===ji.Op.CHAR_CLASS&&2===e.runes.length&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],-2&this.flags))return null;e.op=ji.Op.LITERAL,e.runes=[e.runes[0]],e.flags=-2&this.flags}else if(e.op===ji.Op.CHAR_CLASS&&4===e.runes.length&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&ui.simpleFold(e.runes[0])===e.runes[2]&&ui.simpleFold(e.runes[2])===e.runes[0]||e.op===ji.Op.CHAR_CLASS&&2===e.runes.length&&e.runes[0]+1===e.runes[1]&&ui.simpleFold(e.runes[0])===e.runes[1]&&ui.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|qs.FOLD_CASE))return null;e.op=ji.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|qs.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const r=this.stack[n-1],s=this.stack[n-2];return r.op===ji.Op.LITERAL&&s.op===ji.Op.LITERAL&&(r.flags&qs.FOLD_CASE)===(s.flags&qs.FOLD_CASE)&&(s.runes=l.concatRunes(s.runes,r.runes),e>=0?(r.runes=[e],r.flags=t,!0):(this.pop(),this.reuse(r),!1))}newLiteral(e,t){const n=this.newRegexp(ji.Op.LITERAL);return n.flags=t,0!==(t&qs.FOLD_CASE)&&(e=l.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,r,s,i){let a=this.flags;if(0!==(a&qs.PERL_X)&&(s.more()&&s.lookingAt("?")&&(s.skip(1),a^=qs.NON_GREEDY),-1!==i))throw new Ii(l.ERR_INVALID_REPEAT_OP,s.from(i));const o=this.stack.length;if(0===o)throw new Ii(l.ERR_MISSING_REPEAT_ARGUMENT,s.from(r));const B=this.stack[o-1];if(ji.isPseudoOp(B.op))throw new Ii(l.ERR_MISSING_REPEAT_ARGUMENT,s.from(r));const c=this.newRegexp(e);if(c.min=t,c.max=n,c.flags=a,c.subs=[B],this.stack[o-1]=c,this.checkLimits(c),e===ji.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(c,1e3))throw new Ii(l.ERR_INVALID_REPEAT_SIZE,s.from(r))}repeatIsValid(e,t){if(e.op===ji.Op.REPEAT){let n=e.max;if(0===n)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return 0===e.length?this.push(this.newRegexp(ji.Op.EMPTY_MATCH)):this.push(this.collapse(e,ji.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),0===e.length?this.push(this.newRegexp(ji.Op.NO_MATCH)):this.push(this.collapse(e,ji.Op.ALTERNATE))}cleanAlt(e){e.op===ji.Op.CHAR_CLASS&&(e.runes=new Ea(e.runes).cleanClass().toArray(),2===e.runes.length&&0===e.runes[0]&&e.runes[1]===ui.MAX_RUNE?(e.runes=[],e.op=ji.Op.ANY_CHAR):4===e.runes.length&&0===e.runes[0]&&e.runes[1]===ri.CODES.get("\n")-1&&e.runes[2]===ri.CODES.get("\n")+1&&e.runes[3]===ui.MAX_RUNE&&(e.runes=[],e.op=ji.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(1===e.length)return e[0];let n=0;for(let a of e)n+=a.op===t?a.subs.length:1;let r=new Array(n).fill(null),s=0;for(let a of e)if(a.op===t){for(let e=0;e<a.subs.length;e++)r[s++]=a.subs[e];this.reuse(a)}else r[s++]=a;let i=this.newRegexp(t);if(i.subs=r,t===ji.Op.ALTERNATE&&(i.subs=this.factor(i.subs),1===i.subs.length)){const e=i;i=i.subs[0],this.reuse(e)}return i}factor(e){if(e.length<2)return e;let t=0,n=e.length,r=0,s=null,i=0,a=0,o=0;for(let c=0;c<=n;c++){let B=null,u=0,l=0;if(c<n){let n=e[t+c];if(n.op===ji.Op.CONCAT&&n.subs.length>0&&(n=n.subs[0]),n.op===ji.Op.LITERAL&&(B=n.runes,u=n.runes.length,l=n.flags&qs.FOLD_CASE),l===a){let e=0;for(;e<i&&e<u&&s[e]===B[e];)e++;if(e>0){i=e;continue}}}if(c===o);else if(c===o+1)e[r++]=e[t+o];else{const n=this.newRegexp(ji.Op.LITERAL);n.flags=a,n.runes=s.slice(0,i);for(let r=o;r<c;r++)e[t+r]=this.removeLeadingString(e[t+r],i),this.checkLimits(e[t+r]);const B=this.collapse(e.slice(t+o,t+c),ji.Op.ALTERNATE),u=this.newRegexp(ji.Op.CONCAT);u.subs=[n,B],e[r++]=u}o=c,s=B,i=u,a=l}n=r,t=0,o=0,r=0;let B=null;for(let c=0;c<=n;c++){let s=null;if(!(c<n&&(s=l.leadingRegexp(e[t+c]),null!==B&&B.equals(s)&&(l.isCharClass(B)||B.op===ji.Op.REPEAT&&B.min===B.max&&l.isCharClass(B.subs[0]))))){if(c===o);else if(c===o+1)e[r++]=e[t+o];else{const n=B;for(let r=o;r<c;r++){const n=r!==o;e[t+r]=this.removeLeadingRegexp(e[t+r],n),this.checkLimits(e[t+r])}const s=this.collapse(e.slice(t+o,t+c),ji.Op.ALTERNATE),i=this.newRegexp(ji.Op.CONCAT);i.subs=[n,s],e[r++]=i}o=c,B=s}}n=r,t=0,o=0,r=0;for(let c=0;c<=n;c++)if(!(c<n&&l.isCharClass(e[t+c]))){if(c===o);else if(c===o+1)e[r++]=e[t+o];else{let n=o;for(let r=o+1;r<c;r++){const s=e[t+n],i=e[t+r];(s.op<i.op||s.op===i.op&&(null!==s.runes?s.runes.length:0)<(null!==i.runes?i.runes.length:0))&&(n=r)}const s=e[t+o];e[t+o]=e[t+n],e[t+n]=s;for(let r=o+1;r<c;r++)l.mergeCharClass(e[t+o],e[t+r]),this.reuse(e[t+r]);this.cleanAlt(e[t+o]),e[r++]=e[t+o]}c<n&&(e[r++]=e[t+c]),o=c+1}n=r,t=0,o=0,r=0;for(let c=0;c<n;++c)c+1<n&&e[t+c].op===ji.Op.EMPTY_MATCH&&e[t+c+1].op===ji.Op.EMPTY_MATCH||(e[r++]=e[t+c]);return n=r,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===ji.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===ji.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=ji.Op.EMPTY_MATCH,e.subs=ji.emptySubs();break;case 2:{const t=e;e=e.subs[1],this.reuse(t);break}default:e.subs=e.subs.slice(1,e.subs.length)}return e}return e.op===ji.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),0===e.runes.length&&(e.op=ji.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===ji.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=ji.Op.EMPTY_MATCH,e.subs=ji.emptySubs();break;case 1:{const t=e;e=e.subs[0],this.reuse(t);break}}return e}return t&&this.reuse(e),this.newRegexp(ji.Op.EMPTY_MATCH)}parseInternal(){if(0!==(this.flags&qs.LITERAL))return l.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const r=new Da(this.wholeRegexp);for(;r.more();){let s=-1;e:switch(r.peek()){case ri.CODES.get("("):if(0!==(this.flags&qs.LOOKBEHIND)){if(r.lookingAt("(?<=")){this.parsePosLookBehind(),r.skip(4);break}if(r.lookingAt("(?<!")){this.parseNegLookBehind(),r.skip(4);break}}if(0!==(this.flags&qs.PERL_X)&&r.lookingAt("(?")){this.parsePerlFlags(r);break}this.op(ji.Op.LEFT_PAREN).cap=++this.numCap,r.skip(1);break;case ri.CODES.get("|"):this.parseVerticalBar(),r.skip(1);break;case ri.CODES.get(")"):this.parseRightParen(),r.skip(1);break;case ri.CODES.get("^"):0!==(this.flags&qs.ONE_LINE)?this.op(ji.Op.BEGIN_TEXT):this.op(ji.Op.BEGIN_LINE),r.skip(1);break;case ri.CODES.get("$"):0!==(this.flags&qs.ONE_LINE)?this.op(ji.Op.END_TEXT).flags|=qs.WAS_DOLLAR:this.op(ji.Op.END_LINE),r.skip(1);break;case ri.CODES.get("."):0!==(this.flags&qs.DOT_NL)?this.op(ji.Op.ANY_CHAR):this.op(ji.Op.ANY_CHAR_NOT_NL),r.skip(1);break;case ri.CODES.get("["):this.parseClass(r);break;case ri.CODES.get("*"):case ri.CODES.get("+"):case ri.CODES.get("?"):{s=r.pos();let i=null;switch(r.pop()){case ri.CODES.get("*"):i=ji.Op.STAR;break;case ri.CODES.get("+"):i=ji.Op.PLUS;break;case ri.CODES.get("?"):i=ji.Op.QUEST}this.repeat(i,t,n,s,r,e);break}case ri.CODES.get("{"):{s=r.pos();const i=l.parseRepeat(r);if(i<0){r.rewindTo(s),this.literal(r.pop());break}t=i>>16,n=(i&ui.MAX_BMP)<<16>>16,this.repeat(ji.Op.REPEAT,t,n,s,r,e);break}case ri.CODES.get("\\"):{const e=r.pos();if(r.skip(1),0!==(this.flags&qs.PERL_X)&&r.more())switch(r.pop()){case ri.CODES.get("A"):this.op(ji.Op.BEGIN_TEXT);break e;case ri.CODES.get("b"):this.op(ji.Op.WORD_BOUNDARY);break e;case ri.CODES.get("B"):this.op(ji.Op.NO_WORD_BOUNDARY);break e;case ri.CODES.get("C"):throw new Ii(l.ERR_INVALID_ESCAPE,"\\C");case ri.CODES.get("Q"):{let e=r.rest();const t=e.indexOf("\\E");t>=0?(e=e.substring(0,t),r.skipString(e),r.skipString("\\E")):r.skipString(e);let n=0;for(;n<e.length;){const t=e.codePointAt(n);this.literal(t),n+=di.charCount(t)}break e}case ri.CODES.get("z"):this.op(ji.Op.END_TEXT);break e;default:r.rewindTo(e)}else r.rewindTo(e);const t=this.newRegexp(ji.Op.CHAR_CLASS);if(t.flags=this.flags,r.lookingAt("\\p")||r.lookingAt("\\P")){const e=new Ea;if(this.parseUnicodeClass(r,e)){t.runes=e.toArray(),this.push(t);break e}}const n=new Ea;if(this.parsePerlClassEscape(r,n)){t.runes=n.toArray(),this.push(t);break e}r.rewindTo(e),this.reuse(t),this.literal(l.parseEscape(r));break}default:this.literal(r.pop())}e=s}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),1!==this.stack.length)throw new Ii(l.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const t="P"===n.charAt(2)?4:3,r=n.indexOf(">");if(r<0)throw new Ii(l.ERR_INVALID_NAMED_CAPTURE,n);const s=n.substring(t,r);if(e.skipString(s),e.skip(t+1),!l.isValidCaptureName(s))throw new Ii(l.ERR_INVALID_NAMED_CAPTURE,n.substring(0,r+1));const i=this.op(ji.Op.LEFT_PAREN);if(i.cap=++this.numCap,this.namedGroups[s])throw new Ii(l.ERR_DUPLICATE_NAMED_CAPTURE,s);return this.namedGroups[s]=this.numCap,void(i.name=s)}e.skip(2);let r=this.flags,s=1,i=!1;e:for(;e.more();){const t=e.pop();switch(t){case ri.CODES.get("i"):r|=qs.FOLD_CASE,i=!0;break;case ri.CODES.get("m"):r&=-17,i=!0;break;case ri.CODES.get("s"):r|=qs.DOT_NL,i=!0;break;case ri.CODES.get("U"):r|=qs.NON_GREEDY,i=!0;break;case ri.CODES.get("-"):if(s<0)break e;s=-1,r=~r,i=!1;break;case ri.CODES.get(":"):case ri.CODES.get(")"):if(s<0){if(!i)break e;r=~r}return t===ri.CODES.get(":")&&this.op(ji.Op.LEFT_PAREN),void(this.flags=r);default:break e}}throw new Ii(l.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(ji.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(ji.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(ji.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===ji.Op.VERTICAL_BAR&&l.isCharClass(this.stack[e-1])&&l.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const r=n;n=t,t=r,this.stack[e-3]=n}return l.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===ji.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new Ii(l.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==ji.Op.LEFT_PAREN)throw new Ii(l.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,0!==t.lb){if(l.hasCapture(e))throw new Ii(l.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);return t.lb>0?t.op=ji.Op.PLB:t.op=ji.Op.NLB,t.subs=[e],void this.push(t)}0===t.cap?this.push(e):(t.op=ji.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if(0===(this.flags&qs.PERL_X)||!e.more()||e.pop()!==ri.CODES.get("\\")||!e.more())return!1;e.pop();const r=e.from(n),s=ra.has(r)?ra.get(r):null;return null!==s&&(t.appendGroup(s,0!==(this.flags&qs.FOLD_CASE)),!0)}parseNamedClass(e,t){const n=e.rest(),r=n.indexOf(":]");if(r<0)return!1;const s=n.substring(0,r+2);e.skipString(s);const i=ma.has(s)?ma.get(s):null;if(null===i)throw new Ii(l.ERR_INVALID_CHAR_RANGE,s);return t.appendGroup(i,0!==(this.flags&qs.FOLD_CASE)),!0}parseUnicodeClass(e,t){const n=e.pos();if(0===(this.flags&qs.UNICODE_GROUPS)||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let r,s=1,i=e.pop();if(i===ri.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new Ii(l.ERR_INVALID_CHAR_RANGE,e.rest());if(i=e.pop(),i!==ri.CODES.get("{"))r=di.runeToString(i);else{const t=e.rest(),s=t.indexOf("}");if(s<0)throw e.rewindTo(n),new Ii(l.ERR_INVALID_CHAR_RANGE,e.rest());r=t.substring(0,s),e.skipString(r),e.skip(1)}0!==r.length&&r.codePointAt(0)===ri.CODES.get("^")&&(s=0-s,r=r.substring(1));const a=l.unicodeTable(r);if(null===a)throw new Ii(l.ERR_INVALID_CHAR_RANGE,e.from(n));a.sign<0&&(s=0-s);const o=a.tab,B=a.fold;if(0===(this.flags&qs.FOLD_CASE)||null===B)t.appendTableWithSign(o,s);else{const e=(new Ea).appendTable(o).appendTable(B).cleanClass().toArray();t.appendClassWithSign(e,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(ji.Op.CHAR_CLASS);n.flags=this.flags;const r=new Ea;let s=1;e.more()&&e.lookingAt("^")&&(s=-1,e.skip(1),0===(this.flags&qs.CLASS_NL)&&r.appendRange(ri.CODES.get("\n"),ri.CODES.get("\n")));let i=!0;for(;!e.more()||e.peek()!==ri.CODES.get("]")||i;){if(e.more()&&e.lookingAt("-")&&0===(this.flags&qs.PERL_X)&&!i){const n=e.rest();if("-"===n||!n.startsWith("-]"))throw e.rewindTo(t),new Ii(l.ERR_INVALID_CHAR_RANGE,e.rest())}i=!1;const n=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,r))continue;e.rewindTo(n)}if(this.parseUnicodeClass(e,r))continue;if(this.parsePerlClassEscape(e,r))continue;e.rewindTo(n);const s=l.parseClassChar(e,t);let a=s;if(e.more()&&e.lookingAt("-"))if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(a=l.parseClassChar(e,t),a<s)throw new Ii(l.ERR_INVALID_CHAR_RANGE,e.from(n));0===(this.flags&qs.FOLD_CASE)?r.appendRange(s,a):r.appendFoldedRange(s,a)}e.skip(1),r.cleanClass(),s<0&&r.negateClass(),n.runes=r.toArray(),this.push(n)}},d(l,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),d(l,"ERR_INVALID_CHAR_RANGE","invalid character class range"),d(l,"ERR_INVALID_ESCAPE","invalid escape sequence"),d(l,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),d(l,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),d(l,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),d(l,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),d(l,"ERR_MISSING_BRACKET","missing closing ]"),d(l,"ERR_MISSING_PAREN","missing closing )"),d(l,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),d(l,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),d(l,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),d(l,"ERR_UNEXPECTED_PAREN","unexpected )"),d(l,"ERR_NESTING_DEPTH","expression nests too deeply"),d(l,"ERR_LARGE","expression too large"),d(l,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),d(l,"MAX_HEIGHT",1e3),d(l,"MAX_SIZE",3355443),d(l,"MAX_RUNES",33554432),d(l,"ANY_TABLE",new si(new Uint32Array([0,ui.MAX_RUNE,1]))),d(l,"ASCII_TABLE",new si(new Uint32Array([0,127,1]))),d(l,"ASCII_FOLD_TABLE",new si(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),l),ya=class e{static initTest(t){const n=e.compile(t),r=new e(n.expr,n.prog,n.numSubexp,n.longest);return r.cond=n.cond,r.prefix=n.prefix,r.prefixUTF8=n.prefixUTF8,r.prefixComplete=n.prefixComplete,r.prefixRune=n.prefixRune,r.prefilter=n.prefilter,r}static compile(t){return e.compileImpl(t,qs.PERL,!1)}static compilePOSIX(t){return e.compileImpl(t,qs.POSIX,!0)}static compileImpl(t,n,r){let s=wa.parse(t,n);const i=s.maxCap();s=Xi.simplify(s);const a=zi.build(s),o=$i.compileRegexp(s),B=new e(t,o,i,r);B.prefilter=a.type===qi.Type.NONE?null:a;const[c,u]=o.prefix();return B.prefixComplete=c,B.prefix=u,B.prefixUTF8=di.stringToUtf8ByteArray(B.prefix),B.prefix.length>0&&(B.prefixRune=B.prefix.codePointAt(0)),B.namedGroups=s.namedGroups,B}static match(t,n){return e.compile(t).match(n)}constructor(e,t,n=0,r=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=r,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new xi(this.prog),this.onepass=Ji.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,r){if((n===qs.ANCHOR_START||n===qs.ANCHOR_BOTH)&&0!==t)return null;let s=-1,i=-1;const a=e.prefixLength(this);if(n===qs.UNANCHORED){const n=e.index(this,t);if(n<0)return null;s=t+n,i=s+a}else if(n===qs.ANCHOR_BOTH){if(e.endPos()!==a)return null;if(0!==e.index(this,0))return null;s=0,i=a}else if(n===qs.ANCHOR_START){if(0!==e.index(this,0))return null;s=0,i=a}if(s<0)return null;if(r>0){const e=new Int32Array(r).fill(-1);return e[0]=s,e[1]=i,Array.from(e)}return[]}executeEngine(e,t,n,r){if(this.prefixComplete&&(0===r||0===this.numSubexp))return this.matchPrefixComplete(e,t,n,r);if(null!==this.prefilter&&n===qs.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(null!==this.onepass)return Ji.execute(this,e,t,n,r);if(r>0)return 0===this.prog.numLb&&e.endPos()<=Hi.maxBitStateLen(this.prog)?Hi.execute(this,e,t,n,r):this.doExecuteNFA(e,t,n,r);if(0===this.prog.numLb){const s=this.dfa.match(e,t,n);if(null!==s)return s?[]:null;if(e.endPos()<=Hi.maxBitStateLen(this.prog))return Hi.execute(this,e,t,n,r)}return this.doExecuteNFA(e,t,n,r)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,r){let s=this.get();s||(s=Li.fromRE2(this)),s.init(r);const i=s.match(e,t,n)?s.submatches():null;return this.put(s),i}match(e){return null!==this.executeEngine(vi.fromUTF16(e),0,qs.UNANCHORED,0)}matchWithGroup(e,t,n,r,s){return e instanceof fi||(e=di.isByteArray(e)?Ei.utf8(e):Ei.utf16(e)),this.matchMachineInput(e,t,n,r,s)}matchMachineInput(e,t,n,r,s){if(t>n)return[!1,null];const i=e.isUTF16Encoding()?vi.fromUTF16(e.asCharSequence(),0,n):vi.fromUTF8(e.asBytes(),0,n),a=this.executeEngine(i,t,r,2*s);return null===a?[!1,null]:[!0,a]}matchUTF8(e){return null!==this.executeEngine(vi.fromUTF8(e),0,qs.UNANCHORED,0)}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let r=0,s=0,i="";const a=vi.fromUTF16(e);let o=0;for(;s<=e.length;){const B=this.executeEngine(a,s,qs.UNANCHORED,2);if(null===B||0===B.length)break;i+=e.substring(r,B[0]),(B[1]>r||0===B[0])&&(i+=t(e.substring(B[0],B[1])),o++),r=B[1];const c=7&a.step(s);if(s+c>B[1]?s+=c:s+1>B[1]?s++:s=B[1],o>=n)break}return i+=e.substring(r),i}pad(e){if(null===e)return null;let t=2*(1+this.numSubexp);if(e.length<t){let n=new Array(t).fill(-1);for(let t=0;t<e.length;t++)n[t]=e[t];e=n}return e}allMatches(e,t,n=e=>e){let r=[];const s=e.endPos();t<0&&(t=s+1);let i=0,a=0,o=-1;for(;a<t&&i<=s;){const t=this.executeEngine(e,i,qs.UNANCHORED,this.prog.numCap);if(null===t||0===t.length)break;let B=!0;if(t[1]===i){t[0]===o&&(B=!1);const n=e.step(i);n<0?i=s+1:i+=7&n}else i=t[1];o=t[1],B&&(r.push(n(this.pad(t))),a++)}return r}findUTF8(e){const t=this.executeEngine(vi.fromUTF8(e),0,qs.UNANCHORED,2);return null===t?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(vi.fromUTF8(e),0,qs.UNANCHORED,2);return null===t?null:t.slice(0,2)}find(e){const t=this.executeEngine(vi.fromUTF16(e),0,qs.UNANCHORED,2);return null===t?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(vi.fromUTF16(e),0,qs.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(vi.fromUTF8(e),0,qs.UNANCHORED,this.prog.numCap);if(null===t)return null;const n=new Array(1+this.numSubexp).fill(null);for(let r=0;r<n.length;r++)2*r<t.length&&t[2*r]>=0&&(n[r]=e.slice(t[2*r],t[2*r+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(vi.fromUTF8(e),0,qs.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(vi.fromUTF16(e),0,qs.UNANCHORED,this.prog.numCap);if(null===t)return null;const n=new Array(1+this.numSubexp).fill(null);for(let r=0;r<n.length;r++)2*r<t.length&&t[2*r]>=0&&(n[r]=e.substring(t[2*r],t[2*r+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(vi.fromUTF16(e),0,qs.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(vi.fromUTF8(e),t,t=>e.slice(t[0],t[1]));return 0===n.length?null:n}findAllUTF8Index(e,t){const n=this.allMatches(vi.fromUTF8(e),t,e=>e.slice(0,2));return 0===n.length?null:n}findAll(e,t){const n=this.allMatches(vi.fromUTF16(e),t,t=>e.substring(t[0],t[1]));return 0===n.length?null:n}findAllIndex(e,t){const n=this.allMatches(vi.fromUTF16(e),t,e=>e.slice(0,2));return 0===n.length?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(vi.fromUTF8(e),t,t=>{let n=new Array(t.length/2|0).fill(null);for(let r=0;r<n.length;r++)t[2*r]>=0&&(n[r]=e.slice(t[2*r],t[2*r+1]));return n});return 0===n.length?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(vi.fromUTF8(e),t);return 0===n.length?null:n}findAllSubmatch(e,t){const n=this.allMatches(vi.fromUTF16(e),t,t=>{let n=new Array(t.length/2|0).fill(null);for(let r=0;r<n.length;r++)t[2*r]>=0&&(n[r]=e.substring(t[2*r],t[2*r+1]));return n});return 0===n.length?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(vi.fromUTF16(e),t);return 0===n.length?null:n}},va=class e{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(t){let n="";if(t instanceof RegExp&&(t.ignoreCase&&(n+="i"),t.multiline&&(n+="m"),t.dotAll&&(n+="s"),t=t.source),"string"!=typeof t)return t;let r="",s=!1,i=t.length;0===i&&(r="(?:)",s=!0);let a=!1,o=0;for(;o<i;){let n=t[o];if("\\"===n){if(o+1<i)switch(n=t[o+1],n){case"\\":r+="\\\\",o+=2;continue;case"c":if(o+2<i){let e=t[o+2].charCodeAt(0);if(e>=65&&e<=90||e>=97&&e<=122){let t=e%32;r+="\\x",r+=(t>>4).toString(16).toUpperCase(),r+=(15&t).toString(16).toUpperCase(),o+=3,s=!0;continue}}r+="c",o+=2,s=!0;continue;case"u":if(o+2<i)if("{"===t[o+2]){let n=o+3,a=!1,B=!1;for(;n<i;){const r=t[n];if("}"===r){B=!0;break}if(!e.isHexadecimal(r))break;a=!0,n++}if(B&&a){r+="\\x",o+=2,s=!0;continue}}else if(o+5<i){let n=!0;for(let r=0;r<4;r++)if(!e.isHexadecimal(t[o+2+r])){n=!1;break}if(n){r+="\\x{"+t.substring(o+2,o+6)+"}",o+=6,s=!0;continue}}r+="u",o+=2,s=!0;continue;case"x":{let n=!1;if(o+2<i&&"{"===t[o+2]){let r=o+3,s=!1,a=!1;for(;r<i;){const n=t[r];if("}"===n){a=!0;break}if(!e.isHexadecimal(n))break;s=!0,r++}a&&s&&(n=!0)}else o+3<i&&e.isHexadecimal(t[o+2])&&e.isHexadecimal(t[o+3])&&(n=!0);n?(r+="\\x",o+=2):(r+="x",o+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":r+="\\"+n,o+=2;continue;default:{let e=t.codePointAt(o+1);if(e>=48&&e<=57||e>=65&&e<=90||e>=97&&e<=122){let n=di.charCount(e);r+=t.substring(o+1,o+1+n),o+=n+1,s=!0}else{r+="\\";let n=di.charCount(e);r+=t.substring(o+1,o+1+n),o+=n+1}continue}}}else{if("/"===n){r+="\\/",o+=1,s=!0;continue}if("["===n)a=!0;else if("]"===n)a=!1;else if(!a&&"("===n&&o+2<i&&"?"===t[o+1]&&"<"===t[o+2]&&o+3<i&&!"=!>)".includes(t[o+3])){r+="(?P<",o+=3,s=!0;continue}}let B=t.codePointAt(o),c=di.charCount(B);r+=t.substring(o,o+c),o+=c}const B=s?r:t;return n.length>0?`(?${n})${B}`:B}},_a=(h=class{static quote(e){return di.quoteMeta(e)}static quoteReplacement(e,t=!1){return Ni.quoteReplacement(e,t)}static translateRegExp(e){return va.translate(e)}static compile(e,t=0){let n=e;if(0!==(t&h.CASE_INSENSITIVE)&&(n=`(?i)${n}`),0!==(t&h.DOTALL)&&(n=`(?s)${n}`),0!==(t&h.MULTILINE)&&(n=`(?m)${n}`),-544&t)throw new Ai("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let r=qs.PERL;0!==(t&h.DISABLE_UNICODE_GROUPS)&&(r&=-129),0!==(t&h.LOOKBEHINDS)&&(r|=qs.LOOKBEHIND);const s=new h(e,t);return s.re2Input=ya.compileImpl(n,r,0!==(t&h.LONGEST_MATCH)),s}static matches(e,t){return h.compile(e).testExact(t)}static initTest(e,t,n){if(null==e)throw new Error("pattern is null");if(null==n)throw new Error("re2 is null");const r=new h(e,t);return r.re2Input=n,r}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return di.isByteArray(e)&&(e=Ei.utf8(e)),new Ni(this,e)}test(e){return di.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=di.isByteArray(e)?vi.fromUTF8(e):vi.fromUTF16(e);return null!==this.re2Input.executeEngine(t,0,qs.ANCHOR_BOTH,0)}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let s=1;s<=t.groupCount();s++){const e=t.group(s);n.push(null===e?void 0:e)}n.index=t.start(0),n.input=e;const r=this.namedGroups();if(Object.keys(r).length>0){const e=t.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);n.groups=e}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),r=[];let s=0,i=0;for(;n.find();)if(0!==i||0!==n.end()){if(t>0&&r.length===t-1)break;if(i===n.start()){if(0===t){s+=1,i=n.end();continue}}else for(;s>0;)r.push(""),s-=1;r.push(n.substring(i,n.start())),i=n.end()}else i=n.end();if(0===t&&i!==n.inputLength()){for(;s>0;)r.push(""),s-=1;r.push(n.substring(i,n.inputLength()))}return 0===t&&(0!==r.length||i===n.inputLength()&&i>0)||r.push(n.substring(i,n.inputLength())),r}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let e=1;e<=t.groupCount();e++){const r=t.group(e);n.push(null===r?void 0:r)}n.index=t.start(0),n.input=e;const r=this.namedGroups();if(Object.keys(r).length>0){const e=t.getNamedGroups();for(const t in e)null===e[t]&&(e[t]=void 0);n.groups=e}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e||null!==e&&this.constructor===e.constructor&&(this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput)}},d(h,"CASE_INSENSITIVE",zs),d(h,"DOTALL",Qs),d(h,"MULTILINE",Ys),d(h,"DISABLE_UNICODE_GROUPS",Ws),d(h,"LONGEST_MATCH",$s),d(h,"LOOKBEHINDS",Xs),h);
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
let Ia="12.19.0";
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
const Ta=new $("@firebase/firestore");function ba(){return Ta.logLevel}function Aa(e){Ta.setLogLevel(e)}function Oa(e,...t){if(Ta.logLevel<=K.DEBUG){const n=t.map(Fa);Ta.debug(`Firestore (${Ia}): ${e}`,...n)}}function Na(e,...t){if(Ta.logLevel<=K.ERROR){const n=t.map(Fa);Ta.error(`Firestore (${Ia}): ${e}`,...n)}}function Sa(e,...t){if(Ta.logLevel<=K.WARN){const n=t.map(Fa);Ta.warn(`Firestore (${Ia}): ${e}`,...n)}}function Fa(e){if("string"==typeof e)return e;try{return t=e,JSON.stringify(t)}catch(n){return e}var t}
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
 */function La(e,t,n){let r="Unexpected state";"string"==typeof t?r=t:n=t,Ra(e,r,n)}function Ra(e,t,n){let r=`FIRESTORE (${Ia}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(s){r+=" CONTEXT: "+n}throw Na(r),new Error(r)}function ka(e,t,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,e||Ra(t,s,r)}function Pa(e,t){return e}
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
 */function xa(e){const t="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(n);else for(let r=0;r<e;r++)n[r]=Math.floor(256*Math.random());return n}
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
 */class Ma{static newId(){const e=62*Math.floor(256/62);let t="";for(;t.length<20;){const n=xa(40);for(let r=0;r<n.length;++r)t.length<20&&n[r]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return t}}function Ga(e,t){return e<t?-1:e>t?1:0}function Ha(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=e.charAt(r),s=t.charAt(r);if(n!==s)return Ja(n)===Ja(s)?Ga(n,s):Ja(n)?1:-1}return Ga(e.length,t.length)}const Ua=55296,Va=57343;function Ja(e){const t=e.charCodeAt(0);return t>=Ua&&t<=Va}function ja(e,t,n){return e.length===t.length&&e.every((e,r)=>n(e,t[r]))}
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
 */class Ka{constructor(e,t){this.comparator=e,this.root=t||za.EMPTY}insert(e,t){return new Ka(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,za.BLACK,null,null))}remove(e){return new Ka(this.comparator,this.root.remove(e,this.comparator).copy(null,null,za.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(0===n)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(0===r)return t+n.left.size;r<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new qa(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new qa(this.root,e,this.comparator,!1)}getReverseIterator(){return new qa(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new qa(this.root,e,this.comparator,!0)}}class qa{constructor(e,t,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class za{constructor(e,t,n,r,s){this.key=e,this.value=t,this.color=null!=n?n:za.RED,this.left=null!=r?r:za.EMPTY,this.right=null!=s?s:za.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,r,s){return new za(null!=e?e:this.key,null!=t?t:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const s=n(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,t,n),null):0===s?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return za.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===t(e,r.key)){if(r.right.isEmpty())return za.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,za.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,za.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw La(43730,{key:this.key,value:this.value});if(this.right.isRed())throw La(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw La(27949);return e+(this.isRed()?0:1)}}za.EMPTY=null,za.RED=!0,za.BLACK=!1,za.EMPTY=new class{constructor(){this.size=0}get key(){throw La(57766)}get value(){throw La(16141)}get color(){throw La(16727)}get left(){throw La(29726)}get right(){throw La(36894)}copy(e,t,n,r,s){return this}insert(e,t,n){return new za(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
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
class Qa{constructor(e){this.comparator=e,this.data=new Ka(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let n;for(n=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Ya(this.data.getIterator())}getIteratorFrom(e){return new Ya(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof Qa))return!1;if(this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(0!==this.comparator(e,r))return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Qa(this.comparator);return t.data=e,t}}class Ya{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
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
 */const Wa={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class $a extends O{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
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
 */const Xa="__name__";class Za{constructor(e,t,n){void 0===t?t=0:t>e.length&&La(637,{offset:t,range:e.length}),void 0===n?n=e.length-t:n>e.length-t&&La(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return 0===Za.comparator(this,e)}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Za?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=Za.compareSegments(e.get(r),t.get(r));if(0!==n)return n}return Ga(e.length,t.length)}static compareSegments(e,t){const n=Za.isNumericId(e),r=Za.isNumericId(t);return n&&!r?-1:!n&&r?1:n&&r?Za.extractNumericId(e).compare(Za.extractNumericId(t)):Ha(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Rs.fromString(e.substring(4,e.length-2))}}class eo extends Za{construct(e,t,n){return new eo(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new $a(Wa.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(e=>e.length>0))}return new eo(t)}static emptyPath(){return new eo([])}}const to=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let no=class e extends Za{construct(t,n,r){return new e(t,n,r)}static isValidIdentifier(e){return to.test(e)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),e.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===Xa}static keyField(){return new e([Xa])}static fromServerFormat(t){const n=[];let r="",s=0;const i=()=>{if(0===r.length)throw new $a(Wa.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<t.length;){const e=t[s];if("\\"===e){if(s+1===t.length)throw new $a(Wa.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const e=t[s+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new $a(Wa.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=e,s+=2}else"`"===e?(a=!a,s++):"."!==e||a?(r+=e,s++):(i(),s++)}if(i(),a)throw new $a(Wa.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new e(n)}static emptyPath(){return new e([])}};
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
 */class ro{constructor(e){this.fields=e,e.sort(no.comparator)}static empty(){return new ro([])}unionWith(e){let t=new Qa(no.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new ro(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ja(this.fields,e.fields,(e,t)=>e.isEqual(t))}}
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
 */function so(e){let t=0;for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t++;return t}function io(e,t){for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t(n,e[n])}function ao(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}
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
 */class oo{constructor(e){this.path=e}static fromPath(e){return new oo(eo.fromString(e))}static fromName(e){return new oo(eo.fromString(e).popFirst(5))}static empty(){return new oo(eo.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===eo.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return eo.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new oo(new eo(e.slice()))}}
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
 */function Bo(e,t,n){if(!n)throw new $a(Wa.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function co(e){if(!oo.isDocumentKey(e))throw new $a(Wa.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function uo(e){if(oo.isDocumentKey(e))throw new $a(Wa.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function lo(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function ho(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const n=(t=e).constructor?t.constructor.name:null;return n?`a custom ${n} object`:"an object"}}var t;return"function"==typeof e?"a function":La(12329,{type:typeof e})}function Co(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new $a(Wa.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=ho(e);throw new $a(Wa.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return e}
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
 */function po(e,t){const n={typeString:e};return t&&(n.value=t),n}function fo(e,t){if(!lo(e))throw new $a(Wa.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in t)if(t[r]){const s=t[r].typeString,i="value"in t[r]?{value:t[r].value}:void 0;if(!(r in e)){n=`JSON missing required field: '${r}'`;break}const a=e[r];if(s&&typeof a!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&a!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new $a(Wa.INVALID_ARGUMENT,n);return!0}
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
 */const go=-62135596800,mo=1e6;class Eo{static now(){return Eo.fromMillis(Date.now())}static fromDate(e){return Eo.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*mo);return new Eo(t,n)}static fromInstant(e){if(!e||"bigint"!=typeof e.t)throw new $a(Wa.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return Eo._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,n;if(e>=0n)t=Number(e/1000000000n),n=Number(e%1000000000n);else{const r=e%1000000000n;0n===r?(t=Number(e/1000000000n),n=0):(t=Number(e/1000000000n-1n),n=Number(r+1000000000n))}return new Eo(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new $a(Wa.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new $a(Wa.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<go)throw new $a(Wa.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new $a(Wa.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/mo}toInstant(){if("undefined"==typeof Temporal||!Temporal.Instant)throw new $a(Wa.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?Ga(this.nanoseconds,e.nanoseconds):Ga(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Eo._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(fo(e,Eo._jsonSchema))return new Eo(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-go;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Eo._jsonSchemaVersion="firestore/timestamp/1.0",Eo._jsonSchema={type:po("string",Eo._jsonSchemaVersion),seconds:po("number"),nanoseconds:po("number")};
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
class Do extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
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
 */class wo{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(e){try{return atob(e)}catch(t){throw"undefined"!=typeof DOMException&&t instanceof DOMException?new Do("Invalid base64 string: "+t):t}}(e);return new wo(t)}static fromUint8Array(e){const t=function(e){let t="";for(let n=0;n<e.length;++n)t+=String.fromCharCode(e[n]);return t}(e);return new wo(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ga(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}wo.EMPTY_BYTE_STRING=new wo("");const yo=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function vo(e){if(ka(!!e,39018),"string"==typeof e){let t=0;const n=yo.exec(e);if(ka(!!n,46558,{timestamp:e}),n[1]){let e=n[1];e=(e+"000000000").substr(0,9),t=Number(e)}const r=new Date(e);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:_o(e.seconds),nanos:_o(e.nanos)}}function _o(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function Io(e){return"string"==typeof e?wo.fromBase64String(e):wo.fromUint8Array(e)}
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
 */const To="server_timestamp",bo="__type__",Ao="__previous_value__",Oo="__local_write_time__";function No(e){var t,n;return(null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[bo])?void 0:n.stringValue)===To}function So(e){const t=e.mapValue.fields[Ao];return No(t)?So(t):t}function Fo(e){const t=vo(e.mapValue.fields[Oo].timestampValue);return new Eo(t.seconds,t.nanos)}
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
 */class Lo{constructor(e,t,n,r,s,i,a,o,B,c,u,l,h){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.longPollingOptions=o,this.useFetchStreams=B,this.isUsingEmulator=c,this.apiKey=u,this._customHeaders=l,this.grpcFlowControlWindow=h}}const Ro="(default)";class ko{constructor(e,t){this.projectId=e,this.database=t||Ro}static empty(){return new ko("","")}get isDefaultDatabase(){return this.database===Ro}isEqual(e){return e instanceof ko&&e.projectId===this.projectId&&e.database===this.database}}function Po(e){return null==e}function xo(e){return 0===e&&1/e==-1/0}
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
const Mo="__type__",Go="__max__",Ho={},Uo="__vector__",Vo="value",Jo={nullValue:"NULL_VALUE"},jo={booleanValue:!0},Ko={booleanValue:!1};function qo(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?No(e)?4:function(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===Go}
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
 */(e)?9007199254740991:BB(e)?10:11:La(28295,{value:e})}function zo(e,t,n){if(e===t)return!0;const r=qo(e);if(r!==qo(t))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return Fo(e).isEqual(Fo(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;const n=vo(e.timestampValue),r=vo(t.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return s=t,Io(e.bytesValue).isEqual(Io(s.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return function(e,t){return _o(e.geoPointValue.latitude)===_o(t.geoPointValue.latitude)&&_o(e.geoPointValue.longitude)===_o(t.geoPointValue.longitude)}(e,t);case 2:return function(e,t,n){if("integerValue"in e&&"integerValue"in t)return _o(e.integerValue)===_o(t.integerValue);let r,s;if("doubleValue"in e&&"doubleValue"in t)r=_o(e.doubleValue),s=_o(t.doubleValue);else{if(!(null==n?void 0:n.i))return!1;r=_o(e.integerValue??e.doubleValue),s=_o(t.integerValue??t.doubleValue)}return r===s?!!(null==n?void 0:n.o)||xo(r)===xo(s):!(void 0!==n&&!n.u)&&isNaN(r)&&isNaN(s)}(e,t,n);case 9:return ja(e.arrayValue.values||[],t.arrayValue.values||[],(e,t)=>zo(e,t,n));case 10:case 11:return function(e,t,n){const r=e.mapValue.fields||{},s=t.mapValue.fields||{};if(so(r)!==so(s))return!1;for(const i in r)if(r.hasOwnProperty(i)&&(void 0===s[i]||!zo(r[i],s[i],n)))return!1;return!0}(e,t,n);default:return La(52216,{left:e})}var s}function Qo(e,t){return void 0!==(e.values||[]).find(e=>zo(e,t))}function Yo(e,t){if(e===t)return 0;const n=qo(e),r=qo(t);if(n!==r)return Ga(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ga(e.booleanValue,t.booleanValue);case 2:return function(e,t){const n=_o(e.integerValue||e.doubleValue),r=_o(t.integerValue||t.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(e,t);case 3:return Wo(e.timestampValue,t.timestampValue);case 4:return Wo(Fo(e),Fo(t));case 5:return Ha(e.stringValue,t.stringValue);case 6:return function(e,t){const n=Io(e),r=Io(t);return n.compareTo(r)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){const n=e.split("/"),r=t.split("/");for(let s=0;s<n.length&&s<r.length;s++){const e=Ga(n[s],r[s]);if(0!==e)return e}return Ga(n.length,r.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){const n=Ga(_o(e.latitude),_o(t.latitude));return 0!==n?n:Ga(_o(e.longitude),_o(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return $o(e.arrayValue,t.arrayValue);case 10:return function(e,t){var n,r,s,i;const a=e.fields||{},o=t.fields||{},B=null==(n=a[Vo])?void 0:n.arrayValue,c=null==(r=o[Vo])?void 0:r.arrayValue,u=Ga((null==(s=null==B?void 0:B.values)?void 0:s.length)||0,(null==(i=null==c?void 0:c.values)?void 0:i.length)||0);return 0!==u?u:$o(B,c)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===Ho&&t===Ho)return 0;if(e===Ho)return 1;if(t===Ho)return-1;const n=e.fields||{},r=Object.keys(n),s=t.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let a=0;a<r.length&&a<i.length;++a){const e=Ha(r[a],i[a]);if(0!==e)return e;const t=Yo(n[r[a]],s[i[a]]);if(0!==t)return t}return Ga(r.length,i.length)}(e.mapValue,t.mapValue);default:throw La(23264,{l:n})}}function Wo(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return Ga(e,t);const n=vo(e),r=vo(t),s=Ga(n.seconds,r.seconds);return 0!==s?s:Ga(n.nanos,r.nanos)}function $o(e,t){const n=e.values||[],r=t.values||[];for(let s=0;s<n.length&&s<r.length;++s){const e=Yo(n[s],r[s]);if(void 0!==e&&0!==e)return e}return Ga(n.length,r.length)}function Xo(e){return Zo(e)}function Zo(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const t=vo(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?Io(e.bytesValue).toBase64():"referenceValue"in e?function(e){return oo.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let t="[",n=!0;for(const r of e.values||[])n?n=!1:t+=",",t+=Zo(r);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){const t=Object.keys(e.fields||{}).sort();let n="{",r=!0;for(const s of t)r?r=!1:n+=",",n+=`${s}:${Zo(e.fields[s])}`;return n+"}"}(e.mapValue):La(61005,{value:e})}function eB(e){switch(qo(e)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=So(e);return t?16+eB(t):16;case 5:return 2*e.stringValue.length;case 6:return Io(e.bytesValue).approximateByteSize();case 7:return e.referenceValue.length;case 9:return(e.arrayValue.values||[]).reduce((e,t)=>e+eB(t),0);case 10:case 11:return function(e){let t=0;return io(e.fields,(e,n)=>{t+=e.length+eB(n)}),t}(e.mapValue);default:throw La(13486,{value:e})}}function tB(e){return!!e&&"integerValue"in e}function nB(e){return!!e&&"doubleValue"in e}function rB(e){return tB(e)||nB(e)}function sB(e){return!!e&&"arrayValue"in e}function iB(e){return!!e&&"nullValue"in e}function aB(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function oB(e){return!!e&&"mapValue"in e}function BB(e){var t,n;return(null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[Mo])?void 0:n.stringValue)===Uo}function cB(e){var t,n;return null==(n=((null==(t=null==e?void 0:e.mapValue)?void 0:t.fields)||{})[Vo])?void 0:n.arrayValue}function uB(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){const t={mapValue:{fields:{}}};return io(e.mapValue.fields,(e,n)=>t.mapValue.fields[e]=uB(n)),t}if(e.arrayValue){const t={arrayValue:{values:[]}};for(let n=0;n<(e.arrayValue.values||[]).length;++n)t.arrayValue.values[n]=uB(e.arrayValue.values[n]);return t}return{...e}}class lB{constructor(e){this.value=e}static empty(){return new lB({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!oB(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=uB(t)}setAll(e){let t=no.emptyPath(),n={},r=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){const e=this.getFieldsMap(t);this.applyChanges(e,n,r),n={},r=[],t=s.popLast()}e?n[s.lastSegment()]=uB(e):r.push(s.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,n,r)}delete(e){const t=this.field(e.popLast());oB(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return zo(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=t.mapValue.fields[e.get(n)];oB(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,n){io(t,(t,n)=>e[t]=n);for(const r of n)delete e[r]}clone(){return new lB(uB(this.value))}}function hB(e){const t=[];return io(e.fields,(e,n)=>{const r=new no([e]);if(oB(n)){const e=hB(n.mapValue).fields;if(0===e.length)t.push(r);else for(const n of e)t.push(r.child(n))}else t.push(r)}),new ro(t)
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
 */}function CB(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:xo(t)?"-0":t}}function dB(e){return{integerValue:""+e}}function pB(e,t,n){return function(e){return"number"==typeof e&&Number.isInteger(e)&&!xo(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}(t)?dB(t):CB(e,t)}
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
 */class fB{constructor(){this._=void 0}}function gB(e,t,n){return e instanceof DB?function(e,t){const n={fields:{[bo]:{stringValue:To},[Oo]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&No(t)&&(t=So(t)),t&&(n.fields[Ao]=t),{mapValue:n}}(n,t):e instanceof wB?yB(e,t):e instanceof vB?_B(e,t):e instanceof TB?function(e,t){const n=EB(e,t),r=NB(n)+NB(e.h);return tB(n)&&tB(e.h)?dB(r):CB(e.serializer,r)}(e,t):e instanceof bB?OB(e,t,Math.min):e instanceof AB?function(e,t){return OB(e,t,Math.max)}(e,t):void 0}function mB(e,t,n){return e instanceof wB?yB(e,t):e instanceof vB?_B(e,t):n}function EB(e,t){return e instanceof TB?rB(t)?t:{integerValue:0}:null}class DB extends fB{}class wB extends fB{constructor(e){super(),this.elements=e}}function yB(e,t){const n=SB(t);for(const r of e.elements)n.some(e=>zo(e,r))||n.push(r);return{arrayValue:{values:n}}}class vB extends fB{constructor(e){super(),this.elements=e}}function _B(e,t){let n=SB(t);for(const r of e.elements)n=n.filter(e=>!zo(e,r));return{arrayValue:{values:n}}}class IB extends fB{constructor(e,t){super(),this.serializer=e,this.h=t}}class TB extends IB{}class bB extends IB{}class AB extends IB{}function OB(e,t,n){if(!rB(t))return e.h;const r=n(NB(t),NB(e.h));return tB(t)&&tB(e.h)?dB(r):CB(e.serializer,r)}function NB(e){return _o(e.integerValue||e.doubleValue)}function SB(e){return sB(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}
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
 */class FB{constructor(e,t){this.field=e,this.transform=t}}class LB{constructor(e,t){this.version=e,this.transformResults=t}}class RB{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new RB}static exists(e){return new RB(void 0,e)}static updateTime(e){return new RB(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function kB(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class PB{}function xB(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new zB(e.key,RB.none()):new VB(e.key,e.data,RB.none());{const n=e.data,r=lB.empty();let s=new Qa(no.comparator);for(let e of t.fields)if(!s.has(e)){let t=n.field(e);null===t&&e.length>1&&(e=e.popLast(),t=n.field(e)),null===t?r.delete(e):r.set(e,t),s=s.add(e)}return new JB(e.key,r,new ro(s.toArray()),RB.none())}}function MB(e,t,n){var r;e instanceof VB?function(e,t,n){const r=e.value.clone(),s=KB(e.fieldTransforms,t,n.transformResults);r.setAll(s),t.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(e,t,n):e instanceof JB?function(e,t,n){if(!kB(e.precondition,t))return void t.convertToUnknownDocument(n.version);const r=KB(e.fieldTransforms,t,n.transformResults),s=t.data;s.setAll(jB(e)),s.setAll(r),t.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(e,t,n):(r=n,t.convertToNoDocument(r.version).setHasCommittedMutations())}function GB(e,t,n,r){return e instanceof VB?function(e,t,n,r){if(!kB(e.precondition,t))return n;const s=e.value.clone(),i=qB(e.fieldTransforms,r,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,n,r):e instanceof JB?function(e,t,n,r){if(!kB(e.precondition,t))return n;const s=qB(e.fieldTransforms,r,t),i=t.data;return i.setAll(jB(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===n?null:n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,n,r):(s=t,i=n,kB(e.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):i);var s,i}function HB(e,t){let n=null;for(const r of e.fieldTransforms){const e=t.data.field(r.field),s=EB(r.transform,e||null);null!=s&&(null===n&&(n=lB.empty()),n.set(r.field,s))}return n||null}function UB(e,t){return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(n=e.fieldTransforms,r=t.fieldTransforms,!!(void 0===n&&void 0===r||n&&r&&ja(n,r,(e,t)=>function(e,t){return e.field.isEqual(t.field)&&(n=e.transform,r=t.transform,n instanceof wB&&r instanceof wB||n instanceof vB&&r instanceof vB?ja(n.elements,r.elements,zo):n instanceof TB&&r instanceof TB||n instanceof bB&&r instanceof bB||n instanceof AB&&r instanceof AB?zo(n.h,r.h):n instanceof DB&&r instanceof DB);var n,r}(e,t)))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask)));var n,r}class VB extends PB{constructor(e,t,n,r=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class JB extends PB{constructor(e,t,n,r,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function jB(e){const t=new Map;return e.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=e.data.field(n);t.set(n,r)}}),t}function KB(e,t,n){const r=new Map;ka(e.length===n.length,32656,{T:n.length,P:e.length});for(let s=0;s<n.length;s++){const i=e[s],a=i.transform,o=t.data.field(i.field);r.set(i.field,mB(a,o,n[s]))}return r}function qB(e,t,n){const r=new Map;for(const s of e){const e=s.transform,i=n.data.field(s.field);r.set(s.field,gB(e,i,t))}return r}class zB extends PB{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class QB extends PB{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
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
 */class YB{constructor(e,t){this.position=e,this.inclusive=t}}function WB(e,t,n){let r=0;for(let s=0;s<e.position.length;s++){const i=t[s],a=e.position[s];if(r=i.field.isKeyField()?oo.comparator(oo.fromName(a.referenceValue),n.key):Yo(a,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function $B(e,t){if(null===e)return null===t;if(null===t)return!1;if(e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let n=0;n<e.position.length;n++)if(!zo(e.position[n],t.position[n]))return!1;return!0}
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
 */class XB{}class ZB extends XB{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,n):new ac(e,t,n):"array-contains"===t?new uc(e,n):"in"===t?new lc(e,n):"not-in"===t?new hc(e,n):"array-contains-any"===t?new Cc(e,n):new ZB(e,t,n)}static createKeyFieldInFilter(e,t,n){return"in"===t?new oc(e,n):new Bc(e,n)}matches(e){const t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(Yo(t,this.value)):null!==t&&qo(this.value)===qo(t)&&this.matchesComparison(Yo(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return La(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ec extends XB{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new ec(e,t)}matches(e){return tc(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.I||(this.I=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function tc(e){return"and"===e.op}function nc(e){return function(e){for(const t of e.filters)if(t instanceof ec)return!1;return!0}(e)&&tc(e)}function rc(e){if(e instanceof ZB)return e.field.canonicalString()+e.op.toString()+Xo(e.value);if(nc(e))return e.filters.map(e=>rc(e)).join(",");{const t=e.filters.map(e=>rc(e)).join(",");return`${e.op}(${t})`}}function sc(e,t){return e instanceof ZB?(n=e,(r=t)instanceof ZB&&n.op===r.op&&n.field.isEqual(r.field)&&zo(n.value,r.value)):e instanceof ec?function(e,t){return t instanceof ec&&e.op===t.op&&e.filters.length===t.filters.length&&e.filters.reduce((e,n,r)=>e&&sc(n,t.filters[r]),!0)}(e,t):void La(19439);var n,r}function ic(e){return e instanceof ZB?`${(t=e).field.canonicalString()} ${t.op} ${Xo(t.value)}`:e instanceof ec?function(e){return e.op.toString()+" {"+e.getFilters().map(ic).join(" ,")+"}"}(e):"Filter";var t}class ac extends ZB{constructor(e,t,n){super(e,t,n),this.key=oo.fromName(n.referenceValue)}matches(e){const t=oo.comparator(e.key,this.key);return this.matchesComparison(t)}}class oc extends ZB{constructor(e,t){super(e,"in",t),this.keys=cc("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Bc extends ZB{constructor(e,t){super(e,"not-in",t),this.keys=cc("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function cc(e,t){var n;return((null==(n=t.arrayValue)?void 0:n.values)||[]).map(e=>oo.fromName(e.referenceValue))}class uc extends ZB{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return sB(t)&&Qo(t.arrayValue,this.value)}}class lc extends ZB{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return null!==t&&Qo(this.value.arrayValue,t)}}class hc extends ZB{constructor(e,t){super(e,"not-in",t)}matches(e){if(Qo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!Qo(this.value.arrayValue,t)}}class Cc extends ZB{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!sB(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>Qo(this.value.arrayValue,e))}}
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
 */class dc{constructor(e,t="asc"){this.field=e,this.dir=t}}function pc(e,t){return e.dir===t.dir&&e.field.isEqual(t.field)}
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
 */class fc{static fromTimestamp(e){return new fc(e)}static min(){return new fc(new Eo(0,0))}static max(){return new fc(new Eo(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
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
 */class gc{constructor(e,t,n,r,s,i,a){this.key=e,this.documentType=t,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=a}static newInvalidDocument(e){return new gc(e,0,fc.min(),fc.min(),fc.min(),lB.empty(),0)}static newFoundDocument(e,t,n,r){return new gc(e,1,t,fc.min(),n,r,0)}static newNoDocument(e,t){return new gc(e,2,t,fc.min(),fc.min(),lB.empty(),0)}static newUnknownDocument(e,t){return new gc(e,3,t,fc.min(),fc.min(),lB.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(fc.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=lB.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=lB.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=fc.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof gc&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new gc(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
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
 */function mc(e){return new Ec(e.readTime,e.key,-1)}class Ec{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Ec(fc.min(),oo.empty(),-1)}static max(){return new Ec(fc.max(),oo.empty(),-1)}}function Dc(e,t){let n=e.readTime.compareTo(t.readTime);return 0!==n?n:(n=oo.comparator(e.documentKey,t.documentKey),0!==n?n:Ga(e.largestBatchId,t.largestBatchId)
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
 */)}class wc{constructor(e,t=null,n=[],r=[],s=null,i=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=a,this.R=null}}function yc(e,t=null,n=[],r=[],s=null,i=null,a=null){return new wc(e,t,n,r,s,i,a)}function vc(e){const t=Pa(e);if(null===t.R){let e=t.path.canonicalString();null!==t.collectionGroup&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(e=>rc(e)).join(","),e+="|ob:",e+=t.orderBy.map(e=>{return(t=e).field.canonicalString()+t.dir;var t}).join(","),Po(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(e=>Xo(e)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(e=>Xo(e)).join(",")),t.R=e}return t.R}function _c(e,t){if(e.limit!==t.limit)return!1;if(e.orderBy.length!==t.orderBy.length)return!1;for(let n=0;n<e.orderBy.length;n++)if(!pc(e.orderBy[n],t.orderBy[n]))return!1;if(e.filters.length!==t.filters.length)return!1;for(let n=0;n<e.filters.length;n++)if(!sc(e.filters[n],t.filters[n]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!$B(e.startAt,t.startAt)&&$B(e.endAt,t.endAt)}function Ic(e){return!!e.isCorePipeline}function Tc(e){return!!e.path&&oo.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}
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
 */class bc{constructor(e,t=null,n=[],r=[],s=null,i="F",a=null,o=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function Ac(e){return new bc(e)}function Oc(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function Nc(e){const t=Pa(e);if(null===t.A){t.A=[];const e=new Set;for(const r of t.explicitOrderBy)t.A.push(r),e.add(r.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(e){let t=new Qa(no.comparator);return e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t})(t).forEach(r=>{e.has(r.canonicalString())||r.isKeyField()||t.A.push(new dc(r,n))}),e.has(no.keyField().canonicalString())||t.A.push(new dc(no.keyField(),n))}return t.A}function Sc(e){const t=Pa(e);return t.V||(t.V=function(e,t){if("F"===e.limitType)return yc(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{const t="desc"===e.dir?"asc":"desc";return new dc(e.field,t)});const n=e.endAt?new YB(e.endAt.position,e.endAt.inclusive):null,r=e.startAt?new YB(e.startAt.position,e.startAt.inclusive):null;return yc(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}}(t,Nc(e))),t.V}function Fc(e,t,n){return new bc(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,n,e.startAt,e.endAt)}function Lc(e){return`Query(target=${function(e){let t=e.path.canonicalString();return null!==e.collectionGroup&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map(e=>ic(e)).join(", ")}]`),Po(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map(e=>{return`${(t=e).field.canonicalString()} (${t.dir})`;var t}).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(e=>Xo(e)).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(e=>Xo(e)).join(",")),`Target(${t})`}(Sc(e))}; limitType=${e.limitType})`}function Rc(e,t){return t.isFoundDocument()&&function(e,t){const n=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(n):oo.isDocumentKey(e.path)?e.path.isEqual(n):e.path.isImmediateParentOf(n)}(e,t)&&function(e,t){for(const n of Nc(e))if(!n.field.isKeyField()&&null===t.data.field(n.field))return!1;return!0}(e,t)&&function(e,t){for(const n of e.filters)if(!n.matches(t))return!1;return!0}(e,t)&&(r=t,!((n=e).startAt&&!function(e,t,n){const r=WB(e,t,n);return e.inclusive?r<=0:r<0}(n.startAt,Nc(n),r)||n.endAt&&!function(e,t,n){const r=WB(e,t,n);return e.inclusive?r>=0:r>0}(n.endAt,Nc(n),r)));var n,r}function kc(e){return(t,n)=>{let r=!1;for(const s of Nc(e)){const e=Pc(s,t,n);if(0!==e)return e;r=r||s.field.isKeyField()}return 0}}function Pc(e,t,n){const r=e.field.isKeyField()?oo.comparator(t.key,n.key):function(e,t,n){const r=t.data.field(e),s=n.data.field(e);return null!==r&&null!==s?Yo(r,s):La(42886)}(e.field,t,n);switch(e.dir){case"asc":return r;case"desc":return-1*r;default:return La(19790,{direction:e.dir})}}
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
 */class xc{constructor(e,t){this.count=e,this.unchangedNames=t}}
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
 */var Mc,Gc;function Hc(e){if(void 0===e)return Na("GRPC error has no .code"),Wa.UNKNOWN;switch(e){case Mc.OK:return Wa.OK;case Mc.CANCELLED:return Wa.CANCELLED;case Mc.UNKNOWN:return Wa.UNKNOWN;case Mc.DEADLINE_EXCEEDED:return Wa.DEADLINE_EXCEEDED;case Mc.RESOURCE_EXHAUSTED:return Wa.RESOURCE_EXHAUSTED;case Mc.INTERNAL:return Wa.INTERNAL;case Mc.UNAVAILABLE:return Wa.UNAVAILABLE;case Mc.UNAUTHENTICATED:return Wa.UNAUTHENTICATED;case Mc.INVALID_ARGUMENT:return Wa.INVALID_ARGUMENT;case Mc.NOT_FOUND:return Wa.NOT_FOUND;case Mc.ALREADY_EXISTS:return Wa.ALREADY_EXISTS;case Mc.PERMISSION_DENIED:return Wa.PERMISSION_DENIED;case Mc.FAILED_PRECONDITION:return Wa.FAILED_PRECONDITION;case Mc.ABORTED:return Wa.ABORTED;case Mc.OUT_OF_RANGE:return Wa.OUT_OF_RANGE;case Mc.UNIMPLEMENTED:return Wa.UNIMPLEMENTED;case Mc.DATA_LOSS:return Wa.DATA_LOSS;default:return La(39323,{code:e})}}(Gc=Mc||(Mc={}))[Gc.OK=0]="OK",Gc[Gc.CANCELLED=1]="CANCELLED",Gc[Gc.UNKNOWN=2]="UNKNOWN",Gc[Gc.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Gc[Gc.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Gc[Gc.NOT_FOUND=5]="NOT_FOUND",Gc[Gc.ALREADY_EXISTS=6]="ALREADY_EXISTS",Gc[Gc.PERMISSION_DENIED=7]="PERMISSION_DENIED",Gc[Gc.UNAUTHENTICATED=16]="UNAUTHENTICATED",Gc[Gc.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Gc[Gc.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Gc[Gc.ABORTED=10]="ABORTED",Gc[Gc.OUT_OF_RANGE=11]="OUT_OF_RANGE",Gc[Gc.UNIMPLEMENTED=12]="UNIMPLEMENTED",Gc[Gc.INTERNAL=13]="INTERNAL",Gc[Gc.UNAVAILABLE=14]="UNAVAILABLE",Gc[Gc.DATA_LOSS=15]="DATA_LOSS";
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
class Uc{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,e))return s}has(e){return void 0!==this.get(e)}set(e,t){const n=this.mapKeyFn(e),r=this.inner[n];if(void 0===r)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return 1===n.length?delete this.inner[t]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){io(this.inner,(t,n)=>{for(const[r,s]of n)e(r,s)})}isEmpty(){return ao(this.inner)}size(){return this.innerSize}}
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
 */const Vc=new Ka(oo.comparator);function Jc(){return Vc}const jc=new Ka(oo.comparator);function Kc(...e){let t=jc;for(const n of e)t=t.insert(n.key,n);return t}function qc(e){let t=jc;return e.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function zc(){return Yc()}function Qc(){return Yc()}function Yc(){return new Uc(e=>e.toString(),(e,t)=>e.isEqual(t))}const Wc=new Ka(oo.comparator),$c=new Qa(oo.comparator);function Xc(...e){let t=$c;for(const n of e)t=t.add(n);return t}const Zc=new Qa(Ga);
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
const eu=new Rs([4294967295,4294967295],0);function tu(e){const t=(new TextEncoder).encode(e),n=new ks;return n.update(t),new Uint8Array(n.digest())}function nu(e){const t=new DataView(e.buffer),n=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new Rs([n,r],0),new Rs([s,i],0)]}class ru{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new su(`Invalid padding: ${t}`);if(n<0)throw new su(`Invalid hash count: ${n}`);if(e.length>0&&0===this.hashCount)throw new su(`Invalid hash count: ${n}`);if(0===e.length&&0!==t)throw new su(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=Rs.fromNumber(this.p)}v(e,t,n){let r=e.add(t.multiply(Rs.fromNumber(n)));return 1===r.compare(eu)&&(r=new Rs([r.getBits(0),r.getBits(1)],0)),r.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.p)return!1;const t=tu(e),[n,r]=nu(t);for(let s=0;s<this.hashCount;s++){const e=this.v(n,r,s);if(!this.D(e))return!1}return!0}static create(e,t,n){const r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new ru(s,r,t);return n.forEach(e=>i.insert(e)),i}insert(e){if(0===this.p)return;const t=tu(e),[n,r]=nu(t);for(let s=0;s<this.hashCount;s++){const e=this.v(n,r,s);this.C(e)}}C(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class su extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
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
 */class iu{constructor(e,t,n,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=r,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const r=new Map;return r.set(e,au.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new iu(fc.min(),r,new Ka(Ga),Jc(),Jc(),Xc())}}class au{constructor(e,t,n,r,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new au(n,t,Xc(),Xc(),Xc())}}
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
 */class ou{constructor(e,t,n,r){this.F=e,this.removedTargetIds=t,this.key=n,this.O=r}}class Bu{constructor(e,t){this.targetId=e,this.M=t}}class cu{constructor(e,t,n=wo.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=r}}class uu{constructor(e){this.targetId=e,this.N=0,this.L=du(),this.B=wo.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return 0!==this.N}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=Xc(),t=Xc(),n=Xc();return this.L.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:n=n.add(r);break;default:La(38017,{changeType:s})}}),new au(this.B,this.U,e,t,n)}G(){this.k=!1,this.L=du()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,ka(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const lu="WatchChangeAggregator";class hu{constructor(e){this.X=e,this.ee=new Map,this.te=Jc(),this.ne=Cu(),this.re=Jc(),this.ie=Cu(),this.se=new Ka(Ga)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,t=>{const n=this.ee.get(t);if(n)switch(e.state){case 0:this.ce(t)&&n.K(e.resumeToken);break;case 1:n.Y(),n.q||n.G(),n.K(e.resumeToken);break;case 2:n.Y(),n.q||this.removeTarget(t);break;case 3:this.ce(t)&&(n.Z(),n.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),n.K(e.resumeToken));break;default:La(56790,{state:e.state})}else Oa(lu,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach((e,n)=>{this.ce(n)&&t(n)})}Ee(e){var t;return Ic(e)?"documents"===e.getPipelineSourceType()&&1===(null==(t=e.getPipelineDocuments())?void 0:t.length):Tc(e)}he(e){const t=e.targetId,n=e.M.count,r=this.Te(t);if(r){const s=r.target;if(this.Ee(s))if(0===n){const e=new oo(Ic(s)?eo.fromString(s.getPipelineDocuments()[0]):s.path);this.ae(t,e,gc.newNoDocument(e,fc.min()))}else ka(1===n,20013,"Single document existence filter with count: "+n);else{const r=this.Pe(t);if(r!==n){const n=this.Ie(e),s=n?this.Re(n,e,r):1;if(0!==s){this.le(t);const e=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,e)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=t;let i,a;try{i=Io(n).toUint8Array()}catch(o){if(o instanceof Do)return Sa("Decoding the base64 bloom filter in existence filter failed ("+o.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw o}try{a=new ru(i,r,s)}catch(o){return Sa(o instanceof su?"BloomFilter error: ":"Applying bloom filter failed: ",o),null}return 0===a.p?null:a}Re(e,t,n){return t.M.count===n-this.de(e,t.targetId)?0:2}de(e,t){const n=this.X.getRemoteKeysForTarget(t);let r=0;return n.forEach(n=>{const s=this.X.Ve(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;e.mightContain(i)||(this.ae(t,n,null),r++)}),r}fe(e){const t=new Map;this.ee.forEach((n,r)=>{const s=this.Te(r);if(s){if(n.current&&this.Ee(s.target)){const t=Ic(s.target)?eo.fromString(s.target.getPipelineDocuments()[0]):s.target.path,n=new oo(t);this.me(n).has(r)||this.pe(r,n)||this.ae(r,n,gc.newNoDocument(n,e))}n.$&&(t.set(r,n.W()),n.G())}});let n=Xc();this.ie.forEach((e,t)=>{let r=!0;t.forEachWhile(e=>{const t=this.Te(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(r=!1,!1)}),r&&(n=n.add(e))}),this.te.forEach((t,n)=>n.setReadTime(e)),this.re.forEach((t,n)=>n.setReadTime(e));const r=new iu(e,t,this.se,this.te,this.re,n);return this.te=Jc(),this.ne=Cu(),this.re=Jc(),this.ie=Cu(),this.se=new Ka(Ga),r}oe(e,t){const n=this.ee.get(e);if(!n||!this.ce(e))return void Oa(lu,`addDocumentToTarget received document for unknown inactive target (${e})`);const r=this.pe(e,t.key)?2:0;n.j(t.key,r),Ic(this.Te(e).target)&&"exact"!==this.Te(e).target.getPipelineFlavor()?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,n){const r=this.ee.get(e);r&&this.ce(e)?(this.pe(e,t)?r.j(t,1):r.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),n&&(Ic(this.Te(e).target)&&"exact"!==this.Te(e).target.getPipelineFlavor()?this.re=this.re.insert(t,n):this.te=this.te.insert(t,n))):Oa(lu,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const n=t.W();return this.X.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}J(e){let t=this.ee.get(e);t||(Oa(lu,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new uu(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new Qa(Ga),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new Qa(Ga),this.ne=this.ne.insert(e,t)),t}ce(e){const t=null!==this.Te(e);return t||Oa(lu,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return void 0===t||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new uu(e)),this.X.getRemoteKeysForTarget(e).forEach(t=>{this.ae(e,t,null)})}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function Cu(){return new Ka(oo.comparator)}function du(){return new Ka(oo.comparator)}const pu=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),fu=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),gu=(()=>({and:"AND",or:"OR"}))();class mu{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Eu(e,t){return e.useProto3Json||Po(t)?t:{value:t}}function Du(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function wu(e){const t=vo(e);return new Eo(t.seconds,t.nanos)}function yu(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function vu(e,t){return Du(e,t.toTimestamp())}function _u(e){return ka(!!e,49232),fc.fromTimestamp(wu(e))}function Iu(e,t){return Tu(e,t).canonicalString()}function Tu(e,t){const n=(r=e,new eo(["projects",r.projectId,"databases",r.database])).child("documents");var r;return void 0===t?n:n.child(t)}function bu(e){const t=eo.fromString(e);return ka(qu(t),10190,{key:t.toString()}),t}function Au(e,t){return Iu(e.databaseId,t.path)}function Ou(e,t){const n=bu(t);if(n.get(1)!==e.databaseId.projectId)throw new $a(Wa.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+e.databaseId.projectId);if(n.get(3)!==e.databaseId.database)throw new $a(Wa.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+e.databaseId.database);return new oo(Fu(n))}function Nu(e,t){return Iu(e.databaseId,t)}function Su(e){return new eo(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function Fu(e){return ka(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function Lu(e,t,n){return{name:Au(e,t),fields:n.value.mapValue.fields}}function Ru(e,t){return{documents:[Nu(e,t.path)]}}function ku(e,t){const n={structuredQuery:{}},r=t.path;let s;null!==t.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Nu(e,s);const i=function(e){if(0!==e.length)return ju(ec.create(e,"and"))}(t.filters);i&&(n.structuredQuery.where=i);const a=function(e){if(0!==e.length)return e.map(e=>{return{field:Vu((t=e).field),direction:Gu(t.dir)};var t})}(t.orderBy);a&&(n.structuredQuery.orderBy=a);const o=Eu(e,t.limit);return null!==o&&(n.structuredQuery.limit=o),t.startAt&&(n.structuredQuery.startAt={before:(B=t.startAt).inclusive,values:B.position}),t.endAt&&(n.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(t.endAt)),{Se:n,parent:s};var B}function Pu(e){let t=function(e){const t=bu(e);return 4===t.length?eo.emptyPath():Fu(t)}(e.parent);const n=e.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){ka(1===r,65062);const e=n.from[0];e.allDescendants?s=e.collectionId:t=t.child(e.collectionId)}let i=[];n.where&&(i=function(e){const t=Mu(e);return t instanceof ec&&nc(t)?t.getFilters():[t]}(n.where));let a=[];n.orderBy&&(a=n.orderBy.map(e=>{return new dc(Ju((t=e).field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction));var t}));let o=null;n.limit&&(o=function(e){let t;return t="object"==typeof e?e.value:e,Po(t)?null:t}(n.limit));let B=null;n.startAt&&(B=function(e){const t=!!e.before,n=e.values||[];return new YB(n,t)}(n.startAt));let c=null;return n.endAt&&(c=function(e){const t=!e.before,n=e.values||[];return new YB(n,t)}(n.endAt)),function(e,t,n,r,s,i,a,o){return new bc(e,t,n,r,s,i,a,o)}(t,s,a,i,o,"F",B,c)}function xu(e,t){return{structuredPipeline:{pipeline:{stages:t.stages.map(t=>t._toProto(e))}}}}function Mu(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=Ju(e.unaryFilter.field);return ZB.create(t,"==",{doubleValue:NaN});case"IS_NULL":const n=Ju(e.unaryFilter.field);return ZB.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=Ju(e.unaryFilter.field);return ZB.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Ju(e.unaryFilter.field);return ZB.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return La(61313);default:return La(60726)}}(e):void 0!==e.fieldFilter?(t=e,ZB.create(Ju(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return La(58110);default:return La(50506)}}(t.fieldFilter.op),t.fieldFilter.value)):void 0!==e.compositeFilter?function(e){return ec.create(e.compositeFilter.filters.map(e=>Mu(e)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return La(1026)}}(e.compositeFilter.op))}(e):La(30097,{filter:e});var t}function Gu(e){return pu[e]}function Hu(e){return fu[e]}function Uu(e){return gu[e]}function Vu(e){return{fieldPath:e.canonicalString()}}function Ju(e){return no.fromServerFormat(e.fieldPath)}function ju(e){return e instanceof ZB?function(e){if("=="===e.op){if(aB(e.value))return{unaryFilter:{field:Vu(e.field),op:"IS_NAN"}};if(iB(e.value))return{unaryFilter:{field:Vu(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(aB(e.value))return{unaryFilter:{field:Vu(e.field),op:"IS_NOT_NAN"}};if(iB(e.value))return{unaryFilter:{field:Vu(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Vu(e.field),op:Hu(e.op),value:e.value}}}(e):e instanceof ec?function(e){const t=e.getFilters().map(e=>ju(e));return 1===t.length?t[0]:{compositeFilter:{op:Uu(e.op),filters:t}}}(e):La(54877,{filter:e})}function Ku(e){const t=[];return e.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function qu(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}function zu(e){return!!e&&"function"==typeof e._toProto&&"ProtoValue"===e._protoValueType}function Qu(e,t){const n={fields:{}};return t.forEach((t,r)=>{if("string"!=typeof r)throw new Error(`Cannot encode map with non-string key: ${r}`);n.fields[r]=t._toProto(e)}),{mapValue:n}}function Yu(e){return{stringValue:e}}
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
 */function Wu(e){return new mu(e,!0)}
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
 */class $u{constructor(e){this._byteString=e}static fromBase64String(e){try{return new $u(wo.fromBase64String(e))}catch(t){throw new $a(Wa.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new $u(wo.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:$u._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(fo(e,$u._jsonSchema))return $u.fromBase64String(e.bytes)}}$u._jsonSchemaVersion="firestore/bytes/1.0",$u._jsonSchema={type:po("string",$u._jsonSchemaVersion),bytes:po("string")};
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
class Xu{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new $a(Wa.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new no(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
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
class Zu{constructor(e){this._methodName=e}}
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
 */class el{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new $a(Wa.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new $a(Wa.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ga(this._lat,e._lat)||Ga(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:el._jsonSchemaVersion}}static fromJSON(e){if(fo(e,el._jsonSchema))return new el(e.latitude,e.longitude)}}el._jsonSchemaVersion="firestore/geoPoint/1.0",el._jsonSchema={type:po("string",el._jsonSchemaVersion),latitude:po("number"),longitude:po("number")};
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
class tl{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}tl.UNAUTHENTICATED=new tl(null),tl.GOOGLE_CREDENTIALS=new tl("google-credentials-uid"),tl.FIRST_PARTY=new tl("first-party-uid"),tl.MOCK_USER=new tl("mock-user");
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
class nl{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}
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
 */class rl{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class sl{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(tl.UNAUTHENTICATED))}shutdown(){}}class il{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class al{constructor(e){this.De=e,this.currentUser=tl.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){ka(void 0===this.Ce,42304);let n=this.xe;const r=e=>this.xe!==n?(n=this.xe,t(e)):Promise.resolve();let s=new nl;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),s.resolve(),s=new nl,e.enqueueRetryable(()=>r(this.currentUser))};const i=()=>{const t=s;e.enqueueRetryable(async()=>{await t.promise,await r(this.currentUser)})},a=e=>{Oa("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),i())};this.De.onInit(e=>a(e)),setTimeout(()=>{if(!this.auth){const e=this.De.getImmediate({optional:!0});e?a(e):(Oa("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new nl)}},0),i()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.xe!==e?(Oa("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(ka("string"==typeof t.accessToken,31837,{Oe:t}),new rl(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return ka(null===e||"string"==typeof e,2055,{Me:e}),new tl(e)}}class ol{constructor(e,t,n){this.Ne=e,this.Le=t,this.Be=n,this.type="FirstParty",this.user=tl.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class Bl{constructor(e,t,n){this.Ne=e,this.Le=t,this.Be=n}getToken(){return Promise.resolve(new ol(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable(()=>t(tl.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class cl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ul{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Xe(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){ka(void 0===this.Ce,3512);const n=e=>{null!=e.error&&Oa("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const n=e.token!==this.$e;return this.$e=e.token,Oa("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?t(e.token):Promise.resolve()};this.Ce=t=>{e.enqueueRetryable(()=>n(t))};const r=e=>{Oa("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit(e=>r(e)),setTimeout(()=>{if(!this.appCheck){const e=this.qe.getImmediate({optional:!0});e?r(e):Oa("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.Ke)return Promise.resolve(new cl(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(ka("string"==typeof e.token,44558,{tokenResult:e}),this.$e=e.token,new cl(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function ll(e){const t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t
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
 */}class hl{Qe(e){}shutdown(){}}
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
 */const Cl="ConnectivityMonitor";class dl{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){Oa(Cl,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){Oa(Cl,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
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
 */let pl=null;function fl(){return null===pl?pl=268435456+Math.round(2147483648*Math.random()):pl++,"0x"+pl.toString(16)
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
 */}const gl="RestConnection",ml={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class El{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${n}/databases/${r}`,this.tt=this.databaseId.database===Ro?`project_id=${n}`:`project_id=${n}&database_id=${r}`}nt(e,t,n,r,s){const i=fl(),a=this.rt(e,t.toUriEncodedString());Oa(gl,`Sending RPC '${e}' ${i}:`,a,n);const o={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(o,r,s);const{host:B}=new URL(a),c=G(B);return this.st(e,a,o,n,c).then(t=>(Oa(gl,`Received RPC '${e}' ${i}: `,t),t),t=>{throw Sa(gl,`RPC '${e}' ${i} failed with error: `,t,"url: ",a,"request:",n),t})}_t(e,t,n,r,s,i){return this.nt(e,t,n,r,s)}it(e,t,n){if(e["X-Goog-Api-Client"]="gl-js/ fire/"+Ia,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,n)=>e[n]=t),n&&n.headers.forEach((t,n)=>e[n]=t),this.databaseInfo._customHeaders)for(const r of Object.keys(this.databaseInfo._customHeaders))e[r]=this.databaseInfo._customHeaders[r]}rt(e,t){const n=ml[e];let r=`${this.Xe}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}}
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
 */class Dl{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}
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
 */const wl="WebChannelConnection",yl=(e,t,n)=>{e.listen(t,e=>{try{n(e)}catch(t){setTimeout(()=>{throw t},0)}})};class vl extends El{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!vl.yt){const e=Js();yl(e,Vs.STAT_EVENT,e=>{e.stat===Us.PROXY?Oa(wl,"STAT_EVENT: detected buffering proxy"):e.stat===Us.NOPROXY&&Oa(wl,"STAT_EVENT: detected no buffering proxy")}),vl.yt=!0}}st(e,t,n,r,s){const i=fl();return new Promise((s,a)=>{const o=new xs;o.setWithCredentials(!0),o.listenOnce(Gs.COMPLETE,()=>{try{switch(o.getLastErrorCode()){case Hs.NO_ERROR:const t=o.getResponseJson();Oa(wl,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case Hs.TIMEOUT:Oa(wl,`RPC '${e}' ${i} timed out`),a(new $a(Wa.DEADLINE_EXCEEDED,"Request time out"));break;case Hs.HTTP_ERROR:const n=o.getStatus();if(Oa(wl,`RPC '${e}' ${i} failed with status:`,n,"response text:",o.getResponseText()),n>0){let e=o.getResponseJson();Array.isArray(e)&&(e=e[0]);const t=null==e?void 0:e.error;if(t&&t.status&&t.message){const e=function(e){const t=e.toLowerCase().replace(/_/g,"-");return Object.values(Wa).indexOf(t)>=0?t:Wa.UNKNOWN}(t.status);a(new $a(e,t.message))}else a(new $a(Wa.UNKNOWN,"Server responded with status "+o.getStatus()))}else a(new $a(Wa.UNAVAILABLE,"Connection failed."));break;default:La(9055,{wt:e,streamId:i,bt:o.getLastErrorCode(),St:o.getLastError()})}}finally{Oa(wl,`RPC '${e}' ${i} completed.`)}});const B=JSON.stringify(r);Oa(wl,`RPC '${e}' ${i} sending request:`,r),o.send(t,"POST",B,n,15)})}vt(e,t,n){const r=fl(),s=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},o=this.longPollingOptions.timeoutSeconds;void 0!==o&&(a.longPollingTimeout=Math.round(1e3*o)),this.useFetchStreams&&(a.useFetchStreams=!0),this.it(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const B=s.join("");Oa(wl,`Creating RPC '${e}' stream ${r}: ${B}`,a);const c=i.createWebChannel(B,a);this.Dt(c);let u=!1,l=!1;const h=new Dl({ot:t=>{l?Oa(wl,`Not sending because RPC '${e}' stream ${r} is closed:`,t):(u||(Oa(wl,`Opening RPC '${e}' stream ${r} transport.`),c.open(),u=!0),Oa(wl,`RPC '${e}' stream ${r} sending:`,t),c.send(t))},ut:()=>c.close()});return yl(c,Ms.EventType.OPEN,()=>{l||(Oa(wl,`RPC '${e}' stream ${r} transport opened.`),h.Rt())}),yl(c,Ms.EventType.CLOSE,()=>{l||(l=!0,Oa(wl,`RPC '${e}' stream ${r} transport closed`),h.Vt(),this.xt(c))}),yl(c,Ms.EventType.ERROR,t=>{l||(l=!0,Sa(wl,`RPC '${e}' stream ${r} transport errored. Name:`,t.name,"Message:",t.message),h.Vt(new $a(Wa.UNAVAILABLE,"The operation could not be completed")))}),yl(c,Ms.EventType.MESSAGE,t=>{var n;if(!l){const s=t.data[0];ka(!!s,16349);const i=s,a=(null==i?void 0:i.error)||(null==(n=i[0])?void 0:n.error);if(a){Oa(wl,`RPC '${e}' stream ${r} received error:`,a);const t=a.status;let n=function(e){const t=Mc[e];if(void 0!==t)return Hc(t)}(t),s=a.message;"NOT_FOUND"===t&&s.includes("database")&&s.includes("does not exist")&&s.includes(this.databaseId.database)&&Sa(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),void 0===n&&(n=Wa.INTERNAL,s="Unknown error status: "+t+" with message "+a.message),l=!0,h.Vt(new $a(n,s)),c.close()}else Oa(wl,`RPC '${e}' stream ${r} received:`,s),h.dt(s)}}),vl.gt(),setTimeout(()=>{h.At()},0),h}terminate(){this.ft.forEach(e=>e.close()),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter(t=>t===e)}it(e,t,n){super.it(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return js()}}
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
 */vl.yt=!1;class _l{constructor(e,t,n=1e3,r=1.5,s=6e4){this.Ct=e,this.timerId=t,this.Ft=n,this.Ot=r,this.Mt=s,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),n=Math.max(0,Date.now()-this.Bt),r=Math.max(0,t-n);r>0&&Oa("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,r,()=>(this.Bt=Date.now(),e())),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){null!==this.Lt&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){null!==this.Lt&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}
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
 */const Il="PersistentStream";class Tl{constructor(e,t,n,r,s,i,a,o){this.Ct=e,this.Kt=n,this.Qt=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=a,this.listener=o,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new _l(e,t)}Jt(){return 1===this.state||5===this.state||this.Yt()}Yt(){return 2===this.state||3===this.state}start(){this.jt=0,4!==this.state?this.auth():this.Zt()}async stop(){this.Jt()&&await this.close(0)}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&null===this.Gt&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,()=>this.tn()))}nn(e){this.rn(),this.stream.send(e)}async tn(){if(this.Yt())return this.close(0)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}async close(e,t){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,4!==e?this.Ht.reset():t&&t.code===Wa.RESOURCE_EXHAUSTED?(Na(t.toString()),Na("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===Wa.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this._n(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Tt(t)}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,n])=>{this.Wt===t&&this.un(e,n)},t=>{e(()=>{const e=new $a(Wa.UNKNOWN,"Fetching auth token failed: "+t.message);return this.cn(e)})})}un(e,t){const n=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct(()=>{n(()=>this.listener.ct())}),this.stream.Et(()=>{n(()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,()=>(this.Yt()&&(this.state=3),Promise.resolve())),this.listener.Et()))}),this.stream.Tt(e=>{n(()=>this.cn(e))}),this.stream.onMessage(e=>{n(()=>1==++this.jt?this.hn(e):this.onNext(e))})}Zt(){this.state=5,this.Ht.kt(async()=>{this.state=0,this.start()})}cn(e){return Oa(Il,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget(()=>this.Wt===e?t():(Oa(Il,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class bl extends Tl{constructor(e,t,n,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=function(e,t){let n;if("targetChange"in t){t.targetChange;const s="NO_CHANGE"===(r=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===r?1:"REMOVE"===r?2:"CURRENT"===r?3:"RESET"===r?4:La(39313,{state:r}),i=t.targetChange.targetIds||[],a=function(e,t){return e.useProto3Json?(ka(void 0===t||"string"==typeof t,58123),wo.fromBase64String(t||"")):(ka(void 0===t||t instanceof Buffer||t instanceof Uint8Array,16193),wo.fromUint8Array(t||new Uint8Array))}(e,t.targetChange.resumeToken),o=t.targetChange.cause,B=o&&function(e){const t=void 0===e.code?Wa.UNKNOWN:Hc(e.code);return new $a(t,e.message||"")}(o);n=new cu(s,i,a,B||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ou(e,r.document.name),i=_u(r.document.updateTime),a=r.document.createTime?_u(r.document.createTime):fc.min(),o=new lB({mapValue:{fields:r.document.fields}}),B=gc.newFoundDocument(s,i,a,o),c=r.targetIds||[],u=r.removedTargetIds||[];n=new ou(c,u,B.key,B)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=Ou(e,r.document),i=r.readTime?_u(r.readTime):fc.min(),a=gc.newNoDocument(s,i),o=r.removedTargetIds||[];n=new ou([],o,a.key,a)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=Ou(e,r.document),i=r.removedTargetIds||[];n=new ou([],i,s,null)}else{if(!("filter"in t))return La(11601,{we:t});{t.filter;const e=t.filter;e.targetId;const{count:r=0,unchangedNames:s}=e,i=new xc(r,s),a=e.targetId;n=new Bu(a,i)}}var r;return n}(this.serializer,e),n=function(e){if(!("targetChange"in e))return fc.min();const t=e.targetChange;return t.targetIds&&t.targetIds.length?fc.min():t.readTime?_u(t.readTime):fc.min()}(e);return this.listener.Tn(t,n)}Pn(e){const t={};t.database=Su(this.serializer),t.addTarget=function(e,t){let n;const r=t.target;if(n=Ic(r)?{pipelineQuery:xu(e,r)}:Tc(r)?{documents:Ru(e,r)}:{query:ku(e,r).Se},n.targetId=t.targetId,t.resumeToken.approximateByteSize()>0){n.resumeToken=yu(e,t.resumeToken);const r=Eu(e,t.expectedCount);null!==r&&(n.expectedCount=r)}else if(t.snapshotVersion.compareTo(fc.min())>0){n.readTime=Du(e,t.snapshotVersion.toTimestamp());const r=Eu(e,t.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,e);const n=function(e,t){const n=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return La(28987,{purpose:e})}}(t.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,e);n&&(t.labels=n),this.nn(t)}In(e){const t={};t.database=Su(this.serializer),t.removeTarget=e,this.nn(t)}}class Al extends Tl{constructor(e,t,n,r,s,i){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return ka(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ka(!e.writeResults||0===e.writeResults.length,55816),this.listener.Vn()}onNext(e){ka(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=function(e,t){return e&&e.length>0?(ka(void 0!==t,14353),e.map(e=>function(e,t){let n=e.updateTime?_u(e.updateTime):_u(t);return n.isEqual(fc.min())&&(n=_u(t)),new LB(n,e.transformResults||[])}(e,t))):[]}(e.writeResults,e.commitTime),n=_u(e.commitTime);return this.listener.dn(n,t)}fn(){const e={};e.database=Su(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map(e=>function(e,t){let n;if(t instanceof VB)n={update:Lu(e,t.key,t.value)};else if(t instanceof zB)n={delete:Au(e,t.key)};else if(t instanceof JB)n={update:Lu(e,t.key,t.data),updateMask:Ku(t.fieldMask)};else{if(!(t instanceof QB))return La(16599,{be:t.type});n={verify:Au(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map(e=>function(e,t){const n=t.transform;if(n instanceof DB)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof wB)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof vB)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof TB)return{fieldPath:t.field.canonicalString(),increment:n.h};if(n instanceof bB)return{fieldPath:t.field.canonicalString(),minimum:n.h};if(n instanceof AB)return{fieldPath:t.field.canonicalString(),maximum:n.h};throw La(20930,{transform:t.transform})}(0,e))),t.precondition.isNone||(n.currentDocument=(r=e,void 0!==(s=t.precondition).updateTime?{updateTime:vu(r,s.updateTime)}:void 0!==s.exists?{exists:s.exists}:La(27497))),n;var r,s}(this.serializer,e))};this.nn(t)}}
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
 */class Ol{}class Nl extends Ol{constructor(e,t,n,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=r,this.mn=!1}pn(){if(this.mn)throw new $a(Wa.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,n,r){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.nt(e,Tu(t,n),r,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Wa.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new $a(Wa.UNKNOWN,e.toString())})}_t(e,t,n,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection._t(e,Tu(t,n),r,i,a,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Wa.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new $a(Wa.UNKNOWN,e.toString())})}terminate(){this.mn=!0,this.connection.terminate()}}
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
const Sl=new Map;
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
const Fl={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Ll=41943040;class Rl{static withCacheSize(e){return new Rl(e,Rl.DEFAULT_COLLECTION_PERCENTILE,Rl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}Rl.DEFAULT_COLLECTION_PERCENTILE=10,Rl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Rl.DEFAULT=new Rl(Ll,Rl.DEFAULT_COLLECTION_PERCENTILE,Rl.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Rl.DISABLED=new Rl(-1,0,0);
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
class kl{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.gn(e),this.yn=e=>t.writeSequenceNumber(e))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}kl.wn=-1;class Pl{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}
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
 */async function xl(e){if(e.code!==Wa.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;Oa("LocalStore","Unexpectedly lost primary lease")}
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
 */class Ml{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&La(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new Ml((n,r)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(n,r)},this.catchCallback=e=>{this.wrapFailure(t,e).next(n,r)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof Ml?t:Ml.resolve(t)}catch(t){return Ml.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):Ml.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):Ml.reject(t)}static resolve(e){return new Ml((t,n)=>{t(e)})}static reject(e){return new Ml((t,n)=>{n(e)})}static waitFor(e){return new Ml((t,n)=>{let r=0,s=0,i=!1;e.forEach(e=>{++r,e.next(()=>{++s,i&&s===r&&t()},e=>n(e))}),i=!0,s===r&&t()})}static or(e){let t=Ml.resolve(!1);for(const n of e)t=t.next(e=>e?Ml.resolve(e):n());return t}static forEach(e,t){const n=[];return e.forEach((e,r)=>{n.push(t.call(this,e,r))}),this.waitFor(n)}static mapArray(e,t){return new Ml((n,r)=>{const s=e.length,i=new Array(s);let a=0;for(let o=0;o<s;o++){const B=o;t(e[B]).next(e=>{i[B]=e,++a,a===s&&n(i)},e=>r(e))}})}static doWhile(e,t){return new Ml((n,r)=>{const s=()=>{!0===e()?t().next(()=>{s()},r):n()};s()})}}function Gl(e){return"IndexedDbTransactionError"===e.name}
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
 */const Hl="LruGarbageCollector";function Ul([e,t],[n,r]){const s=Ga(e,n);return 0===s?Ga(t,r):s}class Vl{constructor(e){this.Yn=e,this.buffer=new Qa(Ul),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const e=this.buffer.last();Ul(t,e)<0&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class Jl{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.tr=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return null!==this.tr}nr(e){Oa(Hl,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Gl(e)?Oa(Hl,"Ignoring IndexedDB error during garbage collection: ",e):await xl(e)}await this.nr(3e5)})}}class jl{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return Ml.resolve(kl.wn);const n=new Vl(t);return this.rr.forEachTarget(e,e=>n.er(e.sequenceNumber)).next(()=>this.rr.sr(e,e=>n.er(e))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.rr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return-1===this.params.cacheSizeCollectionThreshold?(Oa("LruGarbageCollector","Garbage collection skipped; disabled"),Ml.resolve(Fl)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(Oa("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Fl):this._r(e,t))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let n,r,s,i,a,o,B;const c=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(Oa("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),r=this.params.maximumSequenceNumbersToCollect):r=t,i=Date.now(),this.nthSequenceNumber(e,r))).next(r=>(n=r,a=Date.now(),this.removeTargets(e,n,t))).next(t=>(s=t,o=Date.now(),this.removeOrphanedDocuments(e,n))).next(e=>(B=Date.now(),ba()<=K.DEBUG&&Oa("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-c}ms\n\tDetermined least recently used ${r} in `+(a-i)+`ms\n\tRemoved ${s} targets in `+(o-a)+`ms\n\tRemoved ${e} documents in `+(B-o)+`ms\nTotal Duration: ${B-c}ms`),Ml.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:e})))}}
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
const Kl="firestore.googleapis.com",ql=!0;class zl{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new $a(Wa.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Kl,this.ssl=ql}else this.host=e.host,this.ssl=e.ssl??ql;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),void 0===e.cacheSizeBytes)this.cacheSizeBytes=Ll;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new $a(Wa.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(function(e,t,n,r){if(!0===t&&!0===r)throw new $a(Wa.INVALID_ARGUMENT,`${e} and ${n} cannot be used together.`)}("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ll(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new $a(Wa.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new $a(Wa.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new $a(Wa.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,void 0!==e.grpcFlowControlWindow){if("number"!=typeof e.grpcFlowControlWindow||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new $a(Wa.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(
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
t=this.experimentalLongPollingOptions,n=e.experimentalLongPollingOptions,t.timeoutSeconds===n.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(e,t){if(e===t)return!0;if(!e||!t)return!1;const n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(const s of n)if(e[s]!==t[s])return!1;return!0}(this._customHeaders,e._customHeaders);var t,n}}let Ql=class{constructor(e,t,n,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new zl({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new $a(Wa.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new $a(Wa.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new zl(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new sl;switch(e.type){case"firstParty":return new Bl(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new $a(Wa.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=Sl.get(e);t&&(Oa("ComponentProvider","Removing Datastore"),Sl.delete(e),t.terminate())}(this),Promise.resolve()}};function Yl(e,t,n,r={}){var s;e=Co(e,Ql);const i=G(t),a=e._getSettings(),o={...a,emulatorOptions:e._getEmulatorOptions()},B=`${t}:${n}`;i&&H(`https://${B}`),a.host!==Kl&&a.host!==B&&Sa("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...a,host:B,ssl:i,emulatorOptions:r};if(!S(c,o)&&(e._setSettings(c),r.mockUserToken)){let t,n;if("string"==typeof r.mockUserToken)t=r.mockUserToken,n=tl.MOCK_USER;else{t=function(e,t){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=t||"demo-project",r=e.iat||0,s=e.sub||e.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const i={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...e};return[E(JSON.stringify({alg:"none",type:"JWT"})),E(JSON.stringify(i)),""].join(".")}(r.mockUserToken,null==(s=e._app)?void 0:s.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new $a(Wa.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new tl(i)}e._authCredentials=new il(new rl(t,n))}}
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
 */class Wl{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Wl(this.firestore,e,this._query)}}class $l{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Xl(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new $l(this.firestore,e,this._key)}toJSON(){return{type:$l._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(fo(t,$l._jsonSchema))return new $l(e,n||null,new oo(eo.fromString(t.referencePath)))}}$l._jsonSchemaVersion="firestore/documentReference/1.0",$l._jsonSchema={type:po("string",$l._jsonSchemaVersion),referencePath:po("string")};class Xl extends Wl{constructor(e,t,n){super(e,t,Ac(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new $l(this.firestore,null,new oo(e))}withConverter(e){return new Xl(this.firestore,e,this._path)}}function Zl(e,t,...n){if(e=M(e),Bo("collection","path",t),e instanceof Ql){const r=eo.fromString(t,...n);return uo(r),new Xl(e,null,r)}{if(!(e instanceof $l||e instanceof Xl))throw new $a(Wa.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(eo.fromString(t,...n));return uo(r),new Xl(e.firestore,null,r)}}function eh(e,t,...n){if(e=M(e),1===arguments.length&&(t=Ma.newId()),Bo("doc","path",t),e instanceof Ql){const r=eo.fromString(t,...n);return co(r),new $l(e,null,new oo(r))}{if(!(e instanceof $l||e instanceof Xl))throw new $a(Wa.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(eo.fromString(t,...n));return co(r),new $l(e.firestore,e instanceof Xl?e.converter:null,new oo(r))}}
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
 */class th{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;++n)if(e[n]!==t[n])return!1;return!0}(this._values,e._values)}toJSON(){return{type:th._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(fo(e,th._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new th(e.vectorValues);throw new $a(Wa.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}th._jsonSchemaVersion="firestore/vectorValue/1.0",th._jsonSchema={type:po("string",th._jsonSchemaVersion),vectorValues:po("object")};
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
const nh=/^__.*__$/;class rh{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return null!==this.fieldMask?new JB(e,this.data,this.fieldMask,t,this.fieldTransforms):new VB(e,this.data,t,this.fieldTransforms)}}class sh{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new JB(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function ih(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw La(40011,{dataSource:e})}}class ah{constructor(e,t,n,r,s,i){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new ah({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var t;const n=null==(t=this.path)?void 0:t.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var t;const n=null==(t=this.path)?void 0:t.child(e),r=this.contextWith({path:n,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Dh(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(0===e.length)throw this.createError("Document fields must not be empty");if(ih(this.dataSource)&&nh.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class oh{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Wu(e)}createContext(e,t,n,r=!1){return new ah({dataSource:e,methodName:t,targetDoc:n,path:no.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Bh(e){const t=e._freezeSettings(),n=Wu(e._databaseId);return new oh(e._databaseId,!!t.ignoreUndefinedProperties,n)}function ch(e,t,n,r,s,i={}){const a=e.createContext(i.merge||i.mergeFields?2:0,t,n,s);fh("Data must be an object, but it was:",a,r);const o=Ch(r,a);let B,c;if(i.merge)B=new ro(a.fieldMask),c=a.fieldTransforms;else if(i.mergeFields){const e=[];for(const r of i.mergeFields){const s=gh(t,r,n);if(!a.contains(s))throw new $a(Wa.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);wh(e,s)||e.push(s)}B=new ro(e),c=a.fieldTransforms.filter(e=>B.covers(e.field))}else B=null,c=a.fieldTransforms;return new rh(new lB(o),B,c)}class uh extends Zu{_toFieldTransform(e){if(2!==e.dataSource)throw 1===e.dataSource?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof uh}}class lh extends Zu{_toFieldTransform(e){return new FB(e.path,new DB)}isEqual(e){return e instanceof lh}}function hh(e,t,n){if(ph(e=M(e)))return fh("Unsupported field value:",t,e),Ch(e,t);if(e instanceof Zu)return function(e,t){if(!ih(t.dataSource))throw t.createError(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.createError(`${e._methodName}() is not currently supported inside arrays`);const n=e._toFieldTransform(t);n&&t.fieldTransforms.push(n)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.arrayElement&&4!==t.dataSource)throw t.createError("Nested arrays are not supported");return function(e,t){const n=[];let r=0;for(const s of e){let e=hh(s,t.childContextForArray(r));null==e&&(e={nullValue:"NULL_VALUE"}),n.push(e),r++}return{arrayValue:{values:n}}}(e,t)}return function(e,t){if(null===(e=M(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return pB(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const n=Eo.fromDate(e);return{timestampValue:Du(t.serializer,n)}}if(e instanceof Eo){const n=new Eo(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:Du(t.serializer,n)}}if(dh(e)){const n=Eo.fromInstant(e),r=new Eo(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:Du(t.serializer,r)}}if(e instanceof el)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof $u)return{bytesValue:yu(t.serializer,e._byteString)};if(e instanceof $l){const n=t.databaseId,r=e.firestore._databaseId;if(!r.isEqual(n))throw t.createError(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:Iu(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof th)return function(e,t){const n=e instanceof th?e.toArray():e;return{mapValue:{fields:{[Mo]:{stringValue:Uo},[Vo]:{arrayValue:{values:n.map(e=>{if("number"!=typeof e)throw t.createError("VectorValues must only contain numeric values.");return CB(t.serializer,e)})}}}}}}(e,t);if(zu(e))return e._toProto(t.serializer);throw t.createError(`Unsupported field value: ${ho(e)}`)}(e,t)}function Ch(e,t){const n={};return ao(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):io(e,(e,r)=>{const s=hh(r,t.childContextForField(e));null!=s&&(n[e]=s)}),{mapValue:{fields:n}}}function dh(e){if("object"!=typeof e||null===e)return!1;if("undefined"!=typeof Temporal&&"function"==typeof Temporal.Instant&&e instanceof Temporal.Instant)return!0;const t=e;return"Temporal.Instant"===t[Symbol.toStringTag]&&"bigint"==typeof t.t}function ph(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof Eo||e instanceof el||e instanceof $u||e instanceof $l||e instanceof Zu||e instanceof th||dh(e)||zu(e))}function fh(e,t,n){if(!ph(n)||!lo(n)){const r=ho(n);throw"an object"===r?t.createError(e+" a custom object"):t.createError(e+" "+r)}}function gh(e,t,n){if((t=M(t))instanceof Xu)return t._internalPath;if("string"==typeof t)return Eh(e,t);throw Dh("Field path arguments must be of type string or ",e,!1,void 0,n)}const mh=new RegExp("[~\\*/\\[\\]]");function Eh(e,t,n){if(t.search(mh)>=0)throw Dh(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,n);try{return new Xu(...t.split("."))._internalPath}catch(r){throw Dh(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,n)}}function Dh(e,t,n,r,s){const i=r&&!r.isEmpty(),a=void 0!==s;let o=`Function ${t}() called with invalid data`;n&&(o+=" (via `toFirestore()`)"),o+=". ";let B="";return(i||a)&&(B+=" (found",i&&(B+=` in field ${r}`),a&&(B+=` in document ${s}`),B+=")"),new $a(Wa.INVALID_ARGUMENT,o+e+B)}function wh(e,t){return e.some(e=>e.isEqual(t))}
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
class yh{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=lB.empty();for(const r in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(r)){const s=this.optionDefinitions[r];if(r in e){const i=e[r];let a;s.nestedOptions&&lo(i)?a={mapValue:{fields:new yh(s.nestedOptions).getOptionsProto(t,i)}}:i&&(a=hh(i,t)??void 0),a&&n.set(no.fromServerFormat(s.serverName),a)}}return n}getOptionsProto(e,t,n){const r=this._getKnownOptions(t,e);if(n){const t=new Map(function(e,t){const n=[];for(const r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.push(t(e[r],r,e));return n}(n,(t,n)=>[no.fromServerFormat(n),void 0!==t?hh(t,e):null]));r.setAll(t)}return r.value.mapValue.fields??{}}}
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
 */function vh(){return new lh("serverTimestamp")}
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
function _h(e){let t;return e instanceof bh?e:(t=lo(e)?function(e){const t=[];for(const n in e)if(Object.prototype.hasOwnProperty.call(e,n)){const r=e[n];t.push(Rh(n)),t.push(_h(r))}return new Ph("map",t,"map")}(e):e instanceof Array?function(e){return t=e,n="array",new Ph("array",t.map(e=>_h(e)),n);var t,n}(e):kh(e,void 0),t)}function Ih(e){if(e instanceof bh)return e;if(e instanceof th)return Rh(e);if(Array.isArray(e))return Rh(function(e){return new th(e)}(e));throw new Error("Unsupported value: "+typeof e)}function Th(e){return function(e){return"string"==typeof e}(e)?function(e){return function(e,t){return new Fh("string"==typeof e?Xa===e?new Xu(Xa)._internalPath:gh("field",e):e._internalPath,t)}(e,"field")}(e):_h(e)}class bh{constructor(){this._protoValueType="ProtoValue"}add(e){return new Ph("add",[this,_h(e)],"add")}asBoolean(){if(this instanceof xh)return this;if(this instanceof Lh)return new Gh(this);if(this instanceof Fh)return new Hh(this);if(this instanceof Ph)return new Mh(this);throw new $a("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new Ph("subtract",[this,_h(e)],"subtract")}multiply(e){return new Ph("multiply",[this,_h(e)],"multiply")}divide(e){return new Ph("divide",[this,_h(e)],"divide")}mod(e){return new Ph("mod",[this,_h(e)],"mod")}equal(e){return new Ph("equal",[this,_h(e)],"equal").asBoolean()}notEqual(e){return new Ph("not_equal",[this,_h(e)],"notEqual").asBoolean()}lessThan(e){return new Ph("less_than",[this,_h(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new Ph("less_than_or_equal",[this,_h(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new Ph("greater_than",[this,_h(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new Ph("greater_than_or_equal",[this,_h(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map(e=>_h(e));return new Ph("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new Ph("array_contains",[this,_h(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Sh(e.map(_h),"arrayContainsAll"):e;return new Ph("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Sh(e.map(_h),"arrayContainsAny"):e;return new Ph("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new Ph("array_reverse",[this])}arrayLength(){return new Ph("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Sh(e.map(_h),"equalAny"):e;return new Ph("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Sh(e.map(_h),"notEqualAny"):e;return new Ph("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new Ph("exists",[this],"exists").asBoolean()}charLength(){return new Ph("char_length",[this],"charLength")}like(e){return new Ph("like",[this,_h(e)],"like").asBoolean()}regexContains(e){return new Ph("regex_contains",[this,_h(e)],"regexContains").asBoolean()}regexFind(e){return new Ph("regex_find",[this,_h(e)],"regexFind")}regexFindAll(e){return new Ph("regex_find_all",[this,_h(e)],"regexFindAll")}regexMatch(e){return new Ph("regex_match",[this,_h(e)],"regexMatch").asBoolean()}stringContains(e){return new Ph("string_contains",[this,_h(e)],"stringContains").asBoolean()}startsWith(e){return new Ph("starts_with",[this,_h(e)],"startsWith").asBoolean()}endsWith(e){return new Ph("ends_with",[this,_h(e)],"endsWith").asBoolean()}toLower(){return new Ph("to_lower",[this],"toLower")}toUpper(){return new Ph("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(_h(e)),new Ph("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(_h(e)),new Ph("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(_h(e)),new Ph("rtrim",t,"rtrim")}type(){return new Ph("type",[this])}isType(e){return new Ph("is_type",[this,Rh(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(_h);return new Ph("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new Ph("string_index_of",[this,_h(e)],"stringIndexOf")}stringRepeat(e){return new Ph("string_repeat",[this,_h(e)],"stringRepeat")}stringReplaceAll(e,t){return new Ph("string_replace_all",[this,_h(e),_h(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new Ph("string_replace_one",[this,_h(e),_h(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(_h);return new Ph("concat",[this,...n],"concat")}reverse(){return new Ph("reverse",[this],"reverse")}arrayFilter(e,t){return new Ph("array_filter",[this,_h(e),t],"arrayFilter")}arrayTransform(e,t){return new Ph("array_transform",[this,_h(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new Ph("array_transform",[this,_h(e),_h(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,_h(e)];return void 0!==t&&n.push(_h(t)),new Ph("array_slice",n,"arraySlice")}arrayFirst(){return new Ph("array_first",[this],"arrayFirst")}arrayFirstN(e){return new Ph("array_first_n",[this,_h(e)],"arrayFirstN")}arrayLast(){return new Ph("array_last",[this],"arrayLast")}arrayLastN(e){return new Ph("array_last_n",[this,_h(e)],"arrayLastN")}arrayMaximum(){return new Ph("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new Ph("maximum_n",[this,_h(e)],"arrayMaximumN")}arrayMinimum(){return new Ph("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new Ph("minimum_n",[this,_h(e)],"arrayMinimumN")}arrayIndexOf(e){return new Ph("array_index_of",[this,_h(e),_h("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new Ph("array_index_of",[this,_h(e),_h("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new Ph("array_index_of_all",[this,_h(e)],"arrayIndexOfAll")}byteLength(){return new Ph("byte_length",[this],"byteLength")}ceil(){return new Ph("ceil",[this])}floor(){return new Ph("floor",[this])}abs(){return new Ph("abs",[this])}exp(){return new Ph("exp",[this])}mapGet(e){return new Ph("map_get",[this,Rh(e)],"mapGet")}mapSet(e,t,...n){const r=[this,_h(e),_h(t),...n.map(_h)];return new Ph("map_set",r,"mapSet")}mapKeys(){return new Ph("map_keys",[this],"mapKeys")}mapValues(){return new Ph("map_values",[this],"mapValues")}mapEntries(){return new Ph("map_entries",[this],"mapEntries")}getField(e){return new Ph("get_field",[this,_h(e)],"get_field")}count(){return Ah._create("count",[this],"count")}sum(){return Ah._create("sum",[this],"sum")}average(){return Ah._create("average",[this],"average")}minimum(){return Ah._create("minimum",[this],"minimum")}maximum(){return Ah._create("maximum",[this],"maximum")}first(){return Ah._create("first",[this],"first")}last(){return Ah._create("last",[this],"last")}arrayAgg(){return Ah._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Ah._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Ah._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new Ph("maximum",[this,...n.map(_h)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new Ph("minimum",[this,...n.map(_h)],"minimum")}vectorLength(){return new Ph("vector_length",[this],"vectorLength")}cosineDistance(e){return new Ph("cosine_distance",[this,Ih(e)],"cosineDistance")}dotProduct(e){return new Ph("dot_product",[this,Ih(e)],"dotProduct")}euclideanDistance(e){return new Ph("euclidean_distance",[this,Ih(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new Ph("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new Ph("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new Ph("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new Ph("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new Ph("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new Ph("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new Ph("timestamp_add",[this,_h(e),_h(t)],"timestampAdd")}timestampSubtract(e,t){return new Ph("timestamp_subtract",[this,_h(e),_h(t)],"timestampSubtract")}timestampDiff(e,t){return new Ph("timestamp_diff",[this,Th(e),_h(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,_h(e)];return t&&n.push(_h(t)),new Ph("timestamp_extract",n,"timestampExtract")}documentId(){return new Ph("document_id",[this],"documentId")}parent(){return new Ph("parent",[this],"parent")}substring(e,t){const n=_h(e);return new Ph("substring",void 0===t?[this,n]:[this,n,_h(t)],"substring")}arrayGet(e){return new Ph("array_get",[this,_h(e)],"arrayGet")}isError(){return new Ph("is_error",[this],"isError").asBoolean()}ifError(e){const t=new Ph("if_error",[this,_h(e)],"ifError");return e instanceof xh?t.asBoolean():t}isAbsent(){return new Ph("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new Ph("map_remove",[this,_h(e)],"mapRemove")}mapMerge(e,...t){const n=_h(e),r=t.map(_h);return new Ph("map_merge",[this,n,...r],"mapMerge")}pow(e){return new Ph("pow",[this,_h(e)])}trunc(e){return void 0===e?new Ph("trunc",[this]):new Ph("trunc",[this,_h(e)],"trunc")}round(e){return void 0===e?new Ph("round",[this]):new Ph("round",[this,_h(e)],"round")}collectionId(){return new Ph("collection_id",[this])}length(){return new Ph("length",[this])}ln(){return new Ph("ln",[this])}sqrt(){return new Ph("sqrt",[this])}stringReverse(){return new Ph("string_reverse",[this])}ifAbsent(e){return new Ph("if_absent",[this,_h(e)],"ifAbsent")}ifNull(e){return new Ph("if_null",[this,_h(e)],"ifNull")}coalesce(e,...t){return new Ph("coalesce",[this,_h(e),...t.map(_h)],"coalesce")}join(e){return new Ph("join",[this,_h(e)],"join")}log10(){return new Ph("log10",[this])}arraySum(){return new Ph("sum",[this])}split(e){return new Ph("split",[this,_h(e)])}timestampTruncate(e,t){const n=[this,_h(e)];return t&&n.push(_h(t)),new Ph("timestamp_trunc",n)}ascending(){return new Uh(Th(this),"ascending","ascending")}descending(){return new Uh(Th(this),"descending","descending")}as(e){return new Nh(this,e,"as")}}class Ah{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const r=new Ah(e,t);return r._methodName=n,r}as(e){return new Oh(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class Oh{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class Nh{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Sh extends bh{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map(t=>t._toProto(e))}}}_readUserData(e){this.cr.forEach(t=>t._readUserData(e))}}class Fh extends bh{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new Ph("geo_distance",[this,_h(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}class Lh extends bh{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Lh(e,void 0);return t._protoValue=e,t}_toProto(e){return ka(void 0!==this._protoValue,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,function(e){return"object"==typeof e&&null!==e&&!!("nullValue"in e&&(null===e.nullValue||"NULL_VALUE"===e.nullValue)||"booleanValue"in e&&(null===e.booleanValue||"boolean"==typeof e.booleanValue)||"integerValue"in e&&(null===e.integerValue||"number"==typeof e.integerValue||"string"==typeof e.integerValue)||"doubleValue"in e&&(null===e.doubleValue||"number"==typeof e.doubleValue)||"timestampValue"in e&&(null===e.timestampValue||(t=e.timestampValue,"object"==typeof t&&null!==t&&"seconds"in t&&(null===t.seconds||"number"==typeof t.seconds||"string"==typeof t.seconds)&&"nanos"in t&&(null===t.nanos||"number"==typeof t.nanos)))||"stringValue"in e&&(null===e.stringValue||"string"==typeof e.stringValue)||"bytesValue"in e&&(null===e.bytesValue||e.bytesValue instanceof Uint8Array)||"referenceValue"in e&&(null===e.referenceValue||"string"==typeof e.referenceValue)||"geoPointValue"in e&&(null===e.geoPointValue||function(e){return"object"==typeof e&&null!==e&&"latitude"in e&&(null===e.latitude||"number"==typeof e.latitude)&&"longitude"in e&&(null===e.longitude||"number"==typeof e.longitude)}(e.geoPointValue))||"arrayValue"in e&&(null===e.arrayValue||function(e){return"object"==typeof e&&null!==e&&!(!("values"in e)||null!==e.values&&!Array.isArray(e.values))}(e.arrayValue))||"mapValue"in e&&(null===e.mapValue||function(e){return"object"==typeof e&&null!==e&&!(!("fields"in e)||null!==e.fields&&!lo(e.fields))}(e.mapValue))||"fieldReferenceValue"in e&&(null===e.fieldReferenceValue||"string"==typeof e.fieldReferenceValue)||"functionValue"in e&&(null===e.functionValue||function(e){return"object"==typeof e&&null!==e&&!(!("name"in e)||null!==e.name&&"string"!=typeof e.name||!("args"in e)||null!==e.args&&!Array.isArray(e.args))}(e.functionValue))||"pipelineValue"in e&&(null===e.pipelineValue||function(e){return"object"==typeof e&&null!==e&&!(!("stages"in e)||null!==e.stages&&!Array.isArray(e.stages))}(e.pipelineValue)));var t}(this._protoValue)||(this._protoValue=hh(this.value,e))}}function Rh(e,t){return kh(e,"constant")}function kh(e,t){const n=new Lh(e,t);return"boolean"==typeof e?new Gh(n):n}class Ph extends bh{constructor(e,t,n,r){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,void 0!==n&&(this._methodName=n),void 0!==r&&(this._options=r)}get _optionsUtil(){return new yh({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class xh extends bh{get _methodName(){return this._expr._methodName}countIf(){return Ah._create("count_if",[this],"countIf")}not(){return new Ph("not",[this],"not").asBoolean()}conditional(e,t){return new Ph("conditional",[this,e,t],"conditional")}ifError(e){const t=_h(e),n=new Ph("if_error",[this,t],"ifError");return t instanceof xh?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Mh extends xh{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Gh extends xh{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Hh extends xh{constructor(e){super(),this._expr=e,this.expressionType="Field"}}class Uh{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Yu(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}
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
 */class Vh{constructor(e){this.optionsProto=void 0,({rawOptions:this.rawOptions,...this.knownOptions}=e)}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Jh extends Vh{get _name(){return"add_fields"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[Qu(e,this.fields)]}}_readUserData(e){super._readUserData(e),nC(this.fields,e)}}class jh extends Vh{get _name(){return"aggregate"}get _optionsUtil(){return new yh({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[Qu(e,this.accumulators),Qu(e,this.groups)]}}_readUserData(e){super._readUserData(e),nC(this.groups,e),nC(this.accumulators,e)}}class Kh extends Vh{get _name(){return"distinct"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[Qu(e,this.groups)]}}_readUserData(e){super._readUserData(e),nC(this.groups,e)}}class qh extends Vh{get _name(){return"collection"}get _optionsUtil(){return new yh({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.hr}]}}_readUserData(e){super._readUserData(e)}}class zh extends Vh{get _name(){return"collection_group"}get _optionsUtil(){return new yh({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Qh extends Vh{get _name(){return"database"}get _optionsUtil(){return new yh({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Yh extends Vh{get _name(){return"documents"}get _optionsUtil(){return new yh({})}constructor(e,t){if(super(t),!e||0===e.length)throw new $a(Wa.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map(e=>e.startsWith("/")?e:"/"+e),r=new Set(n);if(r.size!==n.length)throw new $a(Wa.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=n,this.Pr=r}_toProto(e){return{...super._toProto(e),args:this.Tr.map(e=>({referenceValue:e}))}}_readUserData(e){super._readUserData(e)}}class Wh extends Vh{get _name(){return"where"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),nC(this.condition,e)}}class $h extends Vh{get _name(){return"limit"}get _optionsUtil(){return new yh({})}constructor(e,t){ka(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[pB(e,this.limit)]}}}class Xh extends Vh{get _name(){return"offset"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[pB(e,this.offset)]}}}class Zh extends Vh{get _name(){return"select"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[Qu(e,this.selections)]}}_readUserData(e){super._readUserData(e),nC(this.selections,e)}}class eC extends Vh{get _name(){return"sort"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),nC(this.orderings,e)}}class tC extends Vh{get _name(){return"replace_with"}get _optionsUtil(){return new yh({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Yu(tC.Ir)]}}_readUserData(e){super._readUserData(e),nC(this.map,e)}}function nC(e,t){return function(e){return"function"==typeof e._readUserData}(e)?e._readUserData(t):Array.isArray(e)||e instanceof Map?e.forEach(e=>e._readUserData(t)):Object.values(e).forEach(e=>e._readUserData(t)),e}
// Copyright 2024 Google LLC* @license
tC.Ir="full_replace";class rC{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return iC(this)}getPipelineCollectionGroup(){return aC(this)}getPipelineCollectionId(){return function(e){switch(sC(e)){case"collection":return eo.fromString(iC(e)).lastSegment();case"collection_group":return aC(e);default:return}}(this)}getPipelineDocuments(){return oC(this)}getPipelineFlavor(){return function(e){let t="exact";return e.stages.forEach((n,r)=>{n._name!==Kh.name&&n._name!==jh.name||(t="keyless"),n._name===Zh.name&&"exact"===t&&(t="augmented"),n._name===Jh.name&&r<e.stages.length-1&&"exact"===t&&(t="augmented")}),t}(this)}getPipelineSourceType(){return sC(this)}}function sC(e){const t=e.stages[0];return t instanceof qh||t instanceof zh||t instanceof Qh||t instanceof Yh?t._name:"unknown"}function iC(e){if("collection"===sC(e))return e.stages[0].hr}function aC(e){if("collection_group"===sC(e))return e.stages[0].collectionId}function oC(e){if("documents"===sC(e))return e.stages[0].Tr}class BC{constructor(e,t){this.type=e,this.value=t}static mr(){return new BC("ERROR",void 0)}static pr(){return new BC("UNSET",void 0)}static gr(){return new BC("NULL",Jo)}static newValue(e){return iB(e)?new BC("NULL",Jo):(t=e)&&"booleanValue"in t?new BC("BOOLEAN",e):tB(e)?new BC("INT",e):nB(e)?new BC("DOUBLE",e):function(e){return!!e&&"timestampValue"in e&&!!e.timestampValue}(e)?new BC("TIMESTAMP",e):function(e){return!!e&&"stringValue"in e}(e)?new BC("STRING",e):function(e){return!!e&&"bytesValue"in e}(e)?new BC("BYTES",e):e.referenceValue?new BC("REFERENCE",e):e.geoPointValue?new BC("GEO_POINT",e):sB(e)?new BC("ARRAY",e):BB(e)?new BC("VECTOR",e):oB(e)?new BC("MAP",e):new BC("ERROR",void 0);var t}yr(){return"ERROR"===this.type||"UNSET"===this.type}wr(){return"NULL"===this.type}}function cC(e){if(!e.yr())return e.value}function uC(e){return e instanceof xh?e._expr:e}function lC(e){if((e=uC(e))instanceof Fh)return new hC(e);if(e instanceof Lh)return new CC(e);if(e instanceof Sh)return new dC(e);if(e instanceof Ph){if("add"===e.name)return new wC(e);if("subtract"===e.name)return new yC(e);if("multiply"===e.name)return new vC(e);if("divide"===e.name)return new _C(e);if("mod"===e.name)return new IC(e);if("and"===e.name)return new TC(e);if("equal"===e.name)return new VC(e);if("not_equal"===e.name)return new JC(e);if("less_than"===e.name)return new jC(e);if("less_than_or_equal"===e.name)return new KC(e);if("greater_than"===e.name)return new qC(e);if("greater_than_or_equal"===e.name)return new zC(e);if("array_concat"===e.name)return new QC(e);if("array_reverse"===e.name)return new YC(e);if("array_contains"===e.name)return new WC(e);if("array_contains_all"===e.name)return new $C(e);if("array_contains_any"===e.name)return new XC(e);if("array_length"===e.name)return new ZC(e);if("array_element"===e.name)return new ed(e);if("equal_any"===e.name)return new NC(e);if("not_equal_any"===e.name)return new SC(e);if("is_nan"===e.name)return new FC(e);if("is_not_nan"===e.name)return new LC(e);if("is_null"===e.name)return new RC(e);if("is_not_null"===e.name)return new kC(e);if("is_error"===e.name)return new PC(e);if("exists"===e.name)return new xC(e);if("not"===e.name)return new bC(e);if("or"===e.name)return new AC(e);if("xor"===e.name)return new OC(e);if("conditional"===e.name)return new MC(e);if("maximum"===e.name)return new GC(e);if("minimum"===e.name)return new HC(e);if("reverse"===e.name)return new td(e);if("replace_first"===e.name)return new nd(e);if("replace_all"===e.name)return new rd(e);if("char_length"===e.name)return new sd(e);if("byte_length"===e.name)return new id(e);if("like"===e.name)return new od(e);if("regex_contains"===e.name)return new Bd(e);if("regex_match"===e.name)return new cd(e);if("string_contains"===e.name)return new ud(e);if("starts_with"===e.name)return new ld(e);if("ends_with"===e.name)return new hd(e);if("to_lower"===e.name)return new Cd(e);if("to_upper"===e.name)return new dd(e);if("trim"===e.name)return new pd(e);if("string_concat"===e.name)return new fd(e);if("map_get"===e.name)return new gd(e);if("cosine_distance"===e.name)return new Ed(e);if("dot_product"===e.name)return new Dd(e);if("euclidean_distance"===e.name)return new wd(e);if("vector_length"===e.name)return new yd(e);if("unix_micros_to_timestamp"===e.name)return new xd(e);if("timestamp_to_unix_micros"===e.name)return new Ud(e);if("unix_millis_to_timestamp"===e.name)return new Md(e);if("timestamp_to_unix_millis"===e.name)return new Vd(e);if("unix_seconds_to_timestamp"===e.name)return new Gd(e);if("timestamp_to_unix_seconds"===e.name)return new Jd(e);if("timestamp_add"===e.name)return new Kd(e);if("timestamp_subtract"===e.name)return new qd(e)}throw new Error(`Unknown Expr : ${e}`)}class hC{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Xa)return BC.newValue({referenceValue:Au(e.serializer,t.key)});if("__update_time__"===this.expr.fieldName)return BC.newValue({timestampValue:vu(e.serializer,t.version)});if("__create_time__"===this.expr.fieldName)return BC.newValue({timestampValue:vu(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?No(n)?BC.newValue(function(e,t){if("estimate"===e.serverTimestampBehavior)return{timestampValue:vu(e.serializer,fc.fromTimestamp(Fo(t)))};if("previous"===e.serverTimestampBehavior){const e=So(t);if(e)return e}return{nullValue:"NULL_VALUE"}}(e,n)):BC.newValue(n):BC.pr()}}class CC{constructor(e){this.expr=e}evaluate(e,t){return BC.newValue(this.expr._getValue())}}class dC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.cr.map(n=>lC(n).evaluate(e,t));return n.some(e=>e.yr())?BC.mr():BC.newValue({arrayValue:{values:n.map(e=>e.value)}})}}function pC(e){return nB(e)?Number(e.doubleValue):Number(e.integerValue)}function fC(e){return BigInt(e.integerValue)}const gC=BigInt("0x7fffffffffffffff"),mC=-BigInt("0x8000000000000000");class EC{constructor(e){this.expr=e}evaluate(e,t){ka(this.expr.params.length>=2,24778);const n=lC(this.expr.params[0]).evaluate(e,t),r=lC(this.expr.params[1]).evaluate(e,t);let s=this.br(n,r);for(const i of this.expr.params.slice(2)){const n=lC(i).evaluate(e,t);s=this.br(s,n)}return s}br(e,t){if(e.yr()||t.yr())return BC.mr();if(e.wr()||t.wr())return BC.gr();const n=e.value,r=t.value;if(!nB(n)&&!tB(n)||!nB(r)&&!tB(r))return BC.mr();if(nB(n)||nB(r)){const e=this.Sr(n,r);return e?BC.newValue(e):BC.mr()}if(tB(n)&&tB(r)){const e=this.vr(n,r);return void 0===e?BC.mr():"number"==typeof e?BC.newValue({doubleValue:e}):e<mC||e>gC?BC.mr():BC.newValue({integerValue:`${e}`})}return BC.mr()}}function DC(e,t){return qo(e)!==qo(t)?"TYPE_MISMATCH":aB(e)||aB(t)?"NOT_EQ":iB(e)&&iB(t)?"EQ":iB(e)||iB(t)?"NULL":sB(e)&&sB(t)?function(e,t){var n,r,s;if((null==(n=e.values)?void 0:n.length)!==(null==(r=t.values)?void 0:r.length))return"NOT_EQ";let i=!1;for(let a=0;a<((null==(s=e.values)?void 0:s.length)??0);a++){const n=e.values[a],r=t.values[a];switch(DC(n,r)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:La(44609,{Dr:n,Cr:r})}}return i?"NULL":"EQ"}(e.arrayValue,t.arrayValue):BB(e)&&BB(t)||oB(e)&&oB(t)?function(e,t){const n=e.fields||{},r=t.fields||{};if(so(n)!==so(r))return"NOT_EQ";let s=!1;for(const i in n)if(n.hasOwnProperty(i)){if(void 0===r[i])return"NOT_EQ";switch(DC(n[i],r[i])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0}}return s?"NULL":"EQ"}(e.mapValue,t.mapValue):zo(e,t,{u:!1,i:!0,o:!0})?"EQ":"NOT_EQ"}class wC extends EC{vr(e,t){return fC(e)+fC(t)}Sr(e,t){return{doubleValue:pC(e)+pC(t)}}}class yC extends EC{constructor(e){super(e),this.expr=e}vr(e,t){return fC(e)-fC(t)}Sr(e,t){return{doubleValue:pC(e)-pC(t)}}}class vC extends EC{constructor(e){super(e),this.expr=e}vr(e,t){return fC(e)*fC(t)}Sr(e,t){return{doubleValue:pC(e)*pC(t)}}}class _C extends EC{constructor(e){super(e),this.expr=e}vr(e,t){const n=fC(t);if(n!==BigInt(0))return fC(e)/n}Sr(e,t){const n=pC(t);return 0===n?{doubleValue:xo(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:pC(e)/n}}}class IC extends EC{constructor(e){super(e),this.expr=e}vr(e,t){const n=fC(t);if(n!==BigInt(0))return fC(e)%n}Sr(e,t){const n=pC(t);if(0!==n)return{doubleValue:pC(e)%n}}}class TC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=lC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":if(!(null==(n=a.value)?void 0:n.booleanValue))return BC.newValue(Ko);break;case"NULL":s=!0;break;default:r=!0}}return r?BC.mr():s?BC.gr():BC.newValue(jo)}}class bC{constructor(e){this.expr=e}evaluate(e,t){var n;ka(1===this.expr.params.length,9634);const r=lC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return BC.newValue({booleanValue:!(null==(n=r.value)?void 0:n.booleanValue)});case"NULL":return BC.gr();default:return BC.mr()}}}class AC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=lC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":if(null==(n=a.value)?void 0:n.booleanValue)return BC.newValue(jo);break;case"NULL":s=!0;break;default:r=!0}}return r?BC.mr():s?BC.gr():BC.newValue(Ko)}}class OC{constructor(e){this.expr=e}evaluate(e,t){var n;let r=!1,s=!1;for(const i of this.expr.params){const a=lC(i).evaluate(e,t);switch(a.type){case"BOOLEAN":r=OC.xor(r,!!(null==(n=a.value)?void 0:n.booleanValue));break;case"NULL":s=!0;break;default:return BC.mr()}}return s?BC.gr():BC.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class NC{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(2===this.expr.params.length,55094);let s=!1;const i=lC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":s=!0;break;case"ERROR":case"UNSET":return BC.mr()}const a=lC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"ARRAY":break;case"NULL":s=!0;break;default:return BC.mr()}if(s)return BC.gr();for(const o of(null==(r=null==(n=a.value)?void 0:n.arrayValue)?void 0:r.values)??[])switch(iB(i.value)&&iB(o)?"EQ":DC(i.value,o)){case"EQ":return BC.newValue(jo);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":s=!0;break;default:La(44608,{value:i.value,candidate:o})}return s?BC.gr():BC.newValue(Ko)}}class SC{constructor(e){this.expr=e}evaluate(e,t){return new bC(new Ph("not",[new Ph("equal_any",this.expr.params)])).evaluate(e,t)}}class FC{constructor(e){this.expr=e}evaluate(e,t){ka(1===this.expr.params.length,23322);const n=lC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return BC.newValue(Ko);case"DOUBLE":return BC.newValue({booleanValue:isNaN(pC(n.value))});case"NULL":return BC.gr();default:return BC.mr()}}}class LC{constructor(e){this.expr=e}evaluate(e,t){return ka(1===this.expr.params.length,50406),new bC(new Ph("not",[new Ph("is_nan",this.expr.params)])).evaluate(e,t)}}class RC{constructor(e){this.expr=e}evaluate(e,t){switch(ka(1===this.expr.params.length,23123),lC(this.expr.params[0]).evaluate(e,t).type){case"NULL":return BC.newValue(jo);case"UNSET":case"ERROR":return BC.mr();default:return BC.newValue(Ko)}}}class kC{constructor(e){this.expr=e}evaluate(e,t){return ka(1===this.expr.params.length,23167),new bC(new Ph("not",[new Ph("is_null",this.expr.params)])).evaluate(e,t)}}class PC{constructor(e){this.expr=e}evaluate(e,t){return ka(1===this.expr.params.length,5228),"ERROR"===lC(this.expr.params[0]).evaluate(e,t).type?BC.newValue(jo):BC.newValue(Ko)}}class xC{constructor(e){this.expr=e}evaluate(e,t){switch(ka(1===this.expr.params.length,6877),lC(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return BC.mr();case"UNSET":return BC.newValue(Ko);default:return BC.newValue(jo)}}}class MC{constructor(e){this.expr=e}evaluate(e,t){var n;ka(3===this.expr.params.length,11706);const r=lC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(null==(n=r.value)?void 0:n.booleanValue)?lC(this.expr.params[1]).evaluate(e,t):lC(this.expr.params[2]).evaluate(e,t);case"NULL":return lC(this.expr.params[2]).evaluate(e,t);default:return BC.mr()}}}class GC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>lC(n).evaluate(e,t));let r;for(const s of n)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||Yo(s.value,r.value)>0?s:r}return void 0===r?BC.gr():r}}class HC{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>lC(n).evaluate(e,t));let r;for(const s of n)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||Yo(s.value,r.value)<0?s:r}return void 0===r?BC.gr():r}}class UC{constructor(e){this.expr=e}evaluate(e,t){ka(2===this.expr.params.length,31033,`${this.expr.name}() function should have exactly 2 params`);const n=lC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return BC.mr()}const r=lC(this.expr.params[1]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return BC.mr()}return this.Fr(n,r)}}class VC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return BC.newValue(jo);if(e.wr()||t.wr())return BC.newValue(Ko);if(aB(e.value)||aB(t.value))return BC.newValue(Ko);if(qo(e.value)!==qo(t.value))return BC.newValue(Ko);switch(DC(e.value,t.value)){case"EQ":return BC.newValue(jo);case"NOT_EQ":return BC.newValue(Ko);case"NULL":return BC.gr();default:La(44615,{left:e,right:t})}}}class JC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){switch(DC(e.value,t.value)){case"EQ":return BC.newValue(Ko);case"NOT_EQ":case"TYPE_MISMATCH":return BC.newValue(jo);case"NULL":return BC.gr();default:La(44614,{left:e,right:t})}}}class jC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){return qo(e.value)!==qo(t.value)||aB(e.value)||aB(t.value)?BC.newValue(Ko):BC.newValue({booleanValue:Yo(e.value,t.value)<0})}}class KC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){return qo(e.value)!==qo(t.value)||aB(e.value)||aB(t.value)?BC.newValue(Ko):"EQ"===DC(e.value,t.value)?BC.newValue(jo):BC.newValue({booleanValue:Yo(e.value,t.value)<0})}}class qC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){return qo(e.value)!==qo(t.value)||aB(e.value)||aB(t.value)?BC.newValue(Ko):BC.newValue({booleanValue:Yo(e.value,t.value)>0})}}class zC extends UC{constructor(e){super(e),this.expr=e}Fr(e,t){return qo(e.value)!==qo(t.value)||aB(e.value)||aB(t.value)?BC.newValue(Ko):"EQ"===DC(e.value,t.value)?BC.newValue(jo):BC.newValue({booleanValue:Yo(e.value,t.value)>0})}}class QC{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class YC{constructor(e){this.expr=e}evaluate(e,t){var n;ka(1===this.expr.params.length,216);const r=lC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return BC.gr();case"ARRAY":{const e=(null==(n=r.value.arrayValue)?void 0:n.values)??[];return BC.newValue({arrayValue:{values:[...e].reverse()}})}default:return BC.mr()}}}class WC{constructor(e){this.expr=e}evaluate(e,t){return ka(2===this.expr.params.length,52884),new NC(new Ph("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class $C{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;ka(2===this.expr.params.length,1392);let a=!1;const o=lC(this.expr.params[0]).evaluate(e,t);switch(o.type){case"ARRAY":break;case"NULL":a=!0;break;default:return BC.mr()}const B=lC(this.expr.params[1]).evaluate(e,t);switch(B.type){case"ARRAY":break;case"NULL":a=!0;break;default:return BC.mr()}if(a)return BC.gr();const c=(null==(r=null==(n=B.value)?void 0:n.arrayValue)?void 0:r.values)??[],u=(null==(i=null==(s=o.value)?void 0:s.arrayValue)?void 0:i.values)??[];for(const l of c){let e=!1;a=!1;for(const t of u){switch(iB(l)&&iB(t)?"EQ":DC(l,t)){case"EQ":e=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":a=!0;break;default:La(44613,{value:t,search:l})}if(e)break}if(!e)return BC.newValue(Ko)}return BC.newValue(jo)}}class XC{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;ka(2===this.expr.params.length,2680);let a=!1;const o=lC(this.expr.params[0]).evaluate(e,t);switch(o.type){case"ARRAY":break;case"NULL":a=!0;break;default:return BC.mr()}const B=lC(this.expr.params[1]).evaluate(e,t);switch(B.type){case"ARRAY":break;case"NULL":a=!0;break;default:return BC.mr()}if(a)return BC.gr();const c=(null==(r=null==(n=B.value)?void 0:n.arrayValue)?void 0:r.values)??[],u=(null==(i=null==(s=o.value)?void 0:s.arrayValue)?void 0:i.values)??[];for(const l of u)for(const e of c)switch(iB(l)&&iB(e)?"EQ":DC(l,e)){case"EQ":return BC.newValue(jo);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":a=!0;break;default:La(60403,{value:l,search:e})}return a?BC.gr():BC.newValue(Ko)}}class ZC{constructor(e){this.expr=e}evaluate(e,t){var n,r,s;ka(1===this.expr.params.length,38605);const i=lC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":return BC.gr();case"ARRAY":return BC.newValue({integerValue:`${(null==(s=null==(r=null==(n=i.value)?void 0:n.arrayValue)?void 0:r.values)?void 0:s.length)??0}`});default:return BC.mr()}}}class ed{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class td{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(1===this.expr.params.length,1508);const s=lC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":return BC.gr();case"BYTES":{const e=null==(n=s.value)?void 0:n.bytesValue;if("string"==typeof e){const t=wo.fromBase64String(e).toUint8Array();return t.reverse(),BC.newValue({bytesValue:wo.fromUint8Array(t).toBase64()})}return BC.newValue({bytesValue:new Uint8Array(e).reverse()})}case"STRING":{const e=null==(r=s.value)?void 0:r.stringValue,t=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(e),n=Array.from(t,e=>e.segment).reverse();return BC.newValue({stringValue:n.join("")})}default:return BC.mr()}}}class nd{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class rd{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class sd{constructor(e){this.expr=e}evaluate(e,t){ka(1===this.expr.params.length,19400);const n=lC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return BC.gr();case"STRING":{const e=function(e){let t=0;for(let n=0;n<e.length;n++){const r=e.codePointAt(n);if(void 0===r)return;if(r<=65535)if(r>=55296&&r<=57343)if(r<=56319){const r=e.codePointAt(n+1);void 0!==r&&r>=56320&&r<=57343?(t+=1,n++):t+=1}else t+=1;else t+=1;else{if(!(r<=1114111))return;t+=1,n++}}return t}(n.value.stringValue);return void 0===e?BC.mr():BC.newValue({integerValue:e})}default:return BC.mr()}}}class id{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(1===this.expr.params.length,8486);const s=lC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"BYTES":{const e=null==(n=s.value)?void 0:n.bytesValue;return"string"==typeof e?BC.newValue({integerValue:wo.fromBase64String(e).toUint8Array().length}):BC.newValue({integerValue:new Uint8Array(e).length})}case"STRING":{const e=function(e){let t=0;for(let n=0;n<e.length;n++){const r=e.codePointAt(n);if(void 0===r)return;if(r>=55296&&r<=57343){if(!(r<=56319))return;{const r=e.codePointAt(n+1);if(void 0===r||!(r>=56320&&r<=57343))return;t+=4,n++}}else if(r<=127)t+=1;else if(r<=2047)t+=2;else if(r<=65535)t+=3;else{if(!(r<=1114111))return;t+=4,n++}}return t}(null==(r=s.value)?void 0:r.stringValue);return void 0===e?BC.mr():BC.newValue({integerValue:e})}case"NULL":return BC.gr();default:return BC.mr()}}}class ad{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(2===this.expr.params.length,39773,`${this.expr.name}() function should have exactly two parameters`);let s=!1;const i=lC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":s=!0;break;default:return BC.mr()}const a=lC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"STRING":break;case"NULL":s=!0;break;default:return BC.mr()}return s?BC.gr():this.Or(null==(n=i.value)?void 0:n.stringValue,null==(r=a.value)?void 0:r.stringValue)}}class od extends ad{Or(e,t){try{const n=function(e){let t="";for(let n=0;n<e.length;n++){const r=e.charAt(n);switch(r){case"_":t+=".";break;case"%":t+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":t+="\\"+r;break;default:t+=r}}return"^"+t+"$"}(t),r=_a.compile(n);return BC.newValue({booleanValue:r.matches(e)})}catch(n){return Sa(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),BC.mr()}}}class Bd extends ad{Or(e,t){try{const n=_a.compile(t);return BC.newValue({booleanValue:n.test(e)})}catch(n){return Sa(`Invalid regex pattern found in regex_contains: ${t}, returning error`),BC.mr()}}}class cd extends ad{Or(e,t){try{return BC.newValue({booleanValue:_a.compile(t).matches(e)})}catch(n){return Sa(`Invalid regex pattern found in regex_match: ${t}, returning error`),BC.mr()}}}class ud extends ad{Or(e,t){return BC.newValue({booleanValue:e.includes(t)})}}class ld extends ad{Or(e,t){return BC.newValue({booleanValue:e.startsWith(t)})}}class hd extends ad{Or(e,t){return BC.newValue({booleanValue:e.endsWith(t)})}}class Cd{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(1===this.expr.params.length,29079);const s=lC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return BC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.toLowerCase()});case"NULL":return BC.gr();default:return BC.mr()}}}class dd{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(1===this.expr.params.length,60487);const s=lC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return BC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.toUpperCase()});case"NULL":return BC.gr();default:return BC.mr()}}}class pd{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(1===this.expr.params.length,28544);const s=lC(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":return BC.newValue({stringValue:null==(r=null==(n=s.value)?void 0:n.stringValue)?void 0:r.trim()});case"NULL":return BC.gr();default:return BC.mr()}}}class fd{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map(n=>lC(n).evaluate(e,t));let r="",s=!1;for(const i of n)switch(i.type){case"STRING":r+=i.value.stringValue;break;case"NULL":s=!0;break;default:return BC.mr()}return s?BC.gr():BC.newValue({stringValue:r})}}class gd{constructor(e){this.expr=e}evaluate(e,t){var n,r,s,i;ka(2===this.expr.params.length,4483);const a=lC(this.expr.params[0]).evaluate(e,t);switch(a.type){case"UNSET":return BC.pr();case"MAP":break;default:return BC.mr()}const o=lC(this.expr.params[1]).evaluate(e,t);if("STRING"!==o.type)return BC.mr();const B=null==(i=null==(r=null==(n=a.value)?void 0:n.mapValue)?void 0:r.fields)?void 0:i[null==(s=o.value)?void 0:s.stringValue];return void 0===B?BC.pr():BC.newValue(B)}}class md{constructor(e){this.expr=e}evaluate(e,t){var n,r;ka(2===this.expr.params.length,25231,`${this.expr.name}() function should have exactly 2 params`);let s=!1;const i=lC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":s=!0;break;default:return BC.mr()}const a=lC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"VECTOR":break;case"NULL":s=!0;break;default:return BC.mr()}if(s)return BC.gr();const o=cB(i.value),B=cB(a.value);if(void 0===o||void 0===B||(null==(n=o.values)?void 0:n.length)!==(null==(r=B.values)?void 0:r.length))return BC.mr();const c=this.Mr(o,B);return void 0===c||isNaN(c)?BC.mr():BC.newValue({doubleValue:c})}}class Ed extends md{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return;let s=0,i=0,a=0;for(let B=0;B<n.length;B++){if(!rB(n[B])||!rB(r[B]))return;const e=pC(n[B]),t=pC(r[B]);s+=e*t,i+=e*e,a+=t*t}const o=Math.sqrt(i)*Math.sqrt(a);return 0!==o?1-Math.max(-1,Math.min(1,s/o)):void 0}}class Dd extends md{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return 0;let s=0;for(let i=0;i<n.length;i++){if(!rB(n[i])||!rB(r[i]))return;s+=pC(n[i])*pC(r[i])}return s}}class wd extends md{Mr(e,t){const n=(null==e?void 0:e.values)??[],r=(null==t?void 0:t.values)??[];if(0===n.length)return 0;let s=0;for(let i=0;i<n.length;i++){if(!rB(n[i])||!rB(r[i]))return;const e=pC(n[i]),t=pC(r[i]);s+=Math.pow(e-t,2)}return Math.sqrt(s)}}class yd{constructor(e){this.expr=e}evaluate(e,t){var n;ka(1===this.expr.params.length,39044);const r=lC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const e=cB(r.value);return BC.newValue({integerValue:(null==(n=null==e?void 0:e.values)?void 0:n.length)??0})}case"NULL":return BC.gr();default:return BC.mr()}}}const vd=BigInt(-62135596800),_d=BigInt(253402300799),Id=BigInt(1e3),Td=BigInt(1e6),bd=vd*Id,Ad=_d*Id+BigInt(999),Od=vd*Td,Nd=_d*Td+BigInt(999999);function Sd(e){return e>=Od&&e<=Nd}function Fd(e){return e>=vd&&e<=_d}function Ld(e,t){const n=BigInt(e);return!(n<vd||n>_d||t<0||t>=1e9||n===vd&&0!==t||n===_d&&t>999999999)}function Rd(e,t){return t<0?{seconds:e-1,nanos:t+1e9}:{seconds:e,nanos:t}}function kd(e){return BigInt(e.seconds)*Td+BigInt(Math.trunc(e.nanoseconds/1e3))}class Pd{constructor(e){this.expr=e}evaluate(e,t){ka(1===this.expr.params.length,49262,`${this.expr.name}() function should have exactly one parameter`);const n=lC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return BC.gr();default:return BC.mr()}}}class xd extends Pd{toTimestamp(e){if(!Sd(e))return BC.mr();let t=Number(e/Td),n=Number(e%Td*BigInt(1e3));const r=Rd(t,n);return t=r.seconds,n=r.nanos,Ld(t,n)?BC.newValue({timestampValue:{seconds:t,nanos:n}}):BC.mr()}}class Md extends Pd{toTimestamp(e){if(!((t=e)>=bd&&t<=Ad))return BC.mr();var t;let n=Number(e/Id),r=Number(e%Id*BigInt(1e6));const s=Rd(n,r);return n=s.seconds,r=s.nanos,Ld(n,r)?BC.newValue({timestampValue:{seconds:n,nanos:r}}):BC.mr()}}class Gd extends Pd{toTimestamp(e){if(!Fd(e))return BC.mr();const t=Number(e);return BC.newValue({timestampValue:{seconds:t,nanos:0}})}}class Hd{constructor(e){this.expr=e}evaluate(e,t){ka(1===this.expr.params.length,1265,`${this.expr.name}() function should have exactly one parameter`);const n=lC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return BC.gr();default:return BC.mr()}const r=wu(n.value.timestampValue);return Ld(r.seconds,r.nanoseconds)?this.Nr(r):BC.mr()}}class Ud extends Hd{Nr(e){const t=kd(e);return Sd(t)?BC.newValue({integerValue:`${t.toString()}`}):BC.mr()}}class Vd extends Hd{Nr(e){const t=kd(e),n=t/BigInt(1e3),r=t%BigInt(1e3);return n>BigInt(0)||r===BigInt(0)?BC.newValue({integerValue:n.toString()}):BC.newValue({integerValue:(n-BigInt(1)).toString()})}}class Jd extends Hd{Nr(e){const t=BigInt(e.seconds);return Fd(t)?BC.newValue({integerValue:t.toString()}):BC.mr()}}class jd{constructor(e){this.expr=e}evaluate(e,t){ka(3===this.expr.params.length,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const r=lC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return BC.mr()}const s=lC(this.expr.params[1]).evaluate(e,t);let i;switch(s.type){case"STRING":if(i=function(e){switch(e){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(s.value.stringValue),void 0===i)return BC.mr();break;case"NULL":n=!0;break;default:return BC.mr()}const a=lC(this.expr.params[2]).evaluate(e,t);switch(a.type){case"INT":break;case"NULL":n=!0;break;default:return BC.mr()}if(n)return BC.gr();const o=BigInt(a.value.integerValue);let B;try{switch(i){case"microsecond":B=o;break;case"millisecond":B=o*BigInt(1e3);break;case"second":B=o*BigInt(1e6);break;case"minute":B=o*BigInt(6e7);break;case"hour":B=o*BigInt(36e8);break;case"day":B=o*BigInt(864e8);break;default:return BC.mr()}if("microsecond"!==i&&o!==BigInt(0)&&B/o!==BigInt(this.Lr(i)))return BC.mr()}catch(f){return Sa(`Error during timestamp arithmetic: ${f}`),BC.mr()}const c=wu(r.value.timestampValue);if(!Ld(c.seconds,c.nanoseconds))return BC.mr();const u=kd(c),l=this.Br(u,B);if(!Sd(l))return BC.mr();const h=Number(l/Td),C=l%Td,d=Number((C<0?C+Td:C)*BigInt(1e3)),p=C<0?h-1:h;return Ld(p,d)?BC.newValue({timestampValue:{seconds:p,nanos:d}}):BC.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class Kd extends jd{Br(e,t){return e+t}}class qd extends jd{Br(e,t){return e-t}}function zd(e){if((e=uC(e))instanceof Fh)return`fld(${e.fieldName})`;if(e instanceof Lh)return`cst(${t=e.value,null===t?"null":"number"==typeof t?t.toString():"string"==typeof t?`"${t}"`:t instanceof $l?`ref(${t.path})`:t instanceof th?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})`;var t;if(e instanceof Ph)return`fn(${e.name},[${e.params.map(zd).join(",")}])`;if("ListOfExpressions"===e.expressionType)return`list([${e.cr.map(zd).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(e,null,2)}`)}function Qd(e){return`${Array.from(e.entries()).sort().map(([e,t])=>`${e}=${zd(t)}`).join(",")}`}function Yd(e){return e.stages.map(e=>function(e){if(e instanceof Jh)return`${e._name}(${Qd(e.fields)})`;if(e instanceof jh){let t=`${e._name}(${Qd(e.accumulators)})`;return e.groups.size>0&&(t+=`grouping(${Qd(e.groups)})`),t}if(e instanceof Kh)return`${e._name}(${Qd(e.groups)})`;if(e instanceof qh)return`${e._name}(${e.hr})`;if(e instanceof zh)return`${e._name}(${e.collectionId})`;if(e instanceof Qh)return`${e._name}()`;if(e instanceof Yh)return`${e._name}(${e.Tr.sort()})`;if(e instanceof Wh)return`${e._name}(${zd(e.condition)})`;if(e instanceof $h)return`${e._name}(${e.limit})`;if(e instanceof eC)return`${e._name}(${t=e.orderings,t.map(e=>`${zd(e.expr)}${e.direction}`).join(",")})`;var t;throw new Error(`Unrecognized stage ${e._name}`)}(e)).join("|")}function Wd(e,t){return Yd(e)===Yd(t)}function $d(e){return e instanceof rC}function Xd(e){return $d(e)?Yd(e):Lc(e)}function Zd(e){return $d(e)?Yd(e):`${vc(Sc(t=e))}|lt:${t.limitType}`;var t}function ep(e,t){return e instanceof rC&&t instanceof rC?Wd(e,t):!(e instanceof rC&&!(t instanceof rC)||!(e instanceof rC)&&t instanceof rC)&&function(e,t){return _c(Sc(e),Sc(t))&&e.limitType===t.limitType}(e,t)}function tp(e){return Ic(e)?Yd(e):vc(e)}function np(e,t){return e instanceof rC&&t instanceof rC?Wd(e,t):!(e instanceof rC&&!(t instanceof rC)||!(e instanceof rC)&&t instanceof rC)&&_c(e,t)}
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
 */class rp{constructor(e,t,n,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const t=this.mutations[r];t.key.isEqual(e.key)&&MB(t,e,n[r])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=GB(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=GB(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Qc();return this.mutations.forEach(r=>{const s=e.get(r.key),i=s.overlayedDocument;let a=this.applyToLocalView(i,s.mutatedFields);a=t.has(r.key)?null:a;const o=xB(i,a);null!==o&&n.set(r.key,o),i.isValidDocument()||i.convertToNoDocument(fc.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Xc())}isEqual(e){return this.batchId===e.batchId&&ja(this.mutations,e.mutations,(e,t)=>UB(e,t))&&ja(this.baseMutations,e.baseMutations,(e,t)=>UB(e,t))}}class sp{constructor(e,t,n,r){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=r}static from(e,t,n){ka(e.mutations.length===n.length,58842,{Ur:e.mutations.length,kr:n.length});let r=function(){return Wc}();const s=e.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new sp(e,t,n,r)}}
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
 */function ip(e,t){let n=t;const r=e.length;for(let s=0;s<r;s++){const t=e.charAt(s);switch(t){case"\0":n+="";break;case"":n+="";break;default:n+=t}}return n}function ap(e){return e+""}
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
 */class op{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
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
 */class Bp{constructor(e,t,n,r,s=fc.min(),i=fc.min(),a=wo.EMPTY_BYTE_STRING,o=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=a,this.expectedCount=o}withSequenceNumber(e){return new Bp(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Bp(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Bp(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Bp(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
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
 */class cp{constructor(e){this.$r=e}}function up(e){const t=Pu({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?Fc(t,t.limit,"L"):t}
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
 */class lp{constructor(){this.Zi=new hp}addToCollectionParentIndex(e,t){return this.Zi.add(t),Ml.resolve()}getCollectionParents(e,t){return Ml.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return Ml.resolve()}deleteFieldIndex(e,t){return Ml.resolve()}deleteAllFieldIndexes(e){return Ml.resolve()}createTargetIndexes(e,t){return Ml.resolve()}getDocumentsMatchingTarget(e,t){return Ml.resolve(null)}getIndexType(e,t){return Ml.resolve(0)}getFieldIndexes(e,t){return Ml.resolve([])}getNextCollectionGroupToUpdate(e){return Ml.resolve(null)}getMinOffset(e,t){return Ml.resolve(Ec.min())}getMinOffsetFromCollectionGroup(e,t){return Ml.resolve(Ec.min())}updateCollectionGroup(e,t,n){return Ml.resolve()}updateIndexEntries(e,t){return Ml.resolve()}}class hp{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t]||new Qa(eo.comparator),s=!r.has(n);return this.index[t]=r.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t];return r&&r.has(n)}getEntries(e){return(this.index[e]||new Qa(eo.comparator)).toArray()}}
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
 */class Cp{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new Cp(0)}static bs(){return new Cp(-1)}}
// Copyright 2024 Google LLC* @license
function dp(e,t){var n;let r=t;for(const s of e.stages)r=fp({serializer:e.serializer,serverTimestampBehavior:null==(n=e.listenOptions)?void 0:n.serverTimestampBehavior},s,r);return r}function pp(e,t){return dp(e,[t]).length>0}function fp(e,t,n){if(t instanceof qh)return r=t,n.filter(e=>e.isFoundDocument()&&`/${e.key.getCollectionPath().canonicalString()}`===r.hr);var r;if(t instanceof Wh)return function(e,t,n){return n.filter(n=>{const r=cC(lC(t.condition).evaluate(e,n));return void 0!==r&&zo(r,jo)})}(e,t,n);if(t instanceof zh)return function(e,t,n){return n.filter(e=>e.isFoundDocument()&&e.key.getCollectionPath().lastSegment()===t.collectionId)}(0,t,n);if(t instanceof Qh)return function(e,t,n){return n.filter(e=>e.isFoundDocument())}(0,0,n);if(t instanceof Yh)return function(e,t,n){return n.filter(e=>e.isFoundDocument()&&t.Pr.has(e.key.path.toStringWithLeadingSlash()))}(0,t,n);if(t instanceof $h)return function(e,t,n){return n.slice(0,t.limit)}(0,t,n);if(t instanceof eC)return function(e,t,n){const r=t.orderings.map(e=>({Ms:lC(e.expr),direction:e.direction}));return[...n].sort((t,n)=>{for(const{Ms:s,direction:i}of r){const r=cC(s.evaluate(e,t)),a=cC(s.evaluate(e,n)),o=Yo(r??Jo,a??Jo);if(0!==o)return"ascending"===i?o:-o}return 0})}(e,t,n);throw new Error(`Unknown stage: ${t._name}`)}function gp(e){const t=function(e){for(let t=e.stages.length-1;t>=0;t--){const n=e.stages[t];if(n instanceof eC)return n.orderings}throw new Error("Pipeline must contain at least one Sort stage")}(e);return(n,r)=>{for(const s of t){const t=cC(lC(s.expr).evaluate({serializer:e.serializer},n)),i=cC(lC(s.expr).evaluate({serializer:e.serializer},r)),a=Yo(t||Jo,i||Jo);if(0!==a)return"ascending"===s.direction?a:-a}return 0}}function mp(e){for(let t=e.stages.length-1;t>=0;t--){const n=e.stages[t];if(n instanceof $h)return{limit:n.limit}}}
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
 */class Ep{constructor(){this.changes=new Uc(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,gc.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return void 0!==n?Ml.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
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
 */class Dp{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}
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
 */class wp{constructor(e,t,n,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(r=>(n=r,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==n&&GB(n.mutation,e,ro.empty(),Eo.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,Xc()).next(()=>t))}getLocalViewOfDocuments(e,t,n=Xc()){const r=zc();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,n).next(e=>{let t=Kc();return e.forEach((e,n)=>{t=t.insert(e,n.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){const n=zc();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,Xc()))}populateOverlays(e,t,n){const r=[];return n.forEach(e=>{t.has(e)||r.push(e)}),this.documentOverlayCache.getOverlays(e,r).next(e=>{e.forEach((e,n)=>{t.set(e,n)})})}computeViews(e,t,n,r){let s=Jc();const i=Yc(),a=Yc();return t.forEach((e,t)=>{const a=n.get(t.key);r.has(t.key)&&(void 0===a||a.mutation instanceof JB)?s=s.insert(t.key,t):void 0!==a?(i.set(t.key,a.mutation.getFieldMask()),GB(a.mutation,t,a.mutation.getFieldMask(),Eo.now())):i.set(t.key,ro.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>a.set(e,new Dp(t,i.get(e)??null))),a))}recalculateAndSaveOverlays(e,t){const n=Yc();let r=new Ka((e,t)=>e-t),s=Xc();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(const s of e)s.keys().forEach(e=>{const i=t.get(e);if(null===i)return;let a=n.get(e)||ro.empty();a=s.applyToLocalView(i,a),n.set(e,a);const o=(r.get(s.batchId)||Xc()).add(e);r=r.insert(s.batchId,o)})}).next(()=>{const i=[],a=r.getReverseIterator();for(;a.hasNext();){const r=a.getNext(),o=r.key,B=r.value,c=Qc();B.forEach(e=>{if(!s.has(e)){const r=xB(t.get(e),n.get(e));null!==r&&c.set(e,r),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,o,c))}return Ml.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,n,r){return $d(t)?this.getDocumentsMatchingPipeline(e,t,n,r):function(e){return oo.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):function(e){return null!==e.collectionGroup}(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,r):this.getDocumentsMatchingCollectionQuery(e,t,n,r)}getNextDocuments(e,t,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,r).next(s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,r-s.size):Ml.resolve(zc());let a=-1,o=s;return i.next(t=>Ml.forEach(t,(t,n)=>(a<n.largestBatchId&&(a=n.largestBatchId),s.get(t)?Ml.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{o=o.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,o,t,Xc())).next(e=>({batchId:a,changes:qc(e)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new oo(t)).next(e=>{let t=Kc();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,n,r){const s=t.collectionGroup;let i=Kc();return this.indexManager.getCollectionParents(e,s).next(a=>Ml.forEach(a,a=>{const o=(B=t,c=a.child(s),new bc(c,null,B.explicitOrderBy.slice(),B.filters.slice(),B.limit,B.limitType,B.startAt,B.endAt));var B,c;return this.getDocumentsMatchingCollectionQuery(e,o,n,r).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r))).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>Rc(t,e)))}getDocumentsMatchingPipeline(e,t,n,r){if("collection_group"===sC(t)){const s=aC(t);let i=Kc();return this.indexManager.getCollectionParents(e,s).next(a=>Ml.forEach(a,a=>{const o=function(e,t){const n=e.stages.map(e=>e instanceof zh?new qh(t.canonicalString(),{}):e);return new rC(e.serializer,n)}(t,a.child(s));return this.getDocumentsMatchingPipeline(e,o,n,r).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}{let s;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next(i=>{switch(s=i,sC(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r);case"documents":let i=Xc();for(const e of oC(t))i=i.add(oo.fromPath(e));return this.remoteDocumentCache.getEntries(e,i);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new $a("invalid-argument",`Invalid pipeline source to execute offline: ${Yd(t)}`)}}).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>pp(t,e)))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach((e,n)=>{const r=n.getKey();null===t.get(r)&&(t=t.insert(r,gc.newInvalidDocument(r)))});let r=Kc();return t.forEach((t,s)=>{const i=e.get(t);void 0!==i&&GB(i.mutation,s,ro.empty(),Eo.now()),n(s)&&(r=r.insert(t,s))}),r}getOverlaysForPipeline(e,t,n){switch(sC(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,eo.fromString(iC(t)),n);case"collection_group":throw new $a("invalid-argument",`Unexpected collection group pipeline: ${Yd(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,oC(t).map(e=>oo.fromPath(e)));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new $a("invalid-argument",`Failed to get overlays for pipeline: ${Yd(t)}`)}}}
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
 */class yp{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return Ml.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,{id:(n=t).id,version:n.version,createTime:_u(n.createTime)}),Ml.resolve();var n}getNamedQuery(e,t){return Ml.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,{name:(n=t).name,query:up(n.bundledQuery),readTime:_u(n.readTime)}),Ml.resolve();var n}}
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
 */class vp{constructor(){this.overlays=new Ka(oo.comparator),this.Gs=new Map}getOverlay(e,t){return Ml.resolve(this.overlays.get(t))}getOverlays(e,t){const n=zc();return Ml.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&n.set(t,e)})).next(()=>n)}getAllOverlays(e,t){const n=zc();return this.overlays.forEach((e,r)=>{r.largestBatchId>t&&n.set(e,r)}),Ml.resolve(n)}saveOverlays(e,t,n){return n.forEach((n,r)=>{this.Zr(e,t,r)}),Ml.resolve()}removeOverlaysForBatchId(e,t,n){const r=this.Gs.get(n);return void 0!==r&&(r.forEach(e=>this.overlays=this.overlays.remove(e)),this.Gs.delete(n)),Ml.resolve()}getOverlaysForCollection(e,t,n){const r=zc(),s=t.length+1,i=new oo(t.child("")),a=this.overlays.getIteratorFrom(i);for(;a.hasNext();){const e=a.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>n&&r.set(e.getKey(),e)}return Ml.resolve(r)}getOverlaysForCollectionGroup(e,t,n,r){let s=new Ka((e,t)=>e-t);const i=this.overlays.getIterator();for(;i.hasNext();){const e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>n){let t=s.get(e.largestBatchId);null===t&&(t=zc(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}const a=zc(),o=s.getIterator();for(;o.hasNext()&&(o.getNext().value.forEach((e,t)=>a.set(e,t)),!(a.size()>=r)););return Ml.resolve(a)}Zr(e,t,n){const r=this.overlays.get(n.key);if(null!==r){const e=this.Gs.get(r.largestBatchId).delete(n.key);this.Gs.set(r.largestBatchId,e)}this.overlays=this.overlays.insert(n.key,new op(t,n));let s=this.Gs.get(t);void 0===s&&(s=Xc(),this.Gs.set(t,s)),this.Gs.set(t,s.add(n.key))}}
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
 */class _p{constructor(){this.sessionToken=wo.EMPTY_BYTE_STRING}getSessionToken(e){return Ml.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,Ml.resolve()}}
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
 */class Ip{constructor(){this.zs=new Qa(Tp.js),this.Hs=new Qa(Tp.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const n=new Tp(e,t);this.zs=this.zs.add(n),this.Hs=this.Hs.add(n)}Ys(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Zs(new Tp(e,t))}Xs(e,t){e.forEach(e=>this.removeReference(e,t))}e_(e){const t=new oo(new eo([])),n=new Tp(t,e),r=new Tp(t,e+1),s=[];return this.Hs.forEachInRange([n,r],e=>{this.Zs(e),s.push(e.key)}),s}t_(){this.zs.forEach(e=>this.Zs(e))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new oo(new eo([])),n=new Tp(t,e),r=new Tp(t,e+1);let s=Xc();return this.Hs.forEachInRange([n,r],e=>{s=s.add(e.key)}),s}containsKey(e){const t=new Tp(e,0),n=this.zs.firstAfterOrEqual(t);return null!==n&&e.isEqual(n.key)}}class Tp{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return oo.comparator(e.key,t.key)||Ga(e.r_,t.r_)}static Js(e,t){return Ga(e.r_,t.r_)||oo.comparator(e.key,t.key)}}
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
 */class bp{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new Qa(Tp.js)}checkEmpty(e){return Ml.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,n,r){const s=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new rp(s,t,n,r);this.mutationQueue.push(i);for(const a of r)this.i_=this.i_.add(new Tp(a.key,s)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return Ml.resolve(i)}lookupMutationBatch(e,t){return Ml.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=this.__(n),s=r<0?0:r;return Ml.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return Ml.resolve(0===this.mutationQueue.length?-1:this.Gr-1)}getAllMutationBatches(e){return Ml.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new Tp(t,0),r=new Tp(t,Number.POSITIVE_INFINITY),s=[];return this.i_.forEachInRange([n,r],e=>{const t=this.s_(e.r_);s.push(t)}),Ml.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new Qa(Ga);return t.forEach(e=>{const t=new Tp(e,0),r=new Tp(e,Number.POSITIVE_INFINITY);this.i_.forEachInRange([t,r],e=>{n=n.add(e.r_)})}),Ml.resolve(this.o_(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1;let s=n;oo.isDocumentKey(s)||(s=s.child(""));const i=new Tp(new oo(s),0);let a=new Qa(Ga);return this.i_.forEachWhile(e=>{const t=e.key.path;return!!n.isPrefixOf(t)&&(t.length===r&&(a=a.add(e.r_)),!0)},i),Ml.resolve(this.o_(a))}o_(e){const t=[];return e.forEach(e=>{const n=this.s_(e);null!==n&&t.push(n)}),t}removeMutationBatch(e,t){ka(0===this.a_(t.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.i_;return Ml.forEach(t.mutations,r=>{const s=new Tp(r.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.i_=n})}Hr(e){}containsKey(e,t){const n=new Tp(t,0),r=this.i_.firstAfterOrEqual(n);return Ml.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,Ml.resolve()}a_(e,t){return this.__(e)}__(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}
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
 */class Ap{constructor(e){this.u_=e,this.docs=new Ka(oo.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,r=this.docs.get(n),s=r?r.size:0,i=this.u_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return Ml.resolve(n?n.document.mutableCopy():gc.newInvalidDocument(t))}getEntries(e,t){let n=Jc();return t.forEach(e=>{const t=this.docs.get(e);n=n.insert(e,t?t.document.mutableCopy():gc.newInvalidDocument(e))}),Ml.resolve(n)}getAllEntries(e){let t=Jc();return this.docs.forEach((e,n)=>{t=t.insert(e,n.document)}),Ml.resolve(t)}getDocumentsMatchingQuery(e,t,n,r){let s,i;$d(t)?(s=eo.fromString(iC(t)),i=e=>pp(t,e)):(s=t.path,i=e=>Rc(t,e));let a=Jc();const o=new oo(s.child("__id-9223372036854775808__")),B=this.docs.getIteratorFrom(o);for(;B.hasNext();){const{key:e,value:{document:t}}=B.getNext();if(!s.isPrefixOf(e.path))break;e.path.length>s.length+1||Dc(mc(t),n)<=0||(r.has(t.key)||i(t))&&(a=a.insert(t.key,t.mutableCopy()))}return Ml.resolve(a)}getAllFromCollectionGroup(e,t,n,r){La(9500)}c_(e,t){return Ml.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new Op(this)}getSize(e){return Ml.resolve(this.size)}}class Op extends Ep{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?t.push(this.$s.addEntry(e,r)):this.$s.removeEntry(n)}),Ml.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}
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
 */class Np{constructor(e){this.persistence=e,this.l_=new Uc(e=>tp(e),np),this.lastRemoteSnapshotVersion=fc.min(),this.highestTargetId=0,this.E_=0,this.h_=new Ip,this.targetCount=0,this.T_=Cp.ws()}forEachTarget(e,t){return this.l_.forEach((e,n)=>t(n)),Ml.resolve()}getLastRemoteSnapshotVersion(e){return Ml.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return Ml.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),Ml.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.E_&&(this.E_=t),Ml.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new Cp(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,Ml.resolve()}updateTargetData(e,t){return this.Ds(t),Ml.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,Ml.resolve()}removeTargets(e,t,n){let r=0;const s=[];return this.l_.forEach((i,a)=>{a.sequenceNumber<=t&&null===n.get(a.targetId)&&(this.l_.delete(i),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),r++)}),Ml.waitFor(s).next(()=>r)}getTargetCount(e){return Ml.resolve(this.targetCount)}getTargetData(e,t){const n=this.l_.get(t)||null;return Ml.resolve(n)}addMatchingKeys(e,t,n){return this.h_.Ys(t,n),Ml.resolve()}removeMatchingKeys(e,t,n){this.h_.Xs(t,n);const r=this.persistence.referenceDelegate,s=[];return r&&t.forEach(t=>{s.push(r.markPotentiallyOrphaned(e,t))}),Ml.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),Ml.resolve()}getMatchingKeysForTargetId(e,t){const n=this.h_.n_(t);return Ml.resolve(n)}containsKey(e,t){return Ml.resolve(this.h_.containsKey(t))}}
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
 */class Sp{constructor(e,t){this.P_={},this.overlays={},this.I_=new kl(0),this.R_=!1,this.R_=!0,this.A_=new _p,this.referenceDelegate=e(this),this.V_=new Np(this),this.indexManager=new lp,this.remoteDocumentCache=new Ap(e=>this.referenceDelegate.d_(e)),this.serializer=new cp(t),this.f_=new yp(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vp,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.P_[e.toKey()];return n||(n=new bp(t,this.referenceDelegate),this.P_[e.toKey()]=n),n}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,n){Oa("MemoryPersistence","Starting transaction:",e);const r=new Fp(this.I_.next());return this.referenceDelegate.m_(),n(r).next(e=>this.referenceDelegate.p_(r).next(()=>e)).toPromise().then(e=>(r.raiseOnCommittedEvent(),e))}g_(e,t){return Ml.or(Object.values(this.P_).map(n=>()=>n.containsKey(e,t)))}}class Fp extends Pl{constructor(e){super(),this.currentSequenceNumber=e}}class Lp{constructor(e){this.persistence=e,this.y_=new Ip,this.w_=null}static b_(e){return new Lp(e)}get S_(){if(this.w_)return this.w_;throw La(60996)}addReference(e,t,n){return this.y_.addReference(n,t),this.S_.delete(n.toString()),Ml.resolve()}removeReference(e,t,n){return this.y_.removeReference(n,t),this.S_.add(n.toString()),Ml.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),Ml.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach(e=>this.S_.add(e.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.S_.add(e.toString()))}).next(()=>n.removeTargetData(e,t))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return Ml.forEach(this.S_,n=>{const r=oo.fromPath(n);return this.v_(e,r).next(e=>{e||t.removeEntry(r,fc.min())})}).next(()=>(this.w_=null,t.apply(e)))}updateLimboDocument(e,t){return this.v_(e,t).next(e=>{e?this.S_.delete(t.toString()):this.S_.add(t.toString())})}d_(e){return 0}v_(e,t){return Ml.or([()=>Ml.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class Rp{constructor(e,t){this.persistence=e,this.D_=new Uc(e=>function(e){let t="";for(let n=0;n<e.length;n++)t.length>0&&(t=ap(t)),t=ip(e.get(n),t);return ap(t)}(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=function(e,t){return new jl(e,t)}(this,t)}static b_(e,t){return new Rp(e,t)}m_(){}p_(e){return Ml.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}Cs(e){let t=0;return this.sr(e,e=>{t++}).next(()=>t)}sr(e,t){return Ml.forEach(this.D_,(n,r)=>this.Os(e,n,r).next(e=>e?Ml.resolve():t(r)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.c_(e,r=>this.Os(e,r,t).next(e=>{e||(n++,s.removeEntry(r,fc.min()))})).next(()=>s.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),Ml.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.D_.set(n,e.currentSequenceNumber),Ml.resolve()}removeReference(e,t,n){return this.D_.set(n,e.currentSequenceNumber),Ml.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),Ml.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=eB(e.data.value)),t}Os(e,t,n){return Ml.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const e=this.D_.get(t);return Ml.resolve(void 0!==e&&e>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}
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
 */class kp{constructor(e,t,n,r){this.targetId=e,this.fromCache=t,this.Vo=n,this.fo=r}static mo(e,t){let n=Xc(),r=Xc();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new kp(e,t.fromCache,n,r)}}
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
 */function Pp(e,t){return oo.comparator(e.key,t.key)}
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
 */class xp{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
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
 */class Mp{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=A()?8:function(e){const t=e.match(/Android ([\d.]+)/i),n=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(n)}(b())>0?6:4}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,n,r){const s={result:null};return this.vo(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.Do(e,t,r,n).next(e=>{s.result=e})}).next(()=>{if(s.result)return;const n=new xp;return this.xo(e,t,n).next(r=>{if(s.result=r,this.yo)return this.Co(e,t,n,r.size)})}).next(()=>s.result)}Co(e,t,n,r){return $d(t)?Ml.resolve():n.documentReadCount<this.wo?(ba()<=K.DEBUG&&Oa("QueryEngine","SDK will not create cache indexes for query:",Lc(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),Ml.resolve()):(ba()<=K.DEBUG&&Oa("QueryEngine","Query:",Lc(t),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.bo*r?(ba()<=K.DEBUG&&Oa("QueryEngine","The SDK decides to create cache indexes for query:",Lc(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Sc(t))):Ml.resolve())}vo(e,t){if($d(t))return Ml.resolve(null);let n=t;if(Oc(n))return Ml.resolve(null);let r=Sc(n);return this.indexManager.getIndexType(e,r).next(t=>0===t?null:(null!==n.limit&&1===t&&(n=Fc(n,null,"F"),r=Sc(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(t=>{const s=Xc(...t);return this.So.getDocuments(e,s).next(t=>this.indexManager.getMinOffset(e,r).next(r=>{const i=this.Fo(n,t);return this.Oo(n,i,s,r.readTime)?this.vo(e,Fc(n,null,"F")):this.Mo(e,i,n,r)}))})))}Do(e,t,n,r){return($d(t)?function(e){for(const t of e.stages){if(t instanceof $h||t instanceof Xh)return!1;if(t instanceof Wh){if(t.condition instanceof Mh&&"exists"===t.condition._expr.name&&t.condition._expr.params[0]instanceof Fh&&t.condition._expr.params[0].fieldName===Xa)continue;return!1}}return!0}(t):Oc(t))||r.isEqual(fc.min())?Ml.resolve(null):this.So.getDocuments(e,n).next(s=>{const i=this.Fo(t,s);return this.Oo(t,i,n,r)?Ml.resolve(null):(ba()<=K.DEBUG&&Oa("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Xd(t)),this.Mo(e,i,t,function(e,t){const n=e.toTimestamp().seconds,r=e.toTimestamp().nanoseconds+1,s=fc.fromTimestamp(1e9===r?new Eo(n+1,0):new Eo(n,r));return new Ec(s,oo.empty(),t)}(r,-1)).next(e=>e))})}Fo(e,t){let n,r;return $d(e)?(n=new Qa(Pp),r=t=>pp(e,t)):(n=new Qa(kc(e)),r=t=>Rc(e,t)),t.forEach((e,t)=>{r(t)&&(n=n.add(t))}),n}Oo(e,t,n,r){if($d(e))return e.stages.some(e=>e instanceof $h||e instanceof Xh);if(null===e.limit)return!1;if(n.size!==t.size)return!0;const s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}xo(e,t,n){return ba()<=K.DEBUG&&Oa("QueryEngine","Using full collection scan to execute query:",Xd(t)),this.So.getDocumentsMatchingQuery(e,t,Ec.min(),n)}Mo(e,t,n,r){return this.So.getDocumentsMatchingQuery(e,n,r).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}
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
 */const Gp="LocalStore";class Hp{constructor(e,t,n,r){this.persistence=e,this.No=t,this.serializer=r,this.Lo=new Ka(Ga),this.Bo=new Uc(e=>tp(e),np),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(n)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new wp(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Lo))}}async function Up(e,t){const n=Pa(e);return await n.persistence.runTransaction("Handle user change","readonly",e=>{let r;return n.mutationQueue.getAllMutationBatches(e).next(s=>(r=s,n.qo(t),n.mutationQueue.getAllMutationBatches(e))).next(t=>{const s=[],i=[];let a=Xc();for(const e of r){s.push(e.batchId);for(const t of e.mutations)a=a.add(t.key)}for(const e of t){i.push(e.batchId);for(const t of e.mutations)a=a.add(t.key)}return n.localDocuments.getDocuments(e,a).next(e=>({$o:e,removedBatchIds:s,addedBatchIds:i}))})})}function Vp(e){const t=Pa(e);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.V_.getLastRemoteSnapshotVersion(e))}function Jp(e,t){const n=Pa(e),r=t.snapshotVersion;let s=n.Lo;return n.persistence.runTransaction("Apply remote event","readwrite-primary",e=>{const i=n.ko.newChangeBuffer({trackRemovals:!0});s=n.Lo;const a=[];t.targetChanges.forEach((i,o)=>{const B=s.get(o);if(!B)return;a.push(n.V_.removeMatchingKeys(e,i.removedDocuments,o).next(()=>n.V_.addMatchingKeys(e,i.addedDocuments,o)));let c=B.withSequenceNumber(e.currentSequenceNumber);null!==t.targetMismatches.get(o)?c=c.withResumeToken(wo.EMPTY_BYTE_STRING,fc.min()).withLastLimboFreeSnapshotVersion(fc.min()):i.resumeToken.approximateByteSize()>0&&(c=c.withResumeToken(i.resumeToken,r)),s=s.insert(o,c),function(e,t,n){if(0===e.resumeToken.approximateByteSize())return!0;if(t.snapshotVersion.toMicroseconds()-e.snapshotVersion.toMicroseconds()>=3e8)return!0;return n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0}(B,c,i)&&a.push(n.V_.updateTargetData(e,c))});let o=Jc(),B=Xc();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&a.push(n.persistence.referenceDelegate.updateLimboDocument(e,r))}),a.push(function(e,t,n){let r=Xc(),s=Xc();return n.forEach(e=>r=r.add(e)),t.getEntries(e,r).next(e=>{let r=Jc();return n.forEach((n,i)=>{const a=e.get(n);i.isFoundDocument()!==a.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(fc.min())?(t.removeEntry(n,i.readTime),r=r.insert(n,i)):!a.isValidDocument()||i.version.compareTo(a.version)>0||0===i.version.compareTo(a.version)&&a.hasPendingWrites?(t.addEntry(i),r=r.insert(n,i)):Oa(Gp,"Ignoring outdated watch update for ",n,". Current version:",a.version," Watch version:",i.version)}),{Ko:r,Qo:s}})}(e,i,t.documentUpdates).next(e=>{o=e.Ko,B=e.Qo})),!r.isEqual(fc.min())){const t=n.V_.getLastRemoteSnapshotVersion(e).next(t=>n.V_.setTargetsMetadata(e,e.currentSequenceNumber,r));a.push(t)}return Ml.waitFor(a).next(()=>i.apply(e)).next(()=>n.localDocuments.getLocalViewOfDocuments(e,o,B)).next(()=>o)}).then(e=>(n.Lo=s,e))}function jp(e,t){const n=Pa(e);return n.persistence.runTransaction("Get next mutation batch","readonly",e=>(void 0===t&&(t=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(e,t)))}async function Kp(e,t,n){const r=Pa(e),s=r.Lo.get(t),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,e=>r.persistence.referenceDelegate.removeTarget(e,s))}catch(a){if(!Gl(a))throw a;Oa(Gp,`Failed to update sequence numbers for target ${t}: ${a}`)}r.Lo=r.Lo.remove(t),r.Bo.delete(s.target)}function qp(e,t,n){const r=Pa(e);let s=fc.min(),i=Xc();return r.persistence.runTransaction("Execute query","readwrite",e=>function(e,t,n){const r=Pa(e),s=r.Bo.get(n);return void 0!==s?Ml.resolve(r.Lo.get(s)):r.V_.getTargetData(t,n)}(r,e,$d(t)?t:Sc(t)).next(t=>{if(t)return s=t.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(e,t.targetId).next(e=>{i=e})}).next(()=>r.No.getDocumentsMatchingQuery(e,t,n?s:fc.min(),n?i:Xc())).next(e=>(function(e,t){t.forEach((t,n)=>{const r=n.key.getCollectionGroup(),s=e.Uo.get(r)||fc.min();n.readTime.compareTo(s)>0&&e.Uo.set(r,n.readTime)})}
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
 */(r,e),{documents:e,Wo:i})))}class zp{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){0===this.Yo&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve())))}ra(e){"Online"===this.state?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,"Online"===e&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?(Na(t),this.Xo=!1):Oa("OnlineStateTracker",t)}ia(){null!==this.Zo&&(this.Zo.cancel(),this.Zo=null)}}
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
 */const Qp="RemoteStore";class Yp{constructor(e,t,n,r,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new Cp(1e3),this.ca=new Cp(1001),this.la=new Set,this.Ea=[],this.ha=s,this.ha.Qe(e=>{n.enqueueAndForget(async()=>{af(this)&&(Oa(Qp,"Restarting streams for network reachability change."),await async function(e){const t=Pa(e);t.la.add(4),await $p(t),t.Ta.set("Unknown"),t.la.delete(4),await Wp(t)}(this))})}),this.Ta=new zp(n,r)}}async function Wp(e){if(af(e))for(const t of e.Ea)await t(!0)}async function $p(e){for(const t of e.Ea)await t(!1)}function Xp(e,t){return e.oa.get(t)||void 0}function Zp(e,t){const n=Pa(e),r=Xp(n,t.targetId);if(void 0!==r&&n._a.has(r))return;const s=function(e,t){const n=Xp(e,t);void 0!==n&&e.aa.delete(n);const r=(s=e,t%2!=0?s.ca.next():s.ua.next());var s;return e.oa.set(t,r),e.aa.set(r,t),r}(n,t.targetId);Oa(Qp,"remoteStoreListen mapping SDK target ID to remote",t.targetId,s);const i=new Bp(t.target,s,t.purpose,t.sequenceNumber,t.snapshotVersion,t.lastLimboFreeSnapshotVersion,t.resumeToken);n._a.set(s,i),sf(n)?rf(n):_f(n).Yt()&&tf(n,i)}function ef(e,t){const n=Pa(e),r=_f(n),s=Xp(n,t);Oa(Qp,"remoteStoreUnlisten removing mapping of SDK target ID to remote",t,s),n._a.delete(s),n.oa.delete(t),n.aa.delete(s),r.Yt()&&nf(n,s),0===n._a.size&&(r.Yt()?r.en():af(n)&&n.Ta.set("Unknown"))}function tf(e,t){if(e.Pa.J(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(fc.min())>0){const n=e.aa.get(t.targetId);if(void 0===n)return void Oa(Qp,"SDK target ID not found for remote ID: "+t.targetId);const r=e.remoteSyncer.getRemoteKeysForTarget(n).size;t=t.withExpectedCount(r)}_f(e).Pn(t)}function nf(e,t){e.Pa.J(t),_f(e).In(t)}function rf(e){e.Pa=new hu({getRemoteKeysForTarget:t=>{const n=e.aa.get(t);return void 0!==n?e.remoteSyncer.getRemoteKeysForTarget(n):Xc()},ye:t=>e._a.get(t)||null,Ve:()=>e.datastore.serializer.databaseId}),_f(e).start(),e.Ta.ea()}function sf(e){return af(e)&&!_f(e).Jt()&&e._a.size>0}function af(e){return 0===Pa(e).la.size}function of(e){e.Pa=void 0}async function Bf(e){e.Ta.set("Online")}async function cf(e){e._a.forEach((t,n)=>{tf(e,t)})}async function uf(e,t){of(e),sf(e)?(e.Ta.ra(t),rf(e)):e.Ta.set("Unknown")}async function lf(e,t,n){if(e.Ta.set("Online"),t instanceof cu&&2===t.state&&t.cause)try{await async function(e,t){const n=t.cause;for(const r of t.targetIds){if(e._a.has(r)){const t=e.aa.get(r);void 0!==t&&(await e.remoteSyncer.rejectListen(t,n),e.oa.delete(t),e.aa.delete(r)),e._a.delete(r)}e.Pa.removeTarget(r)}}(e,t)}catch(r){Oa(Qp,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await hf(e,r)}else if(t instanceof ou?e.Pa._e(t):t instanceof Bu?e.Pa.he(t):e.Pa.ue(t),!n.isEqual(fc.min()))try{const t=await Vp(e.localStore);n.compareTo(t)>=0&&await function(e,t){const n=e.Pa.fe(t);n.targetChanges.forEach((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=e._a.get(r);s&&e._a.set(r,s.withResumeToken(n.resumeToken,t))}}),n.targetMismatches.forEach((t,n)=>{const r=e._a.get(t);if(!r)return;e._a.set(t,r.withResumeToken(wo.EMPTY_BYTE_STRING,r.snapshotVersion)),nf(e,t);const s=new Bp(r.target,t,n,r.sequenceNumber);tf(e,s)});const r=function(e,t){const n=new Map;t.targetChanges.forEach((t,r)=>{const s=e.aa.get(r);void 0!==s&&n.set(s,t)});let r=new Ka(Ga);return t.targetMismatches.forEach((t,n)=>{const s=e.aa.get(t);void 0!==s&&(r=r.insert(s,n))}),new iu(t.snapshotVersion,n,r,t.documentUpdates,t.augmentedDocumentUpdates,t.resolvedLimboDocuments)}(e,n);return e.remoteSyncer.applyRemoteEvent(r)}(e,n)}catch(s){Oa(Qp,"Failed to raise snapshot:",s),await hf(e,s)}}async function hf(e,t,n){if(!Gl(t))throw t;e.la.add(1),await $p(e),e.Ta.set("Offline"),n||(n=()=>Vp(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{Oa(Qp,"Retrying IndexedDB access"),await n(),e.la.delete(1),await Wp(e)})}function Cf(e,t){return t().catch(n=>hf(e,n,t))}async function df(e){const t=Pa(e),n=If(t);let r=t.sa.length>0?t.sa[t.sa.length-1].batchId:-1;for(;pf(t);)try{const e=await jp(t.localStore,r);if(null===e){0===t.sa.length&&n.en();break}r=e.batchId,ff(t,e)}catch(s){await hf(t,s)}gf(t)&&mf(t)}function pf(e){return af(e)&&e.sa.length<10}function ff(e,t){e.sa.push(t);const n=If(e);n.Yt()&&n.Rn&&n.An(t.mutations)}function gf(e){return af(e)&&!If(e).Jt()&&e.sa.length>0}function mf(e){If(e).start()}async function Ef(e){If(e).fn()}async function Df(e){const t=If(e);for(const n of e.sa)t.An(n.mutations)}async function wf(e,t,n){const r=e.sa.shift(),s=sp.from(r,t,n);await Cf(e,()=>e.remoteSyncer.applySuccessfulWrite(s)),await df(e)}async function yf(e,t){t&&If(e).Rn&&await async function(e,t){if(function(e){switch(e){case Wa.OK:return La(64938);case Wa.CANCELLED:case Wa.UNKNOWN:case Wa.DEADLINE_EXCEEDED:case Wa.RESOURCE_EXHAUSTED:case Wa.INTERNAL:case Wa.UNAVAILABLE:case Wa.UNAUTHENTICATED:return!1;case Wa.INVALID_ARGUMENT:case Wa.NOT_FOUND:case Wa.ALREADY_EXISTS:case Wa.PERMISSION_DENIED:case Wa.FAILED_PRECONDITION:case Wa.ABORTED:case Wa.OUT_OF_RANGE:case Wa.UNIMPLEMENTED:case Wa.DATA_LOSS:return!0;default:return La(15467,{code:e})}}(n=t.code)&&n!==Wa.ABORTED){const n=e.sa.shift();If(e).Xt(),await Cf(e,()=>e.remoteSyncer.rejectFailedWrite(n.batchId,t)),await df(e)}var n}(e,t),gf(e)&&mf(e)}async function vf(e,t){const n=Pa(e);n.asyncQueue.verifyOperationInProgress(),Oa(Qp,"RemoteStore received new credentials");const r=af(n);n.la.add(3),await $p(n),r&&n.Ta.set("Unknown"),await n.remoteSyncer.handleCredentialChange(t),n.la.delete(3),await Wp(n)}function _f(e){return e.Ia||(e.Ia=function(e,t,n){const r=Pa(e);return r.pn(),new bl(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{ct:Bf.bind(null,e),Et:cf.bind(null,e),Tt:uf.bind(null,e),Tn:lf.bind(null,e)}),e.Ea.push(async t=>{t?(e.Ia.Xt(),sf(e)?rf(e):e.Ta.set("Unknown")):(await e.Ia.stop(),of(e))})),e.Ia}function If(e){return e.Ra||(e.Ra=function(e,t,n){const r=Pa(e);return r.pn(),new Al(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{ct:()=>Promise.resolve(),Et:Ef.bind(null,e),Tt:yf.bind(null,e),Vn:Df.bind(null,e),dn:wf.bind(null,e)}),e.Ea.push(async t=>{t?(e.Ra.Xt(),await df(e)):(await e.Ra.stop(),e.sa.length>0&&(Oa(Qp,`Stopping write stream with ${e.sa.length} pending writes`),e.sa=[]))})),e.Ra
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
 */}class Tf{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):Na("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout(()=>{this.muted||e(t)},0)}}
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
 */class bf{constructor(e,t,n,r,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new nl,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,r,s){const i=Date.now()+n,a=new bf(e,t,i,r,s);return a.start(n),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new $a(Wa.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Af(e,t){if(Na("AsyncQueue",`${t}: ${e}`),Gl(e))return new $a(Wa.UNAVAILABLE,`${t}: ${e}`);throw e}class Of{constructor(){this.activeTargetIds=Zc}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Nf{constructor(){this.fu=new Of,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,n){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new Of,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function Sf(){return"undefined"!=typeof document?document:null}
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
 */class Ff{static emptySet(e){return new Ff(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||oo.comparator(t.key,n.key):(e,t)=>oo.comparator(e.key,t.key),this.keyedMap=Kc(),this.sortedSet=new Ka(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ff))return!1;if(this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(!e.isEqual(r))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){const n=new Ff;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}
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
 */class Lf{constructor(){this.pu=new Ka(oo.comparator)}track(e){const t=e.doc.key,n=this.pu.get(t);n?0!==e.type&&3===n.type?this.pu=this.pu.insert(t,e):3===e.type&&1!==n.type?this.pu=this.pu.insert(t,{type:n.type,doc:e.doc}):2===e.type&&2===n.type?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):2===e.type&&0===n.type?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):1===e.type&&0===n.type?this.pu=this.pu.remove(t):1===e.type&&2===n.type?this.pu=this.pu.insert(t,{type:1,doc:n.doc}):0===e.type&&1===n.type?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):La(63341,{we:e,gu:n}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal((t,n)=>{e.push(n)}),e}}class Rf{constructor(e,t,n,r,s,i,a,o,B){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=a,this.excludesMetadataChanges=o,this.hasCachedResults=B}static fromInitialDocuments(e,t,n,r,s){const i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new Rf(e,t,Ff.emptySet(t),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ep(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==n[r].type||!t[r].doc.isEqual(n[r].doc))return!1;return!0}}
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
 */class kf{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some(e=>e.vu())}}class Pf{constructor(){this.queries=xf(),this.onlineState="Unknown",this.Du=new Set}terminate(){!function(e,t){const n=Pa(e),r=n.queries;n.queries=xf(),r.forEach((e,n)=>{for(const r of n.bu)r.onError(t)})}(this,new $a(Wa.ABORTED,"Firestore shutting down"))}}function xf(){return new Uc(e=>Zd(e),ep)}function Mf(e,t){const n=Pa(e);let r=!1;for(const s of t){const e=s.query,t=n.queries.get(e);if(t){for(const e of t.bu)e.Cu(s)&&(r=!0);t.wu=s}}r&&Hf(n)}function Gf(e,t,n){const r=Pa(e),s=r.queries.get(t);if(s)for(const i of s.bu)i.onError(n);r.queries.delete(t)}function Hf(e){e.Du.forEach(e=>{e.next()})}var Uf,Vf;(Vf=Uf||(Uf={})).Default="default",Vf.Cache="cache";class Jf{constructor(e,t,n){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=n||{}}Cu(e){if(!this.options.includeMetadataChanges){const t=[];for(const n of e.docChanges)3!==n.type&&t.push(n);e=new Rf(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache)return!0;if(!this.vu())return!0;const n="Offline"!==t;return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}Bu(e){e=Rf.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==Uf.Cache}}
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
 */class jf{constructor(e){this.key=e}}class Kf{constructor(e){this.key=e}}class qf{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=Xc(),this.mutatedKeys=Xc(),this.Ju=$d(e)?gp(e):kc(e),this.Yu=new Ff(this.Ju)}get Zu(){return this.zu}Xu(e,t){const n=t?t.ec:new Lf,r=t?t.Yu:this.Yu;let s=t?t.mutatedKeys:this.mutatedKeys,i=r,a=!1;const[o,B]=this.tc(this.query,r);e.inorderTraversal((e,t)=>{const c=r.get(e),u=function(e,t){return $d(e)?pp(e,t):Rc(e,t)}(this.query,t)?t:null,l=!!c&&this.mutatedKeys.has(c.key),h=!!u&&(u.hasLocalMutations||this.mutatedKeys.has(u.key)&&u.hasCommittedMutations);let C=!1;c&&u?c.data.isEqual(u.data)?l!==h&&(n.track({type:3,doc:u}),C=!0):this.nc(c,u)||(n.track({type:2,doc:u}),C=!0,(o&&this.Ju(u,o)>0||B&&this.Ju(u,B)<0)&&(a=!0)):!c&&u?(n.track({type:0,doc:u}),C=!0):c&&!u&&(n.track({type:1,doc:c}),C=!0,(o||B)&&(a=!0)),C&&(u?(i=i.add(u),s=h?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))});const c=this.rc(this.query);if(c)if($d(this.query)){const e=[];i.forEach(t=>e.push(t));const t=dp(this.query,e);let r=new Ff(gp(this.query));for(const n of t)r=r.add(n);i.forEach(e=>{r.has(e.key)||(s=s.delete(e.key),n.track({type:1,doc:e}))}),i=r}else{const e=this.sc(this.query);for(;i.size>c;){const t="F"===e?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),n.track({type:1,doc:t})}}return{Yu:i,ec:n,Oo:a,mutatedKeys:s}}rc(e){var t;return $d(e)?null==(t=mp(e))?void 0:t.limit:e.limit||void 0}sc(e){if($d(e)){const t=mp(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var n;if($d(e)){const r=null==(n=mp(e))?void 0:n.limit;return[t.size===r?t.last():null,null]}return["F"===e.limitType&&t.size===this.rc(this.query)?t.last():null,"L"===e.limitType&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,r){const s=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const i=e.ec.yu();i.sort((e,t)=>function(e,t){const n=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return La(20277,{we:e})}};return n(e)-n(t)}(e.type,t.type)||this.Ju(e.doc,t.doc)),this._c(n),r=r??!1;const a=t&&!r?this.oc():[],o=0===this.Hu.size&&this.current&&!r?1:0,B=o!==this.ju;return this.ju=o,0!==i.length||B?{snapshot:new Rf(this.query,e.Yu,s,i,e.mutatedKeys,0===o,B,!1,!!n&&n.resumeToken.approximateByteSize()>0),ac:a}:{ac:a}}xu(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new Lf,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach(e=>this.zu=this.zu.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.zu=this.zu.delete(e)),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=Xc(),this.Yu.forEach(e=>{this.uc(e.key)&&(this.Hu=this.Hu.add(e.key))});const t=[];return e.forEach(e=>{this.Hu.has(e)||t.push(new Kf(e))}),this.Hu.forEach(n=>{e.has(n)||t.push(new jf(n))}),t}cc(e){this.zu=e.Wo,this.Hu=Xc();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return Rf.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,0===this.ju,this.hasCachedResults)}}const zf="SyncEngine";class Qf{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class Yf{constructor(e){this.key=e,this.Ec=!1}}class Wf{constructor(e,t,n,r,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.hc={},this.Tc=new Uc(e=>Zd(e),ep),this.Pc=new Map,this.Ic=new Set,this.Rc=new Ka(oo.comparator),this.Ac=new Map,this.Vc=new Ip,this.dc={},this.fc=new Map,this.mc=Cp.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return!0===this.gc}}async function $f(e,t,n=!0){const r=mg(e);let s;const i=r.Tc.get(t);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=await Zf(r,t,n,!0),s}async function Xf(e,t){const n=mg(e);await Zf(n,t,!0,!1)}async function Zf(e,t,n,r){const s=await function(e,t){const n=Pa(e);return n.persistence.runTransaction("Allocate target","readwrite",e=>{let r;return n.V_.getTargetData(e,t).next(s=>s?(r=s,Ml.resolve(r)):n.V_.allocateTargetId(e).next(s=>(r=new Bp(t,s,"TargetPurposeListen",e.currentSequenceNumber),n.V_.addTargetData(e,r).next(()=>r))))}).then(e=>{const r=n.Lo.get(e.targetId);return(null===r||e.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Lo=n.Lo.insert(e.targetId,e),n.Bo.set(t,e.targetId)),e})}(e.localStore,$d(t)?t:Sc(t)),i=s.targetId,a=e.sharedClientState.addLocalQueryTarget(i,n);let o;return r&&(o=await async function(e,t,n,r,s){e.yc=(t,n,r)=>async function(e,t,n,r){let s=t.view.Xu(n);s.Oo&&(s=await qp(e.localStore,t.query,!1).then(({documents:e})=>t.view.Xu(e,s)));const i=r&&r.targetChanges.get(t.targetId),a=r&&null!=r.targetMismatches.get(t.targetId),o=t.view.applyChanges(s,e.isPrimaryClient,i,a);return hg(e,t.targetId,o.ac),o.snapshot}(e,t,n,r);const i=await qp(e.localStore,t,!0),a=new qf(t,i.Wo),o=a.Xu(i.documents),B=au.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==e.onlineState,s),c=a.applyChanges(o,e.isPrimaryClient,B);hg(e,n,c.ac);const u=new Qf(t,n,a);return e.Tc.set(t,u),e.Pc.has(n)?e.Pc.get(n).push(t):e.Pc.set(n,[t]),c.snapshot}(e,t,i,"current"===a,s.resumeToken)),e.isPrimaryClient&&n&&Zp(e.remoteStore,s),o}async function eg(e,t,n){const r=Pa(e),s=r.Tc.get(t),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter(e=>!ep(e,t))),void r.Tc.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Kp(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&ef(r.remoteStore,s.targetId),ug(r,s.targetId)}).catch(xl)):(ug(r,s.targetId),await Kp(r.localStore,s.targetId,!0))}async function tg(e,t){const n=Pa(e),r=n.Tc.get(t),s=n.Pc.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),ef(n.remoteStore,r.targetId))}async function ng(e,t,n){const r=function(e){const t=Pa(e);return t.remoteStore.remoteSyncer.applySuccessfulWrite=ag.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=og.bind(null,t),t}(e);try{const e=await function(e,t){const n=Pa(e),r=Eo.now(),s=t.reduce((e,t)=>e.add(t.key),Xc());let i,a;return n.persistence.runTransaction("Locally write mutations","readwrite",e=>{let o=Jc(),B=Xc();return n.ko.getEntries(e,s).next(e=>{o=e,o.forEach((e,t)=>{t.isValidDocument()||(B=B.add(e))})}).next(()=>n.localDocuments.getOverlayedDocuments(e,o)).next(s=>{i=s;const a=[];for(const e of t){const t=HB(e,i.get(e.key).overlayedDocument);null!=t&&a.push(new JB(e.key,t,hB(t.value.mapValue),RB.exists(!0)))}return n.mutationQueue.addMutationBatch(e,r,a,t)}).next(t=>{a=t;const r=t.applyToLocalDocumentSet(i,B);return n.documentOverlayCache.saveOverlays(e,t.batchId,r)})}).then(()=>({batchId:a.batchId,changes:qc(i)}))}(r.localStore,t);r.sharedClientState.addPendingMutation(e.batchId),function(e,t,n){let r=e.dc[e.currentUser.toKey()];r||(r=new Ka(Ga)),r=r.insert(t,n),e.dc[e.currentUser.toKey()]=r}(r,e.batchId,n),await pg(r,e.changes),await df(r.remoteStore)}catch(s){const e=Af(s,"Failed to persist write");n.reject(e)}}async function rg(e,t){const n=Pa(e);try{const e=await Jp(n.localStore,t);t.targetChanges.forEach((e,t)=>{const r=n.Ac.get(t);r&&(ka(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1,22616),e.addedDocuments.size>0?r.Ec=!0:e.modifiedDocuments.size>0?ka(r.Ec,14607):e.removedDocuments.size>0&&(ka(r.Ec,42227),r.Ec=!1))}),await pg(n,e,t)}catch(r){await xl(r)}}function sg(e,t,n){const r=Pa(e);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const e=[];r.Tc.forEach((n,r)=>{const s=r.view.xu(t);s.snapshot&&e.push(s.snapshot)}),function(e,t){const n=Pa(e);n.onlineState=t;let r=!1;n.queries.forEach((e,n)=>{for(const s of n.bu)s.xu(t)&&(r=!0)}),r&&Hf(n)}(r.eventManager,t),e.length&&r.hc.Tn(e),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function ig(e,t,n){const r=Pa(e);r.sharedClientState.updateQueryState(t,"rejected",n);const s=r.Ac.get(t),i=s&&s.key;if(i){let e=new Ka(oo.comparator);e=e.insert(i,gc.newNoDocument(i,fc.min()));const n=Xc().add(i),s=new iu(fc.min(),new Map,new Ka(Ga),e,Jc(),n);await rg(r,s),r.Rc=r.Rc.remove(i),r.Ac.delete(t),dg(r)}else await Kp(r.localStore,t,!1).then(()=>ug(r,t,n)).catch(xl)}async function ag(e,t){const n=Pa(e),r=t.batch.batchId;try{const e=await function(e,t){const n=Pa(e);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{const r=t.batch.keys(),s=n.ko.newChangeBuffer({trackRemovals:!0});return function(e,t,n,r){const s=n.batch,i=s.keys();let a=Ml.resolve();return i.forEach(e=>{a=a.next(()=>r.getEntry(t,e)).next(t=>{const i=n.docVersions.get(e);ka(null!==i,48541),t.version.compareTo(i)<0&&(s.applyToRemoteDocument(t,n),t.isValidDocument()&&(t.setReadTime(n.commitVersion),r.addEntry(t)))})}),a.next(()=>e.mutationQueue.removeMutationBatch(t,s))}(n,e,t,s).next(()=>s.apply(e)).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=Xc();for(let n=0;n<e.mutationResults.length;++n)e.mutationResults[n].transformResults.length>0&&(t=t.add(e.batch.mutations[n].key));return t}(t))).next(()=>n.localDocuments.getDocuments(e,r))})}(n.localStore,t);cg(n,r,null),Bg(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await pg(n,e)}catch(s){await xl(s)}}async function og(e,t,n){const r=Pa(e);try{const e=await function(e,t){const n=Pa(e);return n.persistence.runTransaction("Reject batch","readwrite-primary",e=>{let r;return n.mutationQueue.lookupMutationBatch(e,t).next(t=>(ka(null!==t,37113),r=t.keys(),n.mutationQueue.removeMutationBatch(e,t))).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,r)).next(()=>n.localDocuments.getDocuments(e,r))})}(r.localStore,t);cg(r,t,n),Bg(r,t),r.sharedClientState.updateMutationState(t,"rejected",n),await pg(r,e)}catch(s){await xl(s)}}function Bg(e,t){(e.fc.get(t)||[]).forEach(e=>{e.resolve()}),e.fc.delete(t)}function cg(e,t,n){const r=Pa(e);let s=r.dc[r.currentUser.toKey()];if(s){const e=s.get(t);e&&(n?e.reject(n):e.resolve(),s=s.remove(t)),r.dc[r.currentUser.toKey()]=s}}function ug(e,t,n=null){e.sharedClientState.removeLocalQueryTarget(t);for(const r of e.Pc.get(t))e.Tc.delete(r),n&&e.hc.wc(r,n);e.Pc.delete(t),e.isPrimaryClient&&e.Vc.e_(t).forEach(t=>{e.Vc.containsKey(t)||lg(e,t)})}function lg(e,t){e.Ic.delete(t.path.canonicalString());const n=e.Rc.get(t);null!==n&&(ef(e.remoteStore,n),e.Rc=e.Rc.remove(t),e.Ac.delete(n),dg(e))}function hg(e,t,n){for(const r of n)r instanceof jf?(e.Vc.addReference(r.key,t),Cg(e,r)):r instanceof Kf?(Oa(zf,"Document no longer in limbo: "+r.key),e.Vc.removeReference(r.key,t),e.Vc.containsKey(r.key)||lg(e,r.key)):La(19791,{bc:r})}function Cg(e,t){const n=t.key,r=n.path.canonicalString();e.Rc.get(n)||e.Ic.has(r)||(Oa(zf,"New document in limbo: "+n),e.Ic.add(r),dg(e))}function dg(e){for(;e.Ic.size>0&&e.Rc.size<e.maxConcurrentLimboResolutions;){const t=e.Ic.values().next().value;e.Ic.delete(t);const n=new oo(eo.fromString(t)),r=e.mc.next();e.Ac.set(r,new Yf(n)),e.Rc=e.Rc.insert(n,r),Zp(e.remoteStore,new Bp(Sc(Ac(n.path)),r,"TargetPurposeLimboResolution",kl.wn))}}async function pg(e,t,n){const r=Pa(e),s=[],i=[],a=[];r.Tc.isEmpty()||(r.Tc.forEach((e,o)=>{a.push(r.yc(o,t,n).then(e=>{var t;if((e||n)&&r.isPrimaryClient){const s=e?!e.fromCache:null==(t=null==n?void 0:n.targetChanges.get(o.targetId))?void 0:t.current;r.sharedClientState.updateQueryState(o.targetId,s?"current":"not-current")}if(e){s.push(e);const t=kp.mo(o.targetId,e);i.push(t)}}))}),await Promise.all(a),r.hc.Tn(s),await async function(e,t){const n=Pa(e);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",e=>Ml.forEach(t,t=>Ml.forEach(t.Vo,r=>n.persistence.referenceDelegate.addReference(e,t.targetId,r)).next(()=>Ml.forEach(t.fo,r=>n.persistence.referenceDelegate.removeReference(e,t.targetId,r)))))}catch(r){if(!Gl(r))throw r;Oa(Gp,"Failed to update sequence numbers: "+r)}for(const s of t){const e=s.targetId;if(!s.fromCache){const t=n.Lo.get(e),r=t.snapshotVersion,s=t.withLastLimboFreeSnapshotVersion(r);n.Lo=n.Lo.insert(e,s)}}}(r.localStore,i))}async function fg(e,t){const n=Pa(e);if(!n.currentUser.isEqual(t)){Oa(zf,"User change. New user:",t.toKey());const e=await Up(n.localStore,t);n.currentUser=t,s="'waitForPendingWrites' promise is rejected due to a user change.",(r=n).fc.forEach(e=>{e.forEach(e=>{e.reject(new $a(Wa.CANCELLED,s))})}),r.fc.clear(),n.sharedClientState.handleUserChange(t,e.removedBatchIds,e.addedBatchIds),await pg(n,e.$o)}var r,s}function gg(e,t){const n=Pa(e),r=n.Ac.get(t);if(r&&r.Ec)return Xc().add(r.key);{let e=Xc();const r=n.Pc.get(t);if(!r)return e;for(const t of r??[]){const r=n.Tc.get(t);e=e.unionWith(r.view.Zu)}return e}}function mg(e){const t=Pa(e);return t.remoteStore.remoteSyncer.applyRemoteEvent=rg.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=gg.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=ig.bind(null,t),t.hc.Tn=Mf.bind(null,t.eventManager),t.hc.wc=Gf.bind(null,t.eventManager),t}class Eg{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Wu(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),await this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)}Cc(e,t){return null}Fc(e,t){return null}xc(e){return function(e,t,n,r){return new Hp(e,t,n,r)}(this.persistence,new Mp,e.initialUser,this.serializer)}Dc(e){return new Sp(Lp.b_,this.serializer)}vc(e){return new Nf}async terminate(){var e,t;null==(e=this.gcScheduler)||e.stop(),null==(t=this.indexBackfillerScheduler)||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Eg.provider={build:()=>new Eg};class Dg extends Eg{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){ka(this.persistence.referenceDelegate instanceof Rp,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new Jl(n,e.asyncQueue,t)}Dc(e){const t=void 0!==this.cacheSizeBytes?Rl.withCacheSize(this.cacheSizeBytes):Rl.DEFAULT;return new Sp(e=>Rp.b_(e,t),this.serializer)}}class wg{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>sg(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=fg.bind(null,this.syncEngine),await async function(e,t){const n=Pa(e);t?(n.la.delete(2),await Wp(n)):t||(n.la.add(2),await $p(n),n.Ta.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new Pf}createDatastore(e){const t=Wu(e.databaseInfo.databaseId),n=function(e){return new vl(e)}(e.databaseInfo);return function(e,t,n,r){return new Nl(e,t,n,r)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return t=this.localStore,n=this.datastore,r=e.asyncQueue,s=e=>sg(this.syncEngine,e,0),i=dl.Ye()?new dl:new hl,new Yp(t,n,r,s,i);var t,n,r,s,i}createSyncEngine(e,t){return function(e,t,n,r,s,i,a){const o=new Wf(e,t,n,r,s,i);return a&&(o.gc=!0),o}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(e){const t=Pa(e);Oa(Qp,"RemoteStore shutting down."),t.la.add(5),await $p(t),t.ha.shutdown(),t.Ta.set("Unknown")}(this.remoteStore),null==(e=this.datastore)||e.terminate(),null==(t=this.eventManager)||t.terminate()}}wg.provider={build:()=>new wg};
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
const yg="FirestoreClient";class vg{constructor(e,t,n,r,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=r,this.user=tl.UNAUTHENTICATED,this.clientId=Ma.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async e=>{Oa(yg,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(n,e=>(Oa(yg,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new nl;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Af(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function _g(e,t){e.asyncQueue.verifyOperationInProgress(),Oa(yg,"Initializing OfflineComponentProvider");const n=e.configuration;await t.initialize(n);let r=n.initialUser;e.setCredentialChangeListener(async e=>{r.isEqual(e)||(await Up(t.localStore,e),r=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function Ig(e,t){e.asyncQueue.verifyOperationInProgress();const n=await async function(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){Oa(yg,"Using user provided OfflineComponentProvider");try{await _g(e,e._uninitializedComponentsProvider._offline)}catch(t){const s=t;if(!("FirebaseError"===(n=s).name?n.code===Wa.FAILED_PRECONDITION||n.code===Wa.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&n instanceof DOMException)||22===n.code||20===n.code||11===n.code))throw s;Sa("Error using user provided cache. Falling back to memory cache: "+s),await _g(e,new Eg)}}else Oa(yg,"Using default OfflineComponentProvider"),await _g(e,new Dg(void 0));var n;return e._offlineComponents}(e);Oa(yg,"Initializing OnlineComponentProvider"),await t.initialize(n,e.configuration),e.setCredentialChangeListener(e=>vf(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,n)=>vf(t.remoteStore,n)),e._onlineComponents=t}async function Tg(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(Oa(yg,"Using user provided OnlineComponentProvider"),await Ig(e,e._uninitializedComponentsProvider._online)):(Oa(yg,"Using default OnlineComponentProvider"),await Ig(e,new wg))),e._onlineComponents}async function bg(e){const t=await Tg(e),n=t.eventManager;return n.onListen=$f.bind(null,t.syncEngine),n.onUnlisten=eg.bind(null,t.syncEngine),n.onFirstRemoteStoreListen=Xf.bind(null,t.syncEngine),n.onLastRemoteStoreUnlisten=tg.bind(null,t.syncEngine),n}function Ag(e,t,n={}){const r=new nl;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,r,s){const i=new Tf({next:o=>{i.Va(),t.enqueueAndForget(()=>async function(e,t){const n=Pa(e),r=t.query;let s=3;const i=n.queries.get(r);if(i){const e=i.bu.indexOf(t);e>=0&&(i.bu.splice(e,1),0===i.bu.length?s=t.vu()?0:1:!i.Su()&&t.vu()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}(e,a));const B=o.docs.has(n);!B&&o.fromCache?s.reject(new $a(Wa.UNAVAILABLE,"Failed to get document because the client is offline.")):B&&o.fromCache&&r&&"server"===r.source?s.reject(new $a(Wa.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(o)},error:e=>s.reject(e)}),a=new Jf(Ac(n.path),i,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return async function(e,t){const n=Pa(e);let r=3;const s=t.query;let i=n.queries.get(s);i?!i.Su()&&t.vu()&&(r=2):(i=new kf,r=t.vu()?0:1);try{switch(r){case 0:i.wu=await n.onListen(s,!0);break;case 1:i.wu=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const e=Af(a,`Initialization of query '${$d(t.query)?Yd(t.query):Lc(t.query)}' failed`);return void t.onError(e)}n.queries.set(s,i),i.bu.push(t),t.xu(n.onlineState),i.wu&&t.Cu(i.wu)&&Hf(n)}(e,a)}(await bg(e),e.asyncQueue,t,n,r)),r.promise}function Og(e,t){const n=new nl;return e.asyncQueue.enqueueAndForget(async()=>ng(await function(e){return Tg(e).then(e=>e.syncEngine)}(e),t,n)),n.promise
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
 */}let Ng=class{constructor(e,t,n,r,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new $l(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new Sg(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return(null==(e=this._document)?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(gh("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}},Sg=class extends Ng{data(){return super.data()}};
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
 */class Fg{convertValue(e,t="none"){switch(qo(e)){case 0:return null;case 1:return e.booleanValue;case 2:return _o(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Io(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw La(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return io(e,(e,r)=>{n[e]=this.convertValue(r,t)}),n}convertVectorValue(e){var t,n,r;const s=null==(r=null==(n=null==(t=e.fields)?void 0:t[Vo].arrayValue)?void 0:n.values)?void 0:r.map(e=>_o(e.doubleValue));return new th(s)}convertGeoPoint(e){return new el(_o(e.latitude),_o(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=So(e);return null==n?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Fo(e));default:return null}}convertTimestamp(e){const t=vo(e);return new Eo(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=eo.fromString(e);ka(qu(n),9688,{name:e});const r=new ko(n.get(1),n.get(3)),s=new oo(n.popFirst(5));return r.isEqual(t)||Na(`A document reference to ${s} refers to a different database (${r.projectId}/${r.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}
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
const Lg="AsyncQueue";class Rg{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new _l(this,"async_queue_retry"),this.Hc=()=>{const e=Sf();e&&Oa(Lg,"Visibility state changed to "+e.visibilityState),this.Ht.$t()},this.Jc=e;const t=Sf();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=Sf();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise(()=>{});const t=new nl;return this.Zc(()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.$c.push(e),this.Xc()))}async Xc(){if(0!==this.$c.length){try{await this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(Vf){if(!Gl(Vf))throw Vf;Oa(Lg,"Operation failed with retryable error: "+Vf)}this.$c.length>0&&this.Ht.kt(()=>this.Xc())}}Zc(e){const t=this.Jc.then(()=>(this.Gc=!0,e().catch(e=>{throw this.Wc=e,this.Gc=!1,Na("INTERNAL UNHANDLED ERROR: ",kg(e)),e}).then(e=>(this.Gc=!1,e))));return this.Jc=t,t}enqueueAfterDelay(e,t,n){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const r=bf.createAndSchedule(this,e,t,n,e=>this.el(e));return this.Qc.push(r),r}Yc(){this.Wc&&La(47125,{tl:kg(this.Wc)})}verifyOperationInProgress(){}async nl(){let e;do{e=this.Jc,await e}while(e!==this.Jc)}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then(()=>{this.Qc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs);for(const t of this.Qc)if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.nl()})}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function kg(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class Pg extends Ql{constructor(e,t,n,r){super(e,t,n,r),this.type="firestore",this._queue=new Rg,this._persistenceKey=(null==r?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Rg(e),this._firestoreClient=void 0,await e}}}function xg(e,t){const n="object"==typeof e?e:rt(),r="string"==typeof e?e:t||Ro,s=$e(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const e=(e=>{const t=v(e);if(!t)return;const n=t.lastIndexOf(":");if(n<=0||n+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(n+1),10);return"["===t[0]?[t.substring(1,n-1),r]:[t.substring(0,n),r]})("firestore");e&&Yl(s,...e)}return s}function Mg(e){if(e._terminated)throw new $a(Wa.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,n,r,s;const i=e._freezeSettings(),a=function(e,t,n,r,s){return new Lo(e,t,n,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,ll(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}(e._databaseId,(null==(t=e._app)?void 0:t.options.appId)||"",e._persistenceKey,null==(n=e._app)?void 0:n.options.apiKey,i);e._componentsProvider||(null==(r=i.localCache)?void 0:r._offlineComponentProvider)&&(null==(s=i.localCache)?void 0:s._onlineComponentProvider)&&(e._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),e._firestoreClient=new vg(e._authCredentials,e._appCheckCredentials,e._queue,a,e._componentsProvider&&function(e){const t=null==e?void 0:e._online.build();return{_offline:null==e?void 0:e._offline.build(t),_online:t}}(e._componentsProvider))}
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
 */(e),e._firestoreClient}class Gg extends Fg{constructor(e){super(),this.firestore=e}convertBytes(e){return new $u(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new $l(this.firestore,null,t)}}class Hg{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ug extends Ng{constructor(e,t,n,r,s,i){super(e,t,n,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Vg(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(gh("DocumentSnapshot.get",e));if(null!==n)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new $a(Wa.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Ug._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()?(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t):t}}Ug._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ug._jsonSchema={type:po("string",Ug._jsonSchemaVersion),bundleSource:po("string","DocumentSnapshot"),bundleName:po("string"),bundle:po("string")};class Vg extends Ug{data(e={}){return super.data(e)}}class Jg{constructor(e,t,n,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new Hg(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new Vg(this._firestore,this._userDataWriter,n.key,n,new Hg(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new $a(Wa.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(n=>{$d(e._snapshot.query)?gp(e._snapshot.query):kc(e.query._query);const r=new Vg(e._firestore,e._userDataWriter,n.doc.key,n.doc,new Hg(e._snapshot.mutatedKeys.has(n.doc.key),e._snapshot.fromCache),e.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:t++}})}{let n=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{const r=new Vg(e._firestore,e._userDataWriter,t.doc.key,t.doc,new Hg(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter);let s=-1,i=-1;return 0!==t.type&&(s=n.indexOf(t.doc.key),n=n.delete(t.doc.key)),1!==t.type&&(n=n.add(t.doc),i=n.indexOf(t.doc.key)),{type:jg(t.type),doc:r,oldIndex:s,newIndex:i}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new $a(Wa.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Jg._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ma.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],r=[];return this.docs.forEach(e=>{null!==e._document&&(t.push(e._document),n.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),r.push(e.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function jg(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return La(61501,{type:e})}}
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
function Kg(e){e=Co(e,$l);const t=Co(e.firestore,Pg);return Ag(Mg(t),e._key).then(n=>function(e,t,n){const r=n.docs.get(t._key),s=new Gg(e);return new Ug(e,s,t._key,r,new Hg(n.hasPendingWrites,n.fromCache),t.converter)}(t,e,n))}function qg(e,t,n){e=Co(e,$l);const r=Co(e.firestore,Pg),s=function(e,t,n){let r;return r=e?n&&(n.merge||n.mergeFields)?e.toFirestore(t,n):e.toFirestore(t):t,r}(e.converter,t,n);return Qg(r,[ch(Bh(r),"setDoc",e._key,s,null!==e.converter,n).toMutation(e._key,RB.none())])}function zg(e,t,n,...r){e=Co(e,$l);const s=Co(e.firestore,Pg),i=Bh(s);let a;return a="string"==typeof(t=M(t))||t instanceof Xu?function(e,t,n,r,s,i){const a=e.createContext(1,t,n),o=[gh(t,r,n)],B=[s];if(i.length%2!=0)throw new $a(Wa.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let h=0;h<i.length;h+=2)o.push(gh(t,i[h])),B.push(i[h+1]);const c=[],u=lB.empty();for(let h=o.length-1;h>=0;--h)if(!wh(c,o[h])){const e=o[h];let t=B[h];t=M(t);const n=a.childContextForFieldPath(e);if(t instanceof uh)c.push(e);else{const r=hh(t,n);null!=r&&(c.push(e),u.set(e,r))}}const l=new ro(c);return new sh(u,l,a.fieldTransforms)}(i,"updateDoc",e._key,t,n,r):function(e,t,n,r){const s=e.createContext(1,t,n);fh("Data must be an object, but it was:",s,r);const i=[],a=lB.empty();io(r,(e,r)=>{const o=Eh(t,e,n);r=M(r);const B=s.childContextForFieldPath(o);if(r instanceof uh)i.push(o);else{const e=hh(r,B);null!=e&&(i.push(o),a.set(o,e))}});const o=new ro(i);return new sh(a,o,s.fieldTransforms)}(i,"updateDoc",e._key,t),Qg(s,[a.toMutation(e._key,RB.exists(!0))])}function Qg(e,t){return Og(Mg(e),t)}Jg._jsonSchemaVersion="firestore/querySnapshot/1.0",Jg._jsonSchema={type:po("string",Jg._jsonSchemaVersion),bundleSource:po("string","QuerySnapshot"),bundleName:po("string"),bundle:po("string")};const Yg="@firebase/firestore",Wg="4.17.2";
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
!function(e,t=!0){(function(e){Ia=e})(tt),We(new U("firestore",(e,{instanceIdentifier:n,options:r})=>{const s=e.getProvider("app").getImmediate(),i=new Pg(new al(e.getProvider("auth-internal")),new ul(s,e.getProvider("app-check-internal")),function(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new $a(Wa.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ko(e.options.projectId,t)}
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
 */(s,n),s);return r={useFetchStreams:t,...r},i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),it(Yg,Wg,e),it(Yg,Wg,"esm2020")}();export{nr as G,rt as a,Ss as b,xg as c,eh as d,Kg as e,Zl as f,st as g,Zr as h,nt as i,mr as j,qg as k,vh as l,Br as m,Cr as n,gr as o,dr as p,fr as q,pr as r,Aa as s,zr as t,zg as u};
