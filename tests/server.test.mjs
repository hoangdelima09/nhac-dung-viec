import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import {extract} from '../public/extract.js';

test('sample screenshot is OCRed into source lines with both disputed hours',async t=>{
  const port=43000+Math.floor(Math.random()*1000);
  const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
  t.after(()=>server.kill());
  let ready=false;
  for(let i=0;i<50;i++) {
    try {const r=await fetch(`http://127.0.0.1:${port}/`);ready=r.ok; if(ready)break;} catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.ok(ready,'server starts and serves the app');
  const image=await fs.readFile('public/sample.png');
  const response=await fetch(`http://127.0.0.1:${port}/api/ocr`,{method:'POST',body:image,headers:{'Content-Type':'image/png'}});
  assert.equal(response.status,200);
  const {lines}=await response.json();
  assert.ok(lines.some(l=>/Họp phụ huynh.*8:00.*28\/09\/2026/i.test(l.text)),JSON.stringify(lines.map(l=>l.text)));
  assert.ok(lines.some(l=>/Họp phụ huynh.*9:00.*28\/09\/2026/i.test(l.text)));
  assert.ok(lines.some(l=>/Nộp phiếu thông tin.*27\/09\/2026/i.test(l.text)));
  assert.ok(lines.every(l=>l.bbox && l.id));
  const facts=extract(lines);
  assert.equal(facts.conflict,true);
  assert.deepEqual(facts.meetings.map(x=>x.time),['08:00','09:00']);
  assert.equal(facts.tasks.length,2);
});
