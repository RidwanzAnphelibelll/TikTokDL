#!/usr/bin/env node
export default{async fetch(e,t,n){const h=new URL(e.url);if("/"===h.pathname){const n=new Request(h.origin+"/public/index.html",{method:e.method,headers:e.headers,body:e.body});return t.ASSETS.fetch(n)}return t.ASSETS.fetch(e)}};
