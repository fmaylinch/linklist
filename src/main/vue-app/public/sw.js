"use strict";

console.log("sw.js: starting!");

const cacheName = "cacheV1";
const cacheFiles = [
  "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900",
  "https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css",
  // TODO: check if there are more external urls to cache
  "favicon.ico",
  "js/chunk-vendors.e7ba34d3.js",
  "css/chunk-vendors.e980fe4e.css",
  "index.html",
  "js/app.xxx.js", // This filename changes when js change
  "css/app.4d3a02eb.css"
];

self.addEventListener("install", event => {
  console.log("sw.js: install event");
  const preCache = async () => {
    const cache = await caches.open(cacheName);
    return cache.addAll(cacheFiles);
  };
  console.log("sw.js: caching files");
  event.waitUntil(preCache());
});

self.addEventListener("activate", event => {
  console.log("sw.js: activate event");
  const clearCache = async () => {
    const keys = await caches.keys();
    for (let k of keys) {
      if (k !== cacheName) {
        console.log("sw.js: removing cache key " + k);
        await caches.delete(k);
      }
    }
  };
  console.log("sw.js: removing old caches");
  event.waitUntil(clearCache());
});
