if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const t=e=>n(e,o),l={module:{uri:o},exports:c,require:t};i[o]=Promise.all(s.map((e=>l[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-8l40J2Dj.js",revision:null},{url:"assets/index-aOx3wkoT.css",revision:null},{url:"assets/potato-DEV6Cs4Y.ico",revision:null},{url:"icons/128.png",revision:"6fb613290a07ea82bcee748ae3b486f7"},{url:"icons/16.png",revision:"dbef1c084cc13e14473f3d5ace6b3274"},{url:"icons/256.png",revision:"7ca0692a57dea10290039e7c5fe0f332"},{url:"icons/32.png",revision:"9c243bd204f85882c2dbb692c673ecfc"},{url:"icons/512.png",revision:"98999605817965b7d5c0f893800dc8d8"},{url:"icons/64.png",revision:"38928296ef2ae76467dc614ee1eab515"},{url:"index.html",revision:"59840a73cba9dd17d719b24595b3f59a"},{url:"registerSW.js",revision:"900e38ab30484659070d4f775a4007aa"},{url:"manifest.webmanifest",revision:"a7df5e88717e67543fad379beb1ad148"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
