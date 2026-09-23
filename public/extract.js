export function plain(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
}

function dateFrom(text) {
  const match = text.match(/\b(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{2,4})\b/);
  if (!match) return null;
  let [,dd,mm,yyyy]=match;
  if (yyyy.length===2) yyyy='20'+yyyy;
  const d = new Date(Number(yyyy),Number(mm)-1,Number(dd));
  if (d.getFullYear()!==Number(yyyy)||d.getMonth()!==Number(mm)-1||d.getDate()!==Number(dd)) return null;
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}

function timeFrom(text) {
  const matches=[...text.matchAll(/\b([01]?\d|2[0-3])\s*(?:[:hH])\s*([0-5]\d)\b/g)];
  return matches.length ? `${matches[0][1].padStart(2,'0')}:${matches[0][2]}` : null;
}

export function extract(lines) {
  const meetings = [], tasks = [];
  for (const line of lines) {
    const norm=plain(line.text);
    const date=dateFrom(line.text);
    const time=timeFrom(line.text);
    if (/\b(hop|meeting)\b/.test(norm) && date && time) meetings.push({date,time,sourceIds:[line.id]});
    if (/(mang theo|chuan bi|dem theo)/.test(norm) && /(but|so tay|tai lieu|giay|phieu)/.test(norm)) {
      const tail=line.text.replace(/^.*?(?:mang theo|chuẩn bị|chuan bi|đem theo|dem theo)\s*[:：]?\s*/i,'').replace(/[.!]+$/,'').trim();
      if (tail) tasks.push({id:`supply-${line.id}`,label:`Chuẩn bị ${tail.charAt(0).toLowerCase()+tail.slice(1)}`,date:null,sourceIds:[line.id],kind:'supply'});
    }
    if (date && /(nop|han nop|truoc ngay)/.test(norm)) {
      const what=/(phieu thong tin)/.test(norm) ? 'phiếu thông tin' : 'bài/phiếu được thông báo';
      tasks.push({id:`deadline-${line.id}`,label:`Nộp ${what}`,date,sourceIds:[line.id],kind:'deadline'});
    }
  }
  const uniqueMeetings=[];
  for (const m of meetings) {
    const found=uniqueMeetings.find(x=>x.date===m.date&&x.time===m.time);
    if (found) found.sourceIds.push(...m.sourceIds);
    else uniqueMeetings.push({...m});
  }
  // Multiple messages may repeat the same action. Keep the clearest first source, and attach subsequent citations.
  const uniqueTasks=[];
  for (const t of tasks) {
    const found=uniqueTasks.find(x=>x.kind===t.kind&&(t.kind==='deadline' ? x.date===t.date : plain(x.label)===plain(t.label)));
    if (found) found.sourceIds.push(...t.sourceIds);
    else uniqueTasks.push(t);
  }
  return {meetings:uniqueMeetings,tasks:uniqueTasks,conflict:new Set(uniqueMeetings.map(m=>m.time)).size>1};
}

export function toLines(text) {
  return text.split(/\r?\n/).map(t=>t.trim()).filter(Boolean).map((t,i)=>({id:`L${i+1}`,text:t}));
}
