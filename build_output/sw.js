/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "service-worker.js",
    "revision": "59273d2549b4b707737ac8de6906aa6c"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "648883309d5de4525b9ae1da94be1fcc"
  }, {
    "url": "pwa-512x512.png",
    "revision": "71599ab92dac8653e6376b7d580def61"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8651729677c2a751a5c33a3a9cfe2331"
  }, {
    "url": "index.html",
    "revision": "be4e466715cb1fe9ba93890032b22f03"
  }, {
    "url": "icon.svg",
    "revision": "c4e4a0098930da2c87d0e9cbb2173dc2"
  }, {
    "url": "icon-512.png",
    "revision": "3a6b3e653a0da2c88429d398d6a99c38"
  }, {
    "url": "icon-192.png",
    "revision": "063dd47b84e20c56231562b340e926f6"
  }, {
    "url": "google9fb59f4571d8c5dc.html",
    "revision": "8c03beec1ba971f2eab5af326c237a6e"
  }, {
    "url": "firebase-messaging-sw.js",
    "revision": "254cca5331c586f2d553a880b58ddbf8"
  }, {
    "url": "favicon.ico",
    "revision": "55a98bd9670143b4df53cb2a013e2c3b"
  }, {
    "url": "favicon-32x32.png",
    "revision": "55a98bd9670143b4df53cb2a013e2c3b"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "3bed2b0539635090d00b588cd178ae30"
  }, {
    "url": "screenshots/mobile-720x1280.png",
    "revision": "d0e990dd662ecce044ab9b1d0fbd18b0"
  }, {
    "url": "screenshots/desktop-1280x720.png",
    "revision": "0e86052875849027aab2710429b9c395"
  }, {
    "url": "assets/vendor-xlsx-D9yR3_kW.js",
    "revision": null
  }, {
    "url": "assets/vendor-react-BhcwN3y-.js",
    "revision": null
  }, {
    "url": "assets/vendor-motion-B3xJhFIC.js",
    "revision": null
  }, {
    "url": "assets/vendor-icons-DEGNRlZD.js",
    "revision": null
  }, {
    "url": "assets/vendor-firebase-DhuY2J8G.js",
    "revision": null
  }, {
    "url": "assets/index-DQd_X7z1.css",
    "revision": null
  }, {
    "url": "assets/index-Bdg6iB-j.js",
    "revision": null
  }, {
    "url": "assets/competitorPriceExport-GW-5HCjV.js",
    "revision": null
  }, {
    "url": "assets/autoPricingEngineData-Dke87TOr.js",
    "revision": null
  }, {
    "url": "assets/ShippingOrdersTable-L7I4k3wH.js",
    "revision": null
  }, {
    "url": "assets/ShippingManagementDashboard-B52Wml7w.js",
    "revision": null
  }, {
    "url": "assets/ProfitCalculator-C4BusXs5.js",
    "revision": null
  }, {
    "url": "assets/PriceComparisonEngine-C8vzmcjV.js",
    "revision": null
  }, {
    "url": "assets/PlatformsGuideManager-mKWcAjgo.js",
    "revision": null
  }, {
    "url": "assets/PaymentModal-BeGeOcZJ.js",
    "revision": null
  }, {
    "url": "assets/OwnerDashboard-CuIUkE6x.js",
    "revision": null
  }, {
    "url": "assets/OnboardingTour-DJb9Io-Q.js",
    "revision": null
  }, {
    "url": "assets/LoginPage-B9PMFxIP.js",
    "revision": null
  }, {
    "url": "assets/LandingPage-DNPxEqqR.js",
    "revision": null
  }, {
    "url": "assets/HelpPage-C5x-TZd-.js",
    "revision": null
  }, {
    "url": "assets/AutoPricingEngine-DA3qWa_Z.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "3bed2b0539635090d00b588cd178ae30"
  }, {
    "url": "favicon.ico",
    "revision": "55a98bd9670143b4df53cb2a013e2c3b"
  }, {
    "url": "icon.svg",
    "revision": "c4e4a0098930da2c87d0e9cbb2173dc2"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8651729677c2a751a5c33a3a9cfe2331"
  }, {
    "url": "pwa-512x512.png",
    "revision": "71599ab92dac8653e6376b7d580def61"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "648883309d5de4525b9ae1da94be1fcc"
  }, {
    "url": "manifest.webmanifest",
    "revision": "ee35780fc6e501d7f9608b48386e42c3"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
