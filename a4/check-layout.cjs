const {chromium}=require('C:/Users/Shoaib/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1600,height:1250},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8080/a4/'); await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'#stage{position:static;display:block;inset:auto}#frame{width:794px!important;height:1123px!important}#book{position:static;transform:none!important;width:794px!important}.toolbar,.nav,.pager{display:none}.spread{display:contents!important}.page{display:none!important}.page.qa{display:flex!important}'});
 const results=[];
 for(let i=0;i<32;i++){
  const info=await page.evaluate(i=>{document.querySelectorAll('.page').forEach((p,j)=>p.classList.toggle('qa',j===i));typeset();const p=document.querySelector('.page.qa'),c=p.querySelector('.content');return{page:i+1,title:p.dataset.title,font:c?getComputedStyle(c).fontSize:null,overflow:c?c.scrollHeight-c.clientHeight:0,words:p.innerText.split(/\s+/).length};},i);
  await page.locator('.page.qa').screenshot({path:'output/playwright/a4/page-'+String(i+1).padStart(2,'0')+'.png'});results.push(info);
 }
 console.log(JSON.stringify(results,null,2));await browser.close();
})();
