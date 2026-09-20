// Isolated local browser audit. Never loads real Firebase credentials.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from '../.artifacts/browser-tools/node_modules/playwright-core/index.mjs';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {documentFixture} from '../server/fixtures/document.js';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
const base='http://127.0.0.1:5173';
const health=await (await fetch('http://127.0.0.1:3000/api/health')).json();
assert.equal(health.firebase?.emulator,true,'Requires isolated demo API');
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8080';
const app=initializeApp({projectId:'demo-personacv'},'browser-audit');const db=getFirestore(app);
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();page.setDefaultTimeout(15000);
const report={journeys:[],responsive:[],accessibility:[],errors:[],print:[]};
const out='.artifacts/final-browser';mkdirSync(out,{recursive:true});
page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());
const record=name=>{report.journeys.push(name);console.log('PASS:',name)};
async function ready(path){await page.goto(base+path);await page.locator('main h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);}
async function api(path,method='GET',body){return page.evaluate(async({path,method,body})=>{const {auth}=await import('/src/services/firebase.js');const r=await fetch('/api/'+path,{method,headers:{Authorization:'Bearer '+await auth.currentUser.getIdToken(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(r.status+': '+JSON.stringify(data));return data},{path,method,body});}
async function save(){const button=page.locator('.pcv-editor').isVisible();await (await button ? page.getByRole('button',{name:'Save',exact:true}) : page.getByRole('button',{name:'Save workspace',exact:true})).click();await page.waitForFunction(()=>document.querySelector('.pcv-savebar button')?.disabled);}
const axe=readFileSync('.artifacts/browser-tools/node_modules/axe-core/axe.min.js','utf8');
try{
 await ready('/');await page.getByRole('link',{name:/get started/i}).first().click();await page.waitForURL('**/get-started/**');
 await ready('/get-started/register');
 assert.equal(await page.evaluate(async()=>{const {auth}=await import('/src/services/firebase.js');return auth.app.options.projectId}),'demo-personacv');
 const email=`final-${Date.now()}@example.test`,password='AuditTest2026!';
 await page.getByLabel('Full name',{exact:true}).fill('Audit Developer');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password',{exact:true}).fill(password);await page.locator('input[type=checkbox]').last().check();
 await page.locator('button[type=submit]').count().then(async n=>{if(n)await page.locator('button[type=submit]').click();else await page.getByRole('button',{name:/create account/i}).click()});
 await page.waitForURL('**/dashboard');await page.locator('.pcv-savebar').waitFor();record('Home / get started / register / Free dashboard');
 await ready('/dashboard/profile');await page.getByLabel('Full Name',{exact:true}).fill('José Łukasz – Мария');
 for(const collection of ['experience','education','skills','links','certifications','achievements','languages','volunteering','customSections']){
  const section=page.locator('#'+collection);if(!await section.evaluate(e=>e.open))await section.locator(':scope > summary').click();
  await section.getByRole('button',{name:/^Add /}).click();const field=section.locator('.pcv-record input').first();await field.fill('Audit '+collection);assert.equal(await section.locator('.pcv-record details').evaluate(e=>e.open),true,'Disclosure stays open');
 }
 await save();await page.reload();await page.getByLabel('Full Name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Full Name',{exact:true}).inputValue(),'José Łukasz – Мария');record('All profile collections add/edit; disclosure stability; save/reload');
 await ready('/dashboard/projects');await page.getByRole('button',{name:'Add project',exact:true}).click();await page.getByLabel('Project name',{exact:true}).first().fill('Audit project');await save();await page.reload();await page.getByRole('heading',{name:'Audit project',exact:true}).waitFor();record('Manual project create/edit/save/reload');
 await page.route('**/api/workspace',async route=>{if(route.request().method()==='PUT')await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Audit temporary outage'})});else await route.continue()});
 await ready('/dashboard/profile');await page.getByLabel('Full Name',{exact:true}).fill('Retry preserved');await page.getByRole('button',{name:'Save workspace',exact:true}).click();await page.getByRole('alert').filter({hasText:'Audit temporary outage'}).waitFor();assert.equal(await page.getByLabel('Full Name',{exact:true}).inputValue(),'Retry preserved');await page.unroute('**/api/workspace');await save();record('503 save retains local edits and retry succeeds');
 const current=await api('workspace');const uid=current.workspace.ownerUid;
 await db.collection('users').doc(uid).update({role:'owner',plan:'pro'});
 const fixture=documentFixture({design:{fontFamily:'sans'}});fixture.ownerUid=uid;await api('workspace','PUT',{workspace:fixture,revision:current.revision});
 await page.evaluate(()=>localStorage.clear());const editor='/resume/'+fixture.resumeVariants[0].id;
 await ready(editor);
 const directName=page.locator('.pcv-paper h1[contenteditable=true]');await directName.fill('Direct Edit Name');await directName.press('Tab');assert.equal(await directName.textContent(),'Direct Edit Name');
 await page.getByRole('button',{name:'Undo document change'}).click();assert.equal(await page.locator('.pcv-paper h1').textContent(),'Alex Morgan');
 await page.getByRole('button',{name:'Redo document change'}).click();assert.equal(await page.locator('.pcv-paper h1').textContent(),'Direct Edit Name');
 const directSummary=page.locator('.pcv-document-summary .pcv-paper-text[contenteditable=true]');await directSummary.fill('Directly edited structured summary.');await directSummary.press('Tab');await page.waitForFunction(()=>document.querySelector('.pcv-editor-save-state')?.textContent.trim()==='Saved');await page.reload();assert.equal(await page.locator('.pcv-paper h1').textContent(),'Direct Edit Name');assert.equal(await page.locator('.pcv-document-summary .pcv-paper-text').textContent(),'Directly edited structured summary.');record('Direct document edits, undo, redo, autosave and reload persistence');
 await page.getByRole('button',{name:'Design',exact:true}).click();await page.getByRole('combobox',{name:/^Paper size/}).selectOption('LEGAL');await page.getByRole('combobox',{name:/^Font/}).selectOption('serif');await page.getByLabel('Text size in points',{exact:true}).fill('12');await save();await page.reload();await page.getByRole('button',{name:'Design',exact:true}).click();assert.equal(await page.getByRole('combobox',{name:/^Paper size/}).inputValue(),'LEGAL');assert.equal(await page.getByRole('combobox',{name:/^Font/}).inputValue(),'serif');record('Document Studio paper/font/text size save/reload');
 for(const paper of ['A4','LETTER','LEGAL']){
  await page.getByRole('combobox',{name:/^Paper size/}).selectOption(paper);await page.evaluate(()=>document.fonts.ready);const bytes=await page.pdf({preferCSSPageSize:true,printBackground:true});const task=getDocument({data:new Uint8Array(bytes)});const pdf=await task.promise;const first=await pdf.getPage(1);const expected={A4:[595.28,841.89],LETTER:[612,792],LEGAL:[612,1008]}[paper];assert.ok(Math.abs(first.view[2]-expected[0])<2&&Math.abs(first.view[3]-expected[1])<2,'Print paper dimensions');let text='';for(let p=1;p<=pdf.numPages;p++)text+=(await(await pdf.getPage(p)).getTextContent()).items.map(i=>i.str).join(' ');assert.ok(text.includes('Direct Edit Name'));assert.ok(!text.includes('Save workspace'));report.print.push({paper,pages:pdf.numPages});await task.destroy();writeFileSync(`${out}/print-${paper}.pdf`,bytes);
 }
 record('Browser print A4/Letter/Legal real PDF dimensions and document-only text');
 await save();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF',exact:true}).click();const download=await downloadPromise;await download.saveAs(`${out}/server-export.pdf`);assert.equal(readFileSync(`${out}/server-export.pdf`).subarray(0,5).toString(),'%PDF-');record('Authenticated browser PDF download signature');
 for(let i=0;i<4;i++)await page.getByRole('button',{name:'Zoom out',exact:true}).click();
 for(let zoom=60;zoom<=140;zoom+=10){assert.ok((await page.locator('.pcv-document-toolbar').innerText()).includes(zoom+'%'));const bounds=await page.locator('.pcv-paper').evaluate(e=>({width:e.getBoundingClientRect().width,scroll:e.parentElement.scrollWidth}));assert.ok(bounds.width<=bounds.scroll+2);if(zoom<140)await page.getByRole('button',{name:'Zoom in',exact:true}).click()}
 record('Preview zoom 60 through 140 in 10 percent steps');await page.getByRole('button',{name:'100%',exact:true}).click();
 const routes=['/','/features','/pricing','/contact','/privacy-policy','/terms-of-service','/get-started','/dashboard','/dashboard/profile','/dashboard/projects','/dashboard/resumes','/dashboard/settings',editor,'/admin','/404'];
 for(const [width,height]of [[360,800],[390,844],[768,1024],[1024,768],[1280,800],[1366,900],[1440,1000],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const route of routes){await ready(route);if(route===editor&&width<=900)await page.getByRole('button',{name:'Preview',exact:true}).click();
   const metrics=await page.evaluate(()=>({body:document.body.scrollWidth,root:document.documentElement.scrollWidth,viewport:innerWidth,main:[...document.querySelectorAll('main')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth}))}));report.responsive.push({width,height,route,...metrics,pass:metrics.root<=width+1&&metrics.body<=width+1&&metrics.main.every(e=>e.scroll<=e.width+1)});
   if([360,768,1440].includes(width)){
    await page.addScriptTag({content:axe});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));report.accessibility.push({width,route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    if([360,1440].includes(width))await page.screenshot({path:`${out}/${route==='/'?'home':route.replaceAll('/','_')}-${width}.png`,fullPage:true});
   }
  }
  console.log('VIEWPORT',width,'complete');
 }
 await page.setViewportSize({width:390,height:844});await ready('/dashboard');await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('link',{name:'Master Profile',exact:true}).focus();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded'),'false');record('Mobile navigation Escape closes and returns focus');
 await page.emulateMedia({reducedMotion:'reduce'});await ready(editor);await page.getByRole('button',{name:'Preview',exact:true}).click();assert.ok(parseFloat(await page.locator('.pcv-paper').evaluate(e=>getComputedStyle(e).transitionDuration))<=0.001);record('Reduced motion preview');
 await page.setViewportSize({width:1440,height:1000});await ready('/dashboard');await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/get-started');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/dashboard');record('Logout/login persistence');
}catch(e){report.failure=e.stack;console.error(e.message);process.exitCode=1;await page.screenshot({path:`${out}/failure.png`,fullPage:true}).catch(()=>{});}
finally{writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();await db.terminate();await deleteApp(app);console.log(JSON.stringify({journeys:report.journeys.length,responsive:report.responsive.length,overflow:report.responsive.filter(r=>!r.pass).length,a11y:report.accessibility.filter(r=>r.violations.length).length,errors:report.errors}));}
