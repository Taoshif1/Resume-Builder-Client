import test from 'node:test';
import assert from 'node:assert/strict';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {renderPdf} from './pdf.js';
import {documentFixture} from './fixtures/document.js';
import {DESIGN_PRESETS} from '../src/product/document-styles.js';
for(const fontFamily of ['sans','serif','mono'])for(const [preset,design]of Object.entries(DESIGN_PRESETS)){
 test(`Unicode PDF ${fontFamily}/${preset}: text, links, all pages and bounds`,async()=>{
 const w=documentFixture({long:true,design:{...design,fontFamily},fontSize:design.fontSize});w.profile.personalInfo.fullName='José Łukasz – Мария';
 const bytes=await renderPdf(w,w.resumeVariants[0].id);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');const task=getDocument({data:new Uint8Array(bytes)});const pdf=await task.promise;
 try{let text='';assert.ok(pdf.numPages>=5);for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n);const items=(await page.getTextContent()).items.filter(i=>i.str.trim());assert.ok(items.length);for(const i of items){text+=i.str;assert.ok(i.transform[4]>=design.pageMargin-1&&i.transform[4]+i.width<=page.view[2]-design.pageMargin+1,`Horizontal bounds: ${i.str}`);assert.ok(i.transform[5]>=design.pageMargin-1&&i.transform[5]<=page.view[3]-design.pageMargin+1,`Vertical bounds: ${i.str}`)}}
 assert.ok(text.replaceAll(/\s/g,'').includes('JoséŁukasz–Мария'));assert.ok(text.replaceAll(/\s/g,'').includes('CommunityPlatform17'));}finally{await task.destroy()}
 });
}
