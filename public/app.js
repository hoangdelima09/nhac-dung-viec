import {extract,toLines} from './extract.js';
import {makeCalendar} from './calendar.js';

const $ = id => document.getElementById(id);
const el={input:$('imageInput'),sample:$('sampleButton'),preview:$('preview'),empty:$('emptyIllustration'),highlight:$('imageHighlight'),frame:$('imageFrame'),transcript:$('transcript'),reanalyze:$('reanalyze'),results:$('results'),status:$('status')};
let state={lines:[],facts:null,selected:null,done:new Set(),imageUrl:null,imageWidth:0,imageHeight:0};
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=s=>s ? s.split('-').reverse().join('/') : '';
const keyOf=m=>`${m.date}|${m.time}`;

function status(text,kind='ok') {el.status.className=`status ${kind}`;el.status.innerHTML=`<span class="status-icon">${kind==='warn'?'!':kind==='error'?'×':'✦'}</span><span>${safe(text)}</span>`;}
function lineById(id){return state.lines.find(l=>l.id===id);}
function sources(ids){return ids.map(id=>{const line=lineById(id);return line ? `<div class="source">“${safe(line.text)}”<br><button type="button" class="show-source" data-source="${safe(id)}">Xem nguồn ${safe(id)} ↗</button></div>`:''}).join('');}

function storageKey(){return 'ndv-'+state.lines.map(x=>x.text).join('|').split('').reduce((h,c)=>((h<<5)-h+c.charCodeAt(0))|0,0);}
function persist(){try{localStorage.setItem(storageKey(),JSON.stringify({selected:state.selected,done:[...state.done]}));}catch{}}
function restore(){state.selected=null;state.done=new Set();try{const saved=JSON.parse(localStorage.getItem(storageKey())||'{}');state.selected=saved.selected||null;state.done=new Set(saved.done||[]);}catch{}}

function analyze(lines) {
  state.lines=lines; state.facts=extract(lines); restore();
  if (!state.facts.meetings.some(m=>keyOf(m)===state.selected)) state.selected=null;
  if (!state.facts.conflict && state.facts.meetings.length===1) state.selected=keyOf(state.facts.meetings[0]);
  render();
}

function render(){
  const {meetings,tasks,conflict}=state.facts;
  const selected=meetings.find(m=>keyOf(m)===state.selected);
  const warning=conflict&&!selected;
  status(warning?'Phát hiện giờ họp mâu thuẫn. Cần bạn xác nhận trước khi tạo lịch.':meetings.length?'Đã đọc xong. Kiểm tra câu nguồn và hoàn tất danh sách việc.':'Chưa tìm thấy ngày giờ họp rõ ràng; hãy sửa văn bản OCR hoặc dùng ảnh khác.',warning?'warn':meetings.length?'ok':'error');
  const meetingBody=meetings.length ? `${conflict?'<p class="explain">Hai thông báo ghi giờ khác nhau cho cùng ngày họp. Ứng dụng không tự quyết định thay bạn.</p>':''}${meetings.map((m,i)=>`<label class="candidate ${selected===m?'chosen':''}"><span class="candidate-top"><input type="radio" name="meeting" value="${safe(keyOf(m))}" ${selected===m?'checked':''}><strong>${safe(m.time)}</strong><span class="date">${dateLabel(m.date)}</span></span>${sources(m.sourceIds)}</label>`).join('')}`:'<p class="empty-result">Chưa thấy một dòng có đủ chữ “họp”, ngày và giờ. Hãy xem lại ảnh hoặc sửa văn bản OCR.</p>';
  const taskBody=tasks.length ? tasks.map(t=>`<div class="task ${state.done.has(t.id)?'done':''}"><input type="checkbox" id="${safe(t.id)}" data-task="${safe(t.id)}" ${state.done.has(t.id)?'checked':''}><div class="task-body"><label for="${safe(t.id)}"><strong>${safe(t.label)}</strong></label>${t.date?`<small>Hạn: ${dateLabel(t.date)}</small>`:''}${sources(t.sourceIds)}</div></div>`).join('') : '<p class="empty-result">Chưa tìm thấy vật dụng hoặc hạn nộp. Có thể sửa văn bản rồi phân tích lại.</p>';
  el.results.innerHTML=`<article class="card"><div class="card-head"><h3>Giờ họp phụ huynh</h3><span class="badge ${conflict?'conflict':''}">${conflict?'CẦN XÁC NHẬN':meetings.length?'ĐÃ ĐỌC':'CHƯA RÕ'}</span></div>${meetingBody}</article><article class="card"><div class="card-head"><h3>Việc cần làm</h3><span class="badge">${tasks.length} VIỆC</span></div>${taskBody}</article><article class="card calendar-card"><div class="card-head"><h3>Lịch nhắc của bạn</h3><span class="badge">.ICS</span></div><p>${warning?'Chọn đúng giờ họp sau khi xác minh với giáo viên. Lịch chỉ được tạo khi bạn xác nhận.':selected?'Sẵn sàng tải lịch họp đã chọn và hạn nộp để thêm vào ứng dụng lịch.':'Cần một giờ họp hợp lệ trước khi xuất lịch.'}</p><button type="button" id="downloadCalendar" class="button primary" ${selected?'':'disabled'}>↓ Tải lịch nhắc đã xác nhận</button><p class="subtle">Tệp lịch có nhắc trước giờ họp 1 giờ và trước hạn nộp 1 ngày.</p></article>`;
  el.results.querySelectorAll('input[name="meeting"]').forEach(input=>input.addEventListener('change',()=>{state.selected=input.value;persist();render()}));
  el.results.querySelectorAll('[data-task]').forEach(input=>input.addEventListener('change',()=>{input.checked?state.done.add(input.dataset.task):state.done.delete(input.dataset.task);persist();render()}));
  el.results.querySelectorAll('.show-source').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();highlight(button.dataset.source)}));
  $('downloadCalendar').addEventListener('click',()=>{
    const chosen=state.facts.meetings.find(m=>keyOf(m)===state.selected);
    if (!chosen) return;
    const deadline=state.facts.tasks.find(t=>t.kind==='deadline');
    const file=new Blob([makeCalendar(chosen,deadline)],{type:'text/calendar;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download='nhac-dung-viec.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
}

function highlight(id){
  const line=lineById(id);
  if (!line?.bbox || !state.imageWidth || !state.imageHeight) {
    const needle=line?.text||'';const start=el.transcript.value.indexOf(needle);
    if(start>=0){el.transcript.focus();el.transcript.setSelectionRange(start,start+needle.length)}
    return;
  }
  const image=el.preview;const rect=image.getBoundingClientRect(),frame=el.frame.getBoundingClientRect();
  const scale=Math.min(rect.width/state.imageWidth,rect.height/state.imageHeight);
  const drawnW=state.imageWidth*scale,drawnH=state.imageHeight*scale;
  Object.assign(el.highlight.style,{left:`${rect.left-frame.left+(rect.width-drawnW)/2+line.bbox.left*scale}px`,top:`${rect.top-frame.top+(rect.height-drawnH)/2+line.bbox.top*scale}px`,width:`${line.bbox.width*scale}px`,height:`${line.bbox.height*scale}px`});
  el.highlight.hidden=false;el.frame.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(()=>{el.highlight.hidden=true},3800);
}

async function processImage(file){
  if(file.size>8*1024*1024){status('Ảnh quá 8 MB; hãy chọn ảnh nhỏ hơn.','error');return}
  if(state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.imageUrl=URL.createObjectURL(file);el.preview.src=state.imageUrl;el.preview.hidden=false;el.empty.hidden=true;el.highlight.hidden=true;
  el.preview.onload=()=>{state.imageWidth=el.preview.naturalWidth;state.imageHeight=el.preview.naturalHeight};
  el.transcript.value='';el.transcript.disabled=true;el.reanalyze.disabled=true;
  el.results.innerHTML='<div class="idle-card"><span class="idle-num">ĐANG NHẬN DẠNG</span><strong>Đọc từng dòng thông báo…</strong><p>Với ảnh lớn, bước này có thể mất một chút thời gian.</p></div>';
  status('Đang đọc chữ trong ảnh bằng OCR trên máy này…');
  try{
    const response=await fetch('/api/ocr',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'OCR thất bại.');
    el.transcript.value=data.lines.map(l=>l.text).join('\n');el.transcript.disabled=false;el.reanalyze.disabled=false;
    analyze(data.lines);
  }catch(err){status(err.message,'error');el.results.innerHTML='<div class="idle-card"><strong>Chưa đọc được ảnh</strong><p>Kiểm tra Tesseract hoặc thử ảnh khác.</p></div>'}
}

el.input.addEventListener('change',()=>{if(el.input.files[0])processImage(el.input.files[0])});
el.sample.addEventListener('click',async()=>{const data=await fetch('/sample.png');processImage(new File([await data.blob()],'mau-thong-bao.png',{type:'image/png'}))});
el.reanalyze.addEventListener('click',()=>{const edited=toLines(el.transcript.value);analyze(edited)});
